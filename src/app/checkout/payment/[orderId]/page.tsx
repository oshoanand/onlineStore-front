"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { Loader2, ShieldCheck } from "lucide-react";
import { useSession } from "next-auth/react";
import StripeCheckoutForm from "./StripeCheckoutForm";

// Initialize Stripe outside of component render to avoid recreating the object
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

export default function PaymentPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const { data: session } = useSession();

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch if we have the orderId and the user is authenticated
    if (orderId && session?.user?.id) {
      const fetchPaymentIntent = async () => {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/payments/${orderId}/intent`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                // Pass the user ID or Bearer token as expected by your requireAuth middleware
                "x-user-id": session.user.id,
              },
            },
          );

          const data = await res.json();

          if (data.status === "success" && data.data.clientSecret) {
            setClientSecret(data.data.clientSecret);
          } else {
            setError(data.message || "Не удалось инициализировать оплату");
          }
        } catch (err) {
          setError("Ошибка соединения с платежным шлюзом");
        }
      };

      fetchPaymentIntent();
    }
  }, [orderId, session]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#F5F6F8] dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-red-100 dark:border-red-900 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Ошибка оплаты
          </h2>
          <p className="text-slate-500 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-[#F5F6F8] dark:bg-slate-950 flex flex-col items-center justify-center gap-4">
        <Loader2 size={36} className="animate-spin text-[#005BFF]" />
        <p className="text-slate-500 font-medium animate-pulse">
          Подготовка безопасного шлюза...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F6F8] dark:bg-slate-950 flex flex-col items-center justify-center p-4 py-12">
      <div className="bg-white dark:bg-slate-900 rounded-[28px] shadow-xl shadow-slate-200/50 dark:shadow-black/50 p-6 sm:p-10 max-w-[480px] w-full border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-[#005BFF] rounded-full flex items-center justify-center mb-4">
            <ShieldCheck size={24} strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Оплата заказа
          </h1>
          <p className="text-sm font-bold text-slate-400 mt-1">
            Заказ #{orderId}
          </p>
        </div>

        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: "stripe",
              variables: {
                colorPrimary: "#005BFF",
                borderRadius: "12px",
              },
            },
          }}
        >
          <StripeCheckoutForm orderId={orderId} />
        </Elements>
      </div>
    </div>
  );
}
