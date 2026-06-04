// "use client";
// import { useEffect, useRef, useMemo, useState } from "react";
// import { useSession } from "next-auth/react";
// import { useQueryClient } from "@tanstack/react-query";
// import imageCompression from "browser-image-compression";
// import { useInView } from "react-intersection-observer";
// import { Loader2, Paperclip, Send, X } from "lucide-react";
// import { format } from "date-fns";
// import { ru } from "date-fns/locale";

// import { useChatStore } from "@/store/useChatStore";
// import { useChatHistory, ChatMessage } from "@/hooks/useChatHistory";
// import { useChatSocketSync } from "@/hooks/useChatSocketSync";
// import { apiRequest } from "@/services/http/api-client";

// import {
//   ChatHeader,
//   ChatBubble,
//   ChatContextMenu,
// } from "@/components/chat/ChatUIComponents";

// export default function ChatDetailScreen({
//   partnerId,
//   partnerName,
//   onBack,
// }: {
//   partnerId: string;
//   partnerName: string;
//   onBack: () => void;
// }) {
//   const { data: session } = useSession();
//   const userId = session?.user?.id || "";
//   const queryClient = useQueryClient();

//   const socket = useChatStore((state) => state.socket);
//   const isSocketConnected = useChatStore((state) => state.isSocketConnected); // 🚨 Input Guard
//   const refreshTrigger = useChatStore((state) => state.refreshTrigger); // 🚨 Cache Sync
//   const typingUser = useChatStore((state) => state.typingUser);
//   const onlineUsers = useChatStore((state) => state.onlineUsers);
//   const lastSeenMap = useChatStore((state) => state.lastSeenMap);
//   const syncUnreadCount = useChatStore((state) => state.syncUnreadCount);

//   const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
//   const [isUploading, setIsUploading] = useState(false);
//   const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(
//     null,
//   );
//   const [menuPosition, setMenuPosition] = useState<{
//     x: number;
//     y: number;
//   } | null>(null);

//   const scrollContainerRef = useRef<HTMLDivElement>(null);
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const inputRef = useRef<HTMLInputElement>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
//     useChatHistory(userId, partnerId);

//   // 🚨 FIX: Safe extraction regardless of React Query v5 array formats
//   const allMessages = useMemo(() => {
//     if (!data?.pages) return [];
//     const rawMessages = data.pages.flatMap(
//       (page: any) => page?.messages || page || [],
//     );
//     return rawMessages.sort(
//       (a: any, b: any) =>
//         new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
//     );
//   }, [data]);

//   const { ref: topSentinel, inView } = useInView({ threshold: 0 });

//   useChatSocketSync(socket, userId, partnerId);

//   // 🚨 FIX: Clear Optimistic UI spinners by syncing React Query to Backend state
//   useEffect(() => {
//     if (refreshTrigger > 0) {
//       queryClient.invalidateQueries({ queryKey: ["chatHistory", partnerId] });
//     }
//   }, [refreshTrigger, queryClient, partnerId]);

//   useEffect(() => {
//     if (inView && hasNextPage && !isFetchingNextPage) fetchNextPage();
//   }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

//   const scrollToBottom = () => {
//     if (messagesEndRef.current) {
//       window.requestAnimationFrame(() => {
//         messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//       });
//     }
//   };

//   useEffect(() => {
//     if (allMessages.length > 0 && !isFetchingNextPage) scrollToBottom();
//   }, [allMessages.length, isFetchingNextPage]);

//   useEffect(() => {
//     if (isSocketConnected && socket && userId && partnerId) {
//       socket.emit("mark_messages_read", { senderId: partnerId });
//       syncUnreadCount();
//     }
//   }, [isSocketConnected, socket, userId, partnerId, syncUnreadCount]);

