import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLogin } from "@workspace/api-client-react";
import { useSession } from "@/lib/session";
import { decryptPrivateKey } from "@/lib/crypto";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const schema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

export function LoginForm() {
  const loginMutation = useLogin();
  const { login } = useSession();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      const response = await loginMutation.mutateAsync({ data: values });
      
      const privateKeyBytes = await decryptPrivateKey(
        response.encryptedPrivateKey,
        values.password,
        response.salt,
        response.iv
      );

      login(response, privateKeyBytes);
      toast({ title: "Login successful", description: "Keys decrypted in memory." });
      setLocation("/dashboard");
    } catch (err: any) {
      toast({ title: "Login failed", description: err.message || "Invalid credentials or decryption failed.", variant: "destructive" });
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
        <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? "Decrypting..." : "Login"}
        </Button>
      </form>
    </Form>
  );
}
