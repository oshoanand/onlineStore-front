"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, MessageSquare, Search } from "lucide-react";
import { useChatStore } from "@/store/useChatStore";
import ChatListScreen from "@/components/chat/ChatListScreen";
import ChatDetailScreen from "@/components/chat/ChatDetailScreen";
import { clsx } from "clsx";

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // State to manage the currently selected chat in the split-pane
  const [selectedChat, setSelectedChat] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // 🚨 FIX 1: Removed connectSocket! The SocketProvider handles this globally now.
  const setActiveChat = useChatStore((state) => state.setActiveChat);
  const isSocketConnected = useChatStore((state) => state.isSocketConnected);

  const userId = session?.user?.id;

  // 🚨 FIX 2: Initialization Effect (Strictly depends ONLY on auth status & userId)
  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }

    if (userId) {
      setIsReady(true);
    }
  }, [status, userId, router]);

  // 🚨 FIX 3: Active Chat Effect (Strictly synchronized with global socket state)
  useEffect(() => {
    if (isReady && isSocketConnected) {
      setActiveChat(selectedChat?.id || null);
    }

    // Cleanup: Remove active chat focus when the user leaves the page entirely
    return () => setActiveChat(null);
  }, [selectedChat, setActiveChat, isReady, isSocketConnected]);

  if (!isReady || status === "loading") {
    return (
      <div className="flex flex-col h-screen pt-16 items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary w-10 h-10 mb-4" />
        <p className="text-muted-foreground font-medium">Загрузка чатов...</p>
      </div>
    );
  }

  return (
    // DESIGN FIX: Added pt-[4rem] (mobile) and sm:pt-[6rem] (desktop) to clear the fixed ClientHeader
    // Wrapped in a subtle muted background on desktop to make the chat card "pop"
    <div className="flex h-[calc(100dvh-64px)] py-2  w-full bg-white  justify-center">
      {/* The main chat container */}
      <div className="flex w-full max-w-6xl h-full bg-white sm:rounded-2xl sm:border sm:border-slate-200/90 overflow-hidden ">
        {/* LEFT PANE: Chat List */}
        <div
          className={clsx(
            "w-full md:w-[350px] lg:w-[400px] flex-shrink-0 border-r sm:border-slate-200/90 flex flex-col",
            selectedChat ? "hidden md:flex" : "flex",
          )}
        >
          <div className="p-4 border-b z-10 shrink-0 border-slate-200/90 shadow-sm">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Поиск..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-muted/40 hover:bg-muted/60 focus:bg-background rounded-xl py-2 pl-9 pr-4 text-sm outline-none  focus:border-orange-500 transition-all border border-border/50"
              />
            </div>
          </div>
          {/* Because the Backend injects the Admin and online users, ChatListScreen renders natively */}
          <ChatListScreen
            selectedChatId={selectedChat?.id}
            onSelectChat={(id, name) => setSelectedChat({ id, name })}
          />
        </div>

        {/* RIGHT PANE: Chat Detail */}
        <div
          className={clsx(
            "flex-1 flex flex-col bg-background/50 relative",
            !selectedChat ? "hidden md:flex" : "flex",
          )}
        >
          {selectedChat ? (
            <ChatDetailScreen
              partnerId={selectedChat.id}
              partnerName={selectedChat.name}
              onBack={() => setSelectedChat(null)}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground opacity-60 bg-slate-50/50 dark:bg-black/20">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6 shadow-inner">
                <MessageSquare className="w-10 h-10 opacity-50" />
              </div>
              <p className="text-xl font-bold text-foreground">Выберите чат</p>
              <p className="text-sm mt-1">чтобы начать общение</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
