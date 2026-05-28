// "use client";

// import { useState, useEffect } from "react";
// import Link from "next/link";
// import { ChevronRight } from "lucide-react";

// // --- MOCK DATA BASED ON YOUR SCREENSHOT ---
// // In production, map your `usePublicCategories` data to a similar structure.
// const MOCK_CATEGORIES = [
//   {
//     id: "cloth",
//     name: "Cloth",
//     groups: [
//       {
//         id: "women",
//         name: "Clothing for women",
//         imageColor: "bg-[#E6EEFB]", // Light blue matching the screenshot
//         items: [
//           "Windbreakers, jackets",
//           "Vests",
//           "Sweatshirts, hoodies, sweatshirts",
//           "Shirts",
//           "T-shirts, long sleeves",
//           "Tops, bras",
//           "Trousers",
//           "Leggings, cycling shorts",
//         ],
//       },
//       {
//         id: "men",
//         name: "Men's clothing",
//         imageColor: "bg-[#E6EEFB]",
//         items: [
//           "Windbreakers, jackets",
//           "Vests",
//           "Sweatshirts, hoodies, sweatshirts",
//           "Shirts",
//           "T-shirts, long sleeves",
//           "Polo",
//           "Trousers",
//           "Tights",
//         ],
//       },
//       {
//         id: "kids",
//         name: "Clothes for children and teenagers",
//         imageColor: "bg-[#E6EEFB]",
//         items: [
//           "Windbreakers, jackets",
//           "Vests",
//           "Sweatshirts, hoodies, sweatshirts",
//           "T-shirts",
//           "Trousers",
//           "Shorts",
//           "Costumes",
//           "Show all >",
//         ],
//       },
//     ],
//   },
//   { id: "shoes", name: "Shoes", groups: [] },
//   { id: "accessories", name: "Accessories", groups: [] },
//   { id: "cycling", name: "Cycling", groups: [] },
//   { id: "scooters", name: "Scooters, roller skates, skateboards", groups: [] },
//   { id: "hiking", name: "Hiking, trekking, camping", groups: [] },
//   { id: "fishing", name: "Fishing, hunting", groups: [] },
//   { id: "beach", name: "Beach, water sports", groups: [] },
//   { id: "running", name: "Running, walking", groups: [] },
//   { id: "football", name: "Football, team sports", groups: [] },
//   { id: "fitness", name: "Exercise equipment, fitness", groups: [] },
//   { id: "swimming", name: "Swimming", groups: [] },
// ];

// export function MegaMenuContent() {
//   // 1. Initialize state with the VERY FIRST category's ID so it's visible immediately
//   const [activeCategoryId, setActiveCategoryId] = useState<string>("");

//   useEffect(() => {
//     if (MOCK_CATEGORIES.length > 0) {
//       setActiveCategoryId(MOCK_CATEGORIES[0].id);
//     }
//   }, []);

//   // Find the active category data based on the hovered ID
//   const activeCategory = MOCK_CATEGORIES.find(
//     (cat) => cat.id === activeCategoryId,
//   );

//   return (
//     <div className="flex h-full w-full bg-white dark:bg-slate-950">
//       {/* ========================================== */}
//       {/* LEFT SIDEBAR: ROOT CATEGORIES              */}
//       {/* ========================================== */}
//       <div className="w-[280px] shrink-0 border-r border-slate-200 dark:border-slate-800 h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar py-4 pr-2">
//         <ul className="flex flex-col space-y-0.5">
//           {MOCK_CATEGORIES.map((category) => {
//             const isActive = category.id === activeCategoryId;
//             return (
//               <li key={category.id}>
//                 <Link
//                   href={`/category/${category.id}`}
//                   // 🚨 THE TRIGGER: Change active category on mouse enter (hover)
//                   onMouseEnter={() => setActiveCategoryId(category.id)}
//                   className={`block px-4 py-2.5 text-[15px] rounded-lg transition-colors duration-150 ${
//                     isActive
//                       ? "bg-slate-100 dark:bg-slate-800 font-semibold text-slate-900 dark:text-white"
//                       : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50"
//                   }`}
//                 >
//                   {category.name}
//                 </Link>
//               </li>
//             );
//           })}
//         </ul>
//       </div>

//       {/* ========================================== */}
//       {/* RIGHT CONTENT AREA: SUB-CATEGORIES         */}
//       {/* ========================================== */}
//       <div className="flex-1 h-[calc(100vh-140px)] overflow-y-auto p-8 bg-white dark:bg-slate-950">
//         {activeCategory?.groups && activeCategory.groups.length > 0 ? (
//           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-10">
//             {activeCategory.groups.map((group) => (
//               <div key={group.id} className="flex flex-col">
//                 {/* Visual Banner for the Group (Matches your screenshot) */}
//                 <Link
//                   href={`/category/${activeCategory.id}/${group.id}`}
//                   className="group/banner block mb-4"
//                 >
//                   <div
//                     className={`w-full h-28 rounded-xl ${group.imageColor} dark:bg-slate-800 p-4 relative overflow-hidden transition-transform transform group-hover/banner:scale-[1.02]`}
//                   >
//                     <h3 className="font-semibold text-slate-900 dark:text-white text-lg relative z-10 w-2/3">
//                       {group.name}
//                     </h3>
//                     {/* Placeholder for the model images seen in the screenshot */}
//                     <div className="absolute right-0 bottom-0 w-24 h-24 bg-black/5 dark:bg-white/5 rounded-tl-full rounded-br-xl" />
//                   </div>
//                 </Link>

