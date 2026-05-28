"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  ShoppingCart,
  User,
  MessageCircle,
  X,
  Package,
  RotateCcw,
  HelpCircle,
  LogOut,
  Edit3,
  LogIn,
  UserPlus,
  Upload,
  Loader2,
} from "lucide-react";

// Global stores
import { useCartStore } from "@/store/useCartStore";
import { useAppStore } from "@/store/useAppStore";
import { useToast } from "@/hooks/useToast";
import { useCreateSupportTicket } from "@/services/support";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();

  // --- UI STATES ---
  const [isMounted, setIsMounted] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // --- SUPPORT SHEET STATES ---
  const [showSupportSheet, setShowSupportSheet] = useState(false);
  const [supportType, setSupportType] = useState("BUG");
  const [problemDescription, setProblemDescription] = useState("");
  const [problemImage, setProblemImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const supportFileRef = useRef<HTMLInputElement>(null);

  const { mutateAsync: submitTicket, isPending: isSubmittingTicket } =
    useCreateSupportTicket();

  // Connect to Zustand stores
  const cartItems = useCartStore((state) => state.items);
  const unreadChatMessages = useAppStore((state) => state.unreadChatMessages);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Prevent background scrolling when either drawer or sheet is open
  useEffect(() => {
    if (isDrawerOpen || showSupportSheet) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isDrawerOpen, showSupportSheet]);

  // Handle Image Preview for Support Ticket
  useEffect(() => {
    if (!problemImage) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(problemImage);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [problemImage]);

  // --- NAVIGATION LOGIC ---
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const tabs = [
    { id: "/", label: "Главная", icon: Home, badge: 0 },
    { id: "/category", label: "Каталог", icon: Package, badge: 0 },
    { id: "/cart", label: "Корзина", icon: ShoppingCart, badge: cartCount },
  ];

  if (status === "authenticated") {
    tabs.push({
      id: "/chat",
      label: "Чат",
      icon: MessageCircle,
      badge: unreadChatMessages,
    });
  }

  // Profile Action triggers the Drawer
  tabs.push({ id: "profile_action", label: "Профиль", icon: User, badge: 0 });

  if (pathname.startsWith("/checkout")) return null;

  const handleTabClick = (tabId: string) => {
    if (tabId === "profile_action") {
      setIsDrawerOpen(true);
    } else {
      setIsDrawerOpen(false);
      router.push(tabId);
    }
  };

  const handleNavigation = (path: string) => {
    setIsDrawerOpen(false);
    setTimeout(() => {
      router.push(path);
    }, 200);
  };

  // --- SUPPORT LOGIC ---
  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setProblemImage(null);
    if (supportFileRef.current) supportFileRef.current.value = "";
  };

  const handleSubmitSupport = async () => {
    if (!problemDescription.trim()) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, опишите проблему.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Safely grab the user's mobile number, or mark as Guest if unauthenticated
      const rawMobile = session?.user?.mobile || "Гость";

      // Execute the real API call
      await submitTicket({
        mobile: rawMobile,
        supportType: supportType,
        description: problemDescription,
        attachment: problemImage,
      });

      // Clear form and close sheet on success
      setShowSupportSheet(false);
      setProblemDescription("");
      setProblemImage(null);
      setSupportType("BUG");

      toast({
        variant: "success",
        title: "Отправлено",
        description: "Ваше сообщение успешно отправлено в службу поддержки.",
      });
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error?.message || "Не удалось отправить запрос.",
        variant: "destructive",
      });
    }
  };
  const user = session?.user as any;

  return (
    <>
      {/* ================= 1. BOTTOM NAVIGATION BAR ================= */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 h-[75px] pb-safe z-40 px-2 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-full max-w-lg mx-auto">
          {tabs.map((tab) => {
            const isSelected =
              pathname === tab.id ||
              (tab.id !== "/" &&
                tab.id !== "profile_action" &&
                pathname.startsWith(tab.id));

            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className="flex flex-col items-center justify-center w-full relative group transition-transform active:scale-95"
              >
                <div
                  className={clsx(
                    "w-14 h-8 rounded-full flex items-center justify-center transition-all duration-300 mb-1 relative",
                    isSelected
                      ? "bg-[#005BFF] shadow-md scale-105"
                      : "bg-transparent group-hover:bg-slate-100 dark:group-hover:bg-slate-800",
                  )}
                >
                  <tab.icon
                    className={clsx(
                      "w-5 h-5 transition-colors",
                      isSelected ? "text-white" : "text-slate-500",
                    )}
                  />
                  {isMounted && tab.badge > 0 && (
                    <span className="absolute -top-1.5 -right-1 flex h-4.5 w-4.5 min-w-[18px] items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white shadow-sm">
                      {tab.badge > 99 ? "99+" : tab.badge}
                    </span>
                  )}
                </div>
                <span
                  className={clsx(
                    "text-[10px] tracking-tight transition-colors",
                    isSelected
                      ? "text-[#005BFF] font-bold"
                      : "text-slate-500 font-medium",
                  )}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= 2. PROFILE SIDEBAR DRAWER ================= */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 z-[55] backdrop-blur-sm touch-none md:hidden"
              onClick={() => setIsDrawerOpen(false)}
            />

            {/* Left-to-Right Sliding Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[85vw] max-w-sm bg-white dark:bg-slate-950 z-[60] shadow-2xl flex flex-col h-[100dvh] md:hidden"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.1}
              onDragEnd={(e, { offset, velocity }) => {
                if (offset.x < -100 || velocity.x < -20) {
                  setIsDrawerOpen(false);
                }
              }}
            >
              {/* Drawer Header */}
              <div className="px-6 py-4 flex justify-between items-center border-b border-slate-100 dark:border-slate-800 mt-safe">
                <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                  Меню
                </h2>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors"
                >
                  <X className="h-5 w-5" strokeWidth={2.5} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col">
                {/* --- HEADER: Logged In vs Logged Out --- */}
                {user ? (
                  <div
                    onClick={() => handleNavigation("/profile/edit")}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 active:scale-95 transition-all mb-6 cursor-pointer"
                  >
                    <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0 bg-blue-50 flex items-center justify-center text-[#005BFF]">
                      {user.image ? (
                        <Image
                          src={user.image}
                          alt="Profile"
                          width={56}
                          height={56}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <span className="text-xl font-bold">
                          {user.name?.charAt(0).toUpperCase() || "U"}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                        {user.name || "Пользователь"}
                      </h3>
                      <p className="text-sm text-slate-500 truncate">
                        {user.mobile || user.email}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 mb-6 text-center">
                    <div className="w-16 h-16 bg-[#005BFF]/10 rounded-full flex items-center justify-center mb-3">
                      <User className="h-8 w-8 text-[#005BFF]" />
                    </div>
                    <p className="text-sm font-medium text-slate-500 mt-1">
                      Войдите, чтобы использовать все функции платформы.
                    </p>
                  </div>
                )}

                {/* --- MENU LIST --- */}
                <div className="space-y-1">
                  {user ? (
                    <>
                      <MenuItem
                        icon={<Edit3 className="text-blue-500" />}
                        title="Редактировать профиль"
                        subtitle="Настройки и личные данные"
                        onClick={() => handleNavigation("/profile/edit")}
                      />
                      <MenuItem
                        icon={<Package className="text-emerald-500" />}
                        title="Мои заказы"
                        subtitle="Отслеживание статуса"
                        onClick={() => handleNavigation("/profile/orders")}
                      />
                      <MenuItem
                        icon={<RotateCcw className="text-purple-500" />}
                        title="Мои возвраты"
                        subtitle="Оформление и статус"
                        onClick={() => handleNavigation("/profile/returns")}
                      />
                      <div className="h-px bg-slate-100 dark:bg-slate-800 my-2 mx-4" />
                    </>
                  ) : (
                    <>
                      <MenuItem
                        icon={<LogIn className="text-blue-500" />}
                        title="Войти"
                        subtitle="Уже есть аккаунт"
                        onClick={() => handleNavigation("/login")}
                      />
                      <MenuItem
                        icon={<UserPlus className="text-emerald-500" />}
                        title="Регистрация"
                        subtitle="Создать новый аккаунт"
                        onClick={() => handleNavigation("/register")}
                      />
                      <div className="h-px bg-slate-100 dark:bg-slate-800 my-2 mx-4" />
                    </>
                  )}

                  {/* Public Links */}
                  <MenuItem
                    icon={<HelpCircle className="text-orange-500" />}
                    title="Служба поддержки"
                    subtitle="Помощь и ответы на вопросы"
                    onClick={() => setShowSupportSheet(true)}
                  />

                  {user && (
                    <>
                      <div className="h-px bg-slate-100 dark:bg-slate-800 my-2 mx-4" />
                      <MenuItem
                        icon={<LogOut className="text-red-500" />}
                        title="Выйти из аккаунта"
                        subtitle="Завершить сеанс"
                        isDestructive
                        onClick={() => {
                          setIsDrawerOpen(false);
                          signOut({ callbackUrl: "/login" });
                        }}
                      />
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ================= 3. SUPPORT BOTTOM SHEET ================= */}
      <AnimatePresence>
        {showSupportSheet && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-[70] backdrop-blur-sm touch-none md:hidden"
              onClick={() => !isSubmittingTicket && setShowSupportSheet(false)}
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-950 z-[80] rounded-t-[32px] p-6 max-h-[90vh] overflow-y-auto pb-[calc(1.5rem+env(safe-area-inset-bottom))] md:hidden shadow-2xl border-t border-slate-100 dark:border-slate-800"
              drag={!isSubmittingTicket ? "y" : false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.2}
              onDragEnd={(e, { offset, velocity }) => {
                if (offset.y > 100 || velocity.y > 20) {
                  setShowSupportSheet(false);
                }
              }}
            >
              {/* Sheet Handle */}
              <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-6" />

              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                  Служба поддержки
                </h2>
                <button
                  disabled={isSubmittingTicket}
                  onClick={() => setShowSupportSheet(false)}
                  className="rounded-full bg-slate-100 dark:bg-slate-800 h-8 w-8 flex items-center justify-center text-slate-500 transition-colors"
                >
                  <X className="w-5 h-5" strokeWidth={2.5} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-6 bg-slate-50 dark:bg-slate-900 p-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
                {["BUG", "FEATURE", "OTHER"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSupportType(type)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                      supportType === type
                        ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                        : "text-slate-500"
                    }`}
                  >
                    {type === "BUG"
                      ? "ОШИБКА"
                      : type === "FEATURE"
                        ? "ИДЕЯ"
                        : "ДРУГОЕ"}
                  </button>
                ))}
              </div>

              {/* Textarea */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-400 mb-2 tracking-wider">
                  ОПИСАНИЕ ПРОБЛЕМЫ
                </label>
                <textarea
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  placeholder="Подробно опишите, что случилось..."
                  className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 min-h-[120px] outline-none focus:border-[#005BFF] focus:ring-1 focus:ring-[#005BFF] transition-colors resize-none text-[15px] text-slate-900 dark:text-white"
                />
              </div>

              {/* Upload & Preview */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-400 mb-2 tracking-wider">
                  СКРИНШОТ (НЕОБЯЗАТЕЛЬНО)
                </label>

                {problemImage && previewUrl ? (
                  <div className="relative border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden h-40 bg-slate-50 dark:bg-slate-900">
                    <img
                      src={previewUrl}
                      alt="Превью"
                      className="w-full h-full object-contain"
                    />
                    <button
                      type="button"
                      disabled={isSubmittingTicket}
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-black/60 text-white p-2 rounded-full backdrop-blur-md"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => supportFileRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl h-40 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors text-slate-400"
                  >
                    <Upload className="w-8 h-8 mb-2 opacity-70" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Нажмите, чтобы загрузить
                    </span>
                    <span className="text-xs mt-1">JPEG, PNG или WEBP</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  ref={supportFileRef}
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setProblemImage(e.target.files[0]);
                    }
                  }}
                />
              </div>

              <button
                onClick={handleSubmitSupport}
                disabled={isSubmittingTicket}
                className="w-full py-4.5 bg-[#005BFF] text-white font-bold rounded-xl text-[15px] shadow-md active:scale-95 transition-all flex justify-center items-center"
              >
                {isSubmittingTicket ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />{" "}
                    Отправка...
                  </>
                ) : (
                  "Отправить запрос"
                )}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// --- Menu Item Helper Component ---
function MenuItem({
  icon,
  title,
  subtitle,
  isDestructive = false,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  isDestructive?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group touch-manipulation active:scale-[0.98]"
    >
      <div
        className={`p-3 rounded-xl mr-4 flex items-center justify-center transition-colors ${
          isDestructive
            ? "bg-red-50 dark:bg-red-900/10 group-hover:bg-red-100"
            : "bg-slate-50 dark:bg-slate-800 group-hover:bg-white dark:group-hover:bg-slate-700 shadow-sm"
        }`}
      >
        <div className="[&>svg]:h-[22px] [&>svg]:w-[22px]">{icon}</div>
      </div>
      <div className="flex-1 min-w-0">
        <h4
          className={`font-bold text-[15px] truncate ${
            isDestructive ? "text-[#F33939]" : "text-slate-900 dark:text-white"
          }`}
        >
          {title}
        </h4>
        <p className="text-[13px] text-slate-500 truncate mt-0.5">{subtitle}</p>
      </div>
    </button>
  );
}
