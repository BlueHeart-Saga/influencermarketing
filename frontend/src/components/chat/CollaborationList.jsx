// C:\Sagadevan\quickbox\frontend\src\components\Chat\CollaborationList.jsx
import React, { useState } from "react";
// import "./CollaborationList.css";

const CollaborationList = ({
  collaborations,
  selectedCollaboration,
  onSelectCollaboration,
  user
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCollaborations = collaborations.filter(collab =>
    collab.campaign_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collab.other_party.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="collaboration-list">
      <div className="list-header">
        <h2>Conversations</h2>
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
      
      <div className="collaborations">
        {filteredCollaborations.length === 0 ? (
          <div className="empty-state">No conversations found</div>
        ) : (
          filteredCollaborations.map(collab => (
            <div
              key={collab.id}
              className={`collaboration-item ${
                selectedCollaboration?.id === collab.id ? "selected" : ""
              } ${collab.unread_count > 0 ? "unread" : ""}`}
              onClick={() => onSelectCollaboration(collab)}
            >
              <div className="collab-avatar">
                {collab.other_party.name.charAt(0).toUpperCase()}
              </div>
              
              <div className="collab-info">
                <div className="collab-name">
                  {collab.other_party.name}
                  {collab.unread_count > 0 && (
                    <span className="unread-badge">{collab.unread_count}</span>
                  )}
                </div>
                <div className="collab-title">{collab.campaign_title}</div>
                {collab.last_message && (
                  <div className="last-message">
                    {collab.last_message.sender_id === user.id ? "You: " : ""}
                    {collab.last_message.content}
                  </div>
                )}
              </div>
              
              {collab.last_message && (
                <div className="message-time">
                  {new Date(collab.last_message.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CollaborationList;