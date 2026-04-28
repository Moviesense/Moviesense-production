"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormValues } from "@/lib/validations/auth";
import { useLogin } from "@/hooks/useAuth";
import { useAuth } from "@/context/AuthContext";
import { Alert } from "@/components/Common/Alert";
import { Button } from "@/components/Common/Button";
import { Input } from "@/components/Common/Input";
import { BackButton } from "./Common/BackButton";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useAnalytics } from "@/hooks/useAnalytics";
import { AnalyticsEventType } from "@/types/analytics";
import { useEffect } from "react";
import Footer from "./Footer";
import { BackgroundVideo } from "./Common/BackgroundVideo";
import { useFcmToken } from "@/hooks/useFcmToken";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { track } = useAnalytics();
  const { t } = useLanguage();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const watchedFields = watch();
  const isFormDisabled = !isValid || !watchedFields.email || !watchedFields.password;

  const { token: fcmToken, requestPermission } = useFcmToken();
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const {
    mutate: login,
    isPending,
    error: authError,
  } = useLogin(async () => {
    track(AnalyticsEventType.loginSuccess);
    if (typeof window !== "undefined" && "Notification" in window) {
      await requestPermission();
    }
  });

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/home");
    }
  }, [isAuthenticated, isLoading, router]);

  const onSubmit = async (data: LoginFormValues) => {
    track(AnalyticsEventType.loginTry);
    let currentFcmToken = fcmToken;

    // If token is missing but permission is granted, try to get it once
    if (
      !currentFcmToken &&
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      try {
        const res = await requestPermission();
        currentFcmToken = res || null;
      } catch (error) {
        console.error("Failed to fetch token during login submission:", error);
      }
    }

    login({ ...data, fcmToken: currentFcmToken || "" });
  };

  return (
    <div className="min-h-screen flex flex-col justify-between relative z-10">
      {/* <BackgroundVideo /> */}
      {/* Main Section */}
      {/* <BackButton
        className="absolute left-5 top-5 sm:left-10 sm:top-10"
        size={24}
        onClick={() => router.push("/home")}
      /> */}
      <div className="flex relative flex-col items-center w-full p-5 xl:p-8 2xl:p-10 max-w-md 2xl:max-w-xl mt-32 2xl:mt-35 mx-auto space-y-6 xl:space-y-8 2xl:space-y-10 bg-background-2 sm:bg-background rounded-md min-h-[83vh] sm:min-h-full">
        {/* <h1 className="text-white text-3xl sm:text-5xl font-medium text-center">
          Welcome
        </h1> */}
        <p className="text-neutral-300 text-lg xl:text-3xl font-bold text-center">
          {t("signIn")}
        </p>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full space-y-4 2xl:space-y-6"
        >
          {authError && (
            <Alert
              type="error"
              message={
                (authError as any)?.response?.data?.message ||
                "Login failed. Please try again."
              }
            />
          )}

          <Input
            label=""
            type="email"
            placeholder={t("emailAddress")}
            className="h-12 rounded-md border-neutral-200 bg-transparent text-white placeholder-white/40"
            error={errors.email?.message}
            {...register("email")}
          />

          <div className="relative">
            <Input
              label=""
              type={showPassword ? "text" : "password"}
              placeholder={t("enterPassword")}
              className="h-12 rounded-md border-neutral-200 bg-transparent text-white placeholder-white/40"
              error={errors.password?.message}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-zinc-400 hover:text-zinc-500 cursor-pointer transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              }
              {...register("password")}
            />
            {/* RIGHT ALIGNED, SAME POSITION FEEL */}
          </div>
          <div className="text-center font-medium">
            <Link href="/forgot-password" className="text-primary text-xs">
              {t("forgotPasswordQuestion")}
            </Link>
          </div>

          <Button
            type="submit"
            isLoading={isPending}
            disabled={isFormDisabled}
            variant="primary"
            className="w-full sm:w-80 mx-auto h-10 2xl:h-12"
          >
            {t("signin")}
          </Button>
        </form>

        {/* OR Divider */}
        {/* <div className="flex items-center w-full sm:w-100">
          <div className="flex-grow h-px bg-neutral-400"></div>
          <span className="px-4 text-neutral-400 text-xs font-medium">
            {t("orContinueWith")}
          </span>
          <div className="flex-grow h-px bg-neutral-400"></div>
        </div> */}

        {/* Social Buttons */}
        {/* <div className="w-full flex items-center justify-center gap-4">
          <div className="p-2 2xl:w-10 2xl:h-10 xl:w-8 xl:h-8 flex items-center hover:scale-110 transition-transform cursor-pointer justify-center border border-neutral-400 rounded-full">
            <Image
              src="/images/google.png"
              alt="Google"
              width={20}
              height={20}
              className=""
            />
          </div>
          <div className="p-2 2xl:w-10 2xl:h-10 xl:w-8 xl:h-8 flex items-center hover:scale-110 transition-transform cursor-pointer justify-center border border-neutral-400 rounded-full">
            <Image
              src="/images/apple.png"
              alt="Apple"
              width={20}
              height={20}
              className=""
            />
          </div>
        </div> */}

        {/* Signup */}
        <div className="flex gap-2 text-stone-300 text-sm 2xl:text-base absolute bottom-5 sm:bottom-0 sm:relative">
          <p>{t("dontHaveAccount")}</p>
          <Link href="/signup" className="text-primary font-medium">
            {t("signup")}
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
