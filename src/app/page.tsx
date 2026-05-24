import Link from "next/link";
import {
  ArrowRight,
  ShoppingCart,
  Heart,
  ShieldCheck,
  Truck,
  CreditCard,
  RefreshCw,
  Star,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

// Dummy data to make the frontend look realistic
const POPULAR_CATEGORIES = [
  { id: 1, name: "Кроссовки", image: "👟" },
  { id: 2, name: "Одежда", image: "👕" },
  { id: 3, name: "Тренажеры", image: "🏋️" },
  { id: 4, name: "Туризм", image: "⛺" },
  { id: 5, name: "Единоборства", image: "🥊" },
  { id: 6, name: "Велоспорт", image: "🚴" },
];

const BESTSELLERS = [
  {
    id: "prod-1",
    name: "Кроссовки беговые мужские Nike Air Zoom",
    category: "Бег",
    price: 12499,
    oldPrice: 15999,
    rating: 4.8,
    reviews: 124,
    isNew: false,
    discount: 22,
  },
  {
    id: "prod-2",
    name: "Ветровка женская непродуваемая Columbia",
    category: "Туризм",
    price: 8999,
    oldPrice: null,
    rating: 4.9,
    reviews: 56,
    isNew: true,
    discount: null,
  },
  {
    id: "prod-3",
    name: "Гантели разборные 15 кг SportPro",
    category: "Фитнес",
    price: 3499,
    oldPrice: 4999,
    rating: 4.5,
    reviews: 312,
    isNew: false,
    discount: 30,
  },
  {
    id: "prod-4",
    name: "Спортивный костюм Adidas Essentials",
    category: "Спортивный стиль",
    price: 9999,
    oldPrice: 12999,
    rating: 4.7,
    reviews: 89,
    isNew: false,
    discount: 23,
  },
];

export default function HomePage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 space-y-16 animate-in fade-in duration-500">
      {/* ========================================== */}
      {/* 1. HERO BANNERS AREA                         */}
      {/* ========================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Main Large Banner */}
        <div className="lg:col-span-2 bg-slate-900 rounded-2xl p-8 lg:p-12 flex flex-col justify-center items-start min-h-[400px] relative overflow-hidden text-white shadow-md group cursor-pointer">
          {/* Decorative Background Graphic */}
          <div className="absolute -right-20 -bottom-20 w-[500px] h-[500px] bg-blue-600 rounded-full blur-3xl opacity-30 group-hover:opacity-40 transition-opacity duration-700" />

          <Badge className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-xs font-bold uppercase tracking-wider rounded mb-6 z-10 border-none">
            Мега Распродажа
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 z-10 leading-[1.1] uppercase">
            Летняя <br />
            Коллекция 2026
          </h1>
          <p className="text-slate-300 mb-8 max-w-md z-10 text-lg">
            Скидки до 50% на кроссовки, одежду для бега и аксессуары для
            активного отдыха.
          </p>
          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white text-base px-8 h-12 z-10 font-semibold shadow-lg shadow-blue-900/20"
          >
            Смотреть каталог
          </Button>
        </div>

        {/* Side Banners */}
        <div className="flex flex-col gap-4 lg:gap-6">
          <div className="flex-1 bg-blue-50 dark:bg-blue-950/40 rounded-2xl p-8 flex flex-col justify-center shadow-sm border border-blue-100 dark:border-blue-900/50 group cursor-pointer overflow-hidden relative">
            <div className="z-10">
              <h3 className="text-2xl font-black mb-2 text-blue-900 dark:text-blue-100 uppercase">
                Новинки Nike
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 font-medium">
                Уже в наличии
              </p>
              <Button
                variant="link"
                className="p-0 h-auto justify-start text-blue-600 font-bold group-hover:pl-2 transition-all"
              >
                Перейти <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex-1 bg-red-50 dark:bg-red-950/40 rounded-2xl p-8 flex flex-col justify-center shadow-sm border border-red-100 dark:border-red-900/50 group cursor-pointer overflow-hidden relative">
            <div className="z-10">
              <h3 className="text-2xl font-black mb-2 text-red-900 dark:text-red-100 uppercase">
                Sale -30%
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 font-medium">
                На велосипеды и самокаты
              </p>
              <Button
                variant="link"
                className="p-0 h-auto justify-start text-red-600 font-bold group-hover:pl-2 transition-all"
              >
                Купить <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 2. POPULAR CATEGORIES                        */}
      {/* ========================================== */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-black uppercase tracking-tight">
            Популярные категории
          </h2>
          <Link
            href="/catalog"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 hidden sm:block"
          >
            Все категории &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {POPULAR_CATEGORIES.map((category) => (
            <Link href={`/catalog/${category.id}`} key={category.id}>
              <Card className="hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group bg-slate-50 dark:bg-slate-900/50 border-transparent dark:border-slate-800">
                <CardContent className="p-6 flex flex-col items-center justify-center aspect-square text-center gap-4">
                  <span className="text-4xl grayscale group-hover:grayscale-0 transition-all duration-300 transform group-hover:scale-110">
                    {category.image}
                  </span>
                  <span className="font-bold text-sm text-slate-700 dark:text-slate-200 group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* ========================================== */}
      {/* 3. BESTSELLERS / PRODUCT CARDS               */}
      {/* ========================================== */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
            <Flame className="h-6 w-6 text-red-500 fill-red-500" /> Хиты продаж
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {BESTSELLERS.map((product) => (
            <Card
              key={product.id}
              className="group relative border dark:border-slate-800 hover:shadow-lg transition-all flex flex-col overflow-hidden"
            >
              {/* Product Badges */}
              <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                {product.discount && (
                  <Badge className="bg-red-600 hover:bg-red-700 font-bold px-2 py-0.5 pointer-events-none">
                    -{product.discount}%
                  </Badge>
                )}
                {product.isNew && (
                  <Badge className="bg-blue-600 hover:bg-blue-700 font-bold px-2 py-0.5 pointer-events-none">
                    NEW
                  </Badge>
                )}
              </div>

              {/* Wishlist Button */}
              <button className="absolute top-3 right-3 z-10 p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm text-slate-400 hover:text-red-500 transition-colors">
                <Heart className="h-4 w-4" />
              </button>

              {/* Product Image Placeholder */}
              <div className="aspect-square bg-slate-100 dark:bg-slate-900 w-full relative overflow-hidden flex items-center justify-center">
                <div className="text-slate-300 dark:text-slate-700 font-medium text-sm flex flex-col items-center gap-2 group-hover:scale-105 transition-transform duration-500">
                  <ShoppingCart className="h-12 w-12 opacity-50" />
                  Фото товара
                </div>
              </div>

              {/* Product Info */}
              <CardContent className="p-4 flex flex-col flex-1">
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">
                  {product.category}
                </div>
                <Link
                  href={`/product/${product.id}`}
                  className="font-semibold text-sm line-clamp-2 mb-3 hover:text-blue-600 transition-colors"
                >
                  {product.name}
                </Link>

                <div className="flex items-center gap-1 mb-4 text-xs font-medium text-slate-500">
                  <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                  <span className="text-slate-700 dark:text-slate-300">
                    {product.rating}
                  </span>
                  <span>({product.reviews})</span>
                </div>

                <div className="mt-auto flex items-end justify-between gap-2">
                  <div className="flex flex-col">
                    {product.oldPrice && (
                      <span className="text-xs text-slate-400 line-through mb-0.5">
                        {product.oldPrice.toLocaleString("ru-RU")} ₽
                      </span>
                    )}
                    <span
                      className={`text-lg font-black ${product.discount ? "text-red-600" : "text-slate-900 dark:text-white"}`}
                    >
                      {product.price.toLocaleString("ru-RU")} ₽
                    </span>
                  </div>

                  <Button
                    size="icon"
                    className="h-10 w-10 bg-blue-600 hover:bg-blue-700 text-white shrink-0 shadow-sm"
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ========================================== */}
      {/* 4. STORE BENEFITS                            */}
      {/* ========================================== */}
      <section className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-8 border dark:border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-sm uppercase">Оригинальные бренды</h4>
            <p className="text-xs text-slate-500">
              Только сертифицированная продукция с гарантией качества.
            </p>
          </div>

          <div className="flex flex-col items-center text-center gap-3">
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
              <Truck className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-sm uppercase">Быстрая доставка</h4>
            <p className="text-xs text-slate-500">
              Доставляем заказы курьером и в пункты выдачи по всей РФ.
            </p>
          </div>

          <div className="flex flex-col items-center text-center gap-3">
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
              <RefreshCw className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-sm uppercase">Легкий возврат</h4>
            <p className="text-xs text-slate-500">
              Простой возврат неподошедшего товара в течение 14 дней.
            </p>
          </div>

          <div className="flex flex-col items-center text-center gap-3">
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
              <CreditCard className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-sm uppercase">Безопасная оплата</h4>
            <p className="text-xs text-slate-500">
              Оплачивайте заказы картой онлайн или наличными при получении.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
