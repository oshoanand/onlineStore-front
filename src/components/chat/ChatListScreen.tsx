"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  Loader2,
  MessageSquare,
  UserCircle,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useChatStore } from "@/store/useChatStore";
import { format, formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { clsx } from "clsx";
import { apiRequest } from "@/services/http/api-client";

interface ChatSession {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerRole: string;
  partnerImage: string | null;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  lastSeen?: string;
  isAdmin?: boolean;
}

export default function ChatListScreen({
  selectedChatId,
  onSelectChat,
}: {
  selectedChatId?: string;
  onSelectChat: (id: string, name: string) => void;
}) {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const socket = useChatStore((state) => state.socket);
  const refreshTrigger = useChatStore((state) => state.refreshTrigger);
  const onlineUsers = useChatStore((state) => state.onlineUsers);
  const lastSeenMap = useChatStore((state) => state.lastSeenMap);
  const setOnlineStatusBulk = useChatStore(
    (state) => state.setOnlineStatusBulk,
  );
  const decreaseUnreadCount = useChatStore(
    (state) => state.decreaseUnreadCount,
  );

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const hasFetchedInitially = useRef(false);

  const fetchSessions = useCallback(
    async (isSilent = false) => {
      if (!userId) return;
      if (!isSilent) setLoading(true);

      try {
        let data = await apiRequest<ChatSession[]>({
          method: "GET",
          url: "/notifications/chat/sessions",
        });

        // Explicitly remove the current user from the session list to prevent self-chat
        data = data.filter((s) => s.partnerId !== userId);

        // Inject Administrators Safely
        try {
          const res = await apiRequest<any>({
            method: "GET",
            url: "/users/admins/list",
          });

          const admins = Array.isArray(res) ? res : res?.data || [];

          admins.forEach((admin: any) => {
            // Guard: Do not inject the admin if the logged-in user IS that admin
            if (admin.id === userId) return;

            const adminIndex = data.findIndex((s) => s.partnerId === admin.id);
            if (adminIndex !== -1) {
              data[adminIndex].isAdmin = true;
              // Update with fresh API data just in case
              data[adminIndex].partnerName =
                admin.name || admin.fullName || data[adminIndex].partnerName;
              data[adminIndex].partnerImage =
                admin.profilePhoto ||
                admin.image ||
                data[adminIndex].partnerImage;
            } else {
              data.push({
                id: `admin-${admin.id}`,
                partnerId: admin.id,
                partnerName: admin.name || admin.fullName || "Служба поддержки",
                partnerRole: "administrator",
                partnerImage: admin.profilePhoto || admin.image || null,
                lastMessage: "Чем мы можем помочь?",
                lastMessageTime: new Date().toISOString(),
                unreadCount: 0,
                isOnline: false,
                isAdmin: true,
              });
            }
          });
        } catch (e) {
          console.error("Failed to fetch admin:", e);
        }

        // 🚨 BULLETPROOF DEDUPLICATION 🚨
        // This guarantees that even if the backend returns duplicate chat sessions
        // for the same admin, they will be merged into a single UI element.
        const uniqueSessions = new Map<string, ChatSession>();

        data.forEach((s) => {
          if (uniqueSessions.has(s.partnerId)) {
            const existing = uniqueSessions.get(s.partnerId)!;
            // If we have a mock session and a real session, keep the real one but transfer the admin flag
            if (
              existing.id.startsWith("admin-") &&
              !s.id.startsWith("admin-")
            ) {
              s.isAdmin = true;
              uniqueSessions.set(s.partnerId, s);
            }
            // If both are real sessions (backend duplication bug), keep the one with the newest message
            else if (
              !existing.id.startsWith("admin-") &&
              !s.id.startsWith("admin-")
            ) {
              const existingTime = new Date(existing.lastMessageTime).getTime();
              const newTime = new Date(s.lastMessageTime).getTime();
              if (newTime > existingTime) {
                s.isAdmin = existing.isAdmin || s.isAdmin;
                uniqueSessions.set(s.partnerId, s);
              }
            }
          } else {
            uniqueSessions.set(s.partnerId, s);
          }
        });

        // Reassign data to our clean, unique list
        data = Array.from(uniqueSessions.values());

        const currentlyOnline: string[] = [];
        const lastSeenData: Record<string, string> = {};

        data.forEach((s) => {
          // Sync backend presence data with Zustand
          if (s.isOnline) currentlyOnline.push(s.partnerId);
          else if (s.lastSeen) lastSeenData[s.partnerId] = s.lastSeen;
        });

        setOnlineStatusBulk(currentlyOnline, lastSeenData);
        setSessions(data);
      } catch (error) {
        console.error("Error fetching sessions:", error);
      } finally {
        setLoading(false);
      }
    },
    // CRITICAL: onlineUsers is strictly removed from dependencies to prevent infinite loop (429 Error)
    [userId, setOnlineStatusBulk],
  );

  useEffect(() => {
    fetchSessions(hasFetchedInitially.current);
    hasFetchedInitially.current = true;
  }, [fetchSessions, refreshTrigger]);

  useEffect(() => {
    if (!socket || !userId) return;
    const handleSilentRefresh = () => fetchSessions(true);

    socket.on("receive_message", handleSilentRefresh);
    socket.on("read_status_synced", handleSilentRefresh);

    return () => {
      socket.off("receive_message", handleSilentRefresh);
      socket.off("read_status_synced", handleSilentRefresh);
    };
  }, [socket, userId, fetchSessions]);

  // MULTI-TIER SORTING LOGIC: Admins > Online > Offline
  const filteredAndSortedSessions = useMemo(() => {
    let filtered = sessions.filter((s) =>
      s.partnerName?.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return filtered.sort((a, b) => {
      // 1. Admins strictly at the top
      if (a.isAdmin && !b.isAdmin) return -1;
      if (!a.isAdmin && b.isAdmin) return 1;

      // 2. Online users next
      const aIsOnline = onlineUsers[a.partnerId] === true;
      const bIsOnline = onlineUsers[b.partnerId] === true;

      if (aIsOnline && !bIsOnline) return -1;
      if (!aIsOnline && bIsOnline) return 1;

      // 3. Otherwise sort by most recent message
      return (
        new Date(b.lastMessageTime).getTime() -
        new Date(a.lastMessageTime).getTime()
      );
    });
  }, [sessions, searchQuery, onlineUsers]);

  if (loading && sessions.length === 0) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filteredAndSortedSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground pb-20">
            <MessageSquare className="w-10 h-10 opacity-20 mb-3" />
            <p className="text-sm font-medium">Чаты не найдены</p>
          </div>
        ) : (
          <div className="flex flex-col pb-6">
            {filteredAndSortedSessions.map((chat) => (
              <ChatListItem
                key={chat.partnerId}
                chat={chat}
                isSelected={selectedChatId === chat.partnerId}
                isOnline={onlineUsers[chat.partnerId] === true}
                realTimeLastSeen={lastSeenMap[chat.partnerId]}
                onClick={() => {
                  decreaseUnreadCount(chat.unreadCount);
                  setSessions((prev) =>
                    prev.map((s) =>
                      s.partnerId === chat.partnerId
                        ? { ...s, unreadCount: 0 }
                        : s,
                    ),
                  );
                  onSelectChat(chat.partnerId, chat.partnerName);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// --- SUB-COMPONENT: CHAT ITEM ---
function ChatListItem({
  chat,
  isSelected,
  isOnline,
  realTimeLastSeen,
  onClick,
}: {
  chat: ChatSession;
  isSelected: boolean;
  isOnline: boolean;
  realTimeLastSeen?: string;
  onClick: () => void;
}) {
  const lastActive = realTimeLastSeen || chat.lastSeen;
  console.log(chat);

  return (
    <div
      onClick={onClick}
      className={clsx(
        "flex items-center gap-3 p-3 mx-2 mt-1 rounded-xl transition-all cursor-pointer group",
        isSelected
          ? "bg-primary/10 hover:bg-primary/15"
          : "hover:bg-muted active:bg-muted",
      )}
    >
      <div className="relative shrink-0">
        <div
          className={clsx(
            "w-12 h-12 rounded-full overflow-hidden transition-all shadow-sm",
            isOnline
              ? "ring-2 ring-green-500/50"
              : "bg-muted border border-gray-200",
          )}
        >
          {chat.partnerImage ? (
            <img
              src={chat.partnerImage}
              className="w-full h-full object-cover"
              alt={chat.partnerName}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground/50 bg-secondary">
              <UserCircle className="w-8 h-8" />
            </div>
          )}
        </div>
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-background rounded-full" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-0.5">
          <h3 className="font-bold text-[15px] truncate flex items-center gap-1.5">
            <span
              className={clsx(
                isSelected
                  ? "text-primary"
                  : "text-foreground group-hover:text-primary transition-colors",
              )}
            >
              {chat.partnerName}
            </span>
            {chat.isAdmin && (
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            )}
          </h3>
          <span className="text-[10px] text-muted-foreground font-medium shrink-0 ml-2">
            {chat.lastMessageTime
              ? format(new Date(chat.lastMessageTime), "HH:mm")
              : ""}
          </span>
        </div>

        {/* The Online/Offline Last Seen UI block */}
        <div className="flex items-center gap-2 mb-1">
          {isOnline ? (
            <span className="text-[10px] text-green-600 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />{" "}
              В сети
            </span>
          ) : (
            <span className="text-[10px] text-muted-foreground">
              Был(а){" "}
              {lastActive
                ? formatDistanceToNow(new Date(lastActive), {
                    addSuffix: true,
                    locale: ru,
                  })
                : "недавно"}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-3">
          <p
            className={clsx(
              "text-[13px] truncate flex-1 leading-snug",
              chat.unreadCount > 0
                ? "text-foreground font-semibold"
                : "text-muted-foreground",
              chat.isAdmin && chat.unreadCount === 0 && "text-blue-600/70",
            )}
          >
            {chat.lastMessage}
          </p>
          {chat.unreadCount > 0 && (
            <span className="bg-primary text-primary-foreground text-[10px] font-bold h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full shrink-0 shadow-sm animate-in zoom-in">
              {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
