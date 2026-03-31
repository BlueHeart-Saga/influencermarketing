// C:\Sagadevan\quickbox\frontend\src\components\Chat\MessageList.jsx
import React, { useRef, useEffect, useState } from "react";
import Message from "./Message";
// import "./MessageList.css";

const MessageList = ({ messages, user, typingUsers, onLoadMore }) => {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [isNearTop, setIsNearTop] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!isNearTop) {
      scrollToBottom();
    }
  }, [messages, isNearTop]);

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop } = messagesContainerRef.current;
      setIsNearTop(scrollTop < 100);
      
      // Load more messages when scrolled to top
      if (scrollTop === 0 && messages.length >= 50) {
        onLoadMore();
      }
    }
  };

  const typingUsersList = Object.values(typingUsers);
  const isSomeoneTyping = typingUsersList.length > 0;

  return (
    <div
      className="message-list"
      ref={messagesContainerRef}
      onScroll={handleScroll}
    >
      <div className="messages">
        {messages.map((message) => (
          <Message
            key={message.id}
            message={message}
            isOwn={message.sender_id === user.id}
          />
        ))}
        
        {isSomeoneTyping && (
          <div className="typing-indicator">
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div className="typing-text">
              {typingUsersList.join(", ")} is typing...
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList;