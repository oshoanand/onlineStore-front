"use client";

import Link from "next/link";
import { ChevronDown, ChevronRight, Image as ImageIcon } from "lucide-react";
import { usePublicCategories } from "@/services/category";
import { getImageUrl } from "@/utils/image";

// ==========================================
// 1. RECURSIVE CASCADING DROPDOWN
// ==========================================
const CascadingMenu = ({
  items,
  level = 0,
}: {
  items: any[];
  level?: number;
}) => {
  if (!items || items.length === 0) return null;

  const isRoot = level === 0;

  return (
    // 🚨 THE FIX: This outer div acts as an invisible "hover bridge"
    // We use padding (pt-2 or pl-1.5) instead of margins to prevent the hover state from dropping
    <div
      className={`absolute z-50 opacity-0 invisible pointer-events-none transition-all duration-200 ease-out
        ${
          isRoot
            ? "top-full left-0 pt-2.5 translate-y-2" // Dropdown under root nav
            : "top-[-12px] left-full pl-1.5 translate-x-2" // Side-flyout for sub-categories
        }
      `}
    >
      <ul className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] dark:shadow-2xl rounded-xl p-1.5 flex flex-col min-w-[280px]">
        {items.map((item) => (
          // Hovering this <li> reveals its direct <div> child, and animates its position
          <li
            key={item.id}
            className="relative group/nav-item [&:hover>div]:opacity-100 [&:hover>div]:visible [&:hover>div]:pointer-events-auto [&:hover>div]:translate-x-0"
          >
            <Link
              href={`/category/${item.slug}`}
              className="flex items-center justify-between px-3 py-2.5 text-[14px] font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 shrink-0 rounded-md bg-slate-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-100 dark:border-slate-700/50">
                  {item.thumbImage ? (
                    <img
                      src={getImageUrl(item.thumbImage)}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon
                      size={14}
                      className="text-slate-400 dark:text-slate-500"
                    />
                  )}
                </div>
                <span>{item.name}</span>
              </div>

              {item.children && item.children.length > 0 && (
                <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-500 group-hover/nav-item:text-slate-600 dark:group-hover/nav-item:text-slate-300 transition-colors" />
              )}
            </Link>

            {/* Recursively render child categories */}
            <CascadingMenu items={item.children} level={level + 1} />
          </li>
        ))}
      </ul>
    </div>
  );
};

// ==========================================
// 2. MAIN CATEGORY NAVIGATION COMPONENT
// ==========================================
export function CategoryNav() {
  const { data: catResponse, isLoading } = usePublicCategories();

  // Safely handle both direct arrays and wrapped API responses
  const categoryTree = Array.isArray(catResponse)
    ? catResponse
    : (catResponse as any)?.data || [];

  // Loading skeleton state
  if (isLoading) {
    return (
      <div className="hidden lg:flex items-center gap-6 h-14 w-full border-b border-slate-200 dark:border-slate-800 px-4 xl:px-8">
        <div className="animate-pulse bg-slate-200 dark:bg-slate-800 h-5 w-24 rounded"></div>
        <div className="animate-pulse bg-slate-100 dark:bg-slate-900 h-5 w-32 rounded"></div>
        <div className="animate-pulse bg-slate-100 dark:bg-slate-900 h-5 w-24 rounded"></div>
      </div>
    );
  }

  // Show top root categories in the horizontal bar
  const visibleRootCategories = categoryTree.slice(0, 8);

  return (
    <nav className="hidden lg:flex items-center gap-2 h-14 w-full bg-white dark:bg-slate-950 px-4 xl:px-8 relative z-40 border-b border-slate-200/50 dark:border-slate-800/50">
      <div className="flex items-center gap-1 h-full w-full">
        {visibleRootCategories.map((rootCat: any) => (
          // Hovering this Root <div> reveals its direct <div> child, and animates its Y-axis position
          <div
            key={rootCat.id}
            className="relative h-full flex items-center [&:hover>div]:opacity-100 [&:hover>div]:visible [&:hover>div]:pointer-events-auto [&:hover>div]:translate-y-0"
          >
            <Link
              href={`/category/${rootCat.slug}`}
              className="group/link flex items-center gap-1.5 px-3 py-2 text-[14px] font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg transition-all"
            >
              {rootCat.name}
              {rootCat.children?.length > 0 && (
                <ChevronDown className="h-3.5 w-3.5 opacity-40 group-hover/link:opacity-100 transition-all duration-300" />
              )}
            </Link>

            {/* Root Dropdown */}
            {rootCat.children?.length > 0 && (
              <CascadingMenu items={rootCat.children} level={0} />
            )}
          </div>
        ))}

        {categoryTree.length > 8 && (
          <Link
            href="/categories"
            className="flex items-center gap-1.5 px-4 py-2 text-[14px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors ml-auto"
          >
            Все категории
          </Link>
        )}
      </div>
    </nav>
  );
}
