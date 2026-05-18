"use client";

import React, { useEffect, useState } from "react";
import {
  CreditCard,
  User,
  Headphones,
  HelpCircle,
  FileText,
  Bell,
  History,
  EyeOff,
  LogOut,
  ChevronRight,
  LucideIcon,
  Calendar,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { userService } from "@/services/userService";
import { BackButton } from "@/components/Common/BackButton";
import { SubscriptionStatus } from "@/types/user";
import { Button } from "@/components/Common/Button";
import { useRenewSubscription } from "@/hooks/useAuth";
import { useSupportLinks } from "@/hooks/useSupportLinks";
import { useProfiles } from "@/hooks/useProfile";
import { toast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { Header } from "@/components/HomePage/Header";
import { getCountry } from "@/lib/utils";
import { SupportModal } from "@/components/Common/SupportModal";
import { useAnalytics } from "@/hooks/useAnalytics";
import { AnalyticsEventType } from "@/types/analytics";
import { ProfileDetails } from "@/components/Profile/ProfileDetails";
import { BackgroundVideo } from "@/components/Common/BackgroundVideo";
import { useFcmToken } from "@/hooks/useFcmToken";

type TabId =
  | "subscription"
  | "profile"
  | "support"
  | "faq"
  | "terms"
  | "history";

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("subscription");
  const [notifications, setNotifications] = useState(true);
  const [privateViewing, setPrivateViewing] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(
    null,
  );
  const [planType, setPlanType] = useState<string | null>(null);
  const [expiryDate, setExpiryDate] = useState<string | null>(null);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const { logout, userEmail, isSubscribed } = useAuth();
  const { t, isRTL } = useLanguage();
  const { track } = useAnalytics();

  const { data: profilesData } = useProfiles();
  const { data: supportLinks } = useSupportLinks();
  const renewSubscription = useRenewSubscription();

  const handleViewPackages = async () => {
    track(AnalyticsEventType.updateSubscriptionByProfile);
    const email = userEmail;
    if (!email) {
      toast("User email not found. Please log in again.", "error");
      return;
    }
    try {
      const country = await getCountry();
      const response = await renewSubscription.mutateAsync({
        email,
        country,
        view: true,
      });
      if (response.status && response.token) {
        router.push(`/subscription/${response.token}`);
      } else {
        toast(response.message || "Failed to get renewal link.", "error");
      }
    } catch (error) {
      console.error("Renewal error:", error);
    }
  };

  const handleUpgradePlan = async () => {
    track(AnalyticsEventType.updateSubscriptionByProfile);
    const email = userEmail;
    if (!email) {
      toast("User email not found. Please log in again.", "error");
      return;
    }

    try {
      const country = await getCountry();
      const response = await renewSubscription.mutateAsync({
        email,
        country: country,
      });

      if (response.status && response.token) {
        router.push(`/subscription/${response.token}`);
      } else {
        toast(response.message || "Failed to get renewal link.", "error");
      }
    } catch (error) {
      console.error("Renewal error:", error);
    }
  };

  const sidebarItems = [
    // { id: "subscription", title: t("mySubscription"), icon: CreditCard },
    { id: "profile", title: t("profile"), icon: User },
    { id: "support", title: t("support"), icon: Headphones },
    // { id: "faq", title: t("faq"), icon: HelpCircle },
    { id: "terms", title: t("terms"), icon: FileText },
    { id: "history", title: t("history"), icon: History },
  ];

  useEffect(() => {
    track(AnalyticsEventType.subscriptionPlansView);
  }, []);

  useEffect(() => {
    if (activeTab === "history") {
      router.push("/history");
    } else if (activeTab === "support") {
      setIsSupportModalOpen(true);
    } else if (activeTab === "terms") {
      if (supportLinks?.tncLink) {
        window.open(supportLinks.tncLink, "_blank");
      }
      // setActiveTab("profile"); // Reset tab
    } else if (typeof window !== "undefined" && window.innerWidth < 1024) {
      // Scroll to content on mobile when tab changess
      contentRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [activeTab]);

  const { refreshAuth } = useAuth();

  const fetchSubscription = async () => {
    setLoading(true);
    try {
      const response = await userService.getSubscriptionStatus();
      if (response.status) {
        setSubscription(response.subscription || null);
        setPlanType(response.planType || null);
        setExpiryDate(response.subscriptionExpiry || null);
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await Promise.all([fetchSubscription(), refreshAuth()]);
    toast("Subscription details refreshed", "success");
  };

  const { handleToggleNotifications, notificationPermissionStatus } =
    useFcmToken();

  useEffect(() => {
    const isEnabled = localStorage.getItem("notifications_enabled") !== "false";
    setNotifications(notificationPermissionStatus === "granted" && isEnabled);
  }, [notificationPermissionStatus]);

  useEffect(() => {
    if (activeTab === "subscription") {
      fetchSubscription();
    }
  }, [activeTab]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderContent = () => {
    if (activeTab === "subscription") {
      if (loading) {
        return (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mb-4"></div>
            <p className="text-zinc-400">{t("loading")}</p>
          </div>
        );
      }

      if (!subscription && !planType) {
        return (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <AlertCircle size={48} className="text-zinc-500 mb-4" />
            <h3 className="text-xs sm:text-base font-bold mb-2">
              {t("noActiveSubscription")}
            </h3>
            <p className="text-zinc-400 mb-6">
              {t("noActiveSubscriptionText")}
            </p>
            <div className="flex gap-4">
              <Button variant="primary" onClick={handleUpgradePlan}>
                {t("subscribe")}
              </Button>
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={loading}
                className="border-white/10 hover:bg-white/5 text-white rounded-full"
              >
                <RefreshCw
                  size={18}
                  className={`mr-2 ${loading ? "animate-spin" : ""}`}
                />
                {t("refresh")}
              </Button>
            </div>
          </div>
        );
      }

      const displayPlanName =
        subscription?.planId?.name ||
        planType?.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()) ||
        "Free Member";

      const displayStatus = subscription?.status || "active";

      return (
        <div className="w-full max-w-2xl mx-auto space-y-6 text-start">
          <div className="bg-background rounded-md p-6 border border-white/10">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-sm sm:text-lg font-bold text-white mb-3">
                  {displayPlanName}
                </h3>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                      displayStatus === "active"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {displayStatus}
                  </span>
                  {subscription?.autoRenew && (
                    <span className="text-zinc-500 text-xs flex items-center gap-1">
                      <RotateCcw size={12} /> {t("autoRenews")}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="pe-1 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
                  title={t("refreshSubscription")}
                >
                  <RefreshCw
                    size={22}
                    className={loading ? "animate-spin" : ""}
                  />
                </button>
                <div className="text-end">
                  <p className="text-2xl font-bold text-teal-400">
                    {subscription ? `$${subscription.planId.price}` : ""}
                  </p>
                  {subscription && (
                    <p className="text-zinc-500 text-sm">
                      / {subscription.planId.duration} days
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {subscription && (
                <div className="flex items-center gap-3 text-zinc-300">
                  <Calendar size={20} className="text-zinc-500" />
                  <div>
                    <p className="text-sm text-zinc-500">{t("startedOn")}</p>
                    <p className="font-medium">
                      {formatDate(subscription.startDate)}
                    </p>
                  </div>
                </div>
              )}
              {expiryDate && (
                <div className="flex items-start gap-3 mt-2 text-zinc-300">
                  <Calendar size={20} className="text-zinc-500" />
                  <div>
                    <p className="text-sm text-zinc-500">{t("expiresOn")}</p>
                    <p className="font-medium">{formatDate(expiryDate)}</p>
                  </div>
                </div>
              )}
            </div>

            {subscription?.planId?.features && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">
                  {t("planFeatures")}
                </h4>
                <ul className="space-y-2">
                  {subscription.planId.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle size={16} className="text-teal-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              variant="primary"
              className="rounded-full sm:h-10 2xl:h-12 py-2 w-[50%]"
              onClick={handleUpgradePlan}
              isLoading={renewSubscription.isPending}
            >
              {planType === "free_trial" ? t("subscribe") : t("upgradePlan")}
            </Button>
            {planType !== "free_trial" && (
              <Button
                variant="outline"
                className="text-neutral-400 flex-1 border border-neutral-400 rounded-full sm:h-10 2xl:h-12 py-2 w-[50%]"
              >
                {t("cancelSubscription")}
              </Button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-3xl bg-background flex items-center justify-center mb-6 sm:mb-8">
          {(() => {
            const ActiveIcon =
              sidebarItems.find((i) => i.id === activeTab)?.icon || User;
            return (
              <ActiveIcon size={32} className="text-primary sm:w-12 sm:h-12" />
            );
          })()}
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-white sm:mb-4 capitalize">
          {sidebarItems.find((i) => i.id === activeTab)?.title || activeTab}
        </h2>
        <p className="text-neutral-400 text-base sm:text-lg max-w-md">
          {t("manageSettings")}
        </p>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen text-white overflow-hidden font-manrope mt-12 sm:mt-0">
      {/* BACKGROUND GRADIENT */}
      {/* <div className="absolute inset-0 bg-gradient-to-b from-teal-500/10 via-teal-800/5 to-neutral-900 pointer-events-none" /> */}
      {/* <BackgroundVideo /> */}
      <Header />
      {activeTab !== "profile" && (
        <div className="relative flex flex-col space-y-2 items-center justify-center pt-[5rem] pb-[2rem] sm:pt-[6.5rem] sm:pb-[4rem] bg-background">
          {/* <BackButton className="absolute start-0" size={24} /> */}
          <h1 className="text-xl sm:text-3xl font-bold">
            {t("accountSettings")}
          </h1>
          {!isSubscribed && (
            <span className="text-md font-bold mt-3">
              {t("subscribeToWatchMore")}
            </span>
          )}
          <span className="text-sm text-neutral-300 text-medium">
            {t("noCommitment")}
          </span>
        </div>
      )}
      <div className="relative z-10 px-4">
        {/* TITLE */}

        {/* TOP CARD */}
        {/* <div className="mx-auto mb-4 sm:mb-8 flex flex-col sm:flex-row max-w-2xl items-center justify-between rounded-md bg-white/5 backdrop-blur-md px-6 sm:px-10 py-4 sm:py-6 shadow-2xl border border-white/5 gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-sky-500 via-cyan-500 to-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/20 flex-shrink-0">
              <User size={32} className="text-white sm:w-8 sm:h-8" />
            </div>
            <div>
              <p className="text-lg sm:text-xl font-bold">{t("currentUser")}</p>
              <p className="text-zinc-400 text-sm sm:text-base font-medium">
                {subscription
                  ? subscription.planId.name
                  : planType
                    ? planType
                        .replace("_", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())
                    : "Free Member"}
              </p>
            </div>
          </div>

          <button className="w-full sm:w-auto flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-500 px-4 sm:px-6 py-2 sm:py-3 text-lg sm:text-xl font-bold shadow-lg shadow-teal-500/20 hover:scale-105 transition-transform cursor-pointer">
            Current Plan
            <div className="w-1.5 h-6 bg-white/30 rounded-full hidden sm:block" />
          </button>
        </div> */}

        {/* CONTENT */}
        {/* <div className="flex flex-col items-center justify-center"> */}
        {/* SIDEBAR */}

        {activeTab === "profile" ? (
          <ProfileDetails onBack={() => setActiveTab("subscription")} />
        ) : (
          <aside className="rounded-md backdrop-blur-sm sm:max-w-md 2xl:max-w-xl mx-auto overflow-hidden">
            <div className="p-2 px-0 sm:p-4 space-y-1">
              <Button
                variant="custom"
                onClick={handleViewPackages}
                className="flex justify-between items-center rounded-md h-12 sm:h-16 mx-auto w-[95%] 2xl:text-lg px-6 bg-gradient-to-r from-[#3b1740] to-[#164c64] text-white shadow-md transition-all hover:opacity-90"
                isLoading={renewSubscription.isPending}
                rightIcon={
                  <ChevronRight
                    size={24}
                    className={`transition-transform xl:w-6 2xl:w-8 w-4 h-4 2xl:h-8 translate-x-1 rtl:-translate-x-1 text-white`}
                  />
                }
              >
                {t("viewPackages")}
              </Button>
              {sidebarItems.map((item) => (
                <SidebarItem
                  key={item.id}
                  title={item.title}
                  icon={item.icon}
                  active={activeTab === item.id}
                  onClick={() => setActiveTab(item.id as TabId)}
                />
              ))}
              <ToggleItem
                title={t("notifications")}
                icon={Bell}
                enabled={notifications}
                onToggle={async () => {
                  if (
                    typeof window !== "undefined" &&
                    "Notification" in window
                  ) {
                    if (
                      !notifications &&
                      Notification.permission === "denied"
                    ) {
                      toast(t("notificationPermissionDenied"), "error");
                      return;
                    }
                  }

                  const newState = !notifications;
                  const success = await handleToggleNotifications(newState);

                  if (
                    newState &&
                    !success &&
                    Notification.permission === "denied"
                  ) {
                    toast(t("notificationPermissionDenied"), "error");
                    return;
                  }

                  setNotifications(newState);
                  track(
                    newState
                      ? AnalyticsEventType.notificationOn
                      : AnalyticsEventType.notificationOff,
                  );
                }}
              />
              <div className="my-1 2xl:my-2 h-px bg-white/5 mx-4" />
              {/* <ToggleItem
              title={t("privateViewing")}
              icon={EyeOff}
              enabled={privateViewing}
              onToggle={() => setPrivateViewing(!privateViewing)}
            />
            <div className="my-1 2xl:my-2 h-px bg-white/5 mx-4" /> */}
              <SidebarItem
                title={t("logout")}
                icon={LogOut}
                danger
                onClick={() => {
                  track(AnalyticsEventType.logout);
                  logout();
                }}
              />
            </div>
          </aside>
        )}
        {/* RIGHT CONTENT */}
        {/* <section
          ref={contentRef}
            className="lg:col-span-2 rounded-md backdrop-blur-sm flex flex-col items-center justify-start text-center shadow-xl min-h-[400px] sm:min-h-[600px]"
        >
          {renderContent()}
          </section> */}
        <SupportModal
          isOpen={isSupportModalOpen}
          onClose={() => setIsSupportModalOpen(false)}
        />
      </div>
      {/* </div> */}
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

interface SidebarItemProps {
  title: string;
  icon: LucideIcon;
  active?: boolean;
  danger?: boolean;
  onClick?: () => void;
}

function SidebarItem({
  title,
  icon: Icon,
  active,
  danger,
  onClick,
}: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 w-[100%] sm:px-6 py-2 2xl:py-4 border-b border-white/5 transition-all group cursor-pointer ${
        active ? "text-primary shadow-inner" : "text-white hover:text-primary"
      }`}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <div
          className={`p-1 rounded-xl transition-colors ${
            active ? "text-primary" : "group-hover:text-primary"
          }`}
        >
          <Icon size={20} className="sm:w-[22px] sm:h-[22px]" />
        </div>
        <span className="text-sm sm:text-base 2xl:text-xl font-medium tracking-tight group-hover:text-primary">
          {title}
        </span>
      </div>

      {!danger && (
        <ChevronRight
          size={24}
          className={`transition-transform xl:w-6 2xl:w-8 xl:w-6 w-4 h-4 2xl:h-8 ${
            active
              ? "translate-x-1 rtl:-translate-x-1 text-primary"
              : "text-white group-hover:text-primary"
          }`}
        />
      )}
    </button>
  );
}

interface ToggleItemProps {
  title: string;
  icon: LucideIcon;
  enabled: boolean;
  onToggle: () => void;
}

function ToggleItem({ title, icon: Icon, enabled, onToggle }: ToggleItemProps) {
  const { isRTL, t } = useLanguage();
  return (
    <div className="flex items-center justify-between px-4 sm:px-6 py-2 sm:py-2 2xl:py-4 group">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="p-1 rounded-xl transition-colors text-white group-hover:text-primary">
          <Icon size={20} className="sm:w-[22px] sm:h-[22px]" />
        </div>
        <span className="text-sm sm:text-base 2xl:text-lg font-medium font-medium text-white group-hover:text-primary transition-colors tracking-tight">
          {title}
        </span>
      </div>

      <button
        onClick={onToggle}
        className={`h-7 sm:h-8 w-12 sm:w-14 rounded-full p-1 transition-colors cursor-pointer flex items-center ${
          enabled ? "bg-teal-500" : "bg-zinc-700"
        }`}
      >
        <div
          className={`h-5 sm:h-6 w-5 sm:w-6 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${
            enabled
              ? isRTL
                ? "-translate-x-5 sm:-translate-x-6"
                : "translate-x-5 sm:translate-x-6"
              : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

function RotateCcw({ size, className }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size || 24}
      height={size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}
