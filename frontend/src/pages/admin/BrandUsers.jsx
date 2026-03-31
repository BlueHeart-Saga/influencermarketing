// src/pages/admin/BrandUsers.jsx
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
  Switch,
  FormControlLabel,
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
  Business,
  Email,
  CalendarToday,
  TrendingUp,
  LocationOn,
  Language,
  Phone,
  People,
  Category,
  Work,
  AccountCircle,
  Campaign,
  AttachMoney,
  Group,
  Subscriptions,
  Star,
  StarBorder,
  Warning,
  CheckCircle
} from "@mui/icons-material";

// TabPanel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`brand-tabpanel-${index}`}
      aria-labelledby={`brand-tab-${index}`}
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

// Subscription Badge Component
const SubscriptionBadge = ({ subscription }) => {
  if (!subscription) return null;

  const getSubscriptionColor = () => {
    if (subscription.has_active_subscription) {
      return subscription.is_trial_active ? 'warning' : 'success';
    }
    return 'default';
  };

  const getSubscriptionIcon = () => {
    if (subscription.has_active_subscription) {
      return subscription.is_trial_active ? <Star /> : <Subscriptions />;
    }
    return <StarBorder />;
  };

  const getSubscriptionLabel = () => {
    if (subscription.has_active_subscription) {
      return subscription.is_trial_active ? 'Trial' : subscription.current_plan || 'Paid';
    }
    return 'Free';
  };

  return (
    <Chip
      icon={getSubscriptionIcon()}
      label={getSubscriptionLabel()}
      color={getSubscriptionColor()}
      size="small"
      variant="outlined"
    />
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

export default function BrandUsers() {
  const { user } = useContext(AuthContext);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [brandDetails, setBrandDetails] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState(null);
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

  // Fetch Brands from Admin API
  const fetchBrands = useCallback(async () => {
    if (!user?.token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/admin/users?role=brand`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to fetch brands: ${res.status}`);
      }
      
      const data = await res.json();
      const brandUsers = data.users || [];
      
      setBrands(brandUsers);
      
      // Calculate analytics based on backend data structure
      const activeCount = brandUsers.filter(b => b.status === "active").length;
      const suspendedCount = brandUsers.filter(b => b.status === "suspended").length;
      const bannedCount = brandUsers.filter(b => b.status === "banned").length;
      const totalPosts = brandUsers.reduce((sum, brand) => sum + (brand.activity_metrics?.post_count || 0), 0);
      
      setAnalytics({
        total: brandUsers.length,
        active: activeCount,
        suspended: suspendedCount,
        banned: bannedCount,
        totalPosts: totalPosts
      });
      
      setError(null);
    } catch (err) {
      console.error('Error fetching brands:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  // Fetch Detailed Brand Information
  const fetchBrandDetails = async (brandId) => {
    if (!user?.token) return;
    try {
      setDetailsLoading(true);
      const res = await fetch(`${API_BASE_URL}/admin/users/${brandId}/complete`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to fetch brand details");
      }
      
      const data = await res.json();
      setBrandDetails(data);
    } catch (err) {
      console.error('Error fetching brand details:', err);
      setError(`Failed to load brand details: ${err.message}`);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Handle view brand - fetch detailed information
  const handleViewBrand = async (brand) => {
    setSelectedBrand(brand);
    setViewDialogOpen(true);
    setDetailTab(0);
    await fetchBrandDetails(brand._id);
  };

  // Update User Status
  const updateUserStatus = async (brandId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${brandId}/status`, {
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
      setBrands(prev => prev.map(brand => 
        brand._id === brandId 
          ? { ...brand, status: newStatus } 
          : brand
      ));
      
      // Update analytics
      setAnalytics(prev => {
        const newAnalytics = { ...prev };
        
        // Remove from old status count
        if (selectedBrand?.status === 'active') newAnalytics.active--;
        if (selectedBrand?.status === 'suspended') newAnalytics.suspended--;
        if (selectedBrand?.status === 'banned') newAnalytics.banned--;
        
        // Add to new status count
        if (newStatus === 'active') newAnalytics.active++;
        if (newStatus === 'suspended') newAnalytics.suspended++;
        if (newStatus === 'banned') newAnalytics.banned++;
        
        return newAnalytics;
      });
      
      // Update selected brand if it's the one being modified
      if (selectedBrand && selectedBrand._id === brandId) {
        setSelectedBrand(prev => ({
          ...prev,
          status: newStatus
        }));
      }
      
      setSuccess(`Brand status updated to ${newStatus} successfully`);
    } catch (err) {
      setError(err.message);
    }
  };

  // Remove Brand
  const removeBrand = async (brandId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${brandId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to remove brand");
      }
      
      setBrands((prev) => prev.filter((b) => b._id !== brandId));
      setSuccess("Brand removed successfully");
      setDeleteDialogOpen(false);
      
      // Update analytics
      const deletedBrand = brands.find(b => b._id === brandId);
      if (deletedBrand) {
        setAnalytics(prev => ({
          total: prev.total - 1,
          active: deletedBrand.status === 'active' ? prev.active - 1 : prev.active,
          suspended: deletedBrand.status === 'suspended' ? prev.suspended - 1 : prev.suspended,
          banned: deletedBrand.status === 'banned' ? prev.banned - 1 : prev.banned,
          totalPosts: prev.totalPosts - (deletedBrand.activity_metrics?.post_count || 0)
        }));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle delete confirmation
  const handleDeleteClick = (brandId) => {
    setBrandToDelete(brandId);
    setDeleteDialogOpen(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (brandToDelete) {
      removeBrand(brandToDelete);
    }
  };

  // Filter brands based on search
  const filteredBrands = brands.filter((brand) => {
    if (!search) return true;
    
    const searchTerm = search.toLowerCase();
    const searchFields = [
      brand.username,
      brand.email,
      brand.brand_profile?.company_name,
      brand.brand_profile?.contact_person_name,
      brand.brand_profile?.location,
      brand.brand_profile?.industry,
      brand.brand_profile?.categories?.join(' ') || ''
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

  // Get display name for brand
  const getDisplayName = (brand) => {
    return brand.brand_profile?.company_name || brand.username || brand.email;
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
  const getProfileCompletion = (brand) => {
    const profile = brand.brand_profile || {};
    const requiredFields = ['company_name', 'industry', 'location'];
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
        Brand Management
      </Typography>

      {/* Analytics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Brands" 
            value={analytics.total} 
            color="primary" 
            icon={<Business />} 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Active Brands" 
            value={analytics.active} 
            color="success" 
            icon={<CheckCircle />} 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Suspended Brands" 
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
              placeholder="Search brands by name, email, company, location..."
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
              onClick={fetchBrands}
              disabled={loading}
              sx={{ borderRadius: 2 }}
            >
              {loading ? <CircularProgress size={20} /> : 'Refresh'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Brands Table */}
      <Card sx={{ borderRadius: 2 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="200px">
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Loading brands...</Typography>
          </Box>
        ) : error ? (
          <Alert 
            severity="error" 
            sx={{ m: 2 }}
            action={
              <Button onClick={fetchBrands} color="inherit" size="small">
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        ) : filteredBrands.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Business sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No brands found
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {search ? 'Try adjusting your search terms' : 'No brands have registered yet'}
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Brand</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Activity</TableCell>
                  <TableCell>Status & Subscription</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredBrands.map((brand) => {
                  const displayName = getDisplayName(brand);
                  const profileImage = getImageUrl(brand.brand_profile?.logo);
                  const profileCompletion = getProfileCompletion(brand);
                  const activityMetrics = brand.activity_metrics || {};
                  
                  return (
                    <TableRow 
                      key={brand._id} 
                      hover
                      sx={{ 
                        backgroundColor: brand.status !== 'active' ? alpha(theme.palette.warning.light, 0.05) : 'inherit' 
                      }}
                    >
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar 
                            sx={{ mr: 2, bgcolor: 'primary.main' }}
                            src={profileImage || undefined}
                          >
                            {!profileImage && displayName.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body1" fontWeight="500">
                              {displayName}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              @{brand.username}
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
                        <Typography variant="body2">{brand.email}</Typography>
                        {brand.brand_profile?.contact_person_name && (
                          <Typography variant="caption" color="textSecondary" display="block">
                            {brand.brand_profile.contact_person_name}
                          </Typography>
                        )}
                        {brand.brand_profile?.phone_number && (
                          <Typography variant="caption" color="textSecondary">
                            {brand.brand_profile.phone_number}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {brand.brand_profile?.location ? (
                          <Chip 
                            label={brand.brand_profile.location} 
                            size="small" 
                            variant="outlined"
                            icon={<LocationOn fontSize="small" />}
                          />
                        ) : (
                          <Typography variant="body2" color="textSecondary">
                            Not specified
                          </Typography>
                        )}
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
                            Joined: {formatDate(brand.created_at)}
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
                          <StatusBadge status={brand.status} />
                          <SubscriptionBadge subscription={brand.subscription} />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <IconButton 
                            onClick={() => handleViewBrand(brand)}
                            color="info"
                            title="View Details"
                          >
                            <Visibility />
                          </IconButton>
                          <IconButton 
                            onClick={() => updateUserStatus(brand._id, brand.status === 'active' ? 'suspended' : 'active')}
                            color={brand.status === 'active' ? 'warning' : 'success'}
                            title={brand.status === 'active' ? 'Suspend Brand' : 'Activate Brand'}
                          >
                            {brand.status === 'active' ? <Block /> : <PlayArrow />}
                          </IconButton>
                          <IconButton 
                            onClick={() => handleDeleteClick(brand._id)}
                            color="error"
                            title="Delete Brand"
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

      {/* Brand Detail Dialog */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={() => setViewDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Business />
          Brand Details - {selectedBrand ? getDisplayName(selectedBrand) : ''}
        </DialogTitle>
        <DialogContent dividers>
          {detailsLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="200px">
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>Loading brand details...</Typography>
            </Box>
          ) : selectedBrand && (
            <Box>
              {/* Profile Header */}
              <Box display="flex" alignItems="center" gap={3} mb={3}>
                <Avatar 
                  sx={{ 
                    width: 80, 
                    height: 80,
                    bgcolor: 'primary.main',
                    ...(selectedBrand.brand_profile?.logo && { bgcolor: 'transparent' })
                  }}
                  src={selectedBrand.brand_profile?.logo ? getImageUrl(selectedBrand.brand_profile.logo) : undefined}
                >
                  {getDisplayName(selectedBrand).charAt(0).toUpperCase()}
                </Avatar>
                
                <Box flex={1}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Typography variant="h5" fontWeight="600">
                      {getDisplayName(selectedBrand)}
                    </Typography>
                    <StatusBadge status={selectedBrand.status} />
                    <SubscriptionBadge subscription={selectedBrand.subscription} />
                  </Box>
                  
                  <Typography variant="body1" color="textSecondary" gutterBottom>
                    @{selectedBrand.username} • {selectedBrand.email}
                  </Typography>
                  
                  {selectedBrand.brand_profile?.industry && (
                    <Chip 
                      label={selectedBrand.brand_profile.industry} 
                      size="small" 
                      color="primary"
                      variant="outlined"
                      sx={{ mr: 1 }}
                    />
                  )}
                  
                  {selectedBrand.brand_profile?.location && (
                    <Chip 
                      label={selectedBrand.brand_profile.location} 
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
                <Tab label="Business Details" />
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
                      <InfoRow icon={<Email />} label="Email" value={selectedBrand.email} />
                      <InfoRow icon={<CalendarToday />} label="Member Since" value={formatDateTime(selectedBrand.created_at)} />
                      <InfoRow icon={<AccountCircle />} label="Username" value={selectedBrand.username} />
                      <InfoRow icon={<CalendarToday />} label="Last Login" value={formatDateTime(selectedBrand.last_login)} />
                      {selectedBrand.brand_profile?.contact_person_name && (
                        <InfoRow icon={<People />} label="Contact Person" value={selectedBrand.brand_profile.contact_person_name} />
                      )}
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOn /> Location & Contact
                    </Typography>
                    
                    <Box sx={{ pl: 1 }}>
                      <InfoRow icon={<LocationOn />} label="Location" value={selectedBrand.brand_profile?.location} />
                      <InfoRow icon={<Phone />} label="Phone" value={selectedBrand.brand_profile?.phone_number} />
                      <InfoRow icon={<Language />} label="Website" value={selectedBrand.brand_profile?.website} isLink />
                      <InfoRow icon={<Email />} label="Contact Email" value={selectedBrand.brand_profile?.email} />
                    </Box>
                  </Grid>

                  {selectedBrand.brand_profile?.target_audience && (
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Group /> Target Audience
                      </Typography>
                      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                          {selectedBrand.brand_profile.target_audience}
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
                      <Business /> Company Details
                    </Typography>
                    
                    <Box sx={{ pl: 1 }}>
                      <InfoRow icon={<Work />} label="Company Name" value={selectedBrand.brand_profile?.company_name} />
                      <InfoRow icon={<Category />} label="Industry" value={selectedBrand.brand_profile?.industry} />
                      {selectedBrand.brand_profile?.company_size && (
                        <InfoRow icon={<Group />} label="Company Size" value={selectedBrand.brand_profile.company_size} />
                      )}
                      {selectedBrand.brand_profile?.established_year && (
                        <InfoRow icon={<CalendarToday />} label="Established Year" value={selectedBrand.brand_profile.established_year} />
                      )}
                      {selectedBrand.brand_profile?.description && (
                        <InfoRow 
                          icon={<AccountCircle />} 
                          label="Company Description" 
                          value={selectedBrand.brand_profile.description} 
                          multiline 
                        />
                      )}
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Category /> Categories & Social
                    </Typography>
                    
                    <Box sx={{ pl: 1 }}>
                      {selectedBrand.brand_profile?.categories && selectedBrand.brand_profile.categories.length > 0 && (
                        <Box mb={2}>
                          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                            Categories:
                          </Typography>
                          <Box display="flex" gap={1} flexWrap="wrap">
                            {selectedBrand.brand_profile.categories.map((category, index) => (
                              <Chip key={index} label={category} size="small" variant="outlined" />
                            ))}
                          </Box>
                        </Box>
                      )}
                      
                      {selectedBrand.brand_profile?.social_links && (
                        <Box>
                          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                            Social Links:
                          </Typography>
                          <Box display="flex" gap={1} flexWrap="wrap">
                            {Object.entries(selectedBrand.brand_profile.social_links).map(([platform, url]) => (
                              url && (
                                <Chip 
                                  key={platform}
                                  label={platform}
                                  size="small"
                                  variant="outlined"
                                  component="a"
                                  href={url.startsWith('http') ? url : `https://${url}`}
                                  target="_blank"
                                  clickable
                                />
                              )
                            ))}
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel value={detailTab} index={2}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <StatCard 
                      title="Posts" 
                      value={selectedBrand.activity_metrics?.post_count || 0} 
                      color="primary" 
                      icon={<TrendingUp />} 
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <StatCard 
                      title="Followers" 
                      value={selectedBrand.activity_metrics?.followers_count || 0} 
                      color="secondary" 
                      icon={<Group />} 
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <StatCard 
                      title="Following" 
                      value={selectedBrand.activity_metrics?.following_count || 0} 
                      color="info" 
                      icon={<People />} 
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <StatCard 
                      title="Days Registered" 
                      value={selectedBrand.activity_metrics?.days_since_registration || 0} 
                      color="warning" 
                      icon={<CalendarToday />} 
                    />
                  </Grid>
                </Grid>

                {/* Enhanced details from complete endpoint */}
                {brandDetails && (
                  <Box mt={3}>
                    <Typography variant="h6" gutterBottom>
                      Detailed Engagement Metrics
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h6" color="primary">
                            {brandDetails.engagement_metrics?.total_likes || 0}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Total Likes
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h6" color="secondary">
                            {brandDetails.engagement_metrics?.total_comments || 0}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Total Comments
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h6" color="info">
                            {brandDetails.engagement_metrics?.total_views || 0}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Total Views
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h6" color="success">
                            {brandDetails.engagement_metrics?.average_engagement || 0}
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
                {selectedBrand.subscription ? (
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Subscriptions /> Subscription Information
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <InfoRow 
                          icon={<Subscriptions />} 
                          label="Subscription Status" 
                          value={selectedBrand.subscription.has_active_subscription ? 'Active' : 'Inactive'} 
                        />
                        <InfoRow 
                          icon={<Star />} 
                          label="Current Plan" 
                          value={selectedBrand.subscription.current_plan || 'Free'} 
                        />
                        <InfoRow 
                          icon={<Work />} 
                          label="Trial Status" 
                          value={selectedBrand.subscription.is_trial_active ? 'Active Trial' : 'No Trial'} 
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        {selectedBrand.subscription.details && (
                          <>
                            <InfoRow 
                              icon={<CalendarToday />} 
                              label="Period Start" 
                              value={formatDateTime(selectedBrand.subscription.details.current_period_start)} 
                            />
                            <InfoRow 
                              icon={<CalendarToday />} 
                              label="Period End" 
                              value={formatDateTime(selectedBrand.subscription.details.current_period_end)} 
                            />
                            <InfoRow 
                              icon={<AttachMoney />} 
                              label="Billing Cycle" 
                              value={selectedBrand.subscription.details.plan || 'N/A'} 
                            />
                          </>
                        )}
                      </Grid>
                    </Grid>

                    {/* Subscription History */}
                    {brandDetails?.subscription_history && brandDetails.subscription_history.length > 0 && (
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
                              {brandDetails.subscription_history.slice(0, 5).map((sub, index) => (
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
                    <Subscriptions sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
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
          {selectedBrand && (
            <Button 
              onClick={() => updateUserStatus(selectedBrand._id, selectedBrand.status === 'active' ? 'suspended' : 'active')}
              color={selectedBrand.status === 'active' ? 'warning' : 'success'}
              variant="outlined"
              sx={{ borderRadius: 2 }}
            >
              {selectedBrand.status === 'active' ? 'Suspend Brand' : 'Activate Brand'}
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
            Are you sure you want to permanently remove this brand? This action cannot be undone and will delete all associated data including campaigns, posts, and profile information.
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
            Delete Brand
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