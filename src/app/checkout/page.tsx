// "use client";

// import { useState, useEffect } from "react";
// import { useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import {
//   MapPin,
//   CreditCard,
//   Wallet,
//   Smartphone,
//   Tag,
//   CheckCircle2,
//   Plus,
//   Loader2,
//   Truck,
//   AlertCircle,
//   Building2,
//   Map,
//   Pencil,
//   Trash2,
// } from "lucide-react";

// import { useCartStore } from "@/store/useCartStore";
// import {
//   fetchUserProfile,
//   addNewAddress,
//   updateAddress,
//   deleteAddress,
//   calculateShippingCost,
//   placeOrder,
//   Address,
//   OrderPayload,
// } from "@/services/checkout";
// import DeleteConfirmModal from "@/components/delete-confirm-modal";

// // ==========================================
// // 1. ZOD SCHEMA ДЛЯ ВАЛИДАЦИИ АДРЕСА
// // ==========================================
// const addressSchema = z.object({
//   city: z.string().min(2, "Название города должно содержать минимум 2 символа"),
//   street: z.string().min(5, "Пожалуйста, введите полный адрес (улица, дом)"),
//   state: z.string().optional(),
// });

// type AddressFormValues = z.infer<typeof addressSchema>;

// // Способы оплаты (Адаптировано для РФ)
// const PAYMENT_METHODS = [
//   {
//     id: "CARD",
//     icon: CreditCard,
//     label: "Картой онлайн",
//     desc: "Visa, Mastercard, МИР",
//     paymentType: "PREPAID",
//   },
//   {
//     id: "SBP",
//     icon: Smartphone,
//     label: "СБП",
//     desc: "Быстрая оплата по QR",
//     paymentType: "PREPAID",
//   },
//   {
//     id: "CASH",
//     icon: Wallet,
//     label: "При получении",
//     desc: "Наличными или картой",
//     paymentType: "POSTPAID",
//   },
// ];

// export default function CheckoutPage() {
//   const { data: session, status } = useSession();
//   const router = useRouter();

//   // Состояние корзины
//   const cartItems = useCartStore((state) => state.items);
//   const cartTotal = useCartStore((state) => state.getTotal());
//   const clearCart = useCartStore((state) => state.clearCart);

//   // Состояние гидратации и профиля
//   const [mounted, setMounted] = useState(false);
//   const [isProfileLoading, setIsProfileLoading] = useState(true);
//   const [addresses, setAddresses] = useState<Address[]>([]);
//   const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
//     null,
//   );

//   // Состояние управления формой адреса
//   const [isAddingNew, setIsAddingNew] = useState(false);
//   const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
//   const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

//   // React Hook Form Интеграция
//   const {
//     register,
//     handleSubmit,
//     watch,
//     reset,
//     formState: { errors, isValid },
//   } = useForm<AddressFormValues>({
//     resolver: zodResolver(addressSchema),
//     mode: "onChange",
//     defaultValues: { city: "", street: "", state: "" },
//   });

//   const watchCity = watch("city");
//   const watchStreet = watch("street");

//   // Состояние заказа и доставки
//   const [shippingCostData, setShippingCostData] = useState<{
//     zoneName: string;
//     shippingCost: number;
//     isFreeShipping: boolean;
//     amountToFreeShipping: number | null;
//   } | null>(null);
//   const [isShippingLoading, setIsShippingLoading] = useState(false);
//   const [promoInput, setPromoInput] = useState("");
//   const [activePromoCode, setActivePromoCode] = useState<string | undefined>(
//     undefined,
//   );
//   const [discountAmount, setDiscountAmount] = useState(0);
//   const [paymentMethod, setPaymentMethod] = useState("CARD");
//   const [paymentType, setPaymentType] = useState("PREPAID");
//   const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
//   const [errorMessage, setErrorMessage] = useState<string | null>(null);

//   // 1. Редирект, если корзина пуста
//   useEffect(() => {
//     setMounted(true);
//     if (mounted && cartItems.length === 0) {
//       router.push("/cart");
//     }
//   }, [cartItems.length, mounted, router]);

//   // 2. Загрузка профиля и сохраненных адресов
//   useEffect(() => {
//     if (status === "authenticated" && mounted) {
//       const getUserProfileData = async () => {
//         try {
//           setIsProfileLoading(true);
//           const response = await fetchUserProfile();
//           if (response.status === "success" && response.data?.addresses) {
//             const userAddresses = response.data.addresses;
//             setAddresses(userAddresses);

//             const defaultAddr = userAddresses.find((a) => a.isDefault);
//             if (defaultAddr?.id) {
//               setSelectedAddressId(defaultAddr.id);
//             } else if (userAddresses.length > 0 && userAddresses[0].id) {
//               setSelectedAddressId(userAddresses[0].id);
//             } else {
//               setIsAddingNew(true);
//             }
//           }
//         } catch (error) {
//           console.error("Ошибка загрузки профиля:", error);
//           setIsAddingNew(true);
//         } finally {
//           setIsProfileLoading(false);
//         }
//       };
//       getUserProfileData();
//     } else if (status === "unauthenticated") {
//       setIsProfileLoading(false);
//       setIsAddingNew(true);
//     }
//   }, [status, mounted]);

//   // 3. Расчет стоимости доставки (Debounced)
//   useEffect(() => {
//     if (!mounted) return;

//     let targetCity = "";

//     if (!isAddingNew && selectedAddressId && !editingAddressId) {
//       const matched = addresses.find((a) => a.id === selectedAddressId);
//       if (matched?.city) targetCity = matched.city;
//     } else if (
//       (isAddingNew || editingAddressId) &&
//       watchCity &&
//       watchCity.trim().length >= 2
//     ) {
//       targetCity = watchCity.trim();
//     }

//     if (!targetCity) {
//       setShippingCostData(null);
//       return;
//     }

//     const triggerShippingCalculation = async () => {
//       setIsShippingLoading(true);
//       try {
//         const response = await calculateShippingCost({
//           city: targetCity,
//           cartTotal: cartTotal - discountAmount,
//         });
//         if (response.success) {
//           setShippingCostData(response.data);
//         }
//       } catch (error) {
//         console.error("Ошибка расчета доставки:", error);
//       } finally {
//         setIsShippingLoading(false);
//       }
//     };

//     const handler = setTimeout(() => {
//       triggerShippingCalculation();
//     }, 500);

//     return () => clearTimeout(handler);
//   }, [
//     selectedAddressId,
//     isAddingNew,
//     editingAddressId,
//     watchCity,
//     cartTotal,
//     discountAmount,
//     addresses,
//     mounted,
//   ]);

