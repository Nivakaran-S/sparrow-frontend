"use client";
import React, { useState } from "react";
import Link from "next/link";

import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import LoginForm from "../components/LoginForm";
import Swift from "../components/Swift";


export default function Login() {
  

  return (
    <div>
        <Navigation/>
        <div className="h-[11vh]">
    
        </div>
        <div className="bg-gradient-to-b from-[#00000]  to-[#FFA00A]">
          <LoginForm/>
        </div>

      {/* Login Content */}
      

      {/* Footer */}
      <Swift/>
      <Footer/>
    </div>
  );
}