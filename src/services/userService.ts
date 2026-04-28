import api from "@/lib/axios";
import { SubscriptionStatusResponse } from "@/types/user";

export const userService = {
  getSubscriptionStatus: async (): Promise<SubscriptionStatusResponse> => {
    const response = await api.get<SubscriptionStatusResponse>(
      "/user/subscription/status",
    );
    return response.data;
  },
  renewSubscription: async (data: {
    email: string;
    country: string;
    view?: boolean;
  }): Promise<{
    status: boolean;
    message: string;
    email: string;
    country: string;
    token: string;
    link: string;
    view?: boolean;
  }> => {
    let url = "/subscription/renew";
    if (data.view) {
      url = "/subscription/renew?view=true";
    }
    const response = await api.post(url, data);
    return response.data;
  },
  getSubscriptionPlans: async (): Promise<any> => {
    const response = await api.get("/subscription/renew");
    return response.data;
  },
  getUserProfile: async (): Promise<any> => {
    const response = await api.get("/user/profile");
    return response.data;
  },
  updateUserProfile: async (data: {
    fullName?: string;
    phoneNumber?: string;
    phoneCode?: string;
    fcmToken?: string;
  }): Promise<any> => {
    const response = await api.patch("/user/update", data);
    return response.data;
  },
};
