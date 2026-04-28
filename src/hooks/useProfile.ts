import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { profileService } from "@/services/profileService";
import { CreateProfileRequest, UpdateProfileRequest } from "@/types/profile";

export const useProfiles = () => {
  return useQuery({
    queryKey: ["profiles"],
    staleTime: 0,
    initialDataUpdatedAt: 0,
    queryFn: () => profileService.getProfiles(),
  });
};

export const useCreateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProfileRequest) =>
      profileService.createProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProfileRequest }) =>
      profileService.updateProfile(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });
};

export const useDeleteProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => profileService.deleteProfile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });
};

export const useSwitchProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => profileService.switchProfile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });
};

export const useActiveProfile = () => {
  const { data } = useProfiles();
  return data?.profiles?.find((p) => p.isActive);
};
