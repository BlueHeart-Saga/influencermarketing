import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../../config/api';
import {
  Box, Typography, Card, CardContent, CardActions,
  Button, Chip, Alert, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Grid, Avatar, styled, Paper,
  IconButton, Divider, Fade, useTheme, 
  Tabs, Tab, Badge, List, ListItem, ListItemIcon, ListItemText,
  InputAdornment, Stepper, Step, StepLabel,
  Drawer, FormControl, InputLabel, Select, MenuItem,
  Checkbox, FormControlLabel, Switch, Collapse,
  useMediaQuery
} from '@mui/material';
import TabContext from "@mui/lab/TabContext";
import TabPanel from "@mui/lab/TabPanel";
import {
  Person, Email, CalendarToday, Campaign,
  CheckCircle, Cancel, Visibility,
  FilterList, Search, Close, TrendingUp,
  Message, ArrowBack, Instagram, YouTube,
  AttachFile, Send, Delete, Payment,
  AccountBalance, Chat, Download, Image as ImageIcon,
  ExpandMore, ExpandLess, ClearAll, DateRange,
  Title, Business,
  People
} from '@mui/icons-material';
import { campaignAPI } from '../../services/api';
import { subDays } from 'date-fns';

// Campaign Image Component with loading and error handling
const CampaignImage = ({ fileId, alt, onClick, height = 200, width = '100%' }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const getImageUrl = () => {
    if (!fileId) return null;
    
    if (fileId.startsWith('http') || fileId.startsWith('data:') || fileId.startsWith('blob:')) {
      return fileId;
    }
    
    if (fileId.length === 24 && /^[0-9a-fA-F]{24}$/.test(fileId)) {
      return `${process.env.REACT_APP_API_URL || `${API_BASE_URL}`}/api/campaigns/image/${fileId}`;
    }
    
    return `${process.env.REACT_APP_API_URL || `${API_BASE_URL}`}/api/campaigns/image/${fileId}`;
  };

  const imageUrl = getImageUrl();

  if (!imageUrl || error) {
    return (
      <Box 
        sx={{ 
          width: width,
          height: height,
          background: '#2563eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: onClick ? 'pointer' : 'default',
          borderRadius: 1
        }}
        onClick={onClick}
      >
        <ImageIcon sx={{ fontSize: 48, color: 'white', opacity: 0.7 }} />
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', width: width, height: height, borderRadius: 1, overflow: 'hidden' }}>
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.8)',
            zIndex: 1
          }}
        >
          <CircularProgress size={24} />
        </Box>
      )}
      <img
        src={imageUrl}
        alt={alt}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          cursor: onClick ? 'pointer' : 'default'
        }}
        onClick={onClick}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
      />
    </Box>
  );
};

// Styled components for better layout
const SidebarContainer = styled(Box)(({ theme }) => ({
  width: 320,
  flexShrink: 0,
  position: 'fixed',

  height: 'calc(100vh - 120px)',
  overflowY: 'auto',
  zIndex: 100,
  [theme.breakpoints.down('md')]: {
    position: 'relative',
    top: 0,
    width: '100%',
    height: 'auto',
    marginBottom: theme.spacing(3),
  },
}));

const MainContent = styled(Box)(({ theme }) => ({
  flex: 1,
  minWidth: 0,
  marginLeft: 340,
  [theme.breakpoints.down('lg')]: {
    marginLeft: 300,
  },
  [theme.breakpoints.down('md')]: {
    marginLeft: 0,
  },
}));

const FilterSidebarPaper = styled(Paper)(({ theme }) => ({
  height: '100%',
  overflowY: 'auto',
  borderRadius: '16px',
  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.7)',
}));

