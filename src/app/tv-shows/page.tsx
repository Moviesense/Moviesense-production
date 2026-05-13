"use client";
import { Header } from "@/components/HomePage/Header";
import { MediaList } from "@/components/MediaList/MediaList";
import { useLanguage } from "@/context/LanguageContext";

export default function TvShowsPage() {
  const { t } = useLanguage();
  return (
    <>
      <Header />
      <MediaList mediaType="tv" heading={t("tvShows")} />
    </>
  );
}