//   const handlePaymentMethodClick = (id: string) => {
//     setPaymentMethod(id);
//     setPaymentType(
//       PAYMENT_METHODS.find((m) => m.id === id)?.paymentType || "PREPAID",
//     );
//   };

//   // 4. Обработчики управления адресами (Создание, Редактирование, Удаление)
//   const handleEditAddressClick = (e: React.MouseEvent, addr: Address) => {
//     e.stopPropagation(); // Предотвращаем выбор адреса при клике на иконку
//     setEditingAddressId(addr.id || null);
//     setIsAddingNew(true); // Открываем форму
//     reset({
//       city: addr.city,
//       street: addr.street,
//       state: addr.state || "",
//     });
//   };

//   const openDeleteModal = (e: React.MouseEvent, addrId: string) => {
//     e.stopPropagation();
//     setDeleteTargetId(addrId);
//   };

//   // This is the actual function called by the modal's confirm button
//   const executeDelete = async () => {
//     if (!deleteTargetId) return;

//     try {
//       await deleteAddress(deleteTargetId);
//       const updatedAddresses = addresses.filter((a) => a.id !== deleteTargetId);
//       setAddresses(updatedAddresses);

//       if (selectedAddressId === deleteTargetId) {
//         if (updatedAddresses.length > 0) {
//           setSelectedAddressId(updatedAddresses[0].id || null);
//         } else {
//           setSelectedAddressId(null);
//           setIsAddingNew(true);
//         }
//       }
//     } catch (error) {
//       console.error("Ошибка удаления адреса:", error);
//       setErrorMessage("Не удалось удалить адрес.");
//     } finally {
//       setDeleteTargetId(null);
//     }
//   };
//   const onSaveAddressForm = async (data: AddressFormValues) => {
//     try {
//       setIsShippingLoading(true);
//       setErrorMessage(null);

//       if (editingAddressId) {
//         // Логика ОБНОВЛЕНИЯ
//         const response = await updateAddress(editingAddressId, { ...data });
//         if (response.status === "success" && response.data) {
//           setAddresses((prev) =>
//             prev.map((a) => (a.id === editingAddressId ? response.data : a)),
//           );
//           setSelectedAddressId(response.data.id || null);
//         }
//       } else {
//         // Логика СОЗДАНИЯ
//         const response = await addNewAddress({
//           ...data,
//           zipCode: "",
//           isDefault: false,
//         });
//         if (response.status === "success" && response.data) {
//           setAddresses((prev) => [...prev, response.data]);
//           setSelectedAddressId(response.data.id || null);
//         }
//       }

//       // Сброс состояния формы
//       setIsAddingNew(false);
//       setEditingAddressId(null);
//       reset({ city: "", street: "", state: "" });
//     } catch (error) {
//       console.error("Ошибка сохранения адреса:", error);
//       setErrorMessage(
//         "Не удалось сохранить адрес доставки. Пожалуйста, попробуйте снова.",
//       );
//     } finally {
//       setIsShippingLoading(false);
//     }
//   };

//   const cancelAddressForm = () => {
//     setIsAddingNew(false);
//     setEditingAddressId(null);
//     reset({ city: "", street: "", state: "" });
//   };

//   // 5. Логика промокода
//   const handlePromoSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (promoInput.trim().toUpperCase() === "MARKET2026") {
//       setDiscountAmount(Math.round(cartTotal * 0.1));
//       setActivePromoCode(promoInput.trim().toUpperCase());
//       setErrorMessage(null);
//     } else {
//       setErrorMessage("Неверный промокод или истек срок действия");
//       setDiscountAmount(0);
//       setActivePromoCode(undefined);
//     }
//   };

//   // 6. Подтверждение заказа
//   const handleCheckoutSubmit = async () => {
//     setErrorMessage(null);

//     if (!isAddingNew && !editingAddressId && !selectedAddressId) {
//       setErrorMessage("Пожалуйста, выберите адрес доставки.");
//       return;
//     }
//     if ((isAddingNew || editingAddressId) && (!watchCity || !watchStreet)) {
//       setErrorMessage("Пожалуйста, заполните обязательные поля адреса.");
//       return;
//     }

//     setIsSubmittingOrder(true);
//     const selectedAddr = addresses.find(
//       (addr) => addr.id === selectedAddressId,
//     );

//     const orderPayload: OrderPayload = {
//       items: cartItems,
//       shippingAddressId:
//         !isAddingNew && !editingAddressId ? selectedAddressId : null,
//       shippingAddress:
//         isAddingNew || editingAddressId
//           ? {
//               street: watchStreet,
//               city: watchCity,
//               state: watch("state") || "",
//               zipCode: "",
//             }
//           : selectedAddr
//             ? {
//                 street: selectedAddr.street,
//                 city: selectedAddr.city,
//                 state: selectedAddr.state || "",
//                 zipCode: selectedAddr.zipCode || "",
//               }
//             : undefined,
//       paymentMethod,
//       paymentType,
//       promoCode: activePromoCode,
//       shippingCost: shippingCostData?.shippingCost || 0,
//       discountAmount,
//       totalAmount: Math.max(
//         0,
//         cartTotal - discountAmount + (shippingCostData?.shippingCost || 0),
//       ),
//     };

//     try {
//       const response = await placeOrder(orderPayload);
//       if (response.success) {
//         clearCart();
//         if (response.paymentUrl) {
//           window.location.href = response.paymentUrl;
//         } else {
//           router.push("/checkout/success");
//         }
//       } else {
//         setErrorMessage(
//           response.message || "Ошибка при оформлении заказа. Попробуйте снова.",
//         );
//       }
//     } catch (error: any) {
//       console.error("Критическая ошибка оформления заказа:", error);
//       setErrorMessage(
//         error?.message || "Произошла критическая ошибка при оформлении заказа.",
//       );
//     } finally {
//       setIsSubmittingOrder(false);
//     }
//   };

//   if (!mounted || cartItems.length === 0) return null;

//   const activeShippingCost = shippingCostData?.shippingCost || 0;
//   const finalCalculatedTotal = Math.max(
//     0,
//     cartTotal - discountAmount + activeShippingCost,
//   );
//   const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);

//   return (
//     <div className="min-h-screen bg-[#F5F6F8] dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 font-sans">
//       <div className="max-w-[1280px] mx-auto">
//         <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-8 uppercase">
//           Оформление заказа
//         </h1>

//         {errorMessage && (
//           <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 text-[#F33939] p-4 rounded-2xl mb-8 flex items-center gap-3 animate-in fade-in duration-200">
//             <AlertCircle className="shrink-0 h-5 w-5" />
//             <p className="text-sm font-medium">{errorMessage}</p>
//           </div>
//         )}

