"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, PackageSearch, SearchX, ShoppingCart } from "lucide-react";

import { searchProductsFull, SearchFullResponse } from "@/services/search";
import { getImageUrl } from "@/utils/image";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<SearchFullResponse | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const results = await searchProductsFull({
          q: query,
          category: category,
          limit: 24,
        });
        setData(results);
      } catch (error) {
        console.error("Failed to load search results", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [query, category]);

  const pageTitle = query
    ? `Результаты поиска: "${query}"`
    : category
      ? `Категория`
      : "Все товары";

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header Section */}
        <div className="mb-8 border-b border-slate-200 dark:border-white/10 pb-6">
          <h1 className="text-3xl font-black text-foreground tracking-tight">
            {pageTitle}
          </h1>
          {!isLoading && data && (
            <p className="text-slate-500 font-medium mt-2">
              Найдено {data.total || data.products?.length || 0} товаров
            </p>
          )}
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-brand-primary animate-spin mb-4" />
            <p className="text-slate-500 font-medium">
              Ищем лучшие предложения...
            </p>
          </div>
        ) : !data || !data.products || data.products.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center bg-brand-surface dark:bg-brand-muted border border-slate-200 dark:border-white/5 rounded-3xl shadow-sm">
            <div className="w-24 h-24 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
              <SearchX className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Ничего не найдено
            </h2>
            <p className="text-slate-500 max-w-md mx-auto mb-8">
              К сожалению, по вашему запросу "{query || category}" нет
              результатов. Попробуйте изменить формулировку или поискать в
              других категориях.
            </p>
            <Link
              href="/"
              className="px-8 py-3.5 bg-brand-primary hover:bg-brand-primary-hover text-white font-bold rounded-xl shadow-lg shadow-brand-primary/20 transition-all active:scale-95"
            >
              Вернуться на главную
            </Link>
          </div>
        ) : (
          /* Product Grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {data.products.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                className="group flex flex-col bg-brand-surface dark:bg-brand-muted border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-brand-primary/5 transition-all"
              >
                {/* Product Image */}
                <div className="aspect-square bg-slate-50 dark:bg-black/20 relative overflow-hidden">
                  {product.thumbImage ? (
                    <img
                      src={getImageUrl(product.thumbImage)}
                      alt={product.name}
                      className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <PackageSearch size={40} strokeWidth={1} />
                    </div>
                  )}
                  {/* Discount Badge */}
                  {product.discountedPrice && (
                    <div className="absolute top-3 left-3 bg-brand-secondary text-brand-muted text-xs font-black px-2 py-1 rounded-lg shadow-sm">
                      Скидка
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-sm font-bold text-foreground line-clamp-2 mb-2 group-hover:text-brand-primary transition-colors">
                    {product.name}
                  </h3>

                  <div className="mt-auto pt-2 flex items-center justify-between">
                    <div>
                      <div className="text-lg font-black text-brand-primary">
                        {Number(
                          product.discountedPrice || product.price,
                        ).toLocaleString("ru-RU")}{" "}
                        ₽
                      </div>
                      {product.discountedPrice && (
                        <div className="text-xs text-slate-400 font-medium line-through">
                          {Number(product.price).toLocaleString("ru-RU")} ₽
                        </div>
                      )}
                    </div>

                    {/* Fake Add to Cart Button for UI completeness */}
                    <button className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-brand-primary hover:text-white transition-colors active:scale-90">
                      <ShoppingCart size={18} />
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
