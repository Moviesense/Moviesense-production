"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import { useShorts } from "@/hooks/useShorts";
import { ShortPlayer } from "./ShortPlayer";
import { useRouter } from "next/navigation";
import { shortsService } from "@/services/shortsService";
import { ShortItem } from "@/types/shorts";

interface ShortsPageProps {
  initialShortId?: string;
}

export default function ShortsPage({ initialShortId }: ShortsPageProps) {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useShorts();
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();

  // Initial shared short state
  const [initialShort, setInitialShort] = useState<ShortItem | null>(null);
  const [isLoadingInitial, setIsLoadingInitial] = useState(!!initialShortId);
  const hasRemovedIdFromUrl = useRef(false);

  // Fetch the shared short by ID
  useEffect(() => {
    if (!initialShortId) return;

    shortsService
      .getShortById(initialShortId)
      .then((short) => {
        setInitialShort(short);
      })
      .catch((err) => {
        console.error("Failed to fetch shared short:", err);
      })
      .finally(() => {
        setIsLoadingInitial(false);
      });
  }, [initialShortId]);

  // Signed URL cache: hlsFileName -> signedVideoUrl
  const [signedUrlMap, setSignedUrlMap] = useState<Record<string, string>>({});
  const fetchingRef = useRef<Set<string>>(new Set());

  // Build final shorts list: initial short first (if from shared URL), then feed shorts
  const feedShorts = data?.pages.flatMap((p) => p.data) || [];
  const shorts = initialShort
    ? [initialShort, ...feedShorts.filter((s) => s._id !== initialShort._id)]
    : feedShorts;

  // Pre-fetch signed URLs for upcoming shorts
  useEffect(() => {
    const toFetch = shorts
      .filter(
        (s) =>
          s.hlsFileName &&
          !signedUrlMap[s.hlsFileName] &&
          !fetchingRef.current.has(s.hlsFileName),
      )
      .slice(0, 5);

    if (toFetch.length === 0) return;

    toFetch.forEach((s) => {
      fetchingRef.current.add(s.hlsFileName);
      shortsService
        .getSignedUrl(s.hlsFileName, s.drmEnabled)
        .then((data) => {
          setSignedUrlMap((prev) => ({
            ...prev,
            [s.hlsFileName]: data.signedVideoUrl,
          }));
        })
        .catch((err) => {
          console.error("Failed to pre-fetch signed URL:", err);
        })
        .finally(() => {
          fetchingRef.current.delete(s.hlsFileName);
        });
    });
  }, [shorts, signedUrlMap]);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const container = e.currentTarget;
      const scrollTop = container.scrollTop;
      const itemHeight = container.clientHeight;
      const newIndex = Math.round(scrollTop / itemHeight);
      if (newIndex !== activeIndex) {
        setActiveIndex(newIndex);

        // Remove the ID from the URL once user swipes away from the shared short
        if (initialShortId && !hasRemovedIdFromUrl.current && newIndex > 0) {
          hasRemovedIdFromUrl.current = true;
          window.history.replaceState(null, "", "/shorts");
        }
      }
    },
    [activeIndex, initialShortId],
  );

  // Fetch next page when user is near the end
  useEffect(() => {
    if (
      shorts.length > 0 &&
      activeIndex >= shorts.length - 2 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [
    activeIndex,
    shorts.length,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  ]);

  if (isLoading || isLoadingInitial) {
    return (
      <div className="h-[100dvh] w-full bg-black flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (shorts.length === 0) {
    return (
      <div className="h-[100dvh] w-full bg-black flex items-center justify-center">
        <p className="text-white/60 text-lg">No shorts available</p>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full bg-black flex justify-center items-center">
      {/* Back button - desktop only */}
      <button
        onClick={() => router.push("/home")}
        className="hidden sm:flex absolute top-6 left-6 z-50 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full items-center justify-center cursor-pointer transition-colors"
      >
        <ArrowLeft size={20} className="text-white" />
      </button>

      <div
        className="h-full sm:h-[calc(100dvh-4rem)] w-full max-w-[500px] overflow-y-scroll snap-y snap-mandatory no-scrollbar sm:rounded-lg sm:my-8 overflow-hidden"
        onScroll={handleScroll}
        style={{ scrollSnapType: "y mandatory" }}
      >
        {shorts.map((short, index) => (
          <ShortPlayer
            key={index}
            short={short}
            isActive={index === activeIndex}
            signedVideoUrl={signedUrlMap[short.hlsFileName] || null}
            googleAd={short.GoogleAd}
          />
        ))}

        {/* Loading spinner while fetching next batch */}
        {isFetchingNextPage && (
          <div className="h-20 flex items-center justify-center snap-start">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