//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
//           {/* ======================================================== */}
//           {/* ЛЕВАЯ КОЛОНКА: ФОРМЫ И ВЫБОР                             */}
//           {/* ======================================================== */}
//           <div className="lg:col-span-7 xl:col-span-8 space-y-6">
//             {/* --- АДРЕС ДОСТАВКИ --- */}
//             <section className="bg-white dark:bg-slate-900 rounded-[28px] p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-800">
//               <div className="flex items-center gap-4 mb-6">
//                 <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-[#005BFF] dark:text-blue-400 rounded-2xl flex items-center justify-center">
//                   <MapPin size={24} strokeWidth={2.5} />
//                 </div>
//                 <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
//                   Адрес доставки
//                 </h2>
//               </div>

//               {isProfileLoading ? (
//                 <div className="flex py-8 items-center justify-center gap-3 text-slate-500 font-medium">
//                   <Loader2 className="animate-spin text-[#005BFF] h-5 w-5" />{" "}
//                   Загрузка адресов...
//                 </div>
//               ) : (
//                 <>
//                   {addresses.length > 0 &&
//                     !isAddingNew &&
//                     !editingAddressId && (
//                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
//                         {addresses.map((addr) => (
//                           <div
//                             key={addr.id}
//                             onClick={() =>
//                               setSelectedAddressId(addr.id || null)
//                             }
//                             className={`group cursor-pointer rounded-[20px] p-5 border-2 transition-all duration-200 flex flex-col justify-between relative ${
//                               selectedAddressId === addr.id
//                                 ? "border-[#005BFF] bg-blue-50/50 dark:bg-blue-900/10 shadow-sm"
//                                 : "border-slate-100 dark:border-slate-800 hover:border-slate-200"
//                             }`}
//                           >
//                             {/* Кнопки действий (Редактировать / Удалить) */}
//                             <div className="absolute top-4 right-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
//                               <button
//                                 onClick={(e) => handleEditAddressClick(e, addr)}
//                                 className="p-1.5 bg-white dark:bg-slate-800 text-slate-400 hover:text-[#005BFF] rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 transition-colors"
//                                 title="Редактировать"
//                               >
//                                 <Pencil size={14} strokeWidth={2.5} />
//                               </button>
//                               <button
//                                 onClick={(e) =>
//                                   addr.id && openDeleteModal(e, addr.id)
//                                 }
//                                 className="p-1.5 bg-white dark:bg-slate-800 text-slate-400 hover:text-[#F33939] rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 transition-colors"
//                                 title="Удалить"
//                               >
//                                 <Trash2 size={14} strokeWidth={2.5} />
//                               </button>
//                             </div>

//                             <div className="pr-14">
//                               {" "}
//                               {/* Отступ для иконок действий */}
//                               <div className="flex justify-between items-start mb-3">
//                                 <span className="font-bold text-[15px] text-slate-900 dark:text-white flex items-center gap-2">
//                                   {addr.city}
//                                   {addr.isDefault && (
//                                     <span className="bg-slate-100 dark:bg-slate-800 text-[10px] px-2 py-1 rounded-md text-slate-500 font-bold uppercase tracking-wider">
//                                       Основной
//                                     </span>
//                                   )}
//                                 </span>
//                               </div>
//                               <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
//                                 {addr.street}
//                               </p>
//                             </div>

//                             {/* Иконка галочки для выбранного адреса */}
//                             {selectedAddressId === addr.id && (
//                               <div className="absolute bottom-4 right-4">
//                                 <CheckCircle2
//                                   size={20}
//                                   className="text-[#005BFF] fill-white"
//                                 />
//                               </div>
//                             )}
//                           </div>
//                         ))}

//                         <button
//                           onClick={() => setIsAddingNew(true)}
//                           className="flex flex-col items-center justify-center gap-3 rounded-[20px] p-5 border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-500 hover:text-[#005BFF] hover:border-[#005BFF] hover:bg-blue-50/30 transition-all min-h-[120px]"
//                         >
//                           <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
//                             <Plus size={20} />
//                           </div>
//                           <span className="text-sm font-bold">Новый адрес</span>
//                         </button>
//                       </div>
//                     )}

//                   {(isAddingNew ||
//                     editingAddressId ||
//                     addresses.length === 0) && (
//                     <form
//                       onSubmit={
//                         status === "authenticated"
//                           ? handleSubmit(onSaveAddressForm)
//                           : (e) => e.preventDefault()
//                       }
//                       className="animate-in fade-in slide-in-from-bottom-2 duration-300 bg-slate-50/50 dark:bg-slate-800/20 p-6 rounded-[24px] border border-slate-100 dark:border-slate-800"
//                     >
//                       <h3 className="font-bold text-slate-900 dark:text-white mb-5">
//                         {editingAddressId
//                           ? "Редактирование адреса"
//                           : "Добавление нового адреса"}
//                       </h3>

//                       <div className="space-y-5">
//                         {/* Поле Город */}
//                         <div>
//                           <label className="block text-[13px] font-bold uppercase tracking-wide text-slate-500 mb-2">
//                             Город (Для расчета доставки) *
//                           </label>
//                           <div className="relative">
//                             <Building2
//                               className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
//                               size={18}
//                             />
//                             <input
//                               {...register("city")}
//                               placeholder="Например: Москва"
//                               className={`w-full bg-white dark:bg-slate-800 border rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#005BFF]/50 text-sm font-medium transition-all ${
//                                 errors.city
//                                   ? "border-red-400 focus:border-red-400"
//                                   : "border-slate-200 dark:border-slate-700 focus:border-[#005BFF]"
//                               }`}
//                             />
//                           </div>
//                           {errors.city && (
//                             <p className="text-[#F33939] text-xs font-medium mt-2 ml-1">
//                               {errors.city.message}
//                             </p>
//                           )}
//                         </div>

//                         {/* Поле Улица */}
//                         <div>
//                           <label className="block text-[13px] font-bold uppercase tracking-wide text-slate-500 mb-2">
//                             Улица, дом, квартира *
//                           </label>
//                           <div className="relative">
//                             <MapPin
//                               className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
//                               size={18}
//                             />
//                             <input
//                               {...register("street")}
//                               placeholder="ул. Ленина, д. 10, кв. 45"
//                               className={`w-full bg-white dark:bg-slate-800 border rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#005BFF]/50 text-sm font-medium transition-all ${
//                                 errors.street
//                                   ? "border-red-400 focus:border-red-400"
//                                   : "border-slate-200 dark:border-slate-700 focus:border-[#005BFF]"
//                               }`}
//                             />
//                           </div>
//                           {errors.street && (
//                             <p className="text-[#F33939] text-xs font-medium mt-2 ml-1">
//                               {errors.street.message}
//                             </p>
//                           )}
//                         </div>

