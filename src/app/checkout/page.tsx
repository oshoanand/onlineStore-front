"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { motion } from "framer-motion";
import { apiRequest, ApiError } from "@/services/http/api-client";

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCartStore();
  const { data: session } = useSession();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  // Simple address state (In a real app, use react-hook-form)
  const [address, setAddress] = useState({
    street: "",
    city: "",
    zip: "",
    phone: "",
  });

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return router.push("/login?callbackUrl=/checkout");
    setIsProcessing(true);

    try {
      const { data: order } = await apiRequest<{ data: any }>({
        url: "/orders",
        method: "POST",
        data: {
          items: items.map((i) => ({
            productId: i.productId,
            productName: i.name,
            quantity: i.quantity,
            priceAtTime: i.price,
          })),
          shippingAddress: address,
        },
      });

      if (order) {
        clearCart();
        router.push(`/orders?p=success`);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        console.error("Order failed:", error.message);
        // You could hook this into your Toaster here!
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0)
    return (
      <div className="p-8 text-center text-slate-500">Your cart is empty.</div>
    );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black mb-8">Checkout</h1>

      <form
        onSubmit={handlePlaceOrder}
        className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
      >
        <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <input
            required
            type="text"
            placeholder="Street Address"
            className="col-span-2 p-3 rounded-lg bg-slate-50 border border-slate-200"
            onChange={(e) => setAddress({ ...address, street: e.target.value })}
          />
          <input
            required
            type="text"
            placeholder="City"
            className="p-3 rounded-lg bg-slate-50 border border-slate-200"
            onChange={(e) => setAddress({ ...address, city: e.target.value })}
          />
          <input
            required
            type="text"
            placeholder="Zip Code"
            className="p-3 rounded-lg bg-slate-50 border border-slate-200"
            onChange={(e) => setAddress({ ...address, zip: e.target.value })}
          />
          <input
            required
            type="tel"
            placeholder="Phone Number"
            className="col-span-2 p-3 rounded-lg bg-slate-50 border border-slate-200"
            onChange={(e) => setAddress({ ...address, phone: e.target.value })}
          />
        </div>

        <div className="border-t border-slate-100 pt-4 flex justify-between items-center mb-6">
          <span className="text-lg font-medium text-slate-600">
            Total to Pay:
          </span>
          <span className="text-2xl font-black text-slate-900">
            ₹{getTotal()}
          </span>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          disabled={isProcessing}
          type="submit"
          className="w-full bg-brand-primary text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50"
        >
          {isProcessing ? "Processing..." : "Place Order & Pay"}
        </motion.button>
      </form>
    </div>
  );
}
