"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle({ className }: { className?: string }) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-xl border border-border/60 bg-muted/40 animate-pulse" />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.92 }}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle light and dark mode"
      title={isDark ? "Beralih ke Mode Terang (Light Mode)" : "Beralih ke Mode Gelap (Dark Mode)"}
      className={`relative inline-flex items-center justify-center w-9 h-9 rounded-xl border border-border/80 bg-card hover:bg-accent text-foreground shadow-xs overflow-hidden transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${className ?? ""}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ y: -16, opacity: 0, rotate: -70, scale: 0.3 }}
            animate={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
            exit={{ y: 16, opacity: 0, rotate: 70, scale: 0.3 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 24,
            }}
            className="flex items-center justify-center"
          >
            <Moon className="w-4 h-4 text-emerald-400 fill-emerald-400/20 drop-shadow-[0_0_6px_rgba(52,211,153,0.4)]" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ y: 16, opacity: 0, rotate: 90, scale: 0.3 }}
            animate={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
            exit={{ y: -16, opacity: 0, rotate: -90, scale: 0.3 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 24,
            }}
            className="flex items-center justify-center"
          >
            <Sun className="w-4 h-4 text-amber-500 fill-amber-500/20 drop-shadow-[0_0_6px_rgba(245,158,11,0.4)]" />
          </motion.div>
        )}
      </AnimatePresence>
      <span className="sr-only">Toggle theme</span>
    </motion.button>
  );
}
