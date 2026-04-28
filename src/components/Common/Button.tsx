"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "dark" | "custom";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = "primary",
      size = "lg",
      isLoading = false,
      leftIcon,
      rightIcon,
      ...props
    },
    ref,
  ) => {
    const variants = {
      primary:
        "bg-gradient-to-r from-primary to-secondary text-white font-medium w-full h-12 rounded-full hover:from-primary hover:to-primary hover:bg-primary",
      secondary:
        "bg-primary hover:bg-green-700 text-white border-transparent focus:ring-green-500",
      outline:
        "bg-transparent hover:bg-gray-50 text-gray-700 border-gray-300 focus:ring-blue-500",
      ghost:
        "bg-transparent hover:bg-gray-50 text-gray-700 border-transparent focus:ring-gray-500",
      dark: "text-white px-3 sm:px-4 py-1.5 sm:py-2 text-sm flex items-center whitespace-nowrap bg-black hover:bg-gray-700",
      custom: "", // Empty string for custom styling
    };

    const sizes = {
      sm: "py-1 px-3 text-xs",
      md: "py-2 px-4 text-sm",
      lg: "px-8 text-sm sm:text-md 2xl:text-base font-bold",
    };

    return (
      <button
        className={cn(
          "flex justify-center items-center font-medium focus:outline-none transition-colors cursor-pointer",
          variant !== "custom" && "rounded-md shadow-md",
          variant !== "custom" && variants[variant],
          sizes[size],
          (isLoading || props.disabled) && "opacity-50 cursor-not-allowed !bg-gray-500 !from-gray-500 !to-gray-500",
          className,
        )}
        disabled={isLoading || props.disabled}
        ref={ref}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  },
);

Button.displayName = "Button";

export { Button };
