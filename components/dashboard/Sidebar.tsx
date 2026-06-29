"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { 
  ChartLineUp, 
  Star, 
  Brain, 
  SignOut, 
  User as UserIcon,
  TerminalWindow
} from "@phosphor-icons/react";

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const menuItems = [
    { name: "Market", href: "/", icon: ChartLineUp },
    { name: "Watchlist", href: "/watchlist", icon: Star },
    { name: "AI Analysis", href: "/ai-analysis", icon: Brain },
  ];

  return (
    <aside className="w-60 border-r border-border-custom bg-surface flex flex-col h-screen shrink-0">
      {/* Brand Header */}
      <div className="h-16 border-b border-border-custom flex items-center px-6 gap-2 shrink-0">
        <TerminalWindow size={24} className="text-accent-custom" weight="bold" />
        <span className="font-bold tracking-tight text-sm uppercase">Market Co-Pilot</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-sm transition-colors ${
                isActive
                  ? "bg-border-custom text-foreground"
                  : "text-muted-custom hover:bg-border-custom/50 hover:text-foreground"
              }`}
            >
              <Icon size={18} weight={isActive ? "bold" : "regular"} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      {session?.user && (
        <div className="p-4 border-t border-border-custom flex flex-col gap-3 shrink-0">
          <div className="flex items-center gap-3">
            {session.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.image}
                alt={session.user.name || "User"}
                className="h-8 w-8 rounded-full border border-border-custom shrink-0"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-border-custom flex items-center justify-center shrink-0">
                <UserIcon size={16} className="text-muted-custom" />
              </div>
            )}
            <div className="overflow-hidden">
              <p className="text-xs font-semibold truncate text-foreground/90">
                {session.user.name}
              </p>
              <p className="text-[10px] text-muted-custom truncate">
                {session.user.email}
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center justify-center gap-2 w-full py-2 border border-border-custom hover:bg-red-500/10 hover:text-bearish text-muted-custom text-xs font-medium rounded-sm transition-all active:scale-[0.98]"
          >
            <SignOut size={14} />
            Sign Out
          </button>
        </div>
      )}
    </aside>
  );
}
