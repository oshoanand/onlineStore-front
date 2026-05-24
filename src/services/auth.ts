"use client";

import { useMutation } from "@tanstack/react-query";
import { apiRequest, ApiError } from "@/services/http/api-client";

// --- Types ---

export interface RegisterRequest {
  name: string;
  email: string;
  mobile: string;
  password: string;
}

export interface ForgotPasswordRequest {
  mobile: string;
}

export interface ResetPasswordRequest {
  mobile: string;
  otp: string;
  newPassword: string;
}

// --- API Functions ---

const registerUserApi = async (data: RegisterRequest) => {
  return apiRequest<any>({
    url: "/users/auth/register",
    method: "POST",
    data,
  });
};

const forgotPasswordApi = async (data: ForgotPasswordRequest) => {
  return apiRequest<any>({
    url: "/users/forgot-password",
    method: "POST",
    data,
  });
};

const resetPasswordApi = async (data: ResetPasswordRequest) => {
  return apiRequest<any>({
    url: "/users/reset-password",
    method: "POST",
    data,
  });
};

// --- Hooks ---

/**
 * Registers a new user account.
 */
export function useRegisterUser(
  onSuccess?: () => void,
  onError?: (error: ApiError) => void,
) {
  return useMutation<any, ApiError, RegisterRequest>({
    mutationFn: registerUserApi,
    onSuccess: () => {
      if (onSuccess) onSuccess();
    },
    onError,
  });
}

/**
 * Initiates the forgot password flow (e.g., sends an OTP).
 */
export function useForgotPassword(
  onSuccess?: () => void,
  onError?: (error: ApiError) => void,
) {
  return useMutation<any, ApiError, ForgotPasswordRequest>({
    mutationFn: forgotPasswordApi,
    onSuccess: () => {
      if (onSuccess) onSuccess();
    },
    onError,
  });
}

/**
 * Resets the password using an OTP or token.
 */
export function useResetPassword(
  onSuccess?: () => void,
  onError?: (error: ApiError) => void,
) {
  return useMutation<any, ApiError, ResetPasswordRequest>({
    mutationFn: resetPasswordApi,
    onSuccess: () => {
      if (onSuccess) onSuccess();
    },
    onError,
  });
}
