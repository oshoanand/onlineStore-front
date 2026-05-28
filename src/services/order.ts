"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "./http/api-client";

// ==========================================
// INTERFACES
// ==========================================
export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  priceAtTime: number;
}

export interface OrderHistory {
  id: string;
  action: string;
  oldStatus: string | null;
  newStatus: string;
  notes: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderId: string;
  totalAmount: number;
  shippingCost: number;
  status: string;
  paymentMethod: string;
  paymentType: string;
  deliveryAuthCode: string;
  createdAt: string;
  items: OrderItem[];
  history: OrderHistory[];
  shippingAddress: {
    city: string;
    street: string;
    state?: string;
  };
}

// ==========================================
// RAW API FUNCTIONS
// ==========================================

/**
 * Fetch all orders for the authenticated user
 */
export const fetchUserOrdersApi = async (): Promise<Order[]> => {
  const response = await apiRequest<{ status: string; data: Order[] }>({
    method: "GET",
    url: "/orders",
  });
  // Return just the data array to make React Query usage cleaner
  return response.data;
};

/**
 * Confirm delivery using the secure PIN
 */
export const verifyDeliveryPinApi = async ({
  orderId,
  pin,
}: {
  orderId: string;
  pin: string;
}) => {
  return apiRequest<{ success: boolean; message: string }>({
    method: "POST",
    url: `/orders/courier/${orderId}/verify`,
    data: { deliveryAuthCode: pin },
  });
};

// ==========================================
// REACT QUERY CUSTOM HOOKS
// ==========================================

/**
 * Hook to fetch and cache the user's orders.
 * Automatically handles loading and error states.
 */
export const useUserOrders = () => {
  return useQuery({
    queryKey: ["orders", "user"],
    queryFn: fetchUserOrdersApi,
    staleTime: 1000 * 60 * 5, // Cache data for 5 minutes before background refetching
  });
};

/**
 * Hook to verify the delivery PIN.
 * Automatically invalidates the order cache upon success to show the new "DELIVERED" status.
 */
export const useVerifyDeliveryPin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: verifyDeliveryPinApi,
    onSuccess: () => {
      // Instantly trigger a background refetch of the orders list so the UI updates
      queryClient.invalidateQueries({ queryKey: ["orders", "user"] });
    },
  });
};
