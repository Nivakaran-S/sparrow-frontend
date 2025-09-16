import Link from "next/link"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const SAMPLE_USERS = {
  // Admin users
  'admin@sparrow.com': { password: 'admin123', role: 'admin', name: 'John Admin' },
  'superadmin@sparrow.com': { password: 'super123', role: 'admin', name: 'Super Admin' },
  
  // Staff users
  'staff@sparrow.com': { password: 'staff123', role: 'staff', name: 'Sarah Staff' },
  'warehouse@sparrow.com': { password: 'warehouse123', role: 'staff', name: 'Mike Warehouse' },
  
  // Customer users
  'customer@sparrow.com': { password: 'customer123', role: 'customer', name: 'Alice Customer' },
  'john.doe@email.com': { password: 'john123', role: 'customer', name: 'John Doe' },
  
  // Driver users
  'driver@sparrow.com': { password: 'driver123', role: 'driver', name: 'Bob Driver' },
  'delivery@sparrow.com': { password: 'delivery123', role: 'driver', name: 'Tom Delivery' },
};

export default function LoginForm() {
    const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

 // In your handleLogin function, replace the redirect section with:

const handleLogin = (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setError('');

  // Simulate login delay
  setTimeout(() => {
    const user = SAMPLE_USERS[email.toLowerCase() as keyof typeof SAMPLE_USERS];
    
    if (user && user.password === password) {
      // Store user info in localStorage (in real app, use secure token)
      localStorage.setItem('user', JSON.stringify({
        email,
        role: user.role,
        name: user.name
      }));

      // Add debugging
      console.log('User role:', user.role);
      console.log('Redirecting to:', user.role === 'admin' ? '/admindashboard' : 'other');

      // Redirect based on role
      switch (user.role) {
        case 'admin':
          console.log('Pushing to /admindashboard');
          router.push('/admin');
          break;
        case 'staff':
          router.push('/staff');
          break;
        case 'customer':
          router.push('/customer');
          break;
        case 'driver':
          router.push('/driver');
          break;
        default:
          router.push('/');
      }
    } else {
      setError('Invalid email or password');
    }
    setIsLoading(false);
  }, 1000);
};
    return(
        <div>
            <div className="min-h-[89vh] flex items-center justify-center py-[1rem] ">
        <div className="flex items-center justify-center  w-[100%] max-w-[400px] h-[60vh] bg-white rounded-[1rem] border-[1.5px] border-[#101010] overflow-hidden">
         
         

          {/* Right Side - Login Form */}
          <div className="flex flex-col items-center justify-center  py-[2rem] px-[1.5rem]">
            <div className="w-[100%]  flex flex-col  max-w-[320px] text-white">
              <h2 className="text-[1.9rem] mb-[0.2rem] text-[#101010]">Sign In</h2>
              
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}
              
              <form className="w-[100%] flex flex-col gap-[1rem]" onSubmit={handleLogin}>
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
                <button 
                  type="submit" 
                  className="w-[100%] py-[0.4rem] bg-[#FFA00A] text-black hover:text-white ring-[0.5px] ring-black rounded-[0.5rem] text-[1rem] cursor-pointer mt-[0.75rem] hover:bg-black transition-[0.2s]"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>
              <div className="mt-[1rem] text-center text-[#9ca3af] text-[0.8rem]">
                <Link href="#" className="text-[#60a5fa] my-[0px] mx-[0.25rem] hover:text-black">Forgot password?</Link>
                <span> | </span>
                <Link href="/register" className="text-[#60a5fa] my-[0px] mx-[0.25rem] hover:text-black">Create account</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
        </div>
    )
}