export interface SubscriptionPlan {
  _id: string;
  name: string;
  price: number;
  duration: number; // in days
  description?: string;
  features?: string[];
}

export interface SubscriptionStatus {
  _id: string;
  userId: string;
  planId: SubscriptionPlan;
  startDate: string;
  endDate: string;
  status: "active" | "expired" | "cancelled";
  autoRenew: boolean;
  paymentMethod?: string;
}

export interface SubscriptionStatusResponse {
  status: boolean;
  message: string;
  planType?: "free_trial" | "monthly" | "yearly" | string;
  subscriptionExpiry?: string;
  remainingMinutes?: number;
  subscription?: SubscriptionStatus | null;
}
