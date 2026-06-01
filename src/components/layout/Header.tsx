"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  User,
  Search,
  LogOut,
  Bell,
  MessageCircle,
  Package,
  RotateCcw,
  ChevronDown,
  MapPin,
  Phone,
  Menu,
  Heart,
  X,
  MessageCircleMore,
} from "lucide-react";
import { useChatStore } from "@/store/useChatStore";
import { useCartStore } from "@/store/useCartStore";
import { MegaMenuContent } from "@/components/mega-menu";

export default function Header() {
  const { data: session, status } = useSession();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);

  const [isMounted, setIsMounted] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const catalogRef = useRef<HTMLDivElement>(null);

  const unreadNotifications = useChatStore(
    (state) => state.unreadNotifications,
  );
  const totalUnreadCount = useChatStore((state) => state.totalUnreadCount);

  // Real-time shopping cart calculation
  const cartItems = useCartStore((state) => state.items);
  const cartItemCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const wishlistItemCount = 0; // Replace with useWishlistStore if applicable

  const firstName = session?.user?.name?.split(" ")[0] || "User";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
      if (
        catalogRef.current &&
        !catalogRef.current.contains(event.target as Node)
      ) {
        setIsCatalogOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Prevent background scrolling when catalog mega menu is open
  useEffect(() => {
    if (isCatalogOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isCatalogOpen]);

  return (
    <header
      className="w-full bg-brand-surface dark:bg-brand-muted border-b border-slate-200 dark:border-white/5 sticky top-0 z-50 transition-colors"
      ref={catalogRef}
    >
      {/* ========================================== */}
      {/* 1. TOP UTILITY BAR (Desktop Only)            */}
      {/* ========================================== */}
      <div className="bg-slate-50 dark:bg-black/20 py-1.5 hidden lg:block border-b border-slate-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center text-xs font-medium text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-6">
            <button className="flex items-center gap-1 hover:text-brand-primary transition-colors">
              <MapPin size={14} /> Москва, МКАД
            </button>
            <Link
              href="/stores"
              className="hover:text-brand-primary transition-colors"
            >
              Наши магазины
            </Link>
            <Link
              href="/delivery"
              className="hover:text-brand-primary transition-colors"
            >
              Доставка и оплата
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="tel:+78005555555"
              className="flex items-center gap-1 font-bold text-foreground hover:text-brand-primary transition-colors"
            >
              <Phone size={14} /> 8 (800) 555-55-55
            </a>
            <Link
              href="/support"
              className="hover:text-brand-primary transition-colors"
            >
              Поддержка 24/7
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* 2. MAIN ACTION BAR                           */}
      {/* ========================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 lg:py-4 flex items-center justify-between gap-4 lg:gap-8 bg-brand-surface dark:bg-brand-muted relative z-50">
        {/* Logo Section */}
        <div className="flex items-center gap-3 lg:gap-0 shrink-0">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-black text-2xl tracking-tight text-foreground group-hover:text-brand-primary transition-colors">
              Online<span className="text-brand-primary">Shop</span>
            </span>
          </Link>
        </div>

        {/* Catalog Control & Search Bar (Desktop) */}
        <div className="hidden lg:flex flex-1 max-w-3xl items-center gap-4">
          <button
            onClick={() => setIsCatalogOpen(!isCatalogOpen)}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
              isCatalogOpen
                ? "bg-foreground text-brand-surface shadow-lg"
                : "bg-brand-primary text-white hover:bg-brand-primary-hover shadow-md shadow-brand-primary/20"
            }`}
          >
            <div className="relative w-5 h-5 flex items-center justify-center">
              <Menu
                size={20}
                className={`absolute transition-all duration-300 ${isCatalogOpen ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"}`}
              />
              <X
                size={20}
                className={`absolute transition-all duration-300 ${isCatalogOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"}`}
              />
            </div>
            Каталог
          </button>

          <div className="flex w-full relative group rounded-xl overflow-hidden">
            <input
              type="text"
              placeholder="Поиск товаров, брендов и категорий..."
              className="w-full pl-5 pr-12 py-3 border-2 border-slate-200 dark:border-white/10 focus:border-brand-primary outline-none bg-slate-50 dark:bg-black/20 dark:focus:border-brand-primary transition-all text-[15px] font-medium text-foreground placeholder:text-slate-400"
            />
            <button className="absolute right-0 top-0 h-full px-5 text-slate-400 hover:text-brand-primary hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
              <Search size={20} />
            </button>
          </div>
        </div>

        {/* Action Navigation Icons */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Wishlist (Desktop Only) */}
          <Link
            href="/wishlist"
            className="hidden lg:flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-brand-primary transition-colors relative group"
          >
            <div className="relative p-1 rounded-xl group-hover:bg-brand-primary/5">
              <Heart size={20} />
              {isMounted && wishlistItemCount > 0 && (
                <span className="absolute top-1 right-1 w-4.5 h-4.5 bg-brand-primary text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-brand-surface dark:border-brand-muted">
                  {wishlistItemCount}
                </span>
              )}
            </div>
            <span className="text-[11px] font-bold tracking-wide">
              Избранное
            </span>
          </Link>

          {/* Cart (Desktop Only) */}
          <Link
            href="/cart"
            className="hidden lg:flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-brand-primary transition-colors relative group"
          >
            <div className="relative p-1 rounded-xl group-hover:bg-brand-primary/5">
              <ShoppingCart size={20} />
              {isMounted && cartItemCount > 0 && (
                <span className="absolute -top-0.5 -right-1 min-w-[18px] h-4.5 px-1 bg-brand-secondary text-brand-muted text-[11px] font-black flex items-center justify-center rounded-full border-2 border-brand-surface dark:border-brand-muted">
                  {cartItemCount}
                </span>
              )}
            </div>
            <span className="text-[11px] font-bold tracking-wide">Корзина</span>
          </Link>

          {/* Chat (Desktop Only - Authenticated) */}
          {status === "authenticated" && (
            <Link
              href="/chat"
              className="hidden lg:flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-brand-primary transition-colors relative group"
            >
              <div className="relative p-1 rounded-xl group-hover:bg-brand-primary/5">
                <MessageCircleMore size={20} />
                <AnimatePresence>
                  {isMounted && totalUnreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute top-1 right-1 w-4.5 h-4.5 bg-brand-primary text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-brand-surface dark:border-brand-muted"
                    >
                      {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <span className="text-[11px] font-bold tracking-wide">Чат</span>
            </Link>
          )}

          {/* Notifications (Desktop AND Mobile - Authenticated) */}
          {status === "authenticated" && (
            <Link
              href="/notifications"
              className="flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-brand-primary transition-colors relative group"
            >
              <div className="relative p-1 rounded-xl group-hover:bg-brand-primary/5">
                <Bell size={20} />
                <AnimatePresence>
                  {isMounted && unreadNotifications > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute top-1 right-1.5 w-4.5 h-4.5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-brand-surface dark:border-brand-muted"
                    >
                      {unreadNotifications > 99 ? "99+" : unreadNotifications}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              {/* Hide text on mobile to save space */}
              <span className="hidden lg:block text-[11px] font-bold tracking-wide">
                Уведомления
              </span>
            </Link>
          )}

          {/* Auth Profile Container (Desktop Only) */}
          <div className="relative hidden lg:block ml-2" ref={profileRef}>
            {status === "authenticated" ? (
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 p-1.5 pr-3 rounded-full border border-slate-200 dark:border-white/10 hover:border-brand-primary transition-all focus:outline-none bg-slate-50 dark:bg-black/20"
              >
                {session?.user?.image ? (
                  <img
                    src={session.user.image}
                    alt="User"
                    className="w-9 h-9 rounded-full object-cover border-2 border-white dark:border-brand-muted shadow-sm"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                    <User size={18} />
                  </div>
                )}
                <span className="text-sm font-bold text-foreground">
                  {firstName}
                </span>
                <ChevronDown size={16} className="text-slate-400" />
              </button>
            ) : (
              <Link
                href="/auth/login"
                className="flex items-center justify-center px-6 py-2.5 text-sm font-bold text-white bg-brand-primary hover:bg-brand-primary-hover rounded-xl transition-all shadow-md shadow-brand-primary/20"
              >
                Войти
              </Link>
            )}

            {/* Profile Dropdown Overlay Content */}
            <AnimatePresence>
              {isProfileOpen && status === "authenticated" && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-3 w-64 bg-brand-surface dark:bg-brand-muted rounded-2xl shadow-xl border border-slate-100 dark:border-white/10 py-2 origin-top-right z-50"
                >
                  <div className="px-5 py-4 border-b border-slate-100 dark:border-white/10 mb-2 bg-slate-50/50 dark:bg-black/10 mx-2 rounded-xl">
                    <p className="text-sm font-bold text-foreground truncate">
                      {session.user.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {session.user.email || session.user.mobile}
                    </p>
                  </div>

                  <Link
                    href="/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-foreground hover:bg-slate-50 dark:hover:bg-white/5 hover:text-brand-primary transition-colors"
                  >
                    <User size={18} className="text-slate-400" /> Личный кабинет
                  </Link>
                  <Link
                    href="/orders"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-foreground hover:bg-slate-50 dark:hover:bg-white/5 hover:text-brand-primary transition-colors"
                  >
                    <Package size={18} className="text-slate-400" /> История
                    заказов
                  </Link>
                  <Link
                    href="/returns"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-foreground hover:bg-slate-50 dark:hover:bg-white/5 hover:text-brand-primary transition-colors"
                  >
                    <RotateCcw size={18} className="text-slate-400" /> Мои
                    возвраты
                  </Link>

                  <div className="h-px bg-slate-100 dark:bg-white/10 my-2 mx-4" />

                  <button
                    onClick={() => signOut({ callbackUrl: "/auth/login" })}
                    className="w-full flex items-center gap-3 px-5 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut size={18} /> Выйти из аккаунта
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* 3. MEGA MENU OVERLAY                         */}
      {/* ========================================== */}
      <AnimatePresence>
        {isCatalogOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCatalogOpen(false)}
              className="fixed inset-0 top-[130px] bg-black/40 backdrop-blur-sm z-30"
            />

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute left-0 w-full bg-brand-surface dark:bg-brand-muted border-t border-slate-200 dark:border-white/10 shadow-2xl z-40"
            >
              <div className="max-w-7xl mx-auto">
                <MegaMenuContent />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
