
import Link from "next/link"

export default function Hero() {
    return(
        <main className="flex bg-gradient-to-b from-[#808080]  to-white h-[89vh] flex-col  items-center justify-center ">
        <div className="flex  flex-col justify-center items-center">
          <p className="text-[3.2rem] text-center w-[30vw] leading-[54px] text-[#1D1D1D] font-bold">
            Welcome to <span className="text-[#101010]">Sparrow Logistics</span> 
          </p>
          <div className="h-[20px]">

          </div>
            <p className="text-center w-[40vw] text-black text-[20px] leading-[32px]">
            Your trusted partner for smart parcel delivery and logistics solutions.<br />
            We provide fast, reliable, and cost-effective delivery services with real-time tracking.<br />
            <span className="text-[20px]">
              Experience the future of package delivery with our advanced consolidation technology and optimized routes.
            </span>
          </p>
          <div className="h-[20px]">

          </div>
          <div className="flex flex-row space-x-[10px] items-center justify-center">
            <div className=" cursor-pointer  hover:text-white rounded-full text-black  flex items-center justify-center  text-[18px]">
                <Link 
                href="/login"
                  className="px-6 pt-2 pb-3 text-white font-semibold rounded-full backdrop-blur-sm bg-black border border-black/20 hover:bg-black hover:border-[#FFA00A]/50  transition-all duration-300 transform hover:scale-105"
                >
                Ship now
              </Link>
            </div>
            <div className="w-[20px]">

            </div>
            <div className=" cursor-pointer  hover:text-white rounded-full text-black  flex items-center justify-center  text-[18px]">
                <Link 
                href="/track"
                  className="px-6 pt-2 pb-3 text-white font-semibold rounded-full backdrop-blur-sm bg-black border border-black/20 hover:bg-black hover:border-[#FFA00A]/50  transition-all duration-300 transform hover:scale-105"
                >
                Track Package
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
}