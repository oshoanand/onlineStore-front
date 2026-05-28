"use client";

import React, { useState, useRef, useEffect, cloneElement } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Camera,
  Image as ImageIcon,
  User,
  Edit2,
  Check,
  Phone,
  HelpCircle,
  Share2,
  LogOut,
  X,
  Upload,
  Loader2,
  Package,
  Mail,
  ChevronRight,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useCreateSupportTicket } from "@/services/support";
import {
  useUpdateProfileDetails,
  useUpdateProfileImage,
} from "@/services/user";
import { useToast } from "@/hooks/useToast";
import { formatPhoneNumber } from "@/utils/helper";

export default function ProfilePage() {
  const { data: session, update: updateSession, status } = useSession();
  const { toast } = useToast();
  const router = useRouter();

  // --- UI State ---
  const [showImageSourceDialog, setShowImageSourceDialog] = useState(false);
  const [showSupportSheet, setShowSupportSheet] = useState(false);

  // Support State
  const [supportType, setSupportType] = useState("BUG");
  const [problemDescription, setProblemDescription] = useState("");
  const [problemImage, setProblemImage] = useState<File | null>(null);

  // Remove the callback arguments from here
  const { mutate: submitTicket, isPending: isSubmittingTicket } =
    useCreateSupportTicket();

  // Refs
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const supportFileRef = useRef<HTMLInputElement>(null);

  // Details Editing State
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");

  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [emailInput, setEmailInput] = useState("");

  // Safely extract user profile data from session
  const userProfile = session?.user as any;
  const profileId = userProfile?.id;

  // Sync inputs with session data on load
  useEffect(() => {
    if (userProfile) {
      setNameInput(userProfile.name || "");
      setEmailInput(userProfile.email || "");
    }
  }, [userProfile]);

  // --- Mutations ---
  const updateDetailsMutation = useUpdateProfileDetails(
    async () => {
      // 1. Update NextAuth Session client-side
      await updateSession({
        name: isEditingName ? nameInput : userProfile.name,
        email: isEditingEmail ? emailInput : userProfile.email,
      });

      // 2. Reset UI state
      setIsEditingName(false);
      setIsEditingEmail(false);

      toast({
        variant: "success",
        title: "Сохранено",
        description: "Данные профиля успешно обновлены.",
      });
    },
    (error) => {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message || "Не удалось обновить профиль.",
      });
    },
  );

  const updateImageMutation = useUpdateProfileImage(
    async (response) => {
      await updateSession({ image: response.data.profilePhoto });

      toast({
        variant: "success",
        title: "Фото обновлено",
        description: "Ваша фотография профиля успешно загружена.",
      });
    },
    (error) => {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message || "Не удалось загрузить фотографию.",
      });
    },
  );

  const handleSubmitSupport = () => {
    if (!problemDescription.trim()) {
      toast({
        title: "Внимание",
        description: "Пожалуйста, опишите вашу проблему.",
        variant: "destructive",
      });
      return;
    }

    // Pass the data as the first argument, and callbacks as the second
    submitTicket(
      {
        mobile: userProfile?.mobile || "Гость",
        supportType: supportType,
        description: problemDescription,
        attachment: problemImage,
      },
      {
        onSuccess: () => {
          setShowSupportSheet(false);
          setProblemDescription("");
          setProblemImage(null);

          toast({
            variant: "success",
            title: "Отправлено",
            description: "Ваше сообщение успешно отправлено.",
          });
        },
        onError: (error: any) => {
          toast({
            variant: "destructive",
            title: "Ошибка",
            description: error?.message || "Не удалось отправить запрос.",
          });
        },
      },
    );
  };

  // --- Handlers ---
  const handleNameSave = () => {
    if (!nameInput.trim() || nameInput === userProfile?.name) {
      setIsEditingName(false);
      return;
    }
    updateDetailsMutation.mutate({ profileId, fullName: nameInput });
  };

  const handleEmailSave = () => {
    if (!emailInput.trim() || emailInput === userProfile?.email) {
      setIsEditingEmail(false);
      return;
    }
    updateDetailsMutation.mutate({ profileId, email: emailInput });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profileId) return;

    setShowImageSourceDialog(false);
    updateImageMutation.mutate({ profileId, file });

    // Reset file inputs so the same file can be selected again
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  const handleShareApp = async () => {
    const shareData = {
      title: "Store Front",
      text: "Checkout this amazing app!",
      url: window.location.origin,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(shareData.url);
      toast({
        title: "Скопировано",
        description: "Ссылка скопирована в буфер обмена.",
      });
    }
  };

  const handleLogout = async () => await signOut({ callbackUrl: "/login" });

  const isUpdating =
    updateDetailsMutation.isPending || updateImageMutation.isPending;

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="w-8 h-8 text-[#005BFF] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-28 md:pb-12 md:pt-10">
      <div className="max-w-5xl mx-auto md:px-6">
        {/* Desktop Page Title */}
        <div className="hidden md:flex items-center justify-between mb-8 px-4 md:px-0">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Личный кабинет
          </h1>
          {userProfile?.mobile && (
            <div className="flex items-center gap-2 text-sm font-bold text-green-600 bg-green-50 px-4 py-2 rounded-full border border-green-100">
              <ShieldCheck size={18} /> Подтвержденный аккаунт
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-0 md:gap-8 lg:gap-12">
          {/* ==========================================
              LEFT COLUMN: Profile Card
              ========================================== */}
          <div className="md:col-span-5 lg:col-span-4">
            <div className="bg-white flex flex-col items-center pt-10 pb-8 px-4 md:rounded-[32px] shadow-sm border-b md:border border-slate-100 md:sticky md:top-24">
              {/* <div className="relative group mb-6">
                <div className="w-32 h-32 md:w-44 md:h-44 rounded-full border-4 border-[#005BFF]/10 overflow-hidden bg-slate-50 relative shadow-inner">
                  {userProfile?.image ? (
                    <img
                      src={userProfile.image}
                      alt="Profile"
                      className={`w-full h-full object-cover transition-opacity ${isUpdating ? "opacity-50" : "opacity-100"}`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 bg-[#005BFF]/5">
                      <User className="w-16 h-16 text-[#005BFF]/30" />
                    </div>
                  )}
                  {updateImageMutation.isPending && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setShowImageSourceDialog(true)}
                  disabled={isUpdating}
                  className="absolute bottom-2 right-2 bg-[#005BFF] text-white p-3 rounded-full shadow-lg active:scale-90 transition-transform hover:bg-blue-700 disabled:opacity-70 border-4 border-white"
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div> */}

              <div
                className="relative group mb-6 cursor-pointer"
                onClick={() => !isUpdating && setShowImageSourceDialog(true)}
              >
                <div className="w-32 h-32 md:w-44 md:h-44 rounded-full border-4 border-[#005BFF]/10 overflow-hidden bg-slate-50 relative shadow-inner">
                  {userProfile?.image ? (
                    <img
                      src={userProfile.image}
                      alt="Profile"
                      className={`w-full h-full object-cover transition-opacity duration-300 ${isUpdating ? "opacity-50" : "opacity-100 group-hover:opacity-75"}`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 bg-[#005BFF]/5 transition-opacity duration-300 group-hover:opacity-75">
                      <User className="w-16 h-16 text-[#005BFF]/30" />
                    </div>
                  )}

                  {updateImageMutation.isPending && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  )}

                  {/* Centered Camera Icon (Visible on Hover) */}
                  {!updateImageMutation.isPending && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-black/40 text-white p-3 md:p-4 rounded-full backdrop-blur-sm">
                        <Camera className="w-6 h-6 md:w-8 md:h-8" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Name Display / Edit */}
              {!isEditingName ? (
                <div className="text-center flex items-center justify-center gap-2 w-full px-4 mb-2">
                  <h2 className="text-2xl font-black text-slate-900 truncate">
                    {userProfile?.name || "Имя не указано"}
                  </h2>
                  <button
                    onClick={() => setIsEditingName(true)}
                    disabled={isUpdating}
                    className="p-2 text-slate-400 hover:text-[#005BFF] transition-colors rounded-full hover:bg-slate-50 shrink-0"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-1 mb-2">
                  <input
                    type="text"
                    autoFocus
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="text-center text-xl font-bold border-b-2 border-[#005BFF] bg-transparent focus:outline-none w-48"
                  />
                  <button
                    onClick={handleNameSave}
                    disabled={isUpdating}
                    className="p-1.5 bg-green-100 text-green-700 rounded-full hover:bg-green-200 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingName(false);
                      setNameInput(userProfile?.name || "");
                    }}
                    className="p-1.5 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              {/* 
              <p className="text-slate-500 font-bold text-sm mb-4">
                {formatPhoneNumber(userProfile?.mobile) || "Телефон не указан"}
              </p> */}
            </div>
          </div>

          {/* ==========================================
              RIGHT COLUMN: Details & Settings
              ========================================== */}
          <div className="md:col-span-7 lg:col-span-8 px-4 md:px-0 mt-6 md:mt-0 space-y-8">
            {/* Account Details */}
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2 mb-3">
                Контактные данные
              </h3>
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex items-center gap-4 p-5 border-b border-slate-50">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 flex-shrink-0">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">
                      Мобильный телефон
                    </p>
                    <p className="font-semibold text-slate-900">
                      {formatPhoneNumber(userProfile?.mobile) || "Не указан"}
                    </p>
                  </div>
                </div>

                {/* Email Display / Edit inside the card */}
                <div className="flex items-center justify-between gap-4 p-5">
                  <div className="flex items-center gap-4 overflow-hidden flex-1">
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 flex-shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>

                    {!isEditingEmail ? (
                      <div className="flex-1 truncate">
                        <p className="text-xs font-bold text-slate-400 uppercase">
                          Email адрес
                        </p>
                        <p className="font-semibold text-slate-900 truncate">
                          {userProfile?.email || "Не указан"}
                        </p>
                      </div>
                    ) : (
                      <div className="flex-1">
                        <p className="text-xs font-bold text-[#005BFF] uppercase mb-1">
                          Редактирование Email
                        </p>
                        <input
                          type="email"
                          autoFocus
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          className="w-full text-sm font-semibold border-b-2 border-[#005BFF] bg-transparent focus:outline-none"
                          placeholder="example@mail.com"
                        />
                      </div>
                    )}
                  </div>

                  {!isEditingEmail ? (
                    <button
                      onClick={() => setIsEditingEmail(true)}
                      disabled={isUpdating}
                      className="p-2 text-slate-400 hover:text-[#005BFF] transition-colors rounded-full hover:bg-slate-50 shrink-0"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={handleEmailSave}
                        disabled={isUpdating}
                        className="p-1.5 bg-green-100 text-green-700 rounded-full hover:bg-green-200"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingEmail(false);
                          setEmailInput(userProfile?.email || "");
                        }}
                        className="p-1.5 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Menu Actions */}
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2 mb-3">
                Настройки и действия
              </h3>
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                <MenuItem
                  icon={<Package className="text-[#005BFF]" />}
                  title="Мои заказы"
                  subtitle="История и статус доставок"
                  onClick={() => router.push("/profile/orders")}
                />
                <div className="h-px bg-slate-50 mx-4" />
                <MenuItem
                  icon={<HelpCircle className="text-amber-500" />}
                  title="Служба поддержки"
                  subtitle="Сообщить о проблеме или задать вопрос"
                  onClick={() => setShowSupportSheet(true)}
                />
                <div className="h-px bg-slate-50 mx-4" />
                <MenuItem
                  icon={<Share2 className="text-purple-500" />}
                  title="Поделиться приложением"
                  subtitle="Пригласите друзей"
                  onClick={handleShareApp}
                />
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 p-5 rounded-3xl bg-red-50 text-red-600 font-bold hover:bg-red-100 active:scale-[0.98] transition-all border border-red-100"
            >
              <LogOut size={20} /> Выйти
            </button>
          </div>
        </div>
      </div>

      {/* ==========================================
          DIALOGS & BOTTOM SHEETS
          ========================================== */}

      {/* 1. Image Source Dialog */}
      <AnimatePresence>
        {showImageSourceDialog && (
          <DialogOverlay onDismiss={() => setShowImageSourceDialog(false)}>
            <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 md:p-8 shadow-2xl text-center">
              <h3 className="text-xl font-black text-slate-900 mb-6">
                Обновить фото
              </h3>
              <div className="flex gap-4">
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex-1 p-5 rounded-2xl bg-slate-50 border border-slate-100 text-slate-700 flex flex-col items-center hover:bg-[#005BFF]/5 hover:text-[#005BFF] hover:border-[#005BFF]/20 transition-all group"
                >
                  <Camera className="mb-2 w-7 h-7 text-slate-400 group-hover:text-[#005BFF] transition-colors" />
                  <span className="text-sm font-bold">Камера</span>
                </button>
                <button
                  onClick={() => galleryInputRef.current?.click()}
                  className="flex-1 p-5 rounded-2xl bg-slate-50 border border-slate-100 text-slate-700 flex flex-col items-center hover:bg-[#005BFF]/5 hover:text-[#005BFF] hover:border-[#005BFF]/20 transition-all group"
                >
                  <ImageIcon className="mb-2 w-7 h-7 text-slate-400 group-hover:text-[#005BFF] transition-colors" />
                  <span className="text-sm font-bold">Галерея</span>
                </button>
              </div>
              <button
                onClick={() => setShowImageSourceDialog(false)}
                className="w-full mt-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
              >
                Отмена
              </button>
            </div>

            <input
              type="file"
              ref={cameraInputRef}
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleImageSelect}
            />
            <input
              type="file"
              ref={galleryInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />
          </DialogOverlay>
        )}
      </AnimatePresence>

      {/* 2. Responsive Support Modal/Sheet */}
      <AnimatePresence>
        {showSupportSheet && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[90]"
              onClick={() => setShowSupportSheet(false)}
            />
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 bg-white z-[100] rounded-t-3xl md:rounded-[2rem] p-6 md:p-8 max-h-[90vh] md:max-h-[85vh] md:w-full md:max-w-md overflow-y-auto pb-10 md:pb-8 shadow-2xl"
            >
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 md:hidden" />
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-slate-900">
                  Поддержка
                </h2>
                <button
                  onClick={() => setShowSupportSheet(false)}
                  className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              <div className="flex gap-2 mb-6 bg-slate-100 p-1.5 rounded-xl">
                {[
                  { id: "BUG", label: "ОШИБКА" },
                  { id: "FEEDBACK", label: "ИДЕЯ" },
                  { id: "OTHER", label: "ДРУГОЕ" },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSupportType(type.id)}
                    className={`flex-1 py-2.5 text-[10px] sm:text-xs font-bold rounded-lg transition-all ${
                      supportType === type.id
                        ? "bg-white text-[#005BFF] shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>

              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-500 mb-2">
                  ЧЕМ МЫ МОЖЕМ ПОМОЧЬ?
                </label>
                <textarea
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  placeholder="Опишите проблему подробно..."
                  className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 min-h-[120px] outline-none focus:border-[#005BFF] focus:ring-2 focus:ring-[#005BFF]/20 transition-all resize-none"
                />
              </div>

              <div className="mb-8">
                <label className="block text-xs font-bold text-slate-500 mb-2">
                  СКРИНШОТ (НЕОБЯЗАТЕЛЬНО)
                </label>
                <div
                  onClick={() => supportFileRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-[#005BFF]/50 transition-colors"
                >
                  {problemImage ? (
                    <div className="flex items-center text-[#005BFF] font-bold">
                      <Check className="w-5 h-5 mr-2" />{" "}
                      <span className="truncate max-w-[200px]">
                        {problemImage.name}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-slate-400">
                      <Upload className="w-6 h-6 mb-2" />
                      <span className="text-sm font-medium">
                        Загрузить файл
                      </span>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  ref={supportFileRef}
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) setProblemImage(e.target.files[0]);
                  }}
                />
              </div>

              <button
                onClick={handleSubmitSupport}
                disabled={isSubmittingTicket}
                className="w-full py-4 bg-[#005BFF] text-white font-bold text-lg rounded-xl active:scale-[0.98] transition-transform disabled:opacity-70 flex justify-center shadow-lg shadow-blue-500/20"
              >
                {isSubmittingTicket ? (
                  <Loader2 className="animate-spin w-6 h-6" />
                ) : (
                  "Отправить запрос"
                )}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function MenuItem({ icon, title, subtitle, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center p-4 md:p-5 transition-all text-left group hover:bg-slate-50 active:bg-slate-100"
    >
      <div className="p-3 rounded-xl mr-4 md:mr-5 bg-slate-50 group-hover:bg-white group-hover:shadow-sm transition-all flex-shrink-0">
        {cloneElement(icon, {
          className: `w-6 h-6 ${icon.props.className || ""}`,
        })}
      </div>
      <div className="flex-1 truncate">
        <h4 className="font-bold text-base text-slate-900 group-hover:text-[#005BFF] transition-colors">
          {title}
        </h4>
        <p className="text-xs md:text-sm mt-0.5 text-slate-500 truncate">
          {subtitle}
        </p>
      </div>
      <ChevronRight className="text-slate-300 group-hover:text-[#005BFF] transition-colors flex-shrink-0 ml-2" />
    </button>
  );
}

function DialogOverlay({
  children,
  onDismiss,
}: {
  children: React.ReactNode;
  onDismiss: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
      onClick={onDismiss}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md flex justify-center"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
