"use client";

import {
  useQuery,
  useMutation,
  keepPreviousData,
  useQueryClient,
} from "@tanstack/react-query";
import { apiRequest, ApiError } from "@/services/http/api-client";

// --- Types ---
export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  priceAtTime: string | number;
}

export interface Order {
  id: string;
  createdAt: string;
  totalAmount: string | number;
  status:
    | "PENDING"
    | "AWAITING_PAYMENT"
    | "CONFIRMED"
    | "PROCESSING"
    | "OUT_FOR_DELIVERY"
    | "DELIVERED"
    | "CANCELLED";
  items: OrderItem[];
}

export interface AddressPayload {
  street: string;
  city: string;
  zip: string;
  phone: string;
}

export interface CreateOrderRequest {
  items: {
    productId: string;
    productName: string;
    quantity: number;
    priceAtTime: number;
  }[];
  shippingAddress: AddressPayload;
}

// --- API Functions ---

const getOrders = async (): Promise<Order[]> => {
  const response = await apiRequest<{ data: Order[] }>({
    url: "/orders",
    method: "GET",
  });
  return response.data;
};

const getOrderById = async (orderId: string): Promise<Order> => {
  const response = await apiRequest<{ data: Order }>({
    url: `/orders/${orderId}`,
    method: "GET",
  });
  return response.data;
};

const createOrder = async (payload: CreateOrderRequest): Promise<Order> => {
  const response = await apiRequest<{ data: Order }>({
    url: "/orders",
    method: "POST",
    data: payload,
  });
  return response.data;
};

// --- Hooks ---

/**
 * Fetch all orders for the currently authenticated user.
 */
export function useOrdersQuery(enabled: boolean = true) {
  return useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
    enabled, // CRITICAL: Don't run until session is authenticated
    placeholderData: keepPreviousData,
  });
}

/**
 * Fetch a specific order by ID.
 */
export function useOrderByIdQuery(orderId?: string) {
  return useQuery({
    queryKey: ["orders", orderId],
    queryFn: () => getOrderById(orderId!), // The '!' asserts orderId is defined (safeguarded by 'enabled')
    enabled: !!orderId,
    placeholderData: keepPreviousData,
  });
}

/**
 * Create a new order.
 * Automatically invalidates the "orders" cache upon success to ensure the order list is fresh.
 */
export function useCreateOrder(
  onSuccess?: (data: Order) => void,
  onError?: (error: ApiError) => void,
) {
  const queryClient = useQueryClient();

  return useMutation<Order, ApiError, CreateOrderRequest>({
    mutationFn: createOrder,
    onSuccess: (data) => {
      // Automatically refresh the order history whenever a new order is placed!
      queryClient.invalidateQueries({ queryKey: ["orders"] });

      if (onSuccess) onSuccess(data);
    },
    onError,
  });
}
