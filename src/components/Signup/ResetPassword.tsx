"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Input } from "@/components/Common/Input";
import { Button } from "@/components/Common/Button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useValidateResetToken, useSetPassword } from "@/hooks/useAuth";
import { useLanguage } from "@/context/LanguageContext";

const passwordSchema = z
  .object({
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

interface ResetPasswordProps {
  resetToken: string;
}

export default function ResetPassword({ resetToken }: ResetPasswordProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [status, setStatus] = useState<
    "validating" | "valid" | "expired" | "success"
  >("validating");
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  const {
    isError: isTokenError,
    isSuccess: isTokenSuccess,
    isLoading: isTokenLoading,
  } = useValidateResetToken(resetToken);

  const { mutate: setPassword, isPending: isSubmitting } = useSetPassword(
    resetToken,
    () => {
      setStatus("success");
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    },
  );

  useEffect(() => {
    if (isTokenError) {
      setStatus("expired");
    } else if (isTokenSuccess) {
      setStatus("valid");
    }
  }, [isTokenError, isTokenSuccess]);

  const onSubmit = (data: PasswordFormValues) => {
    setError(null);
    setPassword(
      { newPassword: data.newPassword },
      {
        onError: (err: any) => {
          setError(
            err.response?.data?.message ||
              "Something went wrong. Please try again.",
          );
        },
      },
    );
  };

  const PageWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-[100vh] bg-black/20 flex flex-col px-4 sm:px-6 lg:px-8 flex items-center justify-center py-20">
      <div className="flex flex-col items-center w-full p-5 sm:p-14 max-w-2xl mx-auto space-y-10 bg-background rounded-md text-center">
        {children}
      </div>
    </div>
  );

  if (isTokenLoading || status === "validating") {
    return (
      <PageWrapper>
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-neutral-400">{t("validatingToken")}</p>
      </PageWrapper>
    );
  }

  if (status === "expired") {
    return (
      <PageWrapper>
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl sm:text-3xl font-bold text-neutral-300 mb-2">
          {t("linkExpired")}
        </h2>
        <p className="text-neutral-400 mb-6">{t("linkExpiredSub")}</p>
        <Button
          onClick={() => router.push("/forgot-password")}
          variant="primary"
          className="w-full sm:w-90 mx-auto"
        >
          {t("backToForgot")}
        </Button>
      </PageWrapper>
    );
  }

  if (status === "success") {
    return (
      <PageWrapper>
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-xl sm:text-3xl font-bold text-neutral-300 mb-2">
          {t("passwordChanged")}
        </h2>
        <p className="text-neutral-400 mb-6">{t("passwordChangedSub")}</p>
        <Button
          onClick={() => router.push("/login")}
          variant="primary"
          className="w-full sm:w-90 mx-auto"
        >
          {t("goToLogin")}
        </Button>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="space-y-3">
        <h1 className="text-neutral-300 text-lg sm:text-3xl font-bold text-center">
          {t("resetPasswordTitle")}
        </h1>
        <p className="text-neutral-400 text-sm sm:text-base text-center max-w-md">
          {t("resetPasswordSub")}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
        <Input
          label=""
          type="password"
          placeholder={t("newPassword")}
          error={errors.newPassword?.message}
          {...register("newPassword")}
          className="bg-transparent border-neutral-400 text-white focus:ring-cyan-500 h-14 rounded-md"
        />

        <Input
          label=""
          type="password"
          placeholder={t("confirmPassword")}
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
          className="bg-transparent border-neutral-400 text-white focus:ring-cyan-500 h-14 rounded-md"
        />

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-4 pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            variant="primary"
            className="w-full sm:w-90 mx-auto"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              t("save")
            )}
          </Button>

          <button
            type="button"
            onClick={() => router.push("/login")}
            className="text-center text-teal-500 font-bold hover:text-teal-400 transition"
          >
            {t("cancel")}
          </button>
        </div>
      </form>
    </PageWrapper>
  );
}
