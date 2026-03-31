// src/pages/admin/InfluencerUsers.jsx
import React, { useState, useEffect, useContext, useCallback } from "react";
import { AuthContext } from "../../context/AuthContext";
import API_BASE_URL from "../../config/api";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Snackbar,
  useTheme,
  alpha,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment,
  Divider,
  Tab,
  Tabs
} from "@mui/material";
import {
  Search,
  Refresh,
  Delete,
  Visibility,
  Block,
  PlayArrow,
  Person,
  Email,
  CalendarToday,
  ThumbUp,
  Group,
  LocationOn,
  Language,
  Phone,
  Work,
  Category,
  TrendingUp,
  AccountCircle,
  Campaign,
  Instagram,
  YouTube,
  AttachMoney,
  Twitter,
  CheckCircle,
  Warning
} from "@mui/icons-material";
import { FaTiktok } from 'react-icons/fa';

// TabPanel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`influencer-tabpanel-${index}`}
      aria-labelledby={`influencer-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

// Helper function to get image URL
const getImageUrl = (fileId) => {
  if (!fileId) return null;
  return `${API_BASE_URL}/profiles/image/${fileId}`;
};

// Info Row Component
const InfoRow = ({ icon, label, value, multiline = false, isLink = false }) => (
  <Box display="flex" alignItems={multiline ? 'flex-start' : 'center'} gap={1} mb={2}>
    <Box sx={{ color: 'text.secondary', minWidth: 24 }}>{icon}</Box>
    <Box flex={1}>
      <Typography variant="subtitle2" color="textSecondary" gutterBottom={multiline}>
        {label}
      </Typography>
      {isLink && value ? (
        <Typography 
          component="a" 
          href={value.startsWith('http') ? value : `https://${value}`} 
          target="_blank" 
          rel="noopener noreferrer"
          sx={{ 
            color: 'primary.main',
            textDecoration: 'none',
            '&:hover': { textDecoration: 'underline' }
          }}
        >
          {value}
        </Typography>
      ) : (
        <Typography variant="body2" sx={multiline ? { whiteSpace: 'pre-wrap' } : {}}>
          {value || 'Not provided'}
        </Typography>
      )}
    </Box>
  </Box>
);

// Stat Card Component
const StatCard = ({ title, value, color, icon, subtitle }) => {
  const theme = useTheme();
  return (
    <Card sx={{ 
      backgroundColor: alpha(theme.palette[color]?.main || color, 0.1),
      borderRadius: 2,
      height: '100%'
    }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" variant="body2" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" color={`${color}.main`} fontWeight="600">
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ 
            backgroundColor: alpha(theme.palette[color]?.main || color, 0.2),
            color: `${color}.main`,
            width: 48, 
            height: 48 
          }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'active':
        return { color: 'success', icon: <CheckCircle />, label: 'Active' };
      case 'suspended':
        return { color: 'warning', icon: <Warning />, label: 'Suspended' };
      case 'banned':
        return { color: 'error', icon: <Block />, label: 'Banned' };
      default:
        return { color: 'default', icon: <AccountCircle />, label: status };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Chip
      icon={config.icon}
      label={config.label}
      color={config.color}
      size="small"
      variant="filled"
    />
  );
};

// Subscription Badge Component
const SubscriptionBadge = ({ subscription }) => {
  if (!subscription) return null;

  const getSubscriptionColor = () => {
    if (subscription.has_active_subscription) {
      return subscription.is_trial_active ? 'warning' : 'success';
    }
    return 'default';
  };

  const getSubscriptionLabel = () => {
    if (subscription.has_active_subscription) {
      return subscription.is_trial_active ? 'Trial' : subscription.current_plan || 'Paid';
    }
    return 'Free';
  };

  return (
    <Chip
      label={getSubscriptionLabel()}
      color={getSubscriptionColor()}
      size="small"
      variant="outlined"
    />
  );
};

// Social Media Icon Component
const SocialMediaIcon = ({ platform }) => {
  const icons = {
    instagram: <Instagram />,
    youtube: <YouTube />,
    tiktok: <FaTiktok />,
    twitter: <Twitter />,
  };
  return icons[platform.toLowerCase()] || <Language />;
};

