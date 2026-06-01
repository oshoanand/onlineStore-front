import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ChatMessage } from "./useChatHistory";

export const useChatSocketSync = (
  socket: any,
  userId: string,
  partnerId: string,
) => {
  const queryClient = useQueryClient();
  const roomId = [userId, partnerId].sort().join("_");

  useEffect(() => {
    if (!socket || !userId) return;

    // ==========================================
    // 1. RECEIVE NEW MESSAGE
    // ==========================================
    const handleReceiveMessage = (incomingMsg: any) => {
      if (incomingMsg.chatSessionId && incomingMsg.roomId !== roomId) {
        // If a direct room ID is sent, compare it.
        // Otherwise simply check if sender matches current partner.
        if (
          incomingMsg.senderId !== partnerId &&
          incomingMsg.receiverId !== partnerId
        )
          return;
      }

      const newMessage: ChatMessage = {
        id: incomingMsg.id,
        chatSessionId: incomingMsg.chatSessionId,
        senderId: incomingMsg.senderId,
        text: incomingMsg.text, // 🚨 FIX: Strict match to Backend Prisma properties
        imageUrl: incomingMsg.imageUrl, // 🚨 FIX: Strict match to Backend Prisma properties
        isRead: incomingMsg.isRead,
        createdAt: incomingMsg.createdAt || new Date().toISOString(),
        tempId: incomingMsg.tempId,
        replyTo: incomingMsg.replyTo,
      };

      queryClient.setQueryData(["chatHistory", partnerId], (oldData: any) => {
        if (!oldData || !oldData.pages) {
          return { pages: [[newMessage]], pageParams: [""] };
        }

        const messageExists = oldData.pages.some((page: ChatMessage[]) =>
          page.some(
            (m) =>
              m.id === newMessage.id ||
              (m.tempId && m.tempId === newMessage.tempId),
          ),
        );
        if (messageExists) return oldData;

        const newPages = JSON.parse(JSON.stringify(oldData.pages));

        if (newPages[0].messages !== undefined) {
          newPages[0].messages.push(newMessage);
        } else {
          newPages[0].push(newMessage);
        }

        return { ...oldData, pages: newPages };
      });

      if (newMessage.senderId === partnerId) {
        socket.emit("mark_messages_read", {
          senderId: partnerId,
        });
      }
    };

    // ==========================================
    // 2. CONFIRM SENT MESSAGE
    // ==========================================
    const handleMessageConfirmed = (confirmData: {
      tempId: string;
      message: any;
    }) => {
      queryClient.setQueryData(["chatHistory", partnerId], (oldData: any) => {
        if (!oldData || !oldData.pages) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => {
            const messageList = page.messages || page;
            const updatedList = messageList.map((m: ChatMessage) => {
              if (m.tempId === confirmData.tempId) {
                if (m.imageUrl && m.imageUrl.startsWith("blob:")) {
                  URL.revokeObjectURL(m.imageUrl);
                }
                return {
                  ...m,
                  id: confirmData.message.id,
                  isOptimistic: false,
                  text: confirmData.message.text || m.text,
                  imageUrl: confirmData.message.imageUrl || m.imageUrl,
                  createdAt: confirmData.message.createdAt || m.createdAt,
                };
              }
              return m;
            });

            if (page.messages) return { ...page, messages: updatedList };
            return updatedList;
          }),
        };
      });
    };

    // ==========================================
    // 3. MESSAGE DELETED
    // ==========================================
    const handleMessageDeleted = ({ messageId }: { messageId: string }) => {
      queryClient.setQueryData(["chatHistory", partnerId], (oldData: any) => {
        if (!oldData || !oldData.pages) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => {
            const messageList = page.messages || page;
            const filtered = messageList.filter(
              (m: ChatMessage) => m.id !== messageId,
            );

            if (page.messages) return { ...page, messages: filtered };
            return filtered;
          }),
        };
      });
    };

    // ==========================================
    // 4. MESSAGES READ
    // ==========================================
    const handleMessagesRead = ({ readerId }: { readerId: string }) => {
      // 🚨 FIX: Ensure we use 'messages_read_by_recipient' to match backend
      if (readerId === partnerId) {
        queryClient.setQueryData(["chatHistory", partnerId], (oldData: any) => {
          if (!oldData || !oldData.pages) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => {
              const messageList = page.messages || page;
              const updated = messageList.map((m: ChatMessage) => ({
                ...m,
                isRead: true,
              }));

              if (page.messages) return { ...page, messages: updated };
              return updated;
            }),
          };
        });
      }
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("message_confirmed", handleMessageConfirmed);
    socket.on("message_deleted", handleMessageDeleted);
    socket.on("messages_read_by_recipient", handleMessagesRead); // 🚨 MATCH BACKEND

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("message_confirmed", handleMessageConfirmed);
      socket.off("message_deleted", handleMessageDeleted);
      socket.off("messages_read_by_recipient", handleMessagesRead);
    };
  }, [partnerId, roomId, socket, userId, queryClient]);
};
