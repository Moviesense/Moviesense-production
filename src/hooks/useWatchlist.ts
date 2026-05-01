import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { watchlistService } from "@/services/watchlistService";

export const useWatchHistory = (page: number = 1, perPage: number = 12) => {
  return useQuery({
    queryKey: ["watch-history", page, perPage],
    queryFn: () => watchlistService.getWatchHistory(page, perPage),
    staleTime: 0,
    refetchOnMount: true,
  });
};

export const useInfiniteWatchHistory = (perPage: number = 12) => {
  return useInfiniteQuery({
    queryKey: ["watch-history-infinite", perPage],
    queryFn: ({ pageParam = 1 }) =>
      watchlistService.getWatchHistory(pageParam as number, perPage),
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  });
};

export const useFavorites = (page: number = 1, perPage: number = 12) => {
  return useQuery({
    queryKey: ["favorites", page, perPage],
    queryFn: () => watchlistService.getFavorites(page, perPage),
    staleTime: 0,
    refetchOnMount: true,
  });
};

export const useInfiniteFavorites = (perPage: number = 12) => {
  return useInfiniteQuery({
    queryKey: ["favorites-infinite", perPage],
    queryFn: ({ pageParam = 1 }) =>
      watchlistService.getFavorites(pageParam as number, perPage),
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
};
