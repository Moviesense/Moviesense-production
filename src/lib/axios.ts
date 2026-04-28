import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://api.nabtt.com", // Dummy URL
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    let deviceId = localStorage.getItem("deviceId");
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem("deviceId", deviceId);
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const lang = Cookies.get("language") || "en";
    config.headers["lang"] = lang;
    config.headers["device-id"] = deviceId;
    return config;
  },
  (error) => {
    console.log("Request Error", error);
    return Promise.reject(error);
  },
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = Cookies.get("refreshToken");

      if (refreshToken) {
        try {
          // Use a plain axios instance to avoid the interceptor loop
          // when the refresh token API itself returns 401
          const response = await axios.post(
            `${api.defaults.baseURL}/auth/refresh-token`,
            { refreshToken },
            { headers: { "Content-Type": "application/json" } },
          );
          const data = response.data;
          if (data.token && data.refreshToken) {
            Cookies.set("token", data.token, { expires: 7 });
            Cookies.set("refreshToken", data.refreshToken, { expires: 7 });
            api.defaults.headers.common["Authorization"] =
              `Bearer ${data.token}`;
            api.defaults.headers.common["device-id"] =
              localStorage.getItem("deviceId");
            return api(originalRequest);
          }
        } catch (refreshError) {
          console.error("Refresh token failed:", refreshError);
          // If refresh fails, clear cookies and redirect
          Cookies.remove("token");
          Cookies.remove("refreshToken");
          // if (typeof window !== "undefined") {
          //   window.location.href = "/login";
          // }
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, clear and redirect
        // route to login if not in login page
        Cookies.remove("token");
        if (typeof window !== "undefined") {
          const publicPaths = [
            "/home",
            "/movie",
            "/search",
            "/signup",
            "/forgot-password",
            "/reset-password",
            "/user/changePassword",
          ];
          const isPublicPath = publicPaths.some((path) =>
            window.location.pathname.startsWith(path),
          );

          // if (!isPublicPath && window.location.pathname !== "/login") {
          //   window.location.href = "/login";
          // }
        }
      }
    }

    // Global error handling: show toast for other errors
    if (
      error.response?.status !== 401 &&
      error.response?.status !== 404 &&
      !error.response?.data?.message?.includes("No Subtitle")
    ) {
      const { toast } = await import("@/context/ToastContext");
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred";
      toast(errorMessage, "error");
    }

    return Promise.reject(error);
  },
);

export default api;
