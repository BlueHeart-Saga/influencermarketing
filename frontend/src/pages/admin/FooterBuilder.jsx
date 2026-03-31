// Create a new file: src/components/admin/FooterBuilder.jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Paper, Grid, Card, CardContent, CardActions,
  Button, TextField, IconButton, Switch, FormControlLabel, Divider,
  List, ListItem, ListItemText, ListItemSecondaryAction, Dialog,
  DialogTitle, DialogContent, DialogActions, FormControl, InputLabel,
  Select, MenuItem, Chip, colors, Tabs, Tab, Accordion, AccordionSummary,
  AccordionDetails, Alert, Snackbar, CircularProgress, Tooltip,
  Collapse, InputAdornment, ColorPicker, Fab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
  Save as SaveIcon,
  Preview as PreviewIcon,
  ExpandMore as ExpandMoreIcon,
  DragIndicator as DragIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Link as LinkIcon,
  Language as LanguageIcon,
  Smartphone as SmartphoneIcon,
  Store as StoreIcon,
  Palette as PaletteIcon,
  Code as CodeIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Facebook, Twitter, LinkedIn, Instagram, YouTube,
  Email, Phone, LocationOn
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Social Media Icons Mapping
const SOCIAL_ICONS = {
  facebook: <Facebook />,
  twitter: <Twitter />,
  linkedin: <LinkedIn />,
  instagram: <Instagram />,
  youtube: <YouTube />
};

const CONTACT_ICONS = {
  email: <Email />,
  phone: <Phone />,
  address: <LocationOn />
};

export default function FooterBuilder() {
  const [footers, setFooters] = useState([]);
  const [activeFooter, setActiveFooter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [activeTab, setActiveTab] = useState(0);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logo_url: '',
    company_name: 'Brio',
    copyright_text: `© ${new Date().getFullYear()} Brio, Inc. All rights reserved.`,
    columns: [],
    social_links: [],
    contact_info: [],
    newsletter_enabled: true,
    newsletter_title: 'Subscribe to our newsletter',
    newsletter_description: 'Get the latest updates and insights',
    show_language_switcher: true,
    show_app_store_badges: true,
    show_trust_badges: true,
    trust_badges: [],
    theme: {
      primary_color: '#0066cc',
      secondary_color: '#333333',
      background_color: '#f8f9fa',
      text_color: '#333333',
      link_color: '#0066cc'
    },
    css_customizations: '',
    is_active: true,
    is_default: false
  });

  // Column editing
  const [editingColumn, setEditingColumn] = useState(null);
  const [columnDialogOpen, setColumnDialogOpen] = useState(false);
  const [columnForm, setColumnForm] = useState({
    title: '',
    order: 0,
    is_active: true
  });

  // Link editing
  const [editingLink, setEditingLink] = useState(null);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkForm, setLinkForm] = useState({
    text: '',
    url: '',
    target: '_self',
    icon: '',
    order: 0,
    is_active: true
  });

  // Social link editing
  const [editingSocial, setEditingSocial] = useState(null);
  const [socialDialogOpen, setSocialDialogOpen] = useState(false);
  const [socialForm, setSocialForm] = useState({
    platform: 'facebook',
    url: '',
    icon: 'FaFacebookF',
    order: 0,
    is_active: true
  });

  // Contact info editing
  const [editingContact, setEditingContact] = useState(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    type: 'email',
    value: '',
    icon: 'FaEnvelope',
    label: '',
    is_active: true
  });

  useEffect(() => {
    fetchFooters();
  }, []);

  const fetchFooters = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/footer/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFooters(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching footers:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load footers',
        severity: 'error'
      });
      setLoading(false);
    }
  };

  const loadFooter = (footer) => {
    setActiveFooter(footer.id);
    setFormData({
      ...footer,
      theme: footer.theme || {
        primary_color: '#0066cc',
        secondary_color: '#333333',
        background_color: '#f8f9fa',
        text_color: '#333333',
        link_color: '#0066cc'
      }
    });
    setActiveTab(0);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('access_token');
      let response;

      if (activeFooter) {
        // Update existing
        response = await axios.put(
          `${API_URL}/footer/${activeFooter}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Create new
        response = await axios.post(
          `${API_URL}/footer/create`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setActiveFooter(response.data.id);
      }

      setSnackbar({
        open: true,
        message: response.data.message || 'Footer saved successfully',
        severity: 'success'
      });
      
      fetchFooters();
    } catch (error) {
      console.error('Error saving footer:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save footer',
        severity: 'error'
      });
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this footer?')) return;

    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`${API_URL}/footer/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSnackbar({
        open: true,
        message: 'Footer deleted successfully',
        severity: 'success'
      });

      if (activeFooter === id) {
        setActiveFooter(null);
        resetForm();
      }

      fetchFooters();
    } catch (error) {
      console.error('Error deleting footer:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete footer',
        severity: 'error'
      });
    }
  };

  const handleDuplicate = async (footer) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(
        `${API_URL}/footer/${footer.id}/duplicate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSnackbar({
        open: true,
        message: 'Footer duplicated successfully',
        severity: 'success'
      });

      fetchFooters();
    } catch (error) {
      console.error('Error duplicating footer:', error);
      setSnackbar({
        open: true,
        message: 'Failed to duplicate footer',
        severity: 'error'
      });
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(
        `${API_URL}/footer/${id}/set-default`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSnackbar({
        open: true,
        message: 'Footer set as default',
        severity: 'success'
      });

      fetchFooters();
    } catch (error) {
      console.error('Error setting default footer:', error);
      setSnackbar({
        open: true,
        message: 'Failed to set default footer',
        severity: 'error'
      });
    }
  };

  const handlePreview = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const id = activeFooter || formData.id;
      
      if (!id) {
        // Generate preview from current form data
        const response = await axios.post(`${API_URL}/footer/preview/temp`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPreviewHtml(response.data.html);
      } else {
        const response = await axios.get(`${API_URL}/footer/preview/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPreviewHtml(response.data.html);
      }
      
      setPreviewOpen(true);
    } catch (error) {
      console.error('Error generating preview:', error);
      setSnackbar({
        open: true,
        message: 'Failed to generate preview',
        severity: 'error'
      });
    }
  };

  const resetForm = () => {
    setActiveFooter(null);
    setFormData({
      name: '',
      description: '',
      logo_url: '',
      company_name: 'Brio',
      copyright_text: `© ${new Date().getFullYear()} Brio, Inc. All rights reserved.`,
      columns: [],
      social_links: [],
      contact_info: [],
      newsletter_enabled: true,
      newsletter_title: 'Stay in the loop',
      newsletter_description: 'Get industry insights, product updates, and exclusive offers.',
      show_language_switcher: true,
      show_app_store_badges: true,
      show_trust_badges: true,
      trust_badges: [],
      theme: {
        primary_color: '#0066cc',
        secondary_color: '#333333',
        background_color: '#f8f9fa',
        text_color: '#333333',
        link_color: '#0066cc'
      },
      css_customizations: '',
      is_active: true,
      is_default: false
    });
  };

  // Column management
  const handleAddColumn = () => {
    setEditingColumn(null);
    setColumnForm({
      title: '',
      order: formData.columns.length,
      is_active: true
    });
    setColumnDialogOpen(true);
  };

  const handleEditColumn = (column, index) => {
    setEditingColumn(index);
    setColumnForm({ ...column });
    setColumnDialogOpen(true);
  };

  const handleSaveColumn = () => {
    const newColumns = [...formData.columns];
    
    if (editingColumn !== null) {
      newColumns[editingColumn] = columnForm;
    } else {
      newColumns.push(columnForm);
    }

    setFormData({ ...formData, columns: newColumns });
    setColumnDialogOpen(false);
    setEditingColumn(null);
  };

  const handleDeleteColumn = (index) => {
    const newColumns = [...formData.columns];
    newColumns.splice(index, 1);
    setFormData({ ...formData, columns: newColumns });
  };

  // Link management
  const handleAddLink = (columnIndex) => {
    setEditingLink({ columnIndex, linkIndex: null });
    setLinkForm({
      text: '',
      url: '',
      target: '_self',
      icon: '',
      order: formData.columns[columnIndex]?.links?.length || 0,
      is_active: true
    });
    setLinkDialogOpen(true);
  };

  const handleEditLink = (columnIndex, linkIndex) => {
    setEditingLink({ columnIndex, linkIndex });
    setLinkForm({ ...formData.columns[columnIndex].links[linkIndex] });
    setLinkDialogOpen(true);
  };

  const handleSaveLink = () => {
    const newColumns = [...formData.columns];
    const { columnIndex, linkIndex } = editingLink;

    if (linkIndex !== null) {
      newColumns[columnIndex].links[linkIndex] = linkForm;
    } else {
      if (!newColumns[columnIndex].links) {
        newColumns[columnIndex].links = [];
      }
      newColumns[columnIndex].links.push(linkForm);
    }

    setFormData({ ...formData, columns: newColumns });
    setLinkDialogOpen(false);
    setEditingLink(null);
  };

  // Social link management
  const handleAddSocial = () => {
    setEditingSocial(null);
    setSocialForm({
      platform: 'facebook',
      url: '',
      icon: 'FaFacebookF',
      order: formData.social_links.length,
      is_active: true
    });
    setSocialDialogOpen(true);
  };

  const handleEditSocial = (index) => {
    setEditingSocial(index);
    setSocialForm({ ...formData.social_links[index] });
    setSocialDialogOpen(true);
  };

  const handleSaveSocial = () => {
    const newSocialLinks = [...formData.social_links];
    
    if (editingSocial !== null) {
      newSocialLinks[editingSocial] = socialForm;
    } else {
      newSocialLinks.push(socialForm);
    }

    setFormData({ ...formData, social_links: newSocialLinks });
    setSocialDialogOpen(false);
    setEditingSocial(null);
  };

  // Contact info management
  const handleAddContact = () => {
    setEditingContact(null);
    setContactForm({
      type: 'email',
      value: '',
      icon: 'FaEnvelope',
      label: '',
      is_active: true
    });
    setContactDialogOpen(true);
  };

  const handleEditContact = (index) => {
    setEditingContact(index);
    setContactForm({ ...formData.contact_info[index] });
    setContactDialogOpen(true);
  };

  const handleSaveContact = () => {
    const newContactInfo = [...formData.contact_info];
    
    if (editingContact !== null) {
      newContactInfo[editingContact] = contactForm;
    } else {
      newContactInfo.push(contactForm);
    }

    setFormData({ ...formData, contact_info: newContactInfo });
    setContactDialogOpen(false);
    setEditingContact(null);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination, type } = result;

    if (type === 'COLUMNS') {
      const newColumns = [...formData.columns];
      const [removed] = newColumns.splice(source.index, 1);
      newColumns.splice(destination.index, 0, removed);
      
      // Update orders
      newColumns.forEach((col, index) => {
        col.order = index;
      });
      
      setFormData({ ...formData, columns: newColumns });
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Footer Builder
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Create and manage multiple footer configurations for your website
      </Typography>

      <Grid container spacing={3}>
        {/* Left Sidebar - Footer List */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Footer Configurations</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={resetForm}
                size="small"
              >
                New Footer
              </Button>
            </Box>

            <List>
              {footers.map((footer) => (
                <ListItem
                  key={footer.id}
                  button
                  selected={activeFooter === footer.id}
                  onClick={() => loadFooter(footer)}
                  sx={{
                    mb: 1,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                  secondaryAction={
                    <Box>
                      <Tooltip title={footer.is_default ? "Default Footer" : "Set as Default"}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetDefault(footer.id);
                          }}
                        >
                          {footer.is_default ? <StarIcon color="primary" /> : <StarBorderIcon />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Duplicate">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicate(footer);
                          }}
                        >
                          <DuplicateIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(footer.id);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body1" fontWeight={footer.is_default ? 'bold' : 'normal'}>
                          {footer.name}
                        </Typography>
                        {footer.is_default && (
                          <Chip label="Default" size="small" color="primary" />
                        )}
                        {footer.is_active && (
                          <Chip label="Active" size="small" color="success" variant="outlined" />
                        )}
                      </Box>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {footer.columns?.length || 0} columns • {footer.social_links?.length || 0} social links
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Main Content - Footer Editor */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">
                {activeFooter ? 'Edit Footer' : 'Create New Footer'}
              </Typography>
              <Box display="flex" gap={1}>
                <Button
                  variant="outlined"
                  startIcon={<PreviewIcon />}
                  onClick={handlePreview}
                  disabled={saving}
                >
                  Preview
                </Button>
                <Button
                  variant="contained"
                  startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Footer'}
                </Button>
              </Box>
            </Box>

            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
              <Tab label="General" />
              <Tab label="Columns" />
              <Tab label="Social Links" />
              <Tab label="Contact Info" />
              <Tab label="Theme" />
              <Tab label="Advanced" />
            </Tabs>

            {activeTab === 0 && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Footer Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Company Name"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    margin="normal"
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Logo URL"
                    value={formData.logo_url}
                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                    margin="normal"
                    placeholder="https://example.com/logo.png"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Copyright Text"
                    value={formData.copyright_text}
                    onChange={(e) => setFormData({ ...formData, copyright_text: e.target.value })}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      />
                    }
                    label="Active"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.is_default}
                        onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                      />
                    }
                    label="Default Footer"
                  />
                </Grid>
              </Grid>
            )}

            {activeTab === 1 && (
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="subtitle1">Footer Columns</Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleAddColumn}
                    size="small"
                  >
                    Add Column
                  </Button>
                </Box>

                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="columns" type="COLUMNS">
                    {(provided) => (
                      <List {...provided.droppableProps} ref={provided.innerRef}>
                        {formData.columns.map((column, index) => (
                          <Draggable key={index} draggableId={`column-${index}`} index={index}>
                            {(provided) => (
                              <ListItem
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                sx={{
                                  border: '1px solid',
                                  borderColor: 'divider',
                                  borderRadius: 1,
                                  mb: 1,
                                  bgcolor: 'background.paper'
                                }}
                                secondaryAction={
                                  <Box>
                                    <IconButton
                                      size="small"
                                      onClick={() => handleEditColumn(column, index)}
                                    >
                                      <EditIcon />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() => handleDeleteColumn(index)}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      {...provided.dragHandleProps}
                                    >
                                      <DragIcon />
                                    </IconButton>
                                  </Box>
                                }
                              >
                                <ListItemText
                                  primary={
                                    <Box display="flex" alignItems="center" gap={1}>
                                      <Typography>{column.title}</Typography>
                                      {!column.is_active && (
                                        <Chip label="Inactive" size="small" color="default" />
                                      )}
                                    </Box>
                                  }
                                  secondary={`${column.links?.length || 0} links`}
                                />
                              </ListItem>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </List>
                    )}
                  </Droppable>
                </DragDropContext>

                {formData.columns.length === 0 && (
                  <Alert severity="info">
                    No columns added yet. Add your first column to start building the footer.
                  </Alert>
                )}

                {/* Column Links */}
                {formData.columns.map((column, columnIndex) => (
                  <Accordion key={columnIndex} sx={{ mt: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>{column.title} Links</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box display="flex" justifyContent="flex-end" mb={2}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<AddIcon />}
                          onClick={() => handleAddLink(columnIndex)}
                        >
                          Add Link
                        </Button>
                      </Box>

                      <List>
                        {column.links?.map((link, linkIndex) => (
                          <ListItem
                            key={linkIndex}
                            secondaryAction={
                              <Box>
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditLink(columnIndex, linkIndex)}
                                >
                                  <EditIcon />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => {
                                    const newColumns = [...formData.columns];
                                    newColumns[columnIndex].links.splice(linkIndex, 1);
                                    setFormData({ ...formData, columns: newColumns });
                                  }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                            }
                          >
                            <ListItemText
                              primary={link.text}
                              secondary={link.url}
                            />
                            {!link.is_active && (
                              <VisibilityOffIcon fontSize="small" color="disabled" />
                            )}
                          </ListItem>
                        ))}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            )}

            {activeTab === 2 && (
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="subtitle1">Social Media Links</Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleAddSocial}
                    size="small"
                  >
                    Add Social Link
                  </Button>
                </Box>

                <Grid container spacing={2}>
                  {formData.social_links.map((social, index) => (
                    <Grid item xs={12} md={6} key={index}>
                      <Card>
                        <CardContent>
                          <Box display="flex" alignItems="center" gap={2} mb={1}>
                            {SOCIAL_ICONS[social.platform] || <LinkIcon />}
                            <Typography variant="h6">{social.platform}</Typography>
                            {!social.is_active && (
                              <Chip label="Inactive" size="small" />
                            )}
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {social.url}
                          </Typography>
                        </CardContent>
                        <CardActions>
                          <Button
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={() => handleEditSocial(index)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => {
                              const newSocialLinks = [...formData.social_links];
                              newSocialLinks.splice(index, 1);
                              setFormData({ ...formData, social_links: newSocialLinks });
                            }}
                          >
                            Remove
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                {formData.social_links.length === 0 && (
                  <Alert severity="info">
                    No social links added. Add social media links to connect with your audience.
                  </Alert>
                )}
              </Box>
            )}

            {activeTab === 3 && (
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="subtitle1">Contact Information</Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleAddContact}
                    size="small"
                  >
                    Add Contact Info
                  </Button>
                </Box>

                <Grid container spacing={2}>
                  {formData.contact_info.map((contact, index) => (
                    <Grid item xs={12} md={6} key={index}>
                      <Card>
                        <CardContent>
                          <Box display="flex" alignItems="center" gap={2} mb={1}>
                            {CONTACT_ICONS[contact.type] || <Email />}
                            <Typography variant="h6">{contact.label || contact.type}</Typography>
                            {!contact.is_active && (
                              <Chip label="Inactive" size="small" />
                            )}
                          </Box>
                          <Typography variant="body1">{contact.value}</Typography>
                        </CardContent>
                        <CardActions>
                          <Button
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={() => handleEditContact(index)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => {
                              const newContactInfo = [...formData.contact_info];
                              newContactInfo.splice(index, 1);
                              setFormData({ ...formData, contact_info: newContactInfo });
                            }}
                          >
                            Remove
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {activeTab === 4 && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Primary Color"
                    type="color"
                    value={formData.theme.primary_color}
                    onChange={(e) => setFormData({
                      ...formData,
                      theme: { ...formData.theme, primary_color: e.target.value }
                    })}
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PaletteIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Background Color"
                    type="color"
                    value={formData.theme.background_color}
                    onChange={(e) => setFormData({
                      ...formData,
                      theme: { ...formData.theme, background_color: e.target.value }
                    })}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Text Color"
                    type="color"
                    value={formData.theme.text_color}
                    onChange={(e) => setFormData({
                      ...formData,
                      theme: { ...formData.theme, text_color: e.target.value }
                    })}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Link Color"
                    type="color"
                    value={formData.theme.link_color}
                    onChange={(e) => setFormData({
                      ...formData,
                      theme: { ...formData.theme, link_color: e.target.value }
                    })}
                    margin="normal"
                  />
                </Grid>
              </Grid>
            )}

            {activeTab === 5 && (
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.newsletter_enabled}
                      onChange={(e) => setFormData({ ...formData, newsletter_enabled: e.target.checked })}
                    />
                  }
                  label="Enable Newsletter Subscription"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.show_language_switcher}
                      onChange={(e) => setFormData({ ...formData, show_language_switcher: e.target.checked })}
                    />
                  }
                  label="Show Language Switcher"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.show_app_store_badges}
                      onChange={(e) => setFormData({ ...formData, show_app_store_badges: e.target.checked })}
                    />
                  }
                  label="Show App Store Badges"
                />

                <TextField
                  fullWidth
                  label="Custom CSS"
                  value={formData.css_customizations}
                  onChange={(e) => setFormData({ ...formData, css_customizations: e.target.value })}
                  margin="normal"
                  multiline
                  rows={6}
                  placeholder="Add custom CSS styles..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CodeIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Dialogs */}
      <Dialog open={columnDialogOpen} onClose={() => setColumnDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingColumn !== null ? 'Edit Column' : 'Add Column'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Column Title"
            value={columnForm.title}
            onChange={(e) => setColumnForm({ ...columnForm, title: e.target.value })}
            margin="normal"
          />
          <FormControlLabel
            control={
              <Switch
                checked={columnForm.is_active}
                onChange={(e) => setColumnForm({ ...columnForm, is_active: e.target.checked })}
              />
            }
            label="Active"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setColumnDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveColumn} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={linkDialogOpen} onClose={() => setLinkDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingLink?.linkIndex !== null ? 'Edit Link' : 'Add Link'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Link Text"
            value={linkForm.text}
            onChange={(e) => setLinkForm({ ...linkForm, text: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="URL"
            value={linkForm.url}
            onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })}
            margin="normal"
            placeholder="https://example.com/page"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Target</InputLabel>
            <Select
              value={linkForm.target}
              label="Target"
              onChange={(e) => setLinkForm({ ...linkForm, target: e.target.value })}
            >
              <MenuItem value="_self">Same Tab</MenuItem>
              <MenuItem value="_blank">New Tab</MenuItem>
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Switch
                checked={linkForm.is_active}
                onChange={(e) => setLinkForm({ ...linkForm, is_active: e.target.checked })}
              />
            }
            label="Active"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLinkDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveLink} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Footer Preview</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ border: '1px solid #ddd', borderRadius: 1, p: 2 }}>
            <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}