"use client";

import React from "react";
import { X, Mail, MessageCircle } from "lucide-react";
import { Button } from "./Button";
import { useLanguage } from "@/context/LanguageContext";
import { supportEmail, supportWhatsApp } from "@/lib/utils";
import { useSupportLinks } from "@/hooks/useSupportLinks";

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useLanguage();
  const { data: links } = useSupportLinks();

  if (!isOpen) return null;

  const email = links?.supportEmailId || supportEmail;
  // Strip non-digits for the wa.me URL (it doesn't accept "+" or spaces).
  const whatsappRaw = links?.supportWhatsappNumber || supportWhatsApp;
  const whatsappDigits = whatsappRaw.replace(/\D/g, "");

  const handleWhatsApp = () => {
    return;
    window.open(`https://wa.me/${whatsappDigits}`, "_blank");
  };

  const handleEmail = () => {
    return;
    window.location.href = `mailto:${email}`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background-2/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-md bg-background border border-white/10 rounded-md p-6 pb-8 sm:p-10 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            {t("support")}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={20} className="text-zinc-400" />
          </button>
        </div>

        <p className="text-zinc-400 text-sm sm:text-lg mb-6 sm:mb-8 leading-relaxed">
          {t("contactUsMessage") || "How would you like to contact us?"}
        </p>

        <div className="flex flex-col gap-4">
          <Button
            onClick={handleWhatsApp}
            className="w-full h-10 sm:h-14 rounded-md bg-[#25D366] hover:bg-[#128C7E] text-white font-bold flex items-center justify-center gap-3"
          >
            <MessageCircle size={24} />
            WhatsApp
          </Button>
          <Button
            onClick={handleEmail}
            variant="primary"
            className="w-full h-10 sm:h-14 rounded-md gap-3 border border-gradient"
          >
            <Mail size={24} />
            Email
          </Button>
        </div>
      </div>
    </div>
  );
};
