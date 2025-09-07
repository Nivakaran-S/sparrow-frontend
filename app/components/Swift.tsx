'use client'
import { useState } from "react"

export default function Swift({}) {
    const [isChatOpen, setIsChatOpen] = useState(false)
    
    return(
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
    )
}