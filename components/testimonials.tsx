export default function Testimonials() {
  return (
    <section className="w-full mt-20">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Heading */}
        <h2 className="text-3xl md:text-4xl font-semibold uppercase tracking-wide mb-10">
          FIND OUT WHAT PEOPLE ARE SAYING ABOUT QUENX
        </h2>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Testimonial Card 1 */}
          <div className="bg-[#f5f7f8] rounded-3xl p-8 shadow-sm">
            <h3 className="text-xl font-bold text-blue-600 mb-3">
              "Eco-Friendly and Stylish"
            </h3>
            <p className="text-gray-700 text-sm mb-6 leading-relaxed">
              Use this space to share a testimonial quote about the business,
              its products or its services. Include a quote from an actual
              customer to build trust and attract site visitors.
            </p>

            <div className="flex items-center gap-4 mt-auto">
              <img
                src="/testimonial.png"
                className="h-14 w-14 rounded-full object-cover"
                alt="User"
              />
              <span className="text-sm font-semibold">James Mitchell</span>
            </div>
          </div>

          {/* Testimonial Card 2 */}
          <div className="bg-[#f5f7f8] rounded-3xl p-8 shadow-sm">
            <h3 className="text-xl font-bold text-blue-600 mb-3">
              "Ideal for Active Lifestyles"
            </h3>
            <p className="text-gray-700 text-sm mb-6 leading-relaxed">
              Use this space to share a testimonial quote about the business,
              its products or its services. Include a quote from an actual
              customer to build trust and attract site visitors.
            </p>

            <div className="flex items-center gap-4 mt-auto">
              <img
                src="/testimonial.png"
                className="h-14 w-14 rounded-full object-cover"
                alt="User"
              />
              <span className="text-sm font-semibold">Rebecca Thompson</span>
            </div>
          </div>

          {/* Testimonial Card 3 */}
          <div className="bg-[#f5f7f8] rounded-3xl p-8 shadow-sm">
            <h3 className="text-xl font-bold text-blue-600 mb-3">
              "My New Daily Essential"
            </h3>
            <p className="text-gray-700 text-sm mb-6 leading-relaxed">
              Use this space to share a testimonial quote about the business,
              its products or its services. Include a quote from an actual
              customer to build trust and attract site visitors.
            </p>

            <div className="flex items-center gap-4 mt-auto">
              <img
                src="/testimonial.png"
                className="h-14 w-14 rounded-full object-cover"
                alt="User"
              />
              <span className="text-sm font-semibold">Sophia Navarro</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
