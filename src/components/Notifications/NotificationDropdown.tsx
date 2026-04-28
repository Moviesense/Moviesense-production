"use client";

import {
  useNotifications,
  useMarkNotificationViewed,
  useMarkAllNotificationsViewed,
} from "@/hooks/useNotifications";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Bell, X, BellOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationDropdownProps {
  onClose: () => void;
}

export function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const router = useRouter();
  const { data: notifications, isLoading, error } = useNotifications();
  const { t, isRTL } = useLanguage();
  const markAsViewed = useMarkNotificationViewed();
  const markAllAsViewed = useMarkAllNotificationsViewed();

  const hasUnread = notifications?.some((n) => !n.viewed);

  const handleNotificationClick = (notification: any) => {
    if (!notification.viewed) {
      markAsViewed.mutate(notification._id);
    }
    if (notification.deepLink) {
      router.push(notification.deepLink);
      onClose();
    }
  };

  return (
    <div
      className={cn(
        "absolute top-full mt-2 w-90 md:w-106 bg-[#262d38] border border-white/10 shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200",
        isRTL ? "left-0 origin-top-left" : "right-0 origin-top-right",
      )}
    >
      <div className="h-[3px] w-full bg-gradient-to-r from-primary to-secondary" />
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <h3 className="text-white font-bold text-md md:text-lg flex items-center gap-2">
          <Bell size={20} className="text-primary" />
          {t("notifications")}
        </h3>
        <button
          onClick={onClose}
          className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>
      </div>

      <div className="max-h-[70vh] overflow-y-auto no-scrollbar">
        {isLoading ? (
          <div className="p-8 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-neutral-400 text-sm">{t("loading")}</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-400 text-sm">
              {t("errorLoadingNotifications")}
            </p>
          </div>
        ) : notifications && notifications.length > 0 ? (
          <div className="divide-y divide-white/5">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={cn(
                  "p-4 py-3 sm:py-4 hover:bg-background transition-colors cursor-pointer group",
                )}
              >
                <div className="flex justify-between items-start gap-3">
                  {notification.image && (
                    <img
                      src={notification.image}
                      alt=""
                      className="w-12 h-12 md:w-14 md:h-14 rounded-lg object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-xs md:text-sm group-hover:text-primary transition-colors">
                      {notification.title}
                    </p>
                    <p className="text-neutral-300 text-xs md:text-sm mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-neutral-500 text-[10px] mt-1 md:mt-2">
                      {notification.createdAt
                        ? formatDistanceToNow(
                            new Date(notification.createdAt),
                            {
                              addSuffix: true,
                            },
                          )
                        : ""}
                    </p>
                  </div>
                  {!notification.viewed && (
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
              <BellOff size={32} className="text-neutral-500" />
            </div>
            <div>
              <p className="text-white font-medium">{t("noNotifications")}</p>
              <p className="text-neutral-500 text-sm mt-1">
                {t("noNotificationsDesc")}
              </p>
            </div>
          </div>
        )}
      </div>

      {hasUnread && (
        <div className="p-3 border-t border-white/10 text-center">
          <button
            onClick={() => markAllAsViewed.mutate()}
            disabled={markAllAsViewed.isPending}
            className="text-primary text-xs font-semibold hover:underline disabled:opacity-50 cursor-pointer"
          >
            {markAllAsViewed.isPending ? t("loading") : t("markAllAsRead")}
          </button>
        </div>
      )}
    </div>
  );
}
