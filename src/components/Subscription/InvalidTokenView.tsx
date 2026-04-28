"use client";

import { useRouter } from "next/navigation";
import { XCircle } from "lucide-react";
import { Button } from "@/components/Common/Button";
import { useLanguage } from "@/context/LanguageContext";
import { PageWrapper } from "./SubscriptionFlow";

export default function InvalidTokenView() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <PageWrapper>
      <XCircle className="w-16 h-16 text-red-500 mb-4" />
      <h2 className="text-xl sm:text-3xl font-bold text-neutral-200 mb-2 text-center">
        {t("subInvalidTitle")}
      </h2>
      <p className="text-neutral-400 mb-6 text-center max-w-md">
        {t("subInvalidSub")}
      </p>
      <Button
        variant="primary"
        className="w-full sm:w-90 mx-auto"
        onClick={() => router.push("/home")}
      >
        {t("subBackToHome")}
      </Button>
    </PageWrapper>
  );
}
