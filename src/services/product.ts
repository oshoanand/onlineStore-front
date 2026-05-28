import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "./http/api-client";

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  description: string;
  detailedDescription: string | null;
  brand: string | null;
  price: number;
  discountedPrice: number | null;
  inStock: number;
  status: "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK" | "ARCHIVED";
  weight: string | null;
  dimensions: string | null;
  color: string | null;
  tags: string[];
  averageRating: number;
  reviewCount: number;
  metaTitle: string | null;
  metaDescription: string | null;
  keywords: string | null;
  thumbImage: string | null;
  imageArray: string[];
  createdAt: string;
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

/**
 * Fetch a single product by its SEO-friendly slug
 */
export const getProductBySlug = async (slug: string): Promise<Product> => {
  // Using native fetch for Next.js Server Components allows aggressive caching
  // and deduplication, but we'll use your standard apiRequest structure.
  const response = await apiRequest<{ success: boolean; data: Product }>({
    url: `/products/public/slug/${slug}`,
    method: "GET",
  });
  return response.data;
};
