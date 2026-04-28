"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  className?: string;
  size?: number;
  onClick?: () => void;
}

export function BackButton({ className, size = 24, onClick }: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.back();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "p-1.5 sm:p-2 rounded-full bg-background transition-colors cursor-pointer group flex items-center justify-center",
        className,
      )}
      aria-label="Go back"
    >
      <ArrowLeft
        size={size}
        className="text-white group-hover:text-white transition-colors sm:w-[28px] sm:h-[28px]"
      />
    </button>
  );
}
