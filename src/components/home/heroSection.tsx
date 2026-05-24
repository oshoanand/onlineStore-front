"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-slate-900 text-white">
      {/* Background Image/Gradient */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent z-10" />
        <img
          src="https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=2000&auto=format&fit=crop"
          alt="Premium Collection"
          className="w-full h-full object-cover object-center opacity-60"
        />
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-24 md:py-32 lg:py-40 relative z-20">
        <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 text-sm font-semibold tracking-wide uppercase">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Новая коллекция 2026
          </div>

          <h1 className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tight">
            ШАГНИ ЗА ПРЕДЕЛЫ <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              ВОЗМОЖНОГО.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 max-w-lg font-medium leading-relaxed">
            Премиальная экипировка для тех, кто не ищет компромиссов. Открой для
            себя инновации в каждом движении.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              size="lg"
              className="h-14 px-8 text-base font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-900/20"
            >
              Перейти в каталог
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-8 text-base font-bold text-white border-slate-600 hover:bg-white hover:text-slate-900 bg-transparent"
            >
              Выбор редакции <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
