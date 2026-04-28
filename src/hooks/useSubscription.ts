import { useMutation, useQuery } from "@tanstack/react-query";
import { subscriptionService } from "@/services/subscriptionService";
import {
  AnalyticsIncrementRequest,
  CheckoutRequest,
  CreateFreeSubscriptionRequest,
  CreatePasswordRequest,
} from "@/types/subscription";

export const useParseSubscriptionToken = (token: string) => {
  return useQuery({
    queryKey: ["subscription", "parseUrl", token],
    queryFn: () => subscriptionService.parseUrl({ token }),
    enabled: !!token,
    retry: false,
    staleTime: 0,
  });
};

export const useSubscriptionPlansByCountry = (
  country: string | undefined,
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: ["subscription", "plans", country],
    queryFn: () => subscriptionService.getPlans(country!),
    enabled: !!country && enabled,
  });
};

export const useValidateCoupon = () => {
  return useMutation({
    mutationFn: (code: string) => subscriptionService.validateCoupon(code),
  });
};

export const useIncrementAnalytics = () => {
  return useMutation({
    mutationFn: (data: AnalyticsIncrementRequest) =>
      subscriptionService.incrementAnalytics(data),
  });
};

export const useCreateCheckout = () => {
  return useMutation({
    mutationFn: (data: CheckoutRequest) =>
      subscriptionService.createCheckout(data),
  });
};

export const useCreateFreeSubscription = () => {
  return useMutation({
    mutationFn: (data: CreateFreeSubscriptionRequest) =>
      subscriptionService.createFreeSubscription(data),
  });
};

export const useCreatePassword = () => {
  return useMutation({
    mutationFn: (data: CreatePasswordRequest) =>
      subscriptionService.createPassword(data),
  });
};

export const useCheckRenewTokenUsed = () => {
  return useMutation({
    mutationFn: (token: string) =>
      subscriptionService.checkRenewTokenUsed(token),
  });
};

export const useMarkRenewTokenUsed = () => {
  return useMutation({
    mutationFn: (token: string) =>
      subscriptionService.markRenewTokenUsed(token),
  });
};
