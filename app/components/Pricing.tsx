

export default function Pricing() {
    return(
        <section className="bg-gradient-to-b py-[5vh] flex flex-col items-center justify-center from-[#111111] to-[#000000]" id="pricing">
        <h2 className="pricing-title">Simple, Transparent Pricing</h2>
        <p className="pricing-subtitle">No hidden fees. Pay only for what you ship.</p>
        
        <div className="grid [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))] gap-8 max-w-[1200px] mx-auto mb-16">
          <div className="bg-gradient-to-br h-[50vh] flex flex-col items-center justify-center from-[#1a1a1a] to-[#111111] rounded-xl p-8 border-2 border-[#333333] relative transition-all duration-300 ease-in-out text-center">
            <h3 className="text-2xl font-semibold text-white text-center mb-4">Standard</h3>
            <div className="text-center mb-8">
              <span className="text-2xl text-gray-400 align-top">Rs</span>
              <span className="text-5xl font-bold text-blue-400">5.99</span>
              <span className="text-base text-gray-400 ml-2">base rate</span>
            </div>
            <ul className="">
              <li>✅ 3-5 business days</li>
              <li>✅ Real-time tracking</li>
              <li>✅ Package insurance</li>
              <li>✅ Email notifications</li>
            </ul>
            <p className="text-center text-gray-400 text-sm italic">+ Rs.0.50/km</p>
          </div>

          <div className="bg-gradient-to-br flex flex-col items-center justify-center from-[#1a1a1a] to-[#111111] rounded-xl p-8 border-2 border-[#333333] relative transition-all duration-300 ease-in-out text-center border-[#60a5fa] scale-105 bg-gradient-to-br from-[#1e3a8a] to-[#1a1a1a]">
            <div className="featured-badge">Most Popular</div>
            <h3 className="text-2xl font-semibold text-white text-center mb-4">Express</h3>
            <div className="text-center mb-8">
              <span className="text-2xl text-gray-400 align-top">Rs</span>
              <span className="text-5xl font-bold text-blue-400">12.99</span>
              <span className="text-base text-gray-400 ml-2">base rate</span>
            </div>
            <ul className="">
              <li>✅ 1-2 business days</li>
              <li>✅ Priority handling</li>
              <li>✅ SMS + Email alerts</li>
              <li>✅ Premium insurance</li>
              <li>✅ Scheduled delivery</li>
            </ul>
            <p className="text-center text-gray-400 text-sm italic">+ Rs. 0.75/km</p>
          </div>

          <div className="bg-gradient-to-br flex flex-col items-center justify-center from-[#1a1a1a] to-[#111111] rounded-xl p-8 border-2 border-[#333333] relative transition-all duration-300 ease-in-out text-center">
            <h3 className="text-2xl font-semibold text-white text-center mb-4">Same Day</h3>
            <div className="text-center mb-8">
              <span className="text-2xl text-gray-400 align-top">Rs</span>
              <span className="text-5xl font-bold text-blue-400">24.99</span>
              <span className="text-base text-gray-400 ml-2">base rate</span>
            </div>
            <ul className="">
              <li>✅ Same-day delivery</li>
              <li>✅ Live GPS tracking</li>
              <li>✅ Direct driver contact</li>
              <li>✅ Priority support</li>
              <li>✅ Flexible time slots</li>
            </ul>
            <p className="text-center text-gray-400 text-sm italic">+ Rs. 1.25/km</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#111111] rounded-xl p-8 border border-[#333333] max-w-[600px] mx-auto">
          <h3 className="text-2xl font-semibold text-white text-center mb-6">Calculate Your Delivery Cost</h3>
          <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 items-center">
            <input type="text" placeholder="From (zip code)" className="p-3 border border-[#333333] rounded-md outline-none bg-[#222222] text-white placeholder-gray-500" />
            <input type="text" placeholder="To (zip code)" className="p-3 border border-[#333333] rounded-md outline-none bg-[#222222] text-white placeholder-gray-500" />
            <select className="p-3 border border-[#333333] rounded-md outline-none bg-[#222222] text-white">
              <option>Standard</option>
              <option>Express</option>
              <option>Same Day</option>
            </select>
            <button className="px-6 py-3 bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] text-white rounded-md font-semibold cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(37,99,235,0.4)]">Calculate</button>
          </div>
        </div>
      </section>
    )
}