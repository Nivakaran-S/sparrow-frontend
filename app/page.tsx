"use client";
import React, { useEffect } from "react";
import type { Metadata } from "next";
import "./home.css";
import Link from "next/link"; 
import { useState } from "react";

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
    <div className="home-container">
      {/* Navbar */}
      <nav className="notch-navbar">
        <div className="notch-navbar-inner">
          <span className="brand-name">Sparrow </span>
          <div className="nav-links">
            <a href="#" className="nav-link">Home</a>
            <a href="#services" className="nav-link">Services</a>
            <a href="#tracking" className="nav-link">Track Package</a>
            <a href="#pricing" className="nav-link">Pricing</a>
            <a href="#contact" className="nav-link">Contact</a>
          </div>
          <Link href="/login" className="login-btn">
            Login
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content welcome-screen">
        <div>
          <p className="main-text">
            Welcome to <span className="highlight">Sparrow Logistics</span> 
          </p>
          <p className="main-desc">
            Your trusted partner for smart parcel delivery and logistics solutions.<br />
            We provide fast, reliable, and cost-effective delivery services with real-time tracking.<br />
            <span className="main-extra">
              Experience the future of package delivery with our advanced consolidation technology and optimized routes.
            </span>
          </p>
          <div className="cta-buttons">
            <Link href="/login" className="cta-primary">Ship Now</Link>
            <a href="#tracking" className="cta-secondary">Track Package</a>
          </div>
        </div>
      </main>

      {/* Quick Track Section */}
      <section className="quick-track" id="tracking">
        <div className="track-container">
          <h2 className="track-title">Track Your Package</h2>
          <p className="track-subtitle">Enter your tracking number to get real-time updates</p>
          <div className="track-form">
            <input 
              type="text" 
              placeholder="Enter tracking number (e.g., SP2024001)" 
              className="track-input"
            />
            <button className="track-button">Track Now</button>
          </div>
          <div className="track-demo">
            <p className="demo-text">Try demo: <span className="demo-code">SP2024001</span></p>
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* Services Section */}
      <section className="services-section" id="services">
        <h2 className="services-title">Our Customer Services</h2>
        <p className="services-subtitle">Everything you need for hassle-free shipping and delivery</p>
        
        <div className="services-boxes">
          {/* Live Parcel Tracking */}
          <div className="service-box">
            <div className="service-icon"></div>
            <h3>Live Parcel Tracking</h3>
            <p>Track your parcels in real-time with GPS precision. Know exactly where your package is at every moment.</p>
            <div className="service-features">
              <span className="feature"> Mobile notifications</span>
              <span className="feature"> Live map view</span>
              <span className="feature"> Email updates</span>
            </div>
            <Link href="/login" className="service-cta">Start Tracking</Link>
          </div>

          {/* Delivery Time Estimation */}
          <div className="service-box">
            <div className="service-icon"></div>
            <h3>Estimated Delivery Time</h3>
            <p>Get accurate delivery estimates so you can plan accordingly. Never miss a delivery again.</p>
            <div className="service-features">
              <span className="feature"> Precise time windows</span>
              <span className="feature"> Delivery scheduling</span>
              <span className="feature"> Express options</span>
            </div>
            <Link href="/login" className="service-cta">Check Estimates</Link>
          </div>

          {/* Transparent Pricing */}
          <div className="service-box">
            <div className="service-icon"></div>
            <h3>Transparent Delivery Costs</h3>
            <p>Know your delivery costs upfront with our transparent pricing. No hidden fees, ever.</p>
            <div className="service-features">
              <span className="feature">Instant quotes</span>
              <span className="feature">Price comparison</span>
              <span className="feature">Volume discounts</span>
            </div>
            <a href="#pricing" className="service-cta">View Pricing</a>
          </div>

          {/* Smart Consolidation */}
          <div className="service-box">
            <div className="service-icon"></div>
            <h3>Smart Package Consolidation</h3>
            <p>Save money with our intelligent consolidation service. Multiple packages, one delivery.</p>
            <div className="service-features">
              <span className="feature">Cost savings</span>
              <span className="feature">Eco-friendly</span>
              <span className="feature">Easy management</span>
            </div>
            <Link href="/login" className="service-cta">Learn More</Link>
          </div>

          {/* Flexible Delivery Options */}
          <div className="service-box">
            <div className="service-icon"></div>
            <h3>Flexible Delivery Options</h3>
            <p>Choose from express, standard, or scheduled delivery options that fit your needs and budget.</p>
            <div className="service-features">
              <span className="feature">Same-day delivery</span>
              <span className="feature">Scheduled delivery</span>
              <span className="feature">Safe drop-off</span>
            </div>
            <Link href="/login" className="service-cta">Book Delivery</Link>
          </div>

          {/* Customer Support */}
          <div className="service-box">
            <div className="service-icon"></div>
            <h3>24/7 Customer Support</h3>
            <p>Get help when you need it with our round-the-clock customer support team.</p>
            <div className="service-features">
              <span className="feature">Live chat</span>
              <span className="feature">Phone support</span>
              <span className="feature">Email assistance</span>
            </div>
            <button 
              className="service-cta" 
              onClick={() => setIsChatOpen(true)}
            >
              Get Help
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing-section" id="pricing">
        <h2 className="pricing-title">Simple, Transparent Pricing</h2>
        <p className="pricing-subtitle">No hidden fees. Pay only for what you ship.</p>
        
        <div className="pricing-cards">
          <div className="pricing-card">
            <h3 className="pricing-name">Standard</h3>
            <div className="pricing-price">
              <span className="price-currency">$</span>
              <span className="price-amount">5.99</span>
              <span className="price-period">base rate</span>
            </div>
            <ul className="pricing-features">
              <li>✅ 3-5 business days</li>
              <li>✅ Real-time tracking</li>
              <li>✅ Package insurance</li>
              <li>✅ Email notifications</li>
            </ul>
            <p className="pricing-note">+ $0.50/km</p>
          </div>

          <div className="pricing-card featured">
            <div className="featured-badge">Most Popular</div>
            <h3 className="pricing-name">Express</h3>
            <div className="pricing-price">
              <span className="price-currency">$</span>
              <span className="price-amount">12.99</span>
              <span className="price-period">base rate</span>
            </div>
            <ul className="pricing-features">
              <li>✅ 1-2 business days</li>
              <li>✅ Priority handling</li>
              <li>✅ SMS + Email alerts</li>
              <li>✅ Premium insurance</li>
              <li>✅ Scheduled delivery</li>
            </ul>
            <p className="pricing-note">+ $0.75/km</p>
          </div>

          <div className="pricing-card">
            <h3 className="pricing-name">Same Day</h3>
            <div className="pricing-price">
              <span className="price-currency">$</span>
              <span className="price-amount">24.99</span>
              <span className="price-period">base rate</span>
            </div>
            <ul className="pricing-features">
              <li>✅ Same-day delivery</li>
              <li>✅ Live GPS tracking</li>
              <li>✅ Direct driver contact</li>
              <li>✅ Priority support</li>
              <li>✅ Flexible time slots</li>
            </ul>
            <p className="pricing-note">+ $1.25/km</p>
          </div>
        </div>
        
        <div className="pricing-calculator">
          <h3 className="calculator-title">Calculate Your Delivery Cost</h3>
          <div className="calculator-form">
            <input type="text" placeholder="From (zip code)" className="calc-input" />
            <input type="text" placeholder="To (zip code)" className="calc-input" />
            <select className="calc-select">
              <option>Standard</option>
              <option>Express</option>
              <option>Same Day</option>
            </select>
            <button className="calc-button">Calculate</button>
          </div>
        </div>
      </section>

      {/* Features Highlight */}
      <section className="features-highlight">
        <h2 className="features-title">Why Choose Sparrow Logistics?</h2>
        <div className="features-grid">
          <div className="feature-item">
            <div className="feature-icon"></div>
            <h3>98.5% On-Time Delivery</h3>
            <p>Industry-leading delivery performance with our optimized route system</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon"></div>
            <h3>Eco-Friendly Delivery</h3>
            <p>Reduce carbon footprint with our smart consolidation technology</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon"></div>
            <h3>Mobile App</h3>
            <p>Manage all your shipments from our easy-to-use mobile application</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon"></div>
            <h3>Secure & Insured</h3>
            <p>Every package is fully insured and handled with maximum security</p>
          </div>
        </div>
      </section>

      {/* Enhanced Chatbot */}
      <div className={`chatbot-container ${isChatOpen ? 'open' : ''}`}>
        {!isChatOpen && (
          <button 
            className="chatbot-toggle"
            onClick={() => setIsChatOpen(true)}
            aria-label="Open Customer Support"
          >
            <div className="chat-icon">💬</div>
            <div className="chat-pulse"></div>
          </button>
        )}
        
        {isChatOpen && (
          <div className="chatbot-window">
            <div className="chatbot-header">
              <div className="chat-header-info">
                <h3>Customer Support</h3>
                <span className="online-status">🟢 Online</span>
              </div>
              <button 
                className="chatbot-close"
                onClick={() => setIsChatOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="chatbot-messages">
              <div className="bot-message">
                <div className="bot-avatar"></div>
                <div className="message-content">
                  <p>Hi! I'm here to help you with shipping, tracking, and any questions about our services.</p>
                  <div className="quick-actions">
                    <button className="quick-btn">Track Package</button>
                    <button className="quick-btn">Get Quote</button>
                    <button className="quick-btn">Delivery Options</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="chatbot-input">
              <input 
                type="text" 
                placeholder="Type your message or tracking number..." 
                className="chat-input"
              />
              <button className="chat-send">Send</button>
            </div>
          </div>
        )}
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
            <a href="#" className="footer-link">Package Tracking</a>
            <a href="#" className="footer-link">Delivery Estimates</a>
            <a href="#" className="footer-link">Cost Calculator</a>
            <a href="#" className="footer-link">Business Solutions</a>
            <a href="#" className="footer-link">API Integration</a>
          </div>

          {/* Column 3 - Support */}
          <div className="footer-col">
            <h3 className="footer-title">Support</h3>
            <a href="#" className="footer-link">Help Center</a>
            <a href="#" className="footer-link">Contact Us</a>
            <a href="#" className="footer-link">Shipping Guide</a>
            <a href="#" className="footer-link">Terms of Service</a>
            <a href="#" className="footer-link">Privacy Policy</a>
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