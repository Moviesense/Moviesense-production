import api from "@/lib/axios";
import { WatchHistoryResponse, FavoriteMovieResponse } from "@/types/watchlist";

export const watchlistService = {
  getWatchHistory: async (
    page: number = 1,
    perPage: number = 10,
  ): Promise<WatchHistoryResponse> => {
    const response = await api.get<WatchHistoryResponse>(
      "/viewed-content/watch-history",
      {
        params: { page, perPage },
      },
    );
    return response.data;
  },
  getFavorites: async (
    page: number = 1,
    perPage: number = 10,
  ): Promise<FavoriteMovieResponse> => {
    const response = await api.get<FavoriteMovieResponse>(
      "/favorite/favoriteMovie",
      {
        params: { page, perPage },
      },
    );
    return response.data;
  },
};
