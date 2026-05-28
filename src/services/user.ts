"use client";

import { useMutation } from "@tanstack/react-query";
import { apiRequest, ApiError } from "@/services/http/api-client";

// ==========================================
// INTERFACES
// ==========================================

export interface RegisterResponse {
  id: string;
  token: string;
}

// 🚨 Aligned with the new backend updateProfileDetails controller
export interface UpdateProfileDetailsRequest {
  profileId: string;
  fullName?: string;
  email?: string;
}

export interface UpdateProfileDetailsResponse {
  status: string;
  message: string;
}

export interface UpdateProfileImageRequest {
  file: File;
  profileId: string;
}

// 🚨 Aligned with the backend response structure
export interface UpdateProfileImageResponse {
  status: string;
  data: {
    profilePhoto: string;
  };
}

// ==========================================
// RAW API FUNCTIONS
// ==========================================

const updateProfileImage = async ({
  file,
  profileId,
}: UpdateProfileImageRequest): Promise<UpdateProfileImageResponse> => {
  const formData = new FormData();
  formData.append("profileImage", file);

  return apiRequest<UpdateProfileImageResponse, FormData>({
    url: `/users/profile/update-image/${profileId}`,
    method: "PUT",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

const updateProfileDetails = async ({
  profileId,
  ...data
}: UpdateProfileDetailsRequest): Promise<UpdateProfileDetailsResponse> => {
  return apiRequest<
    UpdateProfileDetailsResponse,
    Omit<UpdateProfileDetailsRequest, "profileId">
  >({
    url: `/users/profile/update-details/${profileId}`,
    method: "PUT",
    data, // Sending only the text fields (fullName, email)
  });
};

// ==========================================
// REACT QUERY HOOKS
// ==========================================

/**
 * Hook to update text-based profile details (Name, Email)
 */
export const useUpdateProfileDetails = (
  onSuccess?: (data: UpdateProfileDetailsResponse) => void,
  onError?: (error: ApiError) => void,
) => {
  return useMutation<
    UpdateProfileDetailsResponse,
    ApiError,
    UpdateProfileDetailsRequest
  >({
    mutationFn: updateProfileDetails,
    onSuccess,
    onError,
  });
};

/**
 * Hook to upload and update the user's profile image
 */
export const useUpdateProfileImage = (
  onSuccess?: (data: UpdateProfileImageResponse) => void,
  onError?: (error: ApiError) => void,
) => {
  return useMutation<
    UpdateProfileImageResponse,
    ApiError,
    UpdateProfileImageRequest
  >({
    mutationFn: updateProfileImage,
    onSuccess,
    onError,
  });
};