//                 {/* List of specific items */}
//                 <ul className="flex flex-col space-y-2.5">
//                   {group.items.map((item, idx) => {
//                     const isShowAll = item.includes("Show all");
//                     return (
//                       <li key={idx}>
//                         <Link
//                           href={`/search?q=${item}`}
//                           className={`inline-flex items-center text-[14px] transition-colors ${
//                             isShowAll
//                               ? "text-blue-600 hover:text-blue-800 font-medium mt-1"
//                               : "text-slate-600 dark:text-slate-400 hover:text-brand-primary"
//                           }`}
//                         >
//                           {item}
//                         </Link>
//                       </li>
//                     );
//                   })}
//                 </ul>
//               </div>
//             ))}
//           </div>
//         ) : (
//           /* Empty state if a category has no sub-groups defined yet */
//           <div className="flex h-full items-center justify-center text-slate-400">
//             Select a category to view sub-categories.
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { usePublicCategories } from "@/services/category";
import { getImageUrl } from "@/utils/image";

export function MegaMenuContent() {
  const { data: catResponse, isLoading } = usePublicCategories();

  // Safely extract the raw array from the API response
  const categoryTree = Array.isArray(catResponse)
    ? catResponse
    : (catResponse as any)?.data || [];

  // 1. Initialize state with the VERY FIRST category's ID so it's visible immediately
  const [activeCategoryId, setActiveCategoryId] = useState<string>("");

  useEffect(() => {
    if (categoryTree.length > 0 && !activeCategoryId) {
      setActiveCategoryId(categoryTree[0].id);
    }
  }, [categoryTree, activeCategoryId]);

  // Find the active category data based on the hovered ID
  const activeCategory =
    categoryTree.find((cat: any) => cat.id === activeCategoryId) ||
    categoryTree[0];

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center bg-white dark:bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!categoryTree || categoryTree.length === 0) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center bg-white dark:bg-slate-950 text-slate-500">
        Категории не найдены.
      </div>
    );
  }

  return (
    <div className="flex h-full w-full bg-white dark:bg-slate-950">
      {/* ========================================== */}
      {/* LEFT SIDEBAR: ROOT CATEGORIES              */}
      {/* ========================================== */}
      <div className="w-[280px] shrink-0 border-r border-slate-200 dark:border-slate-800 h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar py-4 pr-2">
        <ul className="flex flex-col space-y-0.5">
          {categoryTree.map((category: any) => {
            const isActive = category.id === activeCategoryId;
            return (
              <li key={category.id}>
                <Link
                  href={`/category/${category.slug}`}
                  // 🚨 THE TRIGGER: Change active category on mouse enter (hover)
                  onMouseEnter={() => setActiveCategoryId(category.id)}
                  className={`block px-4 py-2.5 text-[15px] rounded-lg transition-colors duration-150 ${
                    isActive
                      ? "bg-slate-100 dark:bg-slate-800 font-semibold text-slate-900 dark:text-white"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  {category.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* ========================================== */}
      {/* RIGHT CONTENT AREA: SUB-CATEGORIES         */}
      {/* ========================================== */}
      <div className="flex-1 h-[calc(100vh-140px)] overflow-y-auto p-8 bg-white dark:bg-slate-950">
        {activeCategory?.children && activeCategory.children.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-10">
            {activeCategory.children.map((group: any) => (
              <div key={group.id} className="flex flex-col">
                {/* Visual Banner for the Group */}
                <Link
                  href={`/category/${group.slug}`}
                  className="group/banner block mb-4"
                >
                  <div
                    className={`w-full h-28 rounded-xl dark:bg-slate-800 p-4 relative overflow-hidden transition-transform transform group-hover/banner:scale-[1.02] ${
                      !group.thumbImage ? "bg-[#E6EEFB]" : "bg-slate-100"
                    }`}
                  >
                    <h3 className="font-semibold text-slate-900 dark:text-white text-lg relative z-10 w-2/3 drop-shadow-sm">
                      {group.name}
                    </h3>

                    {/* Render Image if exists, else render the fallback pattern */}
                    {group.thumbImage ? (
                      <div className="absolute inset-y-0 right-0 w-1/2">
                        {/* Gradient overlay to ensure text is readable over the image */}
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-100 dark:from-slate-800 to-transparent z-10" />
                        <img
                          src={getImageUrl(group.thumbImage)}
                          alt={group.name}
                          className="w-full h-full object-cover object-center relative z-0"
                        />
                      </div>
                    ) : (
                      <div className="absolute right-0 bottom-0 w-24 h-24 bg-black/5 dark:bg-white/5 rounded-tl-full rounded-br-xl" />
                    )}
                  </div>
                </Link>

                {/* List of specific sub-sub-categories (items) */}
                <ul className="flex flex-col space-y-2.5">
                  {group.children?.map((item: any) => (
                    <li key={item.id}>
                      <Link
                        href={`/category/${item.slug}`}
                        className="inline-flex items-center text-[14px] transition-colors text-slate-600 dark:text-slate-400 hover:text-brand-primary"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}

                  {/* Append the "Show all" link dynamically if there are children */}
                  {group.children?.length > 0 && (
                    <li>
                      <Link
                        href={`/category/${group.slug}`}
                        className="inline-flex items-center text-[14px] transition-colors text-blue-600 hover:text-blue-800 font-medium mt-1"
                      >
                        Смотреть все &gt;
                      </Link>
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          /* Empty state if a category has no sub-groups defined yet */
          <div className="flex h-full items-center justify-center text-slate-400">
            В этой категории пока нет подкатегорий.
          </div>
        )}
      </div>
    </div>
  );
}
