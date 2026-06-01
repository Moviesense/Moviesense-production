"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, Loader2, Play } from "lucide-react";
import { MovieCard, MovieCardProps } from "./MovieCard";
import { ExpandedMovieCard } from "./ExpandedMovieCard";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { IconButton } from "../Common/IconButton";

function getVisibleCount(width: number, widgetType?: number) {
  // Large landscape thumbnails — fewer per row so each is bigger
  if (widgetType === 4) {
    if (width >= 1440) return 4;
    if (width >= 1280) return 3;
    if (width >= 768) return 3;
    return 1.5;
  }
  // Top 10 (type 2), small landscape (type 3), and default
  if (width >= 1440) return 5;
  if (width >= 1280) return 4;
  if (width >= 768) return 5;
  return 2.2;
}

export function MovieRow({
  title,
  items,
  hideTitle = false,
  widgetType,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
}: {
  title: string;
  items: MovieCardProps[];
  hideTitle?: boolean;
  widgetType?: number;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}) {
  const { isRTL, t } = useLanguage();
  const router = useRouter();
  const [visible, setVisible] = useState(5);
  const [gap, setGap] = useState(12);
  const [hoveredItem, setHoveredItem] = useState<{
    data: MovieCardProps;
    rect: DOMRect;
    actions?: boolean;
  } | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const handleHover = (data: MovieCardProps, rect: DOMRect) => {
    if (window.innerWidth < 1280) return;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredItem({ data, rect, actions: true });
    }, 10); // Delay before showing expanded card
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

  const scrollToPage = (pageIndex: number) => {
    if (scrollRef.current && totalPages > 1) {
      const { scrollWidth, clientWidth } = scrollRef.current;
      const maxScroll = scrollWidth - clientWidth;
      const targetScroll = (pageIndex / (totalPages - 1)) * maxScroll;
      const scrollTo = isRTL ? -targetScroll : targetScroll;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const update = () => {
      const width = window.innerWidth;
      setVisible(getVisibleCount(width, widgetType));
      setGap(width >= 640 ? 12 : 8);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [widgetType]);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      if (clientWidth === 0) return;

      setCanScrollLeft(isRTL ? scrollLeft < -5 : scrollLeft > 5);
      setCanScrollRight(
        isRTL
          ? scrollLeft > -(scrollWidth - clientWidth - 5)
          : scrollLeft < scrollWidth - clientWidth - 5,
      );

      const pages = Math.max(1, Math.ceil(items.length / visible));
      setTotalPages(pages);

      if (pages > 1) {
        const maxScroll = scrollWidth - clientWidth;
        const currentRatio = Math.abs(scrollLeft) / maxScroll;
        setCurrentPage(Math.round(currentRatio * (pages - 1)));
      } else {
        setCurrentPage(0);
      }

      // Infinite scroll: prefetch the next page once we approach the end.
      // RTL scrollLeft is negative, so normalise the distance for both directions.
      const distanceToEnd = isRTL
        ? scrollLeft + (scrollWidth - clientWidth)
        : scrollWidth - clientWidth - scrollLeft;
      if (onLoadMore && hasMore && !isLoadingMore && distanceToEnd < clientWidth) {
        onLoadMore();
      }
    }
  }, [isRTL, items.length, visible, onLoadMore, hasMore, isLoadingMore]);

  useEffect(() => {
    checkScroll();
  }, [items, visible, gap, checkScroll]);

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
    <section
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4 xl:mb-6 ps-2 sm:ps-6 lg:ps-10 xl:ps-12 pe-4 sm:pe-6 lg:pe-10 xl:pe-12">
        {!hideTitle && (
          <h2 className="text-white text-xs sm:text-lg xl:text-xl 2xl:text-2xl font-bold mb-0">
            {/* <h2 className="text-white carousel-heading mb-0 font-bold"></h2> */}
            {title}
          </h2>
        )}

        {/* DOTS */}
        {isHovered && totalPages > 1 && (
          <div className="flex items-center gap-1.5 sm:gap-2 z-[70] pointer-events-auto">
            {Array.from({ length: totalPages }).map((_, index) => (
              <div
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  scrollToPage(index);
                }}
                className={`h-[2px] sm:h-1 w-3 sm:w-6 rounded-full cursor-pointer transition-all border-none shadow-none p-0 ${
                  currentPage === index ? "bg-primary" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* CAROUSEL */}
      <div className="relative group">
        <div
          ref={scrollRef}
          className="overflow-x-auto no-scrollbar scroll-smooth overflow-y-hidden"
        >
          <div
            className="flex ps-2 sm:ps-6 lg:ps-10 xl:ps-12 gap-1 pb-8 xl:pb-4"
            // style={{ gap: `${gap}px` }}
          >
            {items.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: (i % visible) * 0.1 }}
                className="flex-shrink-0 relative"
                style={{
                  width: `calc((100% - ${(visible - 1) * gap}px) / ${visible})`,
                }}
              >
                <MovieCard
                  id={item.id || i}
                  {...item}
                  widgetType={widgetType}
                  rank={widgetType === 2 ? i + 1 : undefined}
                  sectionTitle={title}
                  onHover={handleHover}
                  onLeave={handleLeave}
                  onClick={() => {
                    router.push(`/movie/${item.id}`);
                  }}
                  footer={
                    // bg-gradient-to-t from-background/80 to-transparent
                    <div className="p-1 px-2 sm:p-3 sm:px-4 flex items-center justify-between absolute bottom-0 left-0 right-0">
                      {item.episodeNumber && (
                        <span className="text-white font-bold text-xs sm:text-sm 2xl:text-base">
                          {t("episode")} {item.episodeNumber}
                        </span>
                      )}
                      <div className="flex items-center gap-2 ml-auto">
                        {/* {isPlayLoading === item._id ? (
                                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 text-primary animate-spin" />
                              ) : ( */}
                        <IconButton
                          className="w-6 h-6 sm:w-7 sm:h-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            const url = `/movie/${item.id}?play=true${item.episodeId ? `&episodeId=${item.episodeId}` : ""}${item.endTime ? `&startTime=${item.endTime / 1000}` : ""}`;
                            router.push(url);
                          }}
                        >
                          <Play size={14} className="text-white fill-white" />
                        </IconButton>
                        {/* )} */}
                      </div>
                    </div>
                  }
                />
              </motion.div>
            ))}

            {isLoadingMore && (
              <div className="flex-shrink-0 flex items-center justify-center px-6 sm:px-8">
                <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-primary animate-spin" />
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
            />
          )}
        </AnimatePresence>

        {/* LEFT ARROW */}
        <button
          onClick={() => scroll("left")}
          className={`hidden xl:block absolute top-0 bottom-0 start-0 z-[60] w-12  flex items-center justify-center bg-black/70 transition-opacity duration-300 hover:bg-black/80 cursor-pointer rounded-se-lg rounded-ee-lg ${
            isHovered && (isRTL ? canScrollRight : canScrollLeft)
              ? "opacity-100"
              : "opacity-0 pointer-events-none"
          } ${widgetType === 4 ? "xl:h-[92%]" : "xl:h-[82%]"}`}
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
          className={`hidden xl:block absolute top-0 bottom-0 end-0 z-[60] w-12 flex items-center justify-center bg-black/70 transition-opacity duration-300 hover:bg-black/80 cursor-pointer rounded-ss-lg rounded-es-lg ${
            isHovered && (isRTL ? canScrollLeft : canScrollRight)
              ? "opacity-100"
              : "opacity-0 pointer-events-none"
          } ${widgetType === 4 ? "xl:h-[92%]" : "xl:h-[82%]"}`}
        >
          {isRTL ? (
            <ChevronLeft className="w-8 h-8 text-white" />
          ) : (
            <ChevronRight className="w-8 h-8 text-white" />
          )}
        </button>
      </div>
    </section>
  );
}
