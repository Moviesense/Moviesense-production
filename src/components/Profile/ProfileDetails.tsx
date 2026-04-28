"use client";

import React, { useEffect, useState } from "react";
import { useUserProfile, useUpdateUserProfile } from "@/hooks/useAuth";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/Common/Button";
import { Input } from "@/components/Common/Input";
import { toast } from "@/context/ToastContext";
import {
  Loader2,
  User,
  Mail,
  Phone,
  ChevronLeft,
  ArrowLeft,
} from "lucide-react";

const COUNTRIES = [
  { code: "AE", name: "UAE (+971)", dialCode: "+971" },
  { code: "SA", name: "Saudi Arabia (+966)", dialCode: "+966" },
  { code: "EG", name: "Egypt (+20)", dialCode: "+20" },
  { code: "QA", name: "Qatar (+974)", dialCode: "+974" },
  { code: "KW", name: "Kuwait (+965)", dialCode: "+965" },
  { code: "OM", name: "Oman (+968)", dialCode: "+968" },
  { code: "BH", name: "Bahrain (+973)", dialCode: "+973" },
  { code: "JO", name: "Jordan (+962)", dialCode: "+962" },
  { code: "LB", name: "Lebanon (+961)", dialCode: "+961" },
  { code: "IN", name: "India (+91)", dialCode: "+91" },
  { code: "US", name: "USA (+1)", dialCode: "+1" },
  { code: "GB", name: "UK (+44)", dialCode: "+44" },
];

export function ProfileDetails({ onBack }: { onBack?: () => void }) {
  const { t } = useLanguage();
  const { data: profile, isLoading, refetch } = useUserProfile();
  const updateProfile = useUpdateUserProfile();

  const [formData, setFormData] = useState({
    name: "",
    countryCode: "+971",
    phoneNumber: "",
  });

  useEffect(() => {
    if (profile?.user) {
      let dialCode = profile.user.phoneCode;

      // If phoneCode is null, try to find it based on the user's country
      if (!dialCode && profile.user.country) {
        const countryData = COUNTRIES.find(
          (c) => c.code === profile.user.country,
        );
        if (countryData) {
          dialCode = countryData.dialCode;
        }
      }

      setFormData({
        name: profile.user.fullName || "",
        countryCode: dialCode || "+971",
        phoneNumber: profile.user.phoneNumber || "",
      });
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({
        fullName: formData.name,
        phoneNumber: formData.phoneNumber,
        phoneCode: formData.countryCode,
      });
      toast(t("saveChanges"), "success");
      refetch();
    } catch (error) {
      console.error("Update profile error:", error);
      toast("Failed to update profile", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const user = profile?.user;

  return (
    <div className="w-full max-w-2xl mx-auto text-start">
      <div className="space-y-6 rounded-md sm:max-w-md 2xl:max-w-lg mx-auto">
        <div className="relative flex flex-col space-y-2 items-center justify-center pt-[5rem] pb-[1rem] sm:pt-[6.5rem]">
          {/* <BackButton className="absolute start-0" size={24} /> */}
          <h1 className="text-lg sm:text-2xl font-bold">
            {t("editPersonalInfo")}
          </h1>
          <span className="text-sm sm:text-base text-neutral-300 text-medium">
            {t("editPersonalInfoSub")}
          </span>
        </div>
        {/* <div className="flex items-center gap-4 mb-6 border-b border-white/5 pb-4">
          <div className="w-12 h-10 sm:h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <User size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{t("profile")}</h3>
            <p className="text-zinc-500 text-sm">{t("managePersonalInfo")}</p>
          </div>
        </div> */}

        <div className="space-y-4">
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="h-10 sm:h-12 rounded-full text-sm sm:px-5 border-neutral-200 bg-white text-neutral-900 placeholder-neutral-400"
            placeholder={t("enterNamePlaceholder")}
          />

          <div className="flex gap-2">
            <div className="w-1/3">
              <select
                value={formData.countryCode}
                onChange={(e) =>
                  setFormData({ ...formData, countryCode: e.target.value })
                }
                className="h-10 sm:h-12 w-full rounded-full text-sm px-3 border border-neutral-200 bg-white text-neutral-900 focus:outline-none appearance-none text-sm 2xl:text-md cursor-pointer"
                style={{ backgroundColor: "white" }}
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.dialCode}>
                    {c.dialCode} ({c.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="w-2/3">
              <Input
                type="text"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
                className="h-10 sm:h-12 rounded-full text-sm sm:px-5 border-neutral-200 bg-white text-neutral-900 placeholder-neutral-400"
                placeholder={t("phoneNumber")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Input
              type="email"
              value={user?.email || ""}
              readOnly
              disabled
              className="h-10 sm:h-12 rounded-full text-sm sm:px-5 border-neutral-700 bg-transparent text-neutral-400 placeholder-neutral-400 cursor-not-allowed"
            />
            <p className="text-[10px] sm:text-xs text-neutral-500 px-2">
              {t("cannotModifyEmail")}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Button
            onClick={handleSave}
            isLoading={updateProfile.isPending}
            variant="primary"
            className="w-full px-8 h-10 sm:h-12"
          >
            {t("saveChanges")}
          </Button>
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center cursor-pointer justify-start gap-2 w-full text-neutral-400 hover:text-white transition-colors text-sm py-2"
            >
              <ArrowLeft size={16} className="text-primary" />
              {t("returnToPreviousStep")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
