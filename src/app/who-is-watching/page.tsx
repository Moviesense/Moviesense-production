"use client";

import React, { useEffect, useState, Suspense } from "react";
import {
  Plus,
  User,
  X,
  Check,
  Loader2,
  Pencil,
  Trash2,
  UserPen,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/Common/Input";
import { Button } from "@/components/Common/Button";
import {
  useProfiles,
  useCreateProfile,
  useUpdateProfile,
  useDeleteProfile,
  useSwitchProfile,
} from "@/hooks/useProfile";
import { Profile } from "@/types/profile";
import { ConfirmationModal } from "@/components/Common/ConfirmationModal";
import { ProfileModal } from "@/components/Common/ProfileModal";
import { useToast } from "@/context/ToastContext";
import { useLanguage } from "@/context/LanguageContext";
import Image from "next/image";
import { useAnalytics } from "@/hooks/useAnalytics";
import { AnalyticsEventType } from "@/types/analytics";
import { BackgroundVideo } from "@/components/Common/BackgroundVideo";

const AVATAR_COLORS = [
  "from-sky-500 via-cyan-500 to-teal-500",
  "from-purple-500 via-pink-500 to-red-500",
  "from-orange-500 via-amber-500 to-yellow-500",
  "from-green-500 via-emerald-500 to-teal-500",
  "from-indigo-500 via-blue-500 to-sky-500",
];

function WhosWatchingContent() {
  const router = useRouter();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const { track } = useAnalytics();

  const { data: profileData, isLoading, isError } = useProfiles();
  const createProfileMutation = useCreateProfile();
  const updateProfileMutation = useUpdateProfile();
  const deleteProfileMutation = useDeleteProfile();
  const switchProfileMutation = useSwitchProfile();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);

  // Delete Confirmation State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<string | null>(null);

  const searchParams = useSearchParams();

  useEffect(() => {
    const isEditRoute = searchParams.get("isEditMode") === "true";
    if (isEditRoute) {
      setIsEditMode(true);
    }
  }, [searchParams]);

  const handleOpenAddModal = () => {
    track(AnalyticsEventType.addProfile);
    setEditingProfile(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (profile: Profile) => {
    track(AnalyticsEventType.editProfile);
    setEditingProfile(profile);
    setIsModalOpen(true);
  };

  const handleSaveProfile = async (data: {
    name: string;
    type: "adult" | "kids";
    imageIndex: number;
  }) => {
    try {
      if (editingProfile) {
        await updateProfileMutation.mutateAsync({
          id: editingProfile._id,
          data,
        });
        showToast("Profile updated successfully", "success");
      } else {
        await createProfileMutation.mutateAsync(data);
        showToast("Profile created successfully", "success");
      }
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Failed to save profile:", error);
      showToast(
        error?.response?.data?.message || "Failed to save profile",
        "error",
      );
    }
  };

  const handleDeleteClick = (id: string) => {
    setProfileToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!profileToDelete) return;
    try {
      await deleteProfileMutation.mutateAsync(profileToDelete);
      showToast("Profile deleted successfully", "success");
      setIsDeleteModalOpen(false);
      setProfileToDelete(null);
      setIsEditMode(false);
    } catch (error: any) {
      console.error("Failed to delete profile:", error);
      showToast(
        error?.response?.data?.message || "Failed to delete profile",
        "error",
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-teal-500 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center text-white">
        <p>Error loading profiles. Please try again later.</p>
      </div>
    );
  }

  const handleProfileClick = async (profileId: string) => {
    if (isEditMode) return;
    try {
      track(AnalyticsEventType.selectProfile);
      const response = await switchProfileMutation.mutateAsync(profileId);
      if (response.status) {
        router.push("/home");
      } else {
        showToast(response.message || "Failed to switch profile", "error");
      }
    } catch (error: any) {
      console.error("Failed to switch profile:", error);
      showToast(
        error?.response?.data?.message || "Failed to switch profile",
        "error",
      );
    }
  };

  const profiles = profileData?.profiles || [];

  return (
    <div className="min-h-screen flex flex-col font-manrope">
      {/* Header divider */}
      {/* <div className="border-b border-neutral-800" /> */}
      {/* <BackgroundVideo /> */}
      {/* Main content */}
      <div className="flex-1 flex flex-col items-center">
        <Image
          src="/images/logo-sense.png"
          alt="Who is watching"
          width={400}
          height={200}
          className="h-auto w-48 sm:w-64 md:w-80 lg:w-96 xl:w-[28rem] 2xl:w-[32rem] mt-4 mt-20 mb-8"
        />
        <h1 className="text-white text-lg sm:text-3xl xl:text-5xl font-medium mb-6 mt-6 sm:mb-12 sm:mb-12 tracking-tight text-center px-4">
          {isEditMode ? t("manageProfiles") : t("whoIsWatching")}
        </h1>

        {/* Profiles */}
        <div className="flex flex-wrap gap-4 sm:gap-2 items-start justify-center max-w-7xl px-4">
          {profiles.map((profile) => (
            <div
              key={profile._id}
              className="flex flex-col items-center group relative"
            >
              <div
                className={`w-24 h-24 sm:w-40 sm:h-40 xl:w-60 xl:h-60 rounded-full overflow-hidden flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-teal-500/20 bg-gradient-to-br ${
                  AVATAR_COLORS[
                    Math.max(0, (profile.imageIndex || 1) - 1) %
                      AVATAR_COLORS.length
                  ]
                } cursor-pointer`}
                onClick={() => handleProfileClick(profile._id)}
              >
                {profile.type === "kids" ? (
                  <span className="text-white/90 text-3xl sm:text-6xl xl:text-7xl font-bold">
                    {t("kids")}
                  </span>
                ) : (
                  <User
                    size={40}
                    className="text-white/90 sm:w-[80px] sm:h-[80px] xl:w-[110px] xl:h-[110px]"
                  />
                )}

                {/* Edit Overlay */}
                {isEditMode && (
                  <div className="absolute inset-0 bg-black/60 w-24 h-24 sm:w-40 sm:h-40 xl:w-60 xl:h-60 rounded-full flex items-center justify-center gap-4 xl:gap-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditModal(profile);
                      }}
                      className="p-2 sm:p-5 rounded-full bg-white/30 hover:bg-white/40 transition-colors cursor-pointer"
                    >
                      <Pencil size={24} className="text-white" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(profile._id);
                      }}
                      className="p-2 sm:p-5 rounded-full bg-red-500/50 hover:bg-red-500/70 transition-colors cursor-pointer"
                    >
                      <Trash2 size={24} className="text-red-300" />
                    </button>
                  </div>
                )}
              </div>
              <p className="mt-2 text-white text-lg sm:text-2xl font-medium group-hover:text-white transition-colors capitalize">
                {profile.name.toLowerCase()}
              </p>
            </div>
          ))}

          {/* Add Profile Button */}
          {!isEditMode && profiles.length < (profileData?.maxProfiles || 5) && (
            <div
              className="flex flex-col items-center group cursor-pointer"
              onClick={handleOpenAddModal}
            >
              <div className="w-24 h-24 sm:w-40 sm:h-40 xl:w-60 xl:h-60 rounded-full bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-center transition-all duration-300 group-hover:bg-white/10 group-hover:border-white/30 group-hover:scale-105">
                {/* <Plus
                  size={20}
                  className="text-white/30 group-hover:text-white/60 sm:w-[110px] sm:h-[110px]"
                /> */}
                <span className="text-white/30 group-hover:text-white/60 sm:w-[120px] sm:h-[120px]">
                  <Image
                    src="/images/plus.svg"
                    alt="Plus"
                    width={100}
                    height={100}
                    className="w-full h-full"
                  />
                </span>
              </div>
              <p className="mt-2 text-zinc-500 text-lg sm:text-2xl font-medium group-hover:text-white transition-colors">
                {t("addProfile")}
              </p>
            </div>
          )}
        </div>

        {/* Profile Limit Message */}
        {!isEditMode && profiles.length >= (profileData?.maxProfiles || 5) && (
          <p className="mt-8 text-zinc-500 text-sm sm:text-base animate-pulse">
            Maximum of {profileData?.maxProfiles || 5} profiles reached.
          </p>
        )}

        {/* Edit Button */}
        <div className="mt-4 mx-auto flex flex-col items-center">
          <span
            onClick={() => setIsEditMode(!isEditMode)}
            className="px-8 sm:px-12 py-3 sm:py-4 text-sm sm:text-3xl cursor-pointer hover:text-white text-neutral-400 hover:transition-all font-medium flex items-center gap-2"
          >
            <UserPen size={25} className="mr-1 sm:mr-2" />
            {isEditMode ? t("done") : t("manageProfiles")}
          </span>
          <span
            onClick={() => router.back()}
            className="text-center text-sky-600 cursor-pointer text-xs sm:text-lg"
          >
            Back
          </span>
        </div>
      </div>
      {/* Profile Modal */}
      <ProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingProfile={editingProfile}
        onSave={handleSaveProfile}
        isSaving={
          createProfileMutation.isPending || updateProfileMutation.isPending
        }
        avatarColors={AVATAR_COLORS}
      />
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Delete Profile?"
        description="This profile's history and My List will be gone forever. You can't undo this."
        okText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        isLoading={deleteProfileMutation.isPending}
      />
      {/* Footer */}
      {/* <Footer /> */}
    </div>
  );
}

export default function WhosWatching() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-teal-500 animate-spin" />
        </div>
      }
    >
      <WhosWatchingContent />
    </Suspense>
  );
}
