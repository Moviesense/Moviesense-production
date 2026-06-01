import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { homeService } from "@/services/homeService";
import { useActiveProfile } from "./useProfile";

export const useSettings = () => {
  const activeProfile = useActiveProfile();
  return useQuery({
    queryKey: ["settings", activeProfile?._id],
    queryFn: () => homeService.getSettings(),
    staleTime: 0,
  });
};

export const useWidgetData = (widgetId: string, enabled: boolean = true) => {
  const activeProfile = useActiveProfile();
  return useInfiniteQuery({
    queryKey: ["widget", widgetId, activeProfile?._id],
    queryFn: ({ pageParam }) => homeService.getWidgetData(widgetId, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const perPage = lastPage.perPage ?? 10;
      const count = lastPage.series?.length ?? 0;
      // A full page implies there may be more; a short page is the last one.
      return count >= perPage ? allPages.length + 1 : undefined;
    },
    enabled: !!widgetId && enabled,
    staleTime: 0,
  });
};

export const useActiveBanners = () => {
  const activeProfile = useActiveProfile();
  return useQuery({
    queryKey: ["activeBanners", activeProfile?._id],
    queryFn: () => homeService.getActiveBanners(),
    staleTime: 0,
  });
};
