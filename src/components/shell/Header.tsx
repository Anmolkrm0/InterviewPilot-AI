"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const pathname = usePathname();

  const navItems = [
    { name: "Setup", href: "/" },
    { name: "Live Session", href: "/session" },
    { name: "Feedback & Metrics", href: "/feedback" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur-md transition-colors">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand & Badge */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-sm transition-transform group-hover:scale-105">
              <Sparkles className="h-5 w-5 fill-white/20" />
            </div>
            <span className="text-lg font-bold tracking-tight text-text">
              InterviewPilot<span className="text-primary font-black">AI</span>
            </span>
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-blue px-2.5 py-0.5 text-xs font-semibold text-primary border border-primary/20">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Practice MVP
          </span>
        </div>

        {/* Center Navigation */}
        <nav className="hidden md:flex items-center gap-1 rounded-xl border border-border bg-surface p-1 shadow-xs">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "rounded-lg px-4 py-1.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-surface-blue text-primary font-semibold shadow-xs"
                    : "text-text-secondary hover:text-text hover:bg-surface-muted"
                )}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <div
            title="Active Practice Profile"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-blue text-primary border border-border cursor-pointer hover:bg-surface-muted transition-colors"
          >
            <User className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="flex md:hidden border-t border-border px-3 py-1.5 overflow-x-auto justify-around bg-surface-muted/50">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname?.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap",
                isActive
                  ? "bg-surface-blue text-primary font-bold"
                  : "text-text-muted hover:text-text"
              )}
            >
              {item.name}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
