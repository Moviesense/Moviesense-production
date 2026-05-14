"use client";

import { formatViews, getImageUrl, stripHtml } from "@/lib/utils";
import { Clock, Eye, Share2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Views } from "../Common/Views";
import { Top10Tag } from "../Common/Top10Tag";
import { IconButton } from "../Common/IconButton";
import { useAnalytics } from "@/hooks/useAnalytics";
import { AnalyticsEventType } from "@/types/analytics";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

export interface MovieCardProps {
  id?: string | number;
  image: string;
  duration?: string;
  views?: string | number;
  footer?: any;
  title?: string;
  description?: string;
  year?: string | number;
  className?: string;
  freeEpisode?: boolean;
  genres?: any[];
  onHover?: (data: MovieCardProps, rect: DOMRect) => void;
  onLeave?: () => void;
  onClick?: () => void;
  onDownload?: (e: React.MouseEvent) => void;
  endTime?: number;
  episodeId?: string | null;
  autoplay?: boolean;
  mediaType?: string;
  episodeNumber?: string | number;
  isTop10?: boolean;
  sectionTitle?: string;
  totalLikes?: number;
  likeStatus?: boolean;
  isFavorite?: boolean;
  type?: string;
  isRented?: boolean;
  expiryDate?: string;
  clicksLeft?: number;
  widgetType?: number;
  rank?: number;
}

function getThumbnailAspect(widgetType?: number) {
  switch (widgetType) {
    case 3:
      return "aspect-video";
    case 4:
      return "aspect-video";
    default:
      return "aspect-video";
  }
}

export function MovieCard({
  id,
  image,
  duration,
  views,
  footer,
  title,
  description,
  year,
  genres,
  onHover,
  onLeave,
  onClick,
  className,
  onDownload,
  endTime,
  episodeId,
  autoplay,
  freeEpisode,
  mediaType,
  episodeNumber,
  isTop10,
  sectionTitle,
  totalLikes,
  likeStatus,
  isFavorite,
  type,
  isRented,
  widgetType,
  rank,
}: MovieCardProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const { track } = useAnalytics();
  const { isAuthenticated } = useAuth();
  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.innerWidth > 1280)
      track(AnalyticsEventType.thumbnailView, id?.toString());
    if (onHover) {
      const rect = e.currentTarget.getBoundingClientRect();
      onHover(
        {
          id,
          image,
          duration,
          views,
          footer,
          title,
          description,
          year,
          genres,
          onDownload,
          onClick,
          endTime,
          episodeId,
          autoplay,
          freeEpisode,
          mediaType,
          episodeNumber,
          isTop10,
          sectionTitle,
          totalLikes,
          likeStatus,
          isFavorite,
          type,
          isRented,
          widgetType,
          rank,
        },
        rect,
      );
    }
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={onLeave}
      className={`
        flex-shrink-0 rounded-md
        flex flex-col 
        transition-all duration-300 ease-in-out
        cursor-pointer
      `}
    >
      {/* IMAGE */}
      <div
        className={`relative w-full overflow-hidden rounded-md ${episodeNumber ? "rounded-b-none aspect-video" : getThumbnailAspect(widgetType)} ${className}`}
      >
        {image && image !== "" ? (
          <Image
            onClick={() => {
              track(AnalyticsEventType.thumbnailClick, id?.toString());
              track(AnalyticsEventType.clickThumbnail, id?.toString());
              if (onClick) {
                onClick();
              } else {
                router.push(`/movie/${id}`);
              }
            }}
            src={getImageUrl(image)}
            alt="movie"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover cursor-pointer"
            priority={false}
          />
        ) : (
          <div className="w-full h-full skeleton-card" />
        )}
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        {sectionTitle === "Top 10" && <Top10Tag />}
        {widgetType === 2 && rank && (
          <div className="absolute top-2 right-2 z-10 flex items-center gap-1 rounded-md bg-gradient-to-br from-[#B50B8D] to-[#F80C37] px-2 py-1 shadow-lg shadow-black/40 ring-1 ring-white/10">
            <span className="text-[8px] font-bold uppercase tracking-wider text-white/90 leading-none">
              Top
            </span>
            <span className="text-sm sm:text-base font-extrabold text-white leading-none">
              {rank}
            </span>
          </div>
        )}
        {/* FOOTER */}
        {footer}
      </div>
      {!sectionTitle?.includes("Ramadan") &&
        freeEpisode &&
        type !== "PAYPERVIEWS" && (
          <span className="text-neutral-300 bg-transparent bg-background z-10 pt-1 rounded-full pl-1 text-[10px] sm:text-sm md:text-sm lg:text-sm xl:text-md 2xl:text-base font-normal lg:font-bold text-nowrap">
            {t("freeEpisode")}
          </span>
        )}
      {!sectionTitle?.includes("Ramadan") &&
        type === "PAYPERVIEWS" &&
        isAuthenticated && (
          <span className="text-green-500 bg-transparent bg-background z-10 pt-1 rounded-full pl-1 text-[10px] sm:text-sm md:text-sm lg:text-sm xl:text-md 2xl:text-base font-normal lg:font-bold text-nowrap">
            {isRented ? t("rented") : t("rent")}
          </span>
        )}
      {/* META */}
      {sectionTitle?.includes("Ramadan") && (
        <span className="text-xs md:text-sm xl:text-md 2xl:text-base p-1 sm:p-3 bg-[#262d38] rounded-b-md text-white text-start py-2 capitalize font-medium line-clamp-1 text-nowrap">
          {title}
        </span>
      )}
      {episodeNumber && (
        <div className="flex gap-4 w-full bg-background sm:hidden flex-col p-3 sm:p-4 rounded-b-md">
          <span className="text-xs sm:text-sm font-medium text-neutral-300 text-nowrap overflow-hidden">
            {description}
          </span>
          <IconButton className="w-6 h-6" title="Share">
            <Share2 size={14} className="text-white" />
          </IconButton>
        </div>
      )}
    </div>
  );
}
