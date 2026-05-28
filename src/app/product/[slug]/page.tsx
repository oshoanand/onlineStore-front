import { Metadata } from "next";
import { getProductBySlug } from "@/services/product";
import { notFound } from "next/navigation";
import ProductClientView from "@/components/product/ProductClientView";

// 🚨 UPDATE: In Next.js 15+, params is a Promise
interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

// ==========================================
// 1. DYNAMIC SEO & OPEN GRAPH METADATA
// ==========================================
export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  try {
    // 🚨 FIX: Await the params promise before accessing .slug
    const resolvedParams = await params;
    const product = await getProductBySlug(resolvedParams.slug);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://yourdomain.com";

    const title = product.metaTitle || product.name;
    const description = product.metaDescription || product.description;
    const imageUrl = product.thumbImage || `${appUrl}/default-og-image.jpg`;

    return {
      title: `${title} | Store Front`,
      description: description,
      keywords: product.keywords,
      openGraph: {
        title: title,
        description: description,
        url: `${appUrl}/product/${product.slug}`,
        siteName: "Store Front",
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: product.name,
          },
        ],
        locale: "ru_RU",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: title,
        description: description,
        images: [imageUrl],
      },
    };
  } catch (error) {
    return {
      title: "Товар не найден | Store Front",
    };
  }
}

// ==========================================
// 2. SERVER COMPONENT RENDERER
// ==========================================
export default async function ProductPage({ params }: ProductPageProps) {
  try {
    // 🚨 FIX: Await the params promise before accessing .slug
    const resolvedParams = await params;
    const product = await getProductBySlug(resolvedParams.slug);

    if (!product) {
      notFound();
    }

    return (
      <div className="min-h-screen bg-[#F5F6F8] dark:bg-slate-950 pb-24 md:pb-12 md:pt-8">
        <div className="max-w-6xl mx-auto px-0 md:px-6">
          {/* We pass the server-fetched data into our interactive Client Component */}
          <ProductClientView product={product} />
        </div>
      </div>
    );
  } catch (error) {
    notFound();
  }
}
