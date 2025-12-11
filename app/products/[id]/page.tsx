type Product = {
  _id: string;
  title: string;
  description: string;
  price: number;
  brand: string;
  category: string;
  images?: string[];
};

async function getProduct(id: string): Promise<Product | null> {
  const res = await fetch(`http://localhost:4000/api/products/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) return null;
  return res.json();
}

// NOTE: this file stays a server component (default).
// AddToCartButton is a client component — we import it and render it in the JSX.
import AddToCartButton from "../../../components/AddToCartButton"; // <- relative path from app/products/[id]/page.tsx

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // unwrap params

  const product = await getProduct(id);

  if (!product) {
    return (
      <main className="w-full py-16">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-lg font-semibold">Product not found.</p>
        </div>
      </main>
    );
  }

  const imageSrc = product.images?.[0] || "/placeholder.png";

  return (
    <main className="w-full py-10">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row gap-10">
        {/* LEFT IMAGE */}
        <div className="w-full md:w-1/2 rounded-3xl overflow-hidden bg-neutral-100 aspect-[4/5]">
          <img src={imageSrc} alt={product.title} className="w-full h-full object-cover" />
        </div>

        {/* RIGHT SIDE */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <h1 className="text-3xl md:text-4xl font-bold">{product.title}</h1>

          <div className="flex items-baseline gap-3">
            <span className="text-sm text-gray-400 line-through">₹{product.price + 500}</span>
            <span className="text-xl font-semibold">₹{product.price}</span>
          </div>

          <p className="text-sm text-gray-700 leading-relaxed">
            {product.description}
          </p>

          {/* Buttons: use client AddToCartButton for add-to-cart behavior */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <AddToCartButton
              productId={product._id}
              title={product.title}
              price={product.price}
              image={product.images?.[0]}
            />

            <button className="flex-1 rounded-full border border-black py-3 text-sm font-semibold">
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
