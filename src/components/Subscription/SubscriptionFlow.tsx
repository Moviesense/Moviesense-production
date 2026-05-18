"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  useParseSubscriptionToken,
  useMarkRenewTokenUsed,
} from "@/hooks/useSubscription";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "@/context/ToastContext";
import type { ParseUrlSuccess } from "@/types/subscription";
import PlansView from "./PlansView";
import CreatePasswordView from "./CreatePasswordView";
import InvalidTokenView from "./InvalidTokenView";
import { useAuth } from "@/context/AuthContext";
import { BackButton } from "../Common/BackButton";

type Step =
  | "loading"
  | "invalid"
  | "plans"
  | "createPassword"
  | "paymentProcessing";

interface Props {
  token: string;
}

export const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-[100vh] flex flex-col px-3 sm:px-6 lg:px-8 items-center justify-center p-0">
    <BackButton
      onClick={() => window.history.back()}
      className="absolute top-4 left-4 sm:top-6 sm:left-8"
    />
    <div className="flex flex-col items-center w-full p-5 sm:p-10 max-w-3xl mx-auto sm:bg-background rounded-2xl">
      {children}
    </div>
  </div>
);

export default function SubscriptionFlow({ token }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();

  const paymentStatus = searchParams.get("payment"); // "success" | "cancelled" | null

  const { data, isLoading, isError, refetch, isFetching } =
    useParseSubscriptionToken(token);

  const markRenewUsed = useMarkRenewTokenUsed();
  const markedRenewRef = useRef(false);

  // Notify the user about payment query params on first mount only.
  const handledPaymentRef = useRef(false);
  useEffect(() => {
    if (handledPaymentRef.current) return;
    if (paymentStatus === "cancelled") {
      toast(t("subPaymentCancelled"), "error");
      handledPaymentRef.current = true;
    } else if (paymentStatus === "success") {
      toast(t("subPaymentSuccess"), "success");
      handledPaymentRef.current = true;
      // re-fetch parse-url so the flow advances to create-password
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentStatus]);

  const parsed = data && data.valid ? (data as ParseUrlSuccess) : null;

  const hasActiveSubscription = useMemo(() => {
    if (!parsed) return false;
    if (!parsed.subscriptionExpiry) return false;
    return new Date(parsed.subscriptionExpiry).getTime() > Date.now();
  }, [parsed]);

  // Mark renew token used once payment has succeeded for this token.
  useEffect(() => {
    if (parsed && paymentStatus === "success" && !markedRenewRef.current) {
      markedRenewRef.current = true;
      markRenewUsed.mutate(token, {
        onError: () => {
          // non-fatal — backend may not require this for new subs
        },
      });
    }
  }, [parsed, paymentStatus, markRenewUsed, token]);

  const step: Step = useMemo(() => {
    if (isLoading || (isFetching && !data)) return "loading";
    if (isError) return "invalid";
    if (!data || !data.valid) return "invalid";
    // Payment just succeeded — always advance to create-password, even if the
    // refetched parse-url hasn't yet reflected the new subscription state.
    if (paymentStatus === "success" && !parsed?.passwordCreated) {
      return "createPassword";
    }
    // Active subscription without a password yet — finish account setup.
    if (hasActiveSubscription && !parsed?.passwordCreated) {
      return "createPassword";
    }
    // Everyone else (incl. existing subscribers wanting to upgrade) sees plans.
    return "plans";
  }, [
    isLoading,
    isFetching,
    isError,
    data,
    parsed,
    hasActiveSubscription,
    paymentStatus,
  ]);

  if (step === "loading") {
    return (
      <PageWrapper>
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-neutral-400">{t("subValidating")}</p>
      </PageWrapper>
    );
  }

  if (step === "invalid") {
    return <InvalidTokenView />;
  }

  if (step === "createPassword" && parsed && !isAuthenticated) {
    return (
      <CreatePasswordView
        token={parsed.token}
        defaultPhoneCode={parsed.phoneCode}
        defaultPhoneNumber={parsed.mobileNumber}
      />
    );
  } else if (step === "createPassword" && parsed && isAuthenticated) {
    router.push("/home");
  }

  // step === "plans"
  if (parsed) {
    return <PlansView parsed={parsed} />;
  }

  return null;
}
