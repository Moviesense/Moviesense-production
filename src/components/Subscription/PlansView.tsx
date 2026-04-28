"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Loader2, Tag, X } from "lucide-react";
import { Button } from "@/components/Common/Button";
import { Input } from "@/components/Common/Input";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "@/context/ToastContext";
import {
  useCreateCheckout,
  useCreateFreeSubscription,
  useIncrementAnalytics,
  useSubscriptionPlansByCountry,
  useValidateCoupon,
} from "@/hooks/useSubscription";
import type {
  ParseUrlSuccess,
  SubscriptionPlanItem,
} from "@/types/subscription";
import { PageWrapper } from "./SubscriptionFlow";

interface Props {
  parsed: ParseUrlSuccess;
}

const FREE_PRODUCT_IDS = new Set(["free_trial", "free", "free_plan"]);

const isFreePlan = (plan: SubscriptionPlanItem) => {
  if (FREE_PRODUCT_IDS.has(plan.product_id)) return true;
  const price = parseFloat(plan.current_price);
  return !Number.isNaN(price) && price === 0;
};

export default function PlansView({ parsed }: Props) {
  const { t } = useLanguage();

  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountPercent: number;
  } | null>(null);

  const plansQuery = useSubscriptionPlansByCountry(parsed.country);
  const validateCoupon = useValidateCoupon();
  const incrementAnalytics = useIncrementAnalytics();
  const createCheckout = useCreateCheckout();
  const createFree = useCreateFreeSubscription();

  // Increment view count once.
  useEffect(() => {
    incrementAnalytics.mutate({ eventType: "subscription_plans_view" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const plans = plansQuery.data?.plans ?? [];

  const handleApplyCoupon = () => {
    const code = couponCode.trim();
    if (!code) return;
    validateCoupon.mutate(code, {
      onSuccess: (res) => {
        if (res.status) {
          setAppliedCoupon({
            code,
            discountPercent: res.coupon.discountPercent,
          });
          toast(t("subCouponApplied"), "success");
        } else {
          setAppliedCoupon(null);
          toast(res.message || t("subCouponInvalid"), "error");
        }
      },
      onError: () => {
        setAppliedCoupon(null);
        toast(t("subCouponInvalid"), "error");
      },
    });
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
  };

  const buildSuccessUrl = (token: string) => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/subscription/${token}?payment=success`;
  };
  const buildCancelUrl = (token: string) => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/subscription/${token}?payment=cancelled`;
  };

  const handleSelectPlan = (plan: SubscriptionPlanItem) => {
    setSelectedPlanId(plan._id);

    if (isFreePlan(plan)) {
      createFree.mutate(
        {
          product_id: plan.product_id,
          email: parsed.email,
          token: parsed.token,
        },
        {
          onSuccess: (res) => {
            if (res.status) {
              toast(t("subFreePlanActivated"), "success");
              // Force a parse-url refetch by reloading the page (cleaner than threading state up).
              if (typeof window !== "undefined") {
                window.location.href = `/subscription/${parsed.token}?payment=success`;
              }
            } else {
              toast(res.message || t("subPaymentCancelled"), "error");
              setSelectedPlanId(null);
            }
          },
          onError: () => {
            setSelectedPlanId(null);
          },
        },
      );
      return;
    }

    createCheckout.mutate(
      {
        product_id: plan.product_id,
        email: parsed.email,
        token: parsed.token,
        successUrl: buildSuccessUrl(parsed.token),
        cancelUrl: buildCancelUrl(parsed.token),
        promoCode: appliedCoupon?.code,
      },
      {
        onSuccess: (res) => {
          if (res.status && res.url) {
            window.location.href = res.url;
          } else {
            toast(res.message || t("subPaymentCancelled"), "error");
            setSelectedPlanId(null);
          }
        },
        onError: () => {
          setSelectedPlanId(null);
        },
      },
    );
  };

  const isBusy = (planId: string) =>
    selectedPlanId === planId &&
    (createCheckout.isPending || createFree.isPending);

  return (
    <PageWrapper>
      <div className="w-full space-y-3 text-center">
        <h1 className="text-neutral-200 text-2xl sm:text-3xl font-bold">
          {t("subChooseYourPlan")}
        </h1>
        <p className="text-neutral-400 text-sm sm:text-base max-w-md mx-auto">
          {t("subChoosePlanSub")}
        </p>
      </div>

      {/* Plan grid */}
      <div className="w-full mt-8">
        {plansQuery.isLoading ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="skeleton-card h-56 rounded-2xl border border-white/5"
              />
            ))}
          </div>
        ) : plans.length === 0 ? (
          <p className="text-neutral-400 text-center py-12">{t("subNoPlans")}</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {plans.map((plan) => (
              <PlanCard
                key={plan._id}
                plan={plan}
                discountPercent={appliedCoupon?.discountPercent ?? 0}
                isBusy={isBusy(plan._id)}
                disabled={createCheckout.isPending || createFree.isPending}
                onSelect={() => handleSelectPlan(plan)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Coupon */}
      <div className="w-full mt-8 max-w-md mx-auto">
        <p className="text-neutral-300 text-sm mb-2 flex items-center gap-2">
          <Tag size={14} className="text-primary" />
          {t("subHavePromo")}
        </p>

        {appliedCoupon ? (
          <div className="flex items-center justify-between gap-3 bg-primary/10 border border-primary/30 rounded-md px-4 py-3">
            <div className="text-sm text-neutral-200">
              <span className="font-semibold text-primary">
                {appliedCoupon.code}
              </span>{" "}
              — {appliedCoupon.discountPercent}% {t("subDiscount").toLowerCase()}
            </div>
            <button
              type="button"
              onClick={handleRemoveCoupon}
              className="p-1 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              aria-label={t("subRemoveCoupon")}
            >
              <X size={16} className="text-neutral-300" />
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder={t("subPromoPlaceholder")}
              className="bg-transparent border-neutral-600 text-white h-12 rounded-md"
            />
            <Button
              variant="custom"
              onClick={handleApplyCoupon}
              disabled={validateCoupon.isPending || !couponCode.trim()}
              className="h-12 px-5 rounded-md bg-primary text-white font-semibold disabled:opacity-50"
            >
              {validateCoupon.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                t("subApply")
              )}
            </Button>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

interface PlanCardProps {
  plan: SubscriptionPlanItem;
  discountPercent: number;
  isBusy: boolean;
  disabled: boolean;
  onSelect: () => void;
}

function PlanCard({
  plan,
  discountPercent,
  isBusy,
  disabled,
  onSelect,
}: PlanCardProps) {
  const { t } = useLanguage();

  const current = parseFloat(plan.current_price);
  const actual = parseFloat(plan.actual_price);

  const discountedPrice = useMemo(() => {
    if (!discountPercent || Number.isNaN(current)) return current;
    return Math.max(0, current - (current * discountPercent) / 100);
  }, [current, discountPercent]);

  const showsStrikethrough =
    !Number.isNaN(actual) && actual > current && discountPercent === 0;
  const showsDiscountStrike = discountPercent > 0 && !Number.isNaN(current);

  const free = isFreePlan(plan);

  return (
    <div
      className={
        "relative rounded-2xl border bg-background-2 p-6 flex flex-col transition-all " +
        (plan.most_popular
          ? "border-primary/60 shadow-lg shadow-primary/10"
          : "border-white/10")
      }
    >
      {plan.most_popular && (
        <div className="absolute -top-3 start-4 bg-primary text-black text-xs font-bold px-3 py-1 rounded-full">
          {t("subMostPopular")}
        </div>
      )}

      <h3 className="text-neutral-200 text-lg font-bold">{plan.name}</h3>
      <p className="text-neutral-400 text-sm mb-4">{plan.heading}</p>

      <div className="flex items-baseline gap-2 mb-4">
        {free ? (
          <span className="text-3xl font-bold text-primary">FREE</span>
        ) : (
          <>
            <span className="text-3xl font-bold text-neutral-100">
              {showsDiscountStrike
                ? discountedPrice.toFixed(2)
                : current.toFixed(2)}
            </span>
            {showsStrikethrough && (
              <span className="text-neutral-500 line-through text-sm">
                {actual.toFixed(2)}
              </span>
            )}
            {showsDiscountStrike && (
              <span className="text-neutral-500 line-through text-sm">
                {current.toFixed(2)}
              </span>
            )}
          </>
        )}
      </div>

      {plan.features && plan.features.length > 0 && (
        <ul className="space-y-2 mb-6 flex-1">
          {plan.features.map((f, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-neutral-300"
            >
              <Check size={16} className="text-primary mt-0.5 shrink-0" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      )}

      <Button
        variant="primary"
        onClick={onSelect}
        disabled={disabled}
        isLoading={isBusy}
        className="w-full mt-auto"
      >
        {t("subSelectPlan")}
      </Button>
    </div>
  );
}
