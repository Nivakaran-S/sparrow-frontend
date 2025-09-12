
import Link from "next/link"

export default function Hero() {
    return(
        <main className="flex bg-gradient-to-b from-[#000000]  to-[#FFA00A] h-[89vh] flex-col  items-center justify-center ">
        <div className="flex  flex-col justify-center items-center">
          <p className="text-[3.2rem] text-center w-[30vw] leading-[54px] text-white font-bold">
            Welcome to <span className="text-[#FFF]">Sparrow Logistics</span> 
          </p>
          <div className="h-[20px]">

          </div>
            <p className="text-center w-[40vw]  text-[20px] leading-[32px]">
            Your trusted partner for smart parcel delivery and logistics solutions.<br />
            We provide fast, reliable, and cost-effective delivery services with real-time tracking.<br />
            <span className="text-[20px]">
              Experience the future of package delivery with our advanced consolidation technology and optimized routes.
            </span>
          </p>
          <div className="h-[20px]">

          </div>
          <div className="flex flex-row space-x-[10px] items-center justify-center">
            <div className="bg-white hover:bg-black hover:text-white cursor-pointer rounded-[5px] text-black w-[130px] flex items-center justify-center py-[8px] text-[18px]">
                <Link href="/login" className="">Ship Now</Link>
            </div>
            <div className="w-[20px]">

            </div>
            <div className="bg-white cursor-pointer hover:bg-black hover:text-white rounded-[5px] text-black w-[150px] flex items-center justify-center py-[8px] text-[18px]">
                <Link href="/track" className="">Track Package</Link>
            </div>
          </div>
        </div>
      </main>
    )
}