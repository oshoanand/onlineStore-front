"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  User,
  Phone,
  Mail,
  Lock,
} from "lucide-react";

import { useRegisterUser } from "@/services/auth";

// --- Zod Validation Schema ---
const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  mobile: z.string().refine((val) => {
    const digits = val.replace(/\D/g, "");
    // UI mask forces it to start with 7 and have exactly 11 digits total (7 + 10 digits)
    return digits.length === 11 && digits.startsWith("7");
  }, "Please enter a valid 10-digit mobile number"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
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
          "Registration failed. This mobile number or email might already exist.",
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

    // 1. Strip all non-digit formatting
    const cleanMobile = data.mobile.replace(/\D/g, "");

    // 2. Extract ONLY the last 10 digits (dropping the 7)
    const tenDigitMobile = cleanMobile.slice(-10);

    // Fire the mutation
    registerUser({
      name: data.fullName,
      email: data.email,
      mobile: tenDigitMobile,
      password: data.password,
    });
  };

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
          Create an account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Join Maachh Express for fresh deliveries today
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-3xl sm:px-10 border border-slate-100">
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {serverError && (
              <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-100 text-center">
                {serverError}
              </div>
            )}

            {/* 1. Full Name Field */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-bold text-slate-700 mb-1.5"
              >
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User
                    size={20}
                    className={
                      errors.fullName ? "text-red-400" : "text-slate-400"
                    }
                  />
                </div>
                <input
                  id="fullName"
                  type="text"
                  placeholder="Rahul Sharma"
                  className={`block w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 border ${
                    errors.fullName
                      ? "border-red-500 focus:ring-red-500"
                      : "border-slate-200 focus:border-brand-primary focus:ring-brand-primary/20"
                  } focus:outline-none focus:ring-2 transition-all font-medium text-slate-900`}
                  {...register("fullName")}
                />
              </div>
              {errors.fullName && (
                <p className="mt-1.5 text-xs text-red-500 font-bold">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* 2. Mobile Number Field */}
            <div>
              <label
                htmlFor="mobile"
                className="block text-sm font-bold text-slate-700 mb-1.5"
              >
                Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone
                    size={20}
                    className={
                      errors.mobile ? "text-red-400" : "text-slate-400"
                    }
                  />
                </div>
                <input
                  id="mobile"
                  type="tel"
                  placeholder="+7 999 000 00-00"
                  className={`block w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 border ${
                    errors.mobile
                      ? "border-red-500 focus:ring-red-500"
                      : "border-slate-200 focus:border-brand-primary focus:ring-brand-primary/20"
                  } focus:outline-none focus:ring-2 transition-all font-medium text-slate-900`}
                  {...register("mobile")}
                  onChange={handleMobileChange}
                />
              </div>
              {errors.mobile && (
                <p className="mt-1.5 text-xs text-red-500 font-bold">
                  {errors.mobile.message}
                </p>
              )}
            </div>

            {/* 3. Email Address Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-bold text-slate-700 mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail
                    size={20}
                    className={errors.email ? "text-red-400" : "text-slate-400"}
                  />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="rahul@example.com"
                  className={`block w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 border ${
                    errors.email
                      ? "border-red-500 focus:ring-red-500"
                      : "border-slate-200 focus:border-brand-primary focus:ring-brand-primary/20"
                  } focus:outline-none focus:ring-2 transition-all font-medium text-slate-900`}
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-500 font-bold">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* 4. Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-bold text-slate-700 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock
                    size={20}
                    className={
                      errors.password ? "text-red-400" : "text-slate-400"
                    }
                  />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`block w-full pl-11 pr-12 py-3.5 rounded-xl bg-slate-50 border ${
                    errors.password
                      ? "border-red-500 focus:ring-red-500"
                      : "border-slate-200 focus:border-brand-primary focus:ring-brand-primary/20"
                  } focus:outline-none focus:ring-2 transition-all font-medium text-slate-900`}
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
                <p className="mt-1.5 text-xs text-red-500 font-bold">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-brand-primary/20 text-base font-bold text-white bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account <ArrowRight size={20} />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Login Link */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-600 font-medium">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="font-bold text-brand-primary hover:text-brand-secondary transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
