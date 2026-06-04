// "use client";

// import { useEffect, useState } from "react";
// import { useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import { Loader2, MessageSquare, Search } from "lucide-react";
// import { useChatStore } from "@/store/useChatStore";
// import ChatListScreen from "@/components/chat/ChatListScreen";
// import ChatDetailScreen from "@/components/chat/ChatDetailScreen";
// import { clsx } from "clsx";

// export default function ChatPage() {
//   const { data: session, status } = useSession();
//   const router = useRouter();
//   const [isReady, setIsReady] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");

//   // State to manage the currently selected chat in the split-pane
//   const [selectedChat, setSelectedChat] = useState<{
//     id: string;
//     name: string;
//   } | null>(null);

//   // 🚨 FIX 1: Removed connectSocket! The SocketProvider handles this globally now.
//   const setActiveChat = useChatStore((state) => state.setActiveChat);
//   const isSocketConnected = useChatStore((state) => state.isSocketConnected);

//   const userId = session?.user?.id;

//   // 🚨 FIX 2: Initialization Effect (Strictly depends ONLY on auth status & userId)
//   useEffect(() => {
//     if (status === "loading") return;

//     if (status === "unauthenticated") {
//       router.replace("/login");
//       return;
//     }

//     if (userId) {
//       setIsReady(true);
//     }
//   }, [status, userId, router]);

//   // 🚨 FIX 3: Active Chat Effect (Strictly synchronized with global socket state)
//   useEffect(() => {
//     if (isReady && isSocketConnected) {
//       setActiveChat(selectedChat?.id || null);
//     }

//     // Cleanup: Remove active chat focus when the user leaves the page entirely
//     return () => setActiveChat(null);
//   }, [selectedChat, setActiveChat, isReady, isSocketConnected]);

//   if (!isReady || status === "loading") {
//     return (
//       <div className="flex flex-col h-screen pt-16 items-center justify-center bg-background">
//         <Loader2 className="animate-spin text-primary w-10 h-10 mb-4" />
//         <p className="text-muted-foreground font-medium">Загрузка чатов...</p>
//       </div>
//     );
//   }

//   return (
//     // DESIGN FIX: Added pt-[4rem] (mobile) and sm:pt-[6rem] (desktop) to clear the fixed ClientHeader
//     // Wrapped in a subtle muted background on desktop to make the chat card "pop"
//     <div className="flex h-[calc(100dvh-64px)] py-2  w-full bg-white  justify-center">
//       {/* The main chat container */}
//       <div className="flex w-full max-w-6xl h-full bg-white sm:rounded-2xl sm:border sm:border-slate-200/90 overflow-hidden ">
//         {/* LEFT PANE: Chat List */}
//         <div
//           className={clsx(
//             "w-full md:w-[350px] lg:w-[400px] flex-shrink-0 border-r sm:border-slate-200/90 flex flex-col",
//             selectedChat ? "hidden md:flex" : "flex",
//           )}
//         >
//           <div className="p-4 border-b z-10 shrink-0 border-slate-200/90 shadow-sm">
//             <div className="relative group">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
//               <input
//                 type="text"
//                 placeholder="Поиск..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="w-full bg-muted/40 hover:bg-muted/60 focus:bg-background rounded-xl py-2 pl-9 pr-4 text-sm outline-none  focus:border-orange-500 transition-all border border-border/50"
//               />
//             </div>
//           </div>
//           {/* Because the Backend injects the Admin and online users, ChatListScreen renders natively */}
//           <ChatListScreen
//             selectedChatId={selectedChat?.id}
//             onSelectChat={(id, name) => setSelectedChat({ id, name })}
//           />
//         </div>

//         {/* RIGHT PANE: Chat Detail */}
//         <div
//           className={clsx(
//             "flex-1 flex flex-col bg-background/50 relative",
//             !selectedChat ? "hidden md:flex" : "flex",
//           )}
//         >
//           {selectedChat ? (
//             <ChatDetailScreen
//               partnerId={selectedChat.id}
//               partnerName={selectedChat.name}
//               onBack={() => setSelectedChat(null)}
//             />
//           ) : (
//             <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground opacity-60 bg-slate-50/50 dark:bg-black/20">
//               <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6 shadow-inner">
//                 <MessageSquare className="w-10 h-10 opacity-50" />
//               </div>
//               <p className="text-xl font-bold text-foreground">Выберите чат</p>
//               <p className="text-sm mt-1">чтобы начать общение</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, MessageSquare, Search } from "lucide-react";
import { clsx } from "clsx";

