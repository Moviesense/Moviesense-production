"use client";

import React from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "./Button";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  okText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  description,
  okText,
  cancelText,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
        onClick={onCancel}
      />

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-md bg-zinc-900 border border-white/10 rounded-[30px] p-8 sm:p-10 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <button
            onClick={onCancel}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            <X size={20} className="text-zinc-400" />
          </button>
        </div>

        {description && (
          <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
            {description}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 h-14 rounded-2xl border-zinc-700 text-zinc-400 hover:text-white hover:border-white"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 h-14 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold"
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin mx-auto" />
            ) : (
              okText
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
