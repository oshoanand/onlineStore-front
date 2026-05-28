import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "./http/api-client";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  thumbImage: string | null;
  parentId: string | null;
  children: Category[];
  createdAt?: string;
  updatedAt?: string;
}

export const usePublicCategories = () => {
  return useQuery({
    queryKey: ["public-categories-tree"],
    queryFn: async () => {
      const res = await apiRequest<{ data: Category[] }>({
        method: "GET",
        url: "/products/public/categories/all/tree",
      });
      return res.data;
    },

    staleTime: 5 * 60 * 1000,
  });
};
