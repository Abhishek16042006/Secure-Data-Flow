import React, { useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Lock, ArrowRight, Server, Smartphone, ShieldCheck, Zap, Eye, Key } from "lucide-react";
import { Link } from "wouter";

export default function Landing() {
  const [isLogin, setIsLogin] = useState(false);

  return (
    <div className="min-h-[100dvh] flex flex-col text-foreground" style={{background: 'linear-gradient(160deg, #fff0f7 0%, #ffffff 55%, #fff5fa 100%)'}}>

      {/* Decorative gradient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none select-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20"
          style={{background: 'radial-gradient(circle, #e91e8c 0%, transparent 70%)'}} />
        <div className="absolute top-1/3 -right-24 w-80 h-80 rounded-full opacity-15"
          style={{background: 'radial-gradient(circle, #f06292 0%, transparent 70%)'}} />
        <div className="absolute -bottom-16 left-1/3 w-72 h-72 rounded-full opacity-10"
          style={{background: 'radial-gradient(circle, #e91e8c 0%, transparent 70%)'}} />
      </div>

      <header className="relative z-10 px-6 py-4 flex justify-between items-center border-b border-pink-100 bg-white/70 backdrop-blur-md">
        <div className="flex items-center gap-2 font-bold text-xl" style={{background: 'linear-gradient(135deg, #e91e8c, #c2185b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
          <Lock className="w-5 h-5 text-pink-500" />
          <span>E2EE</span>
        </div>
        <Link href="/learn" className="text-muted-foreground hover:text-pink-500 transition-colors flex items-center gap-1.5 text-sm font-medium">
          Architecture <ArrowRight className="w-4 h-4" />
        </Link>
      </header>

      <main className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center px-6 py-10 gap-14 max-w-6xl mx-auto w-full">

        {/* Left: hero text + diagram */}
        <div className="flex-1 space-y-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border border-pink-200 bg-pink-50 text-pink-600 mb-2">
              <Zap className="w-3 h-3" />
              Zero-knowledge · ECDH P-256 · AES-256-GCM
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-foreground">
              Trust no one.<br/>
              <span style={{background: 'linear-gradient(135deg, #e91e8c 0%, #f06292 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                Not even us.
              </span>
            </h1>
            <p className="text-base text-muted-foreground max-w-md leading-relaxed">
              End-to-end encrypted messaging where your keys never leave your device.
              The server only sees ciphertext.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2">
            {[
              { icon: Key, text: "Keys generated in your browser" },
              { icon: Eye, text: "Server sees only ciphertext" },
              { icon: Lock, text: "AES-256-GCM per message" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-white border border-pink-100 text-muted-foreground shadow-sm">
                <Icon className="w-3 h-3 text-pink-500" />
                {text}
              </div>
            ))}
          </div>

          {/* E2EE diagram */}
          <div className="glass-card p-5 rounded-2xl space-y-4 text-sm max-w-md">
            <div className="flex items-center justify-between text-muted-foreground">
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-pink-50 border border-pink-100 flex items-center justify-center shadow-sm">
                  <Smartphone className="w-5 h-5 text-pink-500" />
                </div>
                <span className="text-xs font-medium">Browser</span>
              </div>

              <div className="flex-1 flex flex-col items-center gap-2 px-4">
                <div className="text-xs text-pink-500 font-semibold animate-pulse">Encrypting locally…</div>
                <div className="w-full h-0.5 rounded-full relative overflow-hidden" style={{background: 'linear-gradient(90deg, #e91e8c, #f06292)'}}>
                  <div className="absolute inset-0 animate-pulse" style={{background: 'linear-gradient(90deg, transparent, white, transparent)'}} />
                </div>
                <Lock className="w-4 h-4 text-pink-500" />
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center shadow-sm">
                  <Server className="w-5 h-5 text-gray-400" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">Server</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <code className="text-xs text-muted-foreground font-mono">
                <span className="text-pink-500 font-semibold">POST</span> /api/messages<br/>
                &#123;<br/>
                &nbsp;&nbsp;"ciphertext": "U2FsdGVkX19..." <span className="text-gray-400">{"// server can't read this"}</span><br/>
                &#125;
              </code>
            </div>
          </div>
        </div>

        {/* Right: auth card */}
        <div className="w-full max-w-md glass-card rounded-2xl p-8 shadow-xl">
          <div className="flex rounded-xl overflow-hidden border border-pink-100 mb-6 bg-pink-50/50">
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 text-sm font-semibold transition-all ${!isLogin ? "rounded-xl text-white shadow-md" : "text-muted-foreground hover:text-foreground"}`}
              style={!isLogin ? {background: 'linear-gradient(135deg, #e91e8c, #c2185b)', boxShadow: '0 4px 12px rgba(233,30,140,0.3)'} : {}}
            >
              Register
            </button>
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 text-sm font-semibold transition-all ${isLogin ? "rounded-xl text-white shadow-md" : "text-muted-foreground hover:text-foreground"}`}
              style={isLogin ? {background: 'linear-gradient(135deg, #e91e8c, #c2185b)', boxShadow: '0 4px 12px rgba(233,30,140,0.3)'} : {}}
            >
              Login
            </button>
          </div>

          <div className="mb-5">
            <h2 className="text-xl font-bold text-foreground">
              {isLogin ? "Welcome back" : "Create your keys"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isLogin
                ? "Log in with your username and password."
                : "Register to generate your personal encryption keys."}
            </p>
          </div>

          {isLogin ? <LoginForm /> : <RegisterForm />}

          <div className="mt-5 flex items-start gap-3 text-xs text-muted-foreground bg-pink-50 p-3 rounded-xl border border-pink-100">
            <ShieldCheck className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" />
            <p>
              Your private key is encrypted with your password (AES-GCM) before storage.
              Lose your password and your messages are gone — by design.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
