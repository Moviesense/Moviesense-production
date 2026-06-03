import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface EmailChangeResponse {
  status: boolean;
  message: string;
}

// We use a plain axios instance (rather than the shared `api`) so we fully
// control error handling — the shared interceptor auto-toasts errors and
// retries on 401, which would mishandle the "Invalid password" 401 here.
export const emailChangeService = {
  requestEmailChange: async (data: {
    newEmail: string;
    password: string;
  }): Promise<EmailChangeResponse> => {
    const token = Cookies.get("token");
    const response = await axios.post<EmailChangeResponse>(
      `${API_BASE_URL}/user/email-change/request`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
    );
    return response.data;
  },

  verifyEmailChange: async (token: string): Promise<EmailChangeResponse> => {
    const response = await axios.post<EmailChangeResponse>(
      `${API_BASE_URL}/user/email-change/verify`,
      { token },
      {
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      },
    );
    return response.data;
  },
};
