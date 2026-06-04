// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import {
//   Trash2,
//   Plus,
//   Minus,
//   ShoppingBag,
//   ArrowLeft,
//   Truck,
//   ShieldCheck,
//   ExternalLink,
// } from "lucide-react";
// import { useCartStore, CartItem } from "@/store/useCartStore";
// import { SadBagIcon, EmptyCartKitten } from "@/components/ui/icons";
// import { logMarketplaceClick } from "@/services/analytics";

// export default function CartPage() {
//   const [mounted, setMounted] = useState(false);

//   const items = useCartStore((state) => state.items);
//   const removeItem = useCartStore((state) => state.removeItem);
//   const updateQuantity = useCartStore((state) => state.updateQuantity);
//   const clearCart = useCartStore((state) => state.clearCart);
//   const getTotal = useCartStore((state) => state.getTotal);

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   const handleMarketplaceOutbound = (
//     productId: string,
//     marketplaceName: string,
//     url: string,
//   ) => {
//     // 1. Log the analytics event in the background
//     logMarketplaceClick(productId, marketplaceName);

//     // 2. Open the marketplace in a new tab
//     window.open(url, "_blank", "noopener,noreferrer");
//   };

//   if (!mounted) {
//     return (
//       <div className="min-h-[calc(100vh-80px)] bg-white dark:bg-slate-950 flex flex-col items-center justify-center gap-4">
//         <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
//         <p className="text-sm text-slate-500 animate-pulse">
//           Загрузка корзины...
//         </p>
//       </div>
//     );
//   }

//   const totalItemsCount = items.reduce(
//     (total, item) => total + item.quantity,
//     0,
//   );

//   if (items.length === 0) {
//     return (
//       <div className="min-h-[calc(100vh-130px)] bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-4 text-center animate-in fade-in duration-300">
//         {/* <SadBagIcon className="h-24 w-24 text-slate-400 relative z-10 drop-shadow-sm" /> */}
//         <img
//           src="/images/sadkitty.webp"
//           alt="empty cart"
//           className="h-40 w-40"
//         />

//         <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mb-2 uppercase">
//           В корзине пока пусто
//         </h1>
//         <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mb-8">
//           Загляните на главную страницу, чтобы найти интересные товары или
//           воспользоваться нашими скидками.
//         </p>
//         <Link href="/">
//           <button className="bg-[#FCE000] hover:bg-[#F2D600] text-black font-bold px-8 py-3.5 rounded-2xl transition-all shadow-sm flex items-center gap-2">
//             <ArrowLeft size={16} strokeWidth={2.5} /> Перейти на главную
//           </button>
//         </Link>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-white dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
//       <div className="max-w-350 mx-auto">
//         {/* Header */}
//         <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-8">
//           <div className="flex items-baseline gap-3">
//             <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
//               Корзина
//             </h1>
//             <span className="text-slate-500 dark:text-slate-400 font-medium text-lg">
//               {totalItemsCount}{" "}
//               {totalItemsCount === 1
//                 ? "товар"
//                 : totalItemsCount < 5
//                   ? "товара"
//                   : "товаров"}
//             </span>
//           </div>
//           <button
//             onClick={clearCart}
//             className="text-sm font-semibold text-slate-400 hover:text-[#F33939] transition-colors"
//           >
//             Очистить корзину
//           </button>
//         </div>

//         {/* Main Grid */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
//           {/* LEFT COLUMN: CART ITEMS */}
//           <div className="lg:col-span-2 space-y-4">
//             {items.map((item: CartItem & any) => {
//               // Map available marketplaces for this specific item
//               const marketplaces = [
//                 {
//                   id: "YANDEX_MARKET",
//                   name: "Яндекс Маркет",
//                   url: item.yandexmarketLink,
//                   bgColor: "bg-[#FCE000]",
//                   textColor: "text-black",
//                   hover: "hover:bg-[#F2D600]",
//                 },
//                 {
//                   id: "OZON",
//                   name: "Ozon",
//                   url: item.ozonLink,
//                   bgColor: "bg-[#005BFF]",
//                   textColor: "text-white",
//                   hover: "hover:bg-blue-700",
//                 },
//                 {
//                   id: "WILDBERRIES",
//                   name: "Wildberries",
//                   url: item.wildberriesLink,
//                   bgColor: "bg-[#CB11AB]",
//                   textColor: "text-white",
//                   hover: "hover:bg-[#A30D89]",
//                 },
//                 {
//                   id: "AVITO",
//                   name: "Avito",
//                   url: item.avitoLink,
//                   bgColor: "bg-[#97C93F]",
//                   textColor: "text-white",
//                   hover: "hover:bg-[#85B535]",
//                 },
//                 {
//                   id: "AMAZON",
//                   name: "Amazon",
//                   url: item.amazonLink,
//                   bgColor: "bg-[#FF9900]",
//                   textColor: "text-black",
//                   hover: "hover:bg-[#E68A00]",
//                 },
//               ].filter((mp) => mp.url); // Only keep the ones that have a URL

//               return (
//                 <div
//                   key={item.productId}
//                   className="bg-white dark:bg-slate-900 rounded-[24px] p-5 hover:shadow-sm transition-all duration-200 border border-slate-100 dark:border-slate-800"
//                 >
//                   <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
//                     {/* Image & Title */}
//                     <div className="flex items-center gap-4 w-full sm:w-auto flex-1">
//                       <div className="w-24 h-24 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 overflow-hidden flex items-center justify-center shrink-0">
//                         {item.imageUrl ? (
//                           <img
//                             src={item.imageUrl}
//                             alt={item.name}
//                             className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
//                           />
//                         ) : (
//                           <ShoppingBag className="h-8 w-8 text-slate-200" />
//                         )}
//                       </div>
//                       <div className="flex flex-col gap-1">
//                         <span className="text-[12px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
//                           Товар
//                         </span>
//                         <h3 className="font-semibold text-[15px] text-slate-900 dark:text-white line-clamp-2 leading-tight">
//                           {item.name}
//                         </h3>
//                       </div>
//                     </div>

//                     {/* Quantity & Price */}
//                     <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800">
//                       <div className="flex items-center border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl p-1">
//                         <button
//                           onClick={() =>
//                             item.quantity > 1
//                               ? updateQuantity(
//                                   item.productId,
//                                   item.quantity - 1,
//                                 )
//                               : removeItem(item.productId)
//                           }
//                           className="p-2 hover:bg-white dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 rounded-lg transition-all"
//                         >
//                           <Minus size={14} strokeWidth={2.5} />
//                         </button>
//                         <span className="w-10 text-center font-bold text-sm text-slate-900 dark:text-white">
//                           {item.quantity}
//                         </span>
//                         <button
//                           onClick={() =>
//                             updateQuantity(item.productId, item.quantity + 1)
//                           }
//                           className="p-2 hover:bg-white dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 rounded-lg transition-all"
//                         >
//                           <Plus size={14} strokeWidth={2.5} />
//                         </button>
//                       </div>

//                       <div className="flex flex-col text-right min-w-[90px]">
//                         <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
//                           {(item.price * item.quantity).toLocaleString("ru-RU")}{" "}
//                           ₽
//                         </span>
//                         {item.quantity > 1 && (
//                           <span className="text-[11px] text-slate-400 font-medium mt-1">
//                             {item.price.toLocaleString("ru-RU")} ₽ / шт.
//                           </span>
//                         )}
//                       </div>

//                       <button
//                         onClick={() => removeItem(item.productId)}
//                         className="p-2.5 text-slate-300 hover:text-[#F33939] hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors hidden sm:block"
//                       >
//                         <Trash2 size={18} />
//                       </button>
//                     </div>
//                   </div>

//                   {/* MARKETPLACE QUICK LINKS SECTION */}
//                   {marketplaces.length > 0 && (
//                     <div className="mt-5 pt-4 border-t border-slate-50 dark:border-slate-800/50">
//                       <p className="text-xs font-bold text-slate-400 uppercase mb-2.5 tracking-wider">
//                         Или купите на маркетплейсах:
//                       </p>
//                       <div className="flex flex-wrap gap-2">
//                         {marketplaces.map((mp) => (
//                           <button
//                             key={mp.id}
//                             onClick={() =>
//                               handleMarketplaceOutbound(
//                                 item.productId,
//                                 mp.id,
//                                 mp.url,
//                               )
//                             }
//                             className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${mp.bgColor} ${mp.textColor} ${mp.hover}`}
//                           >
//                             {mp.name}{" "}
//                             <ExternalLink
//                               size={12}
//                               strokeWidth={3}
//                               className="opacity-70"
//                             />
//                           </button>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </div>

//           {/* RIGHT COLUMN: CHECKOUT SUMMARY */}
//           <div className="space-y-4 lg:sticky lg:top-24">
//             <div className="bg-white dark:bg-slate-900 rounded-[28px] p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col">
//               <h2 className="text-xl font-black mb-5 tracking-tight text-slate-900 dark:text-white uppercase">
//                 Итоги заказа
//               </h2>

//               <div className="space-y-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
//                 <div className="flex justify-between text-sm font-medium text-slate-500">
//                   <span>Товары ({totalItemsCount} шт.)</span>
//                   <span className="text-slate-900 dark:text-white font-semibold">
//                     {getTotal().toLocaleString("ru-RU")} ₽
//                   </span>
//                 </div>
//                 <div className="flex justify-between text-sm font-medium text-slate-500">
//                   <span>Доставка</span>
//                   <span className="text-[#00B15C] font-bold flex items-center gap-1">
//                     <Truck size={14} /> Бесплатно
//                   </span>
//                 </div>
//               </div>

//               <div className="flex items-baseline justify-between mb-6">
//                 <span className="text-base font-bold text-slate-900 dark:text-white">
//                   Итого к оплате:
//                 </span>
//                 <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
//                   {getTotal().toLocaleString("ru-RU")} ₽
//                 </span>
//               </div>

//               <Link href="/checkout" className="w-full">
//                 <button className="w-full bg-[#FCE000] hover:bg-[#F2D600] active:scale-[0.99] text-black font-black py-4 rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 text-base">
//                   Перейти к оформлению
//                 </button>
//               </Link>
//             </div>

//             {/* Trust Badge */}
//             <div className="bg-white dark:bg-slate-900 rounded-[24px] p-5 border border-slate-100 dark:border-slate-800 space-y-3">
//               <div className="flex items-start gap-3">
//                 <div className="p-2 bg-[#E8F0FE] text-[#005BFF] rounded-xl shrink-0">
//                   <ShieldCheck size={18} />
//                 </div>
//                 <div>
//                   <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wide">
//                     Безопасная сделка
//                   </h4>
//                   <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">
//                     Ваши платежные данные надежно защищены шифрованием SSL.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowLeft,
  Truck,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { useCartStore, CartItem } from "@/store/useCartStore";
import { EmptyCartKitten } from "@/components/ui/icons"; // Assuming you exported it here
import { logMarketplaceClick } from "@/services/analytics";

export default function CartPage() {
  const [mounted, setMounted] = useState(false);

  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const getTotal = useCartStore((state) => state.getTotal);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMarketplaceOutbound = (
    productId: string,
    marketplaceName: string,
    url: string,
  ) => {
    // 1. Log the analytics event in the background
    logMarketplaceClick(productId, marketplaceName);

    // 2. Open the marketplace in a new tab
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // ==========================================
  // LOADING STATE
  // ==========================================
  if (!mounted) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-background flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold text-slate-500 animate-pulse uppercase tracking-widest">
          Загрузка корзины...
        </p>
      </div>
    );
  }

  const totalItemsCount = items.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  // ==========================================
  // EMPTY CART STATE
  // ==========================================
  if (items.length === 0) {
    return (
      <div className="min-h-[calc(100vh-130px)] bg-background flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="w-48 h-48 bg-brand-surface dark:bg-brand-muted rounded-full flex items-center justify-center shadow-xl shadow-brand-primary/5 mb-8 border border-slate-100 dark:border-white/5 relative">
          {/* Subtle glow behind the kitten */}
          <div className="absolute inset-0 bg-brand-primary/10 rounded-full blur-2xl" />

          <img
            src="/images/sadkitty.webp"
            alt="empty cart"
            className="h-36 w-36 rounded-2xl object-contain"
          />
        </div>

        <h1 className="text-xl md:text-3xl font-black tracking-tight text-foreground mb-3">
          В КОРЗИНЕ ПОКА ПУСТО
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-[12px] font-medium max-w-md mb-10 leading-relaxed">
          Загляните на главную страницу, чтобы найти интересные товары или
          воспользоваться нашими эксклюзивными скидками.
        </p>
        <Link href="/">
          <button className="bg-brand-primary hover:bg-brand-primary-hover active:scale-95 text-white font-bold px-8 py-2 rounded-xl transition-all shadow-lg shadow-brand-primary/30 flex items-center gap-2">
            <ArrowLeft size={18} strokeWidth={2.5} /> Вернуться к покупкам
          </button>
        </Link>
      </div>
    );
  }

  // // ==========================================
  // // ACTIVE CART STATE
  // // ==========================================
  // return (
  //   <div className="min-h-screen bg-background py-8 lg:py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
  //     <div className="max-w-6xl mx-auto">
  //       {/* Header Section */}
  //       <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 lg:mb-10 pb-6 border-b border-slate-200 dark:border-white/10">
  //         <div className="flex items-baseline gap-4">
  //           <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-foreground uppercase">
  //             Корзина
  //           </h1>
  //           <span className="bg-brand-primary text-white font-bold text-sm px-3 py-1 rounded-full shadow-sm">
  //             {totalItemsCount}{" "}
  //             {totalItemsCount === 1
  //               ? "товар"
  //               : totalItemsCount < 5
  //                 ? "товара"
  //                 : "товаров"}
  //           </span>
  //         </div>
  //         <button
  //           onClick={clearCart}
  //           className="text-sm font-bold text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1.5"
  //         >
  //           <Trash2 size={16} /> Очистить корзину
  //         </button>
  //       </div>

  //       {/* Main Layout Grid */}
  //       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
  //         {/* ========================================== */}
  //         {/* LEFT PANE: CART ITEMS LIST                 */}
  //         {/* ========================================== */}
  //         <div className="lg:col-span-8 space-y-4 sm:space-y-6">
  //           {items.map((item: CartItem & any) => {
  //             // Map available marketplaces. Brand colors kept intact for recognition.
  //             const marketplaces = [
  //               {
  //                 id: "YANDEX_MARKET",
  //                 name: "Яндекс Маркет",
  //                 url: item.yandexmarketLink,
  //                 bgColor: "bg-[#FCE000]",
  //                 textColor: "text-black",
  //                 hover: "hover:bg-[#F2D600]",
  //               },
  //               {
  //                 id: "OZON",
  //                 name: "Ozon",
  //                 url: item.ozonLink,
  //                 bgColor: "bg-[#005BFF]",
  //                 textColor: "text-white",
  //                 hover: "hover:bg-blue-700",
  //               },
  //               {
  //                 id: "WILDBERRIES",
  //                 name: "Wildberries",
  //                 url: item.wildberriesLink,
  //                 bgColor: "bg-[#CB11AB]",
  //                 textColor: "text-white",
  //                 hover: "hover:bg-[#A30D89]",
  //               },
  //               {
  //                 id: "AVITO",
  //                 name: "Avito",
  //                 url: item.avitoLink,
  //                 bgColor: "bg-[#97C93F]",
  //                 textColor: "text-white",
  //                 hover: "hover:bg-[#85B535]",
  //               },
  //               {
  //                 id: "AMAZON",
  //                 name: "Amazon",
  //                 url: item.amazonLink,
  //                 bgColor: "bg-[#FF9900]",
  //                 textColor: "text-black",
  //                 hover: "hover:bg-[#E68A00]",
  //               },
  //             ].filter((mp) => mp.url);

  //             return (
  //               <div
  //                 key={item.productId}
  //                 className="bg-brand-surface dark:bg-brand-muted rounded-[24px] p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-slate-200 dark:border-white/5 group"
  //               >
  //                 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
  //                   {/* Item Image & Title */}
  //                   <div className="flex items-center gap-5 w-full sm:w-auto flex-1">
  //                     <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-white/5 overflow-hidden flex items-center justify-center shrink-0 p-2">
  //                       {item.imageUrl ? (
  //                         <img
  //                           src={item.imageUrl}
  //                           alt={item.name}
  //                           className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-105 transition-transform duration-500"
  //                         />
  //                       ) : (
  //                         <ShoppingBag className="h-8 w-8 text-slate-300" />
  //                       )}
  //                     </div>
  //                     <div className="flex flex-col gap-1.5 pr-4">
  //                       <Link
  //                         href={`/product/${item.productId}`}
  //                         className="font-bold text-base sm:text-lg text-foreground line-clamp-2 leading-tight hover:text-brand-primary transition-colors"
  //                       >
  //                         {item.name}
  //                       </Link>
  //                       <span className="text-[13px] font-bold text-slate-400">
  //                         {item.price.toLocaleString("ru-RU")} ₽ / шт.
  //                       </span>
  //                     </div>
  //                   </div>

  //                   {/* Quantity & Price Controls */}
  //                   <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 sm:gap-8 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-white/5 shrink-0">
  //                     {/* Quantity Selector */}
  //                     <div className="flex items-center bg-slate-100 dark:bg-black/20 rounded-xl p-1 border border-slate-200 dark:border-white/5">
  //                       <button
  //                         onClick={() =>
  //                           item.quantity > 1
  //                             ? updateQuantity(
  //                                 item.productId,
  //                                 item.quantity - 1,
  //                               )
  //                             : removeItem(item.productId)
  //                         }
  //                         className="w-8 h-8 flex items-center justify-center bg-white dark:bg-white/10 text-slate-500 hover:text-foreground rounded-lg shadow-sm transition-all active:scale-90"
  //                       >
  //                         <Minus size={16} strokeWidth={2.5} />
  //                       </button>
  //                       <span className="w-10 text-center font-bold text-[15px] text-foreground">
  //                         {item.quantity}
  //                       </span>
  //                       <button
  //                         onClick={() =>
  //                           updateQuantity(item.productId, item.quantity + 1)
  //                         }
  //                         className="w-8 h-8 flex items-center justify-center bg-white dark:bg-white/10 text-slate-500 hover:text-foreground rounded-lg shadow-sm transition-all active:scale-90"
  //                       >
  //                         <Plus size={16} strokeWidth={2.5} />
  //                       </button>
  //                     </div>

  //                     {/* Total Price */}
  //                     <div className="flex flex-col text-right min-w-[100px]">
  //                       <span className="text-xl font-black tracking-tight text-brand-primary leading-none">
  //                         {(item.price * item.quantity).toLocaleString("ru-RU")}{" "}
  //                         ₽
  //                       </span>
  //                     </div>

  //                     {/* Delete Button (Desktop) */}
  //                     <button
  //                       onClick={() => removeItem(item.productId)}
  //                       className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all hidden sm:flex active:scale-90"
  //                       title="Удалить товар"
  //                     >
  //                       <Trash2 size={18} />
  //                     </button>
  //                   </div>
  //                 </div>

  //                 {/* MARKETPLACE QUICK LINKS SECTION */}
  //                 {marketplaces.length > 0 && (
  //                   <div className="mt-5 pt-4 border-t border-slate-100 dark:border-white/5">
  //                     <p className="text-[11px] font-bold text-slate-400 uppercase mb-3 tracking-widest">
  //                       Или купите на маркетплейсах:
  //                     </p>
  //                     <div className="flex flex-wrap gap-2">
  //                       {marketplaces.map((mp) => (
  //                         <button
  //                           key={mp.id}
  //                           onClick={() =>
  //                             handleMarketplaceOutbound(
  //                               item.productId,
  //                               mp.id,
  //                               mp.url,
  //                             )
  //                           }
  //                           className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${mp.bgColor} ${mp.textColor} ${mp.hover}`}
  //                         >
  //                           {mp.name}{" "}
  //                           <ExternalLink
  //                             size={12}
  //                             strokeWidth={3}
  //                             className="opacity-70"
  //                           />
  //                         </button>
  //                       ))}
  //                     </div>
  //                   </div>
  //                 )}
  //               </div>
  //             );
  //           })}
  //         </div>

  //         {/* ========================================== */}
  //         {/* RIGHT PANE: CHECKOUT SUMMARY               */}
  //         {/* ========================================== */}
  //         <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
  //           <div className="bg-brand-surface dark:bg-brand-muted rounded-[32px] p-6 lg:p-8 shadow-xl shadow-brand-primary/5 border border-slate-200 dark:border-white/5 flex flex-col">
  //             <h2 className="text-xl font-black mb-6 tracking-tight text-foreground uppercase">
  //               Итоги заказа
  //             </h2>

  //             <div className="space-y-4 border-b border-slate-200 dark:border-white/10 pb-6 mb-6">
  //               <div className="flex justify-between text-[15px] font-medium text-slate-500 dark:text-slate-400">
  //                 <span>Товары ({totalItemsCount} шт.)</span>
  //                 <span className="text-foreground font-bold">
  //                   {getTotal().toLocaleString("ru-RU")} ₽
  //                 </span>
  //               </div>
  //               <div className="flex justify-between text-[15px] font-medium text-slate-500 dark:text-slate-400">
  //                 <span>Скидка</span>
  //                 <span className="text-brand-primary font-bold">0 ₽</span>
  //               </div>
  //               <div className="flex justify-between text-[15px] font-medium text-slate-500 dark:text-slate-400">
  //                 <span>Доставка</span>
  //                 <span className="text-emerald-500 font-bold flex items-center gap-1.5">
  //                   <Truck size={16} /> Бесплатно
  //                 </span>
  //               </div>
  //             </div>

  //             <div className="flex items-end justify-between mb-8">
  //               <span className="text-base font-bold text-slate-500 dark:text-slate-400">
  //                 Итого:
  //               </span>
  //               <span className="text-3xl lg:text-4xl font-black text-foreground tracking-tight leading-none">
  //                 {getTotal().toLocaleString("ru-RU")} ₽
  //               </span>
  //             </div>

  //             <Link href="/checkout" className="w-full">
  //               <button className="w-full bg-brand-primary hover:bg-brand-primary-hover active:scale-95 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-brand-primary/30 flex items-center justify-center gap-2 text-[15px]">
  //                 Перейти к оформлению
  //               </button>
  //             </Link>
  //           </div>

  //           {/* Trust Badge */}
  //           <div className="bg-brand-surface dark:bg-brand-muted rounded-[24px] p-5 border border-slate-200 dark:border-white/5 flex items-start gap-4 shadow-sm">
  //             <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl shrink-0">
  //               <ShieldCheck size={20} />
  //             </div>
  //             <div>
  //               <h4 className="font-bold text-sm text-foreground uppercase tracking-wide mb-1">
  //                 Безопасная сделка
  //               </h4>
  //               <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
  //                 Ваши платежные данные надежно защищены современными
  //                 стандартами шифрования SSL.
  //               </p>
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );

  // ==========================================
  // ACTIVE CART STATE
  // ==========================================
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 py-8 lg:py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 lg:mb-10 pb-6 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-baseline gap-4">
            <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-foreground uppercase">
              Корзина
            </h1>
            <span className="bg-brand-primary text-white font-bold text-sm px-3 py-1 rounded-full">
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
            className="text-sm font-bold text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1.5"
          >
            <Trash2 size={16} /> Очистить корзину
          </button>
        </div>

        {/* Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* ========================================== */}
          {/* LEFT PANE: CART ITEMS LIST                 */}
          {/* ========================================== */}
          <div className="lg:col-span-8 space-y-4 sm:space-y-6">
            {items.map((item: CartItem & any) => {
              // Map available marketplaces. Brand colors kept intact for recognition.
              const marketplaces = [
                {
                  id: "YANDEX_MARKET",
                  name: "Яндекс Маркет",
                  url: item.yandexmarketLink,
                  bgColor: "bg-[#FCE000]",
                  textColor: "text-black",
                  hover: "hover:bg-[#F2D600]",
                },
                {
                  id: "OZON",
                  name: "Ozon",
                  url: item.ozonLink,
                  bgColor: "bg-[#005BFF]",
                  textColor: "text-white",
                  hover: "hover:bg-blue-700",
                },
                {
                  id: "WILDBERRIES",
                  name: "Wildberries",
                  url: item.wildberriesLink,
                  bgColor: "bg-[#CB11AB]",
                  textColor: "text-white",
                  hover: "hover:bg-[#A30D89]",
                },
                {
                  id: "AVITO",
                  name: "Avito",
                  url: item.avitoLink,
                  bgColor: "bg-[#97C93F]",
                  textColor: "text-white",
                  hover: "hover:bg-[#85B535]",
                },
                {
                  id: "AMAZON",
                  name: "Amazon",
                  url: item.amazonLink,
                  bgColor: "bg-[#FF9900]",
                  textColor: "text-black",
                  hover: "hover:bg-[#E68A00]",
                },
              ].filter((mp) => mp.url);

              return (
                <div
                  key={item.productId}
                  className="bg-white dark:bg-slate-900 rounded-[24px] p-4 sm:p-6 transition-all duration-300 border border-slate-200 dark:border-white/5 group"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                    {/* Item Image & Title */}
                    <div className="flex items-center gap-5 w-full sm:w-auto flex-1">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-white/5 overflow-hidden flex items-center justify-center shrink-0 p-2">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <ShoppingBag className="h-8 w-8 text-slate-300" />
                        )}
                      </div>
                      <div className="flex flex-col gap-1.5 pr-4">
                        <Link
                          href={`/product/${item.productId}`}
                          className="font-bold text-base sm:text-lg text-foreground line-clamp-2 leading-tight hover:text-brand-primary transition-colors"
                        >
                          {item.name}
                        </Link>
                        <span className="text-[13px] font-bold text-slate-400">
                          {item.price.toLocaleString("ru-RU")} ₽ / шт.
                        </span>
                      </div>
                    </div>

                    {/* Quantity & Price Controls */}
                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 sm:gap-8 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-white/5 shrink-0">
                      {/* Quantity Selector */}
                      <div className="flex items-center bg-slate-100 dark:bg-black/20 rounded-xl p-1 border border-slate-200 dark:border-white/5">
                        <button
                          onClick={() =>
                            item.quantity > 1
                              ? updateQuantity(
                                  item.productId,
                                  item.quantity - 1,
                                )
                              : removeItem(item.productId)
                          }
                          className="w-8 h-8 flex items-center justify-center bg-white dark:bg-white/10 text-slate-500 hover:text-foreground rounded-lg transition-all active:scale-90"
                        >
                          <Minus size={16} strokeWidth={2.5} />
                        </button>
                        <span className="w-10 text-center font-bold text-[15px] text-foreground">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity + 1)
                          }
                          className="w-8 h-8 flex items-center justify-center bg-white dark:bg-white/10 text-slate-500 hover:text-foreground rounded-lg transition-all active:scale-90"
                        >
                          <Plus size={16} strokeWidth={2.5} />
                        </button>
                      </div>

                      {/* Total Price */}
                      <div className="flex flex-col text-right min-w-[100px]">
                        <span className="text-xl font-black tracking-tight text-brand-primary leading-none">
                          {(item.price * item.quantity).toLocaleString("ru-RU")}{" "}
                          ₽
                        </span>
                      </div>

                      {/* Delete Button (Desktop) */}
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all hidden sm:flex active:scale-90"
                        title="Удалить товар"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {/* MARKETPLACE QUICK LINKS SECTION */}
                  {marketplaces.length > 0 && (
                    <div className="mt-5 pt-4 border-t border-slate-100 dark:border-white/5">
                      <p className="text-[11px] font-bold text-slate-400 uppercase mb-3 tracking-widest">
                        Или купите на маркетплейсах:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {marketplaces.map((mp) => (
                          <button
                            key={mp.id}
                            onClick={() =>
                              handleMarketplaceOutbound(
                                item.productId,
                                mp.id,
                                mp.url,
                              )
                            }
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${mp.bgColor} ${mp.textColor} ${mp.hover}`}
                          >
                            {mp.name}{" "}
                            <ExternalLink
                              size={12}
                              strokeWidth={3}
                              className="opacity-70"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ========================================== */}
          {/* RIGHT PANE: CHECKOUT SUMMARY               */}
          {/* ========================================== */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
            <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 lg:p-8 border border-slate-200 dark:border-white/5 flex flex-col">
              <h2 className="text-xl font-black mb-6 tracking-tight text-foreground uppercase">
                Итоги заказа
              </h2>

              <div className="space-y-4 border-b border-slate-200 dark:border-white/10 pb-6 mb-6">
                <div className="flex justify-between text-[15px] font-medium text-slate-500 dark:text-slate-400">
                  <span>Товары ({totalItemsCount} шт.)</span>
                  <span className="text-green-700 font-bold">
                    {getTotal().toLocaleString("ru-RU")} ₽
                  </span>
                </div>
                <div className="flex justify-between text-[15px] font-medium text-slate-500 dark:text-slate-400">
                  <span>Доставка</span>
                  <span className="text-green-700 font-bold flex items-center gap-1.5">
                    <Truck size={16} /> По тарифам
                  </span>
                </div>
              </div>

              <div className="flex items-end justify-between mb-4">
                <span className="text-base font-bold text-slate-500 dark:text-slate-400">
                  Итого:
                </span>
                <span className="text-3xl lg:text-4xl font-black text-foreground tracking-tight leading-none">
                  {getTotal().toLocaleString("ru-RU")} ₽
                </span>
              </div>

              <p className="text-[11px] text-green-700 font-bold dark:text-slate-400 mb-6 text-center leading-relaxed">
                Итоговая стоимость доставки будет рассчитана на следующем шаге
                при оформлении заказа
              </p>

              <Link href="/checkout" className="w-full">
                <button className="w-full bg-brand-primary hover:bg-brand-primary-hover active:scale-95 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-[15px]">
                  Перейти к оформлению
                </button>
              </Link>
            </div>

            {/* Trust Badge */}
            <div className="bg-white dark:bg-slate-900 rounded-[24px] p-5 border border-slate-200 dark:border-white/5 flex items-start gap-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground uppercase tracking-wide mb-1">
                  Безопасная сделка
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Ваши платежные данные надежно защищены современными
                  стандартами шифрования SSL.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
