"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { io } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useToast } from "@/hooks/useToast";

export default function RealTimeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const { toast } = useToast();

  const {
    setSocket,
    incrementUnread,
    incrementUnreadChat,
    setOnlineUser,
    setTypingStatus,
  } = useAppStore();

  const pathnameRef = useRef(pathname);
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  const actionsRef = useRef({
    incrementUnread,
    incrementUnreadChat,
    setOnlineUser,
    setTypingStatus,
  });

  useEffect(() => {
    actionsRef.current = {
      incrementUnread,
      incrementUnreadChat,
      setOnlineUser,
      setTypingStatus,
    };
  }, [incrementUnread, incrementUnreadChat, setOnlineUser, setTypingStatus]);

  useEffect(() => {
    if (status !== "authenticated" || !session?.accessToken) return;

    const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "";
    const baseUrl = rawApiUrl.replace(/\/api\/?$/, "");

    const socketInstance = io(baseUrl, {
      path: "/api/notifications/socket.io",
      auth: { token: session.accessToken },
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      console.log("✅ Real-time WS connected to Gateway");
    });

    socketInstance.on("connect_error", (error) => {
      console.error("❌ WS Connection Error:", error.message);
    });

    //  IN-APP NOTIFICATIONS
    socketInstance.on("new_notification", (payload) => {
      // Unwrap the payload sent from backend { type: "NEW_NOTIFICATION", data: { title, message } }
      const newNotif = payload.data || payload;

      actionsRef.current.incrementUnread();

      // Instantly update React Query cache (Corrected structure)
      queryClient.setQueryData(["notifications"], (old: any) => {
        if (!old) return { notifications: [newNotif], unreadCount: 1 };
        return {
          ...old,
          notifications: [newNotif, ...(old.notifications || [])],
          unreadCount: (old.unreadCount || 0) + 1,
        };
      });

      // Show the Toast notification correctly
      toast({
        variant: "success",
        title: newNotif.title,
        description: newNotif.message,
      });
    });

    //  CHAT MESSAGES
    socketInstance.on("receive_message", (message) => {
      queryClient.setQueryData(["chat-history", message.roomId], (old: any) => {
        if (!old) return old;
        // Fix matching structure for chat array
        const messageArray = Array.isArray(old) ? old : old.data || [];
        return { ...old, data: [...messageArray, message] };
      });

      queryClient.invalidateQueries({ queryKey: ["chat-rooms"] });

      if (!pathnameRef.current.startsWith("/chat")) {
        actionsRef.current.incrementUnreadChat();

        toast({
          variant: "default",
          title: "New Message",
          description: message.content
            ? message.content.substring(0, 40) +
              (message.content.length > 40 ? "..." : "")
            : "Sent an attachment 📎",
        });
      }
    });

    socketInstance.on("user_status_change", ({ userId, isOnline }) => {
      actionsRef.current.setOnlineUser(userId, isOnline);
    });

    socketInstance.on("user_typing", ({ roomId, isTyping }) => {
      actionsRef.current.setTypingStatus(roomId, isTyping);
    });

    return () => {
      socketInstance.disconnect();
      setSocket(null);
    };
  }, [status, session, queryClient, setSocket, toast]);

  return <>{children}</>;
}
