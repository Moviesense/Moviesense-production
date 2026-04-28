import { useCallback } from "react";
import { analyticsService } from "@/services/analyticsService";
import { AnalyticsEventType } from "@/types/analytics";

export const useAnalytics = () => {
  const track = useCallback(
    async (
      eventType: AnalyticsEventType,
      movieId?: string,
      episodeId?: string,
      adId?: string,
    ) => {
      const payload: any = { eventType };
      if (movieId) payload.movieId = movieId;
      if (episodeId) payload.episodeId = episodeId;
      if (adId) payload.adId = adId;

      return analyticsService.trackEvent(payload);
    },
    [],
  );

  return { track };
};
