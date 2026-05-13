"use client";
import { MovieCard } from "@/components/HomePage/MovieCard";
import { Mic, Search, X, Loader2, Play } from "lucide-react";
import React, { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { BackButton } from "@/components/Common/BackButton";
import { useSearchMovies, useGenres } from "@/hooks/useMovie";
import { useLanguage } from "@/context/LanguageContext";
import { useInView } from "react-intersection-observer";
import { useToast } from "@/context/ToastContext";
import { motion, AnimatePresence } from "framer-motion";
import debounce from "lodash.debounce";
import { IconButton } from "@/components/Common/IconButton";
import { useAnalytics } from "@/hooks/useAnalytics";
import { AnalyticsEventType } from "@/types/analytics";
import { Views } from "../Common/Views";

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

interface MediaListProps {
  mediaType: "movie" | "tv";
  heading: string;
}

export function MediaList({ mediaType, heading }: MediaListProps) {
  const router = useRouter();
  const { track } = useAnalytics();
  const { t } = useLanguage();
  const [value, setValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const { ref, inView } = useInView();
  const { data: genresData } = useGenres();

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

      recognition.onstart = () => setIsListening(true);

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

      recognition.onend = () => setIsListening(false);

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

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useSearchMovies({
      search: debouncedValue,
      media_type: mediaType,
      limit: 12,
    });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const movies = data?.pages.flatMap((page) => page.data) || [];

  const formatYear = (year: any) => {
    if (!year) return null;
    const parsed = new Date(year).getFullYear();
    return Number.isFinite(parsed) ? parsed : year;
  };

  return (
    <section className="max-w-7xl mx-auto min-h-screen flex flex-col mt-[7rem] lg:mt-20">
      <div className="flex flex-col px-4 sm:px-6 md:px-12 mt-4 sm:mt-8 gap-4 sm:gap-6">
        <div className="flex relative items-start gap-4 lg:gap-8 flex-col">
          <h1 className="text-white text-lg sm:text-2xl font-bold ">
            {heading}
          </h1>
          <div className="relative w-full flex flex-1">
            <span className="absolute start-4 sm:start-7 top-1/2 -translate-y-1/2 text-neutral-400">
              <Search size={20} />
            </span>

            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={
                mediaType === "movie"
                  ? "Search for Movies.."
                  : "Search for TV Shows.."
              }
              className="w-full h-12 sm:h-14 ps-12 sm:ps-22 pe-20 sm:pe-24 bg-background text-white rounded-md placeholder:text-neutral-400 focus:outline-none text-sm sm:text-base"
            />

            <div className="flex items-center gap-1 sm:gap-2">
              {value && (
                <button
                  type="button"
                  onClick={() => setValue("")}
                  className="absolute end-12 sm:end-16 cursor-pointer top-1/2 -translate-y-1/2 p-1.5 sm:p-2 rounded-md hover:bg-neutral-700 text-neutral-400"
                  aria-label="Clear search"
                >
                  <X size={18} className="sm:w-5 sm:h-5" />
                </button>
              )}
              <button
                type="button"
                onClick={toggleListening}
                className={`absolute end-2 sm:end-3 cursor-pointer top-1/2 -translate-y-1/2 p-1.5 sm:p-2 rounded-md transition-all duration-300 ${
                  isListening
                    ? "bg-red-600 text-white animate-pulse"
                    : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                }`}
                aria-label={isListening ? "Stop Voice Search" : "Voice Search"}
              >
                <Mic size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 md:px-12 mb-12 mt-10 sm:mt-14 flex-grow">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : movies.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-1">
              <AnimatePresence mode="popLayout">
                {movies.map((movie, i) => (
                  <motion.div
                    key={movie._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ duration: 0.3, delay: (i % 12) * 0.05 }}
                    className="relative transition-transform duration-300 ease-out hover:scale-105 hover:z-10"
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
                      widgetType={2}
                      isFavorite={movie.isFavorite}
                      className="rounded-md"
                      footer={
                        <>
                          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none " />
                          <div className="absolute inset-x-0 bottom-0 p-2 sm:p-3 flex items-end justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="text-white text-xs sm:text-sm font-semibold line-clamp-1">
                                {highlightText(movie.title, debouncedValue)}
                              </p>
                              <div className="flex items-center gap-1 sm:gap-2 mt-1">
                                <Views
                                  view={movie.view}
                                  className="text-neutral-300 text-[10px] sm:text-xs"
                                />
                                {formatYear(movie.year) && (
                                  <>
                                    <div className="w-1.5 h-1.5 mx-.8 bg-primary rounded-full"></div>
                                    <p className="text-neutral-300 text-[10px] sm:text-xs">
                                      {formatYear(movie.year)}
                                    </p>
                                  </>
                                )}
                              </div>
                            </div>
                            {/* <IconButton
                              className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0"
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
                            </IconButton> */}
                          </div>
                        </>
                      }
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div ref={ref} className="flex justify-center py-8">
              {isFetchingNextPage && (
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search size={48} className="text-zinc-600 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              {t("noResults")}
            </h3>
            <p className="text-zinc-400 max-w-md">
              We couldn't find any titles matching your search.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
