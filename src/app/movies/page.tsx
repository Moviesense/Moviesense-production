"use client";
import { Header } from "@/components/HomePage/Header";
import { MediaList } from "@/components/MediaList/MediaList";
import { useLanguage } from "@/context/LanguageContext";

export default function MoviesPage() {
  const { t } = useLanguage();
  return (
    <>
      <Header />
      <MediaList mediaType="movie" heading={"Trending Movies"} />
    </>
  );
}
