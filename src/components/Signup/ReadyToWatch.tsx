"use client";

import { useSignup } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  country: z.string().optional(),
  phoneCode: z.string().optional(),
  mobileNumber: z
    .string()
    .optional()
    .refine((val) => !val || /^\d+$/.test(val), {
      message:
        "Phone number must contain digits only — no spaces or special characters",
    }),
});

type SignupFormValues = z.infer<typeof signupSchema>;

import { COUNTRIES, DEFAULT_COUNTRY_CODE, findCountry } from "@/lib/countries";

import { useEffect, useState } from "react";
import { Alert } from "@/components/Common/Alert";
import { Button } from "@/components/Common/Button";
import { Input } from "@/components/Common/Input";
import { AuthResponse } from "@/types/auth";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useAnalytics } from "@/hooks/useAnalytics";
import { AnalyticsEventType } from "@/types/analytics";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getCountry } from "@/lib/utils";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { BackgroundVideo } from "../Common/BackgroundVideo";
import Footer from "../Footer";

export default function ReadyToWatch({
  onNextStep,
}: {
  onNextStep: (data: AuthResponse) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();
  const router = useRouter();
  const { track } = useAnalytics();
  const {
    mutate: signup,
    isPending,
    error: authError,
  } = useSignup((data) => {
    console.log("Signup success:", data);
    if (!data.status) {
      setError(data?.message || "Signup failed. Please try again.");
      return;
    }
    track(AnalyticsEventType.signupMailSent);
    onNextStep(data);
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
    defaultValues: {
      country: DEFAULT_COUNTRY_CODE,
      phoneCode: findCountry(DEFAULT_COUNTRY_CODE)?.dialCode || "+61",
      mobileNumber: "",
    },
  });

  const emailValue = watch("email");
  const isFormDisabled =
    !emailValue || !!errors.email || !!errors.mobileNumber;

  useEffect(() => {
    const initCountry = async () => {
      const countryCode = await getCountry();
      const countryData = findCountry(countryCode);
      if (countryData) {
        setValue("country", countryData.code);
        setValue("phoneCode", countryData.dialCode);
      }
    };
    initCountry();
  }, [setValue]);

  const handleGoogleSignup = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const email = result.user.email;
      if (!email) {
        setError("Could not get email from Google account.");
        return;
      }
      track(AnalyticsEventType.signupTry);
      const country = await getCountry();
      signup({ email, country });
    } catch (err: any) {
      const silentErrors = [
        "auth/popup-closed-by-user",
        "auth/cancelled-popup-request",
      ];
      if (silentErrors.includes(err.code)) return;

      const errorMessages: Record<string, string> = {
        "auth/user-cancelled": "Sign-in was cancelled. Please try again.",
        "auth/popup-blocked":
          "Pop-up was blocked by your browser. Please allow pop-ups and try again.",
        "auth/network-request-failed":
          "Network error. Please check your connection and try again.",
        "auth/account-exists-with-different-credential":
          "An account already exists with this email using a different sign-in method.",
      };

      setError(
        errorMessages[err.code] || "Google sign-in failed. Please try again.",
      );
    }
  };

  const onSubmit = (data: SignupFormValues) => {
    if (isPending) return;
    track(AnalyticsEventType.signupTry);

    signup({
      email: data.email,
      country: data.country || "US",
      phoneCode: data.phoneCode,
      mobileNumber: data.mobileNumber,
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 relative z-10">
      {/* <BackgroundVideo /> */}
      <div className="flex relative flex-col items-center w-full p-5 xl:p-8 2xl:p-10 max-w-md 2xl:max-w-xl mt-32 2xl:mt-35 mx-auto space-y-6 xl:space-y-8 2xl:space-y-10 bg-background-2 sm:bg-background rounded-md min-h-[83vh] sm:min-h-full">
        <div className="space-y-4">
          <p className="text-neutral-300 text-lg sm:text-3xl font-bold text-center">
            {t("readyToWatch")}
          </p>
          <p className="text-neutral-400 text-sm sm:text-base text-center max-w-md">
            {t("enterEmailSub")}
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
                "Signup failed. Please try again."
              }
            />
          )}

          <div className="flex flex-col gap-4">
            <Input
              label=""
              type="email"
              placeholder={t("emailAddress")}
              className="h-12 rounded-md bg-transparent border-neutral-400 text-white placeholder-neutral-500"
              error={errors.email?.message}
              {...register("email")}
            />

            <div className="flex gap-2">
              <div className="w-1/3">
                <select
                  {...register("phoneCode")}
                  className="h-12 w-full rounded-md bg-transparent border border-neutral-400 text-white px-2 focus:outline-none focus:border-primary appearance-none cursor-pointer text-xs 2xl:text-md"
                >
                  {COUNTRIES.map((c) => (
                    <option
                      key={c.code}
                      value={c.dialCode}
                      style={{ backgroundColor: "#181d25" }}
                      className="text-xs 2xl:text-md"
                    >
                      {c.name} ({c.dialCode})
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-2/3">
                <Input
                  label=""
                  type="tel"
                  placeholder={`${t("phoneNumber")} (${t("optional")})`}
                  className="h-12 rounded-md bg-transparent border-neutral-400 text-white placeholder-neutral-500"
                  error={errors.mobileNumber?.message}
                  {...register("mobileNumber")}
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            isLoading={isPending}
            disabled={isFormDisabled}
            variant="primary"
            className="w-full sm:w-80 mx-auto h-10 2xl:h-12"
          >
            {t("getStarted")}
          </Button>
        </form>

        {/* OR Divider */}
        {/* <div className="flex items-center w-full sm:w-100">
          <div className="flex-grow h-px bg-neutral-400"></div>
          <span className="px-4 text-neutral-400 text-sm font-medium">
            {t("orContinueWith")}
          </span>
          <div className="flex-grow h-px bg-neutral-400"></div>
        </div> */}

        {/* Social Buttons */}
        {/* <div className="w-full flex items-center justify-center gap-4">
          <div
            onClick={handleGoogleSignup}
            className="p-2 w-10 h-10 flex items-center transition-transform cursor-pointer justify-center border border-neutral-400 rounded-full"
          >
            <Image
              src="/images/google.png"
              alt="Google"
              width={20}
              height={20}
              className="hover:scale-110"
            />
          </div>
          <div className="p-2 w-10 h-10 flex items-center transition-transform cursor-pointer justify-center border border-neutral-400 rounded-full">
            <Image
              src="/images/apple.png"
              alt="Apple"
              width={20}
              height={20}
              className="hover:scale-110"
            />
          </div>
        </div> */}

        {/* Signin Link */}
        <div className="flex gap-2 text-stone-300 text-sm sm:text-base">
          <p>{t("alreadyHaveAccount")}</p>
          <button
            onClick={() => router.push("/login")}
            className="text-primary font-bold cursor-pointer"
          >
            {t("signin")}
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
