"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface LiquidGlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  glow?: boolean;
}

export function LiquidGlassButton({
  children,
  className,
  variant = "primary",
  size = "md",
  glow = true,
  disabled,
  ...props
}: LiquidGlassButtonProps) {
  const sizeClasses = {
    sm: "px-3.5 py-1.5 text-xs font-medium rounded-lg",
    md: "px-5 py-2.5 text-sm font-semibold rounded-xl",
    lg: "px-7 py-3.5 text-base font-bold rounded-2xl",
  };

  const variantClasses = {
    primary:
      "bg-amber-500/90 hover:bg-amber-400 text-zinc-950 border border-amber-300/40 shadow-amber-glow",
    secondary:
      "bg-zinc-900/60 dark:bg-zinc-800/60 hover:bg-zinc-800/80 text-white dark:text-zinc-100 border border-zinc-700/50 backdrop-blur-md",
    danger:
      "bg-rose-500/80 hover:bg-rose-500 text-white border border-rose-300/30",
  };

  return (
    <>
      {/* SVG Displacement Filter tạo hiệu ứng thấu kính quang học lỏng */}
      <svg className="absolute w-0 h-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <defs>
          <filter id="liquid-glass-lens" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.04 0.08"
              numOctaves="2"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="4"
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />
            <feBlend mode="overlay" in="SourceGraphic" in2="displaced" />
          </filter>
        </defs>
      </svg>

      <button
        disabled={disabled}
        className={cn(
          "group relative inline-flex items-center justify-center select-none overflow-hidden transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100",
          "backdrop-blur-xl border shadow-md",
          sizeClasses[size],
          variantClasses[variant],
          glow && "hover:shadow-amber-500/30",
          className
        )}
        {...props}
      >
        {/* Lớp phản chiếu ánh sáng bề mặt kính (Specular Highlight) */}
        <span
          className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/5 to-transparent opacity-80 pointer-events-none transition-opacity duration-300 group-hover:opacity-100"
          style={{ mixBlendMode: "overlay" }}
        />

        {/* Lớp hiệu ứng quét vệt sáng (Shimmer) khi hover */}
        <span className="absolute -left-[100%] top-0 h-full w-[200%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-700 ease-out group-hover:left-[100%]" />

        {/* Nội dung nút bấm */}
        <span className="relative z-10 flex items-center gap-2 tracking-wide font-sans">
          {children}
        </span>
      </button>
    </>
  );
}
