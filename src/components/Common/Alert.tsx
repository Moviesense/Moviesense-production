import React from "react";
import { cn } from "@/lib/utils";

type AlertType = "error" | "success" | "warning" | "info";

interface AlertProps {
  type: AlertType;
  message: React.ReactNode;
  className?: string;
}

const alertStyles: Record<AlertType, string> = {
  error: "bg-red-500/10 border-red-500/50 text-red-500",
  success: "bg-green-500/10 border-green-500/50 text-green-500",
  warning: "bg-yellow-500/10 border-yellow-500/50 text-yellow-500",
  info: "bg-blue-500/10 border-blue-500/50 text-blue-500",
};

export const Alert: React.FC<AlertProps> = ({ type, message, className }) => {
  return (
    <div
      className={cn(
        "p-3 rounded-lg border text-sm text-left",
        alertStyles[type],
        className
      )}
    >
      {message}
    </div>
  );
};
