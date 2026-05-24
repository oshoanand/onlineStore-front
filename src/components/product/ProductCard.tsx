"use client";

import Link from "next/link";
import { Star, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/services/product";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
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

  return (
    <div className="group flex flex-col bg-white dark:bg-slate-950 border dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 relative h-full">
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {discountPercent > 0 && (
          <Badge className="bg-red-600 hover:bg-red-700 text-white font-bold px-2 py-0.5 rounded-sm shadow-sm">
            -{discountPercent}%
          </Badge>
        )}
        {product.tags?.includes("New") && (
          <Badge className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-2 py-0.5 rounded-sm shadow-sm">
            НОВИНКА
          </Badge>
        )}
      </div>

      {/* Image Wrapper */}
      <Link
        href={`/product/${product.slug}`}
        className="relative aspect-square overflow-hidden bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4"
      >
        {/* Replace img with next/image in production */}
        <img
          src={
            product.thumbImage ||
            "https://picsum.photos/seed/placeholder/400/400"
          }
          alt={product.name}
          className={`object-contain w-full h-full transition-transform duration-500 group-hover:scale-105 ${isOutOfStock ? "opacity-50 grayscale" : ""}`}
        />
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-slate-900/80 text-white px-4 py-2 rounded-md font-bold uppercase tracking-wider backdrop-blur-sm">
              Нет в наличии
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2 gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {product.brand || "Brand"}
          </span>
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="h-3.5 w-3.5 fill-current" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {product.averageRating > 0
                ? product.averageRating.toFixed(1)
                : "—"}
            </span>
          </div>
        </div>

        <Link href={`/product/${product.slug}`} className="flex-1">
          <h3 className="font-medium text-slate-900 dark:text-slate-100 line-clamp-2 hover:text-blue-600 transition-colors mb-4">
            {product.name}
          </h3>
        </Link>

        {/* Pricing & Add to Cart */}
        <div className="flex items-end justify-between mt-auto pt-2">
          <div className="flex flex-col">
            {discountedPrice ? (
              <>
                <span className="text-xs text-slate-400 line-through decoration-red-500/50">
                  {price.toLocaleString("ru-RU")} ₽
                </span>
                <span className="text-xl font-black text-red-600 dark:text-red-500">
                  {discountedPrice.toLocaleString("ru-RU")} ₽
                </span>
              </>
            ) : (
              <span className="text-xl font-black text-slate-900 dark:text-white">
                {price.toLocaleString("ru-RU")} ₽
              </span>
            )}
          </div>

          <Button
            size="icon"
            disabled={isOutOfStock}
            className={`rounded-full h-10 w-10 shrink-0 transition-transform active:scale-95 ${
              isOutOfStock
                ? "bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-800"
                : "bg-slate-900 hover:bg-blue-600 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-blue-500"
            }`}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
