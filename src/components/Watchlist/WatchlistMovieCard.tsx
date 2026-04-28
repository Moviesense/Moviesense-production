"use client";

import { Clock, Download, Eye, Play } from "lucide-react";
import { MovieCard } from "../HomePage/MovieCard";

import { useRouter } from "next/navigation";
import { Views } from "../Common/Views";
import { IconButton } from "../Common/IconButton";
import { useAnalytics } from "@/hooks/useAnalytics";
import { AnalyticsEventType } from "@/types/analytics";

interface WatchlistMovieCardProps {
  id?: string | number;
  image: string;
  duration?: string;
  views?: string;
  endTime?: number;
  type?: string;
  episodeId?: string | null;
  title?: string;
  description?: string;
  year?: string | number;
  genres?: string[];
  onHover?: (data: any, rect: DOMRect) => void;
  onLeave?: () => void;
  isHistory?: boolean;
  seasonNumber?: number;
  totalLikes?: number;
  likeStatus?: boolean;
  isFavorite?: boolean;
}

export function WatchlistMovieCard({
  id,
  image,
  duration = "1h 30min",
  views = "2K",
  endTime,
  type,
  episodeId,
  title,
  description,
  year,
  genres,
  onHover,
  onLeave,
  isHistory = false,
  seasonNumber,
  totalLikes,
  likeStatus,
  isFavorite,
}: WatchlistMovieCardProps) {
  const router = useRouter();
  const { track } = useAnalytics();

  const handleClick = () => {
    if (isHistory && id) {
      track(AnalyticsEventType.playHistoryVideos, id.toString());
    }
    let url = `/movie/${id}?play=true`;
    if (episodeId) {
      url += `&episodeId=${episodeId}`;
    }
    if (seasonNumber) {
      url += `&season=${seasonNumber}`;
    }
    router.push(url);
  };

  return (
    <MovieCard
      id={id}
      image={image}
      title={title}
      description={description}
      year={year}
      genres={genres}
      endTime={endTime}
      episodeId={episodeId}
      autoplay={true}
      onClick={handleClick}
      totalLikes={totalLikes}
      likeStatus={likeStatus}
      isFavorite={isFavorite}
      onHover={onHover}
      onLeave={onLeave}
      onDownload={(e) => {
        e.stopPropagation();
        console.log("Download");
      }}
      footer={
        // bg-gradient-to-t from-background/80 to-transparent
        <div className="p-1 px-2 sm:p-3 sm:px-4 flex items-center justify-between absolute bottom-0 left-0 right-0 ">
          {/* {item.episodeNumber && (
            <span className="text-white font-bold text-xs sm:text-sm 2xl:text-base">
              {t("episode")} {item.episodeNumber}
            </span>
          )} */}
          <div className="flex items-center gap-2 ml-auto">
            {/* {isPlayLoading === item._id ? (
                                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 text-primary animate-spin" />
                              ) : ( */}
            <IconButton
              className="w-6 h-6 sm:w-7 sm:h-7"
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
            >
              <Play size={14} className="text-white fill-white" />
            </IconButton>
            {/* )} */}
          </div>
        </div>
      }
      // footer={
      //   <span
      //     className="xl:hidden absolute top-2 right-3 bg-black/60 p-1 rounded-full z-10 cursor-pointer w-8 h-8 flex items-center justify-center"
      //     onClick={(e) => {
      //       e.stopPropagation();
      //       console.log("Download");
      //     }}
      //   >
      //     <Download size={18} />
      //   </span>
      // }
    />
  );
}
