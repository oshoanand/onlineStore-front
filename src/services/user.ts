import { useMutation } from "@tanstack/react-query";
import { apiRequest, ApiError } from "@/services/http/api-client";

export interface RegisterResponse {
  id: string;
  token: string;
}

export interface UpdateProfileNameRequest {
  name: string;
  mobile: string;
}

export interface UpdateProfileNameResponse {
  message: string;
  name: string;
}

export interface UpdateProfileImageRequest {
  file: File;
  mobile: string;
}
export interface UpdateProfileImageResponse {
  message: string;
  imageUrl?: string;
}

// --- API Functions ---

const updateProfileImage = async ({
  file,
  mobile,
}: UpdateProfileImageRequest): Promise<UpdateProfileImageResponse> => {
  const formData = new FormData();
  formData.append("profile_image", file);
  formData.append("mobile", mobile);
  return apiRequest<UpdateProfileImageResponse, FormData>({
    url: "/api/users/update-profile-image",
    method: "PUT",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

const updateProfileName = async (
  data: UpdateProfileNameRequest,
): Promise<UpdateProfileNameResponse> => {
  return apiRequest<UpdateProfileNameResponse, UpdateProfileNameRequest>({
    url: "/api/users/update-profile",
    method: "PUT",
    data,
    // No specific Content-Type header needed; axios defaults to application/json
  });
};

// NEW: Use Update Profile Name Hook
export const useUpdateProfileName = (
  onSuccess?: (data: UpdateProfileNameResponse) => void,
  onError?: (error: ApiError) => void,
) => {
  return useMutation<
    UpdateProfileNameResponse,
    ApiError,
    UpdateProfileNameRequest
  >({
    mutationFn: updateProfileName,
    onSuccess,
    onError,
  });
};

// --- React Query Hooks ---

export const useUpdateProfileImage = (
  onSuccess?: (data: UpdateProfileImageResponse) => void,
  onError?: (error: ApiError) => void,
) => {
  // Generics: <Response, Error, RequestType>
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
