"use client";

import React, { useState, useEffect } from "react";
import { X, User, Check, Loader2 } from "lucide-react";
import { Input } from "./Input";
import { Button } from "./Button";
import { Profile } from "@/types/profile";
import { useLanguage } from "@/context/LanguageContext";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProfile: Profile | null;
  onSave: (data: {
    name: string;
    type: "adult" | "kids";
    imageIndex: number;
  }) => Promise<void>;
  isSaving: boolean;
  avatarColors: string[];
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  editingProfile,
  onSave,
  isSaving,
  avatarColors,
}) => {
  const [newName, setNewName] = useState("");
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [isKids, setIsKids] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    if (isOpen) {
      if (editingProfile) {
        setNewName(editingProfile.name);
        // Map backend index (1-5) to frontend index (0-4)
        const frontendIndex = Math.max(0, (editingProfile.imageIndex || 1) - 1);
        setSelectedColorIndex(frontendIndex % avatarColors.length);
        setIsKids(editingProfile.type === "kids");
      } else {
        setNewName("");
        setSelectedColorIndex(0);
        setIsKids(false);
      }
    }
  }, [isOpen, editingProfile, avatarColors.length]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!newName.trim()) return;
    await onSave({
      name: newName,
      type: isKids ? "kids" : "adult",
      // Map frontend index (0-4) to backend index (1-5)
      imageIndex: selectedColorIndex + 1,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-xl bg-white/5 border border-white/10 rounded-[30px] sm:rounded-[40px] p-6 sm:p-12 shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-6 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            {editingProfile ? t("editProfile") : t("addProfile")}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            <X size={20} className="text-zinc-400 sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="space-y-6 sm:space-y-10">
          {/* Avatar Preview */}
          <div className="flex justify-center">
            <div
              className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br ${avatarColors[selectedColorIndex]} flex items-center justify-center shadow-2xl shadow-teal-500/20`}
            >
              {isKids ? (
                <span className="text-white/90 text-lg sm:text-2xl xl:text-3xl font-bold">
                  {t("kids")}
                </span>
              ) : (
                <User
                  size={40}
                  className="text-white/90 sm:w-[60px] sm:h-[60px]"
                />
              )}
            </div>
          </div>

          {/* Name Input */}
          <Input
            label={t("profileName")}
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={t("enterNamePlaceholder")}
            className="h-14 sm:h-16 bg-white/5 border-white/10 rounded-2xl px-4 sm:px-6 text-lg sm:text-xl text-white focus:border-teal-500 placeholder:text-zinc-600"
            autoFocus
          />

          {/* Kids Toggle */}
          <div className="flex items-center justify-between px-2">
            <div className="space-y-1">
              <label className="text-white text-lg sm:text-xl font-bold">
                {t("kidsProfile")}
              </label>
              <p className="text-zinc-500 text-sm sm:text-base">
                {t("kidsProfileDescription")}
              </p>
            </div>
            <button
              onClick={() => setIsKids(!isKids)}
              className={`relative inline-flex h-7 cursor-pointer w-12 sm:h-8 sm:w-14 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                isKids ? "bg-teal-500" : "bg-zinc-700"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 sm:h-6 sm:w-6 transform rounded-full bg-white transition-transform duration-200 ${
                  isKids ? "translate-x-6 sm:translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Color Selection */}
          <div className="">
            <label className="text-zinc-400 text-base sm:text-lg font-medium ml-2">
              {t("chooseAvatarColor")}
            </label>
            <div className="flex gap-2 sm:gap-4 justify-between mt-3 sm:mt-4 pb-2">
              {avatarColors.map((color, index) => (
                <button
                  key={color}
                  onClick={() => setSelectedColorIndex(index)}
                  className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br ${color} flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110 flex-shrink-0 ${
                    selectedColorIndex === index
                      ? "ring-2 sm:ring-4 ring-white ring-offset-2 sm:ring-offset-4 ring-offset-zinc-900 scale-110"
                      : ""
                  }`}
                >
                  {selectedColorIndex === index && (
                    <Check size={18} className="text-white sm:w-6 sm:h-6" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <Button
            onClick={handleSave}
            disabled={!newName.trim() || isSaving}
            className="w-full h-14 sm:h-16 rounded-full text-lg sm:text-xl xl:texl-base font-bold mt-2 sm:mt-4"
          >
            {isSaving ? (
              <Loader2 className="w-6 h-6 animate-spin mx-auto" />
            ) : editingProfile ? (
              t("saveChanges")
            ) : (
              t("addProfile")
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
