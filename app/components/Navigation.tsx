import Link from "next/link"
import Image from "next/image"
import Logo from '../images/sparrowLogo.png'

export default function Navigation() {
    return(
        <div>
            <nav className="bg-[#1D1D1D]  border-[#FFA00A] z-[999] fixed flex items-center justify-center w-[100vw] h-[11vh]">
                <div className="flex  flex-row items-center justify-between w-[70vw]">
                <Image src={Logo} height={60} alt="logo" />
                <div className="flex w-[40vw] text-[18px] flex-row space-x-[60px] text-white items-center justify-center ">
                        <Link href="/" className="hover:text-gray-500" >Home</Link>
                    
                        <Link href="/services" className="hover:text-gray-500">Services</Link>
                    
                        <Link href="/track" className="hover:text-gray-500">Track Package</Link>
                    
                        <Link href="/pricing" className="hover:text-gray-500">Pricing</Link>

                </div>
                <Link href="/login" className="w-[80px] flex flex-row items-center justify-center pt-[5px] py-[6px]  hover:bg-[#FFA00A] rounded-[25px] text-black bg-white">
                    <p>Login</p>
                </Link>
                </div>
            </nav>

        </div>
    )
}