"use client";

import { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Loader2, Lock } from "lucide-react";

export default function StripeCheckoutForm({ orderId }: { orderId: string }) {
  const stripe = useStripe();
  const elements = useElements();

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsLoading(true);
    setMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Stripe will securely redirect the user here upon success
        return_url: `${window.location.origin}/checkout/success?orderId=${orderId}`,
      },
    });

    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(error.message || "Ошибка данных карты");
      } else {
        setMessage(
          "Произошла непредвиденная ошибка. Пожалуйста, попробуйте позже.",
        );
      }
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement id="payment-element" options={{ layout: "tabs" }} />

      {message && (
        <div className="bg-red-50 dark:bg-red-900/10 text-[#F33939] text-sm font-medium text-center p-3 rounded-xl border border-red-100 dark:border-red-900">
          {message}
        </div>
      )}

      <button
        disabled={isLoading || !stripe || !elements}
        id="submit"
        className="w-full bg-[#005BFF] hover:bg-[#004BDB] disabled:bg-slate-200 disabled:text-slate-400 text-white font-black py-4.5 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 text-lg active:scale-[0.98]"
      >
        {isLoading ? (
          <Loader2 className="animate-spin" size={24} />
        ) : (
          <>
            Оплатить безопасно <Lock size={18} strokeWidth={2.5} />
          </>
        )}
      </button>

      <p className="text-[12px] text-slate-400 font-medium text-center flex items-center justify-center gap-1.5 mt-4">
        <Lock size={12} /> Платежи защищены 256-битным шифрованием Stripe
      </p>
    </form>
  );
}
