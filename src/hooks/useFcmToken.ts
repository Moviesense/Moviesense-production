import { useState, useCallback, useEffect } from "react";
import {
  getToken,
  Messaging,
  onMessage,
  deleteToken,
} from "firebase/messaging";
import { messaging } from "@/lib/firebase";
import { userService } from "@/services/userService";
import { useAuth } from "@/context/AuthContext";
import Cookies from "js-cookie";
import { toast } from "@/context/ToastContext";

export function useFcmToken() {
  const { isAuthenticated } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [notificationPermissionStatus, setNotificationPermissionStatus] =
    useState<NotificationPermission>("default");
  const [isEnabled, setIsEnabled] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("notifications_enabled") !== "false";
    }
    return true;
  });

  const updateTokenOnBackend = useCallback(
    async (fcmToken: string) => {
      if (!isAuthenticated && !Cookies.get("token")) return;
      try {
        await userService.updateUserProfile({ fcmToken });
        console.log("FCM Token updated on backend");
      } catch (error) {
        console.error("Failed to update FCM Token on backend:", error);
      }
    },
    [isAuthenticated],
  );

  const requestPermission = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      console.log("This browser does not support notifications.");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermissionStatus(permission);

      if (permission === "granted") {
        if (messaging) {
          const fcmToken = await getToken(messaging as Messaging, {
            vapidKey: process.env.NEXT_PUBLIC_REACT_APP_FIREBASE_VAPID_KEY,
          });

          if (fcmToken) {
            setToken(fcmToken);
            localStorage.setItem("notifications_enabled", "true");
            setIsEnabled(true);
            await updateTokenOnBackend(fcmToken);
            return fcmToken;
          }
        }
      } else {
        localStorage.setItem("notifications_enabled", "false");
        console.log("Notification permission not granted");
      }
    } catch (error) {
      console.error(
        "An error occurred while requesting notification permission:",
        error,
      );
    }
    return null;
  }, [updateTokenOnBackend]);

  const removeTokenFromBackend = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      if (messaging) {
        await deleteToken(messaging as Messaging);
      }
      await userService.updateUserProfile({ fcmToken: "" });
      localStorage.setItem("notifications_enabled", "false");
      setToken(null);
      console.log("FCM Token removed from backend and deleted locally");
    } catch (error) {
      console.error("Failed to remove FCM Token from backend:", error);
    }
  }, [isAuthenticated]);

  // Handle permission toggle logic from UI
  const handleToggleNotifications = useCallback(
    async (enabled: boolean) => {
      if (enabled) {
        const res = await requestPermission();
        if (res) {
          localStorage.setItem("notifications_enabled", "true");
        }
        return res;
      } else {
        await removeTokenFromBackend();
        localStorage.setItem("notifications_enabled", "false");
        setIsEnabled(false);
        return null;
      }
    },
    [requestPermission, removeTokenFromBackend],
  );

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationPermissionStatus(Notification.permission);

      if (Notification.permission === "granted" && messaging) {
        getToken(messaging as Messaging, {
          vapidKey: process.env.NEXT_PUBLIC_REACT_APP_FIREBASE_VAPID_KEY,
        })
          .then((fcmToken) => {
            if (fcmToken) {
              setToken(fcmToken);
            }
          })
          .catch((error) => {
            console.error("Error fetching FCM token on mount:", error);
          });
      }
    }
  }, []);

  useEffect(() => {
    console.log("notificationPermissionStatus", notificationPermissionStatus);
    console.log("isEnabled", isEnabled);
    if (
      typeof window !== "undefined" &&
      messaging &&
      notificationPermissionStatus === "granted" &&
      isEnabled
    ) {
      const unsubscribe = onMessage(messaging as Messaging, (payload) => {
        console.log("Foreground message received:", payload);
        if (payload.notification) {
          toast(
            payload.notification.title + ": " + payload.notification.body,
            "info",
          );
        }
      });
      return unsubscribe;
    }
  }, [messaging, notificationPermissionStatus, isEnabled]);

  return {
    token,
    notificationPermissionStatus,
    requestPermission,
    handleToggleNotifications,
  };
}
