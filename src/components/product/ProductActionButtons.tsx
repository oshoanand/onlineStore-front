"use client";

import { motion } from "framer-motion";
import { Heart, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useFavoriteStore } from "@/store/useFavoriteStore";

export default function ProductActionButtons({ product }: { product: any }) {
  const addItem = useCartStore((state) => state.addItem);
  const { toggleFavorite, isFavorite } = useFavoriteStore();
  const favorite = isFavorite(product.id);

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageThumbUrl,
    });
    // Here you could also trigger a toast notification!
  };

  return (
    <div className="flex gap-4 mt-auto">
      <motion.button
        whileTap={{ scale: 0.95 }}
        disabled={product.inventory <= 0}
        onClick={handleAddToCart}
        className="flex-1 bg-brand-primary text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-brand-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ShoppingCart size={24} />
        {product.inventory > 0 ? "Add to Cart" : "Out of Stock"}
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => toggleFavorite(product.id)}
        className={`p-4 rounded-xl border-2 flex items-center justify-center transition-colors ${
          favorite
            ? "border-red-500 bg-red-50 text-red-500"
            : "border-slate-200 text-slate-400 hover:border-red-500 hover:text-red-500"
        }`}
      >
        <Heart size={24} className={favorite ? "fill-current" : ""} />
      </motion.button>
    </div>
  );
}
