"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, ShieldCheck, CreditCard, ShoppingBag } from "lucide-react";

// State & Services
import { useCartStore } from "@/store/useCartStore";
import { useCreateOrder } from "@/services/order";

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCartStore();
  const { data: session, status } = useSession();
  const router = useRouter();

  // Local state for the shipping form
  const [address, setAddress] = useState({
    street: "",
    city: "",
    zip: "",
    phone: "",
  });

  // ✨ React Query Mutation from our centralized order.ts service
  const { mutate: placeOrder, isPending } = useCreateOrder(
    (data) => {
      // On Success: Clear cart and redirect to profile
      clearCart();
      router.push(`/profile?success=true`);
    },
    (error) => {
      // On Error: Log or trigger a toast notification
      console.error("Order failed:", error.message);
      alert("Failed to place order. Please try again.");
    },
  );

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();

    // Security check: If session is lost, send to login and bounce back to checkout
    if (status === "unauthenticated" || !session) {
      router.push("/login?callbackUrl=/checkout");
      return;
    }

    // Trigger the React Query mutation
    placeOrder({
      items: items.map((i) => ({
        productId: i.productId,
        productName: i.name,
        quantity: i.quantity,
        priceAtTime: i.price,
      })),
      shippingAddress: address,
    });
  };

  // --- EMPTY CART STATE ---
  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag size={40} className="text-slate-300" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-2">
          Your cart is empty
        </h1>
        <p className="text-slate-500 mb-8 text-center max-w-sm">
          Looks like you haven't added any fresh catch to your cart yet.
        </p>
        <Link
          href="/"
          className="bg-brand-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-secondary transition-colors"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  // --- CHECKOUT UI ---
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <Link
        href="/cart"
        className="inline-flex items-center gap-2 text-slate-500 hover:text-brand-primary font-medium mb-8 transition-colors"
      >
        <ArrowLeft size={18} /> Back to Cart
      </Link>

      <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-8 tracking-tight">
        Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* LEFT COLUMN: Shipping Form */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handlePlaceOrder}
            className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                Shipping Details
              </h2>
              {status === "unauthenticated" && (
                <Link
                  href="/login?callbackUrl=/checkout"
                  className="text-sm text-brand-primary font-bold hover:underline"
                >
                  Log in for faster checkout
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Street Address
                </label>
                <input
                  required
                  type="text"
                  value={address.street}
                  onChange={(e) =>
                    setAddress({ ...address, street: e.target.value })
                  }
                  placeholder="123 Main St, Apt 4B"
                  className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  City
                </label>
                <input
                  required
                  type="text"
                  value={address.city}
                  onChange={(e) =>
                    setAddress({ ...address, city: e.target.value })
                  }
                  placeholder="Mumbai"
                  className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Zip / Postal Code
                </label>
                <input
                  required
                  type="text"
                  value={address.zip}
                  onChange={(e) =>
                    setAddress({ ...address, zip: e.target.value })
                  }
                  placeholder="400001"
                  className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Phone Number
                </label>
                <input
                  required
                  type="tel"
                  value={address.phone}
                  onChange={(e) =>
                    setAddress({ ...address, phone: e.target.value })
                  }
                  placeholder="+91 98765 43210"
                  className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                />
              </div>
            </div>

            <hr className="border-slate-100 mb-6" />

            {/* Payment Method Preview */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Payment Method
              </h2>
              <div className="flex items-center gap-4 p-4 border-2 border-brand-primary bg-brand-primary/5 rounded-xl cursor-pointer">
                <div className="w-6 h-6 rounded-full border-4 border-brand-primary bg-white flex-shrink-0" />
                <CreditCard className="text-brand-primary" />
                <span className="font-bold text-brand-primary">
                  Pay securely via Gateway
                </span>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              disabled={isPending || status === "loading"}
              type="submit"
              className="w-full bg-brand-primary text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20 hover:bg-brand-secondary transition-all"
            >
              {isPending ? (
                <>Processing Order...</>
              ) : (
                <>Place Order • ₹{getTotal()}</>
              )}
            </motion.button>

            <p className="text-center text-xs text-slate-400 font-medium mt-4 flex items-center justify-center gap-1">
              <ShieldCheck size={14} /> Encrypted & Secure Checkout
            </p>
          </form>
        </div>

        {/* RIGHT COLUMN: Order Summary */}
        <div className="lg:col-span-5">
          <div className="bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-100 sticky top-24">
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              Order Summary
            </h2>

            <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-4 items-center">
                  <div className="relative w-16 h-16 rounded-xl bg-white border border-slate-100 overflow-hidden flex-shrink-0">
                    <Image
                      src={item.imageUrl || "/placeholder.png"}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-sm text-slate-500">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="font-bold text-slate-900">
                    ₹{item.price * item.quantity}
                  </div>
                </div>
              ))}
            </div>

            <hr className="border-slate-200 mb-6" />

            <div className="space-y-3 text-sm font-medium text-slate-600 mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{getTotal()}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-green-600 font-bold">Free</span>
              </div>
            </div>

            <hr className="border-slate-200 mb-6" />

            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-slate-900">Total</span>
              <span className="text-3xl font-black text-brand-primary">
                ₹{getTotal()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
