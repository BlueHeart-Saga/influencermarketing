import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  Box,
  Button
} from "@mui/material";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const ContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/contact/messages`);
      const data = await res.json();

      if (data.success) {
        setMessages(data.data);
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const markAsRead = async (id) => {
    await fetch(`${API_BASE_URL}/api/contact/mark-read/${id}`, {
      method: "PUT",
    });
    fetchMessages();
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <Card sx={{ mt: 4 }}>
      <CardContent>
        <Typography variant="h5" color="primary" sx={{ mb: 2 }}>
          Contact Form Submissions
        </Typography>

        {loading ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : messages.length === 0 ? (
          <Alert severity="info">No contact form messages found</Alert>
        ) : (
          <List>
            {messages.map((msg) => (
              <React.Fragment key={msg._id}>
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <strong>{msg.name}</strong> — {msg.email}
                        <Chip
                          label={msg.read ? "Read" : "New"}
                          color={msg.read ? "default" : "success"}
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography>{msg.message}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(msg.submitted_at).toLocaleString()}
                        </Typography>
                      </>
                    }
                  />

                  {!msg.read && (
                    <Button
                      variant="outlined"
                      onClick={() => markAsRead(msg._id)}
                      size="small"
                    >
                      Mark Read
                    </Button>
                  )}
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default ContactMessages;
