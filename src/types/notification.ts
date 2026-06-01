export interface BaseNotification {
  id: string | number;
  isRead?: boolean;
  title: string;
  message?: string;
  createdAt: string | Date;
  link?: string;
}

// Chat Message Notification
export interface ChatMessagePayload extends BaseNotification {
  type: "CHAT_MESSAGE";
  data: {
    chatId: string;
    senderName: string;
    preview: string;
  };
}

// Standard System/Backend Payload
export interface SystemRequestPayload extends BaseNotification {
  type: "SYSTEM" | "ORDER" | "SUPPORT" | "ALERT";
  data?: any;
}

// Union Type
export type NotificationItem =
  | ChatMessagePayload
  | SystemRequestPayload
  | (BaseNotification & { type: string; data?: any });

export interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  markAllAsRead: () => Promise<void>;
  markAsRead: (id: string | number) => Promise<void>;
  socket: any;
}