import { useChatStore } from "@/store/useChatStore";
import ChatListScreen from "@/components/chat/ChatListScreen";
import ChatDetailScreen from "@/components/chat/ChatDetailScreen";

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  // State to manage the currently selected chat in the split-pane
  const [selectedChat, setSelectedChat] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const setActiveChat = useChatStore((state) => state.setActiveChat);
  const isSocketConnected = useChatStore((state) => state.isSocketConnected);

  const userId = session?.user?.id;

  // Initialization Effect (Strictly depends ONLY on auth status & userId)
  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.replace("/auth/login");
      return;
    }

    if (userId) {
      setIsReady(true);
    }
  }, [status, userId, router]);

  // Active Chat Effect (Strictly synchronized with global socket state)
  useEffect(() => {
    if (isReady && isSocketConnected) {
      setActiveChat(selectedChat?.id || null);
    }

    // Cleanup: Remove active chat focus when the user leaves the page entirely
    return () => setActiveChat(null);
  }, [selectedChat, setActiveChat, isReady, isSocketConnected]);

  // Full-screen Loading State
  if (!isReady || status === "loading") {
    return (
      <div className="flex flex-col h-[calc(100dvh-75px)] lg:h-[calc(100vh-80px)] items-center justify-center bg-background">
        <Loader2 className="animate-spin text-brand-primary w-12 h-12 mb-4" />
        <p className="text-slate-500 font-medium">Загрузка сообщений...</p>
      </div>
    );
  }

  return (
    // Outer Wrapper: Light muted background on desktop, edge-to-edge on mobile
    <div className="flex h-[calc(100dvh-75px)] lg:h-[calc(100vh-80px)] w-full bg-slate-50 dark:bg-black/95 lg:p-6 justify-center overflow-hidden relative">
      {/* Main Chat Card 
        Mobile: Full width/height, no borders, no rounded corners.
        Desktop: Max width, soft shadow, rounded-3xl, borders.
      */}
      <div className="flex w-full max-w-6xl h-full bg-brand-surface dark:bg-brand-muted lg:rounded-[32px] lg:shadow-2xl lg:shadow-brand-primary/5 lg:border border-slate-200 dark:border-white/5 overflow-hidden relative">
        {/* ========================================== */}
        {/* LEFT PANE: Chat List                       */}
        {/* ========================================== */}
        <div
          className={clsx(
            "w-full md:w-[380px] lg:w-[420px] flex-shrink-0 border-r border-slate-100 dark:border-white/5 flex flex-col bg-slate-50/50 dark:bg-brand-muted/50 transition-all duration-300",
            selectedChat ? "hidden md:flex" : "flex",
          )}
        >
          {/* List Header */}
          <div className="p-4 lg:p-5 border-b border-slate-100 dark:border-white/5 z-10 shrink-0 bg-brand-surface dark:bg-brand-muted/80 backdrop-blur-md">
            <h1 className="text-2xl font-black text-foreground mb-4 tracking-tight">
              Сообщения
            </h1>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-hidden relative">
            <ChatListScreen
              selectedChatId={selectedChat?.id}
              onSelectChat={(id, name) => setSelectedChat({ id, name })}
            />
          </div>
        </div>

        {/* ========================================== */}
        {/* RIGHT PANE: Chat Detail / Empty State      */}
        {/* ========================================== */}
        <div
          className={clsx(
            "flex-1 flex flex-col bg-brand-surface dark:bg-brand-muted relative transition-all duration-300",
            !selectedChat ? "hidden md:flex" : "flex",
          )}
        >
          {selectedChat ? (
            /* Active Chat View */
            <ChatDetailScreen
              partnerId={selectedChat.id}
              partnerName={selectedChat.name}
              onBack={() => setSelectedChat(null)}
            />
          ) : (
            /* Elegant Empty State (Desktop Only) */
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 bg-slate-50/30 dark:bg-black/10 relative overflow-hidden">
              {/* Decorative background blur */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-brand-primary/5 rounded-full blur-[100px] pointer-events-none" />

              <div className="w-28 h-28 bg-white dark:bg-white/5 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-brand-primary/5 border border-slate-100 dark:border-white/5 relative z-10">
                <MessageSquare
                  className="w-12 h-12 text-brand-primary opacity-80"
                  strokeWidth={1.5}
                />
              </div>
              <h3 className="text-2xl font-black text-foreground relative z-10">
                Ваши диалоги
              </h3>
              <p className="text-[15px] mt-2 max-w-sm text-center relative z-10">
                Выберите чат из списка слева, чтобы задать вопрос продавцу или
                службе поддержки
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
