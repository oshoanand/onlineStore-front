import { apiRequest } from "@/services/http/api-client";

export interface SearchAutocompleteResponse {
  categories: any[];
  products: any[];
}

export interface SearchFullResponse {
  products: any[];
  total: number;
  page: number;
  totalPages: number;
}

/**
 * Fast autocomplete search for the Header dropdown
 */
export const searchCatalogAutocomplete = async (
  query: string,
): Promise<SearchAutocompleteResponse> => {
  if (!query || query.length < 2) return { categories: [], products: [] };

  try {
    const res = await apiRequest<SearchAutocompleteResponse>({
      url: `/products/public/search?q=${encodeURIComponent(query)}`,
      method: "GET",
    });
    return res;
  } catch (error) {
    console.error("Autocomplete search error:", error);
    return { categories: [], products: [] };
  }
};

/**
 * Full product search for the dedicated search page
 */
export const searchProductsFull = async (params: {
  q?: string;
  category?: string;
  page?: number;
  limit?: number;
}): Promise<SearchFullResponse> => {
  try {
    // Note: Ensure this URL matches your product-service search/filter endpoint.
    // If your backend doesn't have a dedicated product search route yet,
    // it will likely look something like this.
    const res = await apiRequest<SearchFullResponse>({
      url: `/products/public/search`,
      method: "GET",
      params: {
        q: params.q || undefined,
        category: params.category || undefined,
        page: params.page || 1,
        limit: params.limit || 24,
      },
    });
    return res;
  } catch (error) {
    console.error("Full search error:", error);
    throw error;
  }
};
