"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import Cookies from "js-cookie";
import { userService } from "@/services/userService";
import { profileService } from "@/services/profileService";
import { messaging } from "@/lib/firebase";
import { getToken } from "firebase/messaging";

interface AuthContextType {
  isAuthenticated: boolean;
  isSubscribed: boolean;
  planType: string | null;
  userEmail: string | null;
  isLoading: boolean;
  login: (token: string, email: string, refreshToken?: string) => void;
  logout: () => void;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [planType, setPlanType] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const token = Cookies.get("token");
    const savedEmail = localStorage.getItem("userEmail");
    const authenticated = !!token;
    setIsAuthenticated(authenticated);
    setUserEmail(savedEmail);

    if (authenticated) {
      try {
        const statusData = await userService.getSubscriptionStatus();
        // Standard app logic for subscription check
        setIsSubscribed(
          statusData.status && statusData.planType !== "free_trial",
        );
        setPlanType(statusData.planType || null);

        // Fetch profiles to get the correct email
        try {
          const profilesData = await profileService.getProfiles();
          if (profilesData.status && profilesData.email) {
            setUserEmail(profilesData.email);
            localStorage.setItem("userEmail", profilesData.email);
          }
        } catch (error) {
          console.error("Error fetching profile email:", error);
        }
      } catch (error) {
        console.error("Error fetching subscription status:", error);
        setIsSubscribed(false);
        setPlanType(null);
      }
    } else {
      setIsSubscribed(false);
      setPlanType(null);
    }
    setIsLoading(false);
  }, []);

  const syncFcmToken = useCallback(async () => {
    if (
      typeof window === "undefined" ||
      !("Notification" in window) ||
      Notification.permission !== "granted" ||
      !messaging ||
      localStorage.getItem("notifications_enabled") === "false"
    ) {
      return;
    }

    try {
      const fcmToken = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_REACT_APP_FIREBASE_VAPID_KEY,
      });
      if (fcmToken) {
        await userService.updateUserProfile({ fcmToken });
        console.log("FCM Token synced on app load");
      }
    } catch (error) {
      console.error("Error syncing FCM token:", error);
    }
  }, []);

  useEffect(() => {
    checkAuth().then(() => {
      const token = Cookies.get("token");
      if (token) {
        syncFcmToken();
      }
    });
  }, [checkAuth, syncFcmToken]);

  const login = useCallback(
    (token: string, email: string, refreshToken?: string) => {
      Cookies.set("token", token, { expires: 7 });
      localStorage.setItem("userEmail", email);
      if (refreshToken) {
        Cookies.set("refreshToken", refreshToken, { expires: 30 });
      }
      checkAuth();
    },
    [checkAuth],
  );

  const logout = useCallback(() => {
    Cookies.remove("token");
    Cookies.remove("refreshToken");
    localStorage.removeItem("userEmail");
    setIsAuthenticated(false);
    setIsSubscribed(false);
    setUserEmail(null);
    if (typeof window !== "undefined") {
      window.location.href = "/home";
    }
  }, []);

  const refreshAuth = useCallback(async () => {
    await checkAuth();
  }, [checkAuth]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isSubscribed,
        planType,
        userEmail,
        isLoading,
        login,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
