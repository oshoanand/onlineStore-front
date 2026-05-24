import Image from "next/image";
import { notFound } from "next/navigation";
import ProductActionButtons from "@/components/product/ProductActionButtons";

// Fetch from your API Gateway
async function getProduct(id: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/products/${id}`,
      {
        next: { revalidate: 60 },
      },
    );
    if (!res.ok) return null;
    const { data } = await res.json();
    return data;
  } catch (error) {
    return null;
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProduct(params.id);

  if (!product) return notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Image Gallery */}
        <div className="bg-slate-50 rounded-3xl overflow-hidden relative aspect-square">
          <Image
            src={product.imageThumbUrl || "/placeholder.png"}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Product Details & Actions */}
        <div className="flex flex-col">
          <p className="text-sm font-bold text-brand-primary uppercase tracking-widest mb-2">
            {product.category}
          </p>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
            {product.name}
          </h1>
          <p className="text-2xl font-bold text-slate-900 mb-6">
            ₹{product.price}
          </p>

          <div className="prose text-slate-600 mb-8">
            <p>{product.description}</p>
          </div>

          <div className="mb-8">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${product.inventory > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
            >
              {product.inventory > 0 ? "In Stock" : "Out of Stock"}
            </span>
          </div>

          {/* Interactive Client Component */}
          <ProductActionButtons product={product} />
        </div>
      </div>
    </div>
  );
}
