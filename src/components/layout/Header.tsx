"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Loader2,
  Tag,
} from "lucide-react";

import { useChatStore } from "@/store/useChatStore";
import { useCartStore } from "@/store/useCartStore";
import { MegaMenuContent } from "@/components/mega-menu";
import { searchCatalogAutocomplete } from "@/services/search";
import { getImageUrl } from "@/utils/image";

export default function Header() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // --- LIVE SEARCH STATE ---
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    categories: any[];
    products: any[];
  }>({ categories: [], products: [] });

  const profileRef = useRef<HTMLDivElement>(null);
  const catalogRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const unreadNotifications = useChatStore(
    (state) => state.unreadNotifications,
  );
  const totalUnreadCount = useChatStore((state) => state.totalUnreadCount);

  const cartItems = useCartStore((state) => state.items);
  const cartItemCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );
  const wishlistItemCount = 0;
  const firstName = session?.user?.name?.split(" ")[0] || "Пользователь";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // --- LIVE SEARCH DEBOUNCE EFFECT ---
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        const results = await searchCatalogAutocomplete(searchQuery.trim());
        setSearchResults(results);
        setShowSearchResults(true);
        setIsSearching(false);
      } else {
        setSearchResults({ categories: [], products: [] });
        setShowSearchResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Handle outside clicks to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      )
        setIsProfileOpen(false);
      if (
        catalogRef.current &&
        !catalogRef.current.contains(event.target as Node)
      )
        setIsCatalogOpen(false);
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      )
        setShowSearchResults(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Prevent scrolling when mega menu is open
  useEffect(() => {
    if (isCatalogOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isCatalogOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchResults(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header
      className="w-full bg-brand-surface dark:bg-brand-muted border-b border-slate-200 dark:border-white/5 sticky top-0 z-50 transition-colors"
      ref={catalogRef}
    >
      {/* 1. TOP UTILITY BAR (Desktop Only) */}
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

      {/* 2. MAIN ACTION BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 lg:py-4 flex items-center justify-between gap-4 lg:gap-8 bg-brand-surface dark:bg-brand-muted relative z-50">
        {/* Left: Logo */}
        <div className="flex items-center shrink-0">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-black text-2xl tracking-tight text-foreground group-hover:text-brand-primary transition-colors">
              Online<span className="text-brand-primary">Shop</span>
            </span>
          </Link>
        </div>

        {/* Center: Catalog & Search Bar (Desktop Only) */}
        <div className="hidden lg:flex flex-1 max-w-3xl items-center gap-4">
          <button
            onClick={() => setIsCatalogOpen(!isCatalogOpen)}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 ${
              isCatalogOpen
                ? "bg-foreground text-brand-surface "
                : "bg-brand-primary text-white hover:bg-brand-primary-hover "
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

          <div className="flex w-full relative" ref={searchRef}>
            <form
              onSubmit={handleSearchSubmit}
              className="w-full relative group shadow-sm rounded-xl overflow-hidden z-20"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchQuery.length >= 2) setShowSearchResults(true);
                }}
                placeholder="Поиск товаров, брендов и категорий..."
                className="w-full pl-5 pr-12 py-3 border-2 border-slate-200 dark:border-white/10 focus:border-brand-primary outline-none bg-slate-50 dark:bg-black/20 dark:focus:border-brand-primary transition-all text-[15px] font-medium text-foreground placeholder:text-slate-400"
              />
              <button
                type="submit"
                className="absolute right-0 top-0 h-full px-5 text-slate-400 hover:text-brand-primary hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              >
                {isSearching ? (
                  <Loader2
                    size={20}
                    className="animate-spin text-brand-primary"
                  />
                ) : (
                  <Search size={20} />
                )}
              </button>
            </form>

            {/* LIVE AUTOCOMPLETE DROPDOWN */}
            <AnimatePresence>
              {showSearchResults &&
                (searchResults.categories.length > 0 ||
                  searchResults.products.length > 0) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-brand-surface dark:bg-brand-muted border border-slate-200 dark:border-white/10 shadow-2xl rounded-2xl overflow-hidden z-50 flex flex-col max-h-[70vh]"
                  >
                    <div className="overflow-y-auto custom-scrollbar p-2">
                      {searchResults.categories.length > 0 && (
                        <div className="mb-2">
                          <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Категории
                          </div>
                          {searchResults.categories.map((cat: any) => (
                            <Link
                              key={cat.id}
                              href={`/search?category=${cat.slug}`}
                              onClick={() => setShowSearchResults(false)}
                              className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group"
                            >
                              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 group-hover:text-brand-primary transition-colors">
                                <Tag size={14} />
                              </div>
                              <span className="font-semibold text-sm text-foreground">
                                {cat.name}
                              </span>
                            </Link>
                          ))}
                        </div>
                      )}
                      {searchResults.products.length > 0 && (
                        <div>
                          <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Товары
                          </div>
                          {searchResults.products.map((prod: any) => (
                            <Link
                              key={prod.id}
                              href={`/product/${prod.slug}`}
                              onClick={() => setShowSearchResults(false)}
                              className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group"
                            >
                              <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 dark:border-white/10 overflow-hidden shrink-0">
                                {prod.thumbImage ? (
                                  <img
                                    src={getImageUrl(prod.thumbImage)}
                                    alt={prod.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300">
                                    <Package size={20} />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-sm text-foreground truncate group-hover:text-brand-primary transition-colors">
                                  {prod.name}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="font-black text-brand-primary text-sm">
                                    {Number(
                                      prod.discountedPrice || prod.price,
                                    ).toLocaleString("ru-RU")}{" "}
                                    ₽
                                  </span>
                                  {prod.discountedPrice && (
                                    <span className="text-xs text-slate-400 line-through">
                                      {Number(prod.price).toLocaleString(
                                        "ru-RU",
                                      )}{" "}
                                      ₽
                                    </span>
                                  )}
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="p-2 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-black/20">
                      <button
                        onClick={handleSearchSubmit}
                        className="w-full py-2.5 text-sm font-bold text-brand-primary hover:bg-brand-primary/10 rounded-xl transition-colors"
                      >
                        Смотреть все результаты
                      </button>
                    </div>
                  </motion.div>
                )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right: Action Navigation Icons */}
        <div className="flex items-center gap-3 sm:gap-5 shrink-0">
          {/* Wishlist (Desktop Only) */}
          <Link
            href="/wishlist"
            className="hidden lg:flex flex-col items-center justify-center gap-1.5 text-slate-500 hover:text-brand-primary transition-colors relative group"
          >
            <div className="relative">
              <Heart size={24} />
              {isMounted && wishlistItemCount > 0 && (
                <span className="absolute -top-1.5 -right-2 w-4.5 h-4.5 bg-brand-primary text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-brand-surface dark:border-brand-muted">
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
            className="hidden lg:flex flex-col items-center justify-center gap-1.5 text-slate-500 hover:text-brand-primary transition-colors relative group"
          >
            <div className="relative">
              <ShoppingCart size={24} />
              {isMounted && cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-4.5 px-1 bg-brand-secondary text-brand-muted text-[11px] font-black flex items-center justify-center rounded-full border-2 border-brand-surface dark:border-brand-muted">
                  {cartItemCount}
                </span>
              )}
            </div>
            <span className="text-[11px] font-bold tracking-wide">Корзина</span>
          </Link>

          {/* Chat (Desktop Only) */}
          {status === "authenticated" && (
            <Link
              href="/chat"
              className="hidden lg:flex flex-col items-center justify-center gap-1.5 text-slate-500 hover:text-brand-primary transition-colors relative group"
            >
              <div className="relative">
                <MessageCircle size={24} />
                <AnimatePresence>
                  {isMounted && totalUnreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1.5 -right-2 w-4.5 h-4.5 bg-brand-primary text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-brand-surface dark:border-brand-muted"
                    >
                      {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <span className="text-[11px] font-bold tracking-wide">Чат</span>
            </Link>
          )}

          {/* Notifications (Visible on BOTH Desktop & Mobile) */}
          {status === "authenticated" && (
            <Link
              href="/notifications"
              className="flex flex-col items-center justify-center gap-1.5 text-slate-500 hover:text-brand-primary transition-colors relative group"
            >
              <div className="relative p-1.5 lg:p-0">
                <Bell size={24} />
                <AnimatePresence>
                  {isMounted && unreadNotifications > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute top-0 right-0 lg:-top-1.5 lg:-right-2 w-4.5 h-4.5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-brand-surface dark:border-brand-muted"
                    >
                      {unreadNotifications > 99 ? "99+" : unreadNotifications}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <span className="hidden lg:block text-[11px] font-bold tracking-wide">
                Уведомления
              </span>
            </Link>
          )}

          {/* Profile Dropdown (Desktop Only) */}
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
                className="flex items-center justify-center px-6 py-2.5 text-sm font-bold text-white bg-brand-primary hover:bg-brand-primary-hover rounded-full transition-all "
              >
                Войти
              </Link>
            )}

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

      <AnimatePresence>
        {isCatalogOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCatalogOpen(false)}
              className="fixed inset-0 top-32.5 bg-black/40 backdrop-blur-sm z-30"
            />

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute left-0 w-full bg-brand-surface dark:bg-brand-muted border-t border-slate-200 dark:border-white/10 shadow-2xl z-40"
            >
              <div className="max-w-7xl mx-auto">
                <MegaMenuContent onClose={() => setIsCatalogOpen(false)} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
