import Footer from "../components/Footer";
import Navigation from "../components/Navigation";
import Swift from "../components/Swift";

import TrackParcel from "../components/TrackParcel";

export default function Track() {
    return(
        <div className="">
              <Navigation/>
              <div className="h-[11vh]">

            </div>
            <div className="flex flex-col space-y-[20px] text-center bg-gradient-to-b from-[#808080]  to-white h-[89vh] flex-col  items-center justify-center ">
                <div className="w-[35vw]">
                    <p className="leading-[60px] text-[3.3rem] text-[#101010] ">Track Every Parcel in Real Time With Ease</p>
                </div>
                <div className="w-[30vw]">
                    <p className="text-black">Enter your tracking ID to see exactly where your shipment is. Sparrow keeps you updated every step of the way.</p>
                </div>
            </div>
            
            <TrackParcel/>
            <Swift/>
            <Footer/>
        </div>
    )
}