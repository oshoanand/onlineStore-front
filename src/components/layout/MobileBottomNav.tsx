"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Search,
  ShoppingCart,
  User,
  MessageCircle,
  X,
  Package,
  RotateCcw,
  HelpCircle,
  LogOut,
  Edit3,
  ChevronRight,
} from "lucide-react";

// Global stores
import { useCartStore } from "@/store/useCartStore";
import { useAppStore } from "@/store/useAppStore"; // Pulling in Chat Notifications

export default function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  // Hydration & UI State
  const [isMounted, setIsMounted] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Connect to Zustand stores
  const cartItems = useCartStore((state) => state.items);
  const unreadChatMessages = useAppStore((state) => state.unreadChatMessages);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Calculate badge counts
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Dynamically build tabs based on auth status
  const tabs = [
    { id: "/", label: "Home", icon: Home, badge: 0 },
    { id: "/category", label: "Catalogue", icon: Package, badge: 0 },
    { id: "/cart", label: "Cart", icon: ShoppingCart, badge: cartCount },
  ];

  // Inject Chat tab only if logged in
  if (status === "authenticated") {
    tabs.push({
      id: "/chat",
      label: "Chat",
      icon: MessageCircle,
      badge: unreadChatMessages,
    });
  }

  // Add Profile as an action tab (doesn't navigate directly, opens drawer)
  tabs.push({ id: "profile_action", label: "Profile", icon: User, badge: 0 });

  // Hide the bottom nav on specific pages like checkout
  if (pathname.startsWith("/checkout")) return null;

  const handleTabClick = (tabId: string) => {
    if (tabId === "profile_action") {
      setIsDrawerOpen(true);
    } else {
      router.push(tabId);
    }
  };

  // Safe extraction of user data
  const firstName = session?.user?.name?.split(" ")[0] || "User";
  const mobileNumber = session?.user?.mobile || "No number provided";

  return (
    <>
      {/* ================= BOTTOM NAVIGATION BAR ================= */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 h-[75px] pb-safe z-40 px-2 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
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
                {/* Icon Container with Native Android "Pill" Animation */}
                <div
                  className={clsx(
                    "w-14 h-8 rounded-full flex items-center justify-center transition-all duration-300 mb-1 relative",
                    isSelected
                      ? "bg-brand-primary shadow-md scale-105"
                      : "bg-transparent group-hover:bg-slate-100",
                  )}
                >
                  <tab.icon
                    className={clsx(
                      "w-5 h-5 transition-colors",
                      isSelected ? "text-white" : "text-slate-500",
                    )}
                  />

                  {/* RED NOTIFICATION BADGE */}
                  {isMounted && tab.badge > 0 && (
                    <span className="absolute -top-1.5 -right-1 flex h-4.5 w-4.5 min-w-[18px] items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white shadow-sm">
                      {tab.badge > 99 ? "99+" : tab.badge}
                    </span>
                  )}
                </div>

                {/* Label */}
                <span
                  className={clsx(
                    "text-[10px] tracking-tight transition-colors",
                    isSelected
                      ? "text-brand-primary font-bold"
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

      {/* ================= PROFILE BOTTOM DRAWER ================= */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 z-[60] md:hidden backdrop-blur-sm"
            />

            {/* Sliding Drawer */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[70] md:hidden flex flex-col max-h-[85vh] shadow-2xl"
            >
              {/* Drawer Handle & Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <div className="w-8" /> {/* Spacer for centering */}
                <div className="w-12 h-1.5 bg-slate-200 rounded-full absolute left-1/2 -translate-x-1/2 top-3" />
                <h3 className="font-bold text-lg text-slate-800 mt-2">
                  Account
                </h3>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 active:scale-95 transition mt-2"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Content (Scrollable) */}
              <div className="overflow-y-auto pb-safe px-5 py-6">
                {status === "authenticated" ? (
                  /* --- AUTHENTICATED STATE --- */
                  <div className="space-y-6">
                    {/* User Profile Card */}
                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center gap-4">
                      {session?.user?.image ? (
                        <Image
                          src={session.user.image}
                          alt="Profile"
                          width={60}
                          height={60}
                          className="rounded-full object-cover border-2 border-white shadow-sm"
                        />
                      ) : (
                        <div className="w-15 h-15 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0">
                          <User size={30} />
                        </div>
                      )}
                      <div className="flex-1 overflow-hidden">
                        <h4 className="font-bold text-lg text-slate-800 truncate">
                          Hi, {firstName}
                        </h4>
                        <p className="text-sm text-slate-500 truncate">
                          {mobileNumber}
                        </p>
                      </div>
                    </div>

                    {/* Navigation Menu */}
                    <div className="space-y-1">
                      <DrawerLink
                        icon={Edit3}
                        label="Edit Profile"
                        onClick={() => {
                          router.push("/profile/edit");
                          setIsDrawerOpen(false);
                        }}
                      />
                      <DrawerLink
                        icon={Package}
                        label="My Orders"
                        onClick={() => {
                          router.push("/orders");
                          setIsDrawerOpen(false);
                        }}
                      />
                      <DrawerLink
                        icon={RotateCcw}
                        label="My Returns"
                        onClick={() => {
                          router.push("/returns");
                          setIsDrawerOpen(false);
                        }}
                      />
                      <DrawerLink
                        icon={HelpCircle}
                        label="Support & Help"
                        onClick={() => {
                          router.push("/support");
                          setIsDrawerOpen(false);
                        }}
                      />
                    </div>

                    <div className="h-px bg-slate-100 my-4" />

                    {/* Logout Button */}
                    <button
                      onClick={() => {
                        setIsDrawerOpen(false);
                        signOut({ callbackUrl: "/login" });
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3.5 text-red-600 font-semibold bg-red-50 hover:bg-red-100 rounded-xl transition-colors active:scale-95"
                    >
                      <LogOut size={18} /> Logout
                    </button>
                  </div>
                ) : (
                  /* --- UNAUTHENTICATED STATE --- */
                  <div className="text-center py-6 space-y-6">
                    <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto text-brand-primary">
                      <User size={40} />
                    </div>
                    <div>
                      <h4 className="font-bold text-xl text-slate-800 mb-2">
                        Welcome!
                      </h4>
                      <p className="text-slate-500 text-sm">
                        Sign in to manage your orders, track returns, and chat
                        with support.
                      </p>
                    </div>

                    <div className="space-y-3 pt-4">
                      <button
                        onClick={() => {
                          setIsDrawerOpen(false);
                          router.push("/login");
                        }}
                        className="w-full bg-brand-primary text-white font-bold py-4 rounded-xl shadow-md hover:bg-brand-secondary active:scale-95 transition-all"
                      >
                        Log In
                      </button>
                      <button
                        onClick={() => {
                          setIsDrawerOpen(false);
                          router.push("/register");
                        }}
                        className="w-full bg-slate-100 text-slate-700 font-bold py-4 rounded-xl hover:bg-slate-200 active:scale-95 transition-all"
                      >
                        Create an Account
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// Reusable component for drawer list items
function DrawerLink({
  icon: Icon,
  label,
  onClick,
}: {
  icon: any;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 rounded-xl transition-colors active:scale-95"
    >
      <div className="flex items-center gap-3 text-slate-700 font-medium">
        <Icon size={20} className="text-slate-400" />
        {label}
      </div>
      <ChevronRight size={18} className="text-slate-300" />
    </button>
  );
}
