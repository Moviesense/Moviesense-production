import api from "@/lib/axios";
import { NotificationResponse } from "@/types/notification";

export const notificationService = {
  getAllNotifications: async (): Promise<NotificationResponse> => {
    const response = await api.get<NotificationResponse>("/notification/all");
    return response.data;
  },
  markAsViewed: async (id: string): Promise<any> => {
    const response = await api.patch(`/notification/${id}/viewed`);
    return response.data;
  },
  markAllAsViewed: async (): Promise<any> => {
    const response = await api.patch("/notification/all/viewed");
    return response.data;
  },
};
