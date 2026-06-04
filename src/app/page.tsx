"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  CreditCard,
  RefreshCw,
  Flame,
  Sparkles,
  Percent,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { usePublicGroupedProducts } from "@/services/product";
import { ProductCard } from "@/components/product/ProductCard";

// Map backend tags to beautiful UI headers & icons
const TAG_UI_MAP: Record<string, { title: string; icon: any; color: string }> =
  {
    Bestseller: {
      title: "Хиты продаж",
      icon: Flame,
      color: "text-red-500 fill-red-500",
    },
    New: {
      title: "Новинки",
      icon: Sparkles,
      color: "text-brand-primary fill-brand-primary",
    },
    Sale: {
      title: "Распродажа",
      icon: Percent,
      color: "text-brand-secondary",
    },
  };

const POPULAR_CATEGORIES = [
  { id: 1, name: "Кроссовки", image: "👟", slug: "shoes" },
  { id: 2, name: "Одежда", image: "👕", slug: "clothing" },
  { id: 3, name: "Тренажеры", image: "🏋️", slug: "equipment" },
  { id: 4, name: "Туризм", image: "⛺", slug: "tourism" },
  { id: 5, name: "Единоборства", image: "🥊", slug: "martial-arts" },
  { id: 6, name: "Велоспорт", image: "🚴", slug: "cycling" },
];

