// src/components/chat/ChatWindow.jsx
import React, { useState, useEffect, useRef } from "react";

const ChatWindow = ({ messages, onSendMessage, onTyping, typingUsers, isConnected, currentUser }) => {
  const [input, setInput] = useState("");
  const typingTimeout = useRef(null);
  const messagesEndRef = useRef(null);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    onTyping(true);
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => onTyping(false), 1000);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput("");
    onTyping(false);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#fff" }}>
      <div
        style={{
          flex: 1,
          padding: "10px",
          overflowY: "auto",
          borderBottom: "1px solid #ccc",
        }}
      >
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              marginBottom: "8px",
              textAlign: m.sender_id === currentUser.id ? "right" : "left",
            }}
          >
            <div
              style={{
                display: "inline-block",
                padding: "6px 10px",
                borderRadius: "10px",
                background: m.sender_id === currentUser.id ? "#0084ff" : "#e5e5ea",
                color: m.sender_id === currentUser.id ? "#fff" : "#000",
                maxWidth: "70%",
                wordBreak: "break-word",
              }}
            >
              {m.content}
            </div>
          </div>
        ))}
        {Object.values(typingUsers)
          .filter(Boolean)
          .map((name) => (
            <div key={name} style={{ fontStyle: "italic", color: "#555" }}>
              {name} is typing...
            </div>
          ))}
        <div ref={messagesEndRef} />
      </div>
      <div style={{ display: "flex", padding: "10px", borderTop: "1px solid #ccc" }}>
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          style={{ flex: 1, padding: "8px", borderRadius: "20px", border: "1px solid #ccc" }}
          placeholder={isConnected ? "Type a message..." : "Connecting..."}
          disabled={!isConnected}
        />
        <button
          onClick={handleSend}
          style={{
            marginLeft: "10px",
            padding: "8px 12px",
            borderRadius: "20px",
            background: "#0084ff",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
