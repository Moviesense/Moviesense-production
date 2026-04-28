// Types for the email-token-driven subscription flow.

export interface ParseUrlRequest {
  token: string;
}

export interface ParseUrlSuccess {
  status: true;
  valid: true;
  message: string;
  _id: string;
  email: string;
  token: string;
  tokenExpiresAt: string;
  planType?: string | null;
  passwordCreated: boolean;
  country: string;
  phoneCode?: string;
  mobileNumber?: string;
  subscriptionExpiry?: string | null;
}

export interface ParseUrlInvalid {
  status: false;
  valid: false;
  message: string;
}

export type ParseUrlResponse = ParseUrlSuccess | ParseUrlInvalid;

export interface SubscriptionPlanItem {
  _id: string;
  product_id: string;
  name: string;
  heading: string;
  current_price: string;
  actual_price: string;
  country: string;
  planStatus: "active" | "inactive" | string;
  most_popular?: boolean;
  description?: string;
  features?: string[];
}

export interface PlansResponse {
  status: boolean;
  message: string;
  plans: SubscriptionPlanItem[];
  total: number;
}

export interface CouponValid {
  status: true;
  coupon: {
    discountPercent: number;
    planType?: string;
  };
}

export interface CouponInvalid {
  status: false;
  message: string;
}

export type CouponResponse = CouponValid | CouponInvalid;

export interface AnalyticsIncrementRequest {
  eventType: string;
  movieId?: string | null;
}

export interface AnalyticsIncrementResponse {
  status: boolean;
  message: string;
  data: {
    eventType: string;
    movieId: string | null;
    date: string;
    count: number;
  };
}

export interface CheckoutRequest {
  product_id: string;
  successUrl: string;
  cancelUrl: string;
  email: string;
  token: string;
  promoCode?: string;
}

export interface CheckoutResponse {
  status: boolean;
  message: string;
  sessionId?: string;
  url?: string;
}

export interface CreateFreeSubscriptionRequest {
  product_id: string;
  email: string;
  token: string;
}

export interface CreateFreeSubscriptionResponse {
  status: boolean;
  message: string;
  subscriptionId?: string;
}

export interface CreatePasswordRequest {
  token: string;
  password: string;
  phoneCode: string;
  phoneNumber: string;
}

export interface CreatePasswordResponse {
  status: boolean;
  message: string;
}

export interface RenewTokenStatusResponse {
  status: boolean;
  used: boolean;
}

export interface RenewTokenMarkResponse {
  status: boolean;
  message: string;
}