//                         {/* Поле Регион */}
//                         <div>
//                           <label className="block text-[13px] font-bold uppercase tracking-wide text-slate-500 mb-2">
//                             Регион / Область{" "}
//                             <span className="normal-case font-medium text-slate-400">
//                               (Необязательно)
//                             </span>
//                           </label>
//                           <div className="relative">
//                             <Map
//                               className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
//                               size={18}
//                             />
//                             <input
//                               {...register("state")}
//                               placeholder="Например: Московская область"
//                               className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-[#005BFF] focus:ring-2 focus:ring-[#005BFF]/50 text-sm font-medium transition-all"
//                             />
//                           </div>
//                         </div>
//                       </div>

//                       {status === "authenticated" && (
//                         <div className="flex items-center gap-4 pt-6 mt-2">
//                           <button
//                             type="submit"
//                             disabled={!isValid || isShippingLoading}
//                             className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-3.5 rounded-2xl text-sm font-bold disabled:opacity-50 transition-all hover:bg-slate-800 flex items-center gap-2"
//                           >
//                             {isShippingLoading && (
//                               <Loader2 size={16} className="animate-spin" />
//                             )}
//                             {editingAddressId
//                               ? "Обновить адрес"
//                               : "Сохранить адрес"}
//                           </button>
//                           {addresses.length > 0 && (
//                             <button
//                               type="button"
//                               onClick={cancelAddressForm}
//                               className="text-sm font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
//                             >
//                               Отмена
//                             </button>
//                           )}
//                         </div>
//                       )}
//                     </form>
//                   )}
//                 </>
//               )}
//             </section>

//             {/* --- СПОСОБ ОПЛАТЫ --- */}
//             <section className="bg-white dark:bg-slate-900 rounded-[28px] p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-800">
//               <div className="flex items-center gap-4 mb-6">
//                 <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-[#005BFF] dark:text-blue-400 rounded-2xl flex items-center justify-center">
//                   <Wallet size={24} strokeWidth={2.5} />
//                 </div>
//                 <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
//                   Способ оплаты
//                 </h2>
//               </div>

//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//                 {PAYMENT_METHODS.map((method) => (
//                   <div
//                     key={method.id}
//                     onClick={() => handlePaymentMethodClick(method.id)}
//                     className={`cursor-pointer rounded-[20px] p-5 border-2 transition-all flex flex-col items-center text-center gap-3 ${
//                       paymentMethod === method.id
//                         ? "border-[#005BFF] bg-blue-50/50 dark:bg-blue-900/10 shadow-sm"
//                         : "border-slate-100 dark:border-slate-800 hover:border-slate-200"
//                     }`}
//                   >
//                     <div
//                       className={`p-3 rounded-full ${paymentMethod === method.id ? "bg-[#005BFF] text-white" : "bg-slate-50 dark:bg-slate-800 text-slate-400"}`}
//                     >
//                       <method.icon size={24} strokeWidth={2} />
//                     </div>
//                     <div>
//                       <span className="block font-bold text-[15px] text-slate-900 dark:text-white mb-1">
//                         {method.label}
//                       </span>
//                       <span className="block text-xs text-slate-500 font-medium">
//                         {method.desc}
//                       </span>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </section>
//           </div>

//           {/* ======================================================== */}
//           {/* ПРАВАЯ КОЛОНКА: ИТОГИ ЗАКАЗА (STICKY)                    */}
//           {/* ======================================================== */}
//           <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24">
//             <div className="bg-white dark:bg-slate-900 rounded-[28px] p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col">
//               <h2 className="text-2xl font-black mb-6 tracking-tight text-slate-900 dark:text-white uppercase">
//                 Ваш заказ
//               </h2>

//               <div className="flex gap-3 mb-8 overflow-x-auto pb-2 custom-scrollbar">
//                 {cartItems.map((item) => (
//                   <div
//                     key={item.productId}
//                     className="w-14 h-14 rounded-xl bg-slate-50 dark:bg-slate-800 shrink-0 border border-slate-100 dark:border-slate-700 p-1.5 relative"
//                   >
//                     <img
//                       src={item.imageUrl}
//                       alt=""
//                       className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
//                     />
//                     {item.quantity > 1 && (
//                       <span className="absolute -top-2 -right-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
//                         {item.quantity}
//                       </span>
//                     )}
//                   </div>
//                 ))}
//               </div>

//               <form onSubmit={handlePromoSubmit} className="flex gap-2 mb-8">
//                 <div className="relative flex-1">
//                   <Tag
//                     className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
//                     size={18}
//                   />
//                   <input
//                     type="text"
//                     placeholder="Промокод"
//                     value={promoInput}
//                     onChange={(e) => setPromoInput(e.target.value)}
//                     className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-bold focus:outline-none focus:border-[#005BFF] uppercase tracking-wider transition-colors"
//                   />
//                 </div>
//                 <button
//                   type="submit"
//                   className="bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white px-6 rounded-2xl text-sm font-bold transition-all"
//                 >
//                   Применить
//                 </button>
//               </form>

//               <div className="space-y-4 border-b border-slate-100 dark:border-slate-800 pb-6 mb-6">
//                 <div className="flex justify-between text-[15px] font-medium text-slate-500">
//                   <span>Товары ({totalQuantity})</span>
//                   <span className="text-slate-900 dark:text-white font-bold">
//                     {cartTotal.toLocaleString("ru-RU")} ₽
//                   </span>
//                 </div>

//                 {discountAmount > 0 && (
//                   <div className="flex justify-between text-[15px] font-bold text-[#F33939]">
//                     <span>Скидка по промокоду</span>
//                     <span>− {discountAmount.toLocaleString("ru-RU")} ₽</span>
//                   </div>
//                 )}

//                 <div className="flex justify-between text-[15px] font-medium text-slate-500 items-center">
//                   <span>Доставка</span>
//                   {isShippingLoading ? (
//                     <Loader2
//                       size={16}
//                       className="animate-spin text-[#005BFF]"
//                     />
//                   ) : shippingCostData ? (
//                     <span
//                       className={
//                         shippingCostData.isFreeShipping
//                           ? "text-[#00B15C] font-bold"
//                           : "text-slate-900 dark:text-white font-bold"
//                       }
//                     >
//                       {shippingCostData.isFreeShipping
//                         ? "Бесплатно"
//                         : `${shippingCostData.shippingCost.toLocaleString("ru-RU")} ₽`}
//                     </span>
//                   ) : (
//                     <span className="text-xs text-slate-400 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">
//                       Укажите город
//                     </span>
//                   )}
//                 </div>
//               </div>

