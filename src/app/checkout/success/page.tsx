"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, Package, ChevronRight, ShoppingBag } from "lucide-react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");

  // React-use hook safely grabs the dimensions for the confetti canvas
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(true);

  // Stop the confetti generator after 6 seconds so it falls cleanly off-screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 6000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-[85vh] bg-[#F5F6F8] dark:bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Paper Wafer Animation */}
      <Confetti
        width={width}
        height={height}
        recycle={showConfetti}
        numberOfPieces={400}
        gravity={0.15}
        colors={["#FCE000", "#005BFF", "#00B15C", "#F33939", "#FFFFFF"]}
        className="z-50 pointer-events-none"
      />

      <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800 p-8 sm:p-12 max-w-lg w-full text-center relative z-10 animate-in slide-in-from-bottom-8 fade-in duration-500">
        {/* Success Icon */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 bg-[#00B15C]/20 rounded-full animate-ping opacity-75"></div>
          <div className="relative w-full h-full bg-[#00B15C] text-white rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
            <CheckCircle2 size={48} strokeWidth={2.5} />
          </div>
        </div>

        <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">
          Спасибо за заказ!
        </h1>

        <p className="text-slate-500 dark:text-slate-400 font-medium text-base mb-8 leading-relaxed">
          Ваш заказ успешно оформлен. Мы уже начали его собирать и скоро
          передадим в доставку.
        </p>

        {/* Order Details Card */}
        {orderId && (
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 mb-8 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-left">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center shadow-sm">
                <Package size={20} className="text-[#005BFF]" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                  Номер заказа
                </p>
                <p className="text-lg font-black text-slate-900 dark:text-white">
                  {orderId}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => router.push("/profile/orders")}
            className="w-full bg-[#FCE000] hover:bg-[#F2D600] active:scale-[0.98] text-black font-black py-4.5 rounded-2xl transition-all flex items-center justify-center gap-2 text-lg shadow-sm"
          >
            Отследить заказ <ChevronRight size={20} strokeWidth={2.5} />
          </button>

          <button
            onClick={() => router.push("/")}
            className="w-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold py-4.5 rounded-2xl transition-all flex items-center justify-center gap-2 text-[15px] border-2 border-slate-100 dark:border-slate-700"
          >
            <ShoppingBag size={18} /> Вернуться к покупкам
          </button>
        </div>
      </div>
    </div>
  );
}
