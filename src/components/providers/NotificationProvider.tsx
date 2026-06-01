"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/useToast";
import { useSocket } from "@/components/providers/SocketProvider";
import { useChatStore } from "@/store/useChatStore";
import { apiRequest } from "@/services/http/api-client";
import {
  NotificationContextType,
  NotificationItem,
} from "@/types/notification";

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const { status } = useSession();
  const { socket } = useSocket();
  const { toast } = useToast();
  const router = useRouter();

  // Local state for the notification list
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // 🚨 FIX: Sync Unread Count strictly with the global Zustand Store
  const unreadCount = useChatStore((state) => state.unreadNotifications);
  const setUnreadCount = useChatStore((state) => state.setUnreadNotifications);

  // --- Audio Helper ---
  const playNotificationSound = useCallback(() => {
    try {
      const audio = new Audio("/sounds/notification.wav");
      audio.play().catch((e) => console.log("Audio play blocked", e));
    } catch (error) {
      console.error("Audio error:", error);
    }
  }, []);

  // --- 1. INITIAL DATA FETCH ---
  useEffect(() => {
    if (status === "authenticated") {
      const fetchNotifications = async () => {
        try {
          // 🚨 FIX: Type the exact shape of your backend response
          const res = await apiRequest<{
            data: { notifications: NotificationItem[]; unreadCount: number };
          }>({
            url: "/notifications",
            method: "GET",
          });

          // 🚨 FIX: Correctly access the nested 'notifications' array and 'unreadCount'
          if (res.data && res.data.notifications) {
            setNotifications(res.data.notifications);
            setUnreadCount(res.data.unreadCount);
          }
        } catch (error) {
          console.error("Failed to fetch notifications:", error);
        }
      };
      fetchNotifications();
    }
  }, [status, setUnreadCount]);

  // --- 2. WEBSOCKET REAL-TIME LISTENER ---
  useEffect(() => {
    if (!socket) return;

    const handleNotification = (payload: any) => {
      console.log("🔔 Received Notification:", payload);

      // 🚨 FIX: Unwrap the backend data structure properly
      const notif = payload.data || payload;
      const type = notif.type || "SYSTEM";

      // Prevent duplicate sounds for old delayed payloads
      const notifTime = notif.createdAt
        ? new Date(notif.createdAt).getTime()
        : Date.now();
      const isOldMessage = Date.now() - notifTime > 10000;

      const newItem: NotificationItem = {
        id: notif.id || Date.now().toString(),
        isRead: false,
        createdAt: notif.createdAt || new Date().toISOString(),
        type: type,
        title: notif.title || "Уведомление",
        message: notif.message || notif.body,
        link: notif.link || notif.data?.url,
        data: notif.data || {},
      } as any;

      setNotifications((prev) => [newItem, ...prev]);

      // Note: The unreadCount is automatically incremented inside useChatStore.ts
      // listener we added in the previous step, so we don't need to double-increment here.

      if (!isOldMessage) {
        playNotificationSound();
        toast({
          variant: type === "ALERT" ? "destructive" : "default",
          title: newItem.title,
          description: newItem.message,
          duration: 6000,
          action: newItem.link
            ? {
                label: "Смотреть",
                onClick: () => router.push(newItem.link as string),
              }
            : undefined,
        });
      }
    };

    // 🚨 FIX: Must match backend emitted event name exactly
    socket.on("new_notification", handleNotification);

    return () => {
      socket.off("new_notification", handleNotification);
    };
  }, [socket, toast, router, playNotificationSound]);

  // --- 3. ROBUST MARK READ LOGIC ---
  const markAsRead = async (id: string | number) => {
    // Optimistic UI Update
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id === id && !n.isRead) {
          setUnreadCount(Math.max(0, unreadCount - 1)); // Sync global store
          return { ...n, isRead: true };
        }
        return n;
      }),
    );

    // Persist to Backend
    try {
      await apiRequest({
        url: `/notifications/${id}/read`,
        method: "PUT",
      });
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const markAllAsRead = async () => {
    // Optimistic UI Update
    setUnreadCount(0); // Sync global store
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

    // Persist to Backend
    try {
      await apiRequest({
        url: "/notifications/read-all",
        method: "PUT",
      });
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAllAsRead,
        markAsRead,
        socket,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider",
    );
  }
  return context;
};
