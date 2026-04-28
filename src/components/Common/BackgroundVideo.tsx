"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface BackgroundVideoProps {
  src?: string;
  overlayOpacity?: number; // 0 to 1
  className?: string;
}

export function BackgroundVideo({
  src = "/images/bg.mp4",
  overlayOpacity = 0.6,
  className,
}: BackgroundVideoProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 w-full h-full -z-10 pointer-events-none overflow-hidden",
        className,
      )}
    >
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      {/* Dark Overlay for readability */}
      <div
        className="absolute inset-0 bg-black/60"
        style={{ opacity: overlayOpacity }}
      />
    </div>
  );
}
