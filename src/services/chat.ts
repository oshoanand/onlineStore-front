import { apiRequest } from "@/services/http/api-client";

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  content: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
  fileType?: string | null;
  isRead: boolean;
  isDeleted: boolean;
  createdAt: string;
}

export interface ChatRoom {
  id: string;
  recipientId: string;
  recipientName: string;
  lastMessage: string;
  unreadCount: number;
  updatedAt: string;
}

export const chatApi = {
  // Get list of active chats for the sidebar
  getRooms: () =>
    apiRequest<{ data: ChatRoom[] }>({
      method: "GET",
      url: "/chat/rooms",
    }),

  // Get specific chat history
  getHistory: (roomId: string) =>
    apiRequest<{ data: ChatMessage[] }>({
      method: "GET",
      url: `/chat/${roomId}/history`,
    }),

  // Upload attachment (Image, PDF)
  uploadAttachment: (data: FormData) =>
    apiRequest<{
      data: { fileUrl: string; fileName: string; fileType: string };
    }>({
      method: "POST",
      url: "/chat/upload",
      data,
    }),
};
