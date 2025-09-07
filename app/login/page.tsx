"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "../home.css";
import Navigation from "../components/Navigation";

// Sample users with different roles
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

export default function Login() {
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
          router.push('/admindashboard');
          break;
        case 'staff':
          router.push('/staffdashboard');
          break;
        case 'customer':
          router.push('/');
          break;
        case 'driver':
          router.push('/driverdashboard');
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

  return (
    <div className="home-container">
      <Navigation/>

      {/* Login Content */}
      <div className="login-bg">
        <div className="login-content">
         
         

          {/* Right Side - Login Form */}
          <div className="login-right">
            <div className="login-form-container">
              <h2 className="login-title">Sign In</h2>
              
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}
              
              <form className="login-form" onSubmit={handleLogin}>
                <div className="login-field">
                  <label htmlFor="email">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    className="login-input" 
                    placeholder="your@email.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
                <div className="login-field">
                  <label htmlFor="password">Password</label>
                  <div className="login-password-wrap">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      className="login-input"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="show-password-btn"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
                <button 
                  type="submit" 
                  className="login-submit-btn"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>
              <div className="login-footer">
                <Link href="#" className="login-link">Forgot password?</Link>
                <span> | </span>
                <Link href="/register" className="login-link">Create account</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          
          {/* Column 1 - About */}
          <div className="footer-col">
            <h3 className="footer-title">About Sparrow Logistics</h3>
            <p className="text-sm">
              Smart Parcel Consolidation & Last-Mile Delivery Management System.
              Revolutionizing logistics with technology and innovation.
            </p>
            <div className="footer-stats">
              <div className="stat">
                <strong>1M+</strong>
                <span>Packages Delivered</span>
              </div>
              <div className="stat">
                <strong>98.5%</strong>
                <span>On-Time Rate</span>
              </div>
            </div>
          </div>

          {/* Column 2 - Quick Links */}
          <div className="footer-col">
            <h3 className="footer-title">Services</h3>
            <Link href="/#services" className="footer-link">Package Tracking</Link>
            <Link href="/#pricing" className="footer-link">Delivery Estimates</Link>
            <Link href="/#pricing" className="footer-link">Cost Calculator</Link>
            <Link href="/#contact" className="footer-link">Business Solutions</Link>
            <Link href="/#contact" className="footer-link">API Integration</Link>
          </div>

          {/* Column 3 - Support */}
          <div className="footer-col">
            <h3 className="footer-title">Support</h3>
            <Link href="#" className="footer-link">Help Center</Link>
            <Link href="#" className="footer-link">Contact Us</Link>
            <Link href="#" className="footer-link">Shipping Guide</Link>
            <Link href="#" className="footer-link">Terms of Service</Link>
            <Link href="#" className="footer-link">Privacy Policy</Link>
          </div>

          {/* Column 4 - Contact */}
          <div className="footer-col">
            <h3 className="footer-title">Contact Info</h3>
            <div className="contact-info">
              <p>📞 1-800-SPARROW</p>
              <p>📧 support@sparrowlogistics.com</p>
              <p>📍 123 Logistics Ave, Tech City</p>
              <p>🕐 24/7 Customer Support</p>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p>© 2025 Sparrow Logistics. All rights reserved.</p>
            <div className="social-icons">
              <a href="https://github.com" target="_blank" className="social-icon">
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.1 3.29 9.41 7.86 10.94.58.1.79-.25.79-.55v-2.17c-3.2.7-3.87-1.54-3.87-1.54-.53-1.35-1.3-1.7-1.3-1.7-1.07-.73.08-.72.08-.72 1.18.08 1.8 1.2 1.8 1.2 1.05 1.8 2.76 1.28 3.43.98.1-.76.41-1.28.74-1.58-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.2-3.1-.12-.3-.52-1.5.12-3.1 0 0 .98-.31 3.2 1.18a11 11 0 0 1 5.82 0c2.2-1.5 3.19-1.18 3.19-1.18.64 1.6.24 2.8.12 3.1.75.81 1.2 1.84 1.2 3.1 0 4.44-2.69 5.4-5.26 5.68.42.36.8 1.1.8 2.22v3.29c0 .3.2.65.8.54A10.99 10.99 0 0 0 23.5 12c0-6.27-5.23-11.5-11.5-11.5z" />
                </svg>
              </a>
              <a href="https://linkedin.com" target="_blank" className="social-icon">
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.77 0 5-2.24 5-5v-14c0-2.76-2.23-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.27c-.97 0-1.75-.78-1.75-1.73s.78-1.73 1.75-1.73c.96 0 1.75.78 1.75 1.73s-.79 1.73-1.75 1.73zm13.5 11.27h-3v-5.6c0-1.34-.03-3.07-1.87-3.07-1.87 0-2.16 1.46-2.16 2.97v5.7h-3v-10h2.88v1.37h.04c.4-.75 1.38-1.54 2.84-1.54 3.04 0 3.6 2 3.6 4.6v5.6z" />
                </svg>
              </a>
              <a href="https://twitter.com" target="_blank" className="social-icon">
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.95 4.57a10 10 0 0 1-2.83.78 4.93 4.93 0 0 0 2.15-2.71c-.95.56-2 .97-3.12 1.2a4.92 4.92 0 0 0-8.39 4.48 13.94 13.94 0 0 1-10.14-5.14 4.91 4.91 0 0 0 1.52 6.57 4.92 4.92 0 0 1-2.23-.61v.06a4.93 4.93 0 0 0 3.95 4.83 4.9 4.9 0 0 1-2.22.08 4.92 4.92 0 0 0 4.59 3.41A9.86 9.86 0 0 1 1 19.54a13.9 13.9 0 0 0 7.55 2.21c9.05 0 14-7.5 14-14v-.64c.96-.7 1.8-1.56 2.4-2.54z" />
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" className="social-icon">
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.9.3 2.3.5.5.2.8.5 1.2.9.4.4.7.7.9 1.2.2.4.4 1.1.5 2.3.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 1.9-.5 2.3-.2.5-.5.8-.9 1.2-.4.4-.7.7-1.2.9-.4.2-1.1.4-2.3.5-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.9-.3-2.3-.5-.5-.2-.8-.5-1.2-.9-.4-.4-.7-.7-.9-1.2-.2-.4-.4-1.1-.5-2.3C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.3-1.9.5-2.3.2-.5.5-.8.9-1.2.4-.4.7-.7 1.2-.9.4-.2 1.1-.4 2.3-.5C8.4 2.2 8.8 2.2 12 2.2m0-2.2C8.7 0 8.3 0 7 0 5.6 0 4.6.2 3.8.5c-.9.3-1.7.8-2.5 1.6S.8 3.8.5 4.7C.2 5.6 0 6.6 0 8c0 1.3 0 1.7 0 5s0 3.7.1 5c.1 1.4.3 2.4.6 3.3.3.9.8 1.7 1.6 2.5.8.8 1.6 1.3 2.5 1.6.9.3 1.9.5 3.3.6 1.3.1 1.7.1 5 .1s3.7 0 5-.1c1.4-.1 2.4-.3 3.3-.6.9-.3 1.7-.8 2.5-1.6.8-.8 1.3-1.6 1.6-2.5.3-.9.5-1.9.6-3.3.1-1.3.1-1.7.1-5s0-3.7-.1-5c-.1-1.4-.3-2.4-.6-3.3-.3-.9-.8-1.7-1.6-2.5C20.8.8 20 .3 19.1 0c-.9-.3-1.9-.5-3.3-.6C15.7-.7 15.3-.8 12-.8s-3.7 0-5 .1c-1.4.1-2.4.3-3.3.6-.9.3-1.7.8-2.5 1.6-.8.8-1.3 1.6-1.6 2.5-.3.9-.5 1.9-.6 3.3-.1 1.3-.1 1.7-.1 5s0 3.7.1 5c.1 1.4.3 2.4.6 3.3.3.9.8 1.7 1.6 2.5.8.8 1.6 1.3 2.5 1.6.9.3 1.9.5 3.3.6 1.3.1 1.7.1 5 .1s3.7 0 5-.1c1.4-.1 2.4-.3 3.3-.6.9-.3 1.7-.8 2.5-1.6.8-.8 1.3-1.6 1.6-2.5.3-.9.5-1.9.6-3.3.1-1.3.1-1.7.1-5s0-3.7-.1-5c-.1-1.4-.3-2.4-.6-3.3-.3-.9-.8-1.7-1.6-2.5C20.8.8 20 .3 19.1 0c-.9-.3-1.9-.5-3.3-.6C15.7-.7 15.3-.8 12-.8zM12 5.8a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 0 0 0-12.4zm0 10.2a4 4 0 1 1 0-8.1 4 4 0 0 1 0 8.1zm6.4-11.6a1.4 1.4 0 1 1-2.9 0 1.4 1.4 0 0 1 2.9 0z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}