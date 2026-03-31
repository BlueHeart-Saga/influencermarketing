// C:\Sagadevan\quickbox\frontend\src\components\Chat\Message.jsx
import React from "react";
// import "./Message.css";

const Message = ({ message, isOwn }) => {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className={`message ${isOwn ? "own-message" : "other-message"}`}>
      <div className="message-content">
        {!isOwn && <div className="sender-name">{message.sender_name}</div>}
        <div className="message-bubble">
          <div className="message-text">{message.content}</div>
          <div className="message-time">{formatTime(message.timestamp)}</div>
        </div>
      </div>
    </div>
  );
};

export default Message;