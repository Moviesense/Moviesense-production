import api from "@/lib/axios";
import { ShortsResponse, ShortItem } from "@/types/shorts";

export const shortsService = {
  getShorts: async (): Promise<ShortsResponse> => {
    const response = await api.get<ShortsResponse>("/shorts-recommendations");
    return response.data;
  },

  getSignedUrl: async (
    hlsFileName: string,
    drm: boolean = false,
  ): Promise<{ signedVideoUrl: string }> => {
    const response = await api.get<{ status: boolean; signedVideoUrl: string }>(
      "/movie/hls-signed-url",
      { params: { hlsFileName, drm } },
    );
    return { signedVideoUrl: response.data.signedVideoUrl };
  },

  getShortById: async (id: string): Promise<ShortItem> => {
    const response = await api.get<{
      status: boolean;
      message: string;
      data: ShortItem;
    }>(`/short/${id}`);
    return response.data.data;
  },
};
