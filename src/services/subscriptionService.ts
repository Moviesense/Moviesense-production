import api from "@/lib/axios";
import {
  ParseUrlRequest,
  ParseUrlResponse,
  PlansResponse,
  CouponResponse,
  AnalyticsIncrementRequest,
  AnalyticsIncrementResponse,
  CheckoutRequest,
  CheckoutResponse,
  CreateFreeSubscriptionRequest,
  CreateFreeSubscriptionResponse,
  CreatePasswordRequest,
  CreatePasswordResponse,
  RenewTokenStatusResponse,
  RenewTokenMarkResponse,
  CancelSubscriptionResponse,
  CreateCancelPortalSessionRequest,
  CreateCancelPortalSessionResponse,
} from "@/types/subscription";
import axios from "axios";

export const subscriptionService = {
  parseUrl: async (data: ParseUrlRequest): Promise<ParseUrlResponse> => {
    const res = await api.post<ParseUrlResponse>(
      "/subscription/parse-url",
      data,
    );
    return res.data;
  },

  getPlans: async (country: string): Promise<PlansResponse> => {
    const res = await api.get<PlansResponse>(
      "/subscription/plans?status=active",
      {
        params: { country },
      },
    );
    return res.data;
  },

  validateCoupon: async (code: string): Promise<CouponResponse> => {
    const res = await api.get<CouponResponse>("/coupon/validate", {
      params: { code },
    });
    return res.data;
  },

  incrementAnalytics: async (
    data: AnalyticsIncrementRequest,
  ): Promise<AnalyticsIncrementResponse> => {
    const res = await api.post<AnalyticsIncrementResponse>(
      "/analytics/increment",
      data,
    );
    return res.data;
  },

  createCheckout: async (data: CheckoutRequest): Promise<CheckoutResponse> => {
    const res = await api.post<CheckoutResponse>(
      "/subscription/checkout",
      data,
    );
    return res.data;
  },

  createFreeSubscription: async (
    data: CreateFreeSubscriptionRequest,
  ): Promise<CreateFreeSubscriptionResponse> => {
    const res = await api.post<CreateFreeSubscriptionResponse>(
      "/subscription/create-free-subscription",
      data,
    );
    return res.data;
  },

  createPassword: async (
    data: CreatePasswordRequest,
  ): Promise<CreatePasswordResponse> => {
    const { token, ...body } = data;
    const res = await axios.post<CreatePasswordResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/subscription/create-password`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return res.data;
  },

  checkRenewTokenUsed: async (
    token: string,
  ): Promise<RenewTokenStatusResponse> => {
    const res = await api.post<RenewTokenStatusResponse>(
      "/subscription/check-renew-token-used",
      { token },
    );
    return res.data;
  },

  cancelSubscription: async (): Promise<CancelSubscriptionResponse> => {
    const res = await api.post<CancelSubscriptionResponse>(
      "/subscription/cancel",
      {},
    );
    return res.data;
  },

  createCancelPortalSession: async (
    data: CreateCancelPortalSessionRequest,
  ): Promise<CreateCancelPortalSessionResponse> => {
    const res = await api.post<CreateCancelPortalSessionResponse>(
      "/subscription/create-cancel-portal-session",
      data,
    );
    return res.data;
  },

  markRenewTokenUsed: async (
    token: string,
  ): Promise<RenewTokenMarkResponse> => {
    const res = await axios.post<RenewTokenMarkResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/subscription/mark-renew-token-used`,
      { token },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return res.data;
  },
};
