"use client";

import Link from "next/link";
import {
  ArrowRight,
  ShoppingCart,
  Heart,
  ShieldCheck,
  Truck,
  CreditCard,
  RefreshCw,
  Flame,
  Sparkles,
  Percent,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getImageUrl } from "@/utils/image";
import { usePublicGroupedProducts } from "@/services/product";
import { useCartStore } from "@/store/useCartStore";
import { useToast } from "@/hooks/useToast";

// Map backend tags to beautiful UI headers & icons
const TAG_UI_MAP: Record<string, { title: string; icon: any; color: string }> =
  {
    Bestseller: {
      title: "Хиты продаж",
      icon: Flame,
      color: "text-[#F33939] fill-[#F33939]",
    },
    New: {
      title: "Новинки",
      icon: Sparkles,
      color: "text-[#005BFF] fill-[#005BFF]",
    },
    Sale: { title: "Распродажа", icon: Percent, color: "text-[#00B15C]" },
  };

// Dummy categories styled like Yandex Market quick links
const POPULAR_CATEGORIES = [
  { id: 1, name: "Кроссовки", image: "👟", slug: "shoes" },
  { id: 2, name: "Одежда", image: "👕", slug: "clothing" },
  { id: 3, name: "Тренажеры", image: "🏋️", slug: "equipment" },
  { id: 4, name: "Туризм", image: "⛺", slug: "tourism" },
  { id: 5, name: "Единоборства", image: "🥊", slug: "martial-arts" },
  { id: 6, name: "Велоспорт", image: "🚴", slug: "cycling" },
];

