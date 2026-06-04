"use client";

import {
  Play,
  Plus,
  ThumbsUp,
  ChevronDown,
  Check,
  Loader2,
  Clock,
  Download,
  Heart,
  Sparkle,
  Share2,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MovieCardProps } from "./MovieCard";
import { motion } from "framer-motion";
import { useToggleFavorite, useToggleLike } from "@/hooks/useMovie";
import { movieService } from "@/services/movieService";
import { IconButton } from "../Common/IconButton";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { Views } from "../Common/Views";
import PlayButton from "../Common/PlayButton";
import { stripHtml, cn, getImageUrl } from "@/lib/utils";
import { Top10Tag } from "../Common/Top10Tag";
import { useAnalytics } from "@/hooks/useAnalytics";
import { AnalyticsEventType } from "@/types/analytics";
import { ShareModal } from "../Common/ShareModal";
import { useState, useEffect } from "react";

interface ExpandedMovieCardProps extends MovieCardProps {
  rect: DOMRect;
  onLeave: () => void;
  onMouseEnter: () => void;
  actions?: boolean;
  isEpisode?: boolean;
  episodeNumber?: string | number;
}

export function ExpandedMovieCard({
  id,
  image,
  title,
  description,
  year,
  genres,
  views,
  duration,
  rect,
  onLeave,
  onMouseEnter,
  onDownload,
  sectionTitle,
  onClick,
  endTime,
  episodeId,
  actions,
  autoplay,
  freeEpisode,
  mediaType,
  isEpisode,
  episodeNumber,
  isTop10,
  totalLikes,
  likeStatus,
  isFavorite: isFavoriteProp,
  isRented,
  expiryDate,
  clicksLeft,
  type,
  widgetType,
  rank,
}: ExpandedMovieCardProps) {
  const router = useRouter();
  const { track } = useAnalytics();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [localLikesCount, setLocalLikesCount] = useState(totalLikes || 0);
  const [isLiked, setIsLiked] = useState(likeStatus ?? false);
  const [isFavorite, setIsFavorite] = useState(isFavoriteProp ?? false);

  useEffect(() => {
    setLocalLikesCount(totalLikes || 0);
  }, [totalLikes]);

  useEffect(() => {
    setIsLiked(likeStatus ?? false);
  }, [likeStatus]);

  useEffect(() => {
    setIsFavorite(isFavoriteProp ?? false);
  }, [isFavoriteProp]);

  const toggleFavorite = useToggleFavorite();
  const { isAuthenticated, isSubscribed } = useAuth();

  // The list/widget API doesn't return per-item favorite status, so fetch the
  // real value from the server when the card expands (logged-in movies only).
  useEffect(() => {
    if (!isAuthenticated || isEpisode || !id) return;

    let cancelled = false;
    movieService
      .checkFavorite(String(id))
      .then((response) => {
        if (!cancelled && response.status) {
          setIsFavorite(response.isFavorite);
        }
      })
      .catch((error) => {
        console.error("Error checking favorite status:", error);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isEpisode, id]);
  const { t } = useLanguage();

  const handleToggleFavorite = async (e?: React.MouseEvent) => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    e?.stopPropagation();
    if (!id) return;

    setIsFavorite(!isFavorite);
    toggleFavorite.mutate({
      movieId: id.toString(),
      type: mediaType || "movie",
    });
    if (!isFavorite) {
      track(AnalyticsEventType.addMyList, id.toString());
    }
  };

  const toggleLikeMutation = useToggleLike();

  const handleToggleLike = async (e?: React.MouseEvent) => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    e?.stopPropagation();
    if (!id || toggleLikeMutation.isPending) return;

    try {
      if (!isLiked) {
        track(AnalyticsEventType.clickLikeMovie, id.toString());
        setLocalLikesCount((prev) => prev + 1);
      } else {
        setLocalLikesCount((prev) => Math.max(0, prev - 1));
      }
      setIsLiked(!isLiked);
      await toggleLikeMutation.mutateAsync({
        movieId: id.toString(),
        type: mediaType || "movie",
      });
    } catch (error) {
      console.error("Error toggling like:", error);
      setLocalLikesCount(totalLikes || 0);
      setIsLiked(likeStatus ?? false);
    }
  };

  const expandedWidth = rect.width * 1.2;
  let left = rect.left - (expandedWidth - rect.width) / 2;

  if (left < 10) left = 10;
  if (left + expandedWidth > window.innerWidth - 10) {
    left = window.innerWidth - expandedWidth - 10;
  }

  const top = rect.top - 30;

  const handlePlay = (
    e?: React.MouseEvent | boolean,
    forcePlayOverride?: boolean,
  ) => {
    if (typeof e === "object") {
      e?.stopPropagation();
    }
    const forcePlay =
      typeof forcePlayOverride === "boolean"
        ? forcePlayOverride
        : typeof e === "boolean"
          ? e
          : true;

    if (onClick && !forcePlay) {
      onClick();
      return;
    }
    const shouldPlay = forcePlay || autoplay;
    let url = `/movie/${id}${shouldPlay ? "?play=true" : ""}`;
    if (endTime && shouldPlay) {
      url += `&startTime=${endTime / 1000}`;
    }
    if (episodeId && shouldPlay) {
      url += `&episodeId=${episodeId}`;
    }
    if (id) {
      track(AnalyticsEventType.clickOnPlayButton, id.toString());
    }
    router.push(url);
  };

  return (
    <motion.div
      initial={{
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        opacity: 0,
      }}
      animate={{
        left: left,
        top: top,
        width: expandedWidth,
        height: "auto",
        opacity: 1,
      }}
      exit={{
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        opacity: 0,
      }}
      transition={{ duration: 0.15, ease: "easeInOut" }}
      className="fixed z-50 rounded-lg overflow-hidden bg-[#262d38] hidden xl:block"
      onMouseLeave={onLeave}
      onMouseEnter={onMouseEnter}
    >
      {/* IMAGE */}
      <div
        className="relative w-full aspect-video cursor-pointer"
        onClick={(e) => handlePlay(e, false)}
      >
        {image && image !== "" ? (
          <Image
            src={getImageUrl(image)}
            alt={title || "Movie"}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full skeleton-card" />
        )}

        <div className="p-3 px-4 flex items-center justify-between absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/80 to-transparent">
          {episodeNumber && (
            <span className="text-white font-bold text-xs sm:text-sm xl:text-md 2xl:text-base text-start">
              {t("episode")} {episodeNumber}
            </span>
          )}
          <div className="flex items-center gap-2 ml-auto">
            <IconButton
              className="w-7 h-7"
              onClick={(e) => handlePlay(e, true)}
            >
              <Play size={14} className="text-white fill-white" />
            </IconButton>
          </div>
        </div>

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
      </div>

      {/* CONTENT */}
      <div className="p-4 flex flex-col 2xl:space-y-3 xl:space-y-2">
        {/* META */}
        <div className="flex flex-col space-y-1">
          {!isEpisode && !sectionTitle?.includes("Ramadan") && (
            <>
              <div className="flex items-center justify-between gap-2 mb-0 w-full">
                <div className="text-white font-bold text-md md:text-md xl:text-lg 2xl:text-xl truncate text-start flex-1 min-w-0">
                  {title}
                </div>
                {views && (
                  <Views
                    view={views}
                    className="flex-shrink-0 whitespace-nowrap text-xs sm:text-sm"
                  />
                )}
              </div>
              {type === "PAYPERVIEWS" && isAuthenticated && (
                <div className="flex flex-col gap-1 mt-1">
                  <span
                    className={cn(
                      "text-sm font-bold flex items-center gap-2 text-green-600",
                    )}
                  >
                    <span className={cn("rounded-full p-1 bg-green-600")}>
                      {isRented ? (
                        <Check size={11} fill="#fff" />
                      ) : (
                        <Plus size={11} fill="#fff" />
                      )}
                    </span>{" "}
                    {isRented ? t("rented") : t("rent")}
                  </span>
                  {isRented && (
                    <div className="flex items-center gap-3 text-[10px] text-neutral-400 font-medium">
                      {expiryDate && (
                        <span className="flex items-center gap-1">
                          <Clock size={12} className="text-secondary" />
                          {t("expiresOn")}{" "}
                          {new Date(expiryDate).toLocaleString([], {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                      )}
                      {clicksLeft !== undefined && (
                        <span className="bg-neutral-800/50 px-2 py-0.5 rounded-full border border-white/5">
                          {clicksLeft} {t("clicksLeft")}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
              {type !== "PAYPERVIEWS" &&
                (type === "FREE" && mediaType === "movie" ? (
                  <span className="text-sm md:text-sm xl:text-md 2xl:text-base font-bold flex items-center gap-2 mt-1">
                    <span className="bg-primary rounded-full p-1">
                      <Sparkle size={11} fill="#fff" />
                    </span>{" "}
                    {t("free")}
                  </span>
                ) : freeEpisode && !isSubscribed ? (
                  <span className="text-sm md:text-sm xl:text-md 2xl:text-base font-bold flex items-center gap-2 mt-1">
                    <span className="bg-secondary rounded-full p-1">
                      <Sparkle size={11} fill="#fff" />
                    </span>{" "}
                    {t("oneEpisodeFree")}
                  </span>
                ) : (
                  <span className="text-sm md:text-sm xl:text-md 2xl:text-base font-bold flex items-center gap-2 mt-1">
                    <span className="bg-primary rounded-full p-1">
                      <Sparkle size={11} fill="#fff" />
                    </span>{" "}
                    {t("availableWithPremium")}
                  </span>
                ))}
            </>
          )}
          <div className="font-medium mt-0 text-sm md:text-sm xl:text-sm 2xl:text-md line-clamp-1 text-start capitalize flex items-center">
            {mediaType && !isEpisode && !sectionTitle?.includes("Ramadan") && (
              <span className="flex items-center">
                <span className="text-neutral-300">{mediaType}</span>
                <span className="text-primary font-bold text-2xl mx-2">•</span>
              </span>
            )}
            {genres &&
              !isEpisode &&
              !sectionTitle?.includes("Ramadan") &&
              genres.slice(0, 2).map((g: any, index: number, arr: any[]) => (
                <span
                  key={index}
                  className="flex items-center text-neutral-400 text-nowrap line-clamp-1"
                >
                  {g.name?.toLowerCase() || g}
                  {index < arr.length - 1 && (
                    <span className="text-primary mx-2 font-bold text-2xl">
                      •
                    </span>
                  )}
                </span>
              ))}
          </div>

          <div
            className={cn(
              "text-neutral-300 line-clamp-1 text-start py-0 capitalize",
              isEpisode || sectionTitle?.includes("Ramadan")
                ? "text-sm md:text-sm xl:text-md 2xl:text-base font-medium"
                : "text-sm md:text-sm xl:text-md 2xl:text-base font-bold border-l-4 border-primary pl-2",
            )}
          >
            {stripHtml(description)}
          </div>

          <div className="flex items-center justify-between gap-2 text-xs font-medium my-1">
            {/* <span className="flex items-center gap-1">
              <span className="text-neutral-400">{year}</span>
              <span className="border border-neutral-500 px-1 rounded text-xs text-neutral-400">
                HD
              </span>
            </span> */}

            {duration && (
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="rounded-full text-neutral-400 flex items-center gap-1">
                  <Clock size={14} />
                  <span className="text-nowrap">{duration}</span>
                </span>
              </div>
            )}
          </div>
        </div>
        {/* ACTIONS */}
        {actions && (
          <div className={`flex items-center justify-between ${!views && ""}`}>
            <div className="flex items-center gap-3">
              {!isEpisode && !sectionTitle?.includes("Ramadan") && (
                <>
                  {/* <IconButton
                    title={t("play")}
                    onClick={(e) => handlePlay(e)}
                    className=""
                  >
                    <Play size={15} fill="currentColor" />
                  </IconButton> */}
                  {!onDownload && (
                    <>
                      <IconButton
                        title={t("myList")}
                        onClick={(e) => handleToggleFavorite(e)}
                        disabled={toggleFavorite.isPending}
                        className=""
                      >
                        {isFavorite ? <Check size={15} /> : <Plus size={15} />}
                      </IconButton>
                      <div className="flex items-center gap-1">
                        <IconButton
                          title={t("like")}
                          className=""
                          onClick={(e) => handleToggleLike(e)}
                          disabled={toggleLikeMutation.isPending}
                          totalLikes={localLikesCount}
                        >
                          <Heart
                            size={15}
                            className={
                              isLiked ? "fill-primary text-primary" : ""
                            }
                          />
                        </IconButton>
                      </div>
                    </>
                  )}

                  <IconButton
                    title={t("share")}
                    className=""
                    onClick={(e) => {
                      e.stopPropagation();
                      track(AnalyticsEventType.clickShareMovie, id?.toString());
                      setIsShareModalOpen(true);
                    }}
                  >
                    <Share2 size={15} />
                  </IconButton>
                </>
              )}
              {(isEpisode || sectionTitle?.includes("Ramadan")) && (
                <IconButton
                  title={t("share")}
                  className=""
                  onClick={(e) => {
                    e.stopPropagation();
                    track(AnalyticsEventType.clickShareMovie, id?.toString());
                    setIsShareModalOpen(true);
                  }}
                >
                  <Share2 size={15} />
                </IconButton>
              )}
              {/* {onDownload &&
                !isEpisode &&
                !sectionTitle?.includes("Ramadan") && (
                  <IconButton
                    onClick={onDownload}
                    className=""
                    title={t("downloads")}
                  >
                    <Download size={15} />
                  </IconButton>
                )} */}
            </div>
          </div>
        )}
      </div>

      {isShareModalOpen && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          title={title || description || ""}
          url={`${window.location.origin}/movie/${id}`}
        />
      )}
    </motion.div>
  );
}
