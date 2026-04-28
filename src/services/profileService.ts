import api from "@/lib/axios";
import {
  GetProfilesResponse,
  CreateProfileRequest,
  UpdateProfileRequest,
  ProfileResponse,
  SwitchProfileResponse,
} from "@/types/profile";

export const profileService = {
  getProfiles: async (): Promise<GetProfilesResponse> => {
    const response = await api.get<GetProfilesResponse>("/user/profiles");
    return response.data;
  },

  createProfile: async (
    data: CreateProfileRequest
  ): Promise<ProfileResponse> => {
    const response = await api.post<ProfileResponse>("/user/profiles", data);
    return response.data;
  },

  updateProfile: async (
    id: string,
    data: UpdateProfileRequest
  ): Promise<ProfileResponse> => {
    const response = await api.put<ProfileResponse>(
      `/user/profiles/${id}`,
      data
    );
    return response.data;
  },

  deleteProfile: async (id: string): Promise<ProfileResponse> => {
    const response = await api.delete<ProfileResponse>(`/user/profiles/${id}`);
    return response.data;
  },

  switchProfile: async (id: string): Promise<SwitchProfileResponse> => {
    const response = await api.post<SwitchProfileResponse>(
      `/user/profiles/${id}/switch`,
      {}
    );
    return response.data;
  },
};
