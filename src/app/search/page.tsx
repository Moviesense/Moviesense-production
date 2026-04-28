"use client";
import { MovieCard, MovieCardProps } from "@/components/HomePage/MovieCard";
import { ExpandedMovieCard } from "@/components/HomePage/ExpandedMovieCard";
import {
  Clock,
  Eye,
  Mic,
  Search,
  SlidersVertical,
  X,
  Loader2,
  Play,
} from "lucide-react";
import { toast } from "@/context/ToastContext";
import React, { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { Filter, FilterSelections } from "@/components/Search/Filter";
import { BackButton } from "@/components/Common/BackButton";
import { useSearchMovies, useGenres, useLanguages } from "@/hooks/useMovie";
import { useLanguage } from "@/context/LanguageContext";
import { useInView } from "react-intersection-observer";
import { useToast } from "@/context/ToastContext";
import { motion, AnimatePresence } from "framer-motion";
import debounce from "lodash.debounce";
import { Loader } from "@/components/Common/Loader";
import { IconButton } from "@/components/Common/IconButton";
import { useAnalytics } from "@/hooks/useAnalytics";
import { AnalyticsEventType } from "@/types/analytics";
import { BackgroundVideo } from "@/components/Common/BackgroundVideo";

const MEDIA_TYPES = [
  { id: "movie", name: "Movies" },
  { id: "series", name: "Series" },
  { id: "tv", name: "TV Shows" },
];

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const highlightText = (text: string, highlight: string) => {
  if (!highlight.trim()) {
    return text;
  }
  const regex = new RegExp(`(${highlight})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span key={i} className="text-white font-bold text-sm sm:text-md">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
};

export default function SearchInput() {
  const router = useRouter();
  const { track } = useAnalytics();
  const [value, setValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selections, setSelections] = useState<FilterSelections>({});
  const [hoveredItem, setHoveredItem] = useState<{
    data: MovieCardProps;
    rect: DOMRect;
  } | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    track(AnalyticsEventType.openSearchMovie);
  }, []);

  const { ref, inView } = useInView();

  const { data: genresData } = useGenres();
  const { data: languagesData } = useLanguages();

  const debouncedSearch = useMemo(
    () =>
      debounce((val: string) => {
        setDebouncedValue(val);
      }, 500),
    [],
  );

  useEffect(() => {
    debouncedSearch(value);
    if (value) {
      track(AnalyticsEventType.searchByQuery);
    }
    return () => debouncedSearch.cancel();
  }, [value, debouncedSearch]);

  const { showToast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setValue(transcript);
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
        if (event.error === "not-allowed") {
          showToast("Microphone access denied", "error");
        } else {
          showToast("Voice search failed. Please try again.", "error");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [showToast]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      showToast("Voice search is not supported in this browser", "error");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error("Failed to start recognition", error);
        setIsListening(false);
      }
    }
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useSearchMovies({
    search: debouncedValue,
    genre: selections.genre,
    language: selections.language,
    year: selections.year,
    media_type: selections.media_type,
    limit: 12,
  });

  const { t } = useLanguage();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleHover = (data: MovieCardProps, rect: DOMRect) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredItem({ data, rect });
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

  const onChange = (val: string) => {
    setValue(val);
  };

  const handleSelectFilter = (newSelections: FilterSelections) => {
    setSelections(newSelections);
  };

  const removeFilter = (key: keyof FilterSelections) => {
    const newSelections = { ...selections };
    delete newSelections[key];
    setSelections(newSelections);
  };

  const clearAll = () => {
    setSelections({});
  };

  const activeFilters = Object.entries(selections).filter(
    ([_, val]) => !!val,
  ) as [keyof FilterSelections, string][];

  const getFilterDisplayName = (key: string, id: string) => {
    if (key === "genre")
      return genresData?.genre.find((g) => g._id === id)?.name || id;
    if (key === "language")
      return languagesData?.languages.find((l) => l._id === id)?.name || id;
    if (key === "media_type")
      return MEDIA_TYPES.find((m) => m.id === id)?.name || id;
    return id;
  };

  const movies = data?.pages.flatMap((page) => page.data) || [];

  return (
    <section className="w-full min-h-screen flex flex-col">
      {/* <BackgroundVideo /> */}
      <div className="flex flex-col px-4 sm:px-6 md:px-12 mt-4 sm:mt-8 gap-4 sm:gap-6">
        <div className="flex relative items-center gap-2 justify-center">
          <BackButton className="absolute left-0 z-10" size={24} />
          <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-lg flex flex-1 ml-8 xs:ml-0">
            <span className="absolute start-4 sm:start-7 top-1/2 -translate-y-1/2 text-neutral-400">
              <Search size={20} />
            </span>

            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="
            w-full h-12 sm:h-14 ps-12 sm:ps-22 pe-24 sm:pe-32
            bg-background text-white
            rounded-md
            placeholder:text-neutral-400
            focus:outline-none
            text-sm sm:text-base
          "
            />

            <div className="flex items-center gap-1 sm:gap-2">
              {value && (
                <button
                  type="button"
                  onClick={() => setValue("")}
                  className="absolute end-20 sm:end-28 cursor-pointer top-1/2 -translate-y-1/2 p-1.5 sm:p-2 rounded-md hover:bg-neutral-700 text-neutral-400"
                  aria-label="Clear search"
                >
                  <X size={18} className="sm:w-5 sm:h-5" />
                </button>
              )}
              <button
                type="button"
                onClick={toggleListening}
                className={`absolute end-10 sm:end-15 cursor-pointer top-1/2 -translate-y-1/2 p-1.5 sm:p-2 rounded-md transition-all duration-300 ${
                  isListening
                    ? "bg-red-600 text-white animate-pulse"
                    : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                }`}
                aria-label={isListening ? "Stop Voice Search" : "Voice Search"}
              >
                <Mic size={18} className="sm:w-5 sm:h-5" />
              </button>
              <div className="absolute end-9 sm:end-14 top-1/2 -translate-y-1/2 h-5 sm:h-6 w-px bg-white/10" />

              <button
                type="button"
                onClick={() => setIsFilterOpen(true)}
                className="absolute end-2 sm:end-3 cursor-pointer top-1/2 -translate-y-1/2 p-1.5 sm:p-2 rounded-md hover:bg-neutral-700"
                aria-label="Filter"
              >
                <SlidersVertical size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>

        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
            <span className="text-stone-400 text-xs sm:text-sm font-medium">
              {t("activeFilters")}:
            </span>
            {activeFilters.map(([key, val]) => (
              <div
                key={key}
                className="flex items-center gap-1.5 sm:gap-2 bg-background border border-white/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full"
              >
                <span className="text-white text-xs sm:text-sm font-medium">
                  <span className="text-neutral-400 capitalize">{key}:</span>{" "}
                  {getFilterDisplayName(key, val)}
                </span>
                <button
                  onClick={() => removeFilter(key)}
                  className="p-0.5 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                >
                  <X size={12} className="text-stone-400 hover:text-white" />
                </button>
              </div>
            ))}
            <button
              onClick={clearAll}
              className="text-xs sm:text-sm font-medium text-primary transition-colors cursor-pointer ml-1 sm:ml-2"
            >
              {t("clearAll")}
            </button>
          </div>
        )}
      </div>
      <Filter
        open={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onSelect={handleSelectFilter}
        initialSelections={selections}
      />
      <div className="px-4 sm:px-6 md:px-12 mb-12 mt-10 sm:mt-18 flex-grow">
        {isLoading ? (
          <Loader />
        ) : // <div className="flex gap-1 overflow-hidden mt-4">
        //   {Array(5)
        //     .fill(0)
        //     .map((_, i) => (
        //       <div
        //         key={i}
        //         className="w-30 xl:w-80 aspect-[2.5/4.2] xl:aspect-[7/4] skeleton-card rounded-lg flex-shrink-0 bg-background-2"
        //       />
        //     ))}
        // </div>
        movies.length > 0 ? (
          <>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1">
              <AnimatePresence mode="popLayout">
                {movies.map((movie, i) => (
                  <motion.div
                    key={movie._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{
                      duration: 0.3,
                      delay: (i % 12) * 0.05, // Staggered delay for the first few items
                    }}
                    className="relative"
                  >
                    <MovieCard
                      id={movie._id}
                      image={movie.image}
                      title={movie.title}
                      duration={movie.duration || movie.firstEpisode?.duration}
                      views={movie.view}
                      year={movie.year}
                      description={movie.description}
                      genres={movie.genre?.map(
                        (id: any) =>
                          genresData?.genre.find((g) => g._id === id)?.name ||
                          id,
                      )}
                      freeEpisode={movie.firstEpisode?.type === "FREE"}
                      mediaType={movie.media_type || movie.type}
                      totalLikes={movie.totalLikes}
                      likeStatus={movie.likeStatus}
                      isFavorite={movie.isFavorite}
                      onHover={handleHover}
                      className="rounded-b-none"
                      onLeave={handleLeave}
                      footer={
                        <>
                          <div className="p-1 px-2 sm:p-3 sm:px-4 flex items-center justify-between absolute bottom-0 left-0 right-0 ">
                            <div className="flex items-center gap-2 ml-auto">
                              {/* {isPlayLoading === item._id ? (
                                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 text-primary animate-spin" />
                              ) : ( */}
                              <IconButton
                                className="w-6 h-6 sm:w-7 sm:h-7"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const url = `/movie/${movie._id}?play=true${movie.firstEpisode?._id ? `&episodeId=${movie.firstEpisode._id}` : ""}`;
                                  router.push(url);
                                }}
                              >
                                <Play
                                  size={14}
                                  className="text-white fill-white"
                                />
                              </IconButton>
                              {/* )} */}
                            </div>
                          </div>
                          <span className="p-1 sm:p-2 text-xs sm:text-sm font-medium text-neutral-300 bg-background text-nowrap overflow-hidden">
                            {highlightText(movie.title, debouncedValue)}
                            {/* {movie.title.length < 14
                            ? movie.title
                            : movie.title.slice(0, 15) + ".."} */}
                          </span>
                        </>
                      }
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
                    onMouseEnter={handleKeepOpen}
                    onLeave={handleExpandedLeave}
                    actions={true}
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
        ) : debouncedValue || activeFilters.length > 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search size={48} className="text-zinc-600 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              {t("noResults")}
            </h3>
            <p className="text-zinc-400 max-w-md">
              We couldn't find any movies matching your search. Try different
              keywords or adjust your filters.
            </p>
          </div>
        ) : null}
      </div>
      {/* <Footer /> */}
    </section>
  );
}
