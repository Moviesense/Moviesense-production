export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
  accessToken?: string;
  data: {
    token: string;
    refreshToken?: string;
    accessToken?: string;
  };
  link?: string;
  email?: string;
  status?: boolean;
  message?: string;
}

export interface LoginRequest {
  email: string;
  password?: string;
  fcmToken?: string;
}

export interface SignupRequest {
  email: string;
  password?: string;
  name?: string;
  country: string;
  phoneCode?: string;
  mobileNumber?: string;
}

export interface ValidateResetTokenResponse {
  status: boolean;
  message: string;
}

export interface SetPasswordRequest {
  newPassword: string;
}

export interface SetPasswordResponse {
  status: boolean;
  message: string;
  user: User;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  status: boolean;
  message: string;
}
