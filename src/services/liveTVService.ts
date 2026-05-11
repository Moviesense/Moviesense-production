import api from "@/lib/axios";
import {
  LiveStreamListResponse,
  ProgramGuideResponse,
  StreamDetailsResponse,
  StreamViewResponse,
} from "../types/liveTV";

export const liveTVService = {
  getLiveList: async (): Promise<LiveStreamListResponse> => {
    const response = await api.get<LiveStreamListResponse>("/stream/live-list");
    return response.data;
  },

  getStreamDetails: async (
    streamId: string,
    programDate?: string,
  ): Promise<StreamDetailsResponse> => {
    const response = await api.get<StreamDetailsResponse>(
      `/stream/details/${streamId}`,
      programDate ? { params: { programDate } } : undefined,
    );
    return response.data;
  },

  trackStreamView: async (streamId: string): Promise<StreamViewResponse> => {
    const response = await api.post<StreamViewResponse>(
      `/stream/${streamId}/view`,
    );
    return response.data;
  },

  getProgramGuide: async (params: {
    currentStream: string;
    programDate?: string;
    page?: number;
    limit?: number;
  }): Promise<ProgramGuideResponse> => {
    const response = await api.get<ProgramGuideResponse>(
      "/stream/program-guide",
      { params },
    );
    return response.data;
  },
};
