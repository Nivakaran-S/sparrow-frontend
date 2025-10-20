import Footer from "../components/Footer";
import Navigation from "../components/Navigation";
import ETACalculator from "../components/ETACalculator";
import Swift from "../components/Swift";

export default function ETA() {
    return(
        <div>
            <Navigation/>
            <div className="h-[11vh]">
            </div>
            
            <div className="flex flex-col space-y-[20px] text-center bg-gradient-to-b from-[#808080] to-white h-[89vh] flex-col items-center justify-center">
                <div className="w-[40vw]">
                    <p className="leading-[60px] text-[#101010] flex flex-col text-[3.2rem]">
                        <span>Track Your Package.</span>
                        <span>Know Your Timeline.</span>
                        <span>Stay Informed.</span>
                    </p>
                </div>
                <div className="w-[30vw]">
                    <p className="text-black">
                        Get real-time delivery estimates for your consolidated parcels. 
                        Enter your tracking number below to see when your package will arrive.
                    </p>
                </div>
            </div>
            
            <ETACalculator/>
            <Swift/>
            <Footer/>
        </div>
    )
}
