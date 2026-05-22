"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Input } from "@/components/Common/Input";
import { Button } from "@/components/Common/Button";
import {
  createPasswordSchema,
  CreatePasswordFormValues,
} from "@/lib/validations/subscription";
import { useCreatePassword } from "@/hooks/useSubscription";
import { useLanguage } from "@/context/LanguageContext";
import { PageWrapper } from "./SubscriptionFlow";

interface Props {
  token: string;
  defaultPhoneCode?: string;
  defaultPhoneNumber?: string;
}

export default function CreatePasswordView({
  token,
  defaultPhoneCode,
  defaultPhoneNumber,
}: Props) {
  const router = useRouter();
  const { t } = useLanguage();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<CreatePasswordFormValues>({
    resolver: zodResolver(createPasswordSchema),
    mode: "onChange",
    defaultValues: {
      password: "",
      confirmPassword: "",
      phoneCode: defaultPhoneCode || "+91",
      phoneNumber: defaultPhoneNumber || "",
    },
  });

  const { mutate: createPassword, isPending } = useCreatePassword();

  const onSubmit = (values: CreatePasswordFormValues) => {
    setServerError(null);
    createPassword(
      {
        token,
        password: values.password,
        phoneCode: values.phoneCode,
        phoneNumber: values.phoneNumber?.replace(/\s+/g, ""),
      },
      {
        onSuccess: (res) => {
          if (res.status) {
            setSuccess(true);
            setTimeout(() => router.push("/login"), 2500);
          } else {
            setServerError(res.message || "Something went wrong.");
          }
        },
        onError: (err: any) => {
          setServerError(
            err?.response?.data?.message ||
              "Something went wrong. Please try again.",
          );
        },
      },
    );
  };

  if (success) {
    return (
      <PageWrapper>
        <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
        <h2 className="text-xl sm:text-3xl font-bold text-neutral-200 mb-2 text-center">
          {t("subAccountReady")}
        </h2>
        <p className="text-neutral-400 mb-6 text-center">
          {t("subAccountReadySub")}
        </p>
        <Button
          variant="primary"
          className="w-full sm:w-90 mx-auto"
          onClick={() => router.push("/login")}
        >
          {t("subGoToLogin")}
        </Button>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="space-y-3 text-center">
        <h1 className="text-neutral-200 text-2xl sm:text-3xl font-bold">
          {t("subCreatePasswordTitle")}
        </h1>
        <p className="text-neutral-400 text-sm sm:text-base max-w-md">
          {t("subCreatePasswordSub")}
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md mt-8 space-y-5"
      >
        <Input
          label={t("subPassword")}
          type="password"
          placeholder={t("subPassword")}
          error={errors.password?.message}
          {...register("password")}
          className="bg-transparent border-neutral-600 text-white h-12 rounded-md"
        />

        <Input
          label={t("subConfirmPassword")}
          type="password"
          placeholder={t("subConfirmPassword")}
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
          className="bg-transparent border-neutral-600 text-white h-12 rounded-md"
        />

        <div className="flex gap-3">
          <div className="w-24 shrink-0">
            <Input
              label={t("subCountryCode")}
              type="text"
              placeholder="+91"
              error={errors.phoneCode?.message}
              {...register("phoneCode")}
              className="bg-transparent border-neutral-600 text-white h-12 rounded-md text-center"
            />
          </div>
          <div className="flex-1">
            <Input
              label={t("subPhoneNumber")}
              type="tel"
              inputMode="numeric"
              placeholder={`${t("phoneNumber")} (${t("optional")})`}
              error={errors.phoneNumber?.message}
              {...register("phoneNumber")}
              className="bg-transparent border-neutral-600 text-white h-12 rounded-md"
            />
          </div>
        </div>

        {serverError && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
            {serverError}
          </div>
        )}

        <Button
          type="submit"
          disabled={isPending || !isValid}
          variant="primary"
          className="w-full"
        >
          {isPending ? (
            <Loader2 className="w-5 h-5 animate-spin mx-auto text-primary" />
          ) : (
            t("subFinish")
          )}
        </Button>
      </form>
    </PageWrapper>
  );
}
