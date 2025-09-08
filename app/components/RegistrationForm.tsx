import Link from "next/link"
import { useState } from "react";

export default function RegistrationForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleLogin = () => {
        
    }
    return(
        <div>
            
            <div className="min-h-[89vh] relative top-[-20px] flex-col w-[100%]  flex items-center justify-center py-[1rem] px-[0px] pt-[70px]">
        <div className="flex  items-center justify-center  w-[100%] max-w-[500px] h-[80vh] bg-white rounded-[1rem] border-[1.5px] border-[#101010] overflow-hidden">
         
         

          {/* Right Side - Login Form */}
          <div className="flex flex-col items-center w-[70%] justify-center  py-[2rem] px-[1.5rem]">
            <div className="w-[100%]  flex flex-col  max-w-[350px] text-white">
              <h2 className="text-[1.9rem] mb-[0.2rem] text-[#101010]">Create Account</h2>
              
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}
              
              <form className="w-[100%] flex flex-col gap-[1rem]" onSubmit={handleLogin}>
                <div className="flex flex-col gap-[0.25rem]">
                  <label className="text-[#1D1D1D]  text-[1rem]" htmlFor="email">Full Name</label>
                  <input 
                    type="email" 
                    id="email" 
                    className="py-[0.6rem] px-[0.8rem] focus:border-[#FFA00A] rounded-[0.5rem] border-[1px] border-[#374151] bg-white text-black text-[0.9rem] outline-none transition-[0.2s]" 
                    placeholder="John Doe" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
                <div className="flex flex-col gap-[0.25rem]">
                  <label className="text-[#1D1D1D]  text-[1rem]" htmlFor="email">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    className="py-[0.6rem] px-[0.8rem] focus:border-[#FFA00A] rounded-[0.5rem] border-[1px] border-[#374151] bg-white text-black text-[0.9rem] outline-none transition-[0.2s]" 
                    placeholder="your@email.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
                <div className="flex flex-col gap-[0.25rem]">
                  <label className="text-[#1D1D1D]  text-[1rem]"  htmlFor="password">Password</label>
                  <div className="flex items-center relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      className="py-[0.6rem] px-[0.8rem] w-[100%] focus:border-[#FFA00A] rounded-[0.5rem] border-[1px] border-[#374151] bg-white text-black text-[0.9rem] outline-none transition-[0.2s]"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="ml-[0.5rem] hover:text-[#FFA00A] bg-none border-none text-[#101010] text-[0.75rem] cursor-pointer padding-0 transition-[0.2s] absolute right-[8px]"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-[0.25rem]">
                  <label className="text-[#1D1D1D]  text-[1rem]"  htmlFor="password">Confirm Password</label>
                  <div className="flex items-center relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      className="py-[0.6rem] px-[0.8rem] w-[100%] focus:border-[#FFA00A] rounded-[0.5rem] border-[1px] border-[#374151] bg-white text-black text-[0.9rem] outline-none transition-[0.2s]"
                      placeholder="Confirm Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="ml-[0.5rem] hover:text-[#FFA00A] bg-none border-none text-[#101010] text-[0.75rem] cursor-pointer padding-0 transition-[0.2s] absolute right-[8px]"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
                <button 
                  type="submit" 
                  className="w-[100%] py-[0.4rem] bg-[#FFA00A] text-black hover:text-white ring-[0.5px] ring-black rounded-[0.5rem] text-[1rem] cursor-pointer mt-[0.75rem] hover:bg-black transition-[0.2s]"
                  disabled={isLoading}
                >
                  {isLoading ? 'Registering...' : 'Register'}
                </button>
              </form>
              <div className="mt-[0.5rem] text-center text-[#9ca3af] text-[0.8rem]">
                <p className="text-black">Already have an account? 
                <Link href="/login" className="text-[#60a5fa] my-[0px] mx-[0.25rem] hover:text-black">Sign in</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
        
      </div>
        </div>
    )
}