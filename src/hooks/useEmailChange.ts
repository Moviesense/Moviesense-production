import { useMutation } from "@tanstack/react-query";
import { emailChangeService } from "@/services/emailChangeService";

export const useRequestEmailChange = () => {
  return useMutation({
    mutationFn: (data: { newEmail: string; password: string }) =>
      emailChangeService.requestEmailChange(data),
  });
};

export const useVerifyEmailChange = () => {
  return useMutation({
    mutationFn: (token: string) => emailChangeService.verifyEmailChange(token),
  });
};
