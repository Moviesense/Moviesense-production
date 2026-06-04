"use client";

import React from "react";
import { X, CreditCard, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "./Button";
import { useAnalytics } from "@/hooks/useAnalytics";
import { AnalyticsEventType } from "@/types/analytics";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
  const router = useRouter();
  const { track } = useAnalytics();

  if (!isOpen) return null;

  const handleSubscribe = () => {
    track(AnalyticsEventType.subscribeNowClick);
    router.push("/profile");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <CreditCard size={40} className="text-white" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Premium Content</h2>
            <p className="text-zinc-400">
              This episode is part of our Premium collection. Subscribe now to
              get unlimited access to all movies and shows.
            </p>
          </div>

          <div className="w-full space-y-3 py-4">
            {[
              "Ad-free streaming",
              "4K Ultra HD quality",
              "Watch on all devices",
            ].map((feature, i) => (
              <div
                key={i}
                className="flex items-center gap-3 text-sm text-zinc-300"
              >
                <CheckCircle size={18} className="text-primary shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <div className="w-full flex flex-col gap-3">
            <Button
              variant="primary"
              size="lg"
              onClick={handleSubscribe}
              className="w-full font-bold text-lg py-6"
            >
              Subscribe Now
            </Button>
            <button
              onClick={onClose}
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors py-2"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
