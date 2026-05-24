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
  Loader2,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { usePublicCategories } from "@/services/category"; // Ensure this hook exists from previous steps

export default function Header() {
  const { data: session, status } = useSession();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Pull real-time unread counts from Zustand
  const unreadNotifications = useAppStore((state) => state.unreadNotifications);
  const unreadChatMessages = useAppStore((state) => state.unreadChatMessages);

  // Example cart & wishlist count - normally from Zustand/Context
  const cartItemCount = 2;
  const wishlistItemCount = 0;

  const firstName = session?.user?.name?.split(" ")[0] || "User";

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="w-full bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 shadow-sm">
      {/* ========================================== */}
      {/* 1. TOP UTILITY BAR (Desktop Only)            */}
      {/* ========================================== */}
      <div className="bg-slate-100 dark:bg-slate-900 py-1.5 hidden lg:block">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 lg:py-4 flex items-center justify-between gap-4 lg:gap-8">
        {/* Mobile Hamburger & Logo */}
        <div className="flex items-center gap-3 lg:gap-0 shrink-0">
          <button className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-brand-primary">
            <Menu size={24} />
          </button>
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-brand-primary rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform shadow-md shadow-brand-primary/20">
              <span className="text-white font-black text-2xl leading-none tracking-tighter">
                M
              </span>
            </div>
            <span className="font-black text-2xl tracking-tight text-slate-900 dark:text-white hidden sm:block group-hover:text-brand-primary transition-colors">
              Maachh <span className="text-brand-primary">Express</span>
            </span>
          </Link>
        </div>

        {/* Heavyweight Search Bar (Desktop/Tablet) */}
        <div className="hidden md:flex flex-1 max-w-2xl">
          <div className="flex w-full relative group shadow-sm rounded-full">
            <input
              type="text"
              placeholder="Search fresh seafood, cuts, and more..."
              className="w-full pl-5 pr-12 py-2.5 border-2 border-brand-primary/20 focus:border-brand-primary rounded-l-full outline-none bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:focus:border-brand-primary transition-all text-sm"
            />
            <button className="bg-brand-primary hover:bg-brand-secondary text-white px-6 rounded-r-full flex items-center justify-center transition-colors">
              <Search size={18} />
            </button>
          </div>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-1 sm:gap-3 shrink-0">
          {/* Wishlist */}
          <Link
            href="/wishlist"
            className="hidden lg:flex flex-col items-center justify-center w-12 h-12 rounded-xl text-slate-600 hover:text-brand-primary hover:bg-brand-primary/5 transition-all relative"
          >
            <Heart size={22} />
            {wishlistItemCount > 0 && (
              <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-slate-950">
                {wishlistItemCount}
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

          {/* Cart */}
          <Link
            href="/cart"
            className="flex flex-col items-center justify-center w-12 h-12 rounded-xl text-slate-600 hover:text-brand-primary hover:bg-brand-primary/5 transition-all relative"
          >
            <ShoppingCart size={22} />
            <AnimatePresence>
              {cartItemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute top-2 right-1.5 w-4.5 h-4.5 px-1 bg-brand-accent text-white text-[11px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-slate-950"
                >
                  {cartItemCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          {/* Auth / User Profile */}
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
                href="/login"
                className="ml-2 hidden lg:flex items-center justify-center px-6 py-2.5 text-sm font-bold text-white bg-brand-primary hover:bg-brand-secondary rounded-xl transition-all shadow-md shadow-brand-primary/20"
              >
                Sign In
              </Link>
            )}

            {/* Profile Dropdown */}
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
                    <User size={16} /> My Account
                  </Link>
                  <Link
                    href="/orders"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-brand-primary transition-colors"
                  >
                    <Package size={16} /> Order History
                  </Link>
                  <Link
                    href="/returns"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-brand-primary transition-colors"
                  >
                    <RotateCcw size={16} /> Returns & Refunds
                  </Link>

                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-2 mx-4" />

                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar (Visible only on small screens) */}
      <div className="md:hidden px-4 pb-4">
        <div className="flex w-full relative">
          <input
            type="text"
            placeholder="Search fresh catch..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-full outline-none bg-slate-50 text-sm focus:border-brand-primary transition-colors"
          />
          <Search size={18} className="absolute left-4 top-3 text-slate-400" />
        </div>
      </div>

      {/* ========================================== */}
      {/* 3. CATEGORY NAVIGATION BAR                   */}
      {/* ========================================== */}
      <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-12 gap-6">
          {/* Prominent Catalog Button */}
          <button className="bg-brand-primary hover:bg-brand-secondary text-white px-5 h-full flex items-center gap-2 font-bold text-sm tracking-wide transition-colors">
            <Menu size={18} />
            CATALOG
          </button>

          {/* Dynamic Categories */}
          <CategoryNav />
        </div>
      </div>
    </header>
  );
}

// ==========================================
// SUB-COMPONENT: DYNAMIC CATEGORY NAV
// ==========================================
function CategoryNav() {
  const { data: categories, isLoading } = usePublicCategories();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 text-sm text-slate-400 font-medium">
        <Loader2 size={14} className="animate-spin" /> Loading catalog...
      </div>
    );
  }

  if (!categories || categories.length === 0) return null;

  // Render top 7 categories to prevent overflow
  const topCategories = categories.slice(0, 7);

  return (
    <nav className="flex-1 flex items-center gap-6 overflow-visible font-semibold text-sm text-slate-700 dark:text-slate-300 relative">
      {topCategories.map((category) => (
        <div
          key={category.id}
          className="relative h-12 flex items-center"
          onMouseEnter={() => setActiveDropdown(category.id)}
          onMouseLeave={() => setActiveDropdown(null)}
        >
          {category.children && category.children.length > 0 ? (
            <>
              <Link
                href={`/catalog/${category.slug}`}
                className={`flex items-center gap-1 whitespace-nowrap transition-colors ${activeDropdown === category.id ? "text-brand-primary" : "hover:text-brand-primary"}`}
              >
                {category.name}
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${activeDropdown === category.id ? "rotate-180 text-brand-primary" : "text-slate-400"}`}
                />
              </Link>

              {/* Hover Dropdown Menu */}
              <AnimatePresence>
                {activeDropdown === category.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-12 left-0 w-64 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-xl py-3 z-50"
                  >
                    <div className="px-5 py-2 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                      {category.name} Categories
                    </div>
                    <div className="flex flex-col">
                      {category.children.map((sub) => (
                        <Link
                          key={sub.id}
                          href={`/catalog/${category.slug}/${sub.slug}`}
                          className="px-5 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-brand-primary transition-colors"
                          onClick={() => setActiveDropdown(null)}
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                    <div className="h-px bg-slate-100 dark:bg-slate-800 my-2 mx-5" />
                    <Link
                      href={`/catalog/${category.slug}`}
                      className="px-5 py-2 text-sm font-bold text-brand-primary hover:text-brand-secondary transition-colors block"
                      onClick={() => setActiveDropdown(null)}
                    >
                      View All in {category.name} &rarr;
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <Link
              href={`/catalog/${category.slug}`}
              className="hover:text-brand-primary whitespace-nowrap transition-colors"
            >
              {category.name}
            </Link>
          )}
        </div>
      ))}

      {/* Promotional Link */}
      <Link
        href="/sale"
        className="text-red-600 hover:text-red-700 font-black whitespace-nowrap transition-colors ml-auto flex items-center gap-1"
      >
        🔥 DEALS %
      </Link>
    </nav>
  );
}
