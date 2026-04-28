import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/services/notificationService";

export const useNotifications = () => {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationService.getAllNotifications(),
    select: (data) => data.notification,
    staleTime: 0,
    initialDataUpdatedAt: 0,
  });
};

export const useMarkNotificationViewed = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.markAsViewed(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

export const useMarkAllNotificationsViewed = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationService.markAllAsViewed(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};
