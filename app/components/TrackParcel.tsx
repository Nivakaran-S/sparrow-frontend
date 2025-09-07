

export default function TrackParcel() {
    return(
        <section className="h-[50vh] flex items-center justify-center w-[100%] bg-gradient-to-b from-[#111111] to-[#000000] " id="tracking">
            <div className="track-container">
            <h2 className="text-[2.5rem] font-bold text-[#fff]">Track Your Package</h2>
            <p className="text-[#fff] text-[20px]">Enter your tracking number to get real-time updates</p>
            <div className="h-[20px]">

            </div>
            <div className="flex flex-row ">
                <input 
                type="text" 
                placeholder="Enter tracking number (e.g., SP2024001)" 
                className="flex-1 px-4 border-2  border-[#333333] rounded-xl text-base outline-none transition-colors duration-300 h-[6vh] w-[15vw] bg-[#1a1a1a] text-white"
                />
                <div className="w-[10px]">

                </div>
                <button className="track-button">Track Now</button>
            </div>
            <div className="h-[15px]">

            </div>
            <div className="track-demo">
                <p className="demo-text">Try demo: <span className="demo-code">SP2024001</span></p>
            </div>
            </div>
        </section>
    )
}