//               {shippingCostData?.amountToFreeShipping &&
//                 shippingCostData.amountToFreeShipping > 0 && (
//                   <div className="bg-[#E8F0FE] dark:bg-blue-900/20 text-[#005BFF] dark:text-blue-400 p-4 rounded-2xl flex items-start gap-3 mb-6">
//                     <Truck size={20} className="shrink-0 mt-0.5" />
//                     <p className="text-[13px] font-medium leading-snug">
//                       Добавьте товаров еще на{" "}
//                       <span className="font-bold underline">
//                         {shippingCostData.amountToFreeShipping.toLocaleString(
//                           "ru-RU",
//                         )}{" "}
//                         ₽
//                       </span>{" "}
//                       для бесплатной доставки!
//                     </p>
//                   </div>
//                 )}

//               <div className="flex items-end justify-between mb-8">
//                 <span className="text-lg font-bold text-slate-900 dark:text-white">
//                   Итого
//                 </span>
//                 <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
//                   {finalCalculatedTotal.toLocaleString("ru-RU")} ₽
//                 </span>
//               </div>

//               <button
//                 onClick={handleCheckoutSubmit}
//                 disabled={
//                   isSubmittingOrder ||
//                   (!selectedAddressId && (!watchCity || !watchStreet))
//                 }
//                 className="w-full bg-[#FCE000] hover:bg-[#F2D600] disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-800 text-black font-black py-4.5 rounded-2xl transition-all flex items-center justify-center gap-2 text-lg active:scale-[0.98]"
//               >
//                 {isSubmittingOrder ? (
//                   <Loader2 size={24} className="animate-spin text-black" />
//                 ) : (
//                   "Подтвердить заказ"
//                 )}
//               </button>

//               <p className="text-xs text-center text-slate-400 mt-5 leading-relaxed px-2 font-medium">
//                 Оформляя заказ, вы соглашаетесь с условиями оферты и политики
//                 обработки данных.
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//       <DeleteConfirmModal
//         isOpen={!!deleteTargetId}
//         onClose={() => setDeleteTargetId(null)}
//         onConfirm={executeDelete}
//         title="Удаление адреса"
//         message="Вы действительно хотите удалить этот адрес? Это действие нельзя будет отменить."
//       />
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  MapPin,
  CreditCard,
  Wallet,
  Smartphone,
  Tag,
  CheckCircle2,
  Plus,
  Loader2,
  Truck,
  AlertCircle,
  Building2,
  Map,
  Pencil,
  Trash2,
} from "lucide-react";

import { useCartStore } from "@/store/useCartStore";
import {
  fetchUserProfile,
  addNewAddress,
  updateAddress,
  deleteAddress,
  calculateShippingCost,
  placeOrder,
  Address,
} from "@/services/checkout";
import DeleteConfirmModal from "@/components/delete-confirm-modal";

// ==========================================
// 1. ZOD SCHEMA ДЛЯ ВАЛИДАЦИИ АДРЕСА
// ==========================================
const addressSchema = z.object({
  city: z.string().min(3, "Название города должно содержать минимум 3 символа"),
  street: z.string().min(5, "Пожалуйста, введите полный адрес (улица, дом)"),
  state: z.string().optional(),
});

type AddressFormValues = z.infer<typeof addressSchema>;

