

export default function WhyChooseUs() {
    return(
        <section className="px-8 py-20 bg-gradient-to-t flex flex-col items-center justify-center from-[#000000] to-[#FFA00A]   border-t border-[#333333]">
        <h2 className="text-5xl font-bold text-white text-center mb-16">Why Choose Sparrow Logistics?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12 max-w-[1200px] mx-auto">
          <div className="text-center p-8 bg-gradient-to-br from-[#1a1a1a] to-[#111111] rounded-xl border border-[#333333] transition-all duration-300 hover:-translate-y-2 hover:border-blue-400 hover:shadow-[0_20px_40px_rgba(96,165,250,0.2)]">
            <div className="text-5xl mb-4 block"></div>
            <h3 className="text-xl font-semibold text-white mb-4">98.5% On-Time Delivery</h3>
            <p className="text-gray-300 leading-relaxed">Industry-leading delivery performance with our optimized route system</p>
          </div>
          <div className="text-center p-8 bg-gradient-to-br from-[#1a1a1a] to-[#111111] rounded-xl border border-[#333333] transition-all duration-300 hover:-translate-y-2 hover:border-blue-400 hover:shadow-[0_20px_40px_rgba(96,165,250,0.2)]">
            <div className="text-5xl mb-4 block"></div>
            <h3 className="text-xl font-semibold text-white mb-4">Eco-Friendly Delivery</h3>
            <p className="text-gray-300 leading-relaxed">Reduce carbon footprint with our smart consolidation technology</p>
          </div>
          <div className="text-center p-8 bg-gradient-to-br from-[#1a1a1a] to-[#111111] rounded-xl border border-[#333333] transition-all duration-300 hover:-translate-y-2 hover:border-blue-400 hover:shadow-[0_20px_40px_rgba(96,165,250,0.2)]">
            <div className="text-5xl mb-4 block"></div>
            <h3 className="text-xl font-semibold text-white mb-4">Mobile App</h3>
            <p className="text-gray-300 leading-relaxed">Manage all your shipments from our easy-to-use mobile application</p>
          </div>
          <div className="text-center p-8 bg-gradient-to-br from-[#1a1a1a] to-[#111111] rounded-xl border border-[#333333] transition-all duration-300 hover:-translate-y-2 hover:border-blue-400 hover:shadow-[0_20px_40px_rgba(96,165,250,0.2)]">
            <div className="text-5xl mb-4 block"></div>
            <h3 className="text-xl font-semibold text-white mb-4">Secure & Insured</h3>
            <p className="text-gray-300 leading-relaxed">Every package is fully insured and handled with maximum security</p>
          </div>
        </div>
      </section>
    )
}