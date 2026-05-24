"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, ApiError } from "@/services/http/api-client";

// --- Types ---

export interface UpdateProfileRequest {
  name?: string;
  image?: File;
}

export interface SupportTicketRequest {
  support_type: string;
  description: string;
  proof?: File | null;
}

// --- API Functions ---

const updateProfileApi = async (data: UpdateProfileRequest) => {
  const formData = new FormData();
  if (data.name) formData.append("name", data.name);
  if (data.image) formData.append("image", data.image);

  return apiRequest<any>({
    url: "/users/profile",
    method: "PATCH",
    data: formData,
    headers: { "Content-Type": "multipart/form-data" },
  });
};

const createSupportTicketApi = async (data: SupportTicketRequest) => {
  const formData = new FormData();
  formData.append("support_type", data.support_type);
  formData.append("description", data.description);
  if (data.proof) formData.append("proof", data.proof);

  return apiRequest<any>({
    url: "/support/tickets",
    method: "POST",
    data: formData,
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// --- Hooks ---

/**
 * Updates the user's profile (name, image, etc.)
 */
export function useUpdateProfile(
  onSuccess?: (data: any, variables: UpdateProfileRequest) => void,
  onError?: (error: ApiError) => void,
) {
  const queryClient = useQueryClient();

  return useMutation<any, ApiError, UpdateProfileRequest>({
    mutationFn: updateProfileApi,
    onSuccess: (data, variables) => {
      // If you later add a useProfileQuery, you can invalidate it here:
      // queryClient.invalidateQueries({ queryKey: ["profile"] });

      if (onSuccess) onSuccess(data, variables);
    },
    onError,
  });
}

/**
 * Submits a new customer support ticket
 */
export function useCreateSupportTicket(
  onSuccess?: () => void,
  onError?: (error: ApiError) => void,
) {
  return useMutation<any, ApiError, SupportTicketRequest>({
    mutationFn: createSupportTicketApi,
    onSuccess: () => {
      if (onSuccess) onSuccess();
    },
    onError,
  });
}
