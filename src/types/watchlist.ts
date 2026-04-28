export interface WatchHistoryItem {
  _id: string;
  userId: string;
  type: string;
  movieId: string;
  episodeId: string | null;
  endTime: number;
  watchTime: number;
  isCompleted: boolean;
  lastViewedTime: string;
  deviceId: string;
  deviceType: string;
  createdAt: string;
  updatedAt: string;
  movieDetails: {
    _id: string;
    type: string;
    status: string;
    runtime: number;
    videoType: number;
    link: string;
    image: string;
    thumbnail: string;
    title: string;
    year: string;
    description: string;
    hlsFileName?: string;
    totalLikes?: number;
    likeStatus?: boolean;
    isFavorite?: boolean;
  };
  episodeDetails?: {
    _id: string;
    videoUrl: string;
    runtime: number;
    drmEnabled: boolean;
    status: string;
    image: string;
    name: string;
    episodeNumber: number;
    videoType: number;
    season: string;
    seasonNumber: number;
    hlsFileName: string;
  };
}

export interface WatchHistoryResponse {
  status: boolean;
  message: string;
  episodeList: WatchHistoryItem[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface FavoriteMovieResponse {
  status: boolean;
  message: string;
  favorites: {
    _id: string;
    userId: string;
    type: string;
    movieId: {
      _id: string;
      status: string;
      runtime: number; // in seconds/minutes? API response shows 44, 10080, etc.
      image: string;
      thumbnail: string;
      title: string;
      year: string;
      description: string;
      date: string;
      media_type: "movie" | "series" | "tv";
      totalLikes?: number;
      likeStatus?: boolean;
      isFavorite?: boolean;
    };
    createdAt: string;
    updatedAt: string;
  }[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
