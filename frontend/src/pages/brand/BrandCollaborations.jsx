// src/pages/brand/BrandCollaborations.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Badge,
  CircularProgress,
  IconButton,
  Alert,
  Snackbar,
} from "@mui/material";
import { Send, ArrowBack, Search } from "@mui/icons-material";
import { collaborationAPI } from "../../services/collaborationAPI";

const BrandCollaborations = () => {
  const [collaborations, setCollaborations] = useState([]);
  const [influencers, setInfluencers] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);

  const currentUser = {
    id: localStorage.getItem("user.id"),
    username: localStorage.getItem("username"),
    role: localStorage.getItem("role"),
  };

  useEffect(() => {
    loadCollaborations();
    loadInfluencers();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const safeString = (val) => (val != null ? String(val) : "");

  const loadCollaborations = async () => {
    if (!currentUser.id) return;
    setIsLoading(true);
    try {
      const data = await collaborationAPI.getUserCollaborations(
        safeString(currentUser.id)
      );
      setCollaborations(Array.isArray(data) ? data : []);
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadInfluencers = async () => {
    try {
      const data = await collaborationAPI.getInfluencers(
        safeString(currentUser.id)
      );
      setInfluencers(Array.isArray(data) ? data : []);
    } catch (err) {
      handleError(err);
    }
  };

  const handleError = (err) => {
    let msg = "Something went wrong";
    if (err?.detail) {
      if (Array.isArray(err.detail)) {
        msg = err.detail.map((d) => d.msg || JSON.stringify(d)).join(", ");
      } else if (typeof err.detail === "string") {
        msg = err.detail;
      } else {
        msg = JSON.stringify(err.detail);
      }
    } else if (err?.message) {
      msg = err.message;
    }
    setError(msg);
  };

  const startCollaboration = async (influencerId) => {
    if (!currentUser.id || !influencerId) {
      setError("Missing brand or influencer ID");
      return;
    }
    try {
      const collab = await collaborationAPI.createCollaboration(
        safeString(currentUser.id),
        safeString(influencerId),
        "Hello! I’d like to discuss a collaboration opportunity."
      );
      if (collab) {
        setCollaborations((prev) => [collab, ...prev]);
        selectChat(collab);
      }
    } catch (err) {
      handleError(err);
    }
  };

  const selectChat = async (collab) => {
    setSelectedChat(collab);
    if (collab?.id) {
      loadMessages(collab.id);
    }
  };

  const loadMessages = async (collabId) => {
    try {
      const data = await collaborationAPI.getMessages(
        safeString(collabId),
        safeString(currentUser.id)
      );
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      handleError(err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const message = await collaborationAPI.sendMessage(
        safeString(selectedChat.id),
        safeString(currentUser.id),
        newMessage
      );
      if (message) {
        setMessages((prev) => [...prev, message]);
        setNewMessage("");
        loadCollaborations(); // refresh last message
      }
    } catch (err) {
      handleError(err);
    }
  };

  const filteredCollaborations = collaborations.filter((collab) =>
    safeString(collab.influencer_name)
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const filteredInfluencers = influencers.filter((influencer) =>
    safeString(influencer.username)
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "background.default" }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: 350,
          borderRight: 1,
          borderColor: "divider",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
          <Typography variant="h6" gutterBottom>
            Collaborations
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ color: "text.secondary", mr: 1 }} />,
            }}
          />
        </Box>

        <Box sx={{ flex: 1, overflow: "auto" }}>
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            filteredCollaborations.map((collab) => (
              <Box
                key={safeString(collab.id)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  p: 2,
                  borderBottom: 1,
                  borderColor: "divider",
                  cursor: "pointer",
                  bgcolor:
                    selectedChat?.id === collab.id
                      ? "action.selected"
                      : "transparent",
                  "&:hover": { bgcolor: "action.hover" },
                }}
                onClick={() => selectChat(collab)}
              >
                <Avatar sx={{ mr: 2 }}>
                  {safeString(collab.influencer_name).charAt(0)}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2">
                    {safeString(collab.influencer_name)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {collab.last_message?.content
                      ? safeString(collab.last_message.content)
                      : "No messages yet"}
                  </Typography>
                </Box>
                {collab.unread_count > 0 && (
                  <Badge badgeContent={collab.unread_count} color="primary" />
                )}
              </Box>
            ))
          )}
        </Box>

        {/* Available Influencers */}
        <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
          <Typography variant="subtitle2" gutterBottom>
            Available Influencers
          </Typography>
          <Box sx={{ maxHeight: 200, overflow: "auto" }}>
            {filteredInfluencers.map((influencer) => (
              <Box
                key={safeString(influencer.id)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  p: 1,
                  cursor: "pointer",
                  "&:hover": { bgcolor: "action.hover" },
                }}
                onClick={() => startCollaboration(influencer.id)}
              >
                <Avatar sx={{ width: 32, height: 32, mr: 1, fontSize: "0.8rem" }}>
                  {safeString(influencer.username).charAt(0)}
                </Avatar>
                <Typography variant="body2">
                  {safeString(influencer.username)}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Chat Area */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {selectedChat ? (
          <>
            <Box
              sx={{
                p: 2,
                borderBottom: 1,
                borderColor: "divider",
                display: "flex",
                alignItems: "center",
              }}
            >
              <IconButton onClick={() => setSelectedChat(null)} sx={{ mr: 1 }}>
                <ArrowBack />
              </IconButton>
              <Avatar sx={{ mr: 2 }}>
                {safeString(selectedChat.influencer_name).charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="subtitle1">
                  {safeString(selectedChat.influencer_name)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {safeString(selectedChat.status)}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
              {messages.map((message) => (
                <Box
                  key={safeString(message.id)}
                  sx={{
                    display: "flex",
                    justifyContent:
                      safeString(message.sender_id) === safeString(currentUser.id)
                        ? "flex-end"
                        : "flex-start",
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: "70%",
                      p: 2,
                      borderRadius: 2,
                      bgcolor:
                        safeString(message.sender_id) === safeString(currentUser.id)
                          ? "primary.main"
                          : "grey.100",
                      color:
                        safeString(message.sender_id) === safeString(currentUser.id)
                          ? "white"
                          : "text.primary",
                    }}
                  >
                    <Typography variant="body2">
                      {message.content ? safeString(message.content) : ""}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ opacity: 0.7, display: "block", mt: 0.5 }}
                    >
                      {message.timestamp
                        ? new Date(message.timestamp).toLocaleTimeString()
                        : ""}
                    </Typography>
                  </Box>
                </Box>
              ))}
              <div ref={messagesEndRef} />
            </Box>

            <Box
  sx={{ p: 2, borderTop: 1, borderColor: "divider", display: "flex" }}
>
  <TextField
    fullWidth
    variant="outlined"
    placeholder="Type a message..."
    value={newMessage}
    onChange={(e) => setNewMessage(e.target.value)}
    onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
    size="small"
    multiline              // 👈 enables multiline expansion
    maxRows={4}            // 👈 limit height (adjust as needed)
    sx={{
      "& .MuiInputBase-input": {
        overflow: "auto",
      },
    }}
  />
  <Button
    variant="contained"
    onClick={sendMessage}
    disabled={!newMessage.trim()}
    sx={{ ml: 1 }}
  >
    <Send />
  </Button>
</Box>

          </>
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <Typography variant="h6" color="textSecondary">
              Select a collaboration to start messaging
            </Typography>
          </Box>
        )}
      </Box>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setError("")} severity="error" sx={{ width: "100%" }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BrandCollaborations;
