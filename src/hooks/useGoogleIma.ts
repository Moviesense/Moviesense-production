"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { loadImaScript } from "@/lib/loadImaScript";

interface UseGoogleImaProps {
  adTagUrl: string | undefined;
  videoElement: HTMLVideoElement | null;
  adContainerElement: HTMLDivElement | null;
  onContentPause: () => void;
  onContentResume: () => void;
  onAllAdsCompleted: () => void;
  onAdError: (error: any) => void;
  enabled: boolean;
}

interface UseGoogleImaReturn {
  isImaAdPlaying: boolean;
  requestAds: () => void;
  destroyAds: () => void;
}

export function useGoogleIma({
  adTagUrl,
  videoElement,
  adContainerElement,
  onContentPause,
  onContentResume,
  onAllAdsCompleted,
  onAdError,
  enabled,
}: UseGoogleImaProps): UseGoogleImaReturn {
  const [isImaAdPlaying, setIsImaAdPlaying] = useState(false);
  const [imaLoaded, setImaLoaded] = useState(false);

  const adsLoaderRef = useRef<google.ima.AdsLoader | null>(null);
  const adsManagerRef = useRef<google.ima.AdsManager | null>(null);
  const adDisplayContainerRef = useRef<google.ima.AdDisplayContainer | null>(
    null,
  );
  const contentTimeRef = useRef<number>(0);
  const initializedRef = useRef(false);

  // Store callbacks in refs to avoid re-creating effects
  const onContentPauseRef = useRef(onContentPause);
  const onContentResumeRef = useRef(onContentResume);
  const onAllAdsCompletedRef = useRef(onAllAdsCompleted);
  const onAdErrorRef = useRef(onAdError);

  useEffect(() => {
    onContentPauseRef.current = onContentPause;
  }, [onContentPause]);
  useEffect(() => {
    onContentResumeRef.current = onContentResume;
  }, [onContentResume]);
  useEffect(() => {
    onAllAdsCompletedRef.current = onAllAdsCompleted;
  }, [onAllAdsCompleted]);
  useEffect(() => {
    onAdErrorRef.current = onAdError;
  }, [onAdError]);

  // Load IMA SDK script
  useEffect(() => {
    if (!enabled) return;

    loadImaScript()
      .then(() => setImaLoaded(true))
      .catch((err) => {
        console.error("IMA SDK load failed:", err);
        onAdErrorRef.current(err);
      });
  }, [enabled]);

  // Initialize IMA components
  useEffect(() => {
    if (
      !enabled ||
      !imaLoaded ||
      !videoElement ||
      !adContainerElement ||
      initializedRef.current
    )
      return;

    try {
      const adDisplayContainer = new google.ima.AdDisplayContainer(
        adContainerElement,
        videoElement,
      );
      adDisplayContainerRef.current = adDisplayContainer;

      const adsLoader = new google.ima.AdsLoader(adDisplayContainer);
      adsLoaderRef.current = adsLoader;

      // ADS_MANAGER_LOADED
      adsLoader.addEventListener(
        google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
        (event: google.ima.AdsManagerLoadedEvent) => {
          const adsRenderingSettings = new google.ima.AdsRenderingSettings();
          adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;

          const adsManager = event.getAdsManager(
            { currentTime: 0 },
            adsRenderingSettings,
          );
          adsManagerRef.current = adsManager;

          // Content pause
          adsManager.addEventListener(
            google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
            () => {
              if (videoElement) {
                contentTimeRef.current = videoElement.currentTime;
              }
              setIsImaAdPlaying(true);
              onContentPauseRef.current();
            },
          );

          // Content resume
          adsManager.addEventListener(
            google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
            () => {
              setIsImaAdPlaying(false);
              onContentResumeRef.current();
            },
          );

          // All ads completed
          adsManager.addEventListener(
            google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
            () => {
              setIsImaAdPlaying(false);
              onAllAdsCompletedRef.current();
              adsManagerRef.current?.destroy();
              adsManagerRef.current = null;
            },
          );

          // Ad error
          adsManager.addEventListener(
            google.ima.AdErrorEvent.Type.AD_ERROR,
            (adErrorEvent: google.ima.AdErrorEvent) => {
              console.error(
                "IMA Ad Error:",
                adErrorEvent.getError().getMessage(),
              );
              setIsImaAdPlaying(false);
              onAdErrorRef.current(adErrorEvent.getError());
              adsManagerRef.current?.destroy();
              adsManagerRef.current = null;
            },
          );

          // Initialize and start
          try {
            const width = videoElement.offsetWidth;
            const height = videoElement.offsetHeight;
            adsManager.init(width, height, google.ima.ViewMode.NORMAL);
            adsManager.start();
            setTimeout(() => {
              if (adsManagerRef.current && videoElement) {
                adsManagerRef.current.resize(
                  videoElement.offsetWidth,
                  videoElement.offsetHeight,
                  google.ima.ViewMode.NORMAL,
                );
              }
            }, 0);
          } catch (adError) {
            console.error("IMA adsManager start error:", adError);
            setIsImaAdPlaying(false);
            onAdErrorRef.current(adError);
          }
        },
      );

      // AdsLoader error
      adsLoader.addEventListener(
        google.ima.AdErrorEvent.Type.AD_ERROR,
        (adErrorEvent: google.ima.AdErrorEvent) => {
          console.error(
            "IMA AdsLoader Error:",
            adErrorEvent.getError().getMessage(),
          );
          onAdErrorRef.current(adErrorEvent.getError());
        },
      );

      initializedRef.current = true;
    } catch (err) {
      console.error("IMA initialization error:", err);
      onAdErrorRef.current(err);
    }
  }, [enabled, imaLoaded, videoElement, adContainerElement]);

  // Handle resize
  useEffect(() => {
    if (!adsManagerRef.current || !adContainerElement) return;

    const handleResize = () => {
      if (adsManagerRef.current && adContainerElement) {
        const width = adContainerElement.clientWidth;
        const height = adContainerElement.clientHeight;
        const isFullscreen = !!document.fullscreenElement;
        adsManagerRef.current.resize(
          width,
          height,
          isFullscreen
            ? google.ima.ViewMode.FULLSCREEN
            : google.ima.ViewMode.NORMAL,
        );
      }
    };

    window.addEventListener("resize", handleResize);
    document.addEventListener("fullscreenchange", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("fullscreenchange", handleResize);
    };
  }, [adContainerElement]);

  // Request ads
  const requestAds = useCallback(() => {
    if (!adsLoaderRef.current || !adTagUrl || !adDisplayContainerRef.current)
      return;

    // Initialize ad display container (must be from user gesture chain)
    adDisplayContainerRef.current.initialize();

    const adsRequest = new google.ima.AdsRequest();
    adsRequest.adTagUrl = adTagUrl;

    const width =
      adContainerElement?.clientWidth || videoElement?.clientWidth || 640;
    const height =
      adContainerElement?.clientHeight || videoElement?.clientHeight || 360;

    adsRequest.linearAdSlotWidth = width;
    adsRequest.linearAdSlotHeight = height;
    adsRequest.nonLinearAdSlotWidth = width;
    adsRequest.nonLinearAdSlotHeight = height;

    adsLoaderRef.current.requestAds(adsRequest);
  }, [adTagUrl, adContainerElement, videoElement]);

  // Signal content complete (for post-roll)
  useEffect(() => {
    if (!enabled || !videoElement || !adsLoaderRef.current) return;

    const handleContentEnded = () => {
      adsLoaderRef.current?.contentComplete();
    };

    videoElement.addEventListener("ended", handleContentEnded);
    return () => {
      videoElement.removeEventListener("ended", handleContentEnded);
    };
  }, [enabled, videoElement]);

  // Destroy ads
  const destroyAds = useCallback(() => {
    adsManagerRef.current?.destroy();
    adsManagerRef.current = null;
    adsLoaderRef.current?.destroy();
    adsLoaderRef.current = null;
    adDisplayContainerRef.current?.destroy();
    adDisplayContainerRef.current = null;
    initializedRef.current = false;
    setIsImaAdPlaying(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      adsManagerRef.current?.destroy();
      adsLoaderRef.current?.destroy();
      adDisplayContainerRef.current?.destroy();
    };
  }, []);

  return {
    isImaAdPlaying,
    requestAds,
    destroyAds,
  };
}
