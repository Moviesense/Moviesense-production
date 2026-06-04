"use client";

import { SquareArrowOutUpRight } from "lucide-react";
import { Button } from "@/components/Common/Button";
import { useRouter } from "next/navigation";
import { AuthResponse } from "@/types/auth";
import { useLanguage } from "@/context/LanguageContext";

import { BackgroundVideo } from "../Common/BackgroundVideo";
import Footer from "../Footer";

export default function VerifyEmail({
  authData,
}: {
  authData: AuthResponse | null;
}) {
  const router = useRouter();
  const { t } = useLanguage();

  const handleContinue = () => {
    if (authData?.link) {
      window.location.href = authData.link;
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center relative z-10">
      {/* <BackgroundVideo /> */}
      <div className="flex relative flex-col items-center w-full p-5 xl:p-8 2xl:p-10 max-w-md 2xl:max-w-xl mt-32 2xl:mt-35 mx-auto space-y-6 xl:space-y-8 2xl:space-y-10 bg-background-2 sm:bg-background rounded-md min-h-[83vh] sm:min-h-full">
        {/* Heading */}
        <div className="space-y-4">
          <h1 className="text-neutral-300 text-lg sm:text-2xl font-bold text-center">
            {t("finishSigningUp")}
          </h1>

          {/* Sub text */}
          <div className="text-neutral-400 text-sm sm:text-lg text-center">
            {t("almostThere")}
            <span className="block font-medium text-white mt-1 break-all">
              {authData?.email || "email@example.com"}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm sm:text-base text-neutral-400 text-center">
          {t("followFurtherSteps")}
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
          {/* <Button
            onClick={handleContinue}
            variant="primary"
            className="w-full sm:w-80 mx-auto h-10 2xl:h-12 text-nowrap"
            leftIcon={<SquareArrowOutUpRight size={20} />}
          >
            {t("continueWithLink")}
          </Button> */}
          <Button
            onClick={() => router.push("/login")}
            variant="primary"
            className="w-full sm:w-80 mx-auto h-10 2xl:h-12"
          >
            {t("signin")}
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
