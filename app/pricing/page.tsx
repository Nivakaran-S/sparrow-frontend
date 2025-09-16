import Footer from "../components/Footer";
import Navigation from "../components/Navigation";
import PackagePrice from "../components/PackagePrice";

export default function Pricing() {
    return(
        <div>
            <Navigation/>
            <div className="h-[11vh]">

            </div>
            <div className="flex flex-row bg-gradient-to-b from-[#808080]  to-white h-[89vh] flex-col  items-center justify-center ">
                <div className="w-[40vw]">
                    <p className="leading-[60px] text-[#101010] flex flex-col text-[3.2rem]">
                        <span>One Platform. </span>
                        <span>Smarter Shipping.</span>
                        <span>Transparent Pricing.</span>
                    </p>
                </div>
                <div className="w-[30vw]">
                    <p className="text-black">Cut costs by consolidating parcels, reduce delivery times, and track every shipment with Sparrow. No hidden fees, no surprises.</p>
                </div>
            </div>
            <PackagePrice/>
            <Footer/>
        </div>
    )
}