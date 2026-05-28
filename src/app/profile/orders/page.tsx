"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useUserOrders } from "@/services/order";
import {
  Package,
  ChevronDown,
  MapPin,
  CreditCard,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  AlertCircle,
} from "lucide-react";

// Helper function to map backend status to UI colors and Russian text
const getStatusConfig = (status: string) => {
  switch (status) {
    case "PENDING":
    case "AWAITING_PAYMENT":
      return {
        color:
          "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
        label: "Ожидает",
        icon: Clock,
      };
    case "CONFIRMED":
      return {
        color:
          "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        label: "Подтвержден",
        icon: CheckCircle2,
      };
    case "SHIPPED":
    case "OUT_FOR_DELIVERY":
      return {
        color:
          "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
        label: "В пути",
        icon: Truck,
      };
    case "DELIVERED":
      return {
        color:
          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        label: "Доставлен",
        icon: Package,
      };
    case "CANCELLED":
      return {
        color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        label: "Отменен",
        icon: XCircle,
      };
    default:
      return {
        color:
          "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
        label: status,
        icon: AlertCircle,
      };
  }
};

export default function OrdersPage() {
  const { status } = useSession();

  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const { data: orders = [], isLoading } = useUserOrders();

  if (isLoading || status === "loading") {
    return <p>Загрузка заказов...</p>;
  }

  const toggleAccordion = (id: string) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-[#005BFF] rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium">Загрузка заказов...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 p-8">
        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
          <Package size={32} className="text-slate-400" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
          У вас пока нет заказов
        </h2>
        <p className="text-slate-500 max-w-sm">
          Сделайте свой первый заказ, и он появится здесь для отслеживания
          статуса.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase mb-8">
        Мои заказы
      </h1>

      <div className="space-y-4">
        {orders.map((order) => {
          const statusConfig = getStatusConfig(order.status);
          const isExpanded = expandedOrderId === order.id;
          const isCashOnDelivery = order.paymentType === "POSTPAID";

          return (
            <div
              key={order.id}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[24px] overflow-hidden transition-all shadow-sm hover:shadow-md"
            >
              {/* Order Header (Always Visible) */}
              <div
                onClick={() => toggleAccordion(order.id)}
                className="p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 select-none"
              >
                <div className="flex items-start gap-5">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${statusConfig.color.split(" ")[0]} text-${statusConfig.color.split(" ")[1]}`}
                  >
                    <statusConfig.icon size={24} strokeWidth={2.5} />
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                        Заказ #{order.orderId}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${statusConfig.color}`}
                      >
                        {statusConfig.label}
                      </span>
                    </div>
                    <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                      {order.totalAmount.toLocaleString("ru-RU")} ₽
                    </p>
                    <p className="text-xs text-slate-400 mt-1 font-medium">
                      Оформлен: {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4 pl-19 md:pl-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-1.5 justify-end">
                      <MapPin size={14} className="text-slate-400" />{" "}
                      {order.shippingAddress.city}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Товаров:{" "}
                      {order.items.reduce(
                        (acc, item) => acc + item.quantity,
                        0,
                      )}
                    </p>
                  </div>
                  <button className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <ChevronDown
                      size={20}
                      className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                    />
                  </button>
                </div>
              </div>

              {/* Order Details Accordion (Expandable) */}
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  isExpanded
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="p-6 pt-0 border-t border-slate-100 dark:border-slate-800 mt-2">
                    {/* Secure PIN Alert for Delivery */}
                    {(order.status === "OUT_FOR_DELIVERY" ||
                      order.status === "CONFIRMED") && (
                      <div className="mb-6 mt-6 bg-[#E8F0FE] dark:bg-blue-900/20 text-[#005BFF] dark:text-blue-400 p-4 rounded-2xl flex items-start gap-3 border border-blue-100 dark:border-blue-900/30">
                        <CheckCircle2 size={24} className="shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold uppercase tracking-wide mb-1">
                            ПИН-код для получения
                          </p>
                          <p className="text-2xl font-black tracking-widest">
                            {order.deliveryAuthCode}
                          </p>
                          <p className="text-xs font-medium mt-1 opacity-80">
                            Назовите этот код курьеру при получении заказа.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                      {/* Left Column: Details & Items */}
                      <div className="space-y-6">
                        {/* Info Cards */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <MapPin size={16} className="text-slate-400 mb-2" />
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Адрес
                            </p>
                            <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-2">
                              {order.shippingAddress.street}
                            </p>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <CreditCard
                              size={16}
                              className="text-slate-400 mb-2"
                            />
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Оплата
                            </p>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                              {order.paymentMethod === "CARD"
                                ? "Карта онлайн"
                                : order.paymentMethod === "SBP"
                                  ? "СБП"
                                  : "Наличные/Карта курьеру"}
                            </p>
                            {isCashOnDelivery &&
                              order.status !== "DELIVERED" && (
                                <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-md mt-1 inline-block">
                                  Не оплачено
                                </span>
                              )}
                          </div>
                        </div>

                        {/* Items List */}
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                            Состав заказа
                          </h4>
                          <div className="space-y-3">
                            {order.items.map((item) => (
                              <div
                                key={item.id}
                                className="flex justify-between items-center text-sm pb-3 border-b border-slate-50 dark:border-slate-800/50 last:border-0"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center font-bold text-xs shrink-0">
                                    {item.quantity}x
                                  </span>
                                  <span className="font-medium text-slate-700 dark:text-slate-300">
                                    {item.productName}
                                  </span>
                                </div>
                                <span className="font-bold text-slate-900 dark:text-white shrink-0">
                                  {(
                                    item.priceAtTime * item.quantity
                                  ).toLocaleString("ru-RU")}{" "}
                                  ₽
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right Column: Tracking History */}
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                          Отслеживание
                        </h4>

                        <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-3 space-y-6">
                          {order.history.map((hist, index) => {
                            const isLatest = index === 0;
                            return (
                              <div key={hist.id} className="relative pl-6">
                                {/* Timeline Dot */}
                                <div
                                  className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-4 border-white dark:border-slate-900 ${isLatest ? "bg-[#005BFF]" : "bg-slate-200 dark:bg-slate-700"}`}
                                ></div>

                                <div>
                                  <p
                                    className={`text-sm font-bold ${isLatest ? "text-slate-900 dark:text-white" : "text-slate-500"}`}
                                  >
                                    {getStatusConfig(hist.newStatus).label}
                                  </p>
                                  <p className="text-xs text-slate-400 mt-1 mb-1.5">
                                    {formatDate(hist.createdAt)}
                                  </p>
                                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                    {hist.notes}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
