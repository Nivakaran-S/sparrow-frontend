import Link from "next/link"
import Image from "next/image"
import Logo from '../images/sparrowLogo.png'

export default function Navigation() {
    return(
        <div>
            <nav className="bg-[#000000]  border-[#FFA00A] z-[999] fixed flex items-center justify-center w-[100vw] h-[11vh]">
                <div className="flex  flex-row items-center justify-between w-[60vw]">
                <Image src={Logo} height={60} alt="logo" />
                <div className="flex w-[30vw] text-[18px] flex-row space-x-[20px] text-white items-center justify-around ">
                        <Link href="/#" className="hover:text-gray-500" >Home</Link>
                    
                        <Link href="/#services" className="hover:text-gray-500">Services</Link>
                    
                        <Link href="/#tracking" className="hover:text-gray-500">Track Package</Link>
                    
                        <Link href="/#pricing" className="hover:text-gray-500">Pricing</Link>
                    
                    <Link href="/#contact" className="hover:text-gray-500">Contact</Link>
                </div>
                <Link href="/login" className="w-[80px] flex flex-row items-center justify-center h-[33px]  hover:bg-[#FFA00A] rounded-[25px] text-black bg-white">
                    Login
                </Link>
                </div>
            </nav>

        </div>
    )
}