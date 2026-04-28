import { useQuery } from "@tanstack/react-query";
import { supportService } from "@/services/supportService";

export const useSupportLinks = () => {
  return useQuery({
    queryKey: ["supportLinks"],
    queryFn: () => supportService.getSupportLinks(),
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 1,
  });
};
