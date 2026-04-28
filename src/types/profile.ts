import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["adult", "kids"]),
  imageIndex: z.number().int().min(0),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  imageIndex: z.number().int().min(0),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;

export interface Profile {
  _id: string;
  name: string;
  type: "adult" | "kids";
  isActive: boolean;
  imageIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface GetProfilesResponse {
  status: boolean;
  message: string;
  email: string;
  profiles: Profile[];
  maxProfiles: number;
}

export interface CreateProfileRequest {
  name: string;
  type: "adult" | "kids";
  imageIndex: number;
}

export interface UpdateProfileRequest {
  name: string;
  type: "adult" | "kids";
  imageIndex: number;
}

export interface ProfileResponse {
  status: boolean;
  message: string;
  profile?: Profile;
}

export interface SwitchProfileResponse {
  status: boolean;
  message: string;
  activeProfile: Profile;
}
