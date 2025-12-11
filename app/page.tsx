import Link from "next/link";
import BestSellers from "../components/bestSellers";
import Testimonials from "@/components/testimonials";
export default function HomePage() {
  return (
    <main className="w-full py-8">
      <section className="w-full">
        <div className="max-w-7xl mx-auto px-4">
          {/* Hero Card */}
          <div
            className="relative overflow-hidden rounded-[32px] bg-cover bg-center min-h-[450px] md:min-h-[550px] flex items-center"
            style={{ backgroundImage: "url('/banner.png')" }}
          >
            {/* Right: Text */}
            <div className="ml-auto px-8 py-12 md:py-20 text-right max-w-xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-black drop-shadow-sm">
                WANT IT,
                <br />
                GOT IT.
              </h1>

              <p className="mt-4 text-base md:text-lg text-black/80 font-medium">
                just a click away.
              </p>

              {/* Button */}
              <Link href="/products">
                <button className="mt-6 px-6 py-3 bg-black text-white rounded-full text-sm font-semibold hover:bg-gray-900 transition">
                  Find All Products
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      <BestSellers />
      <Testimonials />
    </main>
  );
}
