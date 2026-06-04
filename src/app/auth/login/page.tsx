"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
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
  ShoppingBag,
  ShieldCheck,
  BadgePercent,
  Tag,
  TrendingDown,
} from "lucide-react";

// --- Zod Validation Schema (Russian) ---
const loginSchema = z.object({
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

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();

  const callbackUrl = searchParams.get("callbackUrl") || "/profile";

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Client-side redirect failsafe
  useEffect(() => {
    if (status === "authenticated") {
      router.replace(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { mobile: "", password: "" },
  });

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
  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setAuthError(null);

    const cleanMobile = data.mobile.replace(/\D/g, "");
    const tenDigitMobile = cleanMobile.slice(-10);

    try {
      const res = await signIn("credentials", {
        mobile: tenDigitMobile,
        password: data.password,
        redirect: false,
      });

      if (res?.error) {
        setAuthError("Неверный номер телефона или пароль.");
        setIsLoading(false);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      setAuthError("Произошла ошибка. Пожалуйста, попробуйте снова.");
      setIsLoading(false);
    }
  };

  // Prevent rendering the login form while checking session
  if (status === "loading" || status === "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-brand-primary h-10 w-10" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-white">
      {/* ========================================== */}
      {/* LEFT PANE: BRANDING (Hidden on Mobile)     */}
      {/* ========================================== */}
      <div className="hidden md:flex w-1/2 bg-brand-muted relative overflow-hidden items-center justify-center p-8 lg:p-12">
        {/* Subtle Background Pattern/Gradient */}
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

          {/* Glassmorphism Feature Grid */}
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
      <div className="w-full md:w-1/2 flex flex-col  px-6 py-12 sm:px-12 lg:px-24 xl:px-32 relative bg-white dark:bg-slate-950">
        {/* Mobile Logo (Visible only on small screens) */}
        <div className="md:hidden flex items-center justify-center mb-8">
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
          {/* <h2 className="text-3xl font-black tracking-tight text-foreground mb-2">
            С возвращением
          </h2> */}
          <p className="text-sm text-slate-600 font-medium mb-8">
            Войдите в свой аккаунт для продолжения покупок
          </p>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence>
              {authError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-sm font-bold rounded-xl border border-red-100 dark:border-red-900/30 text-center mb-5">
                    {authError}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mobile Input */}
            <div>
              <label
                htmlFor="mobile"
                className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Номер телефона
              </label>
              <div className="relative group">
                <input
                  id="mobile"
                  type="tel"
                  placeholder="+7 999 000 00-00"
                  className={clsx(
                    "block w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-4 transition-all font-semibold text-[15px]",
                    errors.mobile
                      ? "border-red-500 focus:ring-red-500/20 text-red-900 dark:text-red-400"
                      : "border-slate-200 dark:border-slate-800 focus:border-brand-primary focus:ring-brand-primary/10 text-foreground",
                  )}
                  {...register("mobile")}
                  onChange={handleMobileChange}
                />
              </div>
              {errors.mobile && (
                <p className="mt-2 text-xs text-red-500 font-bold ml-1">
                  {errors.mobile.message}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-sm font-bold text-slate-700 dark:text-slate-300"
                >
                  Пароль
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs font-bold text-brand-primary hover:text-brand-primary-hover transition-colors"
                >
                  Забыли пароль?
                </Link>
              </div>
              <div className="relative group">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={clsx(
                    "block w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-4 transition-all font-semibold text-[15px] pr-12",
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
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-xs text-red-500 font-bold ml-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-4 px-4 rounded-xl shadow-lg shadow-brand-primary/25 text-[15px] font-bold text-white bg-brand-primary hover:bg-brand-primary-hover focus:outline-none focus:ring-4 focus:ring-brand-primary/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} /> Вход...
                  </>
                ) : (
                  <>
                    Войти в систему <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Bottom Link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500 font-medium">
              Нет аккаунта?{" "}
              <Link
                href="/auth/register"
                className="font-bold text-brand-primary hover:text-brand-primary-hover transition-colors underline-offset-4 hover:underline"
              >
                Зарегистрироваться
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
