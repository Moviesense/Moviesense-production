"use client";

import React, { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}
import Hls from "hls.js";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  RotateCcw,
  RotateCw,
  Settings,
  Subtitles,
  X,
  SkipBack,
  SkipForward,
  Loader2,
} from "lucide-react";
import { Button } from "./Button";
import { cn, getYouTubeVideoId } from "@/lib/utils";
import { movieService } from "@/services/movieService";
import { Subtitle, Episode } from "@/types/movie";
import { SubtitleMenu } from "./SubtitleMenu";
import { useUpdateViewedContent } from "@/hooks/useMovie";
import { SubscriptionModal } from "./SubscriptionModal";
import { useAuth } from "@/context/AuthContext";
import { SettingsMenu, QualityLevel } from "./SettingsMenu";
import { useAnalytics } from "@/hooks/useAnalytics";
import { AnalyticsEventType } from "@/types/analytics";
import { useGoogleIma } from "@/hooks/useGoogleIma";

interface VideoPlayerProps {
  url: string;
  title?: string;
  subtitleUrl?: string;
  onClose: () => void;
  movieId: string | number;
  viewedContentId: string | number;
  type: "movie" | "tv";
  isEpisode?: boolean;
  episodes?: Episode[];
  initialEpisodeIndex?: number;
  startTime?: number;
  introStartTime?: number;
  introEndTime?: number;
  signature?: string;
  drmLicenseToken?: string;
  drm?: boolean;
  playbackId?: string;
  adUrl?: string;
  adDetails?: {
    skippable: boolean;
    skipTimeSeconds: number;
    title: string;
    adId?: string;
    _id?: string;
    redirectUrl?: string;
  };
  googleAd?: boolean;
  hasNextSeasonEpisode?: boolean;
  hasPrevSeasonEpisode?: boolean;
  onNextEpisodeRequest?: () => void;
  onPrevEpisodeRequest?: () => void;
}

