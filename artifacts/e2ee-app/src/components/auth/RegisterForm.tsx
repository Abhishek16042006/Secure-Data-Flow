import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRegister } from "@workspace/api-client-react";
import { useSession } from "@/lib/session";
import { generateKeyPair, encryptPrivateKey } from "@/lib/crypto";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const schema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

export function RegisterForm() {
  const registerMutation = useRegister();
  const { login } = useSession();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      setIsGenerating(true);
      
      const { publicKeySpki, privateKeyPkcs8 } = await generateKeyPair();
      const encrypted = await encryptPrivateKey(privateKeyPkcs8, values.password);

      const response = await registerMutation.mutateAsync({
        data: {
          username: values.username,
          password: values.password,
          publicKeySpki,
          encryptedPrivateKey: encrypted.encryptedPrivateKey,
          salt: encrypted.salt,
          iv: encrypted.iv,
        }
      });

      login(response, privateKeyPkcs8);
      toast({ title: "Registration successful", description: "Keys generated and secured." });
      setLocation("/dashboard");
    } catch (err: any) {
      toast({ title: "Registration failed", description: err.message || "Could not register.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl><Input placeholder="At least 3 characters" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl><Input type="password" placeholder="At least 6 characters" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isGenerating || registerMutation.isPending}>
          {isGenerating || registerMutation.isPending ? "Generating keys..." : "Register"}
        </Button>
      </form>
    </Form>
  );
}
