import Footer from "../components/Footer";
import Navigation from "../components/Navigation";
import PackagePrice from "../components/PackagePrice";

export default function Pricing() {
    return(
        <div>
            <Navigation/>
            <div className="h-[11vh]">

            </div>
            <div className="flex flex-row bg-gradient-to-b from-[#00000]  to-[#FFA00A] h-[89vh] flex-col  items-center justify-center ">
                <div className="w-[30vw]">
                    <p className="leading-[60px] text-[60px]">Explore the Prices</p>
                </div>
                <div className="w-[30vw]">

                </div>
            </div>
            <PackagePrice/>
            <Footer/>
        </div>
    )
}