import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const ProfessionalChatbot = () => {
  const [messages, setMessages] = useState([
    { 
      sender: "bot", 
      text: "Hello! 👋 I'm your AI Marketing Assistant. How can I help you today?",
      timestamp: new Date(),
      type: "text"
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const quickActions = [
    { icon: "🎯", text: "Campaign Ideas", query: "Give me influencer campaign ideas" },
    { icon: "📱", text: "Social Strategy", query: "Create a social media strategy" },
    { icon: "🎨", text: "Content Ideas", query: "Suggest content creation ideas" },
    { icon: "📊", text: "Analytics Tips", query: "Best practices for marketing analytics" }
  ];

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  const sendMessage = async (messageText = input) => {
    if (!messageText.trim()) return;

    const userMessage = { 
      sender: "user", 
      text: messageText, 
      timestamp: new Date(),
      type: "text"
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setIsTyping(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/chatbot/generate`, {
        prompt: messageText,
      });

      const botResponse = response.data?.response || "I apologize, but I couldn't process your request. Please try again.";
      
      // Simulate typing delay for better UX
      setTimeout(() => {
        setMessages((prev) => [...prev, { 
          sender: "bot", 
          text: botResponse, 
          timestamp: new Date(),
          type: "text"
        }]);
        setIsTyping(false);
        setLoading(false);
      }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds

    } catch (error) {
      console.error("Chat API Error:", error);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { 
            sender: "bot", 
            text: "I'm having trouble connecting right now. Please try again in a moment.", 
            timestamp: new Date(),
            type: "text"
          },
        ]);
        setIsTyping(false);
        setLoading(false);
      }, 500);
    }
  };

  const handleQuickAction = (query) => {
    sendMessage(query);
  };

  const clearChat = () => {
    setMessages([messages[0]]);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Handle key press for sending message
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading && input.trim()) {
      sendMessage();
    }
  };

  return (
    <div className="chatbot-container">
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          className="chatbot-button"
          onClick={() => setIsOpen(true)}
          aria-label="Open chat"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M12 2a9 9 0 0 0-9 9v4a3 3 0 0 0 3 3h3l3 4 3-4h3a3 3 0 0 0 3-3v-4a9 9 0 0 0-9-9z"/>
  <path d="M9 11h.01M12 11h.01M15 11h.01"/>
</svg>

          <div className="chatbot-badge">AI</div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="header-left">
              <div className="avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                  <path d="M2 17l10 5 10-5"></path>
                  <path d="M2 12l10 5 10-5"></path>
                </svg>
              </div>
              <div className="header-info">
                <div className="header-title">AI Assistant</div>
                <div className="header-status">
                  <span className="status-dot"></span>
                  {isTyping ? 'Typing...' : 'Online'}
                </div>
              </div>
            </div>
            <div className="header-actions">
              <button
                className="header-button"
                onClick={clearChat}
                aria-label="Clear chat"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="1 4 1 10 7 10"></polyline>
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                </svg>
              </button>
              <button
                className="header-button"
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="messages-container">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`message-wrapper ${msg.sender === 'user' ? 'user-message' : 'bot-message'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="bot-avatar">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                    </svg>
                  </div>
                )}
                <div className={`message-bubble ${msg.sender === 'user' ? 'user-bubble' : 'bot-bubble'}`}>
                  <div className="message-text">{msg.text}</div>
                  <div className="message-time">{formatTime(msg.timestamp)}</div>
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="message-wrapper bot-message">
                <div className="bot-avatar">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                  </svg>
                </div>
                <div className="message-bubble bot-bubble">
                  <div className="typing-indicator">
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length === 1 && (
            <div className="quick-actions">
              <div className="quick-actions-title">Quick Actions</div>
              <div className="quick-actions-grid">
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    className="quick-action-button"
                    onClick={() => handleQuickAction(action.query)}
                  >
                    <span className="quick-action-icon">{action.icon}</span>
                    <span className="quick-action-text">{action.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="input-container">
            <input
              ref={inputRef}
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="chat-input"
              disabled={loading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className={`send-button ${loading || !input.trim() ? 'send-button-disabled' : ''}`}
              aria-label="Send message"
            >
              {loading ? (
                <div className="spinner"></div>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              )}
            </button>
          </div>

          {/* Footer */}
          <div className="chatbot-footer">
            <span className="footer-text">Powered by AI</span>
          </div>
        </div>
      )}

      {/* CSS Styles */}
      <style jsx>{`
        .chatbot-container {
          position: fixed;
          bottom: 80px;
          right: 20px;
          z-index: 9999;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .chatbot-button {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          border: none;
          box-shadow: 0 4px 16px rgba(37, 99, 235, 0.4);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          transition: transform 0.3s ease;
          color: white;
        }

        .chatbot-button:hover {
          transform: scale(1.1);
        }

        .chatbot-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #10b981;
          color: white;
          font-size: 10px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
        }

        .chatbot-window {
          width: 380px;
          height: 600px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: slideUp 0.3s ease;
        }

        .chatbot-header {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: white;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .header-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 2px;
        }

        .header-status {
          font-size: 12px;
          opacity: 0.9;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          animation: pulse 2s infinite;
        }

        .header-actions {
          display: flex;
          gap: 8px;
        }

        .header-button {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }

        .header-button:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          background: #f9fafb;
        }

        .message-wrapper {
          display: flex;
          margin-bottom: 16px;
          gap: 8px;
          align-items: flex-end;
        }

        .user-message {
          justify-content: flex-end;
        }

        .bot-message {
          justify-content: flex-start;
        }

        .bot-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #e0e7ff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .message-bubble {
          max-width: 75%;
          padding: 12px 16px;
          border-radius: 12px;
          animation: fadeIn 0.3s ease;
        }

        .user-bubble {
          background: #2563eb;
          color: white;
          border-bottom-right-radius: 4px;
        }

        .bot-bubble {
          background: white;
          color: #1f2937;
          border: 1px solid #e5e7eb;
          border-bottom-left-radius: 4px;
        }

        .message-text {
          font-size: 14px;
          line-height: 1.5;
          margin-bottom: 4px;
        }

        .message-time {
          font-size: 11px;
          opacity: 0.6;
        }

        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: 4px 0;
        }

        .typing-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #9ca3af;
          animation: bounce 1.4s infinite;
        }

        .typing-dot:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-dot:nth-child(3) {
          animation-delay: 0.4s;
        }

        .quick-actions {
          padding: 16px 20px;
          border-top: 1px solid #e5e7eb;
          background: white;
        }

        .quick-actions-title {
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .quick-actions-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .quick-action-button {
          padding: 12px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
          font-size: 13px;
          font-weight: 500;
          color: #374151;
        }

        .quick-action-button:hover {
          background: #f0f9ff;
          border-color: #2563eb;
        }

        .quick-action-icon {
          font-size: 16px;
        }

        .input-container {
          padding: 16px 20px;
          background: white;
          border-top: 1px solid #e5e7eb;
          display: flex;
          gap: 8px;
        }

        .chat-input {
          flex: 1;
          padding: 12px 16px;
          border: 1px solid #e5e7eb;
          border-radius: 24px;
          outline: none;
          font-size: 14px;
          transition: border-color 0.2s;
        }

        .chat-input:focus {
          border-color: #2563eb;
        }

        .chat-input:disabled {
          background-color: #f9fafb;
          cursor: not-allowed;
        }

        .send-button {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #2563eb;
          border: none;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
          flex-shrink: 0;
        }

        .send-button:hover:not(.send-button-disabled) {
          background: #1d4ed8;
        }

        .send-button-disabled {
          background: #d1d5db;
          cursor: not-allowed;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        .chatbot-footer {
          padding: 12px 20px;
          background: #f9fafb;
          border-top: 1px solid #e5e7eb;
          text-align: center;
        }

        .footer-text {
          font-size: 11px;
          color: #9ca3af;
        }

        /* Animations */
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Scrollbar styling */
        .messages-container::-webkit-scrollbar {
          width: 6px;
        }
        
        .messages-container::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .messages-container::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }
        
        .messages-container::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }

        /* Responsive design */
        @media (max-width: 480px) {
          .chatbot-window {
            width: 100vw;
            height: 100vh;
            border-radius: 0;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
          }
          
          .chatbot-container {
            bottom: 10px;
            right: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default ProfessionalChatbot;