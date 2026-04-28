import { useInfiniteQuery } from "@tanstack/react-query";
import { shortsService } from "@/services/shortsService";

export const useShorts = () => {
  return useInfiniteQuery({
    queryKey: ["shorts"],
    queryFn: () => shortsService.getShorts(),
    getNextPageParam: (_lastPage, _allPages, lastPageParam) => {
      return (lastPageParam as number) + 1;
    },
    initialPageParam: 1,
  });
};
