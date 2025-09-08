import Footer from "../components/Footer";
import Navigation from "../components/Navigation";
import TrackParcel from "../components/TrackParcel";

export default function Services() {
    return(
        <div>
            <Navigation/>
            <div className="h-[11vh]">

            </div>
            <div className="flex flex-row bg-gradient-to-b from-[#00000]  to-[#FFA00A] h-[89vh] flex-col  items-center justify-center ">
                <div className="w-[35vw]">
                    <p className="leading-[65px] text-[60px]">Discover The Services We Offer</p>
                </div>
                <div className="w-[30vw]">

                </div>
            </div>
            
            <Footer/>
        </div>
    )
}