export function VideoPlayer({
  url,
  title,
  subtitleUrl,
  onClose,
  movieId,
  viewedContentId,
  type,
  isEpisode = false,
  episodes = [],
  initialEpisodeIndex = 0,
  startTime,
  introStartTime: initialIntroStartTime,
  introEndTime: initialIntroEndTime,
  signature,
  drmLicenseToken,
  drm: drmEnabled = false,
  playbackId,
  adUrl,
  adDetails,
  googleAd = false,
  hasNextSeasonEpisode = false,
  hasPrevSeasonEpisode = false,
  onNextEpisodeRequest,
  onPrevEpisodeRequest,
}: VideoPlayerProps) {
  const [currentUrl, setCurrentUrl] = useState(url);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentViewedContentId, setCurrentViewedContentId] =
    useState(viewedContentId);
  const [currentIndex, setCurrentIndex] = useState(initialEpisodeIndex);
  const [isLoadingEpisode, setIsLoadingEpisode] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const { isSubscribed } = useAuth();

  const [currentDrmToken, setCurrentDrmToken] = useState(drmLicenseToken);
  const [currentSignature, setCurrentSignature] = useState(signature);
  const [currentPlaybackId, setCurrentPlaybackId] = useState(playbackId);
  const [currentDrmEnabled, setCurrentDrmEnabled] = useState(drmEnabled);

  const [introStartTime, setIntroStartTime] = useState<number | undefined>(
    initialIntroStartTime,
  );
  const [introEndTime, setIntroEndTime] = useState<number | undefined>(
    initialIntroEndTime,
  );
  const [isIntroSkipped, setIsIntroSkipped] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const { track } = useAnalytics();

  // Ad State
  const [isAdPlaying, setIsAdPlaying] = useState(!!adUrl);
  const [currentAdUrl, setCurrentAdUrl] = useState(adUrl);
  const [currentAdDetails, setCurrentAdDetails] = useState(adDetails);
  const [adCountdown, setAdCountdown] = useState(0);
  const [canSkipAd, setCanSkipAd] = useState(false);

  const handleSkipAd = () => {
    track(
      AnalyticsEventType.adSkipped,
      movieId.toString(),
      isEpisode ? currentViewedContentId?.toString() : undefined,
      currentAdDetails?.adId || currentAdDetails?._id,
    );
    setIsAdPlaying(false);
    setResumeTime(startTime);
  };

  const [resumeTime, setResumeTime] = useState<number | undefined>(startTime);
  const containerRef = useRef<HTMLDivElement>(null);
  const adContainerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const activeViewedContentIdRef = useRef<string | null>(null);
  const [selectedSubtitleId, setSelectedSubtitleId] = useState<string | null>(
    null,
  );
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([]);
  const [currentQualityIndex, setCurrentQualityIndex] = useState<number>(-1);

  // Handle Ad Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAdPlaying && currentAdDetails?.skippable && isPlaying) {
      timer = setInterval(() => {
        setAdCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanSkipAd(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isAdPlaying, currentAdDetails, isPlaying]);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const hlsRef = useRef<Hls | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const volumeRef = useRef<HTMLDivElement>(null);
  const ytPlayerRef = useRef<any>(null);
  const [isYoutubeReady, setIsYoutubeReady] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const { mutate: updateProgress } = useUpdateViewedContent();
  const lastUpdateTimeRef = useRef<number>(0);
  const isYoutube =
    !isAdPlaying &&
    (currentUrl.includes("youtube.com") || currentUrl.includes("youtu.be"));

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
      // Detach HLS so IMA can use the video element
      if (hlsRef.current) {
        hlsRef.current.detachMedia();
      }
    },
    onContentResume: () => {
      const video = videoRef.current;
      if (video && hlsRef.current) {
        hlsRef.current.attachMedia(video);
        hlsRef.current.once(Hls.Events.MANIFEST_PARSED, () => {
          video.currentTime = imaContentTimeRef.current;
          video
            .play()
            .then(() => setIsPlaying(true))
            .catch(() => {});
        });
        hlsRef.current.loadSource(currentUrl);
      } else if (video) {
        video.currentTime = imaContentTimeRef.current;
        video
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => {});
      }
    },
    onAllAdsCompleted: () => {},
    onAdError: (err) => {
      console.error("Google IMA ad error, playing content:", err);
      // On error, just play the content
      const video = videoRef.current;
      if (video) {
        video
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => {});
      }
    },
    enabled: googleAd,
  });
  const anyAdPlaying = isAdPlaying || isImaAdPlaying;

  const processSubtitleContent = (text: string, isSrt: boolean) => {
    let vttText = isSrt ? "WEBVTT\n\n" : "";

    if (isSrt) {
      vttText += text.replace(/(\d\d:\d\d:\d\d),(\d\d\d)/g, "$1.$2"); // Replace commas with dots
    } else {
      vttText += text;
    }

    // Lift subtitles by adding line:85% to timestamps
    vttText = vttText
      .replace(
        /(\d\d:\d\d:\d\d\.\d\d\d\s*-->\s*\d\d:\d\d:\d\d\.\d\d\d)/g,
        "$1 line:85%",
      )
      .replace(/\r/g, ""); // Remove carriage returns

    return vttText;
  };

  const fetchedMovieIdRef = useRef<string | number | null>(null);

  useEffect(() => {
    setCurrentUrl(url);
    setCurrentTitle(title);
    setCurrentViewedContentId(viewedContentId);
    setCurrentIndex(initialEpisodeIndex);
    setIntroStartTime(initialIntroStartTime);
    setIntroEndTime(initialIntroEndTime);
    setCurrentDrmToken(drmLicenseToken);
    setCurrentSignature(signature);
    setCurrentPlaybackId(playbackId);
    setCurrentDrmEnabled(drmEnabled);
    setIsAdPlaying(!!adUrl);
    setCurrentAdUrl(adUrl);
    setCurrentAdDetails(adDetails);
    setAdCountdown(adDetails?.skipTimeSeconds || 0);
    setCanSkipAd(false);
    adsRequestedRef.current = false;
  }, [
    url,
    title,
    viewedContentId,
    initialEpisodeIndex,
    initialIntroStartTime,
    initialIntroEndTime,
    signature,
    drmLicenseToken,
    playbackId,
    drmEnabled,
    adUrl,
    adDetails,
  ]);

  useEffect(() => {
    activeViewedContentIdRef.current = null;
  }, [currentViewedContentId]);

  useEffect(() => {
    // if (isYoutube) return;

    // If we already fetched for this content ID, don't fetch again
    if (fetchedMovieIdRef.current === currentViewedContentId) return;

    const fetchSubtitles = async () => {
      setSubtitles([]);
      setSelectedSubtitleId(null);
      fetchedMovieIdRef.current = currentViewedContentId;
      activeViewedContentIdRef.current = null; // Reset progress tracking for new episode

      try {
        const response = isEpisode
          ? await movieService.getEpisodeSubtitles(currentViewedContentId)
          : await movieService.getSubtitles(currentViewedContentId);

        // Check if we've switched episodes while fetching
        if (currentViewedContentId !== fetchedMovieIdRef.current) return;

        if (response.status) {
          const processedSubtitles = await Promise.all(
            response.subtitles.map(async (sub) => {
              const isSrt = sub.file.endsWith(".srt");
              const isVtt = sub.file.endsWith(".vtt");

              if (isSrt || isVtt) {
                try {
                  const proxyUrl = `/api/subtitle-proxy?url=${encodeURIComponent(
                    sub.file,
                  )}`;
                  const res = await fetch(proxyUrl);
                  if (!res.ok)
                    throw new Error(`Proxy fetch failed: ${res.statusText}`);
                  const text = await res.text();

                  const vttText = processSubtitleContent(text, isSrt);
                  const blob = new Blob([vttText], { type: "text/vtt" });
                  return {
                    ...sub,
                    file: URL.createObjectURL(blob),
                    isConverted: true,
                  };
                } catch (e) {
                  console.error(
                    `VideoPlayer: Error processing ${isSrt ? "SRT" : "VTT"}:`,
                    e,
                  );
                  return sub;
                }
              }
              return sub;
            }),
          );
          setSubtitles(processedSubtitles);

          // Set default subtitle if available
          const defaultSub = processedSubtitles.find((s) => s.isDefault);
          if (defaultSub) {
            setSelectedSubtitleId(defaultSub._id);
          } else if (processedSubtitles.length > 0) {
            // Optional: Select first available if no default?
            // For now, let's stick to explicit default or off.
            setSelectedSubtitleId(processedSubtitles[0]._id);
          }
        }
      } catch (error) {
        console.error("VideoPlayer: Error fetching subtitles:", error);
        fetchedMovieIdRef.current = null;
      }
    };

    fetchSubtitles();

    return () => {
      // We don't necessarily want to reset isFetchingRef here immediately if it's just a strict mode double-invoke.
      // But if movieId changes, we DO want to fetch again.
      // Actually, the best way to handle Strict Mode double-invoke AND prop changes is:
      // The ref should track the *current* movieId being fetched..
    };
  }, [movieId, isYoutube, isEpisode, currentViewedContentId]);

  useEffect(() => {
    return () => {
      // Cleanup Blob URLs
      subtitles.forEach((sub: any) => {
        if (sub.isConverted && sub.file.startsWith("blob:")) {
          URL.revokeObjectURL(sub.file);
        }
      });
    };
  }, [subtitles]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;
    const sourceUrl =
      isAdPlaying && currentAdUrl ? currentAdUrl : currentUrl;
    const isHlsSource = /\.m3u8(\?|#|$)/i.test(sourceUrl);

    // Direct file (mp4/webm/etc.) — bypass hls.js and play natively
    if (!isHlsSource) {
      setQualityLevels([]);
      setCurrentQualityIndex(-1);
      // Drop CORS so files without ACAO headers still play.
      video.removeAttribute("crossorigin");
      const handleLoadedMetadata = () => {
        const startPos =
          isAdPlaying || resumeTime === undefined ? 0 : resumeTime;
        video.currentTime = startPos;
        video.playbackRate = playbackSpeed;
        video
          .play()
          .then(() => setIsIntroSkipped(false))
          .catch((err) => {
            console.error("VideoPlayer native play() failed:", err);
            setIsPlaying(false);
          });
      };
      const handleError = () => {
        const mediaErr = video.error;
        console.error(
          "VideoPlayer native source error:",
          mediaErr?.code,
          mediaErr?.message,
          sourceUrl,
        );
      };
      video.addEventListener("loadedmetadata", handleLoadedMetadata, {
        once: true,
      });
      video.addEventListener("error", handleError);
      video.src = sourceUrl;
      video.load();
      return () => {
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
        video.removeEventListener("error", handleError);
      };
    }

    if (Hls.isSupported()) {
      const hlsConfig: any = {
        emeEnabled: currentDrmEnabled && !!currentDrmToken,
      };

      if (currentDrmEnabled && currentDrmToken && currentPlaybackId) {
        hlsConfig.drmSystems = {
          "com.widevine.alpha": {
            licenseUrl: `https://license.mux.com/license/widevine/${currentPlaybackId}?token=${currentDrmToken}`,
          },
          "com.microsoft.playready": {
            licenseUrl: `https://license.mux.com/license/playready/${currentPlaybackId}?token=${currentDrmToken}`,
          },
        };
      }

      hls = new Hls(hlsConfig);
      hlsRef.current = hls;
      hls.loadSource(isAdPlaying && currentAdUrl ? currentAdUrl : currentUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        const levels = data.levels.map((level, index) => ({
          index,
          label: level.height ? `${level.height}p` : `Level ${index}`,
          height: level.height,
        }));
        setQualityLevels(levels);

        // Resume playback
        const startPos =
          isAdPlaying || resumeTime === undefined ? 0 : resumeTime;
        video.currentTime = startPos;

        video.playbackRate = playbackSpeed;
        video
          .play()
          .then(() => {
            setIsIntroSkipped(false);
            // Trigger Google IMA pre-roll ad after content is ready
            if (googleAd && !isAdPlaying && !adsRequestedRef.current) {
              adsRequestedRef.current = true;
              requestImaAds();
            }
          })
          .catch(() => setIsPlaying(false));
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        if (hls && hls.autoLevelEnabled) {
          setCurrentQualityIndex(-1);
        } else {
          setCurrentQualityIndex(data.level);
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = isAdPlaying && currentAdUrl ? currentAdUrl : currentUrl;
      video.addEventListener("loadedmetadata", () => {
        const startPos =
          isAdPlaying || resumeTime === undefined ? 0 : resumeTime;
        video.currentTime = startPos;

        video.playbackRate = playbackSpeed;
        video
          .play()
          .then(() => {
            setIsIntroSkipped(false);
          })
          .catch(() => setIsPlaying(false));
      });
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [
    currentUrl,
    movieId,
    isYoutube,
    currentViewedContentId,
    resumeTime,
    currentDrmEnabled,
    currentDrmToken,
    currentPlaybackId,
    currentAdUrl,
    isAdPlaying,
  ]);

  useEffect(() => {
    if (!isYoutube) return;

    const videoId = getYouTubeVideoId(currentUrl);
    if (!videoId) return;

    const loadYoutubeApi = () => {
      if (window.YT && window.YT.Player) {
        initializePlayer(videoId);
        return;
      }

      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        initializePlayer(videoId);
      };
    };

    const initializePlayer = (id: string) => {
      let startSeconds = 0;
      if (resumeTime !== undefined && resumeTime > 0) {
        startSeconds = Math.floor(resumeTime);
      } else {
        startSeconds = 0;
      }

      ytPlayerRef.current = new window.YT.Player("youtube-player", {
        videoId: id,
        playerVars: {
          autoplay: 1,
          controls: 1,
          rel: 0,
          showinfo: 0,
          modestbranding: 1,
          start: startSeconds,
        },
        events: {
          onReady: () => setIsYoutubeReady(true),
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
            } else if (event.data === window.YT.PlayerState.ENDED) {
              setIsPlaying(false);
              handleYoutubeEnded();
            }
          },
        },
      });
    };

    const handleYoutubeEnded = () => {
      if (ytPlayerRef.current) {
        const durationMs = Math.floor(ytPlayerRef.current.getDuration() * 1000);
        const deviceId = localStorage.getItem("deviceId") || "";

        // Remove YouTube progress from localStorage on completion
        localStorage.removeItem(`yt_resume_${currentViewedContentId}`);

        updateProgress(
          {
            ...(activeViewedContentIdRef.current && {
              viewedContentId: activeViewedContentIdRef.current,
            }),
            endTime: durationMs,
            incrementTime: 0,
            type: type,
            movieId: movieId.toString(),
            episodeId: isEpisode ? currentViewedContentId.toString() : null,
            deviceId: deviceId,
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
    };

    loadYoutubeApi();

    return () => {
      if (ytPlayerRef.current) {
        ytPlayerRef.current.destroy();
      }
    };
  }, [
    currentUrl,
    isYoutube,
    currentViewedContentId,
    movieId,
    type,
    updateProgress,
    resumeTime,
  ]);

  useEffect(() => {
    if (!isYoutube || !isYoutubeReady || !isPlaying) return;

    const interval = setInterval(() => {
      if (ytPlayerRef.current) {
        const time = ytPlayerRef.current.getCurrentTime();
        const dur = ytPlayerRef.current.getDuration();
        setCurrentTime(time);
        setDuration(dur);
        if (dur > 0) {
          setProgress((time / dur) * 100);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isYoutube, isYoutubeReady, isPlaying, movieId, currentViewedContentId]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      const duration = video.duration;
      if (duration > 0) {
        setProgress((video.currentTime / duration) * 100);
      } else {
        setProgress(0);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, [currentViewedContentId, movieId]);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      let currentTimeMs = 0;
      let durationMs = 0;

      if (isYoutube && ytPlayerRef.current && isYoutubeReady) {
        currentTimeMs = Math.floor(ytPlayerRef.current.getCurrentTime() * 1000);
        durationMs = Math.floor(ytPlayerRef.current.getDuration() * 1000);

        // Save YouTube progress to localStorage
        if (currentTimeMs > 0) {
          localStorage.setItem(
            `yt_resume_${currentViewedContentId}`,
            (currentTimeMs / 1000).toString(),
          );
        }
      } else if (videoRef.current) {
        currentTimeMs = Math.floor(videoRef.current.currentTime * 1000);
        durationMs = Math.floor(videoRef.current.duration * 1000);
      }

      if (currentTimeMs > 0 || isYoutube) {
        const deviceId = localStorage.getItem("deviceId") || "";
        updateProgress(
          {
            ...(activeViewedContentIdRef.current && {
              viewedContentId: activeViewedContentIdRef.current,
            }),
            endTime: currentTimeMs,
            incrementTime: 5000,
            type: type,
            movieId: movieId.toString(),
            episodeId: isEpisode ? currentViewedContentId.toString() : null,
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
  }, [
    isPlaying,
    currentViewedContentId,
    movieId,
    type,
    updateProgress,
    isYoutube,
    isYoutubeReady,
  ]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      if (isAdPlaying) {
        track(
          AnalyticsEventType.adWatched,
          movieId.toString(),
          isEpisode ? currentViewedContentId?.toString() : undefined,
          currentAdDetails?.adId || currentAdDetails?._id,
        );
        setIsAdPlaying(false);
        setResumeTime(startTime);
        return;
      }
      const durationMs = Math.floor(video.duration * 1000);
      const deviceId = localStorage.getItem("deviceId") || "";

      updateProgress(
        {
          ...(activeViewedContentIdRef.current && {
            viewedContentId: activeViewedContentIdRef.current,
          }),
          endTime: durationMs,
          incrementTime: 0,
          type: type,
          movieId: movieId.toString(),
          episodeId: isEpisode ? currentViewedContentId.toString() : null,
          deviceId: deviceId,
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
    };

    video.addEventListener("ended", handleEnded);
    return () => video.removeEventListener("ended", handleEnded);
  }, [
    currentViewedContentId,
    movieId,
    type,
    updateProgress,
    isAdPlaying,
    track,
    currentAdDetails,
    startTime,
    isEpisode,
  ]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const tracks = video.textTracks;
    // Hide all tracks first
    for (let i = 0; i < tracks.length; i++) {
      tracks[i].mode = "hidden";
    }

    // Enable the selected track
    if (selectedSubtitleId) {
      const selectedSub = subtitles.find((s) => s._id === selectedSubtitleId);
      if (selectedSub) {
        // Find the track index that corresponds to this subtitle
        // Note: The order of tracks in video.textTracks matches the order of <track> elements
        const trackIndex = subtitles.findIndex(
          (s) => s._id === selectedSubtitleId,
        );
        if (trackIndex !== -1 && trackIndex < tracks.length) {
          tracks[trackIndex].mode = "showing";
        }
      }
    }
  }, [selectedSubtitleId, subtitles]);

  const togglePlay = () => {
    if (isYoutube && ytPlayerRef.current && isYoutubeReady) {
      if (isPlaying) {
        ytPlayerRef.current.pauseVideo();
      } else {
        ytPlayerRef.current.playVideo();
      }
      return;
    }
    if (videoRef.current?.paused) {
      track(AnalyticsEventType.clickPlay, movieId.toString());
      videoRef.current.play();
    } else {
      track(AnalyticsEventType.clickPause, movieId.toString());
      videoRef.current?.pause();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = (parseFloat(e.target.value) / 100) * duration;
    if (isYoutube && ytPlayerRef.current && isYoutubeReady) {
      ytPlayerRef.current.seekTo(time, true);
      return;
    }
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const toggleMute = () => {
    if (isYoutube && ytPlayerRef.current && isYoutubeReady) {
      if (isMuted) {
        ytPlayerRef.current.unMute();
      } else {
        ytPlayerRef.current.mute();
      }
      setIsMuted(!isMuted);
      return;
    }
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (isYoutube && ytPlayerRef.current && isYoutubeReady) {
      ytPlayerRef.current.setVolume(val * 100);
      if (val === 0) {
        ytPlayerRef.current.mute();
        setIsMuted(true);
      } else {
        ytPlayerRef.current.unMute();
        setIsMuted(false);
      }
      return;
    }
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !showSubtitleMenu && !showVolumeSlider)
        setShowControls(false);
    }, 3000);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        volumeRef.current &&
        !volumeRef.current.contains(event.target as Node)
      ) {
        setShowVolumeSlider(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!showControls) {
      setShowVolumeSlider(false);
    }
  }, [showControls]);

  const formatTime = (time: number) => {
    const h = Math.floor(time / 3600);
    const m = Math.floor((time % 3600) / 60);
    const s = Math.floor(time % 60);
    return `${h > 0 ? h + ":" : ""}${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  };

  const handleSubtitleSelect = (id: string | null) => {
    track(AnalyticsEventType.clickShowSubtitle, movieId.toString());
    setSelectedSubtitleId(id);
    setShowSubtitleMenu(false);
  };

  const handleQualitySelect = (index: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = index;
      setCurrentQualityIndex(index);
    }
    setShowQualityMenu(false);
  };

  const handlePlaybackSpeedSelect = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowQualityMenu(false);
  };

  const handleSkip = (seconds: number) => {
    if (isYoutube && ytPlayerRef.current && isYoutubeReady) {
      const currentTime = ytPlayerRef.current.getCurrentTime();
      ytPlayerRef.current.seekTo(currentTime + seconds, true);
      return;
    }
    if (videoRef.current) {
      if (seconds > 0) {
        track(AnalyticsEventType.clickNext, movieId.toString());
      } else {
        track(AnalyticsEventType.clickPrevious, movieId.toString());
      }
      videoRef.current.currentTime += seconds;
    }
  };

  const playEpisode = async (index: number) => {
    const episode = episodes[index];
    if (!episode) return;

    try {
      setIsLoadingEpisode(true);

      // Check for episode-specific ad
      if (episode.customAd && episode.adDetails?.hlsFileName) {
        try {
          const adResponse = await movieService.getSignedUrl(
            episode.adDetails.hlsFileName,
            episode.adDetails.drmEnabled || false,
          );
          if (adResponse.signedVideoUrl) {
            setIsAdPlaying(true);
            setCurrentAdUrl(adResponse.signedVideoUrl);
            setCurrentAdDetails(episode.adDetails);
            setAdCountdown(episode.adDetails?.skipTimeSeconds || 0);
            setCanSkipAd(false);
          }
        } catch (error) {
          console.error("Error fetching episode ad:", error);
        }
      }

      // If it's an external link (YouTube)
      if (episode.videoType === 0 && episode.link) {
        const savedTime = localStorage.getItem(`yt_resume_${episode._id}`);
        const newResumeTime = savedTime ? parseFloat(savedTime) : 0;

        setCurrentUrl(episode.link);
        setCurrentTitle(episode.name);
        setCurrentViewedContentId(episode._id);
        setCurrentIndex(index);
        setProgress(0);
        setCurrentTime(0);
        setResumeTime(newResumeTime);
        return;
      }

      if (episode.hlsFileName) {
        const response = await movieService.getSignedUrl(
          episode.hlsFileName,
          episode.drmEnabled || false,
        );

        if (
          response.isPremiumRequired ||
          (response.type === "PREMIUM" && !isSubscribed)
        ) {
          setShowSubscriptionModal(true);
          return;
        }

        if (response.signedVideoUrl) {
          const newResumeTime = response.lastViewedData?.endTime
            ? response.lastViewedData.endTime / 1000
            : 0;

          setCurrentUrl(response.signedVideoUrl);
          setCurrentTitle(episode.name);
          setCurrentViewedContentId(episode._id);
          setCurrentIndex(index);
          setProgress(0);
          setCurrentTime(0);
          setResumeTime(newResumeTime);
          setIntroStartTime(response.introStartTime);
          setIntroEndTime(response.introEndTime);

          // Update DRM state for the new episode
          setCurrentDrmToken(response.drmLicenseToken);
          setCurrentSignature(response.signature);
          setCurrentPlaybackId(response.hlsFileName);
          setCurrentDrmEnabled(response.drm || false);
        }
      }
    } catch (error) {
      console.error("Error switching episode:", error);
    } finally {
      setIsLoadingEpisode(false);
    }
  };

  const skipIntro = () => {
    if (introEndTime === undefined) return;
    if (isYoutube && ytPlayerRef.current && isYoutubeReady) {
      ytPlayerRef.current.seekTo(introEndTime, true);
    } else if (videoRef.current) {
      videoRef.current.currentTime = introEndTime;
    }
    setIsIntroSkipped(true);
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      playEpisode(currentIndex - 1);
      setIsIntroSkipped(true);
    } else if (onPrevEpisodeRequest) {
      onPrevEpisodeRequest();
    }
  };

  const handleNext = () => {
    if (currentIndex < episodes.length - 1) {
      playEpisode(currentIndex + 1);
      setIsIntroSkipped(true);
    } else if (onNextEpisodeRequest) {
      onNextEpisodeRequest();
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[1001] bg-black flex items-center justify-center group select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={() =>
        isPlaying && !showSubtitleMenu && setShowControls(false)
      }
    >
      {isYoutube ? (
        <div id="youtube-player" className="w-full h-full" />
      ) : (
        <video
          ref={videoRef}
          className="w-full h-full"
          onClick={() => {
            if (isAdPlaying && currentAdDetails?.redirectUrl) {
              track(
                AnalyticsEventType.adClicked,
                movieId.toString(),
                isEpisode ? currentViewedContentId?.toString() : undefined,
                currentAdDetails?.adId || currentAdDetails?._id,
              );
              window.open(currentAdDetails.redirectUrl, "_blank");
              videoRef.current?.pause();
              setIsPlaying(false);
            } else {
              togglePlay();
            }
          }}
          playsInline
          crossOrigin="anonymous"
        >
          {subtitles.map((sub) => (
            <track
              key={sub._id}
              kind="subtitles"
              src={sub.file}
              srcLang={sub.language.uniqueId.toLowerCase()}
              label={sub.language.name}
              default={sub._id === selectedSubtitleId}
            />
          ))}
          {/* Fallback for single subtitleUrl prop if needed, though we primarily use the subtitles array now */}
          {subtitleUrl && !subtitles.find((s) => s.file === subtitleUrl) && (
            <track
              kind="subtitles"
              src={subtitleUrl}
              srcLang="en"
              label="English"
            />
          )}
        </video>
      )}

      {/* Google IMA Ad Container */}
      {googleAd && (
        <div
          ref={adContainerRef}
          className="absolute inset-0 z-[105]"
          style={{
            opacity: isImaAdPlaying ? 1 : 0,
            pointerEvents: isImaAdPlaying ? "auto" : "none",
          }}
        />
      )}

      {/* SKIP INTRO BUTTON */}
      {!isIntroSkipped &&
        introStartTime !== undefined &&
        introEndTime !== undefined &&
        currentTime >= introStartTime &&
        currentTime <= introEndTime && (
          <Button
            variant="custom"
            className="absolute bottom-28 right-8 z-[100] bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-md font-medium transition-all duration-300 flex items-center gap-2 group/skip"
            onClick={(e) => {
              e.stopPropagation();
              skipIntro();
            }}
            size="lg"
          >
            <SkipForward className="w-5 h-5 transition-transform" />
            Skip Intro
          </Button>
        )}

      {/* TOP BAR */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 p-4 sm:p-8 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      >
        <div className="flex items-center gap-4">
          <Button
            variant="custom"
            onClick={() => {
              onClose();
              setIsIntroSkipped(true);
            }}
            className="p-2 hover:bg-white/10 rounded-full text-white border-none shadow-none"
          >
            <X size={28} />
          </Button>
          <h2 className="text-white text-lg sm:text-xl font-medium">
            {isAdPlaying ? currentAdDetails?.title : currentTitle}
          </h2>
        </div>
      </div>

      {/* AD OVERLAY */}
      {isAdPlaying && (
        <div className="absolute inset-x-0 bottom-24 z-[120] flex flex-col items-end px-4 sm:px-8 pointer-events-none">
          <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-md text-white border border-white/10 mb-4 pointer-events-auto">
            <span className="text-sm font-bold uppercase tracking-wider text-primary mr-2">
              Ad
            </span>
          </div>

          {!canSkipAd && currentAdDetails?.skippable && (
            <div className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-md text-white border border-white/10 pointer-events-auto">
              Skip Ad in {adCountdown}s
            </div>
          )}

          {canSkipAd && currentAdDetails?.skippable && (
            <Button
              variant="custom"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-8 py-3 rounded-md font-bold transition-all duration-300 flex items-center gap-2 pointer-events-auto"
              onClick={(e) => {
                e.stopPropagation();
                handleSkipAd();
                setIsIntroSkipped(true);
              }}
            >
              Skip Ad
              <SkipForward size={20} />
            </Button>
          )}
        </div>
      )}

      {/* CENTER PLAY/PAUSE (Mobile) */}
      {showControls && !isYoutube && !isAdPlaying && (
        <div className="absolute inset-0 flex items-center justify-center gap-8 sm:gap-16 pointer-events-none transition-opacity duration-300">
          {isEpisode && episodes.length > 0 && (
            <button
              onClick={handlePrev}
              disabled={
                (currentIndex === 0 && !hasPrevSeasonEpisode) ||
                isLoadingEpisode
              }
              className="p-4 bg-black/40 rounded-full text-white pointer-events-auto hover:bg-black/60 transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <SkipBack size={32} fill="currentColor" />
            </button>
          )}

          <button
            onClick={() => handleSkip(-10)}
            className="p-4 bg-black/40 rounded-full text-white pointer-events-auto hover:bg-black/60 transition-all active:scale-90 cursor-pointer flex items-center justify-center relative group/skip"
          >
            <RotateCcw
              size={48}
              className="group-hover/skip:rotate-[-15deg] transition-transform"
            />
            <span className="absolute text-[10px] font-bold pt-1">10</span>
          </button>

          <button
            onClick={togglePlay}
            className="p-6 bg-black/40 rounded-full text-white pointer-events-auto hover:bg-black/60 transition-transform active:scale-90 flex items-center justify-center min-w-[96px] min-h-[96px] cursor-pointer"
          >
            {isLoadingEpisode ? (
              <Loader2 size={48} className="animate-spin text-primary" />
            ) : isPlaying ? (
              <Pause size={48} fill="currentColor" />
            ) : (
              <Play size={48} fill="currentColor" />
            )}
          </button>

          <button
            onClick={() => handleSkip(10)}
            className="p-4 bg-black/40 rounded-full text-white pointer-events-auto hover:bg-black/60 transition-all active:scale-90 cursor-pointer flex items-center justify-center relative group/skip"
          >
            <RotateCw
              size={48}
              className="group-hover/skip:rotate-[15deg] transition-transform"
            />
            <span className="absolute text-[10px] font-bold pt-1">10</span>
          </button>

          {isEpisode && episodes.length > 0 && (
            <button
              onClick={handleNext}
              disabled={
                (currentIndex === episodes.length - 1 &&
                  !hasNextSeasonEpisode) ||
                isLoadingEpisode
              }
              className="p-4 bg-black/40 rounded-full text-white pointer-events-auto hover:bg-black/60 transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <SkipForward size={32} fill="currentColor" />
            </button>
          )}
        </div>
      )}

      {/* BOTTOM CONTROLS */}
      {!isYoutube && (
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 p-4 sm:p-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300",
            showControls ? "opacity-100" : "opacity-0 pointer-events-none",
          )}
        >
          {/* Progress Bar */}
          <div
            className={cn(
              "relative w-full h-1.5 bg-white/30 rounded-full mb-6 group/progress cursor-pointer",
              anyAdPlaying && "opacity-50 pointer-events-none",
            )}
          >
            <input
              type="range"
              min="0"
              max="100"
              value={isNaN(progress) ? 0 : progress}
              onChange={handleSeek}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div
              className="absolute top-0 left-0 h-full bg-red-600 rounded-full"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-red-600 rounded-full scale-0 group-hover/progress:scale-100 transition-transform shadow-lg" />
            </div>
          </div>

          <div
            className={cn(
              "flex items-center justify-between",
              anyAdPlaying && "opacity-50 pointer-events-none",
            )}
          >
            <div className="flex items-center gap-4 sm:gap-6">
              <button
                onClick={togglePlay}
                className="text-white hover:scale-110 transition-transform"
              >
                {isPlaying ? (
                  <Pause size={28} fill="currentColor" />
                ) : (
                  <Play size={28} fill="currentColor" />
                )}
              </button>
              <span className="text-white text-sm font-medium">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
              <div
                ref={volumeRef}
                className="flex items-center gap-2 group/volume"
              >
                <button
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      setShowVolumeSlider(!showVolumeSlider);
                    } else {
                      toggleMute();
                    }
                  }}
                  className="text-white"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX size={28} />
                  ) : (
                    <Volume2 size={28} />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className={cn(
                    "w-0 transition-all duration-300 accent-red-600 cursor-pointer overflow-hidden",
                    showVolumeSlider
                      ? "w-10 ml-0"
                      : "group-hover/volume:w-24 group-hover/volume:ml-2",
                  )}
                />
              </div>
            </div>

            <div className="flex items-center gap-4 sm:gap-6 relative">
              {showSubtitleMenu && (
                <SubtitleMenu
                  subtitles={subtitles}
                  selectedSubtitleId={selectedSubtitleId}
                  onSelect={handleSubtitleSelect}
                  onClose={() => setShowSubtitleMenu(false)}
                />
              )}
              <button
                onClick={() => setShowSubtitleMenu(!showSubtitleMenu)}
                className={cn(
                  "text-white transition-colors",
                  selectedSubtitleId ? "text-red-600" : "text-white/60",
                )}
              >
                <Subtitles size={28} />
              </button>
              <div className="relative">
                {showQualityMenu && (
                  <SettingsMenu
                    qualityLevels={qualityLevels}
                    currentQualityIndex={currentQualityIndex}
                    onQualitySelect={handleQualitySelect}
                    playbackSpeed={playbackSpeed}
                    onPlaybackSpeedSelect={handlePlaybackSpeedSelect}
                    onClose={() => setShowQualityMenu(false)}
                  />
                )}
                <button
                  onClick={() => setShowQualityMenu(!showQualityMenu)}
                  className={cn(
                    "text-white transition-transform flex items-center gap-1",
                    showQualityMenu ? "rotate-90" : "",
                  )}
                >
                  <Settings size={28} />
                </button>
              </div>
              <button
                onClick={toggleFullscreen}
                className="text-white hover:scale-110 transition-transform"
              >
                <Maximize size={28} />
              </button>
            </div>
          </div>
        </div>
      )}

      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />
    </div>
  );
}
