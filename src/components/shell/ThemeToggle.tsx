"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Laptop } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center rounded-full border border-border bg-surface p-1 text-text-muted">
        <div className="h-7 w-7 rounded-full" />
      </div>
    );
  }

  return (
    <div
      role="group"
      aria-label="Theme selection"
      className="flex items-center rounded-full border border-border bg-surface p-0.5 shadow-sm"
    >
      <button
        type="button"
        onClick={() => setTheme("light")}
        aria-label="Light mode"
        className={cn(
          "rounded-full p-1.5 transition-colors text-text-muted hover:text-text",
          theme === "light" && "bg-surface-blue text-primary font-medium"
        )}
      >
        <Sun className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        aria-label="Dark mode"
        className={cn(
          "rounded-full p-1.5 transition-colors text-text-muted hover:text-text",
          theme === "dark" && "bg-surface-blue text-primary font-medium"
        )}
      >
        <Moon className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => setTheme("system")}
        aria-label="System mode"
        className={cn(
          "rounded-full p-1.5 transition-colors text-text-muted hover:text-text",
          theme === "system" && "bg-surface-blue text-primary font-medium"
        )}
      >
        <Laptop className="h-4 w-4" />
      </button>
    </div>
  );
}
