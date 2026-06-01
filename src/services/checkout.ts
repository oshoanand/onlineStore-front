import { apiRequest } from "./http/api-client";

// Mapping exactly to how the cart items are structured in your store
export interface CartItem {
  productId: string;
  name?: string;
  productName?: string; // Adding alias to match backend expectation
  price: number;
  discountedPrice?: number;
  quantity: number;
  imageUrl?: string;
}

export interface Address {
  id?: string;
  street: string;
  city: string;
  state?: string;
  zipCode?: string;
  isDefault: boolean;
}

export interface UserProfileResponse {
  status: string;
  data: {
    id: string;
    name: string;
    email: string;
    mobile: string;
    customerProfile?: {
      addresses: Address[];
    };
    // Fallback in case your backend flattens the response
    addresses?: Address[];
  };
}

export interface ShippingCalculationResponse {
  success: boolean;
  data: {
    zoneName: string;
    shippingCost: number;
    isFreeShipping: boolean;
    amountToFreeShipping: number | null;
  };
}

export interface OrderPayload {
  items: CartItem[];
  shippingAddressId?: string | null;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  paymentMethod: string;
  paymentType: string;
  promoCode?: string;
  shippingCost?: number;
  discountAmount?: number;
  totalAmount?: number;
}

// 🚨 FIXED: Matches your backend order-service response structure
export interface BackendOrderData {
  id: string;
  orderId: string;
  userId: string;
  totalAmount: number;
  status: string;
  paymentType: string;
}

export interface OrderResponse {
  success?: boolean; // For custom wrappers
  status?: string; // For REST standard (e.g. "success")
  message?: string;
  paymentUrl?: string;
  data?: BackendOrderData; // The actual created order object from backend
  orderId?: string;
  id?: string;
}

// ==========================================
// API CLIENT FUNCTIONS
// ==========================================

/**
 * Fetch User Profile (Includes saved addresses)
 */
export const fetchUserProfile = async () => {
  const response = await apiRequest<UserProfileResponse>({
    method: "GET",
    url: "/users/profile",
  });

  // Safe extraction helper depending on how backend nested the addresses
  if (
    response.data &&
    !response.data.addresses &&
    response.data.customerProfile?.addresses
  ) {
    response.data.addresses = response.data.customerProfile.addresses;
  }
  console.log("Fetched User Profile:", response);
  return response;
};

/**
 * Add a New Shipping Address
 */
export const addNewAddress = async (addressData: Address) => {
  return apiRequest<{ status: string; data: Address }>({
    method: "POST",
    url: "/users/addresses",
    data: addressData,
  });
};

/**
 * Update an existing Shipping Address
 */
export const updateAddress = async (
  id: string,
  addressData: Partial<Address>,
) => {
  return apiRequest<{ status: string; data: Address }>({
    method: "PUT",
    url: `/users/addresses/${id}`,
    data: addressData,
  });
};

/**
 * Delete a Shipping Address
 */
export const deleteAddress = async (id: string) => {
  return apiRequest<{ status: string; message: string }>({
    method: "DELETE",
    url: `/users/addresses/${id}`,
  });
};

/**
 * Calculate Shipping Cost based on City and Cart Total
 */
export const calculateShippingCost = async (payload: {
  city: string;
  cartTotal: number;
}) => {
  return apiRequest<ShippingCalculationResponse>({
    method: "POST",
    url: "/products/public/shipping/calculate",
    data: payload,
  });
};

/**
 * Place Order
 * Sends the payload to the Order Service to create a pending order.
 */
export const placeOrder = async (
  payload: OrderPayload,
): Promise<OrderResponse> => {
  // Map cart items to the exact structure the backend expects
  const formattedPayload = {
    ...payload,
    items: payload.items.map((item) => ({
      productId: item.productId,
      productName: item.productName || item.name,
      quantity: item.quantity,
    })),
  };

  const response = await apiRequest<OrderResponse>({
    method: "POST",
    url: "/orders/create",
    data: formattedPayload,
  });

  return response;
};
