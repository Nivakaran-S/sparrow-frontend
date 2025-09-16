"use client";
import React, { useState } from "react";
import Link from "next/link";

import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import RegistrationForm from "../components/RegistrationForm";
import Swift from "../components/Swift";


export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="">
      <Navigation/>
      <div className="h-[10vh] bg-white">
          
      </div>
      <div className="bg-gradient-to-b from-[#808080]  to-white">
        <RegistrationForm/>
      </div>
      <Swift/>
     <Footer/>
    </div>
  );
}