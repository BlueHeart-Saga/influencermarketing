// src/components/chat/UserList.jsx
import React from "react";

const UserList = ({ users, selectedUser, onSelectUser, unreadCounts }) => {
  return (
    <div
      style={{
        width: "250px",
        borderRight: "1px solid #ccc",
        overflowY: "auto",
        background: "#f5f5f5",
      }}
    >
      {users.map((u) => (
        <div
          key={u.id}
          onClick={() => onSelectUser(u)}
          style={{
            padding: "10px",
            cursor: "pointer",
            background: selectedUser?.id === u.id ? "#e0e0e0" : "transparent",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{u.username}</span>
          {unreadCounts[u.id] > 0 && (
            <span
              style={{
                background: "red",
                color: "white",
                borderRadius: "50%",
                padding: "2px 6px",
                fontSize: "12px",
              }}
            >
              {unreadCounts[u.id]}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default UserList;
