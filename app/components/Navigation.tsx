"use client"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import Logo from '../images/SparrowLogo2.png'

export default function Navigation() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const navItems = [
        { name: "Home", href: "/" },
        { name: "Track Package", href: "/track" },
        { name: "Pricing", href: "/pricing" },
        { name: "ETA Service", href: "/eta-service" }
    ]

    return (
        <nav className="fixed top-0 left-0 right-0  py-[8px]  z-50 bg-[#1D1D1D]/95 backdrop-blur-md border-b border-[#FFA00A]/20 shadow-lg">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex-shrink-0 transition-transform hover:scale-105 duration-300">
                        <Image src={Logo} height={50} alt="Sparrow Logo" priority />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex  justify-center items-center space-x-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="relative px-4 py-2 text-white/90 hover:text-[#FFA00A] text-xl font-medium transition-all duration-300 group"
                            >
                                {item.name}
                                
                            </Link>
                        ))}
                    </div>

                    {/* Login Button - Desktop */}
                    <div className="hidden md:block">
                        <Link 
                        href="/login"
                        className="px-6 pt-2 pb-3 text-white font-semibold rounded-full backdrop-blur-sm bg-white/10 border border-white/20 hover:bg-white/20 hover:border-[#FFA00A]/50  transition-all duration-300 transform hover:scale-105"
                    >
                        Login
                    </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 rounded-lg text-white/90 hover:bg-white/10 transition-colors"
                        aria-label="Toggle menu"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            {isMobileMenuOpen ? (
                                <path d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <div
                className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
                    isMobileMenuOpen ? 'max-h-96 border-t border-[#FFA00A]/20' : 'max-h-0'
                }`}
            >
                <div className="px-6 py-4 space-y-3 bg-[#1D1D1D]/98">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block px-4 py-2.5 text-white/90 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
                        >
                            {item.name}
                        </Link>
                    ))}
                    <Link 
                        href="/login"
                        className="px-6 py-2.5 text-white font-semibold rounded-full backdrop-blur-sm bg-white/10 border border-white/20 hover:bg-white/20 hover:border-[#FFA00A]/50  transition-all duration-300 transform hover:scale-105"
                    >
                        Login
                    </Link>

                </div>
            </div>
        </nav>
    )
}