export default function InfluencerUsers() {
  const { user } = useContext(AuthContext);
  const [influencers, setInfluencers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedInfluencer, setSelectedInfluencer] = useState(null);
  const [influencerDetails, setInfluencerDetails] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [influencerToDelete, setInfluencerToDelete] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailTab, setDetailTab] = useState(0);
  const [analytics, setAnalytics] = useState({
    total: 0,
    active: 0,
    suspended: 0,
    banned: 0,
    totalPosts: 0
  });

  const theme = useTheme();

  // Fetch Influencers from Admin API
  const fetchInfluencers = useCallback(async () => {
    if (!user?.token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/admin/users?role=influencer`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to fetch influencers: ${res.status}`);
      }
      
      const data = await res.json();
      const influencerUsers = data.users || [];
      
      setInfluencers(influencerUsers);
      
      // Calculate analytics based on backend data structure
      const activeCount = influencerUsers.filter(i => i.status === "active").length;
      const suspendedCount = influencerUsers.filter(i => i.status === "suspended").length;
      const bannedCount = influencerUsers.filter(i => i.status === "banned").length;
      const totalPosts = influencerUsers.reduce((sum, influencer) => sum + (influencer.activity_metrics?.post_count || 0), 0);
      
      setAnalytics({
        total: influencerUsers.length,
        active: activeCount,
        suspended: suspendedCount,
        banned: bannedCount,
        totalPosts: totalPosts
      });
      
      setError(null);
    } catch (err) {
      console.error('Error fetching influencers:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  useEffect(() => {
    fetchInfluencers();
  }, [fetchInfluencers]);

  // Fetch Detailed Influencer Information
  const fetchInfluencerDetails = async (influencerId) => {
    if (!user?.token) return;
    try {
      setDetailsLoading(true);
      const res = await fetch(`${API_BASE_URL}/admin/users/${influencerId}/complete`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to fetch influencer details");
      }
      
      const data = await res.json();
      setInfluencerDetails(data);
    } catch (err) {
      console.error('Error fetching influencer details:', err);
      setError(`Failed to load influencer details: ${err.message}`);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Handle view influencer - fetch detailed information
  const handleViewInfluencer = async (influencer) => {
    setSelectedInfluencer(influencer);
    setViewDialogOpen(true);
    setDetailTab(0);
    await fetchInfluencerDetails(influencer._id);
  };

  // Update User Status
  const updateUserStatus = async (influencerId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${influencerId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to update user status");
      }
      
      // Update local state
      setInfluencers(prev => prev.map(influencer => 
        influencer._id === influencerId 
          ? { ...influencer, status: newStatus } 
          : influencer
      ));
      
      // Update analytics
      setAnalytics(prev => {
        const newAnalytics = { ...prev };
        
        // Remove from old status count
        if (selectedInfluencer?.status === 'active') newAnalytics.active--;
        if (selectedInfluencer?.status === 'suspended') newAnalytics.suspended--;
        if (selectedInfluencer?.status === 'banned') newAnalytics.banned--;
        
        // Add to new status count
        if (newStatus === 'active') newAnalytics.active++;
        if (newStatus === 'suspended') newAnalytics.suspended++;
        if (newStatus === 'banned') newAnalytics.banned++;
        
        return newAnalytics;
      });
      
      // Update selected influencer if it's the one being modified
      if (selectedInfluencer && selectedInfluencer._id === influencerId) {
        setSelectedInfluencer(prev => ({
          ...prev,
          status: newStatus
        }));
      }
      
      setSuccess(`Influencer status updated to ${newStatus} successfully`);
    } catch (err) {
      setError(err.message);
    }
  };

  // Remove Influencer
  const removeInfluencer = async (influencerId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${influencerId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to remove influencer");
      }
      
      setInfluencers((prev) => prev.filter((i) => i._id !== influencerId));
      setSuccess("Influencer removed successfully");
      setDeleteDialogOpen(false);
      
      // Update analytics
      const deletedInfluencer = influencers.find(i => i._id === influencerId);
      if (deletedInfluencer) {
        setAnalytics(prev => ({
          total: prev.total - 1,
          active: deletedInfluencer.status === 'active' ? prev.active - 1 : prev.active,
          suspended: deletedInfluencer.status === 'suspended' ? prev.suspended - 1 : prev.suspended,
          banned: deletedInfluencer.status === 'banned' ? prev.banned - 1 : prev.banned,
          totalPosts: prev.totalPosts - (deletedInfluencer.activity_metrics?.post_count || 0)
        }));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle delete confirmation
  const handleDeleteClick = (influencerId) => {
    setInfluencerToDelete(influencerId);
    setDeleteDialogOpen(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (influencerToDelete) {
      removeInfluencer(influencerToDelete);
    }
  };

  // Filter influencers based on search
  const filteredInfluencers = influencers.filter((influencer) => {
    if (!search) return true;
    
    const searchTerm = search.toLowerCase();
    const searchFields = [
      influencer.username,
      influencer.email,
      influencer.influencer_profile?.full_name,
      influencer.influencer_profile?.nickname,
      influencer.influencer_profile?.location,
      influencer.influencer_profile?.niche,
      influencer.influencer_profile?.bio
    ].filter(Boolean).join(" ").toLowerCase();
    
    return searchFields.includes(searchTerm);
  });

  // Close snackbar
  const handleCloseSnackbar = () => {
    setError(null);
    setSuccess(null);
  };

  // Handle tab change
  const handleDetailTabChange = (event, newValue) => {
    setDetailTab(newValue);
  };

  // Get display name for influencer
  const getDisplayName = (influencer) => {
    return influencer.influencer_profile?.nickname || 
           influencer.influencer_profile?.full_name || 
           influencer.username || 
           influencer.email;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format date with time
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get profile completion status
  const getProfileCompletion = (influencer) => {
    const profile = influencer.influencer_profile || {};
    const requiredFields = ['full_name', 'niche', 'location'];
    const completedFields = requiredFields.filter(field => profile[field]);
    return {
      completed: completedFields.length,
      total: requiredFields.length,
      percentage: Math.round((completedFields.length / requiredFields.length) * 100)
    };
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="600" gutterBottom>
        Influencer Management
      </Typography>

      {/* Analytics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Influencers" 
            value={analytics.total} 
            color="primary" 
            icon={<Person />} 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Active Influencers" 
            value={analytics.active} 
            color="success" 
            icon={<CheckCircle />} 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Suspended Influencers" 
            value={analytics.suspended} 
            color="warning" 
            icon={<Warning />} 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Posts" 
            value={analytics.totalPosts} 
            color="info" 
            icon={<TrendingUp />} 
          />
        </Grid>
      </Grid>

      {/* Search and Actions */}
      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
            <TextField
              placeholder="Search influencers by name, email, niche, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ minWidth: 300, flexGrow: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchInfluencers}
              disabled={loading}
              sx={{ borderRadius: 2 }}
            >
              {loading ? <CircularProgress size={20} /> : 'Refresh'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Influencers Table */}
      <Card sx={{ borderRadius: 2 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="200px">
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Loading influencers...</Typography>
          </Box>
        ) : error ? (
          <Alert 
            severity="error" 
            sx={{ m: 2 }}
            action={
              <Button onClick={fetchInfluencers} color="inherit" size="small">
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        ) : filteredInfluencers.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Person sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No influencers found
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {search ? 'Try adjusting your search terms' : 'No influencers have registered yet'}
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Influencer</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Niche & Location</TableCell>
                  <TableCell>Activity</TableCell>
                  <TableCell>Status & Subscription</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredInfluencers.map((influencer) => {
                  const displayName = getDisplayName(influencer);
                  const profileImage = getImageUrl(influencer.influencer_profile?.profile_picture);
                  const profileCompletion = getProfileCompletion(influencer);
                  const activityMetrics = influencer.activity_metrics || {};
                  
                  return (
                    <TableRow 
                      key={influencer._id} 
                      hover
                      sx={{ 
                        backgroundColor: influencer.status !== 'active' ? alpha(theme.palette.warning.light, 0.05) : 'inherit' 
                      }}
                    >
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar 
                            sx={{ mr: 2, bgcolor: 'secondary.main' }}
                            src={profileImage || undefined}
                          >
                            {!profileImage && displayName.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body1" fontWeight="500">
                              {displayName}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              @{influencer.username}
                            </Typography>
                            <Box sx={{ mt: 0.5 }}>
                              <Chip 
                                label={`${profileCompletion.percentage}% Complete`} 
                                size="small" 
                                color={profileCompletion.percentage >= 80 ? 'success' : profileCompletion.percentage >= 50 ? 'warning' : 'error'}
                                variant="outlined"
                                sx={{ height: 20, fontSize: '0.7rem' }}
                              />
                            </Box>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{influencer.email}</Typography>
                        {influencer.influencer_profile?.phone_number && (
                          <Typography variant="caption" color="textSecondary" display="block">
                            {influencer.influencer_profile.phone_number}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" flexDirection="column" gap={0.5}>
                          {influencer.influencer_profile?.niche && (
                            <Chip 
                              label={influencer.influencer_profile.niche} 
                              size="small" 
                              color="primary"
                            />
                          )}
                          {influencer.influencer_profile?.location && (
                            <Chip 
                              label={influencer.influencer_profile.location} 
                              size="small" 
                              variant="outlined"
                              icon={<LocationOn fontSize="small" />}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1} flexDirection="column">
                          <Box display="flex" gap={0.5}>
                            <Chip 
                              label={`${activityMetrics.post_count || 0} posts`} 
                              size="small" 
                              color="primary"
                              variant="outlined"
                            />
                            <Chip 
                              label={`${activityMetrics.followers_count || 0} followers`} 
                              size="small" 
                              color="secondary"
                              variant="outlined"
                            />
                          </Box>
                          <Typography variant="caption" color="textSecondary">
                            Joined: {formatDate(influencer.created_at)}
                          </Typography>
                          {activityMetrics.days_since_last_login && (
                            <Typography variant="caption" color="textSecondary">
                              Last login: {activityMetrics.days_since_last_login} days ago
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" flexDirection="column" gap={0.5}>
                          <StatusBadge status={influencer.status} />
                          <SubscriptionBadge subscription={influencer.subscription} />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <IconButton 
                            onClick={() => handleViewInfluencer(influencer)}
                            color="info"
                            title="View Details"
                          >
                            <Visibility />
                          </IconButton>
                          <IconButton 
                            onClick={() => updateUserStatus(influencer._id, influencer.status === 'active' ? 'suspended' : 'active')}
                            color={influencer.status === 'active' ? 'warning' : 'success'}
                            title={influencer.status === 'active' ? 'Suspend Influencer' : 'Activate Influencer'}
                          >
                            {influencer.status === 'active' ? <Block /> : <PlayArrow />}
                          </IconButton>
                          <IconButton 
                            onClick={() => handleDeleteClick(influencer._id)}
                            color="error"
                            title="Delete Influencer"
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Influencer Detail Dialog */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={() => setViewDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Person />
          Influencer Details - {selectedInfluencer ? getDisplayName(selectedInfluencer) : ''}
        </DialogTitle>
        <DialogContent dividers>
          {detailsLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="200px">
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>Loading influencer details...</Typography>
            </Box>
          ) : selectedInfluencer && (
            <Box>
              {/* Profile Header */}
              <Box display="flex" alignItems="center" gap={3} mb={3}>
                <Avatar 
                  sx={{ 
                    width: 80, 
                    height: 80,
                    bgcolor: 'secondary.main',
                    ...(selectedInfluencer.influencer_profile?.profile_picture && { bgcolor: 'transparent' })
                  }}
                  src={selectedInfluencer.influencer_profile?.profile_picture ? getImageUrl(selectedInfluencer.influencer_profile.profile_picture) : undefined}
                >
                  {getDisplayName(selectedInfluencer).charAt(0).toUpperCase()}
                </Avatar>
                
                <Box flex={1}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Typography variant="h5" fontWeight="600">
                      {getDisplayName(selectedInfluencer)}
                    </Typography>
                    <StatusBadge status={selectedInfluencer.status} />
                    <SubscriptionBadge subscription={selectedInfluencer.subscription} />
                  </Box>
                  
                  <Typography variant="body1" color="textSecondary" gutterBottom>
                    @{selectedInfluencer.username} • {selectedInfluencer.email}
                  </Typography>
                  
                  {selectedInfluencer.influencer_profile?.niche && (
                    <Chip 
                      label={selectedInfluencer.influencer_profile.niche} 
                      size="small" 
                      color="primary"
                      variant="outlined"
                      sx={{ mr: 1 }}
                    />
                  )}
                  
                  {selectedInfluencer.influencer_profile?.location && (
                    <Chip 
                      label={selectedInfluencer.influencer_profile.location} 
                      size="small" 
                      variant="outlined"
                      icon={<LocationOn />}
                    />
                  )}
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Tabs for Detailed Information */}
              <Tabs value={detailTab} onChange={handleDetailTabChange} sx={{ mb: 2 }}>
                <Tab label="Overview" />
                <Tab label="Profile Details" />
                <Tab label="Statistics" />
                <Tab label="Subscription" />
              </Tabs>

              <TabPanel value={detailTab} index={0}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccountCircle /> Basic Information
                    </Typography>
                    
                    <Box sx={{ pl: 1 }}>
                      <InfoRow icon={<Email />} label="Email" value={selectedInfluencer.email} />
                      <InfoRow icon={<CalendarToday />} label="Member Since" value={formatDateTime(selectedInfluencer.created_at)} />
                      <InfoRow icon={<AccountCircle />} label="Username" value={selectedInfluencer.username} />
                      <InfoRow icon={<CalendarToday />} label="Last Login" value={formatDateTime(selectedInfluencer.last_login)} />
                      {selectedInfluencer.influencer_profile?.phone_number && (
                        <InfoRow icon={<Phone />} label="Phone" value={selectedInfluencer.influencer_profile.phone_number} />
                      )}
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOn /> Location & Niche
                    </Typography>
                    
                    <Box sx={{ pl: 1 }}>
                      <InfoRow icon={<LocationOn />} label="Location" value={selectedInfluencer.influencer_profile?.location} />
                      <InfoRow icon={<Category />} label="Niche" value={selectedInfluencer.influencer_profile?.niche} />
                      <InfoRow icon={<Work />} label="Content Type" value={selectedInfluencer.influencer_profile?.content_type} />
                      <InfoRow icon={<Language />} label="Languages" value={selectedInfluencer.influencer_profile?.languages?.join(', ')} />
                    </Box>
                  </Grid>

                  {selectedInfluencer.influencer_profile?.bio && (
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Work /> About
                      </Typography>
                      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                          {selectedInfluencer.influencer_profile.bio}
                        </Typography>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              </TabPanel>

              <TabPanel value={detailTab} index={1}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person /> Personal Details
                    </Typography>
                    
                    <Box sx={{ pl: 1 }}>
                      <InfoRow icon={<AccountCircle />} label="Full Name" value={selectedInfluencer.influencer_profile?.full_name} />
                      <InfoRow icon={<AccountCircle />} label="Nickname" value={selectedInfluencer.influencer_profile?.nickname} />
                      <InfoRow icon={<CalendarToday />} label="Date of Birth" value={selectedInfluencer.influencer_profile?.date_of_birth ? formatDate(selectedInfluencer.influencer_profile.date_of_birth) : 'Not provided'} />
                      {selectedInfluencer.influencer_profile?.gender && (
                        <InfoRow icon={<Person />} label="Gender" value={selectedInfluencer.influencer_profile.gender} />
                      )}
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendingUp /> Audience & Rates
                    </Typography>
                    
                    <Box sx={{ pl: 1 }}>
                      <InfoRow icon={<Group />} label="Follower Count" value={selectedInfluencer.activity_metrics?.followers_count || 'Not provided'} />
                      <InfoRow icon={<TrendingUp />} label="Engagement Rate" value={selectedInfluencer.influencer_profile?.engagement_rate ? `${selectedInfluencer.influencer_profile.engagement_rate}%` : 'Not provided'} />
                      <InfoRow icon={<Campaign />} label="Average Views" value={selectedInfluencer.influencer_profile?.average_views || 'Not provided'} />
                      {selectedInfluencer.influencer_profile?.rate && (
                        <InfoRow icon={<AttachMoney />} label="Rate" value={`$${selectedInfluencer.influencer_profile.rate}`} />
                      )}
                    </Box>
                  </Grid>

                  {selectedInfluencer.influencer_profile?.social_links && Object.values(selectedInfluencer.influencer_profile.social_links).some(Boolean) && (
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Language /> Social Links
                      </Typography>
                      <Box display="flex" gap={1} flexWrap="wrap">
                        {Object.entries(selectedInfluencer.influencer_profile.social_links).map(([platform, url]) => (
                          url && (
                            <Chip 
                              key={platform}
                              label={platform}
                              size="small"
                              variant="outlined"
                              icon={<SocialMediaIcon platform={platform} />}
                              component="a"
                              href={url.startsWith('http') ? url : `https://${url}`}
                              target="_blank"
                              clickable
                            />
                          )
                        ))}
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </TabPanel>

              <TabPanel value={detailTab} index={2}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <StatCard 
                      title="Posts" 
                      value={selectedInfluencer.activity_metrics?.post_count || 0} 
                      color="primary" 
                      icon={<TrendingUp />} 
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <StatCard 
                      title="Followers" 
                      value={selectedInfluencer.activity_metrics?.followers_count || 0} 
                      color="secondary" 
                      icon={<Group />} 
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <StatCard 
                      title="Following" 
                      value={selectedInfluencer.activity_metrics?.following_count || 0} 
                      color="info" 
                      icon={<Person />} 
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <StatCard 
                      title="Days Registered" 
                      value={selectedInfluencer.activity_metrics?.days_since_registration || 0} 
                      color="warning" 
                      icon={<CalendarToday />} 
                    />
                  </Grid>
                </Grid>

                {/* Enhanced details from complete endpoint */}
                {influencerDetails && (
                  <Box mt={3}>
                    <Typography variant="h6" gutterBottom>
                      Detailed Engagement Metrics
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h6" color="primary">
                            {influencerDetails.engagement_metrics?.total_likes || 0}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Total Likes
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h6" color="secondary">
                            {influencerDetails.engagement_metrics?.total_comments || 0}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Total Comments
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h6" color="info">
                            {influencerDetails.engagement_metrics?.total_views || 0}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Total Views
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h6" color="success">
                            {influencerDetails.engagement_metrics?.average_engagement || 0}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Avg Engagement
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </TabPanel>

              <TabPanel value={detailTab} index={3}>
                {selectedInfluencer.subscription ? (
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AttachMoney /> Subscription Information
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <InfoRow 
                          icon={<AttachMoney />} 
                          label="Subscription Status" 
                          value={selectedInfluencer.subscription.has_active_subscription ? 'Active' : 'Inactive'} 
                        />
                        <InfoRow 
                          icon={<Work />} 
                          label="Current Plan" 
                          value={selectedInfluencer.subscription.current_plan || 'Free'} 
                        />
                        <InfoRow 
                          icon={<Campaign />} 
                          label="Trial Status" 
                          value={selectedInfluencer.subscription.is_trial_active ? 'Active Trial' : 'No Trial'} 
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        {selectedInfluencer.subscription.details && (
                          <>
                            <InfoRow 
                              icon={<CalendarToday />} 
                              label="Period Start" 
                              value={formatDateTime(selectedInfluencer.subscription.details.current_period_start)} 
                            />
                            <InfoRow 
                              icon={<CalendarToday />} 
                              label="Period End" 
                              value={formatDateTime(selectedInfluencer.subscription.details.current_period_end)} 
                            />
                            <InfoRow 
                              icon={<AttachMoney />} 
                              label="Billing Cycle" 
                              value={selectedInfluencer.subscription.details.plan || 'N/A'} 
                            />
                          </>
                        )}
                      </Grid>
                    </Grid>

                    {/* Subscription History */}
                    {influencerDetails?.subscription_history && influencerDetails.subscription_history.length > 0 && (
                      <Box mt={3}>
                        <Typography variant="h6" gutterBottom>
                          Subscription History
                        </Typography>
                        <TableContainer component={Paper} variant="outlined">
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Plan</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Start Date</TableCell>
                                <TableCell>End Date</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {influencerDetails.subscription_history.slice(0, 5).map((sub, index) => (
                                <TableRow key={index}>
                                  <TableCell>{sub.plan}</TableCell>
                                  <TableCell>
                                    <Chip 
                                      label={sub.status} 
                                      size="small" 
                                      color={sub.status === 'active' ? 'success' : 'default'}
                                    />
                                  </TableCell>
                                  <TableCell>{formatDate(sub.created_at)}</TableCell>
                                  <TableCell>
                                    {sub.current_period_end ? formatDate(sub.current_period_end) : 'N/A'}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Box textAlign="center" py={4}>
                    <AttachMoney sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="textSecondary">
                      No subscription information available
                    </Typography>
                  </Box>
                )}
              </TabPanel>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setViewDialogOpen(false)}
            sx={{ borderRadius: 2 }}
          >
            Close
          </Button>
          {selectedInfluencer && (
            <Button 
              onClick={() => updateUserStatus(selectedInfluencer._id, selectedInfluencer.status === 'active' ? 'suspended' : 'active')}
              color={selectedInfluencer.status === 'active' ? 'warning' : 'success'}
              variant="outlined"
              sx={{ borderRadius: 2 }}
            >
              {selectedInfluencer.status === 'active' ? 'Suspend Influencer' : 'Activate Influencer'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to permanently remove this influencer? This action cannot be undone and will delete all associated data including posts, profile information, and collaborations.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmDelete}
            color="error"
            variant="contained"
            sx={{ borderRadius: 2 }}
          >
            Delete Influencer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Messages */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity="error" 
          onClose={handleCloseSnackbar}
          variant="filled"
          sx={{ borderRadius: 2 }}
        >
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar 
        open={!!success} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity="success" 
          onClose={handleCloseSnackbar}
          variant="filled"
          sx={{ borderRadius: 2 }}
        >
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
}