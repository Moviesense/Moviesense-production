"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";
import {
  Heart,
  Share2,
  Bookmark,
  Play,
  Volume2,
  VolumeX,
  Loader2,
} from "lucide-react";
import { useInView } from "react-intersection-observer";
import { useRouter } from "next/navigation";
import { ShortItem } from "@/types/shorts";
import {
  useToggleLike,
  useToggleFavorite,
  useUpdateViewedContent,
} from "@/hooks/useMovie";
import { ShareModal } from "@/components/Common/ShareModal";
import { useAuth } from "@/context/AuthContext";
import { useAnalytics } from "@/hooks/useAnalytics";
import { AnalyticsEventType } from "@/types/analytics";
import { useGoogleIma } from "@/hooks/useGoogleIma";

interface ShortPlayerProps {
  short: ShortItem;
  isActive: boolean;
  signedVideoUrl: string | null;
  googleAd?: boolean;
}

export function ShortPlayer({
  short,
  isActive,
  signedVideoUrl,
  googleAd = false,
}: ShortPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { track } = useAnalytics();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [likeCount, setLikeCount] = useState(short.totalLikes || 0);

  const playIconTimeout = useRef<NodeJS.Timeout | null>(null);
  const activeViewedContentIdRef = useRef<string | null>(null);
  const { mutate: updateViewedProgress } = useUpdateViewedContent();

  const { ref: inViewRef, inView } = useInView({
    threshold: 0.7,
  });

  const shortId = short._id;

  const [isLiked, setIsLiked] = useState(short.likeStatus ?? false);
  const [isFavorited, setIsFavorited] = useState(short.isFavorite ?? false);
  const toggleLikeMutation = useToggleLike();
  const toggleFavoriteMutation = useToggleFavorite();

  const adContainerRef = useRef<HTMLDivElement>(null);

  // Google IMA Ads
  const imaContentTimeRef = useRef<number>(0);
  const adsRequestedRef = useRef<boolean>(false);
  const { isImaAdPlaying, requestAds: requestImaAds } = useGoogleIma({
    adTagUrl: process.env.NEXT_PUBLIC_GOOGLE_AD_TAG_URL,
    videoElement: videoRef.current,
    adContainerElement: adContainerRef.current,
    onContentPause: () => {
      const video = videoRef.current;
      if (video) {
        imaContentTimeRef.current = video.currentTime;
        video.pause();
        setIsPlaying(false);
      }
    },
    onContentResume: () => {
      const video = videoRef.current;
      if (video) {
        video.currentTime = imaContentTimeRef.current;
        video.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    },
    onAllAdsCompleted: () => {},
    onAdError: (err) => {
      console.error("ShortPlayer Google IMA ad error:", err);
      videoRef.current?.play().then(() => setIsPlaying(true)).catch(() => {});
    },
    enabled: googleAd,
  });

  // Setup HLS once we have the signed video URL
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !signedVideoUrl) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        startLevel: -1,
        capLevelToPlayerSize: true,
      });
      hls.loadSource(signedVideoUrl);
      hls.attachMedia(video);
      hlsRef.current = hls;

      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = signedVideoUrl;
    }
  }, [signedVideoUrl]);

  // Auto-play/pause based on visibility
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !signedVideoUrl) return;

    if (inView && isActive) {
      video
        .play()
        .then(() => {
          setIsPlaying(true);
          // Trigger Google IMA ad if enabled
          if (googleAd && !isImaAdPlaying && !adsRequestedRef.current) {
            adsRequestedRef.current = true;
            requestImaAds();
          }
        })
        .catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [inView, isActive, signedVideoUrl]);

  // Progress tracking
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (duration > 0 && isFinite(duration)) {
        setProgress((video.currentTime / duration) * 100);
      }
    };

    const handleDurationChange = () => {
      if (video.duration && isFinite(video.duration)) {
        setDuration(video.duration);
      }
    };

    const handleLoadedMetadata = () => {
      if (video.duration && isFinite(video.duration)) {
        setDuration(video.duration);
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("durationchange", handleDurationChange);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("durationchange", handleDurationChange);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [duration]);

  // Track viewed content every 5 seconds while playing
  useEffect(() => {
    if (!isPlaying || !isAuthenticated) return;

    const interval = setInterval(() => {
      const video = videoRef.current;
      if (!video) return;

      const currentTimeMs = Math.floor(video.currentTime * 1000);
      const durationMs = Math.floor((duration || video.duration || 0) * 1000);

      if (currentTimeMs > 0) {
        const deviceId = localStorage.getItem("deviceId") || "";
        updateViewedProgress(
          {
            ...(activeViewedContentIdRef.current && {
              viewedContentId: activeViewedContentIdRef.current,
            }),
            endTime: currentTimeMs,
            incrementTime: 5000,
            type: "movie",
            movieId: shortId,
            deviceId: deviceId,
            deviceType: "web",
            isCompleted: currentTimeMs >= durationMs - 5000 && durationMs > 0,
          },
          {
            onSuccess: (data) => {
              if (data?.status && data?.viewedContentId) {
                activeViewedContentIdRef.current = data.viewedContentId;
              }
            },
          },
        );
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isPlaying, isAuthenticated, duration, shortId, updateViewedProgress]);

  // Reset viewed content tracking when short changes
  useEffect(() => {
    activeViewedContentIdRef.current = null;
    adsRequestedRef.current = false;
  }, [shortId]);

  // Loop video + track completion
  const handleEnded = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    // Send completion to viewed-content API
    if (isAuthenticated) {
      const durationMs = Math.floor((duration || video.duration || 0) * 1000);
      if (durationMs > 0) {
        const deviceId = localStorage.getItem("deviceId") || "";
        updateViewedProgress(
          {
            ...(activeViewedContentIdRef.current && {
              viewedContentId: activeViewedContentIdRef.current,
            }),
            endTime: durationMs,
            incrementTime: 0,
            type: "movie",
            movieId: shortId,
            deviceId,
            deviceType: "web",
            isCompleted: true,
          },
          {
            onSuccess: (data) => {
              if (data?.status && data?.viewedContentId) {
                activeViewedContentIdRef.current = data.viewedContentId;
              }
            },
          },
        );
      }
    }

    video.currentTime = 0;
    video.play().catch(() => {});
  }, [isAuthenticated, duration, shortId, updateViewedProgress]);

  const handleTap = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }

    // Flash play/pause icon
    setShowPlayIcon(true);
    if (playIconTimeout.current) clearTimeout(playIconTimeout.current);
    playIconTimeout.current = setTimeout(() => setShowPlayIcon(false), 600);
  }, []);

  const handleMuteToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  const handleLike = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }
      if (toggleLikeMutation.isPending) return;

      try {
        if (!isLiked) {
          track(AnalyticsEventType.clickLikeMovie, shortId);
          setLikeCount((prev) => prev + 1);
        } else {
          setLikeCount((prev) => Math.max(0, prev - 1));
        }
        setIsLiked(!isLiked);
        await toggleLikeMutation.mutateAsync({
          movieId: shortId,
          type: "shorts",
        });
      } catch (error) {
        console.error("Error toggling like:", error);
        setLikeCount(short.totalLikes || 0);
        setIsLiked(short.likeStatus ?? false);
      }
    },
    [
      isAuthenticated,
      shortId,
      toggleLikeMutation,
      router,
      isLiked,
      track,
      short,
    ],
  );

  const handleFavorite = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }
      if (toggleFavoriteMutation.isPending) return;

      setIsFavorited(!isFavorited);
      toggleFavoriteMutation.mutate({ movieId: shortId, type: "shorts" });
      if (!isFavorited) {
        track(AnalyticsEventType.addMyList, shortId);
      }
    },
    [
      isAuthenticated,
      shortId,
      toggleFavoriteMutation,
      router,
      isFavorited,
      track,
    ],
  );

  const handleShare = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      track(AnalyticsEventType.clickShareMovie, shortId);
      setIsShareOpen(true);
    },
    [track, shortId],
  );

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      const video = videoRef.current;
      if (!video || !video.duration) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = x / rect.width;
      video.currentTime = pct * video.duration;
    },
    [],
  );

  // Strip HTML from description
  const plainDescription = short.description?.replace(/<[^>]*>/g, "").trim();

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/shorts/${shortId}`
      : "";

  const thumbnailUrl = short.thumbnail || short.image;

  const formatCount = (count: number) => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + "M";
    if (count >= 1000) return (count / 1000).toFixed(1) + "k";
    return count.toString();
  };

  return (
    <div
      ref={inViewRef}
      className="relative w-full h-[100dvh] sm:h-[calc(100dvh-4rem)] snap-start snap-always bg-black flex items-center justify-center overflow-hidden"
      onClick={handleTap}
    >
      {/* Video */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline
        muted={isMuted}
        preload="metadata"
        poster={thumbnailUrl}
        onEnded={handleEnded}
      />

      {/* Google IMA Ad Container */}
      {googleAd && (
        <div
          ref={adContainerRef}
          className="absolute inset-0 z-50"
          style={{ display: isImaAdPlaying ? "block" : "none" }}
        />
      )}

      {/* Loading spinner while waiting for signed URL */}
      {!signedVideoUrl && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      )}

      {/* Play/Pause flash icon */}
      {showPlayIcon && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="w-16 h-16 bg-black/40 rounded-full flex items-center justify-center animate-ping-once">
            <Play
              size={32}
              className={`text-white ${isPlaying ? "hidden" : ""}`}
              fill="white"
            />
          </div>
        </div>
      )}

      {/* Gradient overlays */}
      <div className="absolute bottom-0 left-0 right-0 h-60 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />

      {/* Mute button - top right */}
      <button
        onClick={handleMuteToggle}
        className="absolute top-20 right-4 z-20 w-9 h-9 bg-black/40 rounded-full flex items-center justify-center cursor-pointer"
      >
        {isMuted ? (
          <VolumeX size={18} className="text-white" />
        ) : (
          <Volume2 size={18} className="text-white" />
        )}
      </button>

      {/* Right sidebar actions */}
      <div className="absolute right-3 bottom-36 sm:bottom-40 flex flex-col items-center gap-6 z-20">
        {/* Like */}
        <button
          onClick={handleLike}
          className="flex flex-col items-center gap-1 cursor-pointer"
        >
          <div className="w-10 h-10 flex items-center justify-center">
            <Heart
              size={28}
              className={isLiked ? "fill-primary text-primary" : "text-white"}
            />
          </div>
          <span className="text-white text-xs font-medium">
            {formatCount(likeCount)}
          </span>
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          className="flex flex-col items-center gap-1 cursor-pointer"
        >
          <div className="w-10 h-10 flex items-center justify-center">
            <Share2 size={26} className="text-white" />
          </div>
          <span className="text-white text-xs font-medium">Share</span>
        </button>

        {/* Bookmark */}
        <button
          onClick={handleFavorite}
          className="flex flex-col items-center gap-1 cursor-pointer"
        >
          <div className="w-10 h-10 flex items-center justify-center">
            <Bookmark
              size={26}
              className={
                isFavorited ? "text-primary fill-primary" : "text-white"
              }
            />
          </div>
        </button>
      </div>

      {/* Bottom info */}
      <div
        className="absolute bottom-8 left-3 right-16 z-20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <div
          className="flex items-center gap-2 mb-2 cursor-pointer"
          // onClick={() => router.push(`/movie/${shortId}`)}
        >
          {thumbnailUrl && (
            <img
              src={thumbnailUrl}
              alt={short.title}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full object-cover"
            />
          )}
          <span className="text-white font-bold text-sm truncate">
            {short.title}
          </span>
        </div>

        {/* Description */}
        {plainDescription && (
          <div className="text-white/80 text-xs leading-relaxed">
            {isDescExpanded ? (
              <p>
                {plainDescription}{" "}
                <button
                  onClick={() => setIsDescExpanded(false)}
                  className="text-white font-medium cursor-pointer"
                >
                  Less
                </button>
              </p>
            ) : (
              <p>
                {plainDescription.length > 80
                  ? plainDescription.slice(0, 80) + "..."
                  : plainDescription}{" "}
                {plainDescription.length > 80 && (
                  <button
                    onClick={() => setIsDescExpanded(true)}
                    className="text-white font-medium cursor-pointer"
                  >
                    Expand
                  </button>
                )}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-30 cursor-pointer"
        onClick={handleProgressClick}
      >
        <div
          className="h-full bg-primary transition-[width] duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Share modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title={short.title}
        url={shareUrl}
      />
    </div>
  );
}
