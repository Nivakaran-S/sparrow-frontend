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
import Pricing from "./components/Pricing";
import WhyChooseUs from "./components/WhyChooseUs";
import Footer from "./components/Footer";

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

      <TrackParcel/>
      <Services setIsChatOpen={setIsChatOpen}/>
      

      <hr className="section-divider" />
      <Pricing/>

      
      

      {/* Features Highlight */}
      <WhyChooseUs/>

      {/* Enhanced Chatbot */}
      

      {/* Footer */}
      <Footer/>
    </div>
  );
}