"use client";

import React, { useEffect, Suspense } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import { usePathname } from "next/navigation";

// A clean fallback UI component for suspended page content
export const GlobalLoadingFallback = () => (
  <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="text-sm font-medium text-muted-foreground animate-pulse">
        Loading...
      </p>
    </div>
  </div>
);

const ClientLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  // Prevent the "pull-to-refresh" web bounce effect for a strict native app feel
  useEffect(() => {
    document.body.style.overscrollBehaviorY = "none";
    return () => {
      document.body.style.overscrollBehaviorY = "auto";
    };
  }, []);

  return (
    <div className="flex flex-col min-h-dvh w-full overflow-x-hidden relative">
      <Header />

      {/* Main content wrapper */}
      <main className="grow pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0 relative w-full">
        {/* Suspense is placed HERE so the Header doesn't disappear during page loads */}
        <Suspense fallback={<GlobalLoadingFallback />}>{children}</Suspense>
      </main>

      <div className="hidden md:block">
        <Footer />
      </div>

      <MobileBottomNav />
    </div>
  );
};

export default ClientLayout;
