"use client";

import { clsx } from "clsx";

interface EmptyCartKittenProps {
  className?: string;
  size?: number | string;
  strokeWidth?: number;
}

export const SadBagIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Ручки пакета */}
    <path d="M8 6V4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v2" />

    {/* Тело пакета */}
    <rect width="16" height="14" x="4" y="6" rx="2" />

    {/* Глазки (стандартный паттерн Lucide для точек) */}
    <line x1="9" y1="12" x2="9.01" y2="12" />
    <line x1="15" y1="12" x2="15.01" y2="12" />

    {/* Идеально симметричная грустная улыбка */}
    <path d="M9 16 Q 12 13 15 16" />
  </svg>
);

export function EmptyCartKitten({
  className,
  size = 120,
  strokeWidth = 1.5,
}: EmptyCartKittenProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={clsx("text-slate-400 dark:text-slate-500", className)}
    >
      {/* 1. Kitten Head */}
      <path d="M 8 12 C 8 6.5, 16 6.5, 16 12" />

      {/* 2. Droopy Ears */}
      <path d="M 9.5 8 L 8 4.5 L 11.5 6.5" />
      <path d="M 14.5 8 L 16 4.5 L 12.5 6.5" />

      {/* 3. Sad Closed Eyes */}
      <path d="M 9.5 9.5 Q 10.5 8.5 11.5 9.5" />
      <path d="M 12.5 9.5 Q 13.5 8.5 14.5 9.5" />

      {/* 4. Little Nose */}
      <circle cx="12" cy="10.8" r="0.5" fill="currentColor" stroke="none" />

      {/* 5. Whiskers */}
      <path d="M 9 10.5 L 6.5 10" strokeWidth={1} />
      <path d="M 9 11.5 L 6.5 12" strokeWidth={1} />
      <path d="M 15 10.5 L 17.5 10" strokeWidth={1} />
      <path d="M 15 11.5 L 17.5 12" strokeWidth={1} />

      {/* 6. Shopping Cart Base (Trapezoid) */}
      <path d="M 3 12 L 21 12 L 19 19 L 5 19 Z" />

      {/* 7. Cart Handle */}
      <path d="M 21 12 L 23 8.5 L 24 8.5" />

      {/* 8. Cart Wheels */}
      <circle cx="7" cy="21" r="1.5" />
      <circle cx="17" cy="21" r="1.5" />

      {/* 9. Cart Wireframe Grid */}
      <path d="M 7 12 L 8 19" strokeWidth={1} />
      <path d="M 10 12 L 11 19" strokeWidth={1} />
      <path d="M 14 12 L 13 19" strokeWidth={1} />
      <path d="M 17 12 L 16 19" strokeWidth={1} />
      <path d="M 4.5 15.5 L 19.5 15.5" strokeWidth={1} />

      {/* 10. Paws hanging over the edge (Filled to hide the cart lines behind them) */}
      <rect
        x="9.2"
        y="10.8"
        width="2"
        height="3"
        rx="1"
        fill="var(--color-brand-surface, #ffffff)"
      />
      <rect
        x="12.8"
        y="10.8"
        width="2"
        height="3"
        rx="1"
        fill="var(--color-brand-surface, #ffffff)"
      />

      {/* 11. Animated Teardrop */}
      <path
        d="M 10 10.5 C 9.2 12, 9.2 12.5, 10 12.5 C 10.8 12.5, 10.8 12, 10 10.5 Z"
        fill="#0ea5e9"
        stroke="none"
        className="animate-pulse"
      />
    </svg>
  );
}
