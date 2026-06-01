"use client";

import Link from "next/link";
import { Send, MessageCircle, Phone, Mail } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-muted text-slate-300 pt-16 pb-[100px] md:pb-12 border-t border-white/5">
      <div className="max-w-4xl mx-auto px-6 flex flex-col items-center text-center">
        {/* 1. Brand Logo */}
        <Link href="/" className="inline-block mb-5 group">
          <span className="font-black text-3xl tracking-tight text-white transition-colors">
            Online<span className="text-brand-primary">Shop</span>
          </span>
        </Link>

        {/* 2. Short Tagline */}
        <p className="text-sm font-medium text-slate-400 leading-relaxed mb-8 max-w-md">
          Покупайте с комфортом. Эксклюзивные товары, безопасные платежи и
          быстрая доставка прямо до вашей двери.
        </p>

        {/* 3. Primary Navigation */}
        <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-8 text-sm font-bold text-white uppercase tracking-wide">
          <Link
            href="/category"
            className="hover:text-brand-primary transition-colors"
          >
            Каталог
          </Link>
          <Link
            href="/wishlist"
            className="hover:text-brand-primary transition-colors"
          >
            Избранное
          </Link>
          <Link
            href="/cart"
            className="hover:text-brand-primary transition-colors"
          >
            Корзина
          </Link>
          <Link
            href="/profile"
            className="hover:text-brand-primary transition-colors"
          >
            Личный кабинет
          </Link>
        </nav>

        {/* 4. Contact Information */}
        <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 mb-8 text-sm font-medium text-slate-300">
          <a
            href="tel:+78005555555"
            className="flex items-center gap-2 hover:text-brand-primary transition-colors group"
          >
            <Phone
              size={16}
              className="text-slate-500 group-hover:text-brand-primary transition-colors"
            />
            8 (800) 555-55-55
          </a>
          <a
            href="mailto:support@onlineshop.ru"
            className="flex items-center gap-2 hover:text-brand-primary transition-colors group"
          >
            <Mail
              size={16}
              className="text-slate-500 group-hover:text-brand-primary transition-colors"
            />
            support@onlineshop.ru
          </a>
          <Link
            href="/support"
            className="flex items-center gap-2 hover:text-brand-primary transition-colors group"
          >
            <MessageCircle
              size={16}
              className="text-slate-500 group-hover:text-brand-primary transition-colors"
            />
            Служба поддержки
          </Link>
        </div>

        {/* 5. Social Icons */}
        <div className="flex items-center justify-center gap-4 mb-10">
          {/* <a
            href="#"
            className="w-12 h-12 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all active:scale-95 shadow-sm"
          >
            <Instagram size={20} />
          </a> */}
          <a
            href="#"
            className="w-12 h-12 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all active:scale-95 shadow-sm"
          >
            <Send size={20} />
          </a>
          <a
            href="#"
            className="w-12 h-12 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all active:scale-95 shadow-sm"
          >
            <MessageCircle size={20} />
          </a>
        </div>

        {/* 6. Subtle Divider */}
        <div className="h-px w-full max-w-lg bg-white/5 mb-8" />

        {/* 7. Copyright & Legal */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 text-xs font-medium text-slate-500">
          <p>© {currentYear} OnlineShop. Все права защищены.</p>
          <div className="flex items-center gap-4">
            <Link
              href="/privacy"
              className="hover:text-brand-primary transition-colors"
            >
              Политика конфиденциальности
            </Link>
            <span className="w-1 h-1 rounded-full bg-slate-700 hidden md:block" />
            <Link
              href="/terms"
              className="hover:text-brand-primary transition-colors"
            >
              Пользовательское соглашение
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
