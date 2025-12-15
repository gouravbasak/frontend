import AddToCartButton from "../../../components/AddToCartButton";

type Product = {
  _id: string;
  title: string;
  description: string;
  price: number;
  brand: string;
  category: string;
  stock: number;
  images?: string[];
};

async function getProduct(id: string): Promise<Product | null> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE}/api/products/${id}`,
    { cache: "no-store" }
  );

  if (!res.ok) return null;
  return res.json();
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await getProduct(id);

  if (!product) {
    return (
      <main className="py-16 px-6">
        <p className="text-lg font-semibold">Product not found.</p>
      </main>
    );
  }

  const imageSrc = product.images?.[0] || "/placeholder.png";

  return (
    <main className="py-10 px-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row gap-10">
        
        <div className="w-full md:w-1/2 rounded-3xl overflow-hidden bg-neutral-100">
          <img src={imageSrc} alt={product.title} className="w-full h-full object-cover" />
        </div>

        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <h1 className="text-3xl font-bold">{product.title}</h1>

          <div className="flex items-center gap-3">
            <span className="text-gray-400 line-through text-sm">
              ₹{product.price + 500}
            </span>
            <span className="text-2xl font-semibold">₹{product.price}</span>
          </div>

          <p className="text-gray-700 text-sm">{product.description}</p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <AddToCartButton
              productId={product._id}
              title={product.title}
              price={product.price}
              image={product.images?.[0]}
              stock={product.stock}
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
