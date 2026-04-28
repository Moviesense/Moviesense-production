import {
  ArrowDown,
  Eye,
  ChevronLeft,
  ChevronRight,
  Play,
  Share,
  Clock,
} from "lucide-react";
import React, { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { movieService } from "@/services/movieService";
import { VideoPlayer } from "@/components/Common/VideoPlayer";
import { Loader2 } from "lucide-react";
import { formatViews } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Views } from "../Common/Views";
import { useAuth } from "@/context/AuthContext";
import { SubscriptionModal } from "../Common/SubscriptionModal";
import { Episode as MovieEpisode } from "@/types/movie";
import { MovieCard, MovieCardProps } from "../HomePage/MovieCard";
import { ExpandedMovieCard } from "../HomePage/ExpandedMovieCard";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { IconButton } from "../Common/IconButton";
import { useAnalytics } from "@/hooks/useAnalytics";
import { AnalyticsEventType } from "@/types/analytics";

interface Episode extends MovieEpisode {
  id: number;
  title: string;
}

interface Season {
  season: number;
  episodes: Episode[];
  type: string;
  _id?: string;
  isRented?: boolean;
  ppvCountryPrices?: { price: number };
  expiryDate?: string;
  clicksLeft?: number;
}

interface SeasonsAndEpisodesProps {
  seasons: Season[];
  movieId: string;
  isSubscribed?: boolean;
  autoPlayEpisodeId?: string;
  autoPlaySeason?: number;
  onRefresh?: () => void;
}

