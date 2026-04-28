"use client";

import { Header } from "@/components/HomePage/Header";
import Footer from "@/components/Footer";

import { useSettings } from "@/hooks/useHome";
import { useAnalytics } from "@/hooks/useAnalytics";
import { AnalyticsEventType } from "@/types/analytics";
import { useEffect } from "react";

import { DynamicHeroCarousel } from "@/components/HomePage/DynamicHeroCarousel";
import { WidgetRow } from "@/components/HomePage/WidgetRow";
import { BackgroundVideo } from "@/components/Common/BackgroundVideo";

export default function HomePage() {
  const { data: settingsData, isLoading: isSettingsLoading } = useSettings();

  const widgets = settingsData?.widgets || [];
  const rowWidgets = widgets
    .filter((w) => w.isActive)
    .sort((a, b) => a.order - b.order);
  const { track } = useAnalytics();

  useEffect(() => {
    track(AnalyticsEventType.homepageView);
    track(AnalyticsEventType.viewHomePage);
  }, [track]);

  return (
    <main className="min-h-screen">
      {/* <BackgroundVideo /> */}
      <Header />
      {/* {heroWidget ? ( */}
      <DynamicHeroCarousel />
      {/* ) : (
        <div className="mx-4 sm:mx-6 md:mx-12 mt-6 sm:mt-12 h-[100vh] flex items-center justify-center bg-neutral-900 border border-dashed border-neutral-800 text-neutral-500">
          No Featured Content Found
        </div>
      )} */}
      <div className="min-h-[85vh] sm:min-h-[80vh] xl:min-h-[78vh] mt-2 sm:mt-2 lg:mt-4 xl:mt-[-12rem] relative">
        {rowWidgets.map((widget) => (
          <WidgetRow
            key={widget._id}
            widget={widget}
            isSettingsLoading={isSettingsLoading}
          />
        ))}
      </div>
    </main>
  );
}
