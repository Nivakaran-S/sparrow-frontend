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
        <div className="bg-gradient-to-b w-[100%] flex flex-row space-x-[40px] items-center justify-center from-[#808080]  to-white">
          <LoginForm/>
          <div className="flex flex-col space-y-[15px]">
            <div className="text-black leading-[26px] w-[20vw] bg-[#808080] px-[10px] py-[10px] rounded-[10px] ring-[0.5px] ring-black">
              <p className="text-[23px]">Customer</p>
              <p>Username: james</p>
              <p>Password: james123</p>
            </div>
            <div className="text-black leading-[26px] w-[20vw] bg-[#808080] px-[10px] py-[10px] rounded-[10px] ring-[0.5px] ring-black">
              <p className="text-[23px]">Staff</p>
              <p>Username: james</p>
              <p>Password: james123</p>
            </div>
            <div className="text-black leading-[26px] w-[20vw] bg-[#808080] px-[10px] py-[10px] rounded-[10px] ring-[0.5px] ring-black">
              <p className="text-[23px]">Admin</p>
              <p>Username: james</p>
              <p>Password: james123</p>
            </div>
            <div className="text-black leading-[26px] w-[20vw] bg-[#808080] px-[10px] py-[10px] rounded-[10px] ring-[0.5px] ring-black">
              <p className="text-[23px]">Driver</p>
              <p>Username: james</p>
              <p>Password: james123</p>
            </div>
          </div>

        </div>

      {/* Login Content */}
      

      {/* Footer */}
      <Swift/>
      <Footer/>
    </div>
  );
}