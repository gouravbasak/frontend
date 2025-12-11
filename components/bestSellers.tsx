type Product = {
  _id: string;
  title: string;
  description: string;
  price: number;
  brand: string;
  category: string;
  images?: string[];
  isBestSeller?: boolean;
};

async function getBestSellers(): Promise<Product[]> {
  const res = await fetch("http://localhost:4000/api/products", {
    cache: "no-store",
  });
  if (!res.ok) return [];

  const data = await res.json();
  return data.filter((p: Product) => p.isBestSeller === true);
}

export default async function BestSellers() {
  const bestSellers = await getBestSellers();

  return (
    <section className="w-full mt-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section header */}
        <h2 className="text-2xl md:text-3xl font-bold mb-6">
          Our Best Sellers
        </h2>

        {bestSellers.length === 0 ? (
          <p className="text-gray-500 text-sm">No best sellers found.</p>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
            {bestSellers.map((p) => {
              const imageSrc =
                p.images && p.images.length > 0
                  ? p.images[0]
                  : "/placeholder.png";

              return (
                <div key={p._id} className="flex flex-col gap-3">
                  {/* Big rounded image card */}
                  <div className="relative w-full rounded-[32px] bg-white shadow-sm overflow-hidden aspect-[4/3.5] flex items-center justify-center">
                    <img
                      src={imageSrc}
                      alt={p.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>

                  {/* Text under image */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm md:text-base font-semibold truncate">
                      {p.title}
                    </span>

                    <span className="text-sm text-gray-800 font-medium ml-2">
                      ₹{p.price}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
