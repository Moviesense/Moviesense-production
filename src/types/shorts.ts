export interface ShortItem {
  _id: string;
  title: string;
  description: string;
  image: string;
  thumbnail: string;
  type: "PREMIUM" | "FREE" | "PAYPERVIEWS";
  status: string;
  media_type?: string;
  view: number;
  totalLikes: number;
  likeStatus?: boolean;
  isFavorite?: boolean;
  runtime: number;
  hlsFileName: string;
  drmEnabled: boolean;
  muxAssetId?: string;
  genre?: string[];
  language?: string[];
  year?: string;
  GoogleAd?: boolean;
}

export interface ShortsResponse {
  status: boolean;
  message: string;
  data: ShortItem[];
}
