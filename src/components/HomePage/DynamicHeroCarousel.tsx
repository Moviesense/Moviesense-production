"use client";

import { useActiveBanners } from "@/hooks/useHome";
import { HeroCarousel } from "./HeroCarousel";
import { Widget } from "@/types/setting";

interface DynamicHeroCarouselProps {
  widget: Widget;
}

export function DynamicHeroCarousel() {
  // { widget }: DynamicHeroCarouselProps
  const { data: bannerData, isLoading } = useActiveBanners();

  if (isLoading) {
    return <div className="h-[100vh] skeleton-card bg-background" />;
  }

  const slides =
    bannerData?.banners?.map((item: any) => ({
      _id: item.movieId || item._id,
      image:
        item.image ||
        item.movie?.image ||
        item.signedThumbnailUrl ||
        "/images/image.png",
      title: item.movie?.title || item.title || "",
      description: item.movie?.description || item.description || "",
      videoUrl: item.signedVideoUrl || item.link || item.movie?.link,
      contentType: item.contentType,
      videoType: item.videoType ?? item.movie?.videoType,
      link: item.link || item.movie?.link,
      hlsFileName: item.hlsFileName || item.movie?.hlsFileName,
      drmEnabled: item.drmEnabled || item.movie?.drmEnabled,
      mediaType: item.movie?.media_type,
      type: item.movie?.type,
      bannerLogo: item.movie?.bannerLogo,
      runtime: item.movie?.runtime,
      signedVideoUrl: item.signedVideoUrl,
      genres: item.genres || item.movie?.genre,
      firstEpisode: item.movie?.firstEpisode || item.movie?.episode?.[0],
      episodes: item.movie?.episode,
      customAd: item.movie?.customAd || item.customAd,
      adDetails: item.movie?.adDetails || item.adDetails,
    })) || [];

  if (slides.length === 0) {
    return (
      <div className="mx-4 sm:mx-6 md:mx-12 mt-6 sm:mt-12 h-[90vh] flex items-center justify-center bg-background border border-dashed border-neutral-800 text-neutral-500">
        No Featured Content Found
      </div>
    );
  }

  return (
    <HeroCarousel
      autoplay={true}
      interval={10000}
      slides={slides}
      from="home"
    />
  );
}