export default function HomePage() {
  // Fetch grouped products
  const { data: response, isLoading } = usePublicGroupedProducts([
    "Bestseller",
    "New",
    "Sale",
  ]);
  const groupedProducts = response?.data || {};
  const tags = Object.keys(groupedProducts);

  // Isolate products specifically for the Hero Carousel
  const heroProducts =
    groupedProducts["New"] || groupedProducts["Bestseller"] || [];

  // --- Framer Motion Carousel State ---
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (heroProducts.length === 0) return;
    setCurrentSlide((prev) => (prev >= heroProducts.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    if (heroProducts.length === 0) return;
    setCurrentSlide((prev) => (prev <= 0 ? heroProducts.length - 1 : prev - 1));
  };

  // Auto-slide effect for the Hero Carousel
  useEffect(() => {
    if (heroProducts.length === 0) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [heroProducts.length]);

  return (
    <div className="container mx-auto max-w-[1400px]  space-y-12 animate-in fade-in duration-500 bg-background min-h-screen">
      {/* ========================================== */}
      {/* 1. HERO PRODUCT CAROUSEL (Framer Motion)     */}
      {/* ========================================== */}
      <section className="bg-brand-muted dark:bg-slate-950 p-8 lg:p-12 flex flex-col lg:flex-row items-center gap-12 overflow-hidden relative min-h-[480px] shadow-lg shadow-brand-muted/10 border border-transparent dark:border-white/5">
        {/* Background ambient glow */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-brand-primary/20 rounded-full blur-[100px] pointer-events-none" />

        {/* LEFT: Promotions & Controls */}
        <div className="lg:w-1/3 z-10 flex flex-col items-start w-full">
          <div className="bg-brand-secondary text-brand-muted px-3 py-1.5 text-[11px] font-black uppercase tracking-widest rounded-lg mb-6 shadow-sm">
            Новая Коллекция
          </div>
          <h1 className="text-4xl lg:text-5xl xl:text-6xl font-black mb-6 text-white leading-[1.05] tracking-tight">
            Тренды <br /> Сезона
          </h1>
          <p className="text-slate-400 mb-8 text-base lg:text-lg leading-snug">
            Откройте для себя эксклюзивные новинки и популярные хиты.
            Премиальное качество уже в наличии.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/category">
              <Button className="bg-brand-primary hover:bg-brand-primary-hover text-white rounded-xl px-8 h-12 font-bold shadow-lg shadow-brand-primary/20 transition-all active:scale-95">
                В каталог
              </Button>
            </Link>

            {/* Carousel Navigation Arrows */}
            <div className="flex gap-2">
              <button
                onClick={prevSlide}
                className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-brand-primary transition-colors backdrop-blur-md"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={nextSlide}
                className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-brand-primary transition-colors backdrop-blur-md"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: Framer Motion Multiple Product Carousel */}
        <div className="lg:w-2/3 w-full z-10 overflow-hidden pr-4 lg:pr-0 pb-4">
          <motion.div
            className="flex gap-6"
            // 280px (card width) + 24px (gap-6) = 304px shift per slide
            animate={{ x: -(currentSlide * 304) }}
            transition={{ type: "spring", stiffness: 250, damping: 30 }}
          >
            {isLoading
              ? // Loading Skeletons
                [1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-[280px] h-[380px] shrink-0 bg-white/5 animate-pulse rounded-2xl border border-white/5"
                  />
                ))
              : heroProducts.map((product: any) => (
                  <div key={product.id} className="w-[280px] shrink-0">
                    <ProductCard product={product} />
                  </div>
                ))}
          </motion.div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 2. POPULAR CATEGORIES                        */}
      {/* ========================================== */}
      <section className="px-4">
        <h2 className="text-[28px]  font-black tracking-tight mb-6 text-foreground">
          Популярные категории
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
          {POPULAR_CATEGORIES.map((category) => (
            <Link href={`/search?category=${category.slug}`} key={category.id}>
              <div className="bg-brand-surface dark:bg-brand-muted border border-slate-200 dark:border-white/5 rounded-[24px] p-4 flex flex-col h-[120px] justify-between group hover:shadow-lg hover:shadow-brand-primary/5 transition-all duration-300">
                <span className="font-bold text-[15px] text-foreground leading-tight group-hover:text-brand-primary transition-colors">
                  {category.name}
                </span>
                <span className="text-4xl self-end transform group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300">
                  {category.image}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ========================================== */}
      {/* 3. DYNAMIC PRODUCT GROUPS                    */}
      {/* ========================================== */}

      {/* Group Loading Skeleton */}
      {isLoading && (
        <section className="space-y-6 px-4">
          <div className="h-8 w-48 bg-slate-200 dark:bg-brand-muted animate-pulse rounded-lg"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-[360px] bg-slate-100 dark:bg-brand-muted animate-pulse rounded-[24px]"
              ></div>
            ))}
          </div>
        </section>
      )}

      {/* Render Product Groups */}
      {!isLoading &&
        tags.map((tag) => {
          const products = groupedProducts[tag] || [];
          if (products.length === 0) return null;

          // Slice to EXACTLY 4 products to fit perfectly in a 4-col grid
          const displayProducts = products.slice(0, 4);
          const uiConfig = TAG_UI_MAP[tag] || {
            title: tag,
            icon: Flame,
            color: "text-foreground",
          };
          const Icon = uiConfig.icon;

          return (
            <section key={tag} className="pt-4 px-4">
              <div className="flex items-center justify-between gap-3 mb-6">
                <h2 className="text-[26px] md:text-[28px] font-black tracking-tight text-foreground flex items-center gap-2.5">
                  <Icon className={`h-7 w-7 ${uiConfig.color}`} />
                  {uiConfig.title}
                </h2>
                <Link
                  href={`/search?tag=${tag}`}
                  className="text-[15px] font-bold text-brand-primary hover:text-brand-primary-hover flex items-center transition-colors group"
                >
                  Все{" "}
                  <ArrowRight className="ml-1 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {displayProducts.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          );
        })}

      {/* ========================================== */}
      {/* 4. STORE BENEFITS                            */}
      {/* ========================================== */}
      <section className="bg-brand-surface dark:bg-brand-muted p-4 lg:p-10 shadow-sm border border-slate-200 dark:border-white/5 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex flex-col gap-3">
            <div className="h-14 w-14 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-2">
              <ShieldCheck className="h-7 w-7" strokeWidth={2} />
            </div>
            <h4 className="font-bold text-[17px] text-foreground leading-tight">
              Оригинальные бренды
            </h4>
            <p className="text-[14px] text-slate-500 dark:text-slate-400 leading-snug">
              Только сертифицированная продукция с официальной гарантией.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="h-14 w-14 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-2">
              <Truck className="h-7 w-7" strokeWidth={2} />
            </div>
            <h4 className="font-bold text-[17px] text-foreground leading-tight">
              Быстрая доставка
            </h4>
            <p className="text-[14px] text-slate-500 dark:text-slate-400 leading-snug">
              Доставляем заказы курьером и в тысячи пунктов выдачи.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="h-14 w-14 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-2">
              <RefreshCw className="h-7 w-7" strokeWidth={2} />
            </div>
            <h4 className="font-bold text-[17px] text-foreground leading-tight">
              Простой возврат
            </h4>
            <p className="text-[14px] text-slate-500 dark:text-slate-400 leading-snug">
              Удобный возврат неподошедшего товара в течение 14 дней.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="h-14 w-14 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-2">
              <CreditCard className="h-7 w-7" strokeWidth={2} />
            </div>
            <h4 className="font-bold text-[17px] text-foreground leading-tight">
              Безопасная оплата
            </h4>
            <p className="text-[14px] text-slate-500 dark:text-slate-400 leading-snug">
              Защищенная оплата картой онлайн или при получении заказа.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
