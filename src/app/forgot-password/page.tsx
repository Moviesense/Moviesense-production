"use client";

import { useForgotPassword } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Alert } from "@/components/Common/Alert";
import { Button } from "@/components/Common/Button";
import { Input } from "@/components/Common/Input";
import { useLanguage } from "@/context/LanguageContext";
import { useAnalytics } from "@/hooks/useAnalytics";
import { AnalyticsEventType } from "@/types/analytics";
import { Header } from "@/components/HomePage/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { BackgroundVideo } from "@/components/Common/BackgroundVideo";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { t } = useLanguage();

  const { track } = useAnalytics();

  const {
    mutate: forgotPassword,
    isPending,
    error: authError,
  } = useForgotPassword((data) => {
    if (data.status) {
      track(AnalyticsEventType.forgetPasswordMailSend);
      setSuccessMessage(data.message || "Email Sent Successfully.");
      setError(null);
    } else {
      setError(data.message || "User does not found with that email.");
      setSuccessMessage(null);
    }
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (data: ForgotPasswordFormValues) => {
    setError(null);
    setSuccessMessage(null);
    track(AnalyticsEventType.forgetPasswordTry);
    forgotPassword({ email: data.email });
  };

  return (
    <div className="flex flex-col min-h-screen relative z-10">
      <Header />
      {/* <BackgroundVideo /> */}
      <div className="flex relative flex-col items-center w-full p-5 xl:p-8 2xl:p-10 max-w-md 2xl:max-w-xl mt-32 2xl:mt-35 mx-auto space-y-6 xl:space-y-8 2xl:space-y-10 bg-background-2 sm:bg-background rounded-md min-h-[83vh] sm:min-h-full">
        <div className="space-y-3">
          <h1 className="text-neutral-300 text-lg sm:text-3xl font-bold text-center">
            {t("forgotPasswordQuestion")}
          </h1>
          <p className="text-neutral-400 text-sm sm:text-base text-center max-w-md">
            {t("forgotPasswordSub")}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
          {(authError || error) && (
            <Alert
              type="error"
              message={
                (authError as any)?.response?.data?.message ||
                error ||
                "Failed to reset password. Please try again."
              }
            />
          )}

          {successMessage && <Alert type="success" message={successMessage} />}

          <div className="flex flex-col gap-4">
            <Input
              label=""
              type="email"
              placeholder={t("emailAddress")}
              className="h-14 rounded-md bg-transparent border-neutral-400 text-white placeholder-neutral-500 focus:ring-cyan-400"
              error={errors.email?.message}
              {...register("email")}
            />
          </div>

          <Button
            type="submit"
            isLoading={isPending}
            variant="primary"
            className="w-full sm:w-90 mx-auto"
          >
            {t("submit")}
          </Button>
        </form>

        {/* Back to Login */}
        <div className="flex gap-2 text-stone-300 text-sm sm:text-base">
          <Link href="/login" className="text-teal-500 font-bold">
            {t("signin")}
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
