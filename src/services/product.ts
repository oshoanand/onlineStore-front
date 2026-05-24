import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "./http/api-client";

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  description: string;
  brand: string | null;
  price: string | number;
  discountedPrice: string | number | null;
  inStock: number;
  status: "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK" | "ARCHIVED";
  averageRating: number;
  reviewCount: number;
  thumbImage: string | null;
  tags: string[];
}

export interface PaginatedProducts {
  success: boolean;
  data: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Hook to fetch public products
export const usePublicProducts = (params?: {
  page?: number;
  limit?: number;
  category?: string;
  sort?: string;
}) => {
  return useQuery({
    queryKey: ["public-products", params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", String(params.page));
      if (params?.limit) queryParams.append("limit", String(params.limit));
      if (params?.category) queryParams.append("category", params.category);
      if (params?.sort) queryParams.append("sort", params.sort);

      // Assuming your product-service exposes a public route for catalog browsing
      const res = await apiRequest<PaginatedProducts>({
        method: "GET",
        url: `/products/public?${queryParams.toString()}`,
      });
      return res;
    },
  });
};
