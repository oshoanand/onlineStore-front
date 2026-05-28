"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowLeft,
  Percent,
  Truck,
  ShieldCheck,
} from "lucide-react";
import { useCartStore, CartItem } from "@/store/useCartStore";
import { SadBagIcon } from "@/components/ui/icons";

export default function CartPage() {
  const [mounted, setMounted] = useState(false);

  // Получаем функции и состояние из Zustand
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const getTotal = useCartStore((state) => state.getTotal);

  // Ждем монтирования компонента на клиенте, чтобы избежать ошибок гидратации (из-за persist middleware)
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#F5F6F8] dark:bg-slate-950 flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-500 animate-pulse">
          Загрузка корзины...
        </p>
      </div>
    );
  }

  const totalItemsCount = items.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  // Если корзина пуста, показываем информативный пустой экран
  // Если корзина пуста, показываем информативный пустой экран с грустным пакетом
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F5F6F8] dark:bg-slate-950 flex flex-col items-center justify-center p-4 text-center animate-in fade-in duration-300">
        {/* Легкое фоновое свечение, чтобы иконка смотрелась объемнее */}

        <SadBagIcon className="h-24 w-24 text-slate-400 relative z-10 drop-shadow-sm" />

        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mb-2 uppercase">
          В корзине пока пусто
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mb-8">
          Загляните на главную страницу, чтобы найти интересные товары или
          воспользоваться нашими скидками.
        </p>
        <Link href="/">
          <button className="bg-[#FCE000] hover:bg-[#F2D600] text-black font-bold px-8 py-3.5 rounded-2xl transition-all shadow-sm flex items-center gap-2">
            <ArrowLeft size={16} strokeWidth={2.5} />
            Перейти на главную
          </button>
        </Link>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-[#F5F6F8] dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      <div className="max-w-[1400px] mx-auto">
        {/* Заголовок страницы */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-8">
          <div className="flex items-baseline gap-3">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
              Корзина
            </h1>
            <span className="text-slate-500 dark:text-slate-400 font-medium text-lg">
              {totalItemsCount}{" "}
              {totalItemsCount === 1
                ? "товар"
                : totalItemsCount < 5
                  ? "товара"
                  : "товаров"}
            </span>
          </div>
          <button
            onClick={clearCart}
            className="text-sm font-semibold text-slate-400 hover:text-[#F33939] transition-colors self-start sm:self-auto"
          >
            Очистить корзину
          </button>
        </div>

        {/* Основной контент сетки (Стиль маркетплейса) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* ЛЕВАЯ КОЛОНКА: СПИСОК ТОВАРОВ */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item: CartItem) => (
              <div
                key={item.productId}
                className="bg-white dark:bg-slate-900 rounded-[24px] p-5 flex flex-col sm:flex-row items-center justify-between gap-5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all duration-200"
              >
                {/* Изображение и Название */}
                <div className="flex items-center gap-4 w-full sm:w-auto flex-1">
                  <div className="w-24 h-24 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
                      />
                    ) : (
                      <ShoppingBag className="h-8 w-8 text-slate-200" />
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[12px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                      Товар
                    </span>
                    <h3 className="font-semibold text-[15px] text-slate-900 dark:text-white line-clamp-2 leading-tight">
                      {item.name}
                    </h3>
                  </div>
                </div>

                {/* Управление количеством и ценой */}
                <div className="flex items-center justify-between sm:justify-end gap-8 w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800">
                  {/* Кнопки инкремента/декремента количества */}
                  <div className="flex items-center border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl p-1">
                    <button
                      onClick={() =>
                        item.quantity > 1
                          ? updateQuantity(item.productId, item.quantity - 1)
                          : removeItem(item.productId)
                      }
                      className="p-2 hover:bg-white dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 rounded-lg transition-all"
                    >
                      <Minus size={14} strokeWidth={2.5} />
                    </button>
                    <span className="w-10 text-center font-bold text-sm text-slate-900 dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity + 1)
                      }
                      className="p-2 hover:bg-white dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 rounded-lg transition-all"
                    >
                      <Plus size={14} strokeWidth={2.5} />
                    </button>
                  </div>

                  {/* Блок расчетной стоимости */}
                  <div className="flex flex-col text-right min-w-[100px]">
                    <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
                      {(item.price * item.quantity).toLocaleString("ru-RU")} ₽
                    </span>
                    {item.quantity > 1 && (
                      <span className="text-[11px] text-slate-400 font-medium mt-1">
                        {item.price.toLocaleString("ru-RU")} ₽ / шт.
                      </span>
                    )}
                  </div>

                  {/* Кнопка удаления */}
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="p-2.5 text-slate-300 hover:text-[#F33939] hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors hidden sm:block"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ПРАВАЯ КОЛОНКА: СВОДКА И ОФОРМЛЕНИЕ ЗАКАЗА */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-[28px] p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col">
              <h2 className="text-xl font-black mb-5 tracking-tight text-slate-900 dark:text-white uppercase">
                Итоги заказа
              </h2>

              {/* Ценовая аналитика */}
              <div className="space-y-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                <div className="flex justify-between text-sm font-medium text-slate-500">
                  <span>Товары ({totalItemsCount} шт.)</span>
                  <span className="text-slate-900 dark:text-white font-semibold">
                    {getTotal().toLocaleString("ru-RU")} ₽
                  </span>
                </div>
                <div className="flex justify-between text-sm font-medium text-slate-500">
                  <span>Доставка</span>
                  <span className="text-[#00B15C] font-bold flex items-center gap-1">
                    <Truck size={14} /> Бесплатно
                  </span>
                </div>
              </div>

              {/* Итоговый ценник */}
              <div className="flex items-baseline justify-between mb-6">
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  Итого к оплате:
                </span>
                <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {getTotal().toLocaleString("ru-RU")} ₽
                </span>
              </div>

              {/* Кнопка действия в стиле Яндекса */}
              <Link href="/checkout" className="w-full">
                <button className="w-full bg-[#FCE000] hover:bg-[#F2D600] active:scale-[0.99] text-black font-black py-4 rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 text-base">
                  Перейти к оформлению
                </button>
              </Link>
            </div>

            {/* Дополнительный блок доверия (Стиль престижного ритейла) */}
            <div className="bg-white dark:bg-slate-900 rounded-[24px] p-5 border border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#E8F0FE] text-[#005BFF] rounded-xl shrink-0">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wide">
                    Безопасная сделка
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                    Ваши платежные данные надежно защищены шифрованием SSL.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
