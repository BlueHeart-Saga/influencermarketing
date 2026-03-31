// src/components/CampaignManagement/CampaignManagement.js
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  MenuItem, Grid, Card, CardContent,
  IconButton, Tooltip, Alert, Snackbar, CircularProgress,
  FormControl, InputLabel, Avatar, Select, useTheme,
  alpha, TextField, Tabs, Tab,
  List, ListItem, ListItemText, ListItemIcon,
  InputAdornment, Pagination, AppBar,
  FormGroup, FormControlLabel, Switch,
  LinearProgress, Badge, CardMedia, Divider
} from '@mui/material';
import {
  Visibility, Edit, Delete, Refresh, TrendingUp,
  Pause, PlayArrow, CheckCircle, Search,
  Download, Campaign, Business, MonetizationOn,
  CalendarToday, Email, Group, Analytics, Security,
  Notifications, Flag, BarChart, PieChart, Timeline,
  People, Assignment, AttachMoney, Dashboard,
  AdminPanelSettings, Receipt, Store, Work,
  Category, DonutLarge, Person, Photo,
  Instagram, YouTube, LinkedIn, Twitter, Language,
  LocationOn, Phone, Web, Star, ThumbUp,
  ThumbDown, Comment, Send, Schedule
} from '@mui/icons-material';
import { FaTiktok } from 'react-icons/fa';

import { campaignAPI, userAPI, formatCurrency, isAdmin } from '../../services/api';
import profileAPI from '../../services/profileAPI';

// Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// Enhanced Profile Avatar with Image Loading
const ProfileAvatar = ({ userId, profileType, size = 40, profileData = null }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(profileData);

  useEffect(() => {
    const loadProfileData = async () => {
      if (profileData) {
        setProfile(profileData);
        return;
      }

      if (!userId) return;

      try {
        setLoading(true);
        const response = await profileAPI.getProfileById(userId);
        if (response?.profile) {
          setProfile(response.profile);
        }
      } catch (error) {
        console.error('Error loading profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [userId, profileData]);

  useEffect(() => {
    const loadImage = async () => {
      if (!profile) return;

      try {
        const imageId = profileType === 'brand' ? profile.logo : profile.profile_picture;
        if (imageId) {
          // Use your actual image URL construction
          const url = `${process.env.REACT_APP_API_URL}/profiles/image/${imageId}`;
          setImageUrl(url);
        }
      } catch (error) {
        console.error('Error loading profile image:', error);
      }
    };

    loadImage();
  }, [profile, profileType]);

  const getDisplayName = () => {
    if (!profile) return 'Loading...';
    return profileType === 'brand' 
      ? profile.company_name || profile.contact_person_name || 'Unknown Brand'
      : profile.nickname || profile.full_name || 'Unknown User';
  };

  const getInitials = () => {
    const name = getDisplayName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  if (loading) {
    return (
      <Avatar 
        sx={{ 
          width: size, 
          height: size,
          bgcolor: 'grey.300'
        }}
      >
        <CircularProgress size={size * 0.5} />
      </Avatar>
    );
  }

  return (
    <Avatar 
      sx={{ 
        width: size, 
        height: size,
        bgcolor: imageUrl ? 'transparent' : 'primary.main',
        fontSize: size * 0.4,
        fontWeight: 600
      }}
      src={imageUrl}
      alt={getDisplayName()}
    >
      {!imageUrl && getInitials()}
    </Avatar>
  );
};

// User Info Component
const UserInfo = ({ userId, profileType, showStats = false, size = 40 }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const response = await profileAPI.getProfileById(userId);
        if (response?.profile) {
          setProfile(response.profile);
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId]);

  const getPlatformIcon = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'instagram': return <Instagram sx={{ fontSize: 16 }} />;
      case 'youtube': return <YouTube sx={{ fontSize: 16 }} />;
      case 'tiktok': return <FaTiktok size={14} />;
      case 'linkedin': return <LinkedIn sx={{ fontSize: 16 }} />;
      case 'twitter': return <Twitter sx={{ fontSize: 16 }} />;
      default: return <Language sx={{ fontSize: 16 }} />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" alignItems="center" gap={1}>
        <CircularProgress size={20} />
        <Typography variant="body2">Loading...</Typography>
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box display="flex" alignItems="center" gap={1}>
        <Person />
        <Typography variant="body2">User not found</Typography>
      </Box>
    );
  }

  return (
    <Box display="flex" alignItems="center" gap={1.5}>
      <ProfileAvatar 
        userId={userId} 
        profileType={profileType} 
        size={size}
        profileData={profile}
      />
      <Box>
        <Typography variant="subtitle2" fontWeight="600">
          {profileType === 'brand' 
            ? profile.company_name || profile.contact_person_name
            : profile.nickname || profile.full_name
          }
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          {profile.email}
        </Typography>
        {showStats && profileType === 'influencer' && (
          <Box display="flex" alignItems="center" gap={1} mt={0.5}>
            {profile.primary_platform && getPlatformIcon(profile.primary_platform)}
            <Typography variant="caption" color="text.secondary">
              {profile.followers ? `${(profile.followers / 1000).toFixed(1)}K` : '0'} followers
            </Typography>
            {profile.engagement_rate && (
              <Typography variant="caption" color="success.main" fontWeight="600">
                {profile.engagement_rate}% engagement
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

// Enhanced StatCard Component
const StatCard = ({ title, value, subtitle, color, icon, trend, onClick }) => {
  const theme = useTheme();
  return (
    <Card 
      elevation={2} 
      sx={{ 
        borderRadius: 3,
        background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.1)} 0%, ${alpha(theme.palette[color].main, 0.05)} 100%)`,
        border: `1px solid ${alpha(theme.palette[color].main, 0.2)}`,
        transition: 'all 0.3s ease',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8]
        }
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between">
          <Box flex={1}>
            <Typography 
              color="textSecondary" 
              gutterBottom 
              variant="overline"
              fontWeight="600"
              fontSize="0.7rem"
            >
              {title}
            </Typography>
            <Typography 
              variant="h4" 
              color={`${color}.main`}
              fontWeight="700"
              gutterBottom
            >
              {value}
            </Typography>
            {subtitle && (
              <Typography 
                variant="body2" 
                color="textSecondary"
                sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
              >
                {subtitle}
                {trend && (
                  <Typography 
                    variant="caption" 
                    color={trend > 0 ? 'success.main' : 'error.main'}
                    fontWeight="600"
                  >
                    {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
                  </Typography>
                )}
              </Typography>
            )}
          </Box>
          <Avatar 
            sx={{ 
              bgcolor: alpha(theme.palette[color].main, 0.1),
              color: `${color}.main`,
              width: 56, 
              height: 56 
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

// Status Chip Component
const StatusChip = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'success';
      case 'paused': return 'warning';
      case 'completed': return 'primary';
      case 'pending': return 'info';
      case 'archived': return 'default';
      case 'draft': return 'secondary';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'contracted': return 'secondary';
      case 'media_submitted': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return <PlayArrow fontSize="small" />;
      case 'paused': return <Pause fontSize="small" />;
      case 'completed': return <CheckCircle fontSize="small" />;
      case 'pending': return <Schedule fontSize="small" />;
      case 'archived': return <Delete fontSize="small" />;
      case 'draft': return <Edit fontSize="small" />;
      case 'approved': return <ThumbUp fontSize="small" />;
      case 'rejected': return <ThumbDown fontSize="small" />;
      case 'contracted': return <Send fontSize="small" />;
      case 'media_submitted': return <Photo fontSize="small" />;
      default: return null;
    }
  };

  return (
    <Chip 
      icon={getStatusIcon(status)}
      label={status ? status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ') : 'Unknown'} 
      color={getStatusColor(status)}
      size="small"
      variant="outlined"
      sx={{ 
        fontWeight: 500,
        borderRadius: 1,
        textTransform: 'capitalize'
      }}
    />
  );
};

// Application Detail Component
const ApplicationDetail = ({ application, campaign }) => {
  const [influencerProfile, setInfluencerProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInfluencerProfile = async () => {
      if (!application?.influencer_id) return;

      try {
        setLoading(true);
        const response = await profileAPI.getProfileById(application.influencer_id);
        if (response?.profile) {
          setInfluencerProfile(response.profile);
        }
      } catch (error) {
        console.error('Error loading influencer profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInfluencerProfile();
  }, [application]);

  const getPlatformStats = (profile) => {
    if (!profile) return null;

    return (
      <Box display="flex" flexWrap="wrap" gap={2} mt={1}>
        {profile.primary_platform && (
          <Chip 
            icon={<Instagram />}
            label={profile.primary_platform}
            size="small"
            variant="outlined"
          />
        )}
        {profile.followers && (
          <Typography variant="body2">
            <strong>Followers:</strong> {profile.followers.toLocaleString()}
          </Typography>
        )}
        {profile.engagement_rate && (
          <Typography variant="body2">
            <strong>Engagement:</strong> {profile.engagement_rate}%
          </Typography>
        )}
      </Box>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={2}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
        <UserInfo 
          userId={application.influencer_id} 
          profileType="influencer"
          showStats={true}
          size={48}
        />
        <StatusChip status={application.status} />
      </Box>

      {application.message && (
        <Box mb={2}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary">
            APPLICATION MESSAGE:
          </Typography>
          <Typography variant="body2" sx={{ fontStyle: 'italic', p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
            "{application.message}"
          </Typography>
        </Box>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            <strong>Applied:</strong> {new Date(application.applied_at).toLocaleDateString()}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            <strong>Email:</strong> {application.influencer_email || 'N/A'}
          </Typography>
        </Grid>
      </Grid>

      {influencerProfile && (
        <Box mt={2}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary">
            INFLUENCER DETAILS:
          </Typography>
          {getPlatformStats(influencerProfile)}
          {influencerProfile.bio && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              {influencerProfile.bio}
            </Typography>
          )}
        </Box>
      )}
    </Paper>
  );
};

// Campaign Management Main Component
const CampaignManagement = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [campaigns, setCampaigns] = useState([]);
  const [users, setUsers] = useState([]);
  const [userProfiles, setUserProfiles] = useState({});
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  
  const [platformStats, setPlatformStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalUsers: 0,
    totalApplications: 0,
    platformRevenue: 0,
    pendingApprovals: 0,
    brandUsers: 0,
    influencerUsers: 0,
    totalBudget: 0
  });

  // Enhanced campaign state for editing
  const [editCampaign, setEditCampaign] = useState({
    title: '',
    description: '',
    budget: '',
    category: '',
    deadline: '',
    requirements: '',
    status: '',
    brand_id: '',
    brand_name: ''
  });

  // Analytics data
  const [analytics, setAnalytics] = useState({
    campaignStatusData: [],
    userRoleData: [],
    applicationStatusData: [],
    performanceData: [],
    realTimeActivities: [],
    monthlyData: [],
    categoryDistribution: []
  });

  // Check admin permissions
  useEffect(() => {
    if (!isAdmin()) {
      setError('Access denied. Admin privileges required.');
      return;
    }
  }, []);

  // Fetch all data
  const fetchAllData = async () => {
    if (!isAdmin()) return;
    
    try {
      setLoading(true);
      await Promise.all([
        fetchCampaigns(),
        fetchUsers(),
        fetchUserProfiles(),
        fetchApplications(),
        fetchAnalytics()
      ]);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const response = await campaignAPI.getAllCampaigns();
      console.log('Campaigns API response:', response);
      
      if (response && response.data) {
        setCampaigns(Array.isArray(response.data) ? response.data : []);
      } else {
        setCampaigns([]);
        console.warn('Unexpected campaigns response structure:', response);
      }
    } catch (err) {
      setError('Failed to fetch campaigns');
      console.error('Error fetching campaigns:', err);
      setCampaigns([]);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getAllUsers();
      console.log('Users API response:', response);
      
      if (response && response.data) {
        setUsers(Array.isArray(response.data) ? response.data : []);
      } else {
        setUsers([]);
        console.warn('Unexpected users response structure:', response);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setUsers([]);
    }
  };

    const fetchUserProfiles = async () => {
  try {
    const response = await profileAPI.getAllProfilesAdmin();
    const profiles = response.data || response;  // ✅ handles both cases

    console.log("✅ profiles:", profiles);

    if (!Array.isArray(profiles)) {
      console.error("Expected array but got:", profiles);
      return;
    }

    const profilesMap = {};
    profiles.forEach((profile) => {
      profilesMap[profile._id || profile.id] = profile;
    });

    setUserProfiles(profilesMap);
  } catch (err) {
    console.error("❌ Error fetching user profiles:", err);
  }
};


  const fetchApplications = async () => {
    try {
      // Aggregate applications from all campaigns
      const allApplications = [];
      campaigns.forEach(campaign => {
        if (campaign.applications && Array.isArray(campaign.applications)) {
          campaign.applications.forEach(app => {
            allApplications.push({
              ...app,
              campaign_title: campaign.title,
              campaign_id: campaign._id,
              campaign_budget: campaign.budget,
              campaign_currency: campaign.currency,
              brand_id: campaign.brand_id,
              brand_name: campaign.brand_name || campaign.brand?.company_name
            });
          });
        }
      });
      setApplications(allApplications);
    } catch (err) {
      console.error('Error processing applications:', err);
      setApplications([]);
    }
  };

  const fetchAnalytics = () => {
    // Calculate analytics from current data
    const campaignStatusData = [
      { name: "Active", value: campaigns.filter(c => c.status === "active").length, color: "#00C49F" },
      { name: "Pending", value: campaigns.filter(c => c.status === "pending").length, color: "#FFBB28" },
      { name: "Completed", value: campaigns.filter(c => c.status === "completed").length, color: "#FF8042" },
      { name: "Draft", value: campaigns.filter(c => c.status === "draft").length, color: "#8884d8" },
    ];

    const userRoleData = [
      { name: "Brands", value: users.filter(u => u.role === "brand").length, color: "#2196F3" },
      { name: "Influencers", value: users.filter(u => u.role === "influencer").length, color: "#9C27B0" },
      { name: "Admins", value: users.filter(u => u.role === "admin").length, color: "#4CAF50" },
    ];

    const applicationStatusData = [
      { name: "Approved", value: applications.filter(a => a.status === "approved").length, color: "#00C49F" },
      { name: "Pending", value: applications.filter(a => a.status === "pending").length, color: "#FFBB28" },
      { name: "Rejected", value: applications.filter(a => a.status === "rejected").length, color: "#FF8042" },
      { name: "Contracted", value: applications.filter(a => a.status === "contracted").length, color: "#2196F3" },
    ];

    const performanceData = campaigns
      .sort((a, b) => (b.budget || 0) - (a.budget || 0))
      .slice(0, 6)
      .map(campaign => ({
        name: campaign.title?.substring(0, 12) + (campaign.title?.length > 12 ? "..." : ""),
        applications: campaign.applications?.length || 0,
        budget: campaign.budget || 0,
        currency: campaign.currency || 'USD'
      }));

    const realTimeActivities = [
      { 
        message: `New campaign: ${campaigns[0]?.title || 'Loading...'}`, 
        time: "2 hours ago", 
        status: 'New', 
        color: theme.palette.primary.main,
        icon: <Campaign />
      },
      { 
        message: "Platform updated to v2.1.0", 
        time: "1 hour ago", 
        status: 'Update', 
        color: theme.palette.info.main,
        icon: <CheckCircle />
      }
    ];

    setAnalytics({
      campaignStatusData,
      userRoleData,
      applicationStatusData,
      performanceData,
      realTimeActivities,
      monthlyData: [],
      categoryDistribution: []
    });

    // Calculate platform stats
    calculatePlatformStats();
  };

  const calculatePlatformStats = () => {
    const totalCampaigns = campaigns.length;
    const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
    const totalUsers = users.length;
    const totalApplications = applications.length;
    const totalBudget = campaigns.reduce((sum, c) => sum + (c.budget || 0), 0);
    const platformRevenue = totalBudget * 0.1; // 10% platform fee
    const pendingApprovals = applications.filter(a => a.status === 'pending').length;
    const brandUsers = users.filter(u => u.role === 'brand').length;
    const influencerUsers = users.filter(u => u.role === 'influencer').length;

    setPlatformStats({
      totalCampaigns,
      activeCampaigns,
      totalUsers,
      totalApplications,
      platformRevenue,
      pendingApprovals,
      brandUsers,
      influencerUsers,
      totalBudget
    });
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (campaigns.length > 0 || users.length > 0) {
      fetchApplications();
      calculatePlatformStats();
    }
  }, [campaigns, users]);

  // Filter and paginate campaigns
  const filteredCampaigns = useMemo(() => {
    let filtered = campaigns;
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(c => c.status === filterStatus);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.title?.toLowerCase().includes(term) ||
        c.brand_name?.toLowerCase().includes(term) ||
        c.brand?.company_name?.toLowerCase().includes(term) ||
        c.category?.toLowerCase().includes(term) ||
        c.description?.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  }, [campaigns, filterStatus, searchTerm]);

  const paginatedCampaigns = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredCampaigns.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredCampaigns, currentPage, rowsPerPage]);

  // Get brand profile information
  const getBrandProfile = (campaign) => {
    const brandId = campaign.brand_id || campaign.brand?._id;
    if (!brandId) return null;
    
    return userProfiles[brandId]?.profile || campaign.brand_profile || campaign.brand;
  };

  const getBrandName = (campaign) => {
    const profile = getBrandProfile(campaign);
    return profile?.company_name || campaign.brand_name || 'Unknown Brand';
  };

  const getBrandEmail = (campaign) => {
    const profile = getBrandProfile(campaign);
    return profile?.email || campaign.brand_email || 'No email available';
  };

  const getBrandContact = (campaign) => {
    const profile = getBrandProfile(campaign);
    return profile?.contact_person_name || 'Unknown Contact';
  };

  // Campaign handlers
  const handleViewCampaign = async (campaign) => {
    try {
      // Fetch detailed campaign data
      const response = await campaignAPI.getCampaignDetail(campaign._id);
      setSelectedCampaign(response.data || campaign);
      setViewDialogOpen(true);
    } catch (err) {
      console.error('Error fetching campaign details:', err);
      setSelectedCampaign(campaign);
      setViewDialogOpen(true);
    }
  };

  const handleEditCampaign = (campaign) => {
    setEditCampaign({
      title: campaign.title || '',
      description: campaign.description || '',
      budget: campaign.budget || '',
      category: campaign.category || '',
      deadline: campaign.deadline ? new Date(campaign.deadline).toISOString().split('T')[0] : '',
      requirements: campaign.requirements || '',
      status: campaign.status || '',
      brand_id: campaign.brand_id || '',
      brand_name: campaign.brand_name || campaign.brand?.company_name || ''
    });
    setSelectedCampaign(campaign);
    setEditDialogOpen(true);
  };

  const handleStatusUpdate = (campaign) => {
    setSelectedCampaign(campaign);
    setStatusUpdate(campaign.status);
    setStatusDialogOpen(true);
  };

  const updateCampaignStatus = async () => {
    if (!selectedCampaign || statusUpdate === selectedCampaign.status) {
      setSuccess('No changes to update');
      setStatusDialogOpen(false);
      return;
    }

    try {
      await campaignAPI.updateCampaignStatus(selectedCampaign._id, { status: statusUpdate });
      
      setCampaigns(campaigns.map(camp => 
        camp._id === selectedCampaign._id 
          ? {...camp, status: statusUpdate} 
          : camp
      ));
      
      setSuccess('Campaign status updated successfully');
      setStatusDialogOpen(false);
    } catch (err) {
      setError('Failed to update campaign status');
      console.error('Error updating campaign status:', err);
    }
  };

  const updateCampaignDetails = async () => {
    if (!selectedCampaign) return;

    try {
      const formData = new FormData();
      Object.keys(editCampaign).forEach(key => {
        if (editCampaign[key] !== undefined && editCampaign[key] !== null) {
          formData.append(key, editCampaign[key]);
        }
      });

      await campaignAPI.updateCampaign(selectedCampaign._id, formData);
      
      setCampaigns(campaigns.map(camp => 
        camp._id === selectedCampaign._id 
          ? {...camp, ...editCampaign} 
          : camp
      ));
      
      setSuccess('Campaign updated successfully');
      setEditDialogOpen(false);
    } catch (err) {
      setError('Failed to update campaign');
      console.error('Error updating campaign:', err);
    }
  };

  const deleteCampaign = async (campaignId) => {
    if (!window.confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) return;
    
    try {
      await campaignAPI.deleteCampaign(campaignId);
      setCampaigns(campaigns.filter(camp => camp._id !== campaignId));
      setSuccess('Campaign deleted successfully');
    } catch (err) {
      setError('Failed to delete campaign');
      console.error('Error deleting campaign:', err);
    }
  };

  const exportData = (type) => {
    let csvContent = '';
    let filename = '';

    if (type === 'campaigns') {
      const headers = ['Title', 'Brand', 'Category', 'Budget', 'Status', 'Applications', 'Deadline', 'Created Date'];
      const rows = campaigns.map(camp => [
        `"${camp.title}"`,
        `"${getBrandName(camp)}"`,
        `"${camp.category}"`,
        camp.budget,
        camp.status,
        camp.applications?.length || 0,
        new Date(camp.deadline).toLocaleDateString(),
        new Date(camp.created_at).toLocaleDateString()
      ]);

      csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
      filename = `campaigns-${new Date().toISOString().split('T')[0]}.csv`;
    }
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
    
    setSuccess(`${type === 'campaigns' ? 'Campaigns' : 'Users'} exported successfully`);
  };

  const handleCloseSnackbar = () => {
    setError('');
    setSuccess('');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Enhanced User Profile Detail Component
  const UserProfileDetail = ({ profile, profileType }) => {
    if (!profile) return null;

    return (
      <Box>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <ProfileAvatar 
            profileData={profile} 
            profileType={profileType} 
            size={80}
          />
          <Box>
            <Typography variant="h6" fontWeight="700">
              {profileType === 'brand' 
                ? profile.company_name 
                : profile.nickname || profile.full_name
              }
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {profile.email}
            </Typography>
            {profile.location && (
              <Typography variant="body2" color="text.secondary">
                <LocationOn sx={{ fontSize: 16, mr: 0.5 }} />
                {profile.location}
              </Typography>
            )}
          </Box>
        </Box>

        <Grid container spacing={2}>
          {profileType === 'brand' ? (
            <>
              {profile.contact_person_name && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2"><strong>Contact Person:</strong></Typography>
                  <Typography variant="body2">{profile.contact_person_name}</Typography>
                </Grid>
              )}
              {profile.phone && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2"><strong>Phone:</strong></Typography>
                  <Typography variant="body2">{profile.phone}</Typography>
                </Grid>
              )}
              {profile.website && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2"><strong>Website:</strong></Typography>
                  <Typography variant="body2">{profile.website}</Typography>
                </Grid>
              )}
              {profile.industry && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2"><strong>Industry:</strong></Typography>
                  <Typography variant="body2">{profile.industry}</Typography>
                </Grid>
              )}
            </>
          ) : (
            <>
              {profile.full_name && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2"><strong>Full Name:</strong></Typography>
                  <Typography variant="body2">{profile.full_name}</Typography>
                </Grid>
              )}
              {profile.primary_platform && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2"><strong>Primary Platform:</strong></Typography>
                  <Typography variant="body2">{profile.primary_platform}</Typography>
                </Grid>
              )}
              {profile.followers && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2"><strong>Followers:</strong></Typography>
                  <Typography variant="body2">{profile.followers.toLocaleString()}</Typography>
                </Grid>
              )}
              {profile.engagement_rate && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2"><strong>Engagement Rate:</strong></Typography>
                  <Typography variant="body2">{profile.engagement_rate}%</Typography>
                </Grid>
              )}
            </>
          )}

          {profile.bio && (
            <Grid item xs={12}>
              <Typography variant="body2"><strong>Bio:</strong></Typography>
              <Typography variant="body2">{profile.bio}</Typography>
            </Grid>
          )}

          {profile.categories && profile.categories.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="body2"><strong>Categories:</strong></Typography>
              <Box display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
                {profile.categories.map((cat, idx) => (
                  <Chip key={idx} label={cat} size="small" variant="outlined" />
                ))}
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>
    );
  };

  if (!isAdmin()) {
    return (
      <Box sx={{ 
        display: "flex", 
        flexDirection: "column", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "60vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        p: 3
      }}>
        <Alert severity="error" sx={{ width: '100%', maxWidth: 500, borderRadius: 3 }}>
          <Typography variant="h6" gutterBottom>
            Access Denied
          </Typography>
          <Typography>
            You need administrator privileges to access this page.
          </Typography>
        </Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ 
        display: "flex", 
        flexDirection: "column", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "60vh",
        
      }}>
        <CircularProgress 
          size={60} 
          thickness={4}
          sx={{ 
            mb: 3,
            color: theme.palette.primary.main,
          }} 
        />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Loading Campaign Management Dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      p: { xs: 1, sm: 2, md: 3 }
    }}>
      {/* Header */}
      <Box sx={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: { xs: "flex-start", sm: "center" },
        flexDirection: { xs: "column", sm: "row" },
        mb: 4,
        gap: 2
      }}>
        <Box>
          <Typography variant="h3" sx={{ 
            fontWeight: 800, 
            background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 1,
            fontSize: { xs: '2rem', md: '3rem' }
          }}>
            Campaign Management
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            Complete platform overview and administration • Real-time analytics
          </Typography>
        </Box>
        
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: 'wrap' }}>
          <Button 
            variant="outlined" 
            startIcon={<Download />}
            onClick={() => exportData('campaigns')}
            sx={{ borderRadius: 2 }}
          >
            Export Campaigns
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<Refresh />}
            onClick={fetchAllData}
            sx={{ borderRadius: 2 }}
          >
            Refresh All
          </Button>
        </Box>
      </Box>

      {/* Summary Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard 
            title="TOTAL CAMPAIGNS" 
            value={platformStats.totalCampaigns} 
            subtitle={`${platformStats.activeCampaigns} active`}
            color="primary" 
            icon={<Campaign />}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard 
            title="PLATFORM USERS" 
            value={platformStats.totalUsers} 
            subtitle={`${platformStats.brandUsers} brands, ${platformStats.influencerUsers} influencers`}
            color="success" 
            icon={<Group />}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard 
            title="PLATFORM REVENUE" 
            value={formatCurrency(platformStats.platformRevenue)} 
            subtitle="10% platform fee"
            color="warning" 
            icon={<MonetizationOn />}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard 
            title="PENDING ACTIONS" 
            value={platformStats.pendingApprovals} 
            subtitle="Applications requiring review"
            color="info" 
            icon={<Notifications />}
          />
        </Grid>
      </Grid>

      {/* Main Content with Tabs */}
      <Card sx={{ borderRadius: 3 }}>
        <AppBar position="static" color="default" elevation={0}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{
              '& .MuiTab-root': {
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '0.875rem',
                minHeight: '60px'
              }
            }}
          >
            <Tab icon={<Dashboard />} label="Platform Overview" />
            <Tab icon={<Campaign />} label="Campaign Management" />
            <Tab icon={<Person />} label="User Profiles" />
            <Tab icon={<Assignment />} label="Applications" />
          </Tabs>
        </AppBar>

        {/* Tab 1: Platform Overview */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* Quick Stats */}
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight="700">
                  Platform Overview
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Business color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Brand Users" 
                      secondary={platformStats.brandUsers}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Person color="secondary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Influencer Users" 
                      secondary={platformStats.influencerUsers}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Campaign color="warning" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Active Campaigns" 
                      secondary={platformStats.activeCampaigns}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Assignment color="info" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Total Applications" 
                      secondary={platformStats.totalApplications}
                    />
                  </ListItem>
                </List>
              </Card>
            </Grid>

            {/* Recent Activity */}
            <Grid item xs={12} md={8}>
              <Card sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight="700">
                  Recent Platform Activity
                </Typography>
                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {campaigns.slice(0, 5).map((campaign, index) => (
                    <Box key={index} sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2, 
                      p: 2, 
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      '&:last-child': { borderBottom: 'none' }
                    }}>
                      <ProfileAvatar 
                        userId={campaign.brand_id} 
                        profileType="brand" 
                        size={40}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight="600">
                          New campaign: {campaign.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Created {formatDate(campaign.created_at)}
                        </Typography>
                      </Box>
                      <StatusChip status={campaign.status} />
                    </Box>
                  ))}
                </Box>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 2: Campaign Management */}
        <TabPanel value={tabValue} index={1}>
          {/* Campaign Toolbar */}
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search campaigns, brands, categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ borderRadius: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Box display="flex" gap={2} alignItems="center">
                  <FormControl sx={{ minWidth: 150 }} size="small">
                    <InputLabel>Status Filter</InputLabel>
                    <Select
                      value={filterStatus}
                      label="Status Filter"
                      onChange={(e) => setFilterStatus(e.target.value)}
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="all">All Statuses</MenuItem>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="paused">Paused</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="archived">Archived</MenuItem>
                      <MenuItem value="draft">Draft</MenuItem>
                    </Select>
                  </FormControl>
                  <Chip 
                    label={`${filteredCampaigns.length} campaigns`}
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Campaigns Table */}
          {error ? (
            <Alert 
              severity="error" 
              action={
                <Button onClick={fetchCampaigns} color="inherit" size="small">
                  Retry
                </Button>
              }
            >
              {error}
            </Alert>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: '600' }}>Campaign</TableCell>
                      <TableCell sx={{ fontWeight: '600' }}>Brand</TableCell>
                      <TableCell sx={{ fontWeight: '600' }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: '600' }}>Budget</TableCell>
                      <TableCell sx={{ fontWeight: '600' }}>Timeline</TableCell>
                      <TableCell sx={{ fontWeight: '600' }}>Applications</TableCell>
                      <TableCell sx={{ fontWeight: '600' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: '600' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedCampaigns.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Search sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h6" color="textSecondary" gutterBottom>
                              No campaigns found
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Try adjusting your search or filters
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedCampaigns.map((campaign) => (
                        <TableRow 
                          key={campaign._id}
                          hover
                          sx={{ 
                            '&:last-child td, &:last-child th': { border: 0 },
                            transition: 'all 0.2s'
                          }}
                        >
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight="600" gutterBottom>
                                {campaign.title}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                Created: {formatDate(campaign.created_at)}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <UserInfo 
                              userId={campaign.brand_id} 
                              profileType="brand"
                              size={32}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={campaign.category} 
                              size="small" 
                              variant="outlined"
                              sx={{ borderRadius: 1 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="600" color="primary">
                              {formatCurrency(campaign.budget, campaign.currency)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight="500">
                                {formatDate(campaign.deadline)}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {campaign.deadline && new Date(campaign.deadline) > new Date() ? 'Active' : 'Expired'}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <Typography 
                                variant="body2" 
                                fontWeight="500"
                                sx={{ 
                                  mr: 1,
                                  color: (campaign.applications?.length || 0) > 0 ? 'primary.main' : 'text.secondary'
                                }}
                              >
                                {campaign.applications?.length || 0}
                              </Typography>
                              {(campaign.applications?.length || 0) > 0 && (
                                <Box 
                                  sx={{ 
                                    width: 8, 
                                    height: 8, 
                                    borderRadius: '50%', 
                                    bgcolor: 'primary.main' 
                                  }} 
                                />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <StatusChip status={campaign.status} />
                          </TableCell>
                          <TableCell>
                            <Box display="flex">
                              <Tooltip title="View Details">
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleViewCampaign(campaign)}
                                  sx={{ 
                                    mr: 1,
                                    '&:hover': { bgcolor: 'primary.light', color: 'primary.contrastText' }
                                  }}
                                >
                                  <Visibility fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit Campaign">
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleEditCampaign(campaign)}
                                  sx={{ 
                                    mr: 1,
                                    '&:hover': { bgcolor: 'info.light', color: 'info.contrastText' }
                                  }}
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Update Status">
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleStatusUpdate(campaign)}
                                  sx={{ 
                                    mr: 1,
                                    '&:hover': { bgcolor: 'warning.light', color: 'warning.contrastText' }
                                  }}
                                >
                                  <Flag fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Campaign">
                                <IconButton 
                                  size="small" 
                                  onClick={() => deleteCampaign(campaign._id)}
                                  sx={{ 
                                    '&:hover': { bgcolor: 'error.light', color: 'error.contrastText' }
                                  }}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              <Box display="flex" justifyContent="center" mt={3}>
                <Pagination 
                  count={Math.ceil(filteredCampaigns.length / rowsPerPage)} 
                  page={currentPage}
                  onChange={(e, page) => setCurrentPage(page)}
                  color="primary"
                />
              </Box>
            </>
          )}
        </TabPanel>

        {/* Tab 3: User Profiles */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                User Profiles ({Object.keys(userProfiles).length})
              </Typography>
            </Grid>
            
            {Object.entries(userProfiles).map(([userId, profileData]) => (
              <Grid item xs={12} sm={6} md={4} key={userId}>
                <Card sx={{ borderRadius: 2, overflow: 'hidden' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <ProfileAvatar 
                        userId={userId} 
                        profileType={profileData.type}
                        size={48}
                      />
                      <Box>
                        <Typography variant="h6">
                          {profileData.profile?.company_name || profileData.profile?.full_name || profileData.profile?.nickname}
                        </Typography>
                        <Chip 
                          label={profileData.type} 
                          size="small" 
                          color={profileData.type === 'brand' ? 'primary' : 'secondary'}
                        />
                      </Box>
                    </Box>
                    
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      {profileData.profile?.email}
                    </Typography>
                    
                    {profileData.profile?.location && (
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        📍 {profileData.profile.location}
                      </Typography>
                    )}
                    
                    {profileData.profile?.categories && profileData.profile.categories.length > 0 && (
                      <Box mt={1}>
                        <Typography variant="caption" color="textSecondary">
                          Categories:
                        </Typography>
                        <Box display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
                          {profileData.profile.categories.slice(0, 3).map((cat, idx) => (
                            <Chip key={idx} label={cat} size="small" variant="outlined" />
                          ))}
                          {profileData.profile.categories.length > 3 && (
                            <Chip label={`+${profileData.profile.categories.length - 3}`} size="small" />
                          )}
                        </Box>
                      </Box>
                    )}

                    <Box mt={2}>
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => {
                          setSelectedCampaign({ brand_id: userId, brand_profile: profileData.profile });
                          setViewDialogOpen(true);
                        }}
                      >
                        View Full Profile
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            
            {Object.keys(userProfiles).length === 0 && (
              <Grid item xs={12}>
                <Box textAlign="center" py={6}>
                  <Person sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="textSecondary">
                    No profiles found
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    User profiles will appear here once created
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        {/* Tab 4: Applications */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                All Applications ({applications.length})
              </Typography>
            </Grid>
            
            {applications.length === 0 ? (
              <Grid item xs={12}>
                <Box textAlign="center" py={6}>
                  <Assignment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="textSecondary">
                    No applications found
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Applications will appear here when influencers apply to campaigns
                  </Typography>
                </Box>
              </Grid>
            ) : (
              applications.map((application, index) => (
                <Grid item xs={12} key={index}>
                  <Card sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            {application.campaign_title}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Budget: {formatCurrency(application.campaign_budget, application.campaign_currency)}
                          </Typography>
                        </Box>
                        <StatusChip status={application.status} />
                      </Box>
                      
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" gutterBottom color="text.secondary">
                            BRAND:
                          </Typography>
                          <UserInfo 
                            userId={application.brand_id} 
                            profileType="brand"
                            size={40}
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" gutterBottom color="text.secondary">
                            INFLUENCER:
                          </Typography>
                          <UserInfo 
                            userId={application.influencer_id} 
                            profileType="influencer"
                            showStats={true}
                            size={40}
                          />
                        </Grid>
                      </Grid>
                      
                      {application.message && (
                        <Box mt={2}>
                          <Typography variant="subtitle2" gutterBottom color="text.secondary">
                            APPLICATION MESSAGE:
                          </Typography>
                          <Typography variant="body2" sx={{ fontStyle: 'italic', p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                            "{application.message}"
                          </Typography>
                        </Box>
                      )}
                      
                      <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" color="textSecondary">
                          Applied: {new Date(application.applied_at).toLocaleDateString()}
                        </Typography>
                        <Button 
                          variant="outlined" 
                          size="small"
                          onClick={() => {
                            const campaign = campaigns.find(c => c._id === application.campaign_id);
                            setSelectedCampaign(campaign);
                            setViewDialogOpen(true);
                          }}
                        >
                          View Campaign Details
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </TabPanel>
      </Card>

      {/* Enhanced Campaign Details Dialog */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={() => setViewDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        scroll="paper"
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main', 
          color: 'primary.contrastText',
          fontWeight: 600
        }}>
          {selectedCampaign ? `Campaign Details: ${selectedCampaign.title}` : 'User Profile Details'}
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {selectedCampaign ? (
            // Campaign Details View
            <Grid container spacing={3}>
              {/* Brand Information */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom fontWeight="600">
                  Brand Information
                </Typography>
                <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <UserProfileDetail 
                    profile={getBrandProfile(selectedCampaign)} 
                    profileType="brand"
                  />
                </Card>
              </Grid>
              
              {/* Campaign Information */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom fontWeight="600">
                  Campaign Information
                </Typography>
                <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2"><strong>Category:</strong></Typography>
                      <Chip label={selectedCampaign.category} size="small" />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2"><strong>Budget:</strong></Typography>
                      <Typography variant="body2" fontWeight="600" color="primary">
                        {formatCurrency(selectedCampaign.budget, selectedCampaign.currency)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2"><strong>Status:</strong></Typography>
                      <StatusChip status={selectedCampaign.status} />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2"><strong>Created:</strong></Typography>
                      <Typography variant="body2">{formatDate(selectedCampaign.created_at)}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2"><strong>Deadline:</strong></Typography>
                      <Typography variant="body2">{formatDate(selectedCampaign.deadline)}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2"><strong>Applications:</strong></Typography>
                      <Typography variant="body2">{selectedCampaign.applications?.length || 0}</Typography>
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
              
              {/* Campaign Description */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom fontWeight="600">
                  Description
                </Typography>
                <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="body2">
                    {selectedCampaign.description || 'No description available'}
                  </Typography>
                </Card>
              </Grid>
              
              {/* Requirements */}
              {selectedCampaign.requirements && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom fontWeight="600">
                    Requirements
                  </Typography>
                  <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="body2">
                      {selectedCampaign.requirements}
                    </Typography>
                  </Card>
                </Grid>
              )}

              {/* Applications */}
              {selectedCampaign.applications && selectedCampaign.applications.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom fontWeight="600">
                    Applications ({selectedCampaign.applications.length})
                  </Typography>
                  <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                    {selectedCampaign.applications.map((app, index) => (
                      <ApplicationDetail 
                        key={index} 
                        application={app} 
                        campaign={selectedCampaign}
                      />
                    ))}
                  </Box>
                </Grid>
              )}
            </Grid>
          ) : (
            // User Profile View
            <UserProfileDetail 
              profile={selectedCampaign?.brand_profile} 
              profileType={selectedCampaign?.brand_profile?.company_name ? 'brand' : 'influencer'}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setViewDialogOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog 
        open={statusDialogOpen} 
        onClose={() => setStatusDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Update Campaign Status
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Campaign: {selectedCampaign?.title}
          </Typography>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusUpdate}
              label="Status"
              onChange={(e) => setStatusUpdate(e.target.value)}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="paused">Paused</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="archived">Archived</MenuItem>
              <MenuItem value="draft">Draft</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setStatusDialogOpen(false)}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={updateCampaignStatus}
            variant="contained"
            sx={{ borderRadius: 2 }}
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Campaign Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Edit Campaign: {selectedCampaign?.title}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Campaign Title"
                value={editCampaign.title}
                onChange={(e) => setEditCampaign({...editCampaign, title: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={editCampaign.description}
                onChange={(e) => setEditCampaign({...editCampaign, description: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Budget"
                type="number"
                value={editCampaign.budget}
                onChange={(e) => setEditCampaign({...editCampaign, budget: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Category"
                value={editCampaign.category}
                onChange={(e) => setEditCampaign({...editCampaign, category: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Deadline"
                type="date"
                value={editCampaign.deadline}
                onChange={(e) => setEditCampaign({...editCampaign, deadline: e.target.value})}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={editCampaign.status}
                  label="Status"
                  onChange={(e) => setEditCampaign({...editCampaign, status: e.target.value})}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="paused">Paused</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="archived">Archived</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Requirements"
                value={editCampaign.requirements}
                onChange={(e) => setEditCampaign({...editCampaign, requirements: e.target.value})}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setEditDialogOpen(false)}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={updateCampaignDetails}
            variant="contained"
            sx={{ borderRadius: 2 }}
          >
            Save Changes
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
};

export default CampaignManagement;