"use client";

import { Facebook, Instagram, Youtube } from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from "next/navigation";
import { useAnalytics } from "@/hooks/useAnalytics";
import { AnalyticsEventType } from "@/types/analytics";
import { useAuth } from "@/context/AuthContext";
import { useRenewSubscription } from "@/hooks/useAuth";
import { getCountry, supportPageUrl } from "@/lib/utils";
import { toast } from "@/context/ToastContext";

const Footer = () => {
  const { t } = useLanguage();
  const router = useRouter();
  const { track } = useAnalytics();
  const { isAuthenticated, userEmail } = useAuth();
  const renewSubscription = useRenewSubscription();

  const handleUpgradePlan = async () => {
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

  const handleSubscribe = () => {
    if (isAuthenticated) {
      handleUpgradePlan();
    } else {
      router.push("/signup");
    }
  };

  const openSupport = () => {
    track(AnalyticsEventType.openSupport);
    router.push("/support");
  };

  const openTerms = () => {
    track(AnalyticsEventType.openTermsCondition);
    router.push("/terms");
  };

  const openPrivacy = () => {
    router.push("/privacy");
  };

  const openExternal = (url: string) => window.open(url, "_blank");

  const helpLinks = [
    { label: t("howToWatch"), onClick: () => router.push("/how-to-watch") },
    {
      label: t("academy"),
      onClick: () => openExternal("https://academy.moviesense.com/"),
    },
    { label: t("accountLogin"), onClick: () => router.push("/login") },
    { label: t("signup"), onClick: () => router.push("/signup") },
    { label: t("manageAccount"), onClick: () => router.push("/profile") },
    { label: t("contactUs"), onClick: () => router.push("/contact") },
  ];

  const otherLinks = [
    {
      label: t("academy"),
      onClick: () => openExternal("https://academy.moviesense.com/"),
    },
    { label: t("liveStream"), onClick: () => router.push("/live-tv") },
    { label: t("support"), onClick: openSupport },
  ];

  return (
    <footer className="relative overflow-hidden bg-background-2 mt-auto">
      {/* warm clapperboard glow rising from bottom-centre */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 118%, rgba(255,138,46,.42) 0%, rgba(150,64,20,.30) 26%, rgba(40,22,14,.18) 48%, rgba(5,7,25,0) 72%), radial-gradient(140% 120% at 50% 130%, rgba(120,52,14,.55) 0%, rgba(60,30,12,.30) 35%, rgba(5,7,25,0) 65%), linear-gradient(to bottom, var(--background-2) 0%, #0a0a1c 30%, #160e12 60%, #241510 100%)",
        }}
      />
      {/* faint diagonal film-strip texture in the warm zone */}
      <div
        className="pointer-events-none absolute inset-0 opacity-50 mix-blend-screen"
        style={{
          background:
            "repeating-linear-gradient(118deg, rgba(255,180,120,.045) 0 2px, rgba(0,0,0,0) 2px 64px), radial-gradient(60% 50% at 38% 95%, rgba(255,160,90,.10), transparent 70%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 32%, #000 70%)",
          maskImage: "linear-gradient(to bottom, transparent 32%, #000 70%)",
        }}
      />

      <div className="relative z-[1] mx-auto grid max-w-[1280px] grid-cols-1 items-start gap-14 px-8 pb-16 pt-20 sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1fr] lg:gap-14 lg:pb-[90px] lg:pt-[120px]">
        {/* ---- Brand ---- */}
        <div className="flex flex-col items-center lg:items-start">
          <Image
            src="/images/logo-sense.png"
            alt="Movie Sense"
            width={200}
            height={100}
            onClick={() => router.push("/home")}
            className="mb-10 h-auto w-[120px] sm:w-[180px] max-w-full cursor-pointer lg:mb-16"
          />
          <div className="flex items-center justify-center gap-3.5">
            <span className="flex h-[42px] cursor-pointer items-center gap-2.5 rounded-[7px] border border-white/60 bg-black px-3 leading-none text-white">
              <svg
                width="22"
                height="26"
                viewBox="0 0 22 26"
                aria-hidden="true"
              >
                <path
                  fill="#fff"
                  d="M16.5 13.8c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.8-2.1-1.6-.16-3.1.95-3.9.95-.8 0-2-.93-3.3-.9-1.7.02-3.3 1-4.2 2.5-1.8 3.1-.46 7.7 1.3 10.2.85 1.2 1.9 2.6 3.2 2.5 1.3-.05 1.8-.83 3.3-.83 1.5 0 2 .83 3.3.8 1.4-.02 2.2-1.25 3.05-2.46.96-1.4 1.36-2.76 1.38-2.83-.03-.01-2.64-1.01-2.66-4.02zM14 5.9c.7-.85 1.18-2.04 1.05-3.22-1.01.04-2.24.67-2.97 1.52-.65.75-1.22 1.95-1.07 3.1 1.13.09 2.28-.57 2.99-1.4z"
                />
              </svg>
              <span className="flex flex-col justify-center">
                <small className="text-[8.5px] uppercase tracking-[0.04em] opacity-90">
                  Download on the
                </small>
                <strong className="mt-px text-[15px] font-semibold">
                  App Store
                </strong>
              </span>
            </span>
            <span className="flex h-[42px] cursor-pointer items-center gap-2.5 rounded-[7px] border border-white/60 bg-black px-3 leading-none text-white">
              <svg
                width="20"
                height="22"
                viewBox="0 0 20 22"
                aria-hidden="true"
              >
                <path
                  fill="#00d3ff"
                  d="M.7.8C.5 1 .4 1.4.4 1.9v18.2c0 .5.1.9.3 1.1L11 11z"
                />
                <path
                  fill="#ffce00"
                  d="M14.6 7.5 11 11l3.6 3.5 4.3-2.5c.7-.4.7-1.6 0-2z"
                />
                <path
                  fill="#ff3b3b"
                  d="M.7.8 11 11l3.6-3.5L2.4.2C1.8-.1 1.1-.1.7.8z"
                />
                <path
                  fill="#00e676"
                  d="M.7 21.2c.4.9 1.1.9 1.7.6l12.2-7L11 11z"
                />
              </svg>
              <span className="flex flex-col justify-center">
                <small className="text-[8.5px] uppercase tracking-[0.04em] opacity-90">
                  Get it on
                </small>
                <strong className="mt-px text-[15px] font-semibold">
                  Google Play
                </strong>
              </span>
            </span>
          </div>
        </div>

        {/* ---- Help ---- */}
        <nav aria-label={t("help")} className="text-center">
          <p className="mb-1.5 text-[21px] font-semibold text-[#f0f0f4]">
            {t("realMoviesSimple")}
          </p>
          <h3 className="mb-7 text-[21px] font-semibold text-primary">
            {t("help")}
          </h3>
          <ul className="m-0 list-none p-0">
            {helpLinks.map((link) => (
              <li key={link.label} className="mb-[19px]">
                <button
                  type="button"
                  onClick={link.onClick}
                  className="cursor-pointer text-[17px] leading-[1.1] text-[#d4d4dc] transition-colors duration-150 hover:text-white"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* ---- Links ---- */}
        <nav aria-label={t("links")} className="text-center">
          <h3 className="mb-7 text-[21px] font-semibold text-primary">
            {t("links")}
          </h3>
          <ul className="m-0 list-none p-0">
            {otherLinks.map((link) => (
              <li key={link.label} className="mb-[19px]">
                <button
                  type="button"
                  onClick={link.onClick}
                  className="cursor-pointer text-[17px] leading-[1.1] text-[#d4d4dc] transition-colors duration-150 hover:text-white"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* ---- CTA ---- */}
        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={handleSubscribe}
            className="inline-flex h-12 min-w-[180px] cursor-pointer items-center justify-center rounded-lg px-[30px] text-base font-semibold text-white transition-[filter] duration-150 hover:brightness-110"
            style={{
              background: "linear-gradient(180deg,#ff8a1e 0%,#ff4e09 100%)",
              boxShadow: "0 10px 26px rgba(255,92,10,.35)",
            }}
          >
            {t("subscribe")}
          </button>

          <div
            className="mt-12 flex justify-center gap-[22px]"
            aria-label="Social links"
          >
            <span className="inline-flex cursor-pointer text-white opacity-90 transition-opacity duration-150 hover:opacity-100">
              <Youtube size={26} />
            </span>
            <span className="inline-flex cursor-pointer text-white opacity-90 transition-opacity duration-150 hover:opacity-100">
              <Instagram size={24} />
            </span>
            <span className="inline-flex cursor-pointer text-white opacity-90 transition-opacity duration-150 hover:opacity-100">
              <Facebook size={24} />
            </span>
          </div>

          <div className="mt-12 flex flex-col items-center gap-[34px]">
            <Image
              src="/images/footer-goldcoast.webp"
              alt="Gold Coast"
              width={200}
              height={80}
              className="block h-auto w-[200px]"
            />
            <Image
              src="/images/footer-aus-owned.webp"
              alt="Australian Owned & Operated"
              width={150}
              height={150}
              className="block h-auto w-[150px]"
            />
          </div>
        </div>
      </div>

      {/* ---- bottom bar ---- */}
      <div className="relative z-[1] border-t border-white/[0.06] bg-[#0a0a1c]">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-6 px-8 py-6 text-center text-sm text-[#c9c9d2] sm:flex-row sm:text-left">
          <div>
            &copy; {new Date().getFullYear()} Movie Sense.{" "}
            {t("allRightsReserved")}
          </div>
          <div className="flex gap-8">
            <button
              type="button"
              onClick={openPrivacy}
              className="cursor-pointer text-[#c9c9d2] transition-colors duration-150 hover:text-white"
            >
              {t("privacyPolicy")}
            </button>
            <button
              type="button"
              onClick={openTerms}
              className="cursor-pointer text-[#c9c9d2] transition-colors duration-150 hover:text-white"
            >
              {t("termsOfService")}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