//   const groupedMessages = useMemo(() => {
//     const groups: { type: "date" | "message"; value: any; id: string }[] = [];
//     allMessages.forEach((msg, index) => {
//       const currentDate = new Date(msg.createdAt).toDateString();
//       const prevDate =
//         index > 0
//           ? new Date(allMessages[index - 1].createdAt).toDateString()
//           : null;
//       if (currentDate !== prevDate) {
//         groups.push({
//           type: "date",
//           value: msg.createdAt,
//           id: `date-${msg.createdAt}`,
//         });
//       }
//       groups.push({ type: "message", value: msg, id: msg.id });
//     });
//     return groups;
//   }, [allMessages]);

//   const formatDateHeader = (dateString: string) => {
//     const date = new Date(dateString);
//     const today = new Date().toDateString();
//     const yesterday = new Date(Date.now() - 86400000).toDateString();
//     if (date.toDateString() === today) return "Сегодня";
//     if (date.toDateString() === yesterday) return "Вчера";
//     return format(date, "d MMMM", { locale: ru });
//   };

//   const injectOptimisticMessage = (msg: ChatMessage) => {
//     queryClient.setQueryData(["chatHistory", partnerId], (oldData: any) => {
//       if (!oldData || !oldData.pages)
//         return { pages: [[msg]], pageParams: [null] };
//       const newPages = JSON.parse(JSON.stringify(oldData.pages));
//       const firstPage = newPages[0];

//       if (firstPage.messages !== undefined) firstPage.messages.push(msg);
//       else firstPage.push(msg);

//       return { ...oldData, pages: newPages };
//     });
//     scrollToBottom();
//   };

//   const handleSendText = (e: React.FormEvent) => {
//     e.preventDefault();
//     const text = inputRef.current?.value.trim();
//     if (!text || !isSocketConnected || !socket) return; // Guard

//     const tempId = `temp-${Date.now()}`;
//     injectOptimisticMessage({
//       id: tempId,
//       tempId,
//       senderId: userId,
//       text,
//       createdAt: new Date().toISOString(),
//       isRead: false,
//       isOptimistic: true,
//       replyTo: replyingTo
//         ? {
//             id: replyingTo.id,
//             text: replyingTo.text || "Фото",
//             senderId: replyingTo.senderId,
//           }
//         : undefined,
//     });

//     socket.emit("send_message", {
//       receiverId: partnerId,
//       text,
//       tempId,
//       replyToId: replyingTo?.id,
//     });
//     inputRef.current!.value = "";
//     setReplyingTo(null);
//     socket.emit("stop_typing", { receiverId: partnerId });
//   };

//   const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file || !isSocketConnected || !socket) return; // Guard
//     if (fileInputRef.current) fileInputRef.current.value = "";

//     try {
//       setIsUploading(true);
//       const compressedFile = await imageCompression(file, {
//         maxSizeMB: 1,
//         maxWidthOrHeight: 1080,
//       });
//       const tempId = `img-temp-${Date.now()}`;

//       injectOptimisticMessage({
//         id: tempId,
//         tempId,
//         senderId: userId,
//         imageUrl: URL.createObjectURL(compressedFile),
//         createdAt: new Date().toISOString(),
//         isRead: false,
//         isOptimistic: true,
//         replyTo: replyingTo
//           ? {
//               id: replyingTo.id,
//               text: replyingTo.text || "Фото",
//               senderId: replyingTo.senderId,
//             }
//           : undefined,
//       });

//       const formData = new FormData();
//       formData.append("attachment", compressedFile); // 🚨 FIX: Match Notification Service property

//       const data = await apiRequest<{ url: string }>({
//         method: "POST",
//         url: "/notifications/chat/upload", // 🚨 FIX: Standardized routing
//         data: formData,
//       });

