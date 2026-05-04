"use client";

import React from "react";

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: "rectangle" | "circle" | "text";
  style?: React.CSSProperties;
}

/**
 * Skeleton Component - A premium, high-fidelity skeleton loader.
 * Features a smooth shimmer animation and theme-aware styling.
 */
const Skeleton = ({
  className = "",
  width,
  height,
  variant = "rectangle",
  style = {},
}: SkeletonProps) => {
  // Base classes for the skeleton container
  const baseClasses = "relative overflow-hidden bg-[var(--foreground)]/[0.08] border border-[var(--border)]/50 shadow-sm";
  
  // Variant-specific rounding and defaults
  const variantClasses = {
    rectangle: "rounded-xl",
    circle: "rounded-full",
    text: "rounded-md h-4 w-full",
  };

  const skeletonStyle: React.CSSProperties = {
    width: width || undefined,
    height: height || undefined,
    ...style,
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant as keyof typeof variantClasses]} ${className}`}
      style={skeletonStyle}
    >
      {/* Shimmer overlay with smooth gradient */}
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-[var(--foreground)]/[0.05] to-transparent pointer-events-none" />
      
      {/* Premium inner glow for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none opacity-50" />
      
      {/* Subtle border highlight */}
      <div className="absolute inset-0 border border-white/[0.02] rounded-[inherit] pointer-events-none" />
    </div>
  );
};

export default Skeleton;



