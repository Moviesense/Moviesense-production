import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { movieService } from "@/services/movieService";
import { SearchFilters, ViewedContentRequest } from "@/types/movie";

export const useMovieDetails = (id: string) => {
  return useQuery({
    queryKey: ["movie", id],
    queryFn: () => movieService.getMovieDetails(id),
    enabled: !!id,
    staleTime: 0,
  });
};

export const useTrailers = (movieId: string, enabled = true) => {
  return useQuery({
    queryKey: ["trailers", movieId],
    queryFn: () => movieService.getTrailers(movieId),
    enabled: !!movieId && enabled,
  });
};

export const useCast = (movieId: string, enabled = true) => {
  return useQuery({
    queryKey: ["cast", movieId],
    queryFn: () => movieService.getCast(movieId),
    enabled: !!movieId && enabled,
  });
};

export const useToggleFavorite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { movieId: string; episodeId?: string; type: string }) =>
      movieService.toggleFavorite(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["movie", variables.movieId],
      });
      queryClient.invalidateQueries({
        queryKey: ["widget"],
      });
      queryClient.invalidateQueries({
        queryKey: ["activeBanners"],
      });
      queryClient.invalidateQueries({
        queryKey: ["shorts"],
      });
    },
  });
};

export const useSearchMovies = (filters: Omit<SearchFilters, "page">) => {
  return useInfiniteQuery({
    queryKey: ["search", filters],
    queryFn: ({ pageParam = 1 }) =>
      movieService.searchMovies({ ...filters, page: pageParam as number }),
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.total / lastPage.limit);
      if (lastPage.page < totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
};

export const useGenres = () => {
  return useQuery({
    queryKey: ["genres"],
    queryFn: () => movieService.getGenres(),
  });
};

export const useLanguages = () => {
  return useQuery({
    queryKey: ["languages"],
    queryFn: () => movieService.getLanguages(),
  });
};

export const useContentRatings = () => {
  return useQuery({
    queryKey: ["contentRatings"],
    queryFn: () => movieService.getContentRatings(),
  });
};

export const useUpdateViewedContent = () => {
  return useMutation({
    mutationFn: (data: ViewedContentRequest) =>
      movieService.updateViewedContent(data),
    onSuccess: (data) => {
      return data;
    },
  });
};

export const useToggleLike = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { movieId: string; type: string }) =>
      movieService.toggleLike(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["movie", variables.movieId],
      });
      queryClient.invalidateQueries({
        queryKey: ["widget"],
      });
      queryClient.invalidateQueries({
        queryKey: ["activeBanners"],
      });
      queryClient.invalidateQueries({
        queryKey: ["shorts"],
      });
    },
  });
};
