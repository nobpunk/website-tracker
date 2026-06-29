"use client";

import React from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { useMarketData } from "@/hooks/useMarketData";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize the global real-time Binance WebSocket price feed
  useMarketData();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground select-none">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar with page-specific title and live ticker */}
        <TopBar title="Terminal Dashboard" />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-background/50">
          {children}
        </main>
      </div>
    </div>
  );
}
