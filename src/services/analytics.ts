"use client";

import { apiRequest } from "@/services/http/api-client";

export const logMarketplaceClick = async (
  productId: string,
  marketplace: string,
) => {
  try {
    await apiRequest({
      url: "/products/public/analytics/marketplace-click",
      method: "POST",
      data: {
        productId,
        marketplace,
        userAgent: window.navigator.userAgent,
      },
    });
  } catch (error) {
    console.error("Failed to log marketplace click:", error);
  }
};
