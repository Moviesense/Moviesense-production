"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  cn,
  stripHtml,
  formatRuntime,
  getImageUrl,
  getYouTubeVideoId,
  handleShare,
  getCountry,
} from "@/lib/utils";
import {
  Check,
  Heart,
  Plus,
  Share2,
  Sparkle,
  Volume2,
  VolumeOff,
  VolumeX,
  Clock,
} from "lucide-react";
import { Button } from "@/components/Common/Button";
import { IconButton } from "@/components/Common/IconButton";
import { VideoPlayer } from "@/components/Common/VideoPlayer";
import Hls from "hls.js";
import { Subtitle, Episode } from "@/types/movie";
import { movieService } from "@/services/movieService";
import { useToggleLike, useToggleFavorite } from "@/hooks/useMovie";
import { useRenewSubscription } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { SubscriptionModal } from "@/components/Common/SubscriptionModal";
import { WatchNowButton } from "@/components/Common/WatchNowButton";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "@/context/ToastContext";
import { ShareModal } from "@/components/Common/ShareModal";
import { useAnalytics } from "@/hooks/useAnalytics";
import { AnalyticsEventType } from "@/types/analytics";

interface HeroSlide {
  _id: string | number;
  image: string;
  title: string;
  description: string;
  videoUrl?: string;
  subtitleUrl?: string;
  hlsFileName?: string;
  drmEnabled?: boolean;
  mediaType?: "movie" | "series" | "tv";
  episodes?: Episode[];
  firstEpisode?: {
    _id?: string;
    hlsFileName?: string;
    drmEnabled?: boolean;
    customAd?: boolean;
    adDetails?: any;
  };
  videoType?: number;
  link?: string;
  type?: "PREMIUM" | "FREE" | "PAYPERVIEWS";
  isRented?: boolean;
  ppvCountryPrices?: { price: number };
  expiryDate?: string;
  clicksLeft?: number;
  startTime?: number;
  initialEpisodeId?: string | null;
  contentType?: "image" | "video";
  signedVideoUrl?: string;
  genres?: { _id: string; name: string }[];
  runtime?: number;
  introStartTime?: number;
  introEndTime?: number;
  signature?: string;
  bannerLogo?: string;
  drmLicenseToken?: string;
  drm?: boolean;
  totalLikes?: number;
  likeStatus?: boolean;
  isFavorite?: boolean;
  GoogleAd?: boolean;
  adSignedUrl?: string;
  customAd?: boolean;
  adDetails?: {
    _id: string;
    adId: string;
    skippable: boolean;
    skipTimeSeconds: number;
    adType: string;
    title: string;
    hlsFileName: string;
    drmEnabled: boolean;
    duration: number;
    imageUrl: string;
    redirectUrl: string;
  };
}

interface HeroCarouselProps {
  slides: HeroSlide[];
  autoplay?: boolean;
  interval?: number; // ms
  isSubscribed?: boolean;
  onSubscribe?: () => void;
  from: string;
  onRefresh?: () => void;
}

function BannerVideo({
  src,
  onReady,
  muted = true,
}: {
  src: string;
  onReady: () => void;
  muted?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [src]);

  // Sync muted property without re-rendering the whole tag
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = !!muted;
    }
  }, [muted]);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted={muted}
      loop
      playsInline
      onCanPlay={onReady}
      className="absolute inset-0 w-full h-full object-cover"
    />
  );
}

