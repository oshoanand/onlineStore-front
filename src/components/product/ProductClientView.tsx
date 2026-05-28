"use client";

import { useState } from "react";
import {
  ShoppingCart,
  Heart,
  Share2,
  Star,
  ChevronRight,
  ShieldCheck,
  Truck,
  Package,
  MessageCircle, // Using as WhatsApp icon fallback
  Send, // Using as Telegram icon fallback
} from "lucide-react";
import { Product } from "@/services/product";
import { useCartStore } from "@/store/useCartStore";
import { useToast } from "@/hooks/useToast";
import { getImageUrl } from "@/utils/image";

export default function ProductClientView({ product }: { product: Product }) {
  const { toast } = useToast();
  const addToCart = useCartStore((state) => state.addItem);

  // Combine thumbImage with gallery images for a unified array
  const allImages = [product.thumbImage, ...(product.imageArray || [])].filter(
    Boolean,
  ) as string[];

  const [activeImage, setActiveImage] = useState<string>(
    allImages[0] || "/placeholder.png",
  );
  const [isAdding, setIsAdding] = useState(false);

  // --- Calculations ---
  const isDiscounted =
    product.discountedPrice && product.discountedPrice < product.price;
  const currentPrice = isDiscounted ? product.discountedPrice! : product.price;
  const discountPercent = isDiscounted
    ? Math.round(
        ((product.price - product.discountedPrice!) / product.price) * 100,
      )
    : 0;

  // --- Handlers ---
  const handleAddToCart = () => {
    setIsAdding(true);
    addToCart({
      productId: product.id,
      name: product.name,
      price: currentPrice,
      imageUrl: product.thumbImage ? getImageUrl(product.thumbImage) : "",
      quantity: 1,
    });

    setTimeout(() => {
      setIsAdding(false);
      toast({
        title: "Добавлено в корзину",
        description: `${product.name} успешно добавлен.`,
        variant: "success",
      });
    }, 400);
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = product.name;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch (err) {
        console.error("Share failed", err);
      }
    } else {
      navigator.clipboard.writeText(url);
      toast({
        title: "Ссылка скопирована",
        description: "Ссылка на товар скопирована в буфер обмена.",
      });
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 md:rounded-[32px] shadow-sm border-b md:border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Breadcrumbs (Desktop) */}
      <div className="hidden md:flex items-center gap-2 text-sm text-slate-500 p-6 pb-0">
        <span className="hover:text-[#005BFF] cursor-pointer">Главная</span>
        <ChevronRight size={14} />
        <span className="hover:text-[#005BFF] cursor-pointer">Каталог</span>
        <ChevronRight size={14} />
        <span className="text-slate-900 dark:text-white font-medium truncate max-w-xs">
          {product.name}
        </span>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* ==========================================
            LEFT: ELEGANT IMAGE GALLERY
            ========================================== */}
        <div className="w-full lg:w-1/2 p-4 md:p-8 flex flex-col gap-4">
          {/* Main Image Stage */}
          <div className="aspect-square w-full bg-slate-50 dark:bg-slate-950/50 rounded-[24px] overflow-hidden relative border border-slate-100 dark:border-slate-800 flex items-center justify-center">
            {discountPercent > 0 && (
              <div className="absolute top-4 left-4 bg-[#F33939] text-white text-xs font-black px-3 py-1.5 rounded-full z-10 shadow-lg shadow-red-500/30 tracking-wider">
                -{discountPercent}%
              </div>
            )}
            <img
              src={activeImage}
              alt={product.name}
              className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal transition-opacity duration-300"
            />
          </div>

          {/* Horizontal Thumbnail List */}
          {allImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar snap-x">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-20 shrink-0 rounded-2xl overflow-hidden border-2 transition-all snap-center bg-slate-50 ${
                    activeImage === img
                      ? "border-[#005BFF] opacity-100 shadow-md scale-100"
                      : "border-transparent opacity-60 hover:opacity-100 scale-95 hover:scale-100"
                  }`}
                >
                  <img
                    src={img}
                    alt={`Gallery ${idx}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ==========================================
            RIGHT: PRODUCT DETAILS
            ========================================== */}
        <div className="w-full lg:w-1/2 p-6 md:p-8 lg:pl-0 flex flex-col">
          {/* Header Info */}
          <div className="mb-6">
            <div className="flex justify-between items-start gap-4">
              <div>
                {product.brand && (
                  <p className="text-sm font-bold text-[#005BFF] uppercase tracking-wider mb-2">
                    {product.brand}
                  </p>
                )}
                <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                  {product.name}
                </h1>
              </div>
              <button
                onClick={handleShare}
                className="p-3 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-500 hover:text-[#005BFF] transition-colors shrink-0"
              >
                <Share2 size={20} />
              </button>
            </div>

            {/* Ratings & SKU */}
            <div className="flex items-center gap-4 mt-4 text-sm font-medium">
              <div className="flex items-center text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-lg">
                <Star size={16} className="fill-current mr-1.5" />
                <span className="text-slate-900 dark:text-white font-bold mr-1">
                  {product.averageRating.toFixed(1)}
                </span>
                <span className="text-slate-500">({product.reviewCount})</span>
              </div>
              {product.sku && (
                <span className="text-slate-400">Артикул: {product.sku}</span>
              )}
            </div>
          </div>

          {/* Pricing Block */}
          <div className="bg-slate-50 dark:bg-slate-950/50 p-6 rounded-[24px] border border-slate-100 dark:border-slate-800 mb-8">
            <div className="flex items-end gap-3">
              <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {currentPrice.toLocaleString("ru-RU")} ₽
              </span>

              {isDiscounted && (
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-lg text-slate-400 line-through font-bold">
                    {product.price.toLocaleString("ru-RU")} ₽
                  </span>
                  <span className="bg-[#F33939] text-white text-xs font-black px-2 py-1 rounded-md tracking-wider shadow-sm">
                    -{discountPercent}%
                  </span>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <div
                className={`w-2.5 h-2.5 rounded-full ${product.inStock > 0 ? "bg-emerald-500" : "bg-red-500"}`}
              />
              <span
                className={`text-sm font-bold ${product.inStock > 0 ? "text-emerald-600" : "text-red-600"}`}
              >
                {product.inStock > 0
                  ? `В наличии (${product.inStock} шт)`
                  : "Нет в наличии"}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-3">
              О товаре
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[15px]">
              {product.description}
            </p>
          </div>

          {/* Features / Trust Badges */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <ShieldCheck className="text-emerald-500" size={24} />
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Гарантия
                <br />
                качества
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <Truck className="text-[#005BFF]" size={24} />
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Быстрая
                <br />
                доставка
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-auto flex flex-col sm:flex-row gap-3">
            <button
              disabled={product.inStock === 0 || isAdding}
              onClick={handleAddToCart}
              className="flex-1 bg-[#005BFF] text-white py-4.5 rounded-2xl font-black text-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 shadow-lg shadow-blue-500/20"
            >
              {isAdding
                ? "Добавление..."
                : product.inStock > 0
                  ? "В корзину"
                  : "Нет в наличии"}
            </button>

            <button className="h-[60px] w-[60px] flex items-center justify-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 rounded-2xl transition-all shrink-0">
              <Heart size={24} strokeWidth={2.5} />
            </button>
          </div>

          {/* Social Share Footer */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center sm:justify-start gap-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Поделиться:
            </span>

            {/* WhatsApp Share Link */}
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`${product.name} - ${window.location.href}`)}`}
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-full bg-[#25D366]/10 text-[#25D366] flex items-center justify-center hover:bg-[#25D366] hover:text-white transition-colors"
            >
              <MessageCircle size={18} strokeWidth={2.5} />
            </a>

            {/* Telegram Share Link */}
            <a
              href={`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(product.name)}`}
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-full bg-[#0088cc]/10 text-[#0088cc] flex items-center justify-center hover:bg-[#0088cc] hover:text-white transition-colors"
            >
              <Send size={18} strokeWidth={2.5} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
