// src/components/ui/ThemeToggle.tsx
"use client"

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`size-8 rounded-[8px] bg-muted/30 border border-border/50 animate-pulse ${className}`} />
    );
  }

  const isDark = (theme === "dark" || resolvedTheme === "dark");

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle dark/light theme"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className={`size-8.5 rounded-[8px] border border-border bg-surface hover:bg-surface-secondary text-text-secondary hover:text-text-primary flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 ${className}`}
    >
      {isDark ? (
        <Sun className="size-4 text-amber-400 hover:rotate-45 transition-transform" />
      ) : (
        <Moon className="size-4 text-blue-600 hover:-rotate-12 transition-transform" />
      )}
    </button>
  );
}

export default ThemeToggle;
