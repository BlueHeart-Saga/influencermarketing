import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  Snackbar,
  Stack,
  Divider
} from "@mui/material";
import {
  Add,
  Delete,
  Edit,
  ImportExport,
  Person,
  Email,
  Phone,
  Download,
  Upload
} from "@mui/icons-material";

const ContactManager = () => {
  const [contacts, setContacts] = useState([]);
  const [newContact, setNewContact] = useState({ name: "", email: "", phone: "", tags: "" });
  const [editContact, setEditContact] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Load contacts from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("qf_contacts");
    if (saved) {
      try {
        setContacts(JSON.parse(saved));
      } catch (err) {
        setError("Failed to load contacts");
      }
    }
  }, []);

  // Save contacts to localStorage
  const saveContacts = (updatedContacts) => {
    localStorage.setItem("qf_contacts", JSON.stringify(updatedContacts));
    setContacts(updatedContacts);
  };

  const handleAddContact = (e) => {
    e.preventDefault();
    if (!newContact.name || !newContact.email) {
      setError("Name and email are required");
      return;
    }

    const tags = newContact.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    const contact = {
      ...newContact,
      tags,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };

    const updatedContacts = [...contacts, contact];
    saveContacts(updatedContacts);
    setNewContact({ name: "", email: "", phone: "", tags: "" });
    setSuccess("Contact added successfully");
  };

  const handleEditContact = (contact) => {
    setEditContact({...contact, tags: contact.tags.join(', ')});
    setOpenDialog(true);
  };

  const handleUpdateContact = () => {
    if (!editContact.name || !editContact.email) {
      setError("Name and email are required");
      return;
    }

    const tags = editContact.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    const updatedContact = { ...editContact, tags };

    const updatedContacts = contacts.map(contact => 
      contact.id === updatedContact.id ? updatedContact : contact
    );

    saveContacts(updatedContacts);
    setOpenDialog(false);
    setEditContact(null);
    setSuccess("Contact updated successfully");
  };

  const handleDeleteContact = (id) => {
    const updatedContacts = contacts.filter(contact => contact.id !== id);
    saveContacts(updatedContacts);
    setSuccess("Contact deleted successfully");
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedContacts = JSON.parse(event.target.result);
        if (Array.isArray(importedContacts)) {
          const updatedContacts = [...contacts, ...importedContacts];
          saveContacts(updatedContacts);
          setSuccess("Contacts imported successfully");
        } else {
          setError("Invalid file format");
        }
      } catch (err) {
        setError("Failed to import contacts");
      }
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(contacts, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `contacts_export_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    setSuccess("Contacts exported successfully");
  };

  const handleCloseSnackbar = () => {
    setSuccess("");
    setError("");
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleClearContacts = () => {
    if (window.confirm("Are you sure you want to delete all contacts?")) {
      saveContacts([]);
      setSuccess("All contacts cleared successfully");
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Person sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" fontWeight={700}>
            Contact Management
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Manage your contacts with ease. Add, edit, delete, import and export contacts.
        </Typography>
      </Box>

      {/* Add Contact Form - Full Width */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Add /> Add New Contact
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Box component="form" onSubmit={handleAddContact} sx={{ width: '100%' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Name"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                required
                size="small"
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={newContact.email}
                onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                required
                size="small"
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Phone"
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                size="small"
              />
              <TextField
                fullWidth
                label="Tags (comma separated)"
                value={newContact.tags}
                onChange={(e) => setNewContact({ ...newContact, tags: e.target.value })}
                placeholder="customer, prospect, vip"
                size="small"
              />
            </Stack>
            <Button
              type="submit"
              variant="contained"
              startIcon={<Add />}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              Add Contact
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Import/Export Section - Full Width */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ImportExport /> Data Management
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: '100%' }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<Upload />}
              sx={{ flex: 1 }}
            >
              Import Contacts
              <input
                type="file"
                accept=".json"
                hidden
                onChange={handleImport}
              />
            </Button>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={handleExport}
              disabled={contacts.length === 0}
              sx={{ flex: 1 }}
            >
              Export Contacts
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={handleClearContacts}
              disabled={contacts.length === 0}
              sx={{ flex: 1 }}
            >
              Clear All
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Contacts List - Full Width */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 3, gap: 2 }}>
            <Typography variant="h6" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Person /> Contacts ({filteredContacts.length})
            </Typography>
            <TextField
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{ width: { xs: '100%', sm: 300 } }}
            />
          </Box>
          <Divider sx={{ mb: 3 }} />
          
          {filteredContacts.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Person sx={{ fontSize: 64, color: 'action.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {searchTerm ? "No matching contacts found" : "No contacts yet"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchTerm ? "Try a different search term" : "Add some contacts to get started"}
              </Typography>
            </Box>
          ) : (
            <List sx={{ width: '100%' }}>
              {filteredContacts.map((contact) => (
                <ListItem
                  key={contact.id}
                  divider
                  sx={{
                    py: 2,
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    }
                  }}
                  secondaryAction={
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        onClick={() => handleEditContact(contact)}
                        color="primary"
                        size="small"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteContact(contact.id)}
                        color="error"
                        size="small"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 1 }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {contact.name}
                        </Typography>
                        {contact.tags.length > 0 && (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {contact.tags.map((tag, index) => (
                              <Chip key={index} label={tag} size="small" variant="outlined" />
                            ))}
                          </Box>
                        )}
                      </Box>
                    }
                    secondary={
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Email fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {contact.email}
                          </Typography>
                        </Box>
                        {contact.phone && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Phone fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {contact.phone}
                            </Typography>
                          </Box>
                        )}
                      </Stack>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Stats Section - Full Width */}
      {contacts.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Statistics
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} sx={{ width: '100%' }}>
              <Box sx={{ textAlign: 'center', flex: 1 }}>
                <Typography variant="h4" fontWeight={700} color="primary">
                  {contacts.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Contacts
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', flex: 1 }}>
                <Typography variant="h4" fontWeight={700} color="secondary">
                  {new Set(contacts.flatMap(c => c.tags)).size}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Unique Tags
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', flex: 1 }}>
                <Typography variant="h4" fontWeight={700} color="info.main">
                  {contacts.filter(c => c.phone).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  With Phone Numbers
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            width: { xs: '95%', sm: '500px' },
            maxWidth: '500px'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Edit Contact</DialogTitle>
        <DialogContent>
          {editContact && (
            <Box sx={{ pt: 1 }}>
              <TextField
                fullWidth
                label="Name"
                value={editContact.name}
                onChange={(e) => setEditContact({ ...editContact, name: e.target.value })}
                margin="normal"
                required
                size="small"
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={editContact.email}
                onChange={(e) => setEditContact({ ...editContact, email: e.target.value })}
                margin="normal"
                required
                size="small"
              />
              <TextField
                fullWidth
                label="Phone"
                value={editContact.phone}
                onChange={(e) => setEditContact({ ...editContact, phone: e.target.value })}
                margin="normal"
                size="small"
              />
              <TextField
                fullWidth
                label="Tags (comma separated)"
                value={editContact.tags}
                onChange={(e) => setEditContact({ ...editContact, tags: e.target.value })}
                margin="normal"
                placeholder="customer, prospect, vip"
                size="small"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenDialog(false)} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleUpdateContact} variant="contained">
            Update Contact
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbars */}
      <Snackbar 
        open={!!success} 
        autoHideDuration={3000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" variant="filled">
          {success}
        </Alert>
      </Snackbar>
      <Snackbar 
        open={!!error} 
        autoHideDuration={3000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" variant="filled">
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ContactManager;