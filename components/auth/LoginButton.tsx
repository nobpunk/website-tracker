"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { TwitterLogo, UserCircle, ShieldCheck } from "@phosphor-icons/react";

interface LoginButtonProps {
  isMockMode: boolean;
}

export function LoginButton({ isMockMode }: LoginButtonProps) {
  const [username, setUsername] = useState("trader_one");
  const [loading, setLoading] = useState(false);

  const handleTwitterLogin = async () => {
    setLoading(true);
    try {
      await signIn("twitter", { callbackUrl: "/" });
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const handleMockLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    setLoading(true);
    try {
      await signIn("credentials", {
        username: username.trim(),
        callbackUrl: "/",
      });
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  if (isMockMode) {
    return (
      <div className="w-full space-y-4">
        {/* Mock Dev Alert */}
        <div className="flex gap-2 p-3 border border-yellow-500/20 bg-yellow-500/5 text-[11px] text-yellow-500">
          <ShieldCheck size={16} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-bold mb-0.5">Developer Sandbox Mode</p>
            <p>Twitter API keys are not configured. Logging in will bypass OAuth and create a local session.</p>
          </div>
        </div>

        {/* Mock Login Form */}
        <form onSubmit={handleMockLogin} className="space-y-3">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-muted-custom font-semibold mb-1">
              Twitter Username (Mock)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-custom">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                placeholder="username"
                className="w-full bg-background border border-border-custom px-7 py-2 text-xs font-mono text-foreground focus:outline-none focus:border-accent-custom"
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full py-2 bg-accent-custom hover:bg-accent-custom/90 text-background text-xs font-bold rounded-sm transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <UserCircle size={16} weight="bold" />
            {loading ? "Authenticating..." : "Login as Mock Trader"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <button
      onClick={handleTwitterLogin}
      disabled={loading}
      className="flex items-center justify-center gap-2 w-full py-2.5 bg-white hover:bg-zinc-100 text-black text-xs font-bold rounded-sm transition-all active:scale-[0.98] disabled:opacity-50"
    >
      <TwitterLogo size={16} weight="fill" />
      {loading ? "Connecting to X..." : "Sign In with X Account"}
    </button>
  );
}