const BrandApplications = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [sending, setSending] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentStep, setPaymentStep] = useState(0);
  const [conversations, setConversations] = useState([]);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [dialogTab, setDialogTab] = useState("0");
  const [selectedImage, setSelectedImage] = useState(null);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Advanced Filter State
  const [filters, setFilters] = useState({
    searchQuery: '',
    brandName: '',
    campaignTitle: '',
    status: [],
    dateRange: '',
    startDate: '',
    endDate: '',
    ourMessage: '',
    hasAttachments: false,
    minFollowers: '',
    maxFollowers: '',
    platform: '',
    influencerName: '',
    influencerEmail: ''
  });

  // Expanded filter sections
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    status: true,
    date: false,
    advanced: false
  });

  // Fetch applications on component mount
  useEffect(() => {
    fetchApplications();
  }, []);

  // Filter applications based on all criteria
  useEffect(() => {
    let filtered = applications;
    
    // Search Query Filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(app => 
        app.influencer_name?.toLowerCase().includes(query) ||
        app.campaign_title?.toLowerCase().includes(query) ||
        app.influencer_email?.toLowerCase().includes(query) ||
        app.message?.toLowerCase().includes(query) ||
        app.brand_name?.toLowerCase().includes(query)
      );
    }

    // Brand Name Filter
    if (filters.brandName) {
      filtered = filtered.filter(app => 
        app.brand_name?.toLowerCase().includes(filters.brandName.toLowerCase())
      );
    }

    // Campaign Title Filter
    if (filters.campaignTitle) {
      filtered = filtered.filter(app => 
        app.campaign_title?.toLowerCase().includes(filters.campaignTitle.toLowerCase())
      );
    }

    // Influencer Name Filter
    if (filters.influencerName) {
      filtered = filtered.filter(app => 
        app.influencer_name?.toLowerCase().includes(filters.influencerName.toLowerCase())
      );
    }

    // Influencer Email Filter
    if (filters.influencerEmail) {
      filtered = filtered.filter(app => 
        app.influencer_email?.toLowerCase().includes(filters.influencerEmail.toLowerCase())
      );
    }

    // Status Filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(app => filters.status.includes(app.status));
    }

    // Date Range Filter
    if (filters.dateRange) {
      const now = new Date();
      filtered = filtered.filter(app => {
        const appDate = new Date(app.applied_at);
        switch (filters.dateRange) {
          case 'today':
            return appDate.toDateString() === now.toDateString();
          case 'week':
            return appDate > subDays(now, 7);
          case 'month':
            return appDate > subDays(now, 30);
          case 'custom':
            if (filters.startDate && filters.endDate) {
              const start = new Date(filters.startDate);
              const end = new Date(filters.endDate);
              end.setHours(23, 59, 59, 999);
              return appDate >= start && appDate <= end;
            }
            return true;
          default:
            return true;
        }
      });
    }

    // Platform Filter
    if (filters.platform) {
      filtered = filtered.filter(app => 
        app.platform?.toLowerCase() === filters.platform.toLowerCase()
      );
    }

    // Followers Range Filter
    if (filters.minFollowers) {
      filtered = filtered.filter(app => 
        app.followers && app.followers >= parseInt(filters.minFollowers)
      );
    }
    if (filters.maxFollowers) {
      filtered = filtered.filter(app => 
        app.followers && app.followers <= parseInt(filters.maxFollowers)
      );
    }

    // Our Message Filter
    if (filters.ourMessage) {
      filtered = filtered.filter(app => 
        app.message?.toLowerCase().includes(filters.ourMessage.toLowerCase())
      );
    }

    setFilteredApplications(filtered);
  }, [applications, filters]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await campaignAPI.getBrandApplications();
      
      const appsData = Array.isArray(response) ? response : 
                      response.data ? response.data : 
                      response.applications ? response.applications : [];
      
      setApplications(appsData);
    } catch (err) {
      setError('Failed to load applications. Please check your connection.');
      console.error('Failed to fetch applications:', err);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversations = async (campaignId, influencerId) => {
    try {
      setConversationLoading(true);
      const response = await campaignAPI.getMessages(campaignId, influencerId);
      return response.data || [];
    } catch (err) {
      setError('Failed to load messages');
      console.error('Failed to fetch messages:', err);
      return [];
    } finally {
      setConversationLoading(false);
    }
  };

  const handleStatusChange = async (campaignId, influencerId, newStatus) => {
    const key = `${campaignId}-${influencerId}`;
    setUpdatingStatus(prev => ({ ...prev, [key]: true }));
    
    try {
      await campaignAPI.updateApplicationStatus(campaignId, influencerId, { status: newStatus });
      
      if (newStatus === 'completed') {
        await campaignAPI.updateCampaign(campaignId, { status: 'completed' });
      }
      
      setSuccess(`Application ${newStatus} successfully!`);
      fetchApplications();
    } catch (err) {
      setError('Failed to update application status');
      console.error('Status update error:', err);
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleViewDetails = async (application) => {
    setSelectedApplication(application);
    setDetailDialogOpen(true);
    
    const messages = await fetchConversations(application.campaign_id, application.influencer_id);
    setConversations(messages);
  };

  // Filter handling functions
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      searchQuery: '',
      brandName: '',
      campaignTitle: '',
      status: [],
      dateRange: '',
      startDate: '',
      endDate: '',
      ourMessage: '',
      hasAttachments: false,
      minFollowers: '',
      maxFollowers: '',
      platform: '',
      influencerName: '',
      influencerEmail: ''
    });
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => 
      value !== '' && 
      value !== false && 
      !(Array.isArray(value) && value.length === 0)
    ).length;
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Filter Sidebar Component
  const FilterSidebar = () => (
    <SidebarContainer>
      <FilterSidebarPaper>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'primary.main', color: 'white' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h6" fontWeight="600">
              Filters
            </Typography>
            <Badge badgeContent={getActiveFilterCount()} color="secondary">
              <FilterList />
            </Badge>
          </Box>
          
          <Button
            fullWidth
            variant="contained"
            startIcon={<ClearAll />}
            onClick={clearAllFilters}
            size="small"
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              '&:hover': {
                bgcolor: 'grey.100'
              }
            }}
          >
            Clear All Filters
          </Button>
        </Box>

        <Box sx={{ p: 2 }}>
          {/* Basic Filters Section */}
          <Box sx={{ mb: 2 }}>
            <Box 
              display="flex" 
              alignItems="center" 
              justifyContent="space-between"
              sx={{ cursor: 'pointer' }}
              onClick={() => toggleSection('basic')}
            >
              <Typography variant="subtitle1" fontWeight="600">
                Basic Filters
              </Typography>
              {expandedSections.basic ? <ExpandLess /> : <ExpandMore />}
            </Box>
            
            <Collapse in={expandedSections.basic}>
              <TextField
                fullWidth
                label="Search Applications"
                value={filters.searchQuery}
                onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
                }}
                sx={{ mb: 2, mt: 1 }}
              />

              <TextField
                fullWidth
                label="Brand Name"
                value={filters.brandName}
                onChange={(e) => handleFilterChange('brandName', e.target.value)}
                InputProps={{
                  startAdornment: <Business sx={{ color: 'text.secondary', mr: 1 }} />,
                }}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Campaign Title"
                value={filters.campaignTitle}
                onChange={(e) => handleFilterChange('campaignTitle', e.target.value)}
                InputProps={{
                  startAdornment: <Title sx={{ color: 'text.secondary', mr: 1 }} />,
                }}
                sx={{ mb: 2 }}
              />
            </Collapse>
          </Box>

          {/* Status Filters Section */}
          <Box sx={{ mb: 2 }}>
            <Box 
              display="flex" 
              alignItems="center" 
              justifyContent="space-between"
              sx={{ cursor: 'pointer' }}
              onClick={() => toggleSection('status')}
            >
              <Typography variant="subtitle1" fontWeight="600">
                Status & Platform
              </Typography>
              {expandedSections.status ? <ExpandLess /> : <ExpandMore />}
            </Box>
            
            <Collapse in={expandedSections.status}>
              <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
                <InputLabel>Application Status</InputLabel>
                <Select
                  multiple
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  label="Application Status"
                  renderValue={(selected) => selected.map(s => getStatusText(s)).join(', ')}
                >
                  {['pending', 'approved', 'rejected', 'completed'].map((status) => (
                    <MenuItem key={status} value={status}>
                      <Checkbox checked={filters.status.indexOf(status) > -1} />
                      <Chip 
                        label={getStatusText(status)} 
                        size="small" 
                        color={getStatusColor(status)}
                        sx={{ ml: 1 }}
                      />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Social Platform</InputLabel>
                <Select
                  value={filters.platform}
                  onChange={(e) => handleFilterChange('platform', e.target.value)}
                  label="Social Platform"
                >
                  <MenuItem value="">All Platforms</MenuItem>
                  <MenuItem value="instagram">Instagram</MenuItem>
                  <MenuItem value="youtube">YouTube</MenuItem>
                  <MenuItem value="tiktok">TikTok</MenuItem>
                  <MenuItem value="facebook">Facebook</MenuItem>
                  <MenuItem value="twitter">Twitter</MenuItem>
                </Select>
              </FormControl>
            </Collapse>
          </Box>

          {/* Date Filters Section */}
          <Box sx={{ mb: 2 }}>
            <Box 
              display="flex" 
              alignItems="center" 
              justifyContent="space-between"
              sx={{ cursor: 'pointer' }}
              onClick={() => toggleSection('date')}
            >
              <Typography variant="subtitle1" fontWeight="600">
                Date Range
              </Typography>
              {expandedSections.date ? <ExpandLess /> : <ExpandMore />}
            </Box>
            
            <Collapse in={expandedSections.date}>
              <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
                <InputLabel>Date Range</InputLabel>
                <Select
                  value={filters.dateRange}
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                  label="Date Range"
                  startAdornment={<DateRange sx={{ color: 'text.secondary', mr: 1 }} />}
                >
                  <MenuItem value="">Any Time</MenuItem>
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="week">Last 7 Days</MenuItem>
                  <MenuItem value="month">Last 30 Days</MenuItem>
                  <MenuItem value="custom">Custom Range</MenuItem>
                </Select>
              </FormControl>

              {filters.dateRange === 'custom' && (
                <Box sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Start Date"
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ mb: 1 }}
                  />
                  <TextField
                    fullWidth
                    label="End Date"
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
              )}
            </Collapse>
          </Box>

          {/* Advanced Filters Section */}
          <Box sx={{ mb: 2 }}>
            <Box 
              display="flex" 
              alignItems="center" 
              justifyContent="space-between"
              sx={{ cursor: 'pointer' }}
              onClick={() => toggleSection('advanced')}
            >
              <Typography variant="subtitle1" fontWeight="600">
                Advanced Filters
              </Typography>
              {expandedSections.advanced ? <ExpandLess /> : <ExpandMore />}
            </Box>
            
            <Collapse in={expandedSections.advanced}>
              <TextField
                fullWidth
                label="Influencer Name"
                value={filters.influencerName}
                onChange={(e) => handleFilterChange('influencerName', e.target.value)}
                InputProps={{
                  startAdornment: <People sx={{ color: 'text.secondary', mr: 1 }} />,
                }}
                sx={{ mb: 2, mt: 1 }}
              />

              <TextField
                fullWidth
                label="Influencer Email"
                value={filters.influencerEmail}
                onChange={(e) => handleFilterChange('influencerEmail', e.target.value)}
                InputProps={{
                  startAdornment: <Email sx={{ color: 'text.secondary', mr: 1 }} />,
                }}
                sx={{ mb: 2 }}
              />

              <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
                Followers Range
              </Typography>
              <Grid container spacing={1} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Min"
                    type="number"
                    value={filters.minFollowers}
                    onChange={(e) => handleFilterChange('minFollowers', e.target.value)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Max"
                    type="number"
                    value={filters.maxFollowers}
                    onChange={(e) => handleFilterChange('maxFollowers', e.target.value)}
                  />
                </Grid>
              </Grid>

              <TextField
                fullWidth
                label="Message Content"
                value={filters.ourMessage}
                onChange={(e) => handleFilterChange('ourMessage', e.target.value)}
                InputProps={{
                  startAdornment: <Message sx={{ color: 'text.secondary', mr: 1 }} />,
                }}
                sx={{ mb: 2 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={filters.hasAttachments}
                    onChange={(e) => handleFilterChange('hasAttachments', e.target.checked)}
                  />
                }
                label="Has Attachments"
              />
            </Collapse>
          </Box>
        </Box>

        {/* Results Count */}
        <Box sx={{ p: 2, background: 'rgba(102, 126, 234, 0.05)' }}>
          <Typography variant="body2" color="text.secondary" align="center">
            Showing {filteredApplications.length} of {applications.length} applications
          </Typography>
        </Box>
      </FilterSidebarPaper>
    </SidebarContainer>
  );

  // Rest of the existing functions remain the same...
  const handleCloseDialog = () => {
    setDetailDialogOpen(false);
    setSelectedApplication(null);
    setMessage('');
    setAttachments([]);
    setConversations([]);
  };

  const handleClosePaymentDialog = () => {
    setPaymentDialogOpen(false);
    setPaymentStep(0);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setAttachments(prev => [...prev, ...files]);
    }
    e.target.value = '';
  };

  const handleRemoveFile = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async () => {
    if (!message.trim() && attachments.length === 0) {
      setError('Please enter a message or attach a file');
      return;
    }

    setSending(true);
    try {
      const formData = new FormData();
      formData.append('campaign_id', selectedApplication.campaign_id);
      formData.append('influencer_id', selectedApplication.influencer_id);
      formData.append('message', message);
      
      attachments.forEach((file, index) => {
        formData.append(`attachments`, file);
      });

      await campaignAPI.sendMessageToInfluencer(formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const messages = await fetchConversations(
        selectedApplication.campaign_id, 
        selectedApplication.influencer_id
      );
      setConversations(messages);

      setSuccess(`Message sent to ${selectedApplication.influencer_name}`);
      setMessage('');
      setAttachments([]);
    } catch (err) {
      setError('Failed to send message. Please try again.');
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'completed': return 'primary';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Under Review';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'completed': return 'Completed';
      default: return status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown';
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'instagram': return <Instagram />;
      case 'youtube': return <YouTube />;
      default: return <Person />;
    }
  };

  const getPendingCount = () => applications.filter(app => app.status === 'pending').length;

  const handleDownloadAttachment = async (attachmentId, index) => {
    try {
      const response = await fetch(`/api/attachments/${attachmentId}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attachment-${index}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const handleInitiatePayment = async (amount, paymentMethod, notes) => {
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, paymentMethod, notes }),
      });
      const result = await response.json();
      console.log("Payment successful:", result);
    } catch (error) {
      console.error("Payment failed:", error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress size={60} thickness={4} />
        <Typography variant="body1" sx={{ ml: 2, color: 'text.secondary' }}>
          Loading applications...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
      p: isMobile ? 2 : 3
    }}>
      {/* Filter Sidebar - Always visible and stable */}
      {!isMobile && <FilterSidebar />}

      {/* Main Content Area */}
      <MainContent>
        <Fade in timeout={800}>
          <Box>
            {/* Header Section */}
            <Box sx={{ mb: 4 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                  <Typography variant="h4" component="h1" fontWeight="700" gutterBottom>
                    Influencer Applications
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {filteredApplications.length} applications found • {getPendingCount()} pending review
                  </Typography>
                </Box>
                <Box display="flex" gap={2}>
                  {isMobile && (
                    <Button
                      variant="outlined"
                      startIcon={<FilterList />}
                      onClick={() => setFilterDrawerOpen(true)}
                    >
                      Filters
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    // startIcon={<Refresh />}
                    onClick={fetchApplications}
                    disabled={loading}
                    sx={{
                      borderRadius: 2,
                      px: 3,
                      fontWeight: 600,
                    }}
                  >
                    Refresh
                  </Button>
                </Box>
              </Box>

              {/* Mobile Filter Drawer */}
              {isMobile && (
                <Drawer
                  anchor="left"
                  open={filterDrawerOpen}
                  onClose={() => setFilterDrawerOpen(false)}
                  sx={{
                    '& .MuiDrawer-paper': {
                      width: 280,
                      borderRadius: '0 16px 16px 0',
                    },
                  }}
                >
                  <Box sx={{ width: 280 }}>
                    <FilterSidebar />
                  </Box>
                </Drawer>
              )}

              {/* Quick Stats */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'white' }}>
                    <Typography variant="h6">{applications.length}</Typography>
                    <Typography variant="body2">Total</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light', color: 'white' }}>
                    <Typography variant="h6">{getPendingCount()}</Typography>
                    <Typography variant="body2">Pending</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'white' }}>
                    <Typography variant="h6">{applications.filter(a => a.status === 'approved').length}</Typography>
                    <Typography variant="body2">Approved</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
                    <Typography variant="h6">{applications.filter(a => a.status === 'completed').length}</Typography>
                    <Typography variant="body2">Completed</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>

            {/* Alerts */}
            {error && (
              <Alert 
                severity="error" 
                sx={{ mb: 3, borderRadius: 3 }} 
                onClose={() => setError('')}
                action={
                  <Button color="inherit" size="small" onClick={fetchApplications}>
                    Try Again
                  </Button>
                }
              >
                {error}
              </Alert>
            )}

            {success && (
              <Alert 
                severity="success" 
                sx={{ mb: 3, borderRadius: 3 }} 
                onClose={() => setSuccess('')}
              >
                {success}
              </Alert>
            )}

            {/* Applications Grid */}
            {filteredApplications.length === 0 ? (
              <Paper sx={{ textAlign: 'center', py: 8, borderRadius: 3 }}>
                <Box sx={{ color: 'text.secondary' }}>
                  <TrendingUp sx={{ fontSize: 64, mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    {getActiveFilterCount() > 0 ? 'No matching applications' : 'No applications received yet'}
                  </Typography>
                  <Typography variant="body2">
                    {getActiveFilterCount() > 0 
                      ? 'Try adjusting your filters or search criteria'
                      : 'Applications from influencers will appear here once they apply to your campaigns.'
                    }
                  </Typography>
                  {getActiveFilterCount() > 0 && (
                    <Button 
                      variant="outlined" 
                      sx={{ mt: 2 }}
                      onClick={clearAllFilters}
                    >
                      Clear All Filters
                    </Button>
                  )}
                </Box>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {filteredApplications.map((app) => (
                  <Grid item xs={12} md={6} lg={4} key={`${app.campaign_id}-${app.influencer_id}`}>
                    <Card sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      borderRadius: 3,
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 30px rgba(0,0,0,0.15)'
                      }
                    }}>
                      {/* Campaign Image */}
                      {app.campaign_image_id && (
                        <CampaignImage
                          fileId={app.campaign_image_id}
                          alt={app.campaign_title}
                          onClick={() => setSelectedImage(app.campaign_image_id)}
                          height={200}
                          width="100%"
                        />
                      )}
                      
                      <CardContent sx={{ flexGrow: 1, p: 3 }}>
                        {/* Header */}
                        <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                          <Box display="flex" alignItems="center">
                            <Avatar 
                              sx={{ 
                                width: 48, 
                                height: 48, 
                                mr: 2,
                                bgcolor: getStatusColor(app.status) + '.light',
                                color: getStatusColor(app.status) + '.main'
                              }}
                            >
                              {app.influencer_name?.charAt(0) || 'I'}
                            </Avatar>
                            <Box>
                              <Typography variant="h6" component="h2" noWrap>
                                {app.influencer_name || 'Unknown Influencer'}
                              </Typography>
                              <Typography variant="body2" color="textSecondary" noWrap>
                                {app.influencer_email || 'No email provided'}
                              </Typography>
                            </Box>
                          </Box>
                          <Chip
                            label={getStatusText(app.status)}
                            color={getStatusColor(app.status)}
                            size="small"
                            sx={{ fontWeight: 500 }}
                          />
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        {/* Campaign Info */}
                        <Box mb={2}>
                          <Box display="flex" alignItems="center" mb={1}>
                            <Campaign sx={{ fontSize: 20, mr: 1, color: 'primary.main' }} />
                            <Typography variant="body2" fontWeight="500">
                              {app.campaign_title || 'Unknown Campaign'}
                            </Typography>
                          </Box>

                          <Box display="flex" alignItems="center" mb={1}>
                            <CalendarToday sx={{ fontSize: 20, mr: 1, color: 'info.main' }} />
                            <Typography variant="body2" color="text.secondary">
                              Applied: {formatDate(app.applied_at)}
                            </Typography>
                          </Box>

                          {app.platform && (
                            <Box display="flex" alignItems="center">
                              {getPlatformIcon(app.platform)}
                              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                {app.platform}
                              </Typography>
                            </Box>
                          )}
                        </Box>

                        {/* Message Preview */}
                        {app.message && (
                          <Box mb={2}>
                            <Typography variant="subtitle2" gutterBottom color="text.secondary">
                              MESSAGE
                            </Typography>
                            <Typography 
                              variant="body2" 
                              sx={{
                                p: 1.5,
                                bgcolor: 'grey.50',
                                borderRadius: 2,
                                fontStyle: 'italic',
                                borderLeft: `3px solid ${theme.palette.primary.main}`
                              }}
                            >
                              {app.message.length > 120 
                                ? `${app.message.substring(0, 120)}...` 
                                : app.message}
                            </Typography>
                          </Box>
                        )}
                      </CardContent>

                      <CardActions sx={{ p: 2, pt: 0 }}>
                        <Button
                          size="small"
                          startIcon={<Visibility />}
                          onClick={() => handleViewDetails(app)}
                          sx={{ borderRadius: 2 }}
                        >
                          View Details
                        </Button>

                        {(app.status === 'pending' || !app.status) && (
                          <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              color="success"
                              variant="contained"
                              startIcon={<CheckCircle />}
                              onClick={() => handleStatusChange(app.campaign_id, app.influencer_id, 'approved')}
                              disabled={updatingStatus[`${app.campaign_id}-${app.influencer_id}`]}
                              sx={{ borderRadius: 2, minWidth: 'auto', px: 2 }}
                            >
                              {updatingStatus[`${app.campaign_id}-${app.influencer_id}`] ? 
                                <CircularProgress size={16} /> : 'Approve'}
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              variant="outlined"
                              startIcon={<Cancel />}
                              onClick={() => handleStatusChange(app.campaign_id, app.influencer_id, 'rejected')}
                              disabled={updatingStatus[`${app.campaign_id}-${app.influencer_id}`]}
                              sx={{ borderRadius: 2, minWidth: 'auto', px: 2 }}
                            >
                              {updatingStatus[`${app.campaign_id}-${app.influencer_id}`] ? 
                                <CircularProgress size={16} /> : 'Reject'}
                            </Button>
                          </Box>
                        )}
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Fade>
      </MainContent>

      {/* Keep your existing dialogs here (Application Details, Payment, etc.) */}
      {/* Application Details Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, height: '80vh' } }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main', 
          color: 'white',
          fontWeight: 600
        }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <Message sx={{ mr: 1 }} />
              Application Details
            </Box>
            <IconButton onClick={handleCloseDialog} sx={{ color: 'white' }}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
          <TabContext value={dialogTab}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={dialogTab} 
                onChange={(e, newValue) => setDialogTab(newValue)}
                sx={{ px: 2 }}
              >
                <Tab label="Details" value="0" />
                <Tab label="Messages" value="1" />
              </Tabs>
            </Box>

            <TabPanel value="0" sx={{ flex: 1, overflow: 'auto', p: 3 }}>
              {selectedApplication && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom color="primary">
                      Influencer Information
                    </Typography>
                    
                    <Box display="flex" alignItems="center" mb={3}>
                      <Avatar 
                        sx={{ 
                          mr: 2, 
                          width: 64, 
                          height: 64,
                          bgcolor: getStatusColor(selectedApplication.status) + '.light',
                          color: getStatusColor(selectedApplication.status) + '.main'
                        }}
                      >
                        {selectedApplication.influencer_name?.charAt(0) || 'I'}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight="600">
                          {selectedApplication.influencer_name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          <Email sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                          {selectedApplication.influencer_email}
                        </Typography>
                        <Box display="flex" alignItems="center" mt={0.5}>
                          {getPlatformIcon(selectedApplication.platform)}
                          <Typography variant="caption" sx={{ ml: 0.5 }}>
                            {selectedApplication.platform || 'Social Media'}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {selectedApplication.followers && (
                      <Box mb={2}>
                        <Typography variant="body2" color="text.secondary">
                          Followers: {selectedApplication.followers.toLocaleString()}
                        </Typography>
                      </Box>
                    )}

                    {/* Payment Section for Approved Applications */}
                    {selectedApplication.status === 'approved' && (
                      <Box mt={3}>
                        <Typography variant="h6" gutterBottom color="primary">
                          Payment
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<Payment />}
                          onClick={() => setPaymentDialogOpen(true)}
                          sx={{
                            background: 'linear-gradient(45deg, #4CAF50 0%, #2E7D32 100%)',
                            '&:hover': {
                              background: 'linear-gradient(45deg, #388E3C 0%, #1B5E20 100%)'
                            }
                          }}
                        >
                          Process Payment
                        </Button>
                      </Box>
                    )}
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom color="primary">
                      Application Details
                    </Typography>
                    
                    <Box mb={2}>
                      <Box display="flex" alignItems="center" mb={1}>
                        <Campaign sx={{ fontSize: 20, mr: 1, color: 'primary.main' }} />
                        <Typography variant="body1" fontWeight="500">
                          {selectedApplication.campaign_title}
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center" mb={2}>
                        <CalendarToday sx={{ fontSize: 20, mr: 1, color: 'info.main' }} />
                        <Typography variant="body2">
                          Applied on: {formatDate(selectedApplication.applied_at)}
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center">
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          Status: 
                        </Typography>
                        <Chip 
                          label={getStatusText(selectedApplication.status)} 
                          color={getStatusColor(selectedApplication.status)}
                          sx={{ fontWeight: 500 }}
                        />
                      </Box>
                    </Box>

                    {selectedApplication.message && (
                      <Box mb={3}>
                        <Typography variant="subtitle2" gutterBottom color="text.secondary">
                          MESSAGE FROM INFLUENCER
                        </Typography>
                        <TextField
                          fullWidth
                          multiline
                          rows={4}
                          value={selectedApplication.message}
                          InputProps={{
                            readOnly: true,
                          }}
                          variant="outlined"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              bgcolor: 'grey.50',
                              borderRadius: 2
                            }
                          }}
                        />
                      </Box>
                    )}
                  </Grid>
                </Grid>
              )}
            </TabPanel>

            <TabPanel value="1" sx={{ flex: 1, overflow: 'auto', p: 0 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Messages Container */}
                <Box sx={{ 
                  flex: 1, 
                  overflow: 'auto', 
                  p: 2,
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: 1
                }}>
                  {conversationLoading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                      <CircularProgress />
                    </Box>
                  ) : conversations.length === 0 ? (
                    <Box textAlign="center" py={4} color="text.secondary">
                      <Chat sx={{ fontSize: 48, mb: 1 }} />
                      <Typography variant="h6">No messages yet</Typography>
                      <Typography variant="body2">
                        Start the conversation with {selectedApplication?.influencer_name}
                      </Typography>
                    </Box>
                  ) : (
                    conversations.map((msg) => (
                      <Box 
                        key={msg._id || msg.id} 
                        sx={{
                          maxWidth: '70%',
                          padding: theme.spacing(1.5, 2),
                          borderRadius: '18px',
                          marginBottom: theme.spacing(1),
                          alignSelf: msg.sender_id === selectedApplication?.influencer_id ? 'flex-start' : 'flex-end',
                          backgroundColor: msg.sender_id === selectedApplication?.influencer_id ? 
                            theme.palette.grey[100] : theme.palette.primary.main,
                          color: msg.sender_id === selectedApplication?.influencer_id ? 
                            theme.palette.text.primary : 'white',
                          border: msg.sender_id === selectedApplication?.influencer_id ? 
                            `1px solid ${theme.palette.grey[300]}` : 'none',
                        }}
                      >
                        <Box display="flex" alignItems="flex-start" gap={1}>
                          {msg.message_type === 'payment' ? <Payment /> : 
                           msg.message_type === 'file' ? <AttachFile /> : <Message />}
                          <Box flex={1}>
                            <Typography variant="body2">
                              {msg.content}
                            </Typography>
                            {msg.attachments && msg.attachments.length > 0 && (
                              <Box mt={1}>
                                {msg.attachments.map((attachment, index) => (
                                  <Button
                                    key={index}
                                    size="small"
                                    startIcon={<Download />}
                                    onClick={() => handleDownloadAttachment(msg._id || msg.id, index)}
                                    sx={{ 
                                      mr: 1, 
                                      mb: 1,
                                      backgroundColor: 'rgba(255,255,255,0.2)',
                                      color: 'inherit'
                                    }}
                                  >
                                    {attachment.filename}
                                  </Button>
                                ))}
                              </Box>
                            )}
                            <Typography 
                              variant="caption" 
                              display="block" 
                              sx={{ 
                                mt: 0.5, 
                                opacity: 0.8,
                                textAlign: 'right'
                              }}
                            >
                              {formatDate(msg.created_at)}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    ))
                  )}
                </Box>

                {/* Message Input */}
                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    variant="outlined"
                    placeholder="Type your message here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    sx={{ mb: 2 }}
                  />

                  <Box sx={{ mb: 2 }}>
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<AttachFile />}
                      sx={{ mr: 2 }}
                    >
                      Attach Files
                      <input
                        type="file"
                        multiple
                        hidden
                        onChange={handleFileSelect}
                      />
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={sending ? <CircularProgress size={16} /> : <Send />}
                      onClick={handleSendMessage}
                      disabled={sending || (!message.trim() && attachments.length === 0)}
                    >
                      {sending ? 'Sending...' : 'Send Message'}
                    </Button>
                  </Box>

                  {attachments.length > 0 && (
                    <Box>
                      <Typography variant="caption" display="block" gutterBottom>
                        Attached files:
                      </Typography>
                      <List dense>
                        {attachments.map((file, index) => (
                          <ListItem
                            key={index}
                            secondaryAction={
                              <IconButton
                                edge="end"
                                aria-label="delete"
                                onClick={() => handleRemoveFile(index)}
                                size="small"
                              >
                                <Delete />
                              </IconButton>
                            }
                          >
                            <ListItemIcon>
                              <AttachFile />
                            </ListItemIcon>
                            <ListItemText
                              primary={file.name}
                              secondary={`${(file.size / 1024).toFixed(2)} KB`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </Box>
              </Box>
            </TabPanel>
          </TabContext>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleCloseDialog}
            startIcon={<ArrowBack />}
            sx={{ borderRadius: 2 }}
          >
            Back to List
          </Button>
          {selectedApplication?.status === 'pending' && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                color="success"
                variant="contained"
                startIcon={<CheckCircle />}
                onClick={() => {
                  handleStatusChange(selectedApplication.campaign_id, selectedApplication.influencer_id, 'approved');
                }}
                sx={{ borderRadius: 2 }}
              >
                Approve
              </Button>
              <Button
                color="error"
                variant="outlined"
                startIcon={<Cancel />}
                onClick={() => {
                  handleStatusChange(selectedApplication.campaign_id, selectedApplication.influencer_id, 'rejected');
                }}
                sx={{ borderRadius: 2 }}
              >
                Reject
              </Button>
            </Box>
          )}
        </DialogActions>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog
        open={paymentDialogOpen}
        onClose={handleClosePaymentDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main', 
          color: 'white',
          fontWeight: 600
        }}>
          <Box display="flex" alignItems="center">
            <Payment sx={{ mr: 1 }} />
            Process Payment
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Stepper activeStep={paymentStep} sx={{ mb: 3 }}>
            <Step>
              <StepLabel>Payment Details</StepLabel>
            </Step>
            <Step>
              <StepLabel>Processing</StepLabel>
            </Step>
            <Step>
              <StepLabel>Complete</StepLabel>
            </Step>
          </Stepper>

          {paymentStep === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Payment to {selectedApplication?.influencer_name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Campaign: {selectedApplication?.campaign_title}
              </Typography>
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Amount"
                    type="number"
                    defaultValue="500"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Payment Method"
                    select
                    SelectProps={{
                      native: true,
                    }}
                  >
                    <option value="credit_card">Credit Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="paypal">PayPal</option>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notes"
                    multiline
                    rows={2}
                    placeholder="Payment notes or description"
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {paymentStep === 1 && (
            <Box textAlign="center" py={4}>
              <CircularProgress size={60} thickness={4} />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Processing Payment...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Please wait while we process your payment.
              </Typography>
            </Box>
          )}

          {paymentStep === 2 && (
            <Box textAlign="center" py={4}>
              <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Payment Successful!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Payment has been processed successfully for {selectedApplication?.influencer_name}.
                The campaign status has been updated to "Completed".
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          {paymentStep === 0 && (
            <>
              <Button onClick={handleClosePaymentDialog} sx={{ borderRadius: 2 }}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  const amount = document.querySelector('input[type="number"]').value;
                  const paymentMethod = document.querySelector('select').value;
                  const notes = document.querySelector('textarea').value;
                  handleInitiatePayment(amount, paymentMethod, notes);
                }}
                startIcon={<AccountBalance />}
                sx={{ borderRadius: 2 }}
              >
                Process Payment
              </Button>
            </>
          )}
          {paymentStep === 2 && (
            <Button
              variant="contained"
              onClick={handleClosePaymentDialog}
              sx={{ borderRadius: 2 }}
            >
              Done
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BrandApplications;