import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  collapsed?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  href?: string;
}

export function Logo({ collapsed = false, className, size = "md", href = "/dashboard" }: LogoProps) {
  const iconSizes = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-11 h-11",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl",
  };

  const badgeContent = (
    <div className={cn("inline-flex items-center gap-2.5 select-none transition-all group", className)}>
      {/* Icon Concept: Stylized 'P' infused with orbit and steam ring */}
      <div
        className={cn(
          "relative flex items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/20 transition-transform group-hover:scale-105",
          iconSizes[size]
        )}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-3/5 h-3/5"
        >
          {/* Orbital curved ring */}
          <circle
            cx="16"
            cy="16"
            r="12"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeDasharray="4 2"
            className="opacity-40 animate-[spin_16s_linear_infinite]"
          />
          {/* Stem of P */}
          <path
            d="M11 7.5V24.5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Bowl of P shaped like a coffee bean curve */}
          <path
            d="M11 8H17.5C19.9853 8 22 10.0147 22 12.5C22 14.9853 19.9853 17 17.5 17H11"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Coffee aroma dot / orbital body */}
          <circle cx="16.5" cy="12.5" r="1.5" fill="currentColor" />
        </svg>
      </div>

      {/* Brand Text */}
      {!collapsed && (
        <div className="flex flex-col">
          <span className={cn("font-bold tracking-tight text-foreground leading-none font-sans", textSizes[size])}>
            PRAZ <span className="text-primary font-black">SPACE</span>
          </span>
          <span className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase mt-0.5">
            Cafe & POS
          </span>
        </div>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{badgeContent}</Link>;
  }

  return badgeContent;
}