// Способы оплаты с привязкой к PaymentType (PREPAID / POSTPAID)
const PAYMENT_METHODS = [
  {
    id: "CARD",
    icon: CreditCard,
    label: "Картой онлайн",
    desc: "Visa, Mastercard, МИР",
    paymentType: "PREPAID",
  },
  {
    id: "SBP",
    icon: Smartphone,
    label: "СБП",
    desc: "Быстрая оплата по QR",
    paymentType: "PREPAID",
  },
  {
    id: "CASH",
    icon: Wallet,
    label: "При получении",
    desc: "Наличными или картой",
    paymentType: "POSTPAID",
  },
];

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Состояние корзины
  const cartItems = useCartStore((state) => state.items);
  const cartTotal = useCartStore((state) => state.getTotal());
  const clearCart = useCartStore((state) => state.clearCart);

  // Состояние гидратации и профиля
  const [mounted, setMounted] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );

  // Состояние управления формой адреса
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // React Hook Form Интеграция
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    mode: "onChange",
    defaultValues: { city: "", street: "", state: "" },
  });

  const watchCity = watch("city");
  const watchStreet = watch("street");

  // Состояние заказа и доставки
  const [shippingCostData, setShippingCostData] = useState<{
    zoneName: string;
    shippingCost: number;
    isFreeShipping: boolean;
    amountToFreeShipping: number | null;
  } | null>(null);
  const [isShippingLoading, setIsShippingLoading] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [activePromoCode, setActivePromoCode] = useState<string | undefined>(
    undefined,
  );
  const [discountAmount, setDiscountAmount] = useState(0);

  // Устанавливаем дефолтный метод и тип оплаты
  const [paymentMethod, setPaymentMethod] = useState("CARD");
  const [paymentType, setPaymentType] = useState("PREPAID");

  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isOrderSuccessful, setIsOrderSuccessful] = useState(false);

  // 1. Редирект, если корзина пуста
  useEffect(() => {
    setMounted(true);

    if (mounted && cartItems.length === 0 && !isOrderSuccessful) {
      router.push("/cart");
    }
  }, [cartItems.length, mounted, router, isOrderSuccessful]);

  // 2. Загрузка профиля и сохраненных адресов
  useEffect(() => {
    if (status === "authenticated" && mounted) {
      const getUserProfileData = async () => {
        try {
          setIsProfileLoading(true);
          const response = await fetchUserProfile();

          if (response.status === "success" && response.data?.addresses) {
            const userAddresses = response.data.addresses;
            setAddresses(userAddresses);

            const defaultAddr = userAddresses.find((a) => a.isDefault);
            if (defaultAddr?.id) {
              setSelectedAddressId(defaultAddr.id);
            } else if (userAddresses.length > 0 && userAddresses[0].id) {
              setSelectedAddressId(userAddresses[0].id);
            } else {
              setIsAddingNew(true);
            }
          }
        } catch (error) {
          console.error("Ошибка загрузки профиля:", error);
          setIsAddingNew(true);
        } finally {
          setIsProfileLoading(false);
        }
      };
      getUserProfileData();
    } else if (status === "unauthenticated") {
      setIsProfileLoading(false);
      setIsAddingNew(true);
    }
  }, [status, mounted]);

  // 3. Расчет стоимости доставки (Debounced)
  useEffect(() => {
    if (!mounted) return;

    let targetCity = "";

    if (!isAddingNew && selectedAddressId && !editingAddressId) {
      const matched = addresses.find((a) => a.id === selectedAddressId);
      if (matched?.city) targetCity = matched.city;
    } else if (
      (isAddingNew || editingAddressId) &&
      watchCity &&
      watchCity.trim().length >= 2
    ) {
      targetCity = watchCity.trim();
    }

    if (!targetCity) {
      setShippingCostData(null);
      return;
    }

    const triggerShippingCalculation = async () => {
      setIsShippingLoading(true);
      try {
        const response = await calculateShippingCost({
          city: targetCity,
          cartTotal: cartTotal - discountAmount,
        });
        if (response.success) {
          setShippingCostData(response.data);
        }
      } catch (error) {
        console.error("Ошибка расчета доставки:", error);
      } finally {
        setIsShippingLoading(false);
      }
    };

    const handler = setTimeout(() => {
      triggerShippingCalculation();
    }, 500);

    return () => clearTimeout(handler);
  }, [
    selectedAddressId,
    isAddingNew,
    editingAddressId,
    watchCity,
    cartTotal,
    discountAmount,
    addresses,
    mounted,
  ]);

  const handlePaymentMethodClick = (id: string) => {
    setPaymentMethod(id);
    setPaymentType(
      PAYMENT_METHODS.find((m) => m.id === id)?.paymentType || "PREPAID",
    );
  };

  // 4. Обработчики управления адресами
  const handleEditAddressClick = (e: React.MouseEvent, addr: Address) => {
    e.stopPropagation();
    setEditingAddressId(addr.id || null);
    setIsAddingNew(true);
    reset({
      city: addr.city,
      street: addr.street,
      state: addr.state || "",
    });
  };

  const openDeleteModal = (e: React.MouseEvent, addrId: string) => {
    e.stopPropagation();
    setDeleteTargetId(addrId);
  };

  const executeDelete = async () => {
    if (!deleteTargetId) return;

    try {
      await deleteAddress(deleteTargetId);
      const updatedAddresses = addresses.filter((a) => a.id !== deleteTargetId);
      setAddresses(updatedAddresses);

      if (selectedAddressId === deleteTargetId) {
        if (updatedAddresses.length > 0) {
          setSelectedAddressId(updatedAddresses[0].id || null);
        } else {
          setSelectedAddressId(null);
          setIsAddingNew(true);
        }
      }
    } catch (error) {
      console.error("Ошибка удаления адреса:", error);
      setErrorMessage("Не удалось удалить адрес.");
    } finally {
      setDeleteTargetId(null);
    }
  };

  const onSaveAddressForm = async (data: AddressFormValues) => {
    try {
      setIsShippingLoading(true);
      setErrorMessage(null);

      if (editingAddressId) {
        const response = await updateAddress(editingAddressId, { ...data });
        if (response.status === "success" && response.data) {
          setAddresses((prev) =>
            prev.map((a) => (a.id === editingAddressId ? response.data : a)),
          );
          setSelectedAddressId(response.data.id || null);
        }
      } else {
        const response = await addNewAddress({
          ...data,
          zipCode: "",
          isDefault: false,
        });
        if (response.status === "success" && response.data) {
          setAddresses((prev) => [...prev, response.data]);
          setSelectedAddressId(response.data.id || null);
        }
      }

      setIsAddingNew(false);
      setEditingAddressId(null);
      reset({ city: "", street: "", state: "" });
    } catch (error) {
      console.error("Ошибка сохранения адреса:", error);
      setErrorMessage(
        "Не удалось сохранить адрес доставки. Пожалуйста, попробуйте снова.",
      );
    } finally {
      setIsShippingLoading(false);
    }
  };

  const cancelAddressForm = () => {
    setIsAddingNew(false);
    setEditingAddressId(null);
    reset({ city: "", street: "", state: "" });
  };

  const handlePromoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoInput.trim().toUpperCase() === "MARKET2026") {
      setDiscountAmount(Math.round(cartTotal * 0.1));
      setActivePromoCode(promoInput.trim().toUpperCase());
      setErrorMessage(null);
    } else {
      setErrorMessage("Неверный промокод или истек срок действия");
      setDiscountAmount(0);
      setActivePromoCode(undefined);
    }
  };

  // 6. Подтверждение заказа
  const handleCheckoutSubmit = async () => {
    setErrorMessage(null);

    // Валидация выбора адреса
    if (!isAddingNew && !editingAddressId && !selectedAddressId) {
      setErrorMessage("Пожалуйста, выберите адрес доставки.");
      return;
    }
    if ((isAddingNew || editingAddressId) && (!watchCity || !watchStreet)) {
      setErrorMessage("Пожалуйста, заполните обязательные поля адреса.");
      return;
    }

    setIsSubmittingOrder(true);

    // Формирование итогового адреса (строгая типизация)
    const selectedAddr = addresses.find(
      (addr) => addr.id === selectedAddressId,
    );
    let finalShippingAddress;

    if (isAddingNew || editingAddressId) {
      finalShippingAddress = {
        street: watchStreet,
        city: watchCity,
        state: watch("state") || "",
        zipCode: "",
      };
    } else if (selectedAddr) {
      finalShippingAddress = {
        street: selectedAddr.street,
        city: selectedAddr.city,
        state: selectedAddr.state || "",
        zipCode: selectedAddr.zipCode || "",
      };
    }

    if (!finalShippingAddress) {
      setErrorMessage("Ошибка получения адреса. Попробуйте обновить страницу.");
      setIsSubmittingOrder(false);
      return;
    }

    // Подготовка Payload для Order Service
    const orderPayload = {
      items: cartItems.map((item) => ({
        productId: item.productId,
        productName: item.name,
        quantity: item.quantity,
      })),
      shippingAddress: finalShippingAddress,
      paymentMethod,
      paymentType,
      promoCode: activePromoCode,
    };

    try {
      const response = await placeOrder(orderPayload as any); // Type assertion safely applied to custom payload shape

      if (response.status === "success" || response.success) {
        setIsOrderSuccessful(true);
        clearCart();

        // TypeScript to bypass the strict shape check here
        const createdOrder = (response.data || response) as Record<string, any>;
        const targetOrderId = createdOrder.orderId || createdOrder.id;

        // 🚨 ЛОГИКА МАРШРУТИЗАЦИИ НА ОСНОВЕ ТИПА ОПЛАТЫ
        if (paymentType === "POSTPAID") {
          // Наличными при получении -> Сразу на страницу успеха
          router.push(`/checkout/success?orderId=${targetOrderId}`);
        } else {
          // Онлайн оплата -> На защищенную страницу Stripe
          router.push(`/checkout/payment/${targetOrderId}`);
        }
      } else {
        setErrorMessage(
          response.message || "Ошибка при оформлении заказа. Попробуйте снова.",
        );
      }
    } catch (error: any) {
      console.error("Критическая ошибка оформления заказа:", error);
      setErrorMessage(
        error?.message || "Произошла критическая ошибка при оформлении заказа.",
      );
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  if (!mounted || cartItems.length === 0) return null;

  const activeShippingCost = shippingCostData?.shippingCost || 0;
  const finalCalculatedTotal = Math.max(
    0,
    cartTotal - discountAmount + activeShippingCost,
  );
  const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#F5F6F8] dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-[1280px] mx-auto">
        <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-8 uppercase">
          Оформление заказа
        </h1>

        {errorMessage && (
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 text-[#F33939] p-4 rounded-2xl mb-8 flex items-center gap-3 animate-in fade-in duration-200">
            <AlertCircle className="shrink-0 h-5 w-5" />
            <p className="text-sm font-medium">{errorMessage}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ======================================================== */}
          {/* ЛЕВАЯ КОЛОНКА: ФОРМЫ И ВЫБОР                             */}
          {/* ======================================================== */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            {/* --- АДРЕС ДОСТАВКИ --- */}
            <section className="bg-white dark:bg-slate-900 rounded-[28px] p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-[#005BFF] dark:text-blue-400 rounded-2xl flex items-center justify-center">
                  <MapPin size={24} strokeWidth={2.5} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Адрес доставки
                </h2>
              </div>

              {isProfileLoading ? (
                <div className="flex py-8 items-center justify-center gap-3 text-slate-500 font-medium">
                  <Loader2 className="animate-spin text-[#005BFF] h-5 w-5" />{" "}
                  Загрузка адресов...
                </div>
              ) : (
                <>
                  {addresses.length > 0 &&
                    !isAddingNew &&
                    !editingAddressId && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        {addresses.map((addr) => (
                          <div
                            key={addr.id}
                            onClick={() =>
                              setSelectedAddressId(addr.id || null)
                            }
                            className={`group cursor-pointer rounded-[20px] p-5 border-2 transition-all duration-200 flex flex-col justify-between relative ${
                              selectedAddressId === addr.id
                                ? "border-[#005BFF] bg-blue-50/50 dark:bg-blue-900/10 shadow-sm"
                                : "border-slate-100 dark:border-slate-800 hover:border-slate-200"
                            }`}
                          >
                            {/* Кнопки действий (Редактировать / Удалить) */}
                            <div className="absolute top-4 right-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => handleEditAddressClick(e, addr)}
                                className="p-1.5 bg-white dark:bg-slate-800 text-slate-400 hover:text-[#005BFF] rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 transition-colors"
                                title="Редактировать"
                              >
                                <Pencil size={14} strokeWidth={2.5} />
                              </button>
                              <button
                                onClick={(e) =>
                                  addr.id && openDeleteModal(e, addr.id)
                                }
                                className="p-1.5 bg-white dark:bg-slate-800 text-slate-400 hover:text-[#F33939] rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 transition-colors"
                                title="Удалить"
                              >
                                <Trash2 size={14} strokeWidth={2.5} />
                              </button>
                            </div>

                            <div className="pr-14">
                              <div className="flex justify-between items-start mb-3">
                                <span className="font-bold text-[15px] text-slate-900 dark:text-white flex items-center gap-2">
                                  {addr.city}
                                  {addr.isDefault && (
                                    <span className="bg-slate-100 dark:bg-slate-800 text-[10px] px-2 py-1 rounded-md text-slate-500 font-bold uppercase tracking-wider">
                                      Основной
                                    </span>
                                  )}
                                </span>
                              </div>
                              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                                {addr.street}
                              </p>
                            </div>

                            {/* Иконка галочки для выбранного адреса */}
                            {selectedAddressId === addr.id && (
                              <div className="absolute bottom-4 right-4">
                                <CheckCircle2
                                  size={20}
                                  className="text-[#005BFF] fill-white"
                                />
                              </div>
                            )}
                          </div>
                        ))}

                        <button
                          onClick={() => setIsAddingNew(true)}
                          className="flex flex-col items-center justify-center gap-3 rounded-[20px] p-5 border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-500 hover:text-[#005BFF] hover:border-[#005BFF] hover:bg-blue-50/30 transition-all min-h-[120px]"
                        >
                          <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                            <Plus size={20} />
                          </div>
                          <span className="text-sm font-bold">Новый адрес</span>
                        </button>
                      </div>
                    )}

                  {(isAddingNew ||
                    editingAddressId ||
                    addresses.length === 0) && (
                    <form
                      onSubmit={
                        status === "authenticated"
                          ? handleSubmit(onSaveAddressForm)
                          : (e) => e.preventDefault()
                      }
                      className="animate-in fade-in slide-in-from-bottom-2 duration-300 bg-slate-50/50 dark:bg-slate-800/20 p-6 rounded-[24px] border border-slate-100 dark:border-slate-800"
                    >
                      <h3 className="font-bold text-slate-900 dark:text-white mb-5">
                        {editingAddressId
                          ? "Редактирование адреса"
                          : "Добавление нового адреса"}
                      </h3>

                      <div className="space-y-5">
                        <div>
                          <label className="block text-[13px] font-bold uppercase tracking-wide text-slate-500 mb-2">
                            Город (Для расчета доставки) *
                          </label>
                          <div className="relative">
                            <Building2
                              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                              size={18}
                            />
                            <input
                              {...register("city")}
                              placeholder="Например: Москва"
                              className={`w-full bg-white dark:bg-slate-800 border rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#005BFF]/50 text-sm font-medium transition-all ${
                                errors.city
                                  ? "border-red-400 focus:border-red-400"
                                  : "border-slate-200 dark:border-slate-700 focus:border-[#005BFF]"
                              }`}
                            />
                          </div>
                          {errors.city && (
                            <p className="text-[#F33939] text-xs font-medium mt-2 ml-1">
                              {errors.city.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-[13px] font-bold uppercase tracking-wide text-slate-500 mb-2">
                            Улица, дом, квартира *
                          </label>
                          <div className="relative">
                            <MapPin
                              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                              size={18}
                            />
                            <input
                              {...register("street")}
                              placeholder="ул. Ленина, д. 10, кв. 45"
                              className={`w-full bg-white dark:bg-slate-800 border rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#005BFF]/50 text-sm font-medium transition-all ${
                                errors.street
                                  ? "border-red-400 focus:border-red-400"
                                  : "border-slate-200 dark:border-slate-700 focus:border-[#005BFF]"
                              }`}
                            />
                          </div>
                          {errors.street && (
                            <p className="text-[#F33939] text-xs font-medium mt-2 ml-1">
                              {errors.street.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-[13px] font-bold uppercase tracking-wide text-slate-500 mb-2">
                            Регион / Область{" "}
                            <span className="normal-case font-medium text-slate-400">
                              (Необязательно)
                            </span>
                          </label>
                          <div className="relative">
                            <Map
                              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                              size={18}
                            />
                            <input
                              {...register("state")}
                              placeholder="Например: Московская область"
                              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-[#005BFF] focus:ring-2 focus:ring-[#005BFF]/50 text-sm font-medium transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      {status === "authenticated" && (
                        <div className="flex items-center gap-4 pt-6 mt-2">
                          <button
                            type="submit"
                            disabled={!isValid || isShippingLoading}
                            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-3.5 rounded-2xl text-sm font-bold disabled:opacity-50 transition-all hover:bg-slate-800 flex items-center gap-2"
                          >
                            {isShippingLoading && (
                              <Loader2 size={16} className="animate-spin" />
                            )}
                            {editingAddressId
                              ? "Обновить адрес"
                              : "Сохранить адрес"}
                          </button>
                          {addresses.length > 0 && (
                            <button
                              type="button"
                              onClick={cancelAddressForm}
                              className="text-sm font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                            >
                              Отмена
                            </button>
                          )}
                        </div>
                      )}
                    </form>
                  )}
                </>
              )}
            </section>

            {/* --- СПОСОБ ОПЛАТЫ --- */}
            <section className="bg-white dark:bg-slate-900 rounded-[28px] p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-[#005BFF] dark:text-blue-400 rounded-2xl flex items-center justify-center">
                  <Wallet size={24} strokeWidth={2.5} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Способ оплаты
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {PAYMENT_METHODS.map((method) => (
                  <div
                    key={method.id}
                    onClick={() => handlePaymentMethodClick(method.id)}
                    className={`cursor-pointer rounded-[20px] p-5 border-2 transition-all flex flex-col items-center text-center gap-3 ${
                      paymentMethod === method.id
                        ? "border-[#005BFF] bg-blue-50/50 dark:bg-blue-900/10 shadow-sm"
                        : "border-slate-100 dark:border-slate-800 hover:border-slate-200"
                    }`}
                  >
                    <div
                      className={`p-3 rounded-full ${paymentMethod === method.id ? "bg-[#005BFF] text-white" : "bg-slate-50 dark:bg-slate-800 text-slate-400"}`}
                    >
                      <method.icon size={24} strokeWidth={2} />
                    </div>
                    <div>
                      <span className="block font-bold text-[15px] text-slate-900 dark:text-white mb-1">
                        {method.label}
                      </span>
                      <span className="block text-xs text-slate-500 font-medium">
                        {method.desc}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ======================================================== */}
          {/* ПРАВАЯ КОЛОНКА: ИТОГИ ЗАКАЗА (STICKY)                    */}
          {/* ======================================================== */}
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24">
            <div className="bg-white dark:bg-slate-900 rounded-[28px] p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col">
              <h2 className="text-2xl font-black mb-6 tracking-tight text-slate-900 dark:text-white uppercase">
                Ваш заказ
              </h2>

              <div className="flex gap-3 mb-8 overflow-x-auto pb-2 custom-scrollbar">
                {cartItems.map((item) => (
                  <div
                    key={item.productId}
                    className="w-14 h-14 rounded-xl bg-slate-50 dark:bg-slate-800 shrink-0 border border-slate-100 dark:border-slate-700 p-1.5 relative"
                  >
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
                    />
                    {item.quantity > 1 && (
                      <span className="absolute -top-2 -right-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
                        {item.quantity}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <form onSubmit={handlePromoSubmit} className="flex gap-2 mb-8">
                <div className="relative flex-1">
                  <Tag
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Промокод"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-bold focus:outline-none focus:border-[#005BFF] uppercase tracking-wider transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white px-6 rounded-2xl text-sm font-bold transition-all"
                >
                  Применить
                </button>
              </form>

              <div className="space-y-4 border-b border-slate-100 dark:border-slate-800 pb-6 mb-6">
                <div className="flex justify-between text-[15px] font-medium text-slate-500">
                  <span>Товары ({totalQuantity})</span>
                  <span className="text-slate-900 dark:text-white font-bold">
                    {cartTotal.toLocaleString("ru-RU")} ₽
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-[15px] font-bold text-[#F33939]">
                    <span>Скидка по промокоду</span>
                    <span>− {discountAmount.toLocaleString("ru-RU")} ₽</span>
                  </div>
                )}

                <div className="flex justify-between text-[15px] font-medium text-slate-500 items-center">
                  <span>Доставка</span>
                  {isShippingLoading ? (
                    <Loader2
                      size={16}
                      className="animate-spin text-[#005BFF]"
                    />
                  ) : shippingCostData ? (
                    <span
                      className={
                        shippingCostData.isFreeShipping
                          ? "text-[#00B15C] font-bold"
                          : "text-slate-900 dark:text-white font-bold"
                      }
                    >
                      {shippingCostData.isFreeShipping
                        ? "Бесплатно"
                        : `${shippingCostData.shippingCost.toLocaleString("ru-RU")} ₽`}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">
                      Укажите город
                    </span>
                  )}
                </div>
              </div>

              {shippingCostData?.amountToFreeShipping &&
                shippingCostData.amountToFreeShipping > 0 && (
                  <div className="bg-[#E8F0FE] dark:bg-blue-900/20 text-[#005BFF] dark:text-blue-400 p-4 rounded-2xl flex items-start gap-3 mb-6">
                    <Truck size={20} className="shrink-0 mt-0.5" />
                    <p className="text-[13px] font-medium leading-snug">
                      Добавьте товаров еще на{" "}
                      <span className="font-bold underline">
                        {shippingCostData.amountToFreeShipping.toLocaleString(
                          "ru-RU",
                        )}{" "}
                        ₽
                      </span>{" "}
                      для бесплатной доставки!
                    </p>
                  </div>
                )}

              <div className="flex items-end justify-between mb-8">
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  Итого
                </span>
                <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  {finalCalculatedTotal.toLocaleString("ru-RU")} ₽
                </span>
              </div>

              <button
                onClick={handleCheckoutSubmit}
                disabled={
                  isSubmittingOrder ||
                  (!selectedAddressId && (!watchCity || !watchStreet))
                }
                className="w-full bg-[#FCE000] hover:bg-[#F2D600] disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-800 text-black font-black py-4.5 rounded-2xl transition-all flex items-center justify-center gap-2 text-lg active:scale-[0.98]"
              >
                {isSubmittingOrder ? (
                  <Loader2 size={24} className="animate-spin text-black" />
                ) : (
                  "Подтвердить заказ"
                )}
              </button>

              <p className="text-xs text-center text-slate-400 mt-5 leading-relaxed px-2 font-medium">
                Оформляя заказ, вы соглашаетесь с условиями оферты и политики
                обработки данных.
              </p>
            </div>
          </div>
        </div>
      </div>
      <DeleteConfirmModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={executeDelete}
        title="Удаление адреса"
        message="Вы действительно хотите удалить этот адрес? Это действие нельзя будет отменить."
      />
    </div>
  );
}
