"use client";
import React, { useEffect } from "react";
import type { Metadata } from "next";

import Link from "next/link"; 
import { useState } from "react";
import Image from "next/image";
import Logo from './images/sparrowLogo.png'
import Navigation from "./components/Navigation";
import Hero from "./components/Hero";
import TrackParcel from "./components/TrackParcel";
import Services from "./components/Services";
import Pricing from "./components/PackagePrice";
import WhyChooseUs from "./components/WhyChooseUs";
import Footer from "./components/Footer";
import About from "./components/About";

import Swift from "./components/Swift";

export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  useEffect(() => {
    const boxes = document.querySelectorAll('.service-box');
    const observer = new window.IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.3 }
    );
    boxes.forEach(box => observer.observe(box));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="">
      <Navigation/>
      <div className="h-[11vh]">

      </div>
      <Hero/>

      <About/>
      <Services setIsChatOpen={setIsChatOpen}/>
      

  
      <div className="h-[50vh] bg-black">

      </div>
      {/* Features Highlight */}
      <WhyChooseUs/>

      {/* Enhanced Chatbot */}
      <Swift/>

      {/* Footer */}
      <Footer/>
    </div>
  );
}