"use client";

import { useState, useEffect, useRef } from "react";
import Footer from "@/components/Footer";
import { Header } from "@/components/HomePage/Header";
import { WatchlistMovieCard } from "@/components/Watchlist/WatchlistMovieCard";
import { useInfiniteFavorites } from "@/hooks/useWatchlist";
import { Loader2 } from "lucide-react";
import { formatViews } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ExpandedMovieCard } from "@/components/HomePage/ExpandedMovieCard";
import { MovieCardProps } from "@/components/HomePage/MovieCard";
import { useLanguage } from "@/context/LanguageContext";
import { useInView } from "react-intersection-observer";
import { useAnalytics } from "@/hooks/useAnalytics";
import { AnalyticsEventType } from "@/types/analytics";
import { BackgroundVideo } from "@/components/Common/BackgroundVideo";

export default function WatchlistPage() {
  const { t, isRTL } = useLanguage();
  const { track } = useAnalytics();
  const perPage = 12;
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteFavorites(perPage);

  const [hoveredItem, setHoveredItem] = useState<{
    data: MovieCardProps;
    rect: DOMRect;
    actions: boolean;
  } | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { ref, inView } = useInView();

  useEffect(() => {
    track(AnalyticsEventType.showMyListMovie);
  }, []);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleHover = (data: MovieCardProps, rect: DOMRect) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
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

  useEffect(() => {
    const handleScroll = () => {
      if (hoveredItem) {
        setHoveredItem(null);
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hoveredItem]);

  return (
    <section className="min-h-[100vh] flex flex-col">
      {/* <BackgroundVideo /> */}
      <Header />
      <div className="flex-grow px-4 sm:px-6 md:px-12 mb-12 mt-16 sm:mt-26">
        <h2 className="text-white text-xl sm:text-3xl font-bold">
          {t("watchlist")}
        </h2>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-12 h-12 text-teal-500 animate-spin" />
          </div>
        ) : isError ? (
          <div className="text-center py-20 text-zinc-400">
            <p>Failed to load watchlist. Please try again later.</p>
          </div>
        ) : data?.pages && data.pages.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-1 mt-8">
              <AnimatePresence mode="popLayout">
                {data.pages
                  .flatMap((page) => page.favorites)
                  .map((item, i) => (
                    <motion.div
                      key={item._id}
                      layout
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 20 }}
                      transition={{
                        duration: 0.3,
                        delay: (i % 12) * 0.05,
                      }}
                      className="relative"
                    >
                      <WatchlistMovieCard
                        id={item.movieId._id}
                        image={item.movieId.image || item.movieId.thumbnail}
                        duration={formatViews(item.movieId.runtime)}
                        // views={formatViews(item.watchTime)}
                        // endTime={item.endTime}
                        // type={item.ty}
                        // episodeId={item.episodeId}
                        title={item.movieId.title}
                        description={item.movieId.description}
                        year={item.movieId.year}
                        totalLikes={item.movieId.totalLikes}
                        likeStatus={item.movieId.likeStatus}
                        isFavorite={item.movieId.isFavorite}
                        onHover={handleHover}
                        onLeave={handleLeave}
                      />
                    </motion.div>
                  ))}
              </AnimatePresence>

              {/* EXPANDED CARD OVERLAY */}
              <AnimatePresence>
                {hoveredItem && (
                  <ExpandedMovieCard
                    key={hoveredItem.data.id || "expanded"}
                    {...hoveredItem.data}
                    rect={hoveredItem.rect}
                    actions={hoveredItem.actions}
                    onMouseEnter={handleKeepOpen}
                    onLeave={handleExpandedLeave}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Infinite Scroll Trigger */}
            <div ref={ref} className="flex justify-center py-8">
              {isFetchingNextPage && (
                <Loader2 className="w-8 h-8 animate-spin text-[#25A4AD]" />
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-20 text-zinc-400">
            <p className="text-xl">Your watchlist is empty.</p>
            <p className="mt-2">Start adding movies to your watchlist!</p>
          </div>
        )}
      </div>
    </section>
  );
}
