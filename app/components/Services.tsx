import Link from "next/link"

export default function Services(setIsChatOpen: any) {
    return(
        <section className="bg-[#FFA00A] to-black h-[150vh] flex flex-col items-center justify-center " id="services">
            <h2 className="text-[55px] text-black font-bold">Our Customer Services</h2>
            <p className="text-white">Everything you need for hassle-free shipping and delivery</p>
            <div className="h-[40px]">

            </div>
            <div className="grid [grid-template-columns:repeat(auto-fit,minmax(350px,1fr))] gap-8 max-w-[1200px] mx-auto">
            {/* Live Parcel Tracking */}
            <div className="relative h-[55vh] flex flex-col items-center justify-center overflow-hidden text-center rounded-2xl p-8 border border-[#333333] bg-gradient-to-br from-[#111111] to-[#1a1a1a] transition-all duration-300 ease-in-out hover:-translate-y-2 hover:border-blue-400 hover:shadow-[0_20px_40px_rgba(96,165,250,0.2)] before:content-[''] before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-blue-400/10 before:to-transparent before:transition-all before:duration-500 hover:before:left-[100%]">
                <div className="service-icon"></div>
                <h3>Live Parcel Tracking</h3>
                <p>Track your parcels in real-time with GPS precision. Know exactly where your package is at every moment.</p>
                <div className="service-features">
                <span className="feature"> Mobile notifications</span>
                <span className="feature"> Live map view</span>
                <span className="feature"> Email updates</span>
                </div>
                <Link href="/login" className="service-cta">Start Tracking</Link>
            </div>

            {/* Delivery Time Estimation */}
            <div className="relative h-[55vh] flex flex-col items-center justify-center overflow-hidden text-center rounded-2xl p-8 border border-[#333333] bg-gradient-to-br from-[#111111] to-[#1a1a1a] transition-all duration-300 ease-in-out hover:-translate-y-2 hover:border-blue-400 hover:shadow-[0_20px_40px_rgba(96,165,250,0.2)] before:content-[''] before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-blue-400/10 before:to-transparent before:transition-all before:duration-500 hover:before:left-[100%]">
                <div className="service-icon"></div>
                <h3>Estimated Delivery Time</h3>
                <p>Get accurate delivery estimates so you can plan accordingly. Never miss a delivery again.</p>
                <div className="service-features">
                <span className="feature"> Precise time windows</span>
                <span className="feature"> Delivery scheduling</span>
                <span className="feature"> Express options</span>
                </div>
                <Link href="/login" className="service-cta">Check Estimates</Link>
            </div>

            {/* Transparent Pricing */}
            <div className="relative h-[55vh] flex flex-col items-center justify-center overflow-hidden text-center rounded-2xl p-8 border border-[#333333] bg-gradient-to-br from-[#111111] to-[#1a1a1a] transition-all duration-300 ease-in-out hover:-translate-y-2 hover:border-blue-400 hover:shadow-[0_20px_40px_rgba(96,165,250,0.2)] before:content-[''] before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-blue-400/10 before:to-transparent before:transition-all before:duration-500 hover:before:left-[100%]">
                <div className="service-icon"></div>
                <h3>Transparent Delivery Costs</h3>
                <p>Know your delivery costs upfront with our transparent pricing. No hidden fees, ever.</p>
                <div className="service-features">
                <span className="feature">Instant quotes</span>
                <span className="feature">Price comparison</span>
                <span className="feature">Volume discounts</span>
                </div>
                <a href="#pricing" className="service-cta">View Pricing</a>
            </div>

            {/* Smart Consolidation */}
            <div className="relative h-[55vh] flex flex-col items-center justify-center overflow-hidden text-center rounded-2xl p-8 border border-[#333333] bg-gradient-to-br from-[#111111] to-[#1a1a1a] transition-all duration-300 ease-in-out hover:-translate-y-2 hover:border-blue-400 hover:shadow-[0_20px_40px_rgba(96,165,250,0.2)] before:content-[''] before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-blue-400/10 before:to-transparent before:transition-all before:duration-500 hover:before:left-[100%]">
                <div className="service-icon"></div>
                <h3>Smart Package Consolidation</h3>
                <p>Save money with our intelligent consolidation service. Multiple packages, one delivery.</p>
                <div className="service-features">
                <span className="feature">Cost savings</span>
                <span className="feature">Eco-friendly</span>
                <span className="feature">Easy management</span>
                </div>
                <Link href="/login" className="service-cta">Learn More</Link>
            </div>

            {/* Flexible Delivery Options */}
            <div className="relative h-[55vh] flex flex-col items-center justify-center overflow-hidden text-center rounded-2xl p-8 border border-[#333333] bg-gradient-to-br from-[#111111] to-[#1a1a1a] transition-all duration-300 ease-in-out hover:-translate-y-2 hover:border-blue-400 hover:shadow-[0_20px_40px_rgba(96,165,250,0.2)] before:content-[''] before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-blue-400/10 before:to-transparent before:transition-all before:duration-500 hover:before:left-[100%]">
                <div className="service-icon"></div>
                <h3>Flexible Delivery Options</h3>
                <p>Choose from express, standard, or scheduled delivery options that fit your needs and budget.</p>
                <div className="service-features">
                <span className="feature">Same-day delivery</span>
                <span className="feature">Scheduled delivery</span>
                <span className="feature">Safe drop-off</span>
                </div>
                <Link href="/login" className="service-cta">Book Delivery</Link>
            </div>

            {/* Customer Support */}
            <div className="relative h-[55vh] flex flex-col items-center justify-center overflow-hidden text-center rounded-2xl p-8 border border-[#333333] bg-gradient-to-br from-[#111111] to-[#1a1a1a] transition-all duration-300 ease-in-out hover:-translate-y-2 hover:border-blue-400 hover:shadow-[0_20px_40px_rgba(96,165,250,0.2)] before:content-[''] before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-blue-400/10 before:to-transparent before:transition-all before:duration-500 hover:before:left-[100%]">
                <div className="service-icon"></div>
                <h3>24/7 Customer Support</h3>
                <p>Get help when you need it with our round-the-clock customer support team.</p>
                <div className="service-features">
                <span className="feature">Live chat</span>
                <span className="feature">Phone support</span>
                <span className="feature">Email assistance</span>
                </div>
                <button 
                className="service-cta" 
                onClick={() => setIsChatOpen(true)}
                >
                Get Help
                </button>
            </div>
            </div>
        </section>
    )
}