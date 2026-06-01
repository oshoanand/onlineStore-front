"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import {
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  User,
  Phone,
  Mail,
  Lock,
  ShoppingBag,
  ShieldCheck,
  BadgePercent,
  Tag,
  TrendingDown,
} from "lucide-react";

import { useRegisterUser } from "@/services/auth";

// --- Zod Validation Schema (Russian) ---
const registerSchema = z.object({
  fullName: z.string().min(2, "Имя должно содержать не менее 2 символов"),
  email: z.string().email("Пожалуйста, введите корректный email"),
  mobile: z.string().refine((val) => {
    const digits = val.replace(/\D/g, "");
    return digits.length === 11 && digits.startsWith("7");
  }, "Введите корректный 10-значный номер"),
  password: z
    .string()
    .min(8, "Пароль должен содержать минимум 8 символов")
    .regex(/[A-Z]/, "Должна быть минимум одна заглавная буква")
    .regex(/[0-9]/, "Должна быть минимум одна цифра"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", email: "", mobile: "", password: "" },
  });

  // --- React Query Mutation ---
  const { mutate: registerUser, isPending } = useRegisterUser(
    () => {
      // On Success: Redirect to login
      router.push("/auth/login?r=true");
    },
    (error) => {
      // On Error: Set the error message
      setServerError(
        error.message ||
          "Не удалось зарегистрироваться. Возможно, этот номер или email уже существует.",
      );
    },
  );

  // --- Mobile Number Masking Logic ---
  const formatMobile = (value: string) => {
    if (!value || value === "+7" || value === "+7 ") return "";
    let digits = value.replace(/\D/g, "");
    if (digits.length > 0 && !digits.startsWith("7")) digits = "7" + digits;
    digits = digits.slice(0, 11);

    let formatted = "";
    if (digits.length > 0) formatted += "+7";
    if (digits.length > 1) formatted += " " + digits.slice(1, 4);
    if (digits.length > 4) formatted += " " + digits.slice(4, 7);
    if (digits.length > 7) formatted += " " + digits.slice(7, 9);
    if (digits.length > 9) formatted += "-" + digits.slice(9, 11);
    return formatted;
  };

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatMobile(e.target.value);
    setValue("mobile", formatted, { shouldValidate: true });
  };

  // --- Submit Handler ---
  const onSubmit = (data: RegisterFormValues) => {
    setServerError(null);
    const cleanMobile = data.mobile.replace(/\D/g, "");
    const tenDigitMobile = cleanMobile.slice(-10);

    registerUser({
      name: data.fullName,
      email: data.email,
      mobile: tenDigitMobile,
      password: data.password,
    });
  };

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-background">
      {/* ========================================== */}
      {/* LEFT PANE: BRANDING (Hidden on Mobile)     */}
      {/* ========================================== */}
      <div className="hidden md:flex w-1/2 bg-brand-muted relative overflow-hidden items-center justify-center p-8 lg:p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-muted to-slate-900 z-0" />
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-brand-primary/10 blur-[120px] z-0" />
        <div className="absolute bottom-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-brand-secondary/10 blur-[100px] z-0" />

        <div className="relative z-10 flex flex-col items-start w-full max-w-xl">
          <div className="w-16 h-16 bg-brand-primary rounded-2xl flex items-center justify-center shadow-lg shadow-brand-primary/30 mb-8">
            <BadgePercent className="text-white w-8 h-8" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-6">
            Товары по{" "}
            <span className="text-brand-secondary">самым низким ценам.</span>
          </h1>
          <p className="text-lg text-slate-300 font-medium leading-relaxed mb-10">
            Получайте доступ к эксклюзивным распродажам и огромным скидкам
            каждый день. Экономьте больше с каждой покупкой.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-brand-secondary/20 flex items-center justify-center shrink-0">
                <Tag className="w-6 h-6 text-brand-secondary" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm lg:text-base">
                  Грандиозные скидки
                </h4>
                <p className="text-slate-400 text-xs lg:text-sm mt-0.5">
                  Ежедневные акции до -70%
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-brand-primary/20 flex items-center justify-center shrink-0">
                <TrendingDown className="w-6 h-6 text-brand-primary" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm lg:text-base">
                  Гарантия цены
                </h4>
                <p className="text-slate-400 text-xs lg:text-sm mt-0.5">
                  Самые низкие на рынке
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 sm:col-span-2 hover:bg-white/10 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm lg:text-base">
                  Безопасные покупки
                </h4>
                <p className="text-slate-400 text-xs lg:text-sm mt-0.5">
                  Полная защита платежей и 100% гарантия качества товаров
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* RIGHT PANE: FORM                           */}
      {/* ========================================== */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-24 xl:px-32 relative bg-brand-surface dark:bg-slate-950 overflow-y-auto">
        {/* Mobile Logo */}
        <div className="md:hidden flex items-center justify-center mb-8 mt-4">
          <div className="w-12 h-12 bg-brand-primary rounded-xl flex items-center justify-center shadow-md">
            <ShoppingBag className="text-white w-6 h-6" />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm mx-auto"
        >
          <h2 className="text-3xl font-black tracking-tight text-foreground mb-2">
            Регистрация
          </h2>
          <p className="text-sm text-slate-500 font-medium mb-8">
            Создайте аккаунт, чтобы начать экономить
          </p>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence>
              {serverError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-sm font-bold rounded-xl border border-red-100 dark:border-red-900/30 text-center mb-4">
                    {serverError}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 1. Full Name Field */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Имя и Фамилия
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User
                    size={18}
                    className={
                      errors.fullName ? "text-red-400" : "text-slate-400"
                    }
                  />
                </div>
                <input
                  id="fullName"
                  type="text"
                  placeholder="Иван Иванов"
                  className={clsx(
                    "block w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-4 transition-all font-semibold text-[15px]",
                    errors.fullName
                      ? "border-red-500 focus:ring-red-500/20 text-red-900 dark:text-red-400"
                      : "border-slate-200 dark:border-slate-800 focus:border-brand-primary focus:ring-brand-primary/10 text-foreground",
                  )}
                  {...register("fullName")}
                />
              </div>
              {errors.fullName && (
                <p className="mt-1.5 text-xs text-red-500 font-bold ml-1">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* 2. Mobile Number Field */}
            <div>
              <label
                htmlFor="mobile"
                className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Номер телефона
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone
                    size={18}
                    className={
                      errors.mobile ? "text-red-400" : "text-slate-400"
                    }
                  />
                </div>
                <input
                  id="mobile"
                  type="tel"
                  placeholder="+7 999 000 00-00"
                  className={clsx(
                    "block w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-4 transition-all font-semibold text-[15px]",
                    errors.mobile
                      ? "border-red-500 focus:ring-red-500/20 text-red-900 dark:text-red-400"
                      : "border-slate-200 dark:border-slate-800 focus:border-brand-primary focus:ring-brand-primary/10 text-foreground",
                  )}
                  {...register("mobile")}
                  onChange={handleMobileChange}
                />
              </div>
              {errors.mobile && (
                <p className="mt-1.5 text-xs text-red-500 font-bold ml-1">
                  {errors.mobile.message}
                </p>
              )}
            </div>

            {/* 3. Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail
                    size={18}
                    className={errors.email ? "text-red-400" : "text-slate-400"}
                  />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="ivan@example.com"
                  className={clsx(
                    "block w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-4 transition-all font-semibold text-[15px]",
                    errors.email
                      ? "border-red-500 focus:ring-red-500/20 text-red-900 dark:text-red-400"
                      : "border-slate-200 dark:border-slate-800 focus:border-brand-primary focus:ring-brand-primary/10 text-foreground",
                  )}
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-500 font-bold ml-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* 4. Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Пароль
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock
                    size={18}
                    className={
                      errors.password ? "text-red-400" : "text-slate-400"
                    }
                  />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={clsx(
                    "block w-full pl-11 pr-12 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-4 transition-all font-semibold text-[15px]",
                    errors.password
                      ? "border-red-500 focus:ring-red-500/20 text-red-900 dark:text-red-400"
                      : "border-slate-200 dark:border-slate-800 focus:border-brand-primary focus:ring-brand-primary/10 text-foreground",
                  )}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-brand-primary transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-500 font-bold ml-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isPending}
                className="w-full flex justify-center items-center gap-2 py-4 px-4 rounded-xl shadow-lg shadow-brand-primary/25 text-[15px] font-bold text-white bg-brand-primary hover:bg-brand-primary-hover focus:outline-none focus:ring-4 focus:ring-brand-primary/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {isPending ? (
                  <>
                    <Loader2 className="animate-spin" size={20} /> Создание
                    аккаунта...
                  </>
                ) : (
                  <>
                    Зарегистрироваться <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Login Link */}
          <div className="mt-8 text-center pb-8">
            <p className="text-sm text-slate-500 font-medium">
              Уже есть аккаунт?{" "}
              <Link
                href="/auth/login"
                className="font-bold text-brand-primary hover:text-brand-primary-hover transition-colors underline-offset-4 hover:underline"
              >
                Войти
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
