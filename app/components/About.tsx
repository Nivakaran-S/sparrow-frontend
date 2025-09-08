

export default function About() {
    return(
        <div className="h-[90vh] flex items-center justify-center w-[100%] bg-gradient-to-b from-[#111111] to-[#000000]">
            <div className="w-[30vw]">
                <p className="font-bold text-[50px]">About Us</p>
            </div>
            <div className="w-[30vw] space-y-[15px]">
                <p>Sparrow is a modern parcel consolidation and tracking platform designed to simplify the way businesses and individuals manage their shipments. By bringing multiple parcels into a single, streamlined system, Sparrow reduces shipping costs, optimizes delivery routes, and ensures that every package is tracked in real time.
            </p>
            <p>
                With Sparrow, users gain complete visibility over their shipments, from dispatch to delivery. Our intelligent tracking system provides timely updates and notifications, giving you peace of mind and control over your logistics operations.
            </p>
            <p>
                Whether you are a small business looking to consolidate multiple shipments or an individual seeking a reliable way to monitor your packages, Sparrow offers a fast, secure, and user-friendly solution.
                </p>
            </div>
        </div>
    )
}