export function SeasonsAndEpisodes({
  seasons,
  movieId,
  isSubscribed = false,
  autoPlayEpisodeId,
  autoPlaySeason,
  onRefresh,
}: SeasonsAndEpisodesProps) {
  const router = useRouter();
  const { isRTL, t } = useLanguage();
  const { track } = useAnalytics();
  const [openSeason, setOpenSeason] = useState<number | null>(
    autoPlaySeason || seasons[0]?.season || null,
  );
  const [loadedSeasons, setLoadedSeasons] = useState<Record<number, Episode[]>>(
    {},
  );
  const [isSeasonDropdownOpen, setIsSeasonDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [loadingSeason, setLoadingSeason] = useState<number | null>(null);
  const [activeVideo, setActiveVideo] = useState<{
    url: string;
    title: string;
    episodeId: string;
    index: number;
    episodes: Episode[];
    introStartTime?: number;
    introEndTime?: number;
    signature?: string;
    drmLicenseToken?: string;
    drm?: boolean;
    playbackId?: string;
    adUrl?: string;
    adDetails?: any;
    googleAd?: boolean;
    seasonNumber: number;
  } | null>(null);

  const [hoveredItem, setHoveredItem] = useState<{
    data: MovieCardProps;
    rect: DOMRect;
    actions: boolean;
  } | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [visible, setVisible] = useState(5);
  const [gap, setGap] = useState(12);
  const [isHovered, setIsHovered] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [isPlayLoading, setIsPlayLoading] = useState<string | null>(null);
  const [isRentLoading, setIsRentLoading] = useState<string | null>(null);
  const { isAuthenticated, isSubscribed: authIsSubscribed } = useAuth();

  const getVisibleCount = (width: number) => {
    if (width >= 1440) return 6;
    if (width >= 1024) return 4;
    if (width >= 768) return 3;
    return 1;
  };

  useEffect(() => {
    const update = () => {
      const width = window.innerWidth;
      setVisible(getVisibleCount(width));
      setGap(width >= 640 ? 12 : 8);
    };

    update();
    window.addEventListener("resize", update);

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsSeasonDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("resize", update);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);

  useEffect(() => {
    if (
      openSeason &&
      (!loadedSeasons[openSeason] || loadedSeasons[openSeason].length === 0)
    ) {
      const fetchEpisodes = async () => {
        try {
          setLoadingSeason(openSeason);
          const response = await movieService.getSeasonEpisodes(
            movieId,
            openSeason,
          );
          const list = response.episode || response.episodes;
          if (response.status && list) {
            const newEpisodes = list.map((ep: any) => ({
              ...ep,
              id: ep.episodeNumber,
              title: ep.name,
            }));
            setLoadedSeasons((prev) => ({
              ...prev,
              [openSeason]: newEpisodes,
            }));
          }
        } catch (error) {
          console.error("Error fetching season episodes:", error);
        } finally {
          setLoadingSeason(null);
        }
      };
      fetchEpisodes();
    }
  }, [openSeason, movieId]);

  useEffect(() => {
    if (autoPlaySeason && openSeason !== autoPlaySeason) {
      setOpenSeason(autoPlaySeason);
    }
  }, [autoPlaySeason]);

  useEffect(() => {
    if (autoPlayEpisodeId && autoPlaySeason && !hasAutoPlayed) {
      setHasAutoPlayed(true);

      const fireAutoPlay = async () => {
        if (openSeason !== autoPlaySeason) {
          setOpenSeason(autoPlaySeason);
        }

        let targetEpisodes = loadedSeasons[autoPlaySeason];
        if (!targetEpisodes || targetEpisodes.length === 0) {
          try {
            setLoadingSeason(autoPlaySeason);
            const response = await movieService.getSeasonEpisodes(
              movieId,
              autoPlaySeason,
            );
            const list = response.episode || response.episodes;
            if (response.status && list) {
              targetEpisodes = list.map((ep: any) => ({
                ...ep,
                id: ep.episodeNumber,
                title: ep.name,
              }));
              setLoadedSeasons((prev) => ({
                ...prev,
                [autoPlaySeason]: targetEpisodes,
              }));
            }
          } catch (e) {
            console.error("Error auto-fetching season", e);
          } finally {
            setLoadingSeason(null);
          }
        }

        if (targetEpisodes && targetEpisodes.length > 0) {
          const index = targetEpisodes.findIndex(
            (ep) => ep._id === autoPlayEpisodeId,
          );
          if (index >= 0) {
            const seasonData = seasons.find((s) => s.season === autoPlaySeason);
            const ep = targetEpisodes[index];
            handlePlayEpisode(
              ep,
              index,
              targetEpisodes,
              seasonData?.type || "",
              autoPlaySeason,
            );
          }
        }
      };

      fireAutoPlay();
    }
  }, [
    autoPlayEpisodeId,
    autoPlaySeason,
    hasAutoPlayed,
    loadedSeasons,
    movieId,
    seasons,
  ]);

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  }, []);

  useEffect(() => {
    checkScroll();
  }, [loadedSeasons, openSeason, visible, gap, checkScroll]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
      return () => {
        el.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }
  }, [checkScroll]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo =
        direction === "left"
          ? scrollLeft - clientWidth
          : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  const handleHover = (data: MovieCardProps, rect: DOMRect) => {
    if (window.innerWidth < 1024) return;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    console.log(data);
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredItem({ data, rect, actions: true });
    }, 10);
  };

  const handleLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredItem(null);
    }, 10);
  };

  const handleKeepOpen = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
  };

  const handleExpandedLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredItem(null);
    }, 10);
  };

  // Initialize loadedSeasons with the episodes passed in props (usually season 1)
  React.useEffect(() => {
    const initialLoaded: Record<number, Episode[]> = {};
    seasons.forEach((s) => {
      if (s.episodes.length > 0) {
        initialLoaded[s.season] = s.episodes;
      }
    });
    setLoadedSeasons((prev) => ({ ...prev, ...initialLoaded }));
  }, [seasons]);

  const handleSeasonClick = (seasonNumber: number) => {
    setOpenSeason(seasonNumber);
  };

  const handleRentSeason = async (season: Season) => {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }
    if (!season._id) return;

    try {
      setIsRentLoading(season._id);
      const response = await movieService.requestPPVLink({
        movieId,
        seasonId: season._id,
        successUrl:
          window.location.origin +
          window.location.pathname +
          `?payment=success&season=${season.season}`,
        cancelUrl:
          window.location.origin +
          window.location.pathname +
          `?payment=cancel&season=${season.season}`,
      });
      if (response.status && response.checkout?.url) {
        window.location.href = response.checkout.url;
      } else {
        // toast
      }
    } catch (error) {
      console.error("Error requesting PPV link for season:", error);
    } finally {
      setIsRentLoading(null);
    }
  };

  const handlePlayEpisode = async (
    episode: Episode,
    index: number,
    episodes: Episode[],
    type: string,
    seasonNumber: number,
  ) => {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }
    track(AnalyticsEventType.clickEpisode, episode._id);

    const effectiveIsSubscribed = authIsSubscribed || isSubscribed;

    const seasonData = seasons.find((s) => s.season === seasonNumber);
    const isSeasonRented = seasonData?.isRented;
    const isSeasonPPV =
      type === "PAYPERVIEWS" || seasonData?.type === "PAYPERVIEWS";

    if (episode.videoType === 0 && episode.link) {
      if (isSeasonPPV && !isSeasonRented) {
        // Option to handle: either show buy button or just return
        // For now, if we reach here, it means they clicked play on a non-rented season episode
        handleRentSeason(seasonData!);
        return;
      }
      if (!effectiveIsSubscribed && type === "PREMIUM") {
        setShowSubscriptionModal(true);
        return;
      }
      setActiveVideo({
        url: episode.link || "",
        title: episode.title,
        episodeId: episode._id,
        index,
        episodes,
        seasonNumber,
      });
    } else if (episode.hlsFileName) {
      try {
        setIsPlayLoading(episode._id);
        console.log(
          "Shows: episode.customAd:",
          episode.customAd,
          "adDetails:",
          episode.adDetails,
        );
        let adSignedUrl = "";
        console.log(
          "SeasonsAndEpisodes: customAd:",
          episode.customAd,
          "adDetails:",
          episode.adDetails,
        );
        if (episode.customAd && episode.adDetails?.hlsFileName) {
          console.log(
            "SeasonsAndEpisodes: Fetching ad signed URL for:",
            episode.adDetails.hlsFileName,
          );
        }
        const [videoResponse, adResponse] = await Promise.all([
          movieService.getSignedUrl(
            episode.hlsFileName,
            episode.drmEnabled || false,
          ),
          episode.customAd && episode.adDetails?.hlsFileName
            ? movieService.getSignedUrl(
                episode.adDetails.hlsFileName,
                episode.adDetails.drmEnabled || false,
              )
            : Promise.resolve(null),
        ]);
        if (onRefresh) onRefresh();

        const response = videoResponse;

        if (isSeasonPPV && !isSeasonRented) {
          handleRentSeason(seasonData!);
          return;
        }

        if (
          response.isPremiumRequired ||
          (response.type === "PREMIUM" && !effectiveIsSubscribed)
        ) {
          setShowSubscriptionModal(true);
          return;
        }

        if (response.signedVideoUrl) {
          setActiveVideo({
            url: response.signedVideoUrl,
            title: episode.title,
            episodeId: episode._id,
            index,
            episodes,
            introStartTime: response.introStartTime,
            introEndTime: response.introEndTime,
            signature: response.signature,
            drmLicenseToken: response.drmLicenseToken,
            drm: response.drm,
            playbackId: episode.hlsFileName,
            adUrl: adResponse?.signedVideoUrl,
            adDetails: episode.adDetails,
            googleAd: episode.GoogleAd,
            seasonNumber,
          });
        }
      } catch (error) {
        console.error("Error fetching signed URL for episode:", error);
      } finally {
        setIsPlayLoading(null);
      }
    }
  };

  const handleCrossSeasonNext = async () => {
    if (!activeVideo) return;
    const currentSeasonIndex = seasons.findIndex(
      (s) => s.season === activeVideo.seasonNumber,
    );
    if (currentSeasonIndex >= 0 && currentSeasonIndex < seasons.length - 1) {
      const nextSeason = seasons[currentSeasonIndex + 1];
      let nextEpisodes = loadedSeasons[nextSeason.season];

      if (!nextEpisodes || nextEpisodes.length === 0) {
        try {
          setLoadingSeason(nextSeason.season);
          const response = await movieService.getSeasonEpisodes(
            movieId,
            nextSeason.season,
          );
          const list = response.episode || response.episodes;
          if (response.status && list) {
            nextEpisodes = list.map((ep: any) => ({
              ...ep,
              id: ep.episodeNumber,
              title: ep.name,
            }));
            setLoadedSeasons((prev) => ({
              ...prev,
              [nextSeason.season]: nextEpisodes,
            }));
          }
        } catch (e) {
        } finally {
          setLoadingSeason(null);
        }
      }

      if (nextEpisodes && nextEpisodes.length > 0) {
        setOpenSeason(nextSeason.season);
        handlePlayEpisode(
          nextEpisodes[0],
          0,
          nextEpisodes,
          nextSeason.type,
          nextSeason.season,
        );
      }
    }
  };

  const handleCrossSeasonPrev = async () => {
    if (!activeVideo) return;
    const currentSeasonIndex = seasons.findIndex(
      (s) => s.season === activeVideo.seasonNumber,
    );
    if (currentSeasonIndex > 0) {
      const prevSeason = seasons[currentSeasonIndex - 1];
      let prevEpisodes = loadedSeasons[prevSeason.season];

      if (!prevEpisodes || prevEpisodes.length === 0) {
        try {
          setLoadingSeason(prevSeason.season);
          const response = await movieService.getSeasonEpisodes(
            movieId,
            prevSeason.season,
          );
          const list = response.episode || response.episodes;
          if (response.status && list) {
            prevEpisodes = list.map((ep: any) => ({
              ...ep,
              id: ep.episodeNumber,
              title: ep.name,
            }));
            setLoadedSeasons((prev) => ({
              ...prev,
              [prevSeason.season]: prevEpisodes,
            }));
          }
        } catch (e) {
        } finally {
          setLoadingSeason(null);
        }
      }

      if (prevEpisodes && prevEpisodes.length > 0) {
        setOpenSeason(prevSeason.season);
        const lastIndex = prevEpisodes.length - 1;
        handlePlayEpisode(
          prevEpisodes[lastIndex],
          lastIndex,
          prevEpisodes,
          prevSeason.type,
          prevSeason.season,
        );
      }
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-start relative z-[10]">
        <div className="relative" ref={dropdownRef}>
          <div className="flex items-center gap-y-2 gap-x-2 sm:gap-4">
            <button
              onClick={() => setIsSeasonDropdownOpen(!isSeasonDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-white hover:border-neutral-700 transition-all text-sm sm:text-base font-medium min-w-[140px] justify-between cursor-pointer"
            >
              <div className="flex flex-col items-start">
                <span>
                  {t("season") || "Season"}{" "}
                  {String(openSeason || seasons[0]?.season || 1).padStart(
                    2,
                    "0",
                  )}
                </span>
              </div>
              <ArrowDown
                className={cn(
                  "w-4 h-4 transition-transform",
                  isSeasonDropdownOpen ? "rotate-180" : "",
                )}
              />
            </button>

            {seasons.find((s) => s.season === openSeason)?.type ===
              "PAYPERVIEWS" &&
              isAuthenticated && (
                <div className="flex flex-col items-start gap-1 ml-2">
                  <span className="flex items-center gap-2">
                    <span className={cn("text-sm font-bold text-green-600")}>
                      {seasons.find((s) => s.season === openSeason)?.isRented
                        ? t("rented")
                        : `${t("rent")} for $${seasons.find((s) => s.season === openSeason)?.ppvCountryPrices?.price || 0}`}
                    </span>
                    {seasons.find((s) => s.season === openSeason)
                      ?.clicksLeft !== undefined && (
                      <span className="bg-neutral-800/50 px-2 py-0.5 rounded-full border border-white/5 text-[10px] block sm:hidden">
                        {
                          seasons.find((s) => s.season === openSeason)
                            ?.clicksLeft
                        }{" "}
                        {t("clicksLeft")}
                      </span>
                    )}
                  </span>
                  {seasons.find((s) => s.season === openSeason)?.isRented && (
                    <div className="flex items-center gap-2 text-[10px] sm:text-xs text-neutral-400 font-medium">
                      {seasons.find((s) => s.season === openSeason)
                        ?.expiryDate && (
                        <span className="flex items-center gap-1">
                          <Clock size={12} className="text-secondary" />
                          {t("expiresOn")}{" "}
                          {new Date(
                            seasons.find((s) => s.season === openSeason)!
                              .expiryDate!,
                          ).toLocaleString([], {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                      )}
                      {seasons.find((s) => s.season === openSeason)
                        ?.clicksLeft !== undefined && (
                        <span className="bg-neutral-800/50 px-2 py-0.5 rounded-full border border-white/5 text-[10px] hidden sm:block">
                          {
                            seasons.find((s) => s.season === openSeason)
                              ?.clicksLeft
                          }{" "}
                          {t("clicksLeft")}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            {/* Buy Button for Season */}
            {seasons.find((s) => s.season === openSeason)?.type ===
              "PAYPERVIEWS" &&
              isAuthenticated &&
              !seasons.find((s) => s.season === openSeason)?.isRented && (
                <button
                  onClick={() => {
                    const s = seasons.find((s) => s.season === openSeason);
                    if (s) handleRentSeason(s);
                  }}
                  disabled={!!isRentLoading}
                  className="ml-0 sm:ml-4 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full text-xs sm:text-sm font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {isRentLoading ===
                  seasons.find((s) => s.season === openSeason)?._id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    t("rentNow")
                  )}
                </button>
              )}
          </div>

          <AnimatePresence>
            {isSeasonDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-full min-w-[140px] bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl overflow-hidden z-50 text-sm sm:text-base"
              >
                {seasons.map((season) => (
                  <button
                    key={season.season}
                    onClick={() => {
                      handleSeasonClick(season.season);
                      setIsSeasonDropdownOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-4 py-3 transition-colors hover:bg-neutral-800 cursor-pointer",
                      openSeason === season.season
                        ? "text-primary font-bold bg-neutral-800/50"
                        : "text-neutral-300",
                    )}
                  >
                    <div className="flex flex-col">
                      <span>
                        {t("season") || "Season"}{" "}
                        {String(season.season).padStart(2, "0")}
                      </span>
                      {season.type === "PAYPERVIEWS" && isAuthenticated && (
                        <div className="flex flex-col items-start gap-1">
                          <span
                            className={cn(
                              "text-[10px] sm:text-[11px] text-green-600",
                            )}
                          >
                            {season.isRented
                              ? t("rented")
                              : `${t("rent")} for $${season.ppvCountryPrices?.price || 0}`}
                          </span>
                          {/* {season.isRented && (
                            <div className="flex items-center gap-2 text-[9px] text-neutral-400 font-medium scale-90 origin-left">
                              {season.expiryDate && (
                                <span className="flex items-center gap-1">
                                  <Clock size={10} className="text-secondary" />
                                  {new Date(season.expiryDate).toLocaleString(
                                    [],
                                    { dateStyle: "short", timeStyle: "short" },
                                  )}
                                </span>
                              )}
                              {season.clicksLeft !== undefined && (
                                <span className="bg-neutral-800 px-1 py-0.5 rounded-full border border-white/5">
                                  {season.clicksLeft} {t("clicksLeft")}
                                </span>
                              )}
                            </div>
                          )} */}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {seasons.map((season) => {
        const isOpen = openSeason === season.season;
        const episodes = loadedSeasons[season.season] || [];
        const isLoading = loadingSeason === season.season;

        if (!isOpen) return null;

        return (
          <div
            key={season.season}
            className="relative group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div ref={scrollRef} className="">
              <div className="flex gap-1 flex-wrap">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8 w-full">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                ) : episodes.length > 0 ? (
                  episodes.map((ep, index) => (
                    <motion.div
                      key={ep._id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.4,
                        delay: (index % visible) * 0.1,
                      }}
                      className="flex-shrink-0 relative"
                      style={{
                        width: `calc((100% - ${(visible - 1) * gap}px) / ${visible})`,
                      }}
                    >
                      <MovieCard
                        id={ep._id}
                        image={ep.image}
                        title={ep.title}
                        description={ep.description}
                        views={ep.view}
                        onClick={() =>
                          handlePlayEpisode(
                            ep,
                            index,
                            episodes,
                            season.type,
                            season.season,
                          )
                        }
                        onHover={handleHover}
                        onLeave={handleLeave}
                        episodeNumber={ep.episodeNumber}
                        type={ep.type || season.type}
                        isRented={ep.isRented || season.isRented}
                        expiryDate={ep.expiryDate || season.expiryDate}
                        clicksLeft={ep.clicksLeft ?? season.clicksLeft}
                        footer={
                          <div className="p-2 px-4 flex items-center justify-between absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/80 to-transparent">
                            <span className="text-white font-bold text-xs sm:text-sm 2xl:text-base">
                              {t("episode")} {ep.episodeNumber}
                            </span>
                            <div className="flex items-center gap-2">
                              {isPlayLoading === ep._id ? (
                                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 text-primary animate-spin" />
                              ) : (
                                <IconButton
                                  className="w-7 h-7"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePlayEpisode(
                                      ep,
                                      index,
                                      episodes,
                                      season.type,
                                      season.season,
                                    );
                                  }}
                                >
                                  <Play
                                    size={14}
                                    className="text-white fill-white"
                                  />
                                </IconButton>
                              )}
                            </div>
                          </div>
                        }
                      />
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center text-neutral-400 py-4 w-full">
                    {t("noEpisodesFound")}
                  </div>
                )}
              </div>
            </div>

            {/* EXPANDED CARD OVERLAY */}
            <AnimatePresence>
              {hoveredItem && (
                <ExpandedMovieCard
                  key={hoveredItem.data.id || "expanded"}
                  {...hoveredItem.data}
                  actions={hoveredItem.actions}
                  rect={hoveredItem.rect}
                  onMouseEnter={handleKeepOpen}
                  onLeave={handleExpandedLeave}
                  isEpisode={true}
                />
              )}
            </AnimatePresence>

            {/* LEFT ARROW */}
            <button
              className={cn(
                "absolute top-0 bottom-0 start-0 z-[60] w-12 flex items-center justify-center bg-black/50 transition-opacity duration-300 hover:bg-black/70 cursor-pointer rounded-tr-lg rounded-br-lg",
                isHovered && (isRTL ? canScrollRight : canScrollLeft)
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none",
              )}
            >
              {isRTL ? (
                <ChevronRight className="w-8 h-8 text-white" />
              ) : (
                <ChevronLeft className="w-8 h-8 text-white" />
              )}
            </button>

            {/* RIGHT ARROW */}
            <button
              onClick={() => scroll("right")}
              className={cn(
                "absolute top-0 bottom-0 end-0 z-[60] w-12 flex items-center justify-center bg-black/50 transition-opacity duration-300 hover:bg-black/70 cursor-pointer rounded-tl-lg rounded-bl-lg",
                isHovered && (isRTL ? canScrollLeft : canScrollRight)
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none",
              )}
            >
              {isRTL ? (
                <ChevronLeft className="w-8 h-8 text-white" />
              ) : (
                <ChevronRight className="w-8 h-8 text-white" />
              )}
            </button>
          </div>
        );
      })}

      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />

      {activeVideo && (
        <VideoPlayer
          key={activeVideo.episodeId}
          url={activeVideo.url}
          title={activeVideo.title}
          movieId={movieId}
          viewedContentId={activeVideo.episodeId}
          type="tv"
          isEpisode={true}
          episodes={activeVideo.episodes as any}
          initialEpisodeIndex={activeVideo.index}
          introStartTime={activeVideo.introStartTime}
          introEndTime={activeVideo.introEndTime}
          signature={activeVideo.signature}
          drmLicenseToken={activeVideo.drmLicenseToken}
          drm={activeVideo.drm}
          playbackId={activeVideo.playbackId}
          adUrl={activeVideo.adUrl}
          adDetails={activeVideo.adDetails}
          googleAd={activeVideo.googleAd}
          hasNextSeasonEpisode={
            seasons.findIndex((s) => s.season === activeVideo.seasonNumber) <
            seasons.length - 1
          }
          hasPrevSeasonEpisode={
            seasons.findIndex((s) => s.season === activeVideo.seasonNumber) > 0
          }
          onNextEpisodeRequest={handleCrossSeasonNext}
          onPrevEpisodeRequest={handleCrossSeasonPrev}
          onClose={() => {
            setActiveVideo(null);
            router.replace(window.location.pathname);
          }}
        />
      )}
    </section>
  );
}
