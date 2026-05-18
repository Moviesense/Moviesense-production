import api from "@/lib/axios";
import {
  GenreResponse,
  LanguageResponse,
  MovieDetailResponse,
  SearchFilters,
  SearchResponse,
  RoleResponse,
  SubtitleResponse,
  TrailerResponse,
} from "@/types/movie";

export const movieService = {
  getMovieDetails: async (id: string): Promise<MovieDetailResponse> => {
    const response = await api.get<MovieDetailResponse>(
      `/movie/${id}/detail/website`,
    );
    return response.data;
  },
  getTrailers: async (movieId: string): Promise<TrailerResponse> => {
    const response = await api.get<TrailerResponse>(
      `/movie/trailer/${movieId}`,
    );
    return response.data;
  },
  getCast: async (movieId: string): Promise<RoleResponse> => {
    const response = await api.get<RoleResponse>("/role/movieIdWise", {
      params: { movieId },
      headers: { key: process.env.NEXT_PUBLIC_SECRET_KEY },
    });
    return response.data;
  },
  getSignedUrl: async (
    hlsFileName: string,
    drm: boolean = false,
  ): Promise<{
    signedVideoUrl: string;
    type: string;
    isPremiumRequired?: boolean;
    lastViewedData?: {
      _id: string;
      endTime: number;
      watchTime: number;
      lastViewedTime: string;
    };
    signature?: string;
    drmLicenseToken?: string;
    signedThumbnailUrl?: string;
    hlsFileName?: string;
    drm?: boolean;
    introStartTime?: number;
    introEndTime?: number;
  }> => {
    const response = await api.get<{
      status: boolean;
      signedVideoUrl: string;
      type: string;
      isPremiumRequired?: boolean;
      lastViewedData?: {
        _id: string;
        endTime: number;
        watchTime: number;
        lastViewedTime: string;
      };
      signature?: string;
      drmLicenseToken?: string;
      signedThumbnailUrl?: string;
      hlsFileName?: string;
      drm?: boolean;
      introStartTime?: number;
      introEndTime?: number;
    }>(`/movie/hls-signed-url`, {
      params: { hlsFileName, drm },
    });
    return {
      signedVideoUrl: response.data.signedVideoUrl,
      type: response.data.type,
      isPremiumRequired: response.data.isPremiumRequired,
      lastViewedData: response.data.lastViewedData,
      signature: response.data.signature,
      drmLicenseToken: response.data.drmLicenseToken,
      signedThumbnailUrl: response.data.signedThumbnailUrl,
      hlsFileName: response.data.hlsFileName,
      drm: response.data.drm,
      introStartTime: response.data.introStartTime,
      introEndTime: response.data.introEndTime,
    };
  },
  getSubtitles: async (movieId: string | number): Promise<SubtitleResponse> => {
    const response = await api.get<SubtitleResponse>(`/subtitle/${movieId}`);
    return response.data;
  },
  getEpisodeSubtitles: async (
    episodeId: string | number,
  ): Promise<SubtitleResponse> => {
    const response = await api.get<SubtitleResponse>(
      `/subtitle/episode/${episodeId}`,
    );
    return response.data;
  },
  getSeasonEpisodes: async (
    movieId: string,
    seasonNumber: number,
  ): Promise<any> => {
    const response = await api.get(
      `/episode/seasonWiseEpisodeAndroid?movieId=${movieId}&seasonNumber=${seasonNumber}`,
    );
    return response.data;
  },
  toggleFavorite: async (data: {
    movieId: string;
    episodeId?: string;
    type: string;
  }): Promise<{ status: boolean; message: string; isFavorite: boolean }> => {
    const response = await api.post(`/favorite`, data);
    return response.data;
  },
  checkFavorite: async (
    movieId: string,
  ): Promise<{ status: boolean; message: string; isFavorite: boolean }> => {
    const response = await api.get(`/movie/${movieId}/isFavorite`);
    return response.data;
  },
  searchMovies: async (filters: SearchFilters): Promise<SearchResponse> => {
    const response = await api.get<SearchResponse>("/movie/search", {
      params: filters,
    });
    return response.data;
  },
  getGenres: async (): Promise<GenreResponse> => {
    const response = await api.get<GenreResponse>("/genre", {
      params: { key: "Qx7LpA2zR9" },
    });
    return response.data;
  },
  getLanguages: async (): Promise<LanguageResponse> => {
    const response = await api.get<LanguageResponse>("/language", {
      params: { key: "Qx7LpA2zR9" },
    });
    return response.data;
  },
  updateViewedContent: async (data: any): Promise<any> => {
    const response = await api.post("/viewed-content/", data);
    return response.data;
  },
  toggleLike: async (data: {
    movieId: string;
    type: string;
  }): Promise<{ status: boolean; liked: boolean }> => {
    const response = await api.post(`/like`, data);
    return response.data;
  },
  requestPPVLink: async (data: {
    movieId: string;
    successUrl: string;
    cancelUrl: string;
    seasonId?: string;
  }): Promise<{
    status: boolean;
    message: string;
    checkout: { sessionId: string; url: string };
  }> => {
    const response = await api.post(
      `/rentedContents/mobile/request-link`,
      data,
    );
    return response.data;
  },
};
