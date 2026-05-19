"use client";

import { useRouter } from "next/navigation";
import { ShieldOff, Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/Common/Button";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "@/context/ToastContext";
import { useCreateCancelPortalSession } from "@/hooks/useSubscription";
import { PageWrapper } from "./SubscriptionFlow";

interface Props {
  token: string;
}

export default function CancelConfirmView({ token }: Props) {
  const router = useRouter();
  const { t } = useLanguage();
  const createPortal = useCreateCancelPortalSession();

  const handleConfirm = () => {
    createPortal.mutate(token, {
      onSuccess: (res) => {
        if (res.status && res.url) {
          window.location.href = res.url;
        } else {
          toast(res.message || t("subCancelPortalError"), "error");
        }
      },
      onError: () => {
        toast(t("subCancelPortalError"), "error");
      },
    });
  };

  const handleKeep = () => {
    router.push(`/subscription/${token}`);
  };

  const infoItems = [
    t("subCancelInfo1"),
    t("subCancelInfo2"),
    t("subCancelInfo3"),
  ];

  return (
    <PageWrapper>
      <div className="w-full max-w-lg mx-auto flex flex-col items-center text-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-5">
          <ShieldOff size={32} className="text-red-400" />
        </div>

        <h1 className="text-neutral-100 text-2xl sm:text-3xl font-bold">
          {t("subCancelConfirmTitle")}
        </h1>
        <p className="text-neutral-400 text-sm sm:text-base mt-2">
          {t("subCancelConfirmSub")}
        </p>

        <ul className="w-full mt-6 space-y-3 text-start">
          {infoItems.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-3 rounded-xl border border-white/10 bg-background-2 px-4 py-3"
            >
              <Check
                size={18}
                className="text-primary shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <span className="text-neutral-200 text-sm sm:text-base">
                {item}
              </span>
            </li>
          ))}
        </ul>

        <div className="w-full flex flex-col sm:flex-row gap-3 mt-8">
          <Button
            variant="custom"
            onClick={handleKeep}
            disabled={createPortal.isPending}
            className="sm:flex-1 h-12 rounded-full bg-primary text-white font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-50 text-nowrap"
          >
            <ArrowLeft size={16} className="rtl:rotate-180" />
            {t("subKeepMyPlan")}
          </Button>
          <Button
            variant="outline"
            onClick={handleConfirm}
            isLoading={createPortal.isPending}
            className="sm:flex-1 h-12 rounded-full border border-red-500/60 text-red-400 hover:bg-red-500/10 font-semibold text-nowrap"
          >
            {createPortal.isPending
              ? t("subRedirectingPortal")
              : t("subYesCancel")}
          </Button>
        </div>
      </div>
    </PageWrapper>
  );
}
