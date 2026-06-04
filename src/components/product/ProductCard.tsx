"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart, PackageSearch, Check } from "lucide-react";

import { Product } from "@/services/product";
import { getImageUrl } from "@/utils/image";
import { useCartStore } from "@/store/useCartStore";
import { useToast } from "@/hooks/useToast"; // Adjust path if your toast hook is located elsewhere

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  // Hydration guard for Zustand
  const [isMounted, setIsMounted] = useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => state.items);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const price = parseFloat(product.price.toString());
  const discountedPrice = product.discountedPrice
    ? parseFloat(product.discountedPrice.toString())
    : null;

  // Calculate discount percentage
  const discountPercent = discountedPrice
    ? Math.round(((price - discountedPrice) / price) * 100)
    : 0;

  const isOutOfStock =
    product.status === "OUT_OF_STOCK" || product.inStock <= 0;

  // Check if item is already in the cart
  const isInCart =
    isMounted && cartItems.some((item) => item.productId === product.id);

  // Add to cart handler
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const currentPrice = discountedPrice || price;

    addItem({
      productId: product.id,
      name: product.name,
      price: currentPrice,
      quantity: 1,
      imageUrl: product.thumbImage ? getImageUrl(product.thumbImage) : "",
    });

    toast({
      title: "Добавлено в корзину",
      description: "Товар успешно добавлен.",
      variant: "success",
    });
  };

  return (
    <div className="group flex flex-col bg-brand-surface dark:bg-brand-muted border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-brand-primary/10 transition-all duration-300 relative h-full">
      {/* ========================================== */}
      {/* IMAGE & INTERACTIVE OVERLAYS                 */}
      {/* ========================================== */}
      <div className="relative aspect-square overflow-hidden bg-slate-50 dark:bg-black/20 flex items-center justify-center">
        {/* Badges (Top Left) */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
          {product.tags?.includes("New") && (
            <span className="bg-brand-secondary text-brand-muted text-[11px] font-black px-2.5 py-1 rounded-lg shadow-sm">
              НОВИНКА
            </span>
          )}
        </div>

        {/* Product Image Link */}
        <Link
          href={`/product/${product.slug}`}
          className="w-full h-full p-4 flex items-center justify-center z-0"
        >
          {product.thumbImage ? (
            <img
              src={getImageUrl(product.thumbImage)}
              alt={product.name}
              className={`object-contain w-full h-full transition-transform duration-500 group-hover:scale-105 ${
                isOutOfStock
                  ? "opacity-50 grayscale"
                  : "mix-blend-multiply dark:mix-blend-normal"
              }`}
            />
          ) : (
            <PackageSearch
              className="w-16 h-16 text-slate-300"
              strokeWidth={1}
            />
          )}
        </Link>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <span className="bg-brand-muted/80 dark:bg-black/70 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
              Нет в наличии
            </span>
          </div>
        )}

        {/* 🚨 FLOATING ADD TO CART BUTTON (Visible on Hover/Tap) */}
        {!isOutOfStock && (
          <button
            onClick={handleAddToCart}
            className={`absolute bottom-4 right-4 z-20 h-11 w-11 rounded-full flex items-center justify-center text-white shadow-lg opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 active:scale-90 transition-all duration-300 ${
              isInCart
                ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30"
                : "bg-brand-primary hover:bg-brand-primary-hover shadow-brand-primary/30"
            }`}
            aria-label={isInCart ? "Already in cart" : "Add to cart"}
          >
            {isInCart ? (
              <Check className="h-5 w-5" strokeWidth={3} />
            ) : (
              <ShoppingCart className="h-5 w-5" />
            )}
          </button>
        )}
      </div>

      {/* ========================================== */}
      {/* PRODUCT DETAILS                              */}
      {/* ========================================== */}
      <Link
        href={`/product/${product.slug}`}
        className="p-4 flex flex-col flex-1 z-10"
      >
        {/* Title */}
        <h3 className="text-sm font-bold text-foreground line-clamp-2 group-hover:text-brand-primary transition-colors mb-3 leading-snug">
          {product.name}
        </h3>

        {/* Pricing Row (Price, Old Price, Discount %) */}
        <div className="flex items-center flex-wrap gap-2 mt-auto pt-2">
          {discountedPrice ? (
            <>
              <span className="text-lg font-bold text-[#266e38] leading-none">
                {discountedPrice.toLocaleString("ru-RU")} ₽
              </span>
              <span className="text-[13px] font-medium text-slate-400 line-through leading-none">
                {price.toLocaleString("ru-RU")} ₽
              </span>
              {discountPercent > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-sm leading-none">
                  -{discountPercent}%
                </span>
              )}
            </>
          ) : (
            <span className="text-lg font-bold text-[#266e38] leading-none">
              {price.toLocaleString("ru-RU")} ₽
            </span>
          )}
        </div>
      </Link>
    </div>
  );
}
