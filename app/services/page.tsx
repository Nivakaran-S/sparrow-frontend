import Footer from "../components/Footer";
import Navigation from "../components/Navigation";
import Swift from "../components/Swift";
import TrackParcel from "../components/TrackParcel";

export default function Services() {
    return(
        <div>
            <Navigation/>
            <div className="h-[11vh]">

            </div>
            <div className="flex flex-col text-center  md:flex-row bg-gradient-to-b from-[#808080]  to-white h-[89vh] flex-col  items-center justify-center ">
                <div className="w-[35vw]">
                    <p className="leading-[60px]  text-[3.2rem] text-black  flex flex-col ">
                        All-in-One Parcel Consolidation, Made Simple
                    </p>
                </div>
                <div className="w-[30vw]">
                    <p className="text-black">Sparrow streamlines your logistics by combining, managing, and delivering parcels smarter and faster.</p>
                </div>
            </div>
            <Swift/>
            <Footer/>
        </div>
    )
}