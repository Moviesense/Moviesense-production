import api from "axios";
import { AnalyticsPayload } from "@/types/analytics";
import Cookies from "js-cookie";

export const analyticsService = {
  trackEvent: async (payload: AnalyticsPayload): Promise<any> => {
    try {
      const response = await api.post(
        process.env.NEXT_PUBLIC_API_URL + "/analytics/increment",
        payload,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Analytics error:", error);
      return null;
    }
  },
};
