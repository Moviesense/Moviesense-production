import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Label } from "./Label";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  para?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { className, label, error, para, id, leftIcon, rightIcon, ...props },
    ref,
  ) => {
    return (
      <div className="w-full">
        {label && (
          <Label
            htmlFor={id || ""}
            className="block text-sm text-zinc-300 mb-2"
          >
            {label}
          </Label>
        )}
        {para && <p className="text-xs text-gray-500 mb-2">{para}</p>}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            id={id}
            className={cn(
              "appearance-none block w-full border rounded-md focus:outline-none transition-all text-xs 2xl:text-md",
              leftIcon ? "ps-9 sm:ps-10" : "ps-3",
              rightIcon ? "pe-9 sm:pe-10" : "pe-3",
              "py-2 sm:py-2.5",
              error && "border-red-500",
              className,
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 end-0 pe-3 flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };
