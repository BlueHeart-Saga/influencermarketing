// src/pages/admin/Settings.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Divider,
  Alert
} from "@mui/material";

import AdminLogo from "./AdminLogo";

const Settings = () => {
  // contact submissions
  const [contacts, setContacts] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  // mock data (replace with API later)
  const fetchData = async () => {
    setLoading(true);

    // contact submissions
    const mockContacts = [
      { id: 1, name: "John Doe", email: "john@gmail.com", message: "Need help" },
      { id: 2, name: "Priya", email: "priya@gmail.com", message: "Pricing details?" }
    ];

    // feedback
    const mockFeedbacks = [
      { id: 1, message: "Great platform!" },
      { id: 2, message: "Please improve analytics speed." }
    ];

    setContacts(mockContacts);
    setFeedbacks(mockFeedbacks);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Logo */}
      <AdminLogo />

      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
        Admin Settings
      </Typography>

      {/* Loading State */}
      {loading && (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && (
        <>
          {/* Contact Form Submissions */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }} color="primary">
                Contact Form Submissions
              </Typography>

              {contacts.length === 0 ? (
                <Alert severity="info">No contact submissions found</Alert>
              ) : (
                <List>
                  {contacts.map((c) => (
                    <React.Fragment key={c.id}>
                      <ListItem>
                        <ListItemText
                          primary={`${c.name} — ${c.email}`}
                          secondary={c.message}
                        />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>

          {/* Feedback Messages */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }} color="primary">
                Feedback Messages
              </Typography>

              {feedbacks.length === 0 ? (
                <Alert severity="info">No feedback received</Alert>
              ) : (
                <List>
                  {feedbacks.map((f) => (
                    <React.Fragment key={f.id}>
                      <ListItem>
                        <ListItemText primary={f.message} />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </Container>
  );
};

export default Settings;
