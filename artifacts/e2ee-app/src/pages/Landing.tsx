import React, { useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Lock, ArrowRight, Server, Smartphone, ShieldCheck } from "lucide-react";
import { Link } from "wouter";

export default function Landing() {
  const [isLogin, setIsLogin] = useState(false);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground font-mono">
      <header className="p-6 flex justify-between items-center border-b border-border">
        <div className="flex items-center gap-2 font-bold text-xl text-primary">
          <Lock className="w-6 h-6" />
          <span>CipherChat</span>
        </div>
        <Link href="/learn" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
          Architecture <ArrowRight className="w-4 h-4" />
        </Link>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center p-6 gap-12 max-w-6xl mx-auto w-full">
        <div className="flex-1 space-y-8">
          <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
            Trust no one.<br/>
            <span className="text-primary">Not even us.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-md">
            End-to-end encrypted messaging where your keys never leave your device. 
            The server only sees ciphertext. A locked vault for your conversations.
          </p>

          <div className="p-6 bg-card border border-card-border rounded-lg space-y-6 font-mono text-sm shadow-xl">
            <div className="flex items-center justify-between text-muted-foreground">
              <div className="flex flex-col items-center gap-2">
                <Smartphone className="w-8 h-8 text-white" />
                <span>Browser</span>
              </div>
              
              <div className="flex-1 flex flex-col items-center gap-2 px-4 relative">
                <div className="text-xs text-primary animate-pulse absolute -top-4">Encrypting locally...</div>
                <div className="w-full h-px bg-border relative">
                  <div className="absolute inset-y-0 left-0 w-1/2 bg-primary/50" />
                </div>
                <Lock className="w-5 h-5 text-primary" />
              </div>

              <div className="flex flex-col items-center gap-2">
                <Server className="w-8 h-8 text-muted-foreground" />
                <span>Server</span>
              </div>
            </div>
            
            <div className="bg-background p-3 rounded border border-border overflow-x-auto">
              <code className="text-xs text-muted-foreground">
                <span className="text-primary">POST</span> /api/messages<br/>
                &#123;<br/>
                &nbsp;&nbsp;"ciphertext": "U2FsdGVkX19..." <span className="text-gray-500">{"// Server cannot read this"}</span><br/>
                &#125;
              </code>
            </div>
          </div>
        </div>

        <div className="w-full max-w-md bg-card border border-card-border p-8 rounded-lg shadow-2xl">
          <div className="mb-6">
            <div className="flex border border-border mb-6">
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2.5 text-sm font-bold transition-colors ${!isLogin ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                Register
              </button>
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2.5 text-sm font-bold transition-colors ${isLogin ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                Login
              </button>
            </div>
            <h2 className="text-xl font-bold text-white">
              {isLogin ? "Access your vault" : "Create your keys"}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {isLogin
                ? "Log in with your username and password."
                : "First time here? Register to generate your encryption keys."}
            </p>
          </div>

          {isLogin ? <LoginForm /> : <RegisterForm />}

          <div className="mt-6 flex items-start gap-3 text-xs text-muted-foreground bg-background p-3 border border-border rounded">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p>
              Your private key is encrypted with your password using AES-GCM before being stored. 
              If you lose your password, your messages cannot be recovered.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
