"use client";

import { Facebook, Instagram, Twitter } from "lucide-react";
import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from "next/navigation";
import { SupportModal } from "./Common/SupportModal";
import { useAnalytics } from "@/hooks/useAnalytics";
import { AnalyticsEventType } from "@/types/analytics";
import { useAuth } from "@/context/AuthContext";
import { useRenewSubscription } from "@/hooks/useAuth";
import { useSupportLinks } from "@/hooks/useSupportLinks";
import { getCountry } from "@/lib/utils";
import { toast } from "@/context/ToastContext";

const Footer = () => {
  const { t } = useLanguage();
  const router = useRouter();
  const { track } = useAnalytics();
  const { isAuthenticated, userEmail } = useAuth();
  const renewSubscription = useRenewSubscription();
  const { data: supportLinks } = useSupportLinks();
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

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

  const footerLinks = [
    {
      title: t("home"),
      items: [t("categories"), t("devices"), t("pricing"), t("faq")],
    },
    // {
    //   title: t("explore"),
    //   items: [
    //     t("contentOwners"),
    //     t("investors"),
    //     t("marketing"),
    //     t("improvements"),
    //   ],
    // },
    {
      title: t("support"),
      items: [t("contactUs")],
    },
    {
      title: t("subscription"),
      items: [t("plans"), t("features")],
    },
    {
      title: t("termsOfUse"),
    },
    // {
    //   title: t("privacyPolicy"),
    // },
  ];

  return (
    <footer className="px-4 sm:px-6 py-8 xl:py-8 2xl:py-8 pt-0 mt-auto">
      <div className="w-full mx-auto flex flex-col sm:flex-row justify-center items-center gap-4 text-sm xl:text-lg sm:gap-10 mb-8">
        {footerLinks.map((section) => (
          <div
            key={section.title}
            className="flex flex-col items-center sm:items-start"
            onClick={() => {
              if (section.title === t("home")) {
                router.push("/home");
              } else if (section.title === t("support")) {
                track(AnalyticsEventType.openSupport);
                setIsSupportModalOpen(true);
              } else if (section.title === t("faq")) {
                track(AnalyticsEventType.openFaq);
                setIsSupportModalOpen(true);
              } else if (section.title === t("termsOfUse")) {
                track(AnalyticsEventType.openTermsCondition);
                if (supportLinks?.tncLink) {
                  window.open(supportLinks.tncLink, "_blank");
                }
              } else if (section.title == t("subscription")) {
                if (isAuthenticated) {
                  handleUpgradePlan();
                } else {
                  router.push("/signup");
                }
              }
            }}
          >
            <h3 className="font-medium text-white cursor-pointer text-sm xl:text-lg 2xl:text-base transition-colors duration-200 hover:text-primary">
              {section.title}
            </h3>
            {/* <ul className="space-y-2 sm:space-y-3 text-gray-400 text-sm sm:text-base flex flex-col items-center sm:items-start">
              {section.items.map((item) => (
                <li
                  key={item}
                  className="hover:text-primary cursor-pointer transition-colors duration-200"
                >
                  {item}
                </li>
              ))}
            </ul> */}
          </div>
        ))}

        {/* Social */}
        {/* <div className="flex flex-col items-center sm:items-start">
          <h3 className="font-medium mb-4 text-white">{t("connectWithUs")}</h3>
        </div> */}
      </div>
      <div className="flex gap-3 sm:gap-4 justify-center items-center">
        <div className="w-9 h-9 p-2 sm:w-10 sm:h-10 xl:w-11 xl:h-11 2xl:w-12 2xl:h-12 flex justify-center items-center rounded-full bg-[#262d38] hover:bg-primary cursor-pointer">
          <Facebook size={30} />
        </div>
        <div className="w-9 h-9 p-2 sm:w-10 sm:h-10 xl:w-11 xl:h-11 2xl:w-12 2xl:h-12 flex justify-center items-center rounded-full bg-[#262d38] hover:bg-primary cursor-pointer">
          <Twitter size={30} />
        </div>
        <div className="w-9 h-9 p-2 sm:w-10 sm:h-10 xl:w-11 xl:h-11 2xl:w-12 2xl:h-12 flex justify-center items-center rounded-full bg-[#262d38] hover:bg-primary cursor-pointer">
          <Instagram size={30} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-5 sm:mt-8 flex flex-col sm:flex-row justify-center gap-4 text-neutral-400 text-xs sm:text-sm text-center sm:text-left">
        <span>{t("allRightsReserved")} @DATANETNY 2026</span>

        {/* <div className="flex flex-wrap justify-center sm:justify-end gap-3 sm:gap-4">
          <span>{t("termsOfUse")}</span>
          <span>{t("privacyPolicy")}</span>
          <span>{t("cookiePolicy")}</span>
        </div>*/}
      </div>
      <SupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />
    </footer>
  );
};

export default Footer;
