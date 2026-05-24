"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";

// --- Zod Validation Schema ---
const loginSchema = z.object({
  mobile: z.string().refine((val) => {
    const digits = val.replace(/\D/g, "");
    return digits.length === 11 && digits.startsWith("7");
  }, "Please enter a valid 10-digit mobile number"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession(); // 🚨 NEW: Grab the session status

  const callbackUrl = searchParams.get("callbackUrl") || "/profile";

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // 🚨 NEW: Client-side redirect failsafe
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
        setAuthError("Invalid mobile number or password.");
        setIsLoading(false);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      setAuthError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  // 🚨 NEW: Prevent rendering the login form while checking session
  if (status === "loading" || status === "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-brand-primary h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="mx-auto w-12 h-12 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/30 mb-6">
          <span className="text-white font-black text-2xl leading-none">M</span>
        </div>
        <h2 className="text-center text-3xl font-black tracking-tight text-slate-900">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Sign in to your Maachh Express account
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-3xl sm:px-10 border border-slate-100">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {authError && (
              <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-100 text-center">
                {authError}
              </div>
            )}

            <div>
              <label
                htmlFor="mobile"
                className="block text-sm font-bold text-slate-700 mb-1.5"
              >
                Mobile Number
              </label>
              <div className="relative">
                <input
                  id="mobile"
                  type="tel"
                  placeholder="+7 999 000 00-00"
                  className={`block w-full px-4 py-3.5 rounded-xl bg-slate-50 border ${errors.mobile ? "border-red-500 focus:ring-red-500" : "border-slate-200 focus:border-brand-primary focus:ring-brand-primary/20"} focus:outline-none focus:ring-2 transition-all font-medium text-slate-900`}
                  {...register("mobile")}
                  onChange={handleMobileChange}
                />
              </div>
              {errors.mobile && (
                <p className="mt-2 text-sm text-red-500 font-medium">
                  {errors.mobile.message}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-sm font-bold text-slate-700"
                >
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm font-bold text-brand-primary hover:text-brand-secondary transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`block w-full px-4 py-3.5 rounded-xl bg-slate-50 border ${errors.password ? "border-red-500 focus:ring-red-500" : "border-slate-200 focus:border-brand-primary focus:ring-brand-primary/20"} focus:outline-none focus:ring-2 transition-all font-medium text-slate-900 pr-12`}
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
                <p className="mt-2 text-sm text-red-500 font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-brand-primary/20 text-base font-bold text-white bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} /> Signing in...
                  </>
                ) : (
                  <>
                    Sign In <ArrowRight size={20} />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-600 font-medium">
              Don't have an account?{" "}
              <Link
                href="/auth/register"
                className="font-bold text-brand-primary hover:text-brand-secondary transition-colors"
              >
                Sign up now
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
