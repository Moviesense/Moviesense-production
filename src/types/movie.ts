export interface CastMember {
  _id: string;
  name: string;
  image: string;
  role?: string;
}

export interface Review {
  _id: string;
  userName: string;
  userImage?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Episode {
  _id: string;
  name: string;
  description?: string;
  duration?: string;
  image: string;
  videoUrl?: string;
  videoType?: number;
  episodeNumber: number;
  seasonNumber: number;
  view?: number;
  hlsFileName?: string;
  drmEnabled?: boolean;
  link?: string;
  type?: "PREMIUM" | "FREE" | "PAYPERVIEWS";
  isRented?: boolean;
  ppvCountryPrices?: { price: number };
  expiryDate?: string;
  clicksLeft?: number;
  GoogleAd?: boolean;
  customAd?: boolean;
  adDetails?: {
    _id: string;
    adId: string;
    skippable: boolean;
    skipTimeSeconds: number;
    adType: string;
    title: string;
    hlsFileName: string;
    drmEnabled: boolean;
    duration: number;
    imageUrl: string;
    redirectUrl: string;
  };
}

export interface Season {
  _id: string;
  name: string;
  seasonNumber: number;
  episodeCount?: number;
  image?: string;
  releaseDate?: string;
  type?: "PREMIUM" | "FREE" | "PAYPERVIEWS";
  isRented?: boolean;
  ppvCountryPrices?: { price: number };
  expiryDate?: string;
  clicksLeft?: number;
}

export interface MovieDetail {
  _id: string;
  title: string;
  description: string;
  image: string;
  link?: string;
  year: string;
  view: number;
  duration?: string;
  media_type: "movie" | "series" | "tv";
  maturity: string;
  contentRating: number;
  genre: string[]; // These are IDs in the response
  language: string[]; // These are IDs in the response
  cast?: CastMember[];
  reviews?: Review[];
  season?: Season[];
  bannerLogo?: string;
  episode?: Episode[];
  director?: {
    name: string;
    image?: string;
  };
  music?: {
    name: string;
    image?: string;
  };
  hlsFileName?: string;
  drmEnabled?: boolean;
  firstEpisode?: Episode;
  videoType?: number;
  type?: "PREMIUM" | "FREE" | "PAYPERVIEWS";
  isRented?: boolean;
  ppvCountryPrices?: { price: number };
  expiryDate?: string;
  clicksLeft?: number;
  totalLikes?: number;
  likeStatus?: boolean;
  isFavorite?: boolean;
  GoogleAd?: boolean;
  adType?: string;
  customAd?: boolean;
  adDetails?: {
    _id: string;
    adId: string;
    skippable: boolean;
    skipTimeSeconds: number;
    adType: string;
    title: string;
    hlsFileName: string;
    drmEnabled: boolean;
    duration: number;
    imageUrl: string;
    redirectUrl: string;
  };
}

export interface MovieDetailResponse {
  status: boolean;
  message: string;
  movie: MovieDetail[];
}
export interface Subtitle {
  _id: string;
  language: {
    _id: string;
    name: string;
    uniqueId: string;
  };
  file: string;
  isDefault?: boolean;
}

export interface SubtitleResponse {
  status: boolean;
  message: string;
  subtitles: Subtitle[];
}

export interface Genre {
  _id: string;
  name: string;
  uniqueId: string;
}

export interface GenreResponse {
  status: boolean;
  message: string;
  genre: Genre[];
}

export interface Language {
  _id: string;
  name: string;
  uniqueId: string;
}

export interface LanguageResponse {
  status: boolean;
  message: string;
  languages: Language[];
}

export interface Trailer {
  _id: string;
  name: string;
  type: "trailer" | "teaser" | "clip" | string;
  trailerImage?: string;
  videoType: number;
  movieId: string;
  movieTitle?: string;
  videoSource: "external_link" | "direct_url" | string;
  videoUrl: string;
  key?: string | null;
}

export interface TrailerResponse {
  status: boolean;
  message: string;
  data: Trailer[];
}

export interface SearchFilters {
  search?: string;
  page?: number;
  limit?: number;
  language?: string;
  genre?: string;
  year?: string;
  media_type?: string;
}

export interface SearchResponse {
  status: boolean;
  message: string;
  data: MovieDetail[];
  total: number;
  page: number;
  limit: number;
}

export interface ViewedContentRequest {
  viewedContentId?: string;
  endTime: number;
  incrementTime: number;
  type: string;
  movieId: string;
  episodeId?: string | null;
  deviceId?: string;
  deviceType?: string;
  isCompleted: boolean;
}
