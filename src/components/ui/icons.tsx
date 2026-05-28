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