export default function HomePage() {
  // Fetch products via React Query using your API Client
  const { data: response, isLoading } = usePublicGroupedProducts([
    "Bestseller",
    "New",
    "Sale",
  ]);
  const groupedProducts = response?.data || {};
  const tags = Object.keys(groupedProducts);

  // Zustand Cart Store
  const addItem = useCartStore((state) => state.addItem);
  const { toast } = useToast();

  const handleAddToCart = (
    e: React.MouseEvent,
    product: any,
    currentPrice: number,
  ) => {
    e.preventDefault(); // Prevents the Link navigation when clicking the button
    e.stopPropagation();

    addItem({
      productId: product.id,
      name: product.name,
      price: currentPrice,
      quantity: 1,
      imageUrl: product.thumbImage ? getImageUrl(product.thumbImage) : "",
    });

    toast({
      title: "Добавлено в корзину",
      description: `${product.name} успешно добавлен.`,
      variant: "success",
    });
  };

  return (
    <div className="container mx-auto max-w-[1400px] px-4 py-8 space-y-12 animate-in fade-in duration-500 bg-[#F5F6F8] dark:bg-slate-950 min-h-screen">
      {/* ========================================== */}
      {/* 1. HERO BANNERS AREA                         */}
      {/* ========================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="lg:col-span-2 bg-[#1A1A1A] rounded-[32px] p-8 lg:p-14 flex flex-col justify-center items-start min-h-[420px] relative overflow-hidden text-white group cursor-pointer">
          <div className="absolute right-[-10%] bottom-[-20%] w-[600px] h-[600px] bg-gradient-to-tl from-[#FCE000]/40 to-transparent rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-700" />

          <div className="bg-[#F33939] text-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest rounded-lg mb-6 z-10">
            Мега Распродажа
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 z-10 leading-[1.05] tracking-tight">
            Летняя <br /> Коллекция 2026
          </h1>
          <p className="text-[#A6A6A6] mb-10 max-w-md z-10 text-lg leading-snug">
            Скидки до 50% на кроссовки, одежду для бега и аксессуары для
            активного отдыха.
          </p>
          <Button
            size="lg"
            className="bg-[#FCE000] hover:bg-[#F2D600] text-black text-base px-8 h-14 rounded-2xl z-10 font-bold transition-transform active:scale-95"
          >
            Смотреть каталог
          </Button>
        </div>

        <div className="flex flex-col gap-4 lg:gap-6">
          <div className="flex-1 bg-[#E8F0FE] dark:bg-slate-900 rounded-[32px] p-8 flex flex-col justify-center group cursor-pointer overflow-hidden relative transition-shadow hover:shadow-lg">
            <div className="z-10">
              <h3 className="text-3xl font-black mb-2 text-slate-900 dark:text-white tracking-tight">
                Новинки Nike
              </h3>
              <p className="text-[15px] text-slate-600 dark:text-slate-400 mb-6 font-medium">
                Уже в наличии
              </p>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm group-hover:bg-[#FCE000] group-hover:text-black transition-colors">
                <ArrowRight className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="flex-1 bg-[#FEECEC] dark:bg-red-950/20 rounded-[32px] p-8 flex flex-col justify-center group cursor-pointer overflow-hidden relative transition-shadow hover:shadow-lg">
            <div className="z-10">
              <h3 className="text-3xl font-black mb-2 text-[#F33939] tracking-tight">
                Sale -30%
              </h3>
              <p className="text-[15px] text-slate-600 dark:text-slate-400 mb-6 font-medium">
                На велосипеды и самокаты
              </p>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white dark:bg-slate-800 text-[#F33939] shadow-sm group-hover:bg-[#F33939] group-hover:text-white transition-colors">
                <ArrowRight className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 2. POPULAR CATEGORIES (Yandex Style)         */}
      {/* ========================================== */}
      <section>
        <h2 className="text-[28px] font-black tracking-tight mb-6 text-slate-900 dark:text-white">
          Популярные категории
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
          {POPULAR_CATEGORIES.map((category) => (
            <Link href={`/category/${category.slug}`} key={category.id}>
              <div className="bg-white dark:bg-slate-900 rounded-[24px] p-4 flex flex-col h-[120px] justify-between group hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300">
                <span className="font-bold text-[15px] text-slate-900 dark:text-white leading-tight group-hover:text-[#F33939] transition-colors">
                  {category.name}
                </span>
                <span className="text-4xl self-end transform group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
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

      {/* Loading Skeleton */}
      {isLoading && (
        <section className="space-y-6">
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-5">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-[360px] bg-white dark:bg-slate-900 animate-pulse rounded-[24px]"
              ></div>
            ))}
          </div>
        </section>
      )}

      {/* Render Data */}
      {!isLoading &&
        tags.map((tag) => {
          const products = groupedProducts[tag] || [];
          if (products.length === 0) return null;

          // Slice to EXACTLY 4 products per user request
          const displayProducts = products.slice(0, 4);
          const uiConfig = TAG_UI_MAP[tag] || {
            title: tag,
            icon: Flame,
            color: "text-slate-900 dark:text-white",
          };
          const Icon = uiConfig.icon;

          return (
            <section key={tag}>
              <div className="flex items-center justify-between gap-3 mb-6">
                <h2 className="text-[28px] font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  <Icon className={`h-7 w-7 ${uiConfig.color}`} />{" "}
                  {uiConfig.title}
                </h2>
                <Link
                  href={`/search?tag=${tag}`}
                  className="text-[15px] font-semibold text-blue-600 hover:text-blue-800 flex items-center transition-colors"
                >
                  Все <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>

              {/* Adjusted grid to strictly 4 columns */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-5">
                {displayProducts.map((product: any) => {
                  const hasDiscount =
                    product.discountedPrice &&
                    product.discountedPrice < product.price;
                  const discountPercent = hasDiscount
                    ? Math.round(
                        ((Number(product.price) -
                          Number(product.discountedPrice)) /
                          Number(product.price)) *
                          100,
                      )
                    : 0;

                  const currentPrice = Number(
                    product.discountedPrice || product.price,
                  );
                  const oldPrice = product.discountedPrice
                    ? Number(product.price)
                    : null;

                  return (
                    <Link
                      href={`/product/${product.slug}`}
                      key={product.id}
                      className="group flex flex-col bg-white dark:bg-slate-900 rounded-[24px] p-4 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 relative h-full"
                    >
                      {/* NEW TAG (Optional extra tag layout) */}
                      {product.tags?.includes("New") && !hasDiscount && (
                        <div className="absolute top-4 left-4 z-10 bg-[#005BFF] text-white font-bold px-2 py-0.5 rounded-full text-[11px] tracking-wide pointer-events-none">
                          Новинка
                        </div>
                      )}

                      {/* Wishlist Button - Prevent default so it doesn't trigger Link */}
                      <button
                        onClick={(e) => e.preventDefault()}
                        className="absolute top-3 right-3 z-10 p-2 rounded-full text-slate-300 hover:text-[#F33939] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Heart
                          className="h-[22px] w-[22px]"
                          strokeWidth={2.5}
                        />
                      </button>

                      {/* Product Image */}
                      <div className="relative aspect-square w-full rounded-[16px] overflow-hidden mb-4 bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                        {product.thumbImage ? (
                          <img
                            src={getImageUrl(product.thumbImage)}
                            alt={product.name}
                            className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <ShoppingCart className="h-12 w-12 text-slate-200 dark:text-slate-700" />
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex flex-col flex-1">
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-1 font-semibold uppercase tracking-wider">
                          {product.brand || "Бренд не указан"}
                        </div>

                        <div className="text-[14px] leading-[18px] text-slate-700 dark:text-slate-300 group-hover:text-[#F33939] line-clamp-2 mb-4 font-medium transition-colors">
                          {product.name}
                        </div>

                        {/* Unified Price Row */}
                        <div className="flex flex-wrap items-center gap-2 mb-4 mt-auto">
                          <span
                            className={`text-[22px] font-black leading-none tracking-tight ${hasDiscount ? "text-[#F33939]" : "text-slate-900 dark:text-white"}`}
                          >
                            {currentPrice.toLocaleString("ru-RU")} ₽
                          </span>

                          {oldPrice && (
                            <span className="text-[13px] text-slate-400 line-through leading-none font-medium">
                              {oldPrice.toLocaleString("ru-RU")} ₽
                            </span>
                          )}

                          {hasDiscount && (
                            <div className="bg-[#F33939] text-white font-bold px-1.5 py-[2px] rounded text-[11px] leading-none tracking-wide">
                              -{discountPercent}%
                            </div>
                          )}
                        </div>

                        {/* Add to Cart Button (Intercepts click) */}
                        <button
                          onClick={(e) =>
                            handleAddToCart(e, product, currentPrice)
                          }
                          className="w-full bg-[#FCE000] hover:bg-[#F2D600] active:scale-[0.98] text-black font-bold py-3 rounded-2xl transition-all flex items-center justify-center gap-2"
                        >
                          <ShoppingCart className="h-4 w-4" strokeWidth={2.5} />
                          В корзину
                        </button>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}

      {/* ========================================== */}
      {/* 4. STORE BENEFITS                            */}
      {/* ========================================== */}
      <section className="bg-white dark:bg-slate-900 rounded-[32px] p-8 lg:p-10 shadow-sm border border-slate-100 dark:border-slate-800 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex flex-col gap-3">
            <div className="h-14 w-14 rounded-2xl bg-[#E8F0FE] dark:bg-blue-900/30 text-[#005BFF] flex items-center justify-center mb-2">
              <ShieldCheck className="h-7 w-7" strokeWidth={2} />
            </div>
            <h4 className="font-bold text-[17px] text-slate-900 dark:text-white leading-tight">
              Оригинальные бренды
            </h4>
            <p className="text-[14px] text-slate-500 leading-snug">
              Только сертифицированная продукция с официальной гарантией.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <div className="h-14 w-14 rounded-2xl bg-[#E8F0FE] dark:bg-blue-900/30 text-[#005BFF] flex items-center justify-center mb-2">
              <Truck className="h-7 w-7" strokeWidth={2} />
            </div>
            <h4 className="font-bold text-[17px] text-slate-900 dark:text-white leading-tight">
              Быстрая доставка
            </h4>
            <p className="text-[14px] text-slate-500 leading-snug">
              Доставляем заказы курьером и в тысячи пунктов выдачи.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <div className="h-14 w-14 rounded-2xl bg-[#E8F0FE] dark:bg-blue-900/30 text-[#005BFF] flex items-center justify-center mb-2">
              <RefreshCw className="h-7 w-7" strokeWidth={2} />
            </div>
            <h4 className="font-bold text-[17px] text-slate-900 dark:text-white leading-tight">
              Простой возврат
            </h4>
            <p className="text-[14px] text-slate-500 leading-snug">
              Удобный возврат неподошедшего товара в течение 14 дней.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <div className="h-14 w-14 rounded-2xl bg-[#E8F0FE] dark:bg-blue-900/30 text-[#005BFF] flex items-center justify-center mb-2">
              <CreditCard className="h-7 w-7" strokeWidth={2} />
            </div>
            <h4 className="font-bold text-[17px] text-slate-900 dark:text-white leading-tight">
              Безопасная оплата
            </h4>
            <p className="text-[14px] text-slate-500 leading-snug">
              Защищенная оплата картой онлайн или при получении заказа.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
