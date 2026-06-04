"use client";

import React, { useEffect, useState } from "react";
import { useUserProfile, useUpdateUserProfile } from "@/hooks/useAuth";
import { useRequestEmailChange } from "@/hooks/useEmailChange";
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
import { COUNTRIES } from "@/lib/countries";

export function ProfileDetails({ onBack }: { onBack?: () => void }) {
  const { t } = useLanguage();
  const { data: profile, isLoading, refetch } = useUserProfile();
  const updateProfile = useUpdateUserProfile();
  const requestEmailChange = useRequestEmailChange();

  const [formData, setFormData] = useState({
    name: "",
    countryCode: "+971",
    phoneNumber: "",
  });

  const [showEmailChange, setShowEmailChange] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>();

  const handleRequestEmailChange = async () => {
    setEmailError(undefined);
    const trimmedEmail = newEmail.trim();
    const currentEmail = profile?.user?.email || "";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setEmailError(t("invalidEmail"));
      return;
    }
    if (trimmedEmail.toLowerCase() === currentEmail.toLowerCase()) {
      setEmailError(t("emailMustBeDifferent"));
      return;
    }

    try {
      const res = await requestEmailChange.mutateAsync({
        newEmail: trimmedEmail,
        password: emailPassword,
      });
      if (res.status) {
        toast(res.message || t("verificationEmailSent"), "success");
        setShowEmailChange(false);
        setNewEmail("");
        setEmailPassword("");
      } else {
        // Server errors (invalid password, email already registered,
        // cooldown, …) aren't tied to a single field — show them as a toast.
        toast(res.message || t("somethingWentWrong"), "error");
      }
    } catch (error: any) {
      toast(error?.response?.data?.message || t("somethingWentWrong"), "error");
    }
  };

  const sanitizedPhone = formData.phoneNumber.replace(/\s+/g, "");
  const phoneError =
    sanitizedPhone.length > 0 && !/^\d{6,15}$/.test(sanitizedPhone)
      ? "Phone number must be 6–15 digits — spaces allowed, no letters or special characters"
      : undefined;

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
    if (phoneError) return;
    try {
      await updateProfile.mutateAsync({
        fullName: formData.name,
        phoneNumber: sanitizedPhone,
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
      <div className="flex items-center justify-center h-[90vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const user = profile?.user;

  return (
    <div className="w-full max-w-2xl mx-auto text-start">
      <div className="space-y-6 rounded-md sm:max-w-md 2xl:max-w-lg mx-auto">
        <div className="relative flex flex-col space-y-2 items-center justify-center pt-[5rem] pb-[1rem] sm:pt-[8.5rem]">
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
                type="tel"
                inputMode="numeric"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
                className="h-10 sm:h-12 rounded-full text-sm sm:px-5 border-neutral-200 bg-white text-neutral-900 placeholder-neutral-400"
                placeholder={t("phoneNumber")}
                error={phoneError}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Input
                type="email"
                value={user?.email || ""}
                readOnly
                disabled
                className="h-10 sm:h-12 rounded-full text-sm sm:px-5 pe-24 border-neutral-700 bg-transparent text-neutral-400 placeholder-neutral-400 cursor-not-allowed"
              />
              <button
                type="button"
                onClick={() => {
                  setShowEmailChange((v) => !v);
                  setEmailError(undefined);
                  setNewEmail("");
                  setEmailPassword("");
                }}
                className="absolute end-4 top-1/2 -translate-y-1/2 text-primary text-xs sm:text-sm font-semibold hover:underline cursor-pointer"
              >
                {showEmailChange ? t("cancel") : t("changeEmail")}
              </button>
            </div>

            {showEmailChange && (
              <div className="mt-2 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <Input
                  type="email"
                  value={newEmail}
                  onChange={(e) => {
                    setNewEmail(e.target.value);
                    setEmailError(undefined);
                  }}
                  placeholder={t("newEmail")}
                  error={emailError}
                  className="h-10 sm:h-12 rounded-full text-sm sm:px-5 border-neutral-200 bg-white text-neutral-900 placeholder-neutral-400"
                />
                <Input
                  type="password"
                  value={emailPassword}
                  onChange={(e) => setEmailPassword(e.target.value)}
                  placeholder={t("currentPassword")}
                  className="h-10 sm:h-12 rounded-full text-sm sm:px-5 border-neutral-200 bg-white text-neutral-900 placeholder-neutral-400"
                />
                <p className="text-[10px] sm:text-xs text-neutral-400 px-2">
                  {t("emailChangeNote")}
                </p>
                <Button
                  onClick={handleRequestEmailChange}
                  isLoading={requestEmailChange.isPending}
                  disabled={!newEmail.trim() || !emailPassword}
                  variant="primary"
                  className="w-full h-10 sm:h-12"
                >
                  {t("sendVerificationEmail")}
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Button
            onClick={handleSave}
            isLoading={updateProfile.isPending}
            disabled={!!phoneError}
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
