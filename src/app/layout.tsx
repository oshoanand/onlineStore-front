import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { Providers } from "@/components/providers";
import ClientLayout from "@/components/layout/ClientLayout";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  colorScheme: "light dark",
};

// --- SEO & OPEN GRAPH METADATA ---
export async function generateMetadata(): Promise<Metadata> {
  const siteName = "Online Shop";
  const defaultDescription = `Find all the electronics, electrical items on ${siteName}.`;
  const appDomain =
    process.env.NEXT_PUBLIC_BASE_URL || "https://app.eventomir.ru";
  const favicon = "/favicon.ico";
  const ogImage = "/images/og-image.png";

  return {
    metadataBase: new URL(appDomain),
    title: {
      default: `${siteName} — Платформа для поиска исполнителей на мероприятия`,
      template: `%s | ${siteName}`,
    },
    description: defaultDescription,
    applicationName: siteName,
    authors: [{ name: `${siteName} Team`, url: appDomain }],
    generator: "Next.js",
    keywords: [
      "организация мероприятий",
      "поиск исполнителей",
      "фотограф на свадьбу",
      "DJ на праздник",
      "ведущий на корпоратив",
      "аренда транспорта",
      siteName,
    ],
    creator: `${siteName} Team`,
    publisher: siteName,
    formatDetection: { telephone: true, address: true, email: true },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: "/",
      title: `${siteName} — Ваш гид в мире событий`,
      description: defaultDescription,
      siteName: siteName,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `Логотип и баннер ${siteName}`,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${siteName} — Поиск профи для мероприятий`,
      description: defaultDescription,
      images: [ogImage],
      creator: "@eventomir",
    },
    icons: { icon: favicon, shortcut: favicon, apple: favicon },
    manifest: "/manifest.json",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: "/",
      languages: { "en-US": "/" },
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" translate="no" suppressHydrationWarning>
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          {" "}
          <ClientLayout>{children}</ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
