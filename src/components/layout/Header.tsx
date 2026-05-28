"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useCartStore } from "@/store/useCartStore";
import { MegaMenuContent } from "@/components/mega-menu";

export default function Header() {
  const { data: session, status } = useSession();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const catalogRef = useRef<HTMLDivElement>(null);

  // Real-time unread counts from App Store
  const unreadNotifications = useAppStore((state) => state.unreadNotifications);
  const unreadChatMessages = useAppStore((state) => state.unreadChatMessages);

  // 🚨 Real-time shopping cart calculation from useCartStore
  const cartItems = useCartStore((state) => state.items);
  const cartItemCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  // Dummy wishlist count (hook this up to your wishlist store similarly if needed)
  const wishlistItemCount = 0;

  const firstName = session?.user?.name?.split(" ")[0] || "User";

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
      className="w-full bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors"
      ref={catalogRef}
    >
      {/* ========================================== */}
      {/* 1. TOP UTILITY BAR (Desktop Only)            */}
      {/* ========================================== */}
      <div className="bg-slate-100 dark:bg-slate-900 py-1.5 hidden lg:block border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center text-xs font-medium text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-6">
            <button className="flex items-center gap-1 hover:text-brand-primary transition-colors">
              <MapPin size={14} /> New Delhi, NCR
            </button>
            <Link
              href="/stores"
              className="hover:text-brand-primary transition-colors"
            >
              Our Stores
            </Link>
            <Link
              href="/delivery"
              className="hover:text-brand-primary transition-colors"
            >
              Delivery & Payment
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="tel:+918005555555"
              className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200 hover:text-brand-primary transition-colors"
            >
              <Phone size={14} /> 1800 555 5555
            </a>
            <Link
              href="/support"
              className="hover:text-brand-primary transition-colors"
            >
              Support 24/7
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* 2. MAIN ACTION BAR                           */}
      {/* ========================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 lg:py-4 flex items-center justify-between gap-4 lg:gap-8 bg-white dark:bg-slate-950 relative z-50">
        {/* Logo Section */}
        <div className="flex items-center gap-3 lg:gap-0 shrink-0">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform shadow-md shadow-brand-primary/20">
              <span className="text-white font-black text-2xl leading-none tracking-tighter">
                O
              </span>
            </div>
            <span className="font-black text-2xl tracking-tight text-slate-900 dark:text-white hidden sm:block group-hover:text-brand-primary transition-colors">
              Online<span className="text-brand-primary">Shop</span>
            </span>
          </Link>
        </div>

        {/* Catalog Control & Search Bar */}
        <div className="hidden md:flex flex-1 max-w-3xl items-center gap-4">
          <button
            onClick={() => setIsCatalogOpen(!isCatalogOpen)}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
              isCatalogOpen
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-lg"
                : "bg-brand-primary text-white hover:bg-brand-secondary shadow-md shadow-brand-primary/20"
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

          <div className="flex w-full relative group shadow-sm rounded-xl overflow-hidden">
            <input
              type="text"
              placeholder="Search products, brands, and categories..."
              className="w-full pl-5 pr-12 py-3 border-2 border-slate-200 dark:border-slate-800 focus:border-brand-primary outline-none bg-slate-50 dark:bg-slate-900 dark:focus:border-brand-primary transition-all text-sm font-medium"
            />
            <button className="absolute right-0 top-0 h-full px-5 text-slate-400 hover:text-brand-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <Search size={20} />
            </button>
          </div>
        </div>

        {/* Action Navigation Icons */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Wishlist */}
          <Link
            href="/wishlist"
            className="hidden lg:flex flex-col items-center justify-center w-12 h-12 rounded-xl text-slate-600 hover:text-brand-primary hover:bg-brand-primary/5 transition-all relative"
          >
            <Heart size={22} />
            {wishlistItemCount > 0 && (
              <span className="absolute top-2 right-2 w-4.5 h-4.5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-slate-950">
                {wishlistItemCount}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            className="flex flex-col items-center justify-center w-12 h-12 rounded-xl text-slate-600 hover:text-brand-primary hover:bg-brand-primary/5 transition-all relative"
          >
            <ShoppingCart size={22} />
            {cartItemCount > 0 && (
              <span className="absolute top-2 right-1.5 min-w-[18px] h-4.5 px-1 bg-brand-accent text-white text-[11px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-slate-950">
                {cartItemCount}
              </span>
            )}
          </Link>

          {/* Chat (Authenticated) */}
          {status === "authenticated" && (
            <Link
              href="/chat"
              className="flex flex-col items-center justify-center w-12 h-12 rounded-xl text-slate-600 hover:text-brand-primary hover:bg-brand-primary/5 transition-all relative"
            >
              <MessageCircle size={22} />
              <AnimatePresence>
                {unreadChatMessages > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute top-2 right-2 w-4 h-4 bg-brand-primary text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-slate-950"
                  >
                    {unreadChatMessages > 99 ? "99+" : unreadChatMessages}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          )}

          {/* Notifications (Authenticated) */}
          {status === "authenticated" && (
            <Link
              href="/notifications"
              className="flex flex-col items-center justify-center w-12 h-12 rounded-xl text-slate-600 hover:text-brand-primary hover:bg-brand-primary/5 transition-all relative"
            >
              <Bell size={22} />
              <AnimatePresence>
                {unreadNotifications > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-slate-950"
                  >
                    {unreadNotifications > 99 ? "99+" : unreadNotifications}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          )}

          {/* Auth Profile Container */}
          <div className="relative" ref={profileRef}>
            {status === "authenticated" ? (
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center justify-center w-10 h-10 lg:w-auto lg:px-2 lg:h-12 gap-2 rounded-xl text-slate-600 hover:text-brand-primary hover:bg-brand-primary/5 transition-all focus:outline-none"
              >
                {session?.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt="User"
                    width={32}
                    height={32}
                    className="rounded-full object-cover border-2 border-white shadow-sm"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                    <User size={18} />
                  </div>
                )}
                <span className="text-sm font-bold hidden lg:block">
                  {firstName}
                </span>
                <ChevronDown size={14} className="hidden lg:block opacity-50" />
              </button>
            ) : (
              <Link
                href="/auth/login"
                className="ml-2 hidden lg:flex items-center justify-center px-6 py-2.5 text-sm font-bold text-white bg-brand-primary hover:bg-brand-secondary rounded-xl transition-all shadow-md shadow-brand-primary/20"
              >
                Sign In
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
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-2 origin-top-right z-50"
                >
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 mb-2">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {session.user.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {session.user.email}
                    </p>
                  </div>

                  <Link
                    href="/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-brand-primary transition-colors"
                  >
                    <User size={16} /> Личный кабинет
                  </Link>
                  <Link
                    href="/orders"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-brand-primary transition-colors"
                  >
                    <Package size={16} /> История заказов
                  </Link>
                  <Link
                    href="/returns"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-brand-primary transition-colors"
                  >
                    <RotateCcw size={16} /> Возвраты
                  </Link>

                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-2 mx-4" />

                  <button
                    onClick={() => signOut({ callbackUrl: "/auth/login" })}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                  >
                    <LogOut size={16} /> Выйти
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
              className="fixed inset-0 top-[120px] bg-black/40 backdrop-blur-sm z-30"
            />

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute left-0 w-full bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 shadow-2xl z-40"
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
