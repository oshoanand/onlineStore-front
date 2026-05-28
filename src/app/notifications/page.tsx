"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useNotification } from "@/components/providers/NotificationProvider";
import {
  Bell,
  CheckCheck as CheckAll,
  Package,
  MessageSquare,
  AlertTriangle,
  Info,
  Circle,
} from "lucide-react";
import { NotificationItem } from "@/types/notification";

// Helper to format date into "2 hours ago", "Just now", etc.
const timeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (seconds < 60) return "Только что";
  if (minutes < 60) return `${minutes} мин. назад`;
  if (hours < 24) return `${hours} ч. назад`;
  if (days === 1) return "Вчера";
  if (days < 7) return `${days} дн. назад`;

  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
};

// Map notification types to modern UI icons and colors
const getNotificationStyle = (type: string) => {
  switch (type) {
    case "ORDER":
      return {
        icon: Package,
        bg: "bg-blue-100 dark:bg-blue-900/30",
        color: "text-blue-600 dark:text-blue-400",
      };
    case "CHAT":
      return {
        icon: MessageSquare,
        bg: "bg-green-100 dark:bg-green-900/30",
        color: "text-green-600 dark:text-green-400",
      };
    case "ALERT":
    case "SYSTEM_ALERT":
      return {
        icon: AlertTriangle,
        bg: "bg-red-100 dark:bg-red-900/30",
        color: "text-red-600 dark:text-red-400",
      };
    default:
      return {
        icon: Info,
        bg: "bg-slate-100 dark:bg-slate-800",
        color: "text-slate-600 dark:text-slate-400",
      };
  }
};

export default function NotificationsPage() {
  const router = useRouter();
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotification();

  const handleNotificationClick = (notification: NotificationItem) => {
    // 1. Optimistically mark as read in the background
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    // 2. Redirect if a deep link is provided
    if (notification.link) {
      router.push(notification.link);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
            Уведомления
          </h1>
          {unreadCount > 0 && (
            <span className="bg-[#F33939] text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
              {unreadCount} новых
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#005BFF] transition-colors bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm active:scale-95"
          >
            <CheckAll size={16} /> Прочитать все
          </button>
        )}
      </div>

      {/* Empty State */}
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
          <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
            <Bell size={40} className="text-slate-300 dark:text-slate-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
            У вас нет уведомлений
          </h2>
          <p className="text-slate-500 font-medium max-w-sm">
            Здесь будут появляться сообщения о статусе заказов, ответы поддержки
            и системные оповещения.
          </p>
        </div>
      ) : (
        /* Notifications List */
        <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          {notifications.map((notification) => {
            const style = getNotificationStyle(notification.type);
            const Icon = style.icon;

            return (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`relative flex items-start gap-4 p-5 sm:p-6 cursor-pointer transition-all border-b border-slate-50 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                  !notification.isRead
                    ? "bg-blue-50/30 dark:bg-blue-900/10"
                    : ""
                }`}
              >
                {/* Unread Indicator Dot */}
                {!notification.isRead && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#005BFF] rounded-r-md"></div>
                )}

                {/* Icon Circle */}
                <div
                  className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${style.bg} ${style.color}`}
                >
                  <Icon size={22} strokeWidth={2.5} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3
                      className={`text-base font-bold truncate ${!notification.isRead ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"}`}
                    >
                      {notification.title}
                    </h3>
                  </div>
                  <p
                    className={`text-sm leading-relaxed mb-2 ${!notification.isRead ? "text-slate-700 dark:text-slate-300 font-medium" : "text-slate-500 dark:text-slate-400"}`}
                  >
                    {notification.message}
                  </p>
                  <p className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                    {timeAgo(notification.createdAt)}
                  </p>
                </div>

                {/* Action Arrow/Indicator */}
                {notification.link && (
                  <div className="shrink-0 flex flex-col items-center justify-center h-full text-slate-300">
                    {!notification.isRead && (
                      <Circle
                        fill="currentColor"
                        className="text-[#005BFF] w-2.5 h-2.5 mb-2"
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
