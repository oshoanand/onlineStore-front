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

export interface GroupedProductsResponse {
  success: boolean;
  data: Record<string, Product[]>;
}

// Hook to fetch public products (List)
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

      const res = await apiRequest<PaginatedProducts>({
        method: "GET",
        url: `/products/public?${queryParams.toString()}`,
      });
      return res;
    },
  });
};

// ==========================================
// 🚨 Hook for Grouped Homepage Products
// ==========================================
export const usePublicGroupedProducts = (
  tags: string[] = ["Bestseller", "New", "Sale"],
) => {
  return useQuery({
    queryKey: ["public-grouped-products", tags],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (tags.length > 0) {
        queryParams.append("tags", tags.join(","));
      }

      const res = await apiRequest<GroupedProductsResponse>({
        method: "GET",
        url: `/products/public/grouped?${queryParams.toString()}`,
      });
      return res;
    },
    // Cache the homepage data for 5 minutes to keep it blazing fast
    staleTime: 5 * 60 * 1000,
  });
};
