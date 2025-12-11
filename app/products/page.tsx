import ProductCard from "../../components/productCard";
type Product = {
  _id: string;
  title: string;
  description: string;
  price: number;
  brand: string;
  category: string;
  images?: string[];
};

async function getProducts(): Promise<Product[]> {
  const res = await fetch("http://localhost:4000/api/products", {
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("API error:", res.status);
    return [];
  }

  try {
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("JSON parse error:", err);
    return [];
  }
}
export default async function productlist () {
  const products = await getProducts();

  return (
    <main className="min-h-screen px-6 py-10">
          <header className="mb-8 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Products</h1>
            <span className="text-sm text-gray-500">
              {products.length} items
            </span>
          </header>
    
          {products.length === 0 && <p>No products found.</p>}
    
          <section className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </section>
        </main>
  );
}