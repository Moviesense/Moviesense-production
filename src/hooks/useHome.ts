import { useQuery } from "@tanstack/react-query";
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
  return useQuery({
    queryKey: ["widget", widgetId, activeProfile?._id],
    queryFn: () => homeService.getWidgetData(widgetId),
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
