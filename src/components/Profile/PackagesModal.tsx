"use client";

import { useEffect, useState } from "react";
import { Check, CheckCircle2, Loader2, X } from "lucide-react";
import { Button } from "@/components/Common/Button";
import { useSubscriptionPlansByCountry } from "@/hooks/useSubscription";
import { useRenewSubscription, useSubscriptionStatus } from "@/hooks/useAuth";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/context/ToastContext";
import { getCountry } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface PackagesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PackagesModal({ isOpen, onClose }: PackagesModalProps) {
  const { t } = useLanguage();
  const { userEmail } = useAuth();
  const router = useRouter();
  const renewSubscription = useRenewSubscription();
  const [country, setCountry] = useState<string | undefined>(undefined);
  const [subscribingId, setSubscribingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    (async () => {
      const c = await getCountry();
      if (!cancelled) setCountry(c);
    })();
    document.body.style.overflow = "hidden";
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      cancelled = true;
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [isOpen, onClose]);

  const plansQuery = useSubscriptionPlansByCountry(country, isOpen);
  const plans = plansQuery.data?.plans ?? [];
  const statusQuery = useSubscriptionStatus(isOpen);
  const activePlan = statusQuery.data?.plan ?? null;
  const activeExpiryRaw = statusQuery.data?.subscriptionExpiry;
  const hasActiveSubscription = !!(
    activeExpiryRaw && new Date(activeExpiryRaw).getTime() > Date.now()
  );
  const activeExpiry = activeExpiryRaw
    ? new Date(activeExpiryRaw).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const handleSubscribe = async (planId?: string) => {
    if (!userEmail) {
      toast("User email not found. Please log in again.", "error");
      return;
    }
    try {
      setSubscribingId(planId || "all");
      const c = country || (await getCountry());
      const response = await renewSubscription.mutateAsync({
        email: userEmail,
        country: c,
        view: true,
      });
      if (response.status && response.token) {
        onClose();
        router.push(`/subscription/${response.token}`);
      } else {
        toast(response.message || "Failed to get renewal link.", "error");
      }
    } catch (error) {
      console.error("Renewal error:", error);
    } finally {
      setSubscribingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-6 bg-background/10 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-background border border-white/10 rounded-2xl shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-lg sm:text-xl font-bold text-white">
            {t("viewPackages")}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto thin-scrollbar p-5 space-y-5">
          {hasActiveSubscription && activePlan && (
            <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 sm:p-5 flex items-start gap-3">
              <CheckCircle2
                size={22}
                className="text-primary shrink-0 mt-0.5"
              />
              <div className="text-sm sm:text-base text-neutral-200 capitalize">
                <p>
                  {t("subCurrentPlanLabel")}
                  <span className="font-semibold">
                    : {activePlan.name.toLowerCase()}
                  </span>
                </p>
                {activeExpiry && (
                  <p className="text-neutral-400 text-xs sm:text-sm mt-1 normal-case">
                    {t("expiresOn")} {activeExpiry}
                  </p>
                )}
              </div>
            </div>
          )}

          {plansQuery.isLoading || !country ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : plans.length === 0 ? (
            <div className="py-12 text-center text-neutral-400 text-sm">
              {plansQuery.error
                ? t("tryAgainLater") || "Failed to load packages"
                : t("noResults") || "No packages available"}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans.map((p) => {
                const current = parseFloat(p.current_price);
                const actual = parseFloat(p.actual_price);
                const hasDiscount =
                  !Number.isNaN(current) &&
                  !Number.isNaN(actual) &&
                  actual > current;
                const isCurrent =
                  hasActiveSubscription &&
                  !!activePlan &&
                  (p.product_id === activePlan.product_id ||
                    p._id === activePlan._id);
                return (
                  <div
                    key={p._id}
                    className={`relative flex flex-col rounded-xl border bg-background p-5 transition-colors ${
                      isCurrent
                        ? "border-primary/40 opacity-70"
                        : p.most_popular
                          ? "border-primary/60 shadow-lg shadow-primary/10"
                          : "border-white/10"
                    }`}
                  >
                    {isCurrent ? (
                      <span className="absolute -top-3 start-4 bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">
                        {t("subCurrentPlan")}
                      </span>
                    ) : (
                      p.most_popular && (
                        <span className="absolute -top-3 start-4 bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">
                          Popular
                        </span>
                      )
                    )}
                    <h3 className="text-white font-bold text-base sm:text-lg capitalize">
                      {p.name.toLowerCase()}
                    </h3>
                    {p.heading && (
                      <p className="text-zinc-400 text-xs sm:text-sm mt-1 line-clamp-2">
                        {p.heading}
                      </p>
                    )}
                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-bold text-teal-400">
                        ${p.current_price}
                      </span>
                      {hasDiscount && (
                        <span className="text-sm text-zinc-500 line-through">
                          ${p.actual_price}
                        </span>
                      )}
                    </div>
                    {p.features && p.features.length > 0 && (
                      <ul className="mt-4 space-y-2">
                        {p.features.map((f, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-xs sm:text-sm text-zinc-300"
                          >
                            <Check
                              size={16}
                              className="text-teal-500 shrink-0 mt-0.5"
                            />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <Button
                      variant="primary"
                      className="mt-5 w-full rounded-full"
                      onClick={() => handleSubscribe(p._id)}
                      disabled={isCurrent}
                      isLoading={
                        subscribingId === p._id ||
                        (renewSubscription.isPending && subscribingId === "all")
                      }
                    >
                      {isCurrent ? t("subCurrentPlan") : t("subscribe")}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
