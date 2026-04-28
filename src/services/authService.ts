import api from "@/lib/axios";
import axios from "axios";
import Cookies from "js-cookie";
import {
  AuthResponse,
  LoginRequest,
  SignupRequest,
  ValidateResetTokenResponse,
  SetPasswordRequest,
  SetPasswordResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
} from "@/types/auth";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/user/email-login", data);
    return response.data;
  },

  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/subscription/email", data);
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/refresh-token", {
      refreshToken,
    });
    return response.data;
  },

  logout: () => {
    Cookies.remove("token");
    Cookies.remove("refreshToken");
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  },

  validateResetToken: async (
    token: string,
  ): Promise<ValidateResetTokenResponse> => {
    const response = await axios.get<ValidateResetTokenResponse>(
      `${API_BASE_URL}/user/validateResetToken?token=${token}`,
    );
    return response.data;
  },

  setPassword: async (
    token: string,
    data: SetPasswordRequest,
  ): Promise<SetPasswordResponse> => {
    const response = await axios.post<SetPasswordResponse>(
      `${API_BASE_URL}/user/setPassword?token=${token}`,
      data,
    );
    return response.data;
  },

  forgotPassword: async (
    data: ForgotPasswordRequest,
  ): Promise<ForgotPasswordResponse> => {
    const response = await axios.post<ForgotPasswordResponse>(
      `${API_BASE_URL}/user/forgetPassword`,
      data,
    );
    return response.data;
  },
};
