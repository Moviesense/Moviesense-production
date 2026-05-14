"use client";
import { useState } from "react";
import { Loader2, Play } from "lucide-react";
import { useTrailers } from "@/hooks/useMovie";
import { useLanguage } from "@/context/LanguageContext";
import { getYouTubeVideoId } from "@/lib/utils";
import { Trailer } from "@/types/movie";
import { VideoPlayer } from "@/components/Common/VideoPlayer";

interface TrailersSectionProps {
  movieId: string;
  fallbackImage?: string;
}

function getThumbnail(trailer: Trailer, fallback?: string) {
  if (trailer.trailerImage) return trailer.trailerImage;
  if (trailer.videoSource === "external_link") {
    const id = getYouTubeVideoId(trailer.videoUrl);
    if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  }
  return fallback || "/images/movie.png";
}

export function TrailersSection({
  movieId,
  fallbackImage,
}: TrailersSectionProps) {
  const { t } = useLanguage();
  const { data, isLoading, error } = useTrailers(movieId);
  const [activeTrailer, setActiveTrailer] = useState<Trailer | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const trailers = data?.data || [];

  if (error || trailers.length === 0) {
    return (
      <div className="py-12 text-center text-neutral-400 text-sm">
        {t("noResults") || "No trailers available"}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {trailers.map((trailer) => {
          const thumb = getThumbnail(trailer, fallbackImage);
          return (
            <button
              key={trailer._id}
              onClick={() => setActiveTrailer(trailer)}
              className="group relative text-left bg-[#262d38] rounded-lg overflow-hidden transition-transform duration-300 hover:scale-[1.02] cursor-pointer"
            >
              <div className="relative aspect-video w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumb}
                  alt={trailer.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/50 ring-1 ring-white/30 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                    <Play
                      size={22}
                      className="text-white fill-white translate-x-0.5"
                    />
                  </div>
                </div>
                <span className="absolute top-2 left-2 text-[10px] sm:text-xs uppercase font-bold tracking-wider px-2 py-1 rounded-md bg-primary/90 text-white">
                  {trailer.type}
                </span>
              </div>
              {/* <div className="p-3 sm:p-4">
                <p className="text-white font-semibold text-sm sm:text-base line-clamp-1">
                  {trailer.name}
                </p>
                {trailer.movieTitle && (
                  <p className="text-neutral-400 text-xs sm:text-sm mt-1 line-clamp-1">
                    {trailer.movieTitle}
                  </p>
                )}
              </div> */}
            </button>
          );
        })}
      </div>

      {activeTrailer && (
        <VideoPlayer
          url={activeTrailer.videoUrl}
          title={activeTrailer.name}
          movieId={movieId}
          viewedContentId={activeTrailer._id}
          type="movie"
          onClose={() => setActiveTrailer(null)}
        />
      )}
    </>
  );
}
