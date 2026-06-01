import { useInfiniteQuery } from "@tanstack/react-query";
import { apiRequest } from "@/services/http/api-client";

export interface ChatMessage {
  id: string;
  chatSessionId?: string;
  senderId: string;
  receiverId?: string;
  text?: string;
  imageUrl?: string;
  isRead: boolean;
  createdAt: string;

  // --- UI & State Modifiers ---
  isOptimistic?: boolean;
  tempId?: string;
  replyTo?: {
    id: string;
    text: string;
    senderId: string;
    imageUrl?: string;
  };
}

export const useChatHistory = (userId: string, partnerId: string) => {
  return useInfiniteQuery<ChatMessage[]>({
    queryKey: ["chatHistory", partnerId],
    queryFn: async ({ pageParam }) => {
      try {
        const response = await apiRequest<any>({
          url: "/notifications/chat/history",
          method: "GET",
          params: {
            userId1: userId,
            userId2: partnerId,
            cursor: pageParam || undefined,
            limit: 20,
          },
        });

        // Robustly extract the array regardless of backend structure
        const messages = Array.isArray(response)
          ? response
          : response?.messages || response?.data || response?.items || [];

        return messages;
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
        return [];
      }
    },
    initialPageParam: "",
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.length < 20) {
        return undefined;
      }
      return lastPage[lastPage.length - 1]?.id;
    },
  });
};
