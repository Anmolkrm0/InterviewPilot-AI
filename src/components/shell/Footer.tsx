"use client";

import { usePathname } from "next/navigation";
import { ShieldCheck } from "lucide-react";

export function Footer() {
  const pathname = usePathname();

  // Hide footer on live session and feedback screens for clean full-screen layout
  if (pathname === "/session" || pathname === "/feedback") {
    return null;
  }

  return (
    <footer className="border-t border-border bg-surface/50 py-4 text-xs text-text-muted transition-colors">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 sm:flex-row sm:px-6">
        <div className="flex items-center gap-1.5 text-text-secondary">
          <ShieldCheck className="h-4 w-4 text-success" />
          <span>Your practice data is processed in-session. Never sold.</span>
        </div>
        <div>
          <span>© 2025 InterviewPilot AI. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
