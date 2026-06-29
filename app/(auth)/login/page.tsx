import React from "react";
import { LoginButton } from "@/components/auth/LoginButton";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { TerminalWindow, Broadcast } from "@phosphor-icons/react/dist/ssr";

export default function LoginPage() {
  const isMockMode = 
    !process.env.TWITTER_CLIENT_ID || 
    process.env.TWITTER_CLIENT_ID === "mock_twitter_client_id" || 
    !process.env.TWITTER_CLIENT_SECRET || 
    process.env.TWITTER_CLIENT_SECRET === "mock_twitter_client_secret";

  return (
    <div className="flex flex-col min-h-screen bg-background items-center justify-center p-4 relative select-none">
      {/* Subtle grid background effect */}
      <div className="absolute inset-0 bg-[radial-gradient(#22242a_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-sm border border-border-custom bg-surface p-6 space-y-6 relative z-10">
        {/* Branding Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="h-10 w-10 bg-border-custom flex items-center justify-center rounded-sm border border-accent-custom/20">
            <TerminalWindow size={24} className="text-accent-custom" weight="bold" />
          </div>
          <h1 className="text-sm font-bold uppercase tracking-widest text-foreground">
            Market Co-Pilot
          </h1>
          <p className="text-[10px] text-muted-custom uppercase tracking-wider font-semibold flex items-center gap-1.5 justify-center">
            <Broadcast size={12} className="text-accent-custom animate-pulse" />
            Real-Time Intelligence Terminal
          </p>
        </div>

        {/* Feature List (Terminal Style) */}
        <div className="border border-border-custom/50 bg-background/40 p-3.5 space-y-2.5 text-[11px] font-mono text-muted-custom">
          <div className="flex items-center gap-2">
            <span className="text-accent-custom font-bold">&gt;</span>
            <span>Real-time Binance Spot Ticker Tape</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-accent-custom font-bold">&gt;</span>
            <span>Interactive TradingView Candles</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-accent-custom font-bold">&gt;</span>
            <span>Automated AI Technical Analysis</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-accent-custom font-bold">&gt;</span>
            <span>Custom Watchlist & Signal Warnings</span>
          </div>
        </div>

        {/* Login Button Area */}
        <div className="pt-2">
          <LoginButton isMockMode={isMockMode} />
        </div>

        {/* Footer Disclaimer */}
        <div className="pt-4 border-t border-border-custom/40">
          <Disclaimer />
        </div>
      </div>
    </div>
  );
}
