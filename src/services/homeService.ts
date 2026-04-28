import api from "@/lib/axios";
import { SettingResponse, WidgetDataResponse } from "@/types/setting";

export const homeService = {
  getSettings: async (): Promise<SettingResponse> => {
    const response = await api.get<SettingResponse>("/widget", {
      params: {
        key: process.env.NEXT_PUBLIC_APP_KEY,
      },
    });
    return response.data;
  },

  getWidgetData: async (widgetId: string): Promise<WidgetDataResponse> => {
    const response = await api.get<WidgetDataResponse>(
      `/widget/${widgetId}/series/public`,
    );
    return response.data;
  },

  getActiveBanners: async (): Promise<any> => {
    const response = await api.get("/banner/active/list");
    return response.data;
  },
};