//       socket.emit("send_message", {
//         receiverId: partnerId,
//         imageUrl: data.url,
//         tempId,
//         replyToId: replyingTo?.id,
//       });
//       setReplyingTo(null);
//     } catch (error) {
//       console.error("Upload failed:", error);
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const handleDeleteMessage = (messageId: string) => {
//     if (!isSocketConnected || !socket) return;
//     socket.emit("delete_message", { messageId, partnerId });
//   };

//   return (
//     <>
//       <ChatHeader
//         partnerName={partnerName}
//         partnerId={partnerId}
//         isOnline={onlineUsers[partnerId] === true} // 🚨 Strict record check
//         lastSeen={lastSeenMap[partnerId]}
//         typingUser={typingUser}
//         onBack={onBack}
//       />

//       <main
//         ref={scrollContainerRef}
//         className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
//       >
//         <div ref={topSentinel} className="h-4 flex justify-center">
//           {isFetchingNextPage && (
//             <Loader2 className="animate-spin text-primary" />
//           )}
//         </div>

//         {groupedMessages.map((item) => {
//           if (item.type === "date") {
//             return (
//               <div key={item.id} className="flex justify-center my-4">
//                 <span className="bg-background border border-border/50 text-muted-foreground text-[11px] px-3 py-1 rounded-lg font-bold shadow-sm">
//                   {formatDateHeader(item.value)}
//                 </span>
//               </div>
//             );
//           }
//           const msg = item.value as ChatMessage;
//           return (
//             <ChatBubble
//               key={item.id}
//               msg={msg}
//               isMine={msg.senderId === userId}
//               onSwipe={(swipedMsg) => {
//                 if ("vibrate" in navigator) navigator.vibrate(30);
//                 setReplyingTo(swipedMsg);
//               }}
//               onLongPress={(pos, longPressedMsg) => {
//                 setMenuPosition(pos);
//                 setSelectedMessage(longPressedMsg);
//               }}
//             />
//           );
//         })}
//         <div ref={messagesEndRef} className="h-2" />
//       </main>

//       {selectedMessage && menuPosition && (
//         <ChatContextMenu
//           position={menuPosition}
//           message={selectedMessage}
//           isMine={selectedMessage.senderId === userId}
//           onClose={() => {
//             setSelectedMessage(null);
//             setMenuPosition(null);
//           }}
//           onReply={() => setReplyingTo(selectedMessage)}
//           onDelete={() => handleDeleteMessage(selectedMessage.id)}
//         />
//       )}

//       <footer className="p-3 bg-card border-t shrink-0 flex flex-col pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:pb-3 rounded-br-2xl">
//         {replyingTo && (
//           <div className="mb-2 p-2 bg-muted/50 rounded-lg border-l-4 border-primary flex items-center justify-between">
//             <div className="flex-1 min-w-0 pr-2 pl-2">
//               <span className="text-xs font-bold text-primary block">
//                 {replyingTo.senderId === userId ? "Вы" : partnerName}
//               </span>
//               <span className="text-xs text-muted-foreground truncate block font-medium">
//                 {replyingTo.text || "📷 Фотография"}
//               </span>
//             </div>
//             <button
//               onClick={() => setReplyingTo(null)}
//               className="p-1.5 hover:bg-muted rounded-full text-muted-foreground"
//             >
//               <X className="w-3.5 h-3.5" />
//             </button>
//           </div>
//         )}

//         <form
//           onSubmit={handleSendText}
//           className="flex gap-2 items-center relative"
//         >
//           <input
//             type="file"
//             accept="image/*"
//             ref={fileInputRef}
//             onChange={handleImageSelect}
//             className="hidden"
//           />
//           <button
//             type="button"
//             onClick={() => fileInputRef.current?.click()}
//             disabled={isUploading || !isSocketConnected}
//             className="p-2.5 text-muted-foreground hover:bg-muted/80 rounded-full transition-colors disabled:opacity-50"
//           >
//             {isUploading ? (
//               <Loader2 className="w-6 h-6 animate-spin text-primary" />
//             ) : (
//               <Paperclip className="w-5 h-5" />
//             )}
//           </button>
//           <input
//             ref={inputRef}
//             disabled={!isSocketConnected}
//             className="flex-1 bg-background hover:bg-muted/30 focus:bg-background rounded-full px-5 py-3 text-[15px] outline-none focus:ring-2 focus:ring-primary/50 transition-all border border-border/50 shadow-sm disabled:opacity-50"
//             placeholder={isSocketConnected ? "Сообщение..." : "Подключение..."}
//             onChange={() => socket?.emit("typing", { receiverId: partnerId })}
//           />
//           <button
//             type="submit"
//             disabled={isUploading || !isSocketConnected}
//             className="bg-primary hover:bg-primary/90 text-primary-foreground p-3 rounded-full shadow-md active:scale-95 transition-all flex items-center justify-center shrink-0 disabled:opacity-50"
//           >
//             <Send className="w-5 h-5 ml-0.5" />
//           </button>
//         </form>
//       </footer>
//     </>
//   );
// }

"use client";

import { useEffect, useRef, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import imageCompression from "browser-image-compression";
import { useInView } from "react-intersection-observer";
import { Loader2, Paperclip, Send, X, Image as ImageIcon } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { ru } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

import { useChatStore } from "@/store/useChatStore";
import { useChatHistory, ChatMessage } from "@/hooks/useChatHistory";
import { useChatSocketSync } from "@/hooks/useChatSocketSync";
import { apiRequest } from "@/services/http/api-client";

import {
  ChatHeader,
  ChatBubble,
  ChatContextMenu,
} from "@/components/chat/ChatUIComponents";

export default function ChatDetailScreen({
  partnerId,
  partnerName,
  onBack,
}: {
  partnerId: string;
  partnerName: string;
  onBack: () => void;
}) {
  const { data: session } = useSession();
  const userId = session?.user?.id || "";
  const queryClient = useQueryClient();

  // Global Chat State
  const socket = useChatStore((state) => state.socket);
  const isSocketConnected = useChatStore((state) => state.isSocketConnected);
  const refreshTrigger = useChatStore((state) => state.refreshTrigger);
  const typingUser = useChatStore((state) => state.typingUser);
  const onlineUsers = useChatStore((state) => state.onlineUsers);
  const lastSeenMap = useChatStore((state) => state.lastSeenMap);
  const syncUnreadCount = useChatStore((state) => state.syncUnreadCount);

  // Local State
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(
    null,
  );
  const [menuPosition, setMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // Refs
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // React Query: Infinite Scroll History
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useChatHistory(userId, partnerId);

  // Safe extraction for React Query v5 Infinite Data structure
  const allMessages = useMemo(() => {
    if (!data?.pages) return [];
    const rawMessages = data.pages.flatMap(
      (page: any) => page?.messages || page || [],
    );
    return rawMessages.sort(
      (a: any, b: any) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, [data]);

  const { ref: topSentinel, inView } = useInView({ threshold: 0 });

  // Sync incoming real-time socket events with React Query cache
  useChatSocketSync(socket, userId, partnerId);

  // Clear Optimistic UI spinners by syncing React Query to Backend state
  useEffect(() => {
    if (refreshTrigger > 0) {
      queryClient.invalidateQueries({ queryKey: ["chatHistory", partnerId] });
    }
  }, [refreshTrigger, queryClient, partnerId]);

  // Trigger infinite scroll pagination
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Smooth scroll to bottom on new messages
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      window.requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      });
    }
  };

  useEffect(() => {
    if (allMessages.length > 0 && !isFetchingNextPage) scrollToBottom();
  }, [allMessages.length, isFetchingNextPage]);

  // Mark messages as read immediately when opening the chat
  useEffect(() => {
    if (isSocketConnected && socket && userId && partnerId) {
      socket.emit("mark_messages_read", { senderId: partnerId });
      syncUnreadCount();
    }
  }, [isSocketConnected, socket, userId, partnerId, syncUnreadCount]);

  // Group messages by Date for UI headers
  const groupedMessages = useMemo(() => {
    const groups: { type: "date" | "message"; value: any; id: string }[] = [];
    allMessages.forEach((msg, index) => {
      const currentDate = new Date(msg.createdAt).toDateString();
      const prevDate =
        index > 0
          ? new Date(allMessages[index - 1].createdAt).toDateString()
          : null;
      if (currentDate !== prevDate) {
        groups.push({
          type: "date",
          value: msg.createdAt,
          id: `date-${msg.createdAt}`,
        });
      }
      groups.push({ type: "message", value: msg, id: msg.id });
    });
    return groups;
  }, [allMessages]);

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return "Сегодня";
    if (isYesterday(date)) return "Вчера";
    return format(date, "d MMMM", { locale: ru });
  };

  // Inject a temporary message into React Query cache for instant UI feedback
  const injectOptimisticMessage = (msg: ChatMessage) => {
    queryClient.setQueryData(["chatHistory", partnerId], (oldData: any) => {
      if (!oldData || !oldData.pages)
        return { pages: [[msg]], pageParams: [null] };

      const newPages = JSON.parse(JSON.stringify(oldData.pages));
      const firstPage = newPages[0];

      if (firstPage.messages !== undefined) firstPage.messages.push(msg);
      else firstPage.push(msg);

      return { ...oldData, pages: newPages };
    });
    scrollToBottom();
  };

  // Text Submission
  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputRef.current?.value.trim();
    if (!text || !isSocketConnected || !socket) return;

    const tempId = `temp-${Date.now()}`;
    injectOptimisticMessage({
      id: tempId,
      tempId,
      senderId: userId,
      text,
      createdAt: new Date().toISOString(),
      isRead: false,
      isOptimistic: true,
      replyTo: replyingTo
        ? {
            id: replyingTo.id,
            text: replyingTo.text || "Фотография",
            senderId: replyingTo.senderId,
          }
        : undefined,
    });

    socket.emit("send_message", {
      receiverId: partnerId,
      text,
      tempId,
      replyToId: replyingTo?.id,
    });

    inputRef.current!.value = "";
    setReplyingTo(null);
    socket.emit("stop_typing", { receiverId: partnerId });
  };

  // Image Submission with Client-Side Compression
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !isSocketConnected || !socket) return;
    if (fileInputRef.current) fileInputRef.current.value = "";

    try {
      setIsUploading(true);
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1080,
      });
      const tempId = `img-temp-${Date.now()}`;

      injectOptimisticMessage({
        id: tempId,
        tempId,
        senderId: userId,
        imageUrl: URL.createObjectURL(compressedFile),
        createdAt: new Date().toISOString(),
        isRead: false,
        isOptimistic: true,
        replyTo: replyingTo
          ? {
              id: replyingTo.id,
              text: replyingTo.text || "Фотография",
              senderId: replyingTo.senderId,
            }
          : undefined,
      });

      const formData = new FormData();
      formData.append("attachment", compressedFile);

      const data = await apiRequest<{ url: string }>({
        method: "POST",
        url: "/notifications/chat/upload",
        data: formData,
      });

      socket.emit("send_message", {
        receiverId: partnerId,
        imageUrl: data.url,
        tempId,
        replyToId: replyingTo?.id,
      });
      setReplyingTo(null);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    if (!isSocketConnected || !socket) return;
    socket.emit("delete_message", { messageId, partnerId });
  };

  return (
    <div className="flex flex-col h-full bg-brand-surface dark:bg-brand-muted relative w-full overflow-hidden">
      {/* 1. Header */}
      <ChatHeader
        partnerName={partnerName}
        partnerId={partnerId}
        isOnline={onlineUsers[partnerId] === true}
        lastSeen={lastSeenMap[partnerId]}
        typingUser={typingUser}
        onBack={onBack}
      />

      {/* 2. Message History Area */}
      <main
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar bg-slate-50/50 dark:bg-black/10"
      >
        <div ref={topSentinel} className="h-4 flex justify-center">
          {isFetchingNextPage && (
            <Loader2 className="animate-spin text-brand-primary w-5 h-5" />
          )}
        </div>

        {groupedMessages.map((item) => {
          if (item.type === "date") {
            return (
              <div key={item.id} className="flex justify-center my-6">
                <span className="bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/5 backdrop-blur-sm text-slate-500 dark:text-slate-400 text-xs px-4 py-1.5 rounded-full font-bold shadow-sm">
                  {formatDateHeader(item.value)}
                </span>
              </div>
            );
          }
          const msg = item.value as ChatMessage;
          return (
            <ChatBubble
              key={item.id}
              msg={msg}
              isMine={msg.senderId === userId}
              onSwipe={(swipedMsg) => {
                if ("vibrate" in navigator) navigator.vibrate(30);
                setReplyingTo(swipedMsg);
              }}
              onLongPress={(pos, longPressedMsg) => {
                setMenuPosition(pos);
                setSelectedMessage(longPressedMsg);
              }}
            />
          );
        })}
        <div ref={messagesEndRef} className="h-2" />
      </main>

      {/* 3. Context Menu Overlay */}
      {selectedMessage && menuPosition && (
        <ChatContextMenu
          position={menuPosition}
          message={selectedMessage}
          isMine={selectedMessage.senderId === userId}
          onClose={() => {
            setSelectedMessage(null);
            setMenuPosition(null);
          }}
          onReply={() => setReplyingTo(selectedMessage)}
          onDelete={() => handleDeleteMessage(selectedMessage.id)}
        />
      )}

      {/* 4. Input Footer Area */}
      <footer className="shrink-0 flex flex-col pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 px-3 sm:pb-4 sm:px-4 bg-white/90 dark:bg-brand-muted/90 backdrop-blur-md border-t border-slate-200 dark:border-white/5">
        {/* Reply Preview Box */}
        <AnimatePresence>
          {replyingTo && (
            <motion.div
              initial={{ opacity: 0, y: 10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: 10, height: 0 }}
              className="mb-3 overflow-hidden"
            >
              <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-white/5 rounded-xl border-l-4 border-brand-primary shadow-sm">
                <div className="flex-1 min-w-0 px-2 flex items-center gap-3">
                  {replyingTo.imageUrl && (
                    <ImageIcon className="w-5 h-5 text-brand-primary shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-black text-brand-primary block mb-0.5">
                      {replyingTo.senderId === userId ? "Вы" : partnerName}
                    </span>
                    <span className="text-[13px] text-slate-500 dark:text-slate-400 truncate block font-medium">
                      {replyingTo.text || "Фотография"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setReplyingTo(null)}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full text-slate-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Controls */}
        <form
          onSubmit={handleSendText}
          className="flex gap-2.5 items-center relative"
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            ref={fileInputRef}
            onChange={handleImageSelect}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || !isSocketConnected}
            className="p-3 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-full transition-colors disabled:opacity-50"
          >
            {isUploading ? (
              <Loader2 className="w-5 h-5 animate-spin text-brand-primary" />
            ) : (
              <Paperclip className="w-5 h-5" />
            )}
          </button>

          <input
            ref={inputRef}
            disabled={!isSocketConnected}
            className="flex-1 bg-slate-100 dark:bg-black/20 hover:bg-slate-200/50 dark:hover:bg-black/30 focus:bg-white dark:focus:bg-brand-muted rounded-full px-5 py-3.5 text-[15px] font-medium text-foreground outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all border border-transparent focus:border-brand-primary/30 shadow-inner disabled:opacity-50"
            placeholder={
              isSocketConnected ? "Написать сообщение..." : "Подключение..."
            }
            onChange={() => socket?.emit("typing", { receiverId: partnerId })}
          />

          <button
            type="submit"
            disabled={isUploading || !isSocketConnected}
            className="w-12 h-12 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-full shadow-lg shadow-brand-primary/30 active:scale-95 transition-all flex items-center justify-center shrink-0 disabled:opacity-50 disabled:active:scale-100"
          >
            <Send className="w-5 h-5 ml-1" />
          </button>
        </form>
      </footer>
    </div>
  );
}
