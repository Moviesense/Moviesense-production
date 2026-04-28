import { useMutation, useQuery } from "@tanstack/react-query";
import { authService } from "@/services/authService";
import { userService } from "@/services/userService";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import {
  AuthResponse,
  LoginRequest,
  SignupRequest,
  SetPasswordRequest,
  SetPasswordResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
} from "@/types/auth";

import { useAuth } from "@/context/AuthContext";

export const useLogin = (onSuccess?: (data: AuthResponse) => void) => {
  const router = useRouter();
  const { login } = useAuth();

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (data, variables) => {
      if (data.data.token) {
        login(data.data.token, variables.email, data.data.refreshToken);
        if (onSuccess) {
          onSuccess(data);
        }
        router.push("/who-is-watching");
      }
    },
  });
};

export const useSignup = (onSuccess?: (data: AuthResponse) => void) => {
  return useMutation({
    mutationFn: (data: SignupRequest) => authService.signup(data),
    onSuccess: (data) => {
      if (onSuccess) {
        onSuccess(data);
      }
    },
  });
};

export const useValidateResetToken = (token: string) => {
  return useQuery({
    queryKey: ["validateResetToken", token],
    queryFn: () => authService.validateResetToken(token),
    enabled: !!token,
    retry: false,
  });
};

export const useSetPassword = (
  token: string,
  onSuccess?: (data: SetPasswordResponse) => void,
) => {
  return useMutation({
    mutationFn: (data: SetPasswordRequest) =>
      authService.setPassword(token, data),
    onSuccess: (data) => {
      if (onSuccess) {
        onSuccess(data);
      }
    },
  });
};

export const useForgotPassword = (
  onSuccess?: (data: ForgotPasswordResponse) => void,
) => {
  return useMutation({
    mutationFn: (data: ForgotPasswordRequest) =>
      authService.forgotPassword(data),
    onSuccess: (data) => {
      if (onSuccess) {
        onSuccess(data);
      }
    },
  });
};

export const useSubscriptionStatus = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["subscriptionStatus"],
    queryFn: () => userService.getSubscriptionStatus(),
    enabled,
  });
};

export const useRenewSubscription = () => {
  return useMutation({
    mutationFn: (data: { email: string; country: string; view?: boolean }) =>
      userService.renewSubscription(data),
  });
};

export const useSubscriptionPlans = () => {
  return useMutation({
    mutationFn: () => userService.getSubscriptionPlans(),
  });
};

export const useUserProfile = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["userProfile"],
    queryFn: () => userService.getUserProfile(),
    enabled,
  });
};

export const useUpdateUserProfile = () => {
  return useMutation({
    mutationFn: (data: {
      fullName?: string;
      phoneNumber?: string;
      phoneCode?: string;
      fcmToken?: string;
    }) => userService.updateUserProfile(data),
  });
};