function BannerYouTube({
  src,
  onReady,
  muted = true,
}: {
  src: string;
  onReady: () => void;
  muted?: boolean;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const videoId = getYouTubeVideoId(src);

  // Sync muted state via postMessage to avoid iframe reload
  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      const message = JSON.stringify({
        event: "command",
        func: muted ? "mute" : "unMute",
        args: [],
      });
      iframeRef.current.contentWindow.postMessage(message, "*");
    }
  }, [muted]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <iframe
        ref={iframeRef}
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&enablejsapi=1`}
        onLoad={onReady}
        className="absolute top-1/2 left-1/2 w-[115%] h-[115%] -translate-x-1/2 -translate-y-1/2"
        allow="autoplay; encrypted-media"
        title="Background Video"
      />
    </div>
  );
}

export function HeroCarousel({
  slides,
  autoplay = false,
  interval = 8000,
  // isSubscribed = false,
  onSubscribe,
  from,
  onRefresh,
}: HeroCarouselProps) {
  const { isRTL, t } = useLanguage();
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const { track } = useAnalytics();
  const [activeVideo, setActiveVideo] = useState<HeroSlide | null>(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { isAuthenticated, isSubscribed, userEmail } = useAuth();
  const [canPlayVideo, setCanPlayVideo] = useState(true);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [shareData, setShareData] = useState<{
    title: string;
    id: string;
  } | null>(null);
  const [localLikesCount, setLocalLikesCount] = useState(0);
  const [isRentLoading, setIsRentLoading] = useState(false);

  const prev = () =>
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  const next = () =>
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));

  const startAutoplay = () => {
    // if (!autoplay) return;
    // stopAutoplay();
    // timerRef.current = setInterval(next, interval);
  };

  const stopAutoplay = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const currentSlide = slides[current];
  const [isLiked, setIsLiked] = useState(false);
  const toggleLikeMutation = useToggleLike();
  const toggleFavoriteMutation = useToggleFavorite();
  const renewSubscription = useRenewSubscription();

  useEffect(() => {
    if (currentSlide) {
      setLocalLikesCount(currentSlide.totalLikes || 0);
      setIsLiked(currentSlide.likeStatus ?? false);
      setIsFavorite(currentSlide.isFavorite ?? false);
    }
  }, [current, currentSlide]);

  const handleUpgradePlan = async () => {
    track(AnalyticsEventType.updateSubscriptionByProfile);
    const email = userEmail;
    if (!email || !isAuthenticated) {
      router.push("/login");
      return;
    }

    try {
      const country = await getCountry();
      const response = await renewSubscription.mutateAsync({
        email,
        country: country,
      });

      if (response.status && response.token) {
        router.push(`/subscription/${response.token}`);
      } else {
        toast(response.message || "Failed to get renewal link.", "error");
      }
    } catch (error) {
      console.error("Renewal error:", error);
    }
  };

  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (!currentSlide || toggleLikeMutation.isPending) return;
    try {
      if (!isLiked) {
        track(AnalyticsEventType.clickLikeMovie, currentSlide._id.toString());
        setLocalLikesCount((prev) => prev + 1);
      } else {
        setLocalLikesCount((prev) => Math.max(0, prev - 1));
      }
      setIsLiked(!isLiked);
      await toggleLikeMutation.mutateAsync({
        movieId: String(currentSlide._id),
        type: currentSlide.mediaType || "movie",
      });
    } catch (error) {
      console.error("Error toggling like:", error);
      setLocalLikesCount(currentSlide.totalLikes || 0);
      setIsLiked(currentSlide.likeStatus ?? false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    const slide = slides[current];
    if (!slide || toggleFavoriteMutation.isPending) return;

    if (!isFavorite) {
      track(AnalyticsEventType.addMyList, slide._id.toString());
    }
    setIsFavorite(!isFavorite);

    toggleFavoriteMutation.mutate({
      movieId: String(slide._id),
      type: slide.mediaType || "movie",
    });
  };

  useEffect(() => {
    startAutoplay();

    // Video delay logic
    setCanPlayVideo(false);
    setIsVideoReady(false);
    const timeout = setTimeout(() => {
      setCanPlayVideo(true);
    }, 1500);

    return () => {
      stopAutoplay();
      clearTimeout(timeout);
    };
  }, [current, autoplay, interval, slides, isAuthenticated]);

  const searchParams = useSearchParams();

  useEffect(() => {
    const play = searchParams.get("play");
    const episodeId = searchParams.get("episodeId");
    const startTimeStr = searchParams.get("startTime");
    const startTime = startTimeStr ? parseFloat(startTimeStr) : undefined;

    if (play === "true" && slides.length > 0) {
      const slide = slides[0];
      if (slide) {
        const isTvShow =
          slide.mediaType === "tv" || slide.mediaType === "series";
        if (isTvShow && episodeId) {
          // Let Shows.tsx handle autoplay for specific episodes to support seasons
        } else {
          handlePlay(slide, startTime, episodeId);
        }
      }
    }
  }, [searchParams, slides, isSubscribed]);

  const handlePlay = async (
    slide: HeroSlide,
    startTime?: number,
    episodeId?: string | null,
  ) => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    track(AnalyticsEventType.clickPlayTopBanner, slide._id.toString());

    let hlsFileName = slide.hlsFileName;
    let drm = slide.drmEnabled || false;

    let adDetails = slide.adDetails;
    let customAd = slide.customAd;

    // If specific episode requested
    if (episodeId && slide.episodes) {
      const episode = slide.episodes.find((ep) => ep._id === episodeId);
      if (episode) {
        hlsFileName = episode.hlsFileName;
        drm = episode.drmEnabled || false;
        if (episode.customAd) {
          customAd = true;
          adDetails = episode.adDetails;
        }
      }
    } else if (slide.mediaType === "tv" || slide.mediaType === "series") {
      hlsFileName = slide.firstEpisode?.hlsFileName;
      drm = slide.firstEpisode?.drmEnabled || false;
      if (slide.firstEpisode?.customAd) {
        customAd = true;
        adDetails = slide.firstEpisode.adDetails;
      }
    }

    let adSignedUrl = "";
    console.log(
      "HeroCarousel: handlePlay: customAd:",
      customAd,
      "adDetails:",
      adDetails,
    );
    if (customAd && adDetails?.hlsFileName) {
      console.log(
        "HeroCarousel: handlePlay: Fetching ad signed URL for:",
        adDetails.hlsFileName,
      );
      try {
        const adResponse = await movieService.getSignedUrl(
          adDetails.hlsFileName,
          adDetails.drmEnabled || false,
        );
        adSignedUrl = adResponse.signedVideoUrl;
        console.log(
          "HeroCarousel: handlePlay: Fetched ad signed URL:",
          adSignedUrl,
        );
      } catch (error) {
        console.error(
          "HeroCarousel: handlePlay: Error fetching ad signed URL:",
          error,
        );
      }
    }

    if (slide.videoType === 0 && slide.link) {
      const contentId =
        ((slide.mediaType === "series" || slide.mediaType === "tv") &&
        (episodeId || slide.firstEpisode?._id)
          ? episodeId || slide.firstEpisode?._id
          : slide._id) || slide._id;

      const savedTime = localStorage.getItem(`yt_resume_${contentId}`);
      const resumeTime = savedTime ? parseFloat(savedTime) : startTime;

      setActiveVideo({
        ...slide,
        videoUrl: slide.link,
        startTime: resumeTime,
        initialEpisodeId: episodeId,
        adSignedUrl,
        adDetails,
      });
      return;
    }

    if (slide.signedVideoUrl) {
      // adSignedUrl already fetched above

      setActiveVideo({
        ...slide,
        videoUrl: slide.signedVideoUrl,
        startTime: startTime,
        initialEpisodeId: episodeId,
        adSignedUrl,
        adDetails,
      });
      return;
    }

    if (hlsFileName) {
      try {
        setIsLoadingVideo(true);
        const response = await movieService.getSignedUrl(hlsFileName, drm);
        if (onRefresh) onRefresh();

        if (
          response.isPremiumRequired ||
          (response.type === "PREMIUM" && !isSubscribed)
        ) {
          setShowSubscriptionModal(true);
          return;
        }

        if (response.signedVideoUrl) {
          // Use lastViewedData if available and startTime not explicitly provided
          const resumeTime =
            startTime ??
            (response.lastViewedData?.endTime
              ? response.lastViewedData.endTime / 1000
              : undefined);

          // adSignedUrl already fetched above

          setActiveVideo({
            ...slide,
            videoUrl: response.signedVideoUrl,
            startTime: resumeTime,
            initialEpisodeId: episodeId,
            introStartTime: response.introStartTime,
            introEndTime: response.introEndTime,
            signature: response.signature,
            drmLicenseToken: response.drmLicenseToken,
            drm: response.drm,
            hlsFileName: hlsFileName,
            adSignedUrl,
            adDetails,
          });
        } else {
          console.error("HeroCarousel: Signed URL is empty");
        }
      } catch (error) {
        console.error("HeroCarousel: Error fetching signed URL:", error);
      } finally {
        setIsLoadingVideo(false);
      }
    } else if (slide.videoUrl) {
      setActiveVideo({
        ...slide,
        startTime: startTime,
        initialEpisodeId: episodeId,
        adSignedUrl,
        adDetails,
      });
    } else {
      console.warn("HeroCarousel: No hlsFileName or videoUrl found for slide");
      toast("Video not found", "error");
    }
  };

  const handleRent = async (slide: HeroSlide) => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    try {
      setIsRentLoading(true);
      const response = await movieService.requestPPVLink({
        movieId: slide._id.toString(),
        successUrl:
          window.location.origin + `/movie/${slide._id}?payment=success`,
        cancelUrl:
          window.location.origin + `/movie/${slide._id}?payment=cancel`,
      });
      if (response.status && response.checkout?.url) {
        window.location.href = response.checkout.url;
      } else {
        toast(response.message || "Failed to get payment link", "error");
      }
    } catch (error) {
      console.error("Error requesting PPV link:", error);
      toast("Failed to initiate payment", "error");
    } finally {
      setIsRentLoading(false);
    }
  };

  return (
    <section
      className={cn(
        "relative overflow-hidden group h-[70vh] sm:h-[50vh] lg:h-[40vh] xl:h-[120vh]",
        from == "movie" && "h-[72vh] sm:h-[55vh] xl:h-[90vh]",
      )}
      onMouseEnter={stopAutoplay}
      onMouseLeave={startAutoplay}
    >
      {/* SLIDES */}
      <div
        className="flex h-full transition-transform duration-700"
        style={{
          transform: `translateX(${isRTL ? "" : "-"}${current * 100}%)`,
        }}
      >
        {slides.map((slide, index) => (
          <>
            <div
              key={index}
              className={cn(
                "relative min-w-full",
                from == "movie" && "h-[55vh] sm:h-full",
              )}
            >
              <Image
                src={getImageUrl(slide.image)}
                alt={slide.title}
                fill
                className="object-cover"
                priority={index === 0}
              />

              {
                // slide.contentType === "video" &&
                slide.videoUrl && canPlayVideo && index === current && (
                  <div
                    className={cn(
                      "absolute inset-0 transition-opacity duration-1000",
                      isVideoReady ? "opacity-100" : "opacity-0",
                    )}
                  >
                    {slide.videoUrl.includes("youtube.com") ||
                    slide.videoUrl.includes("youtu.be") ? (
                      <BannerYouTube
                        src={slide.videoUrl}
                        onReady={() => setIsVideoReady(true)}
                        muted={isMuted}
                      />
                    ) : (
                      <BannerVideo
                        src={slide.videoUrl}
                        onReady={() => setIsVideoReady(true)}
                        muted={isMuted}
                      />
                    )}
                  </div>
                )
              }

              {
                // slide.contentType === "video" &&
                slide.videoUrl &&
                  canPlayVideo &&
                  index === current &&
                  isVideoReady && (
                    <div
                      className={cn(
                        "absolute z-40 transition-all duration-500",
                        from === "home"
                          ? "top-35 sm:top-40 end-6 lg:end-10 xl:end-16"
                          : "bottom-45 sm:bottom-30 lg:bottom-40 end-6 lg:end-10 xl:end-16",
                      )}
                    >
                      <IconButton
                        onClick={() => setIsMuted(!isMuted)}
                        className="h-9 w-9 p-2 sm:h-12 sm:w-12"
                        // title={isMuted ? t("unmute") : t("mute")}
                      >
                        {isMuted ? (
                          <VolumeOff size={40} className="text-white" />
                        ) : (
                          <Volume2 size={40} className="text-white" />
                        )}
                      </IconButton>
                    </div>
                  )
              }

              {/* VIGNETTE */}
              <div
                className="absolute inset-0"
                // style={{
                //   background: `
                //   linear-gradient(to ${isRTL ? "left" : "right"},
                //     rgba(9,12,13,0.95) 0%,
                //     rgba(9,12,13,0.3) 30%,
                //     rgba(9,12,13,0) 65%
                //   ),
                //   linear-gradient(to bottom,
                //     rgba(9,12,13,0.85) 0%,
                //     rgba(9,12,13,0) 25%
                //   ),
                //   linear-gradient(to bottom,
                //     rgba(9,12,13,0) 0%,
                //     rgba(9,12,13,0.2) 40%,
                //     rgba(9,12,13,0.8) 70%,
                //     rgba(9,12,13,${from === "movie" ? "1" : "1"}) 100%
                //   )
                // `,
                // }}
                style={{
                  background: `
                  linear-gradient(to ${isRTL ? "left" : "right"},
                    rgba(24,29,37,0.95) 0%,
                    rgba(24,29,37,0.3) 30%,
                    rgba(24,29,37,0) 65%
                  ),
                  linear-gradient(to bottom,
                    rgba(24,29,37,0.85) 0%,
                    rgba(24,29,37,0) 25%
                  ),
                  linear-gradient(to bottom,
                    rgba(24,29,37,0) 0%,
                    rgba(24,29,37,0.2) 40%,
                    rgba(24,29,37,0.8) 70%,
                    rgba(24,29,37,${from === "movie" ? "1" : "1"}) 100%
                  )
                `,
                }}
              />

              {/* CONTENT BLOCK */}
              <div
                className={cn(
                  "absolute z-30 w-full transition-all duration-500 ease-in-out bottom-0 inset-x-0 text-center sm:text-start sm:start-6 lg:start-10 xl:start-12 sm:inset-x-auto sm:translate-x-0 sm:h-auto sm:w-auto",
                  from === "home"
                    ? "sm:bottom-10 lg:bottom-10 xl:top-35 bottom-5"
                    : "bottom-18 sm:bottom-24 lg:bottom-30",
                )}
                onClick={() =>
                  from === "home" && router.push(`/movie/${slide._id}`)
                }
              >
                {/* Main Content: Title & Description */}
                <div className="flex group/hero-content cursor-pointer flex-col items-center sm:items-start gap-0">
                  {slide.bannerLogo ? (
                    <Image
                      src={getImageUrl(slide.bannerLogo)}
                      alt={slide.title}
                      width={500}
                      height={300}
                      className={cn(
                        "object-contain transition-all duration-500 ease-in-out origin-left rtl:origin-right will-change-transform antialiased h-auto",
                        from === "home"
                          ? "max-h-[80px] w-auto sm:h-[80px] xl:h-[140px] sm:max-h-[120px] 2xl:max-h-[180px] w-auto opacity-45 xl:mb-[-1rem] group-hover/hero-content:h-[200px] group-hover/hero-content:opacity-100 mb-0"
                          : "max-h-[60px] sm:h-[80px] xl:h-[140px] sm:max-h-[100px] 2xl:max-h-[150px] w-auto opacity-100 mb-2 xl:fixed xl:top-[-350%]",
                      )}
                    />
                  ) : (
                    <h1
                      className={cn(
                        "text-white font-bold transition-all duration-500 ease-in-out origin-left rtl:origin-right will-change-transform antialiased text-md text-center sm:text-start",
                        from === "home"
                          ? "2xl:text-5xl xl:text-4xl xl:scale-[0.8] opacity-45 xl:mb-[-1rem] group-hover/hero-content:scale-100 group-hover/hero-content:opacity-100 group-hover/hero-content:mb-2 mb-0 sm:mb-2"
                          : "2xl:text-4xl xl:text-2xl opacity-100 mb-0 sm:mb-1",
                      )}
                    >
                      {slide.title}
                    </h1>
                  )}

                  {from == "home" && (
                    <div
                      className={cn(
                        "max-w-xl text-sm font-medium sm:text-md xl:text-lg transition-all duration-500 ease-in-out line-clamp-1 sm:line-clamp-2 xl:line-clamp-none capitalize mb-0 px-2 sm:px-0 sm:mb-0",
                        from === "home"
                          ? "opacity-45 group-hover/hero-content:opacity-100 group-hover/hero-content:line-clamp-none xl:mt-8 hidden sm:block"
                          : "opacity-100 mt-2",
                      )}
                    >
                      {stripHtml(slide.description)}
                    </div>
                  )}

                  <h2
                    className={cn(
                      "text-white mt-1 font-bold transition-all duration-500 ease-in-out origin-left rtl:origin-right will-change-transform antialiased text-xs sm:text-xl text-center sm:text-start",
                      from === "home"
                        ? "opacity-45 group-hover/hero-content:opacity-100"
                        : "opacity-100",
                    )}
                  >
                    {slide.type === "PAYPERVIEWS" && isAuthenticated && (
                      <div className="flex flex-col gap-1 items-center sm:items-start mt-1">
                        <span className="flex items-center gap-2">
                          <span
                            className={cn("text-sm font-bold text-green-600")}
                          >
                            {slide.isRented
                              ? t("rented")
                              : `${t("rent")} for $${slide.ppvCountryPrices?.price || 0}`}
                          </span>
                          {slide.clicksLeft !== undefined && (
                            <span className="bg-neutral-800/50 px-2 py-0.5 rounded-full border border-white/5 text-[10px] block sm:hidden">
                              {slide.clicksLeft} {t("clicksLeft")}
                            </span>
                          )}
                        </span>
                        {slide.isRented && (
                          <div className="flex items-center gap-2 text-[10px] sm:text-xs text-neutral-400 font-medium">
                            {slide.expiryDate && (
                              <span className="flex items-center gap-1">
                                <Clock size={12} className="text-secondary" />
                                {t("expiresOn")}{" "}
                                {new Date(slide.expiryDate).toLocaleString([], {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                })}
                              </span>
                            )}
                            {slide.clicksLeft !== undefined && (
                              <span className="bg-neutral-800/50 px-2 py-0.5 rounded-full border border-white/5 text-[10px] hidden sm:block">
                                {slide.clicksLeft} {t("clicksLeft")}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    {slide.type === "PREMIUM" && !isSubscribed && (
                      <span className="font-bold flex items-center gap-2 mt-1">
                        <span className="bg-secondary rounded-full p-1">
                          <Sparkle size={11} fill="#fff" />
                        </span>{" "}
                        {t("availableWithPremium")}
                      </span>
                    )}
                    {slide.type === "FREE" && !isSubscribed && (
                      <span className="font-bold flex items-center gap-2 mt-1">
                        <span className="bg-primary rounded-full p-1">
                          <Sparkle size={11} fill="#fff" />
                        </span>{" "}
                        {t("oneEpisodeFree")}
                      </span>
                    )}
                  </h2>

                  {/* Metadata Row: Runtime, Episode Info, Genres */}
                  <div
                    className={cn(
                      "flex flex-wrap items-center gap-3 mt-1 xl:mt-3 mb-1 xl:mb-0 transition-all duration-500 ease-in-out",
                      from === "home"
                        ? "opacity-45 group-hover/hero-content:opacity-100"
                        : "opacity-100",
                    )}
                  >
                    {/* Runtime */}
                    {/* {slide.runtime && slide.runtime > 0 ? (
                      <span className="text-xs hidden sm:block xl:text-base text-neutral-300 font-medium tracking-wider">
                        {formatRuntime(slide.runtime)}
                      </span>
                    ) : null} */}

                    {/* Season/Episode Info */}
                    {/* {from === "home" &&
                    (slide.mediaType === "series" ||
                      slide.mediaType === "tv") && (
                      <>
                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                        <span className="text-xs xl:text-base text-neutral-400 font-medium tracking-wider">
                          {slide.episodes?.[0]
                            ? `Season ${slide.episodes[0].seasonNumber} • Episode ${slide.episodes[0].episodeNumber}`
                            : "Season 1 • Episode 1"}
                        </span>
                      </>
                    )} */}

                    {/* Media Type */}
                    <div
                      dir="ltr"
                      className={cn(
                        "flex items-center w-fit",
                        from === "home"
                          ? "opacity-100 group-hover/hero-content:opacity-100 mb-2"
                          : "opacity-100 hidden sm:flex",
                      )}
                    >
                      {slide.mediaType && (
                        <span className="text-xs xl:text-sm 2xl:text-base text-neutral-300 font-medium tracking-wider capitalize">
                          {slide.mediaType}
                        </span>
                      )}

                      {/* Genres */}
                      {slide.genres &&
                        slide.genres.length > 0 &&
                        slide.genres.map(
                          (genre, i) =>
                            genre.name && (
                              <div
                                className="flex items-center"
                                key={genre._id}
                              >
                                <div className="w-1.5 h-1.5 mx-2 bg-primary rounded-full"></div>
                                <span className="text-xs xl:text-sm 2xl:text-base text-neutral-400 font-medium tracking-wider capitalize">
                                  {genre.name}
                                </span>
                              </div>
                            ),
                        )}
                    </div>
                  </div>

                  {/* {from == "home" && ( */}
                  <WatchNowButton
                    title={
                      slide.type === "PAYPERVIEWS" && !slide.isRented
                        ? t("rentNow")
                        : slide.type === "PREMIUM" && !isSubscribed
                          ? t("subscribeToWatch")
                          : t("watchNow")
                    }
                    isRent={slide.type === "PAYPERVIEWS" && !slide.isRented}
                    isLoading={isRentLoading || isLoadingVideo}
                    onClick={() => {
                      if (slide.type === "PAYPERVIEWS" && !slide.isRented) {
                        handleRent(slide);
                      } else {
                        if (slide.type === "PREMIUM" && !isSubscribed) {
                          handleUpgradePlan();
                        } else {
                          handlePlay(slide);
                        }
                      }
                    }}
                    showIsFav={from === "home" ? true : false}
                    isFav={isFavorite}
                    onFavClick={() => handleToggleFavorite()}
                    subtitle={
                      (slide.mediaType === "series" ||
                        slide.mediaType === "tv") &&
                      slide.episodes?.[0]
                        ? `${t("season")} ${slide.episodes[0].seasonNumber}, ${t("episode")} ${slide.episodes[0].episodeNumber}`
                        : undefined
                    }
                    className={cn(
                      "transition-all duration-500 ease-in-out",
                      from === "home"
                        ? "xl:opacity-45 group-hover/hero-content:opacity-100 xl:mt-2"
                        : "opacity-100 sm:hidden",
                    )}
                  />
                  {/* )} */}
                  {from == "movie" && (
                    <div
                      className={cn(
                        "max-w-xl text-sm font-medium sm:text-md xl:text-lg transition-all duration-500 ease-in-out line-clamp-2 xl:line-clamp-none capitalize mb-0 sm:mb-0 hidden sm:flex",
                        from === "movie"
                          ? "opacity-100"
                          : "xl:opacity-45 group-hover/hero-content:opacity-100 group-hover/hero-content:line-clamp-none xl:mt-6",
                      )}
                    >
                      {stripHtml(slide.description)}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {from == "movie" && (
              <div className="absolute bottom-0 sm:border-t border-white/10 w-full start-0 z-10 bg-background sm:bg-background/70 sm:px-6 lg:px-10 xl:px-12 border-b border-white/10">
                <span className="line-clamp-1 font-bold text-sm text-neutral-400 sm:hidden border-l-4 border-primary pl-2 m-4">
                  {stripHtml(slide.description)}
                </span>
                <hr className="text-white/10" />
                <div className="p-4 sm:hidden overflow-y-auto max-h-30">
                  <div dir="ltr" className="flex items-center gap-2 w-fit">
                    {slide.mediaType && (
                      <span className="text-xs xl:text-sm 2xl:text-base text-neutral-300 font-medium tracking-wider capitalize">
                        {slide.mediaType}
                      </span>
                    )}

                    {/* Genres */}
                    {slide.genres &&
                      slide.genres.length > 0 &&
                      slide.genres.map(
                        (genre, i) =>
                          genre.name && (
                            <div className="flex items-center" key={genre._id}>
                              <div className="w-1.5 h-1.5 mr-2 bg-primary rounded-full"></div>
                              <span className="text-xs xl:text-sm 2xl:text-base text-neutral-400 font-medium tracking-wider capitalize">
                                {genre.name}
                              </span>
                            </div>
                          ),
                      )}
                  </div>
                  <p className="text-xs mt-3 line-clamp-2">
                    {stripHtml(slide.description)}
                  </p>
                </div>
                <hr className="text-white/10" />
                <div className="flex items-center gap-4 py-4">
                  <WatchNowButton
                    title={
                      slide.type === "PAYPERVIEWS" && !slide.isRented
                        ? t("rentNow")
                        : slide.type === "PREMIUM" && !isSubscribed
                          ? t("subscribeToWatch")
                          : t("watchNow")
                    }
                    isRent={slide.type === "PAYPERVIEWS" && !slide.isRented}
                    isLoading={isRentLoading || isLoadingVideo}
                    subtitle={
                      (slide.mediaType === "series" ||
                        slide.mediaType === "tv") &&
                      slide.episodes?.[0]
                        ? `${t("season")} ${slide.episodes[0].seasonNumber}, ${t("episode")} ${slide.episodes[0].episodeNumber}`
                        : undefined
                    }
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.stopPropagation();
                      if (slide.type === "PAYPERVIEWS" && !slide.isRented) {
                        handleRent(slide);
                      } else {
                        if (slide.type === "PREMIUM" && !isSubscribed) {
                          handleUpgradePlan();
                        } else {
                          handlePlay(slide);
                        }
                      }
                    }}
                    className={cn(
                      "transition-all duration-500 ease-in-out sm:mb-0 opacity-100 backdrop-blur-[0px] pe-0 bg-transparent hidden sm:flex sm:bg-gradient-to-r sm:from-white/0 sm:to-white/0",
                    )}
                  />
                  <div className="w-[1px] h-8 bg-white/10 ml-2 mr-5 hidden sm:block" />
                  <div className="flex items-center gap-8 sm:px-0">
                    <IconButton
                      title={t("myList")}
                      onClick={() => handleToggleFavorite()}
                      disabled={toggleFavoriteMutation.isPending}
                      className="h-[30px] w-[30px] 2xl:h-[40px] 2xl:w-[40px]"
                    >
                      {
                        /* isFavoriteLoading ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : */ isFavorite ? (
                          <Check size={18} />
                        ) : (
                          <Plus size={18} />
                        )
                      }
                    </IconButton>
                    <div className="flex items-center gap-2">
                      <IconButton
                        title={t("like")}
                        onClick={() => handleToggleLike()}
                        disabled={toggleLikeMutation.isPending}
                        className="h-[30px] w-[30px] 2xl:h-[40px] 2xl:w-[40px]"
                        totalLikes={localLikesCount}
                      >
                        <Heart
                          size={18}
                          className={isLiked ? "fill-primary text-primary" : ""}
                        />
                      </IconButton>
                    </div>
                    <IconButton
                      title={t("share")}
                      onClick={async () => {
                        track(
                          AnalyticsEventType.clickShareMovie,
                          currentSlide?._id.toString(),
                        );
                        if (currentSlide) {
                          setShareData({
                            title: currentSlide.title,
                            id: String(currentSlide._id),
                          });
                        }
                      }}
                      className="h-[30px] w-[30px] 2xl:h-[40px] 2xl:w-[40px]"
                    >
                      <Share2 size={18} />
                    </IconButton>
                  </div>
                </div>
              </div>
            )}
          </>
        ))}
      </div>

      {/* ARROWS */}
      {from == "home" && (
        <>
          {/* {" "}
          <Button
            variant="custom"
            onClick={prev}
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-20 bg-gradient-to-l from-primary to-secondary/50 p-2 sm:p-3 rounded-full hover:bg-primary border-none shadow-none hidden sm:flex opacity-0 group-hover:opacity-75 transition-opacity duration-300"
          >
            <ChevronLeft className="text-white w-5 h-5 sm:w-6 sm:h-6" />
          </Button>
          <Button
            variant="custom"
            onClick={next}
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20 bg-gradient-to-r from-primary to-secondary/50 p-2 sm:p-3 rounded-full hover:bg-primary border-none shadow-none hidden sm:flex opacity-0 group-hover:opacity-75 transition-opacity duration-300"
          >
            <ChevronRight className="text-white w-5 h-5 sm:w-6 sm:h-6" />
          </Button> */}
          {/* DOTS (Mobile) */}
          <div className="absolute bottom-4 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 sm:bottom-10 sm:end-[-13rem] sm:translate-x-0 lg:bottom-10 lg:end-[-18rem] flex justify-center gap-1 sm:gap-2 xl:start-1/2 xl:-translate-x-1/2 xl:bottom-60 lg:gap-2 z-20 xl:opacity-0 xl:group-hover:opacity-100 rtl:xl:translate-x-1/2 xl:hidden">
            {slides.map((_, index) => (
              <div
                key={index}
                onClick={() => setCurrent(index)}
                className={`h-1.5 rounded-full cursor-pointer transition-all border-none shadow-none p-0 ${
                  current === index ? "w-6 bg-primary" : "w-1.5 bg-white/40"
                }`}
              />
            ))}
          </div>

          {/* THUMBNAILS (Desktop) */}
          <div className="hidden xl:flex absolute opacity-50 hover:opacity-90 transition-all duration-300 bottom-10 lg:bottom-14 xl:bottom-55 start-1/2 -translate-x-1/2 z-20 justify-center gap-12">
            {slides.map((slide, index) => (
              <div className="relative pb-6">
                {/* <button
                  key={index}
                  onClick={() => setCurrent(index)}
                  className={cn(
                    "relative rounded-lg overflow-hidden transition-all duration-300 border-none p-0 group cursor-pointer",
                    // current === index
                    //   ? "opacity-100"
                    //   : "opacity-40 hover:opacity-80",
                  )}
                > */}
                <Image
                  key={index}
                  onClick={() => setCurrent(index)}
                  src={getImageUrl(slide?.bannerLogo || slide?.image)}
                  alt={slide.title}
                  width={100}
                  height={100}
                  className="h-full w-full aspect-[5/3] cursor-pointer object-cover rounded"
                />
                {/* Active Indicator: Bottom Border Gradient */}
                {/* </button> */}
                {current === index && (
                  <div className="absolute bottom-0 animate-in fade-in duration-300 left-0 right-0 h-[3px] bg-gradient-to-r from-primary to-secondary w-14 mx-auto" />
                )}
              </div>
            ))}
          </div>
        </>
      )}

      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />

      {shareData && (
        <ShareModal
          isOpen={!!shareData}
          onClose={() => setShareData(null)}
          title={shareData.title}
          url={`${window.location.origin}/movie/${shareData.id}`}
        />
      )}

      {/* VIDEO PLAYER OVERLAY */}
      {activeVideo && activeVideo.videoUrl && (
        <VideoPlayer
          url={activeVideo.videoUrl}
          title={activeVideo.title}
          subtitleUrl={activeVideo.subtitleUrl}
          movieId={activeVideo._id}
          viewedContentId={
            ((activeVideo.mediaType === "series" ||
              activeVideo.mediaType === "tv") &&
            (activeVideo.initialEpisodeId || activeVideo.firstEpisode?._id)
              ? activeVideo.initialEpisodeId || activeVideo.firstEpisode?._id
              : activeVideo._id) || activeVideo._id
          }
          type={
            activeVideo.mediaType === "series" || activeVideo.mediaType === "tv"
              ? "tv"
              : "movie"
          }
          isEpisode={
            activeVideo.mediaType === "series" || activeVideo.mediaType === "tv"
          }
          episodes={activeVideo.episodes}
          initialEpisodeIndex={
            activeVideo.episodes?.findIndex(
              (ep) =>
                ep._id ===
                ((activeVideo.mediaType === "series" ||
                  activeVideo.mediaType === "tv") &&
                (activeVideo.initialEpisodeId || activeVideo.firstEpisode?._id)
                  ? activeVideo.initialEpisodeId ||
                    activeVideo.firstEpisode?._id
                  : activeVideo._id),
            ) ?? 0
          }
          startTime={activeVideo.startTime}
          introStartTime={activeVideo.introStartTime}
          introEndTime={activeVideo.introEndTime}
          signature={activeVideo.signature}
          drmLicenseToken={activeVideo.drmLicenseToken}
          drm={activeVideo.drm}
          playbackId={activeVideo.hlsFileName}
          adUrl={activeVideo.adSignedUrl}
          adDetails={activeVideo.adDetails}
          googleAd={activeVideo.GoogleAd}
          onClose={() => {
            setActiveVideo(null);
            router.replace(window.location.pathname);
          }}
        />
      )}
    </section>
  );
}

/* Icon Button */
