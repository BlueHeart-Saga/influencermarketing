// src/pages/admin/UsersManagement.jsx
import React, { useState, useEffect, useContext, useCallback, useMemo } from "react";
import { AuthContext } from "../../context/AuthContext";
import API_BASE_URL from "../../config/api";
import {
  Box, Tabs, Tab, TextField, Button, Card, CardContent,
  Typography, IconButton, Chip, Avatar, Dialog, DialogTitle,
  DialogContent, DialogActions, CircularProgress,
  Alert, Snackbar, useTheme, alpha, InputAdornment,
  Grid, Divider, Badge, Switch, FormControlLabel,
  Menu, MenuItem, ListItemIcon, ListItemText,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, Paper, Tooltip, Fab,
  Select, FormControl, InputLabel, OutlinedInput,
  Accordion, AccordionSummary, AccordionDetails
} from "@mui/material";
import {
  Refresh, Search, Delete, Visibility, Block, CheckCircle,
  Person, Business, Group, Email, Phone, Language,
  LocationOn, CalendarToday, Flag, Warning,
  AccountCircle, Work, Category, People,
  MoreVert, Edit, Security, Download,
  Add, FilterList, Sort, TrendingUp,
  ThumbUp, Comment, Visibility as ViewsIcon,
  PostAdd, Link, Instagram, YouTube,
  Facebook, LinkedIn, Twitter, TikTok,
  ExpandMore,  Payment,
  Star, StarBorder, Schedule, Login
} from "@mui/icons-material";
import SubscriptionsIcon from "@mui/icons-material/Subscriptions";


// TabPanel component for accessibility
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-tabpanel-${index}`}
      aria-labelledby={`user-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

// Helper function to get image URL
const getImageUrl = (fileId) => {
  if (!fileId) return null;
  return `${API_BASE_URL}/profiles/image/${fileId}`;
};

// Social Platform Icon Component
const SocialIcon = ({ platform, sx = {} }) => {
  const icons = {
    instagram: <Instagram sx={sx} />,
    youtube: <YouTube sx={sx} />,
    linkedin: <LinkedIn sx={sx} />,
    facebook: <Facebook sx={sx} />,
    twitter: <Twitter sx={sx} />,
    tiktok: <Twitter sx={sx} /> // Using Twitter as fallback for TikTok
  };
  
  return icons[platform] || <Link sx={sx} />;
};

// Subscription Status Component
const SubscriptionBadge = ({ subscription }) => {
  if (!subscription) return null;

  const getSubscriptionColor = () => {
    switch (subscription.type) {
      case 'trial': return 'warning';
      case 'paid': return 'success';
      case 'free': return 'default';
      default: return 'default';
    }
  };

  const getSubscriptionIcon = () => {
    switch (subscription.type) {
      case 'trial': return <Star />;
      case 'paid': return <SubscriptionsIcon />;
      case 'free': return <StarBorder />;
      default: return <SubscriptionsIcon />;
    }
  };

  return (
    <Tooltip title={
      <Box>
        <div><strong>Plan:</strong> {subscription.plan}</div>
        <div><strong>Status:</strong> {subscription.status}</div>
        {subscription.current_period_end && (
          <div><strong>Expires:</strong> {new Date(subscription.current_period_end).toLocaleDateString()}</div>
        )}
        {subscription.remaining_days > 0 && (
          <div><strong>Days Left:</strong> {subscription.remaining_days}</div>
        )}
      </Box>
    }>
      <Chip
        icon={getSubscriptionIcon()}
        label={`${subscription.type.toUpperCase()}${subscription.remaining_days > 0 ? ` (${subscription.remaining_days}d)` : ''}`}
        color={getSubscriptionColor()}
        variant="filled"
        size="small"
      />
    </Tooltip>
  );
};

// Enhanced UserCard component
const UserCard = ({ 
  user, 
  onView, 
  onEdit,
  onRemove, 
  onToggleStatus, 
  onExport,
  statusLoading,
  viewMode = 'card' // 'card' or 'table'
}) => {
  const theme = useTheme();
  const [menuAnchor, setMenuAnchor] = useState(null);
  
  // Get profile image based on user role
  const getProfileImage = () => {
    if (user.role === 'brand' && user.brand_profile?.logo) {
      return getImageUrl(user.brand_profile.logo);
    }
    if (user.role === 'influencer' && user.influencer_profile?.profile_picture) {
      return getImageUrl(user.influencer_profile.profile_picture);
    }
    return null;
  };

  // Get counts with fallbacks
  const getCounts = () => {
    const activityMetrics = user.activity_metrics || {};
    return {
      postCount: activityMetrics.post_count || user.post_count || 0,
      followersCount: activityMetrics.followers_count || user.followers_count || 0,
      followingCount: activityMetrics.following_count || user.following_count || 0,
    };
  };

  const counts = getCounts();

  // Get display name
  const getDisplayName = () => {
    if (user.role === 'brand' && user.brand_profile?.company_name) {
      return user.brand_profile.company_name;
    }
    if (user.role === 'influencer') {
      return user.influencer_profile?.nickname || user.influencer_profile?.full_name || user.username;
    }
    return user.username;
  };

  // Get user status
  const getUserStatus = () => {
    return user.status === 'suspended' ? 'suspended' : 'active';
  };

  // Get user stats
  const getUserStats = () => {
  const stats = [];
  
  // Use activity_metrics from backend or fallback to direct properties
  const activityMetrics = user.activity_metrics || {};
  const followersCount = activityMetrics.followers_count || user.followers_count || 0;
  const followingCount = activityMetrics.following_count || user.following_count || 0;
  const postCount = activityMetrics.post_count || user.post_count || 0;
  
  if (user.role === 'influencer') {
    stats.push(`Followers: ${followersCount}`);
    stats.push(`Following: ${followingCount}`);
  }
  stats.push(`Posts: ${postCount}`);
  return stats.join(' • ');
};

  const profileImage = getProfileImage();
  const displayName = getDisplayName();
  const userStats = getUserStats();
  const isActive = getUserStatus() === 'active';

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleAction = (action) => {
  handleMenuClose();

  switch (action) {
    case 'view':
      onView?.(user);
      break;

    case 'edit':
      onEdit?.(user);
      break;

    case 'toggleStatus':
      onToggleStatus?.(user?._id, isActive);
      break;

    case 'export':
      onExport?.(user);
      break;

    case 'delete':
      if (window.confirm("Are you sure you want to delete this user?")) {
        onRemove?.(user?._id);
      }
      break;

    default:
      console.warn(`Unknown action: ${action}`);
  }
};


  if (viewMode === 'table') {
    return (
      <TableRow 
        hover 
        sx={{ 
          cursor: 'pointer',
          backgroundColor: !isActive ? alpha(theme.palette.error.light, 0.05) : 'inherit'
        }}
        onClick={() => onView(user)}
      >
        <TableCell>
          <Box display="flex" alignItems="center">
            <Avatar 
              sx={{ 
                mr: 2,
                width: 40,
                height: 40,
                bgcolor: user.role === 'brand' ? 'primary.main' : 'secondary.main',
                ...(profileImage && { bgcolor: 'transparent' })
              }}
              src={profileImage || undefined}
            >
              {!profileImage && (displayName ? displayName.charAt(0).toUpperCase() : user.username?.charAt(0).toUpperCase() || 'U')}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" fontWeight="500">
                {displayName}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {user.email}
              </Typography>
            </Box>
          </Box>
        </TableCell>
        
        <TableCell>
          <Chip 
            label={user.role} 
            size="small" 
            color={user.role === 'brand' ? 'primary' : 'secondary'}
            variant="outlined"
          />
        </TableCell>
        
        <TableCell>
          <Box display="flex" flexDirection="column" gap={0.5}>
            <Chip 
              label={isActive ? "Active" : "Suspended"} 
              size="small" 
              color={isActive ? "success" : "error"}
              variant="filled"
            />
            {user.subscription && (
              <SubscriptionBadge subscription={user.subscription} />
            )}
          </Box>
        </TableCell>
        
        <TableCell>
  <Typography variant="body2">
    {user.activity_metrics?.post_count || user.post_count || 0}
  </Typography>
</TableCell>

<TableCell>
  <Typography variant="body2">
    {user.activity_metrics?.followers_count || user.followers_count || 0}
  </Typography>
</TableCell>
        
        <TableCell>
          <Box>
            <Typography variant="caption" display="block" color="textSecondary">
              Joined: {formatDate(user.created_at)}
            </Typography>
            <Typography variant="caption" display="block" color="textSecondary">
              Last Login: {formatDate(user.last_login) || 'Never'}
            </Typography>
          </Box>
        </TableCell>
        
        <TableCell>
          <IconButton 
            size="small"
            onClick={handleMenuOpen}
          >
            <MoreVert />
          </IconButton>
          
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={handleMenuClose}
            onClick={(e) => e.stopPropagation()}
          >
            <MenuItem onClick={() => handleAction('view')}>
              <ListItemIcon><Visibility fontSize="small" /></ListItemIcon>
              <ListItemText>View Details</ListItemText>
            </MenuItem>
            
            {/* <MenuItem onClick={() => handleAction('edit')}>
              <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
              <ListItemText>Edit User</ListItemText>
            </MenuItem> */}
            
            <MenuItem onClick={() => handleAction('toggleStatus')}>
              <ListItemIcon>
                {isActive ? <Block fontSize="small" /> : <CheckCircle fontSize="small" />}
              </ListItemIcon>
              <ListItemText>
                {isActive ? 'Suspend User' : 'Activate User'}
              </ListItemText>
            </MenuItem>
            
            <MenuItem onClick={() => handleAction('export')}>
              <ListItemIcon><Download fontSize="small" /></ListItemIcon>
              <ListItemText>Export Data</ListItemText>
            </MenuItem>
            
            <Divider />
            
            <MenuItem 
              onClick={() => handleAction('delete')}
              sx={{ color: 'error.main' }}
            >
              <ListItemIcon><Delete fontSize="small" color="error" /></ListItemIcon>
              <ListItemText>Delete User</ListItemText>
            </MenuItem>
          </Menu>
        </TableCell>
      </TableRow>
    );
  }

  // Card View
  return (
    <Card 
      sx={{ 
        mb: 2, 
        borderRadius: 2,
        transition: 'all 0.2s ease',
        border: !isActive ? `2px solid ${theme.palette.error.light}` : '1px solid rgba(0,0,0,0.12)',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4]
        }
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" flex={1}>
            <Avatar 
              sx={{ 
                mr: 2,
                width: 56,
                height: 56,
                bgcolor: user.role === 'brand' ? 'primary.main' : 'secondary.main',
                ...(profileImage && { bgcolor: 'transparent' })
              }}
              src={profileImage || undefined}
            >
              {!profileImage && (displayName ? displayName.charAt(0).toUpperCase() : user.username?.charAt(0).toUpperCase() || 'U')}
            </Avatar>
            
            <Box flex={1}>
              <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                <Typography variant="h6" fontWeight="500" noWrap>
                  {displayName}
                </Typography>
                {user.isVerified && (
                  <Chip 
                    label="Verified" 
                    size="small" 
                    color="success"
                    variant="outlined"
                  />
                )}
              </Box>
              
              <Typography variant="body2" color="textSecondary" noWrap>
                {user.email}
              </Typography>
              
              {userStats && (
                <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                  {userStats}
                </Typography>
              )}
              
              <Box mt={1} display="flex" gap={1} flexWrap="wrap" alignItems="center">
                <Chip 
                  label={user.role} 
                  size="small" 
                  color={user.role === 'brand' ? 'primary' : 'secondary'}
                  variant="outlined"
                />
                {(user.brand_profile?.location || user.influencer_profile?.location) && (
                  <Chip 
                    label={user.brand_profile?.location || user.influencer_profile?.location} 
                    size="small" 
                    variant="outlined"
                    icon={<LocationOn fontSize="small" />}
                  />
                )}
                <Chip 
                  label={isActive ? "Active" : "Suspended"} 
                  size="small" 
                  color={isActive ? "success" : "error"}
                  variant="filled"
                />
                {user.subscription && (
                  <SubscriptionBadge subscription={user.subscription} />
                )}
              </Box>

              {/* Additional Info Row */}
              <Box mt={1} display="flex" gap={2}>
                <Typography variant="caption" color="textSecondary">
                  <CalendarToday sx={{ fontSize: 12, mr: 0.5 }} />
                  Joined: {formatDate(user.created_at)}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  <Login sx={{ fontSize: 12, mr: 0.5 }} />
                  Last: {formatDate(user.last_login) || 'Never'}
                </Typography>
              </Box>
            </Box>
          </Box>
          
          <Box display="flex" alignItems="center" gap={1}>
            <FormControlLabel
              control={
                <Switch
                  checked={isActive}
                  onChange={() => onToggleStatus(user._id, isActive)}
                  color={isActive ? "success" : "error"}
                  disabled={statusLoading[user._id]}
                />
              }
              label={isActive ? "Active" : "Suspended"}
              sx={{ mr: 1 }}
            />
            
            <IconButton 
              onClick={() => onView(user)}
              sx={{ color: 'primary.main' }}
              title="View Details"
            >
              <Visibility />
            </IconButton>
            
            <IconButton 
              onClick={handleMenuOpen}
              sx={{ color: 'text.secondary' }}
              title="More Actions"
            >
              <MoreVert />
            </IconButton>
            
            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => handleAction('edit')}>
                <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
                <ListItemText>Edit User</ListItemText>
              </MenuItem>
              
              <MenuItem onClick={() => handleAction('export')}>
                <ListItemIcon><Download fontSize="small" /></ListItemIcon>
                <ListItemText>Export Data</ListItemText>
              </MenuItem>
              
              <Divider />
              
              <MenuItem 
                onClick={() => handleAction('delete')}
                sx={{ color: 'error.main' }}
              >
                <ListItemIcon><Delete fontSize="small" color="error" /></ListItemIcon>
                <ListItemText>Delete User</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

// Main UsersManagement component
export default function UsersManagement() {
  const { user: adminUser } = useContext(AuthContext);
  const theme = useTheme();
  
  // State management
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [statusLoading, setStatusLoading] = useState({});
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    subscription_type: '',
    dateFrom: '',
    dateTo: ''
  });
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);

  // Fetch Users from Admin API
  const fetchUsers = useCallback(async () => {
  if (!adminUser?.token) return;
  
  try {
    setLoading(true);
    
    const res = await fetch(`${API_BASE_URL}/admin/users`, {
      headers: {
        Authorization: `Bearer ${adminUser.token}`,
      },
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || `Failed to fetch users: ${res.status}`);
    }
    
    const data = await res.json();
    
    // Handle both response formats and transform data
    const usersData = data.users || data;
    const transformedUsers = Array.isArray(usersData) ? usersData.map(user => ({
      ...user,
      // Ensure consistent count properties
      post_count: user.activity_metrics?.post_count || user.post_count || 0,
      followers_count: user.activity_metrics?.followers_count || user.followers_count || 0,
      following_count: user.activity_metrics?.following_count || user.following_count || 0,
    })) : [];
    
    setUsers(transformedUsers);
    setError(null);
  } catch (err) {
    console.error('Error fetching users:', err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
}, [adminUser?.token, filters, search, page, rowsPerPage]);

  // Fetch specific user details
  const fetchUserDetails = useCallback(async (userId) => {
    if (!adminUser?.token) return null;
    
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/complete`, {
        headers: {
          Authorization: `Bearer ${adminUser.token}`,
        },
      });
      
      if (!res.ok) throw new Error("Failed to fetch user details");
      return await res.json();
    } catch (err) {
      console.error('Error fetching user details:', err);
      return null;
    }
  }, [adminUser?.token]);

  // Initial data fetch
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Remove User
  const removeUser = async (userId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${adminUser.token}`,
        },
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to remove user");
      }
      
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      setSuccess("User removed successfully");
      setDeleteDialogOpen(false);
    } catch (err) {
      setError(err.message);
    }
  };

  // Toggle User Status
  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      setStatusLoading(prev => ({ ...prev, [userId]: true }));

      const endpoint = currentStatus
        ? `${API_BASE_URL}/admin/users/${userId}/suspend`
        : `${API_BASE_URL}/admin/users/${userId}/activate`;

      const res = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminUser.token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to update user status");
      }

      // Update local state
      setUsers(prev =>
        prev.map(u =>
          u._id === userId ? { 
            ...u, 
            status: currentStatus ? 'suspended' : 'active' 
          } : u
        )
      );

      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser(prev => ({
          ...prev,
          status: currentStatus ? 'suspended' : 'active'
        }));
      }

      setSuccess(`User ${!currentStatus ? "activated" : "suspended"} successfully`);
    } catch (err) {
      setError(err.message);
    } finally {
      setStatusLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  // Update User Role
  const updateUserRole = async (userId, newRole) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminUser.token}`,
        },
        body: JSON.stringify({ role: newRole })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to update user role");
      }

      setUsers(prev =>
        prev.map(u =>
          u._id === userId ? { ...u, role: newRole } : u
        )
      );

      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser(prev => ({ ...prev, role: newRole }));
      }

      setSuccess(`User role updated to ${newRole}`);
      setEditDialogOpen(false);
    } catch (err) {
      setError(err.message);
    }
  };

  // Export User Data
  const exportUserData = async (userId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/export/data?export_type=users`, {
        headers: {
          Authorization: `Bearer ${adminUser.token}`,
        },
      });
      
      if (!res.ok) throw new Error("Failed to export data");
      
      const data = await res.json();
      
      // Create and download file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-${userId}-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setSuccess("User data exported successfully");
    } catch (err) {
      setError(err.message);
    }
  };

  // Event Handlers
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPage(0);
  };

  const handleViewUser = async (user) => {
    try {
      const userDetails = await fetchUserDetails(user._id);
      setSelectedUser(userDetails || user);
      setViewDialogOpen(true);
    } catch (err) {
      setError("Failed to load user details");
      setSelectedUser(user);
      setViewDialogOpen(true);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (userId) => {
    setUserToDelete(userId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      removeUser(userToDelete);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      role: '',
      status: '',
      subscription_type: '',
      dateFrom: '',
      dateTo: ''
    });
    setSearch('');
    setPage(0);
  };

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    let filtered = users.filter((u) => {
      if (activeTab === 0 && u.role !== "brand") return false;
      if (activeTab === 1 && u.role !== "influencer") return false;
      
      if (filters.status && u.status !== filters.status) return false;
      if (filters.role && u.role !== filters.role) return false;
      
      // Subscription type filter
      if (filters.subscription_type) {
        const subscriptionType = u.subscription?.type;
        if (!subscriptionType || subscriptionType !== filters.subscription_type) return false;
      }
      
      // Date range filter
      if (filters.dateFrom || filters.dateTo) {
        const userDate = new Date(u.created_at);
        if (filters.dateFrom && userDate < new Date(filters.dateFrom)) return false;
        if (filters.dateTo && userDate > new Date(filters.dateTo + 'T23:59:59')) return false;
      }
      
      if (!search) return true;
      
      const searchTerm = search.toLowerCase();
      const searchFields = [
        u.username,
        u.email,
        u.brand_profile?.company_name,
        u.influencer_profile?.full_name,
        u.influencer_profile?.nickname,
        u.brand_profile?.location,
        u.influencer_profile?.location,
        u.brand_profile?.contact_person_name,
        u.influencer_profile?.bio
      ].filter(Boolean).join(" ").toLowerCase();
      
      return searchFields.includes(searchTerm);
    });

    // Sort users
    filtered.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      
      // Handle nested properties
      if (sortConfig.key === 'name') {
        aValue = a.brand_profile?.company_name || a.influencer_profile?.full_name || a.username;
        bValue = b.brand_profile?.company_name || b.influencer_profile?.full_name || b.username;
      }
      if (sortConfig.key === 'subscription') {
        aValue = a.subscription?.type;
        bValue = b.subscription?.type;
      }
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [users, activeTab, filters, search, sortConfig]);

  // Statistics
  const stats = useMemo(() => {
    const brandCount = users.filter(u => u.role === "brand").length;
    const influencerCount = users.filter(u => u.role === "influencer").length;
    const activeCount = users.filter(u => u.status !== 'suspended').length;
    const suspendedCount = users.filter(u => u.status === 'suspended').length;
    
    // Subscription stats
    const trialCount = users.filter(u => u.subscription?.type === 'trial').length;
    const paidCount = users.filter(u => u.subscription?.type === 'paid').length;
    const freeCount = users.filter(u => u.subscription?.type === 'free').length;
    
    const totalCount = users.length;

    return { 
      brandCount, 
      influencerCount, 
      activeCount, 
      suspendedCount, 
      trialCount,
      paidCount,
      freeCount,
      totalCount 
    };
  }, [users]);

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccess(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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

  // Add this helper function in your UsersManagement component
const getUserCounts = (user) => {
  const activityMetrics = user.activity_metrics || {};
  return {
    postCount: activityMetrics.post_count || user.post_count || 0,
    followersCount: activityMetrics.followers_count || user.followers_count || 0,
    followingCount: activityMetrics.following_count || user.following_count || 0,
  };
};

  const getProfileData = (user) => {
    return user.brand_profile || user.influencer_profile || {};
  };

  const getSelectedUserDisplayName = () => {
    if (!selectedUser) return '';
    if (selectedUser.role === 'brand') {
      return selectedUser.brand_profile?.company_name || selectedUser.username;
    }
    return selectedUser.influencer_profile?.full_name || selectedUser.influencer_profile?.nickname || selectedUser.username;
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="600">
          User Management
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={() => exportUserData('all')}
            sx={{ borderRadius: 2 }}
          >
            Export All
          </Button>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={fetchUsers}
            disabled={loading}
            sx={{ borderRadius: 2 }}
          >
            {loading ? <CircularProgress size={20} /> : 'Refresh'}
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={1.7}>
          <StatCard 
            title="Total Users"
            value={stats.totalCount}
            icon={<Group />}
            color="primary"
            subtitle="All platform users"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={1.7}>
          <StatCard 
            title="Brands"
            value={stats.brandCount}
            icon={<Business />}
            color="info"
            subtitle="Business accounts"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={1.7}>
          <StatCard 
            title="Influencers"
            value={stats.influencerCount}
            icon={<Person />}
            color="secondary"
            subtitle="Content creators"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={1.7}>
          <StatCard 
            title="Active"
            value={stats.activeCount}
            icon={<CheckCircle />}
            color="success"
            subtitle="Active users"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={1.7}>
          <StatCard 
            title="Suspended"
            value={stats.suspendedCount}
            icon={<Block />}
            color="error"
            subtitle="Suspended accounts"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={1.7}>
          <StatCard 
            title="Trials"
            value={stats.trialCount}
            icon={<Star />}
            color="warning"
            subtitle="Trial subscriptions"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={1.7}>
          <StatCard 
            title="Paid"
            value={stats.paidCount}
            icon={<SubscriptionsIcon />}
            color="success"
            subtitle="Paid subscriptions"
          />
        </Grid>
      </Grid>

      {/* Search and Filter Section */}
      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item>
  <FormControl size="small" fullWidth sx={{ minWidth: 160 }}>
    <InputLabel>Role</InputLabel>
    <Select
      label="Role"
      value={filters.role}
      onChange={(e) => handleFilterChange("role", e.target.value)}
    >
      <MenuItem value="">All Roles</MenuItem>
      <MenuItem value="brand">Brand</MenuItem>
      <MenuItem value="influencer">Influencer</MenuItem>
      <MenuItem value="admin">Admin</MenuItem>
    </Select>
  </FormControl>
</Grid>

<Grid item>
  <FormControl size="small" fullWidth sx={{ minWidth: 160 }}>
    <InputLabel>Status</InputLabel>
    <Select
      label="Status"
      value={filters.status}
      onChange={(e) => handleFilterChange("status", e.target.value)}
    >
      <MenuItem value="">All Status</MenuItem>
      <MenuItem value="active">Active</MenuItem>
      <MenuItem value="suspended">Suspended</MenuItem>
      <MenuItem value="banned">Banned</MenuItem>
    </Select>
  </FormControl>
</Grid>

<Grid item>
  <FormControl size="small" fullWidth sx={{ minWidth: 160 }}>
    <InputLabel>Subscription</InputLabel>
    <Select
      label="Subscription"
      value={filters.subscription}
      onChange={(e) => handleFilterChange("subscription", e.target.value)}
    >
      <MenuItem value="">All Types</MenuItem>
      <MenuItem value="free">Free</MenuItem>
      <MenuItem value="trial">Trial</MenuItem>
      <MenuItem value="paid">Paid</MenuItem>
    </Select>
  </FormControl>
</Grid>

            
            <Grid item xs={6} md={2}>
              <FormControl size="small" fullWidth sx={{ minWidth: 160 }}>
                <InputLabel>View Mode</InputLabel>
                <Select
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value)}
                  label="View Mode"
                >
                  <MenuItem value="card">Card View</MenuItem>
                  <MenuItem value="table">Table View</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {/* <Grid item xs={12} md={1}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => setAdvancedFiltersOpen(!advancedFiltersOpen)}
                sx={{ height: '56px' }}
              >
                More
              </Button>
            </Grid> */}
          </Grid>

          {/* Advanced Filters */}
          <Accordion 
            expanded={advancedFiltersOpen} 
            onChange={() => setAdvancedFiltersOpen(!advancedFiltersOpen)}
            sx={{ mt: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}
          >
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle1" fontWeight="500">
                Advanced Filters
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="From Date"
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="To Date"
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box display="flex" gap={1}>
                    <Button
                      variant="outlined"
                      onClick={clearAllFilters}
                      sx={{ flex: 1 }}
                    >
                      Clear All Filters
                    </Button>
                    <Button
                      variant="contained"
                      onClick={fetchUsers}
                      sx={{ flex: 1 }}
                    >
                      Apply Filters
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </CardContent>
      </Card>

      {/* Tabs and Content */}
      <Card sx={{ borderRadius: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab 
              icon={<Business />} 
              label={`Brands (${stats.brandCount})`} 
              sx={{ fontWeight: 600, py: 2 }} 
            />
            <Tab 
              icon={<Person />} 
              label={`Influencers (${stats.influencerCount})`} 
              sx={{ fontWeight: 600, py: 2 }} 
            />
          </Tabs>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="200px">
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Loading users...</Typography>
          </Box>
        ) : error ? (
          <Alert 
            severity="error" 
            sx={{ m: 2 }}
            action={
              <Button onClick={fetchUsers} color="inherit" size="small">
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        ) : (
          <>
            {/* Table View */}
            {viewMode === 'table' && (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <TableSortHeader 
                          label="User"
                          sortKey="name"
                          sortConfig={sortConfig}
                          onSort={handleSort}
                        />
                      </TableCell>
                      <TableCell>
                        <TableSortHeader 
                          label="Role"
                          sortKey="role"
                          sortConfig={sortConfig}
                          onSort={handleSort}
                        />
                      </TableCell>
                      <TableCell>
                        <TableSortHeader 
                          label="Status & Subscription"
                          sortKey="subscription"
                          sortConfig={sortConfig}
                          onSort={handleSort}
                        />
                      </TableCell>
                      <TableCell>
                        <TableSortHeader 
                          label="Posts"
                          sortKey="post_count"
                          sortConfig={sortConfig}
                          onSort={handleSort}
                        />
                      </TableCell>
                      <TableCell>
                        <TableSortHeader 
                          label="Followers"
                          sortKey="followers_count"
                          sortConfig={sortConfig}
                          onSort={handleSort}
                        />
                      </TableCell>
                      <TableCell>
                        <TableSortHeader 
                          label="Activity"
                          sortKey="created_at"
                          sortConfig={sortConfig}
                          onSort={handleSort}
                        />
                      </TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <UserCard 
                        key={user._id} 
                        user={user} 
                        onView={handleViewUser}
                        onEdit={handleEditUser}
                        onRemove={handleDeleteClick}
                        onToggleStatus={toggleUserStatus}
                        onExport={exportUserData}
                        statusLoading={statusLoading}
                        viewMode="table"
                      />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Card View */}
            {viewMode === 'card' && (
              <TabPanel value={activeTab} index={0}>
                {filteredUsers.length === 0 ? (
                  <EmptyState 
                    icon={<Business />}
                    title="No brands found"
                    subtitle={search || Object.values(filters).some(Boolean) ? 'Try adjusting your search terms or filters' : 'No brands have registered yet'}
                  />
                ) : (
                  <Box>
                    {filteredUsers.map((user) => (
                      <UserCard 
                        key={user._id} 
                        user={user} 
                        onView={handleViewUser}
                        onEdit={handleEditUser}
                        onRemove={handleDeleteClick}
                        onToggleStatus={toggleUserStatus}
                        onExport={exportUserData}
                        statusLoading={statusLoading}
                        viewMode="card"
                      />
                    ))}
                  </Box>
                )}
              </TabPanel>
            )}

            {viewMode === 'card' && (
              <TabPanel value={activeTab} index={1}>
                {filteredUsers.length === 0 ? (
                  <EmptyState 
                    icon={<Person />}
                    title="No influencers found"
                    subtitle={search || Object.values(filters).some(Boolean) ? 'Try adjusting your search terms or filters' : 'No influencers have registered yet'}
                  />
                ) : (
                  <Box>
                    {filteredUsers.map((user) => (
                      <UserCard 
                        key={user._id} 
                        user={user} 
                        onView={handleViewUser}
                        onEdit={handleEditUser}
                        onRemove={handleDeleteClick}
                        onToggleStatus={toggleUserStatus}
                        onExport={exportUserData}
                        statusLoading={statusLoading}
                        viewMode="card"
                      />
                    ))}
                  </Box>
                )}
              </TabPanel>
            )}
          </>
        )}
      </Card>

      {/* User Detail Dialog */}
      <UserDetailDialog 
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        user={selectedUser}
        onToggleStatus={toggleUserStatus}
        statusLoading={statusLoading}
        onEdit={() => {
          setViewDialogOpen(false);
          setEditDialogOpen(true);
        }}
      />

      {/* Edit User Dialog */}
      <EditUserDialog 
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        user={selectedUser}
        onUpdate={updateUserRole}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog 
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
      />

      {/* Notifications */}
      <NotificationSnackbars 
        error={error}
        success={success}
        onClose={handleCloseSnackbar}
      />

      {/* Floating Action Button for Mobile */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', md: 'none' }
        }}
        onClick={fetchUsers}
      >
        <Refresh />
      </Fab>
    </Box>
  );
}

// Enhanced UserDetailDialog with Subscription Information
const UserDetailDialog = ({ open, onClose, user, onToggleStatus, statusLoading, onEdit }) => {
  const theme = useTheme();
  
  if (!user) return null;

  const profileData = user.profile || {};
  const subscriptionData = user.subscription || {};
  const isActive = user.status !== 'suspended';
  const displayName = getSelectedUserDisplayName(user);

  const renderSubscriptionDetails = () => {
    if (!subscriptionData.current) {
      return <Typography color="textSecondary">No subscription data available</Typography>;
    }

    const sub = subscriptionData.current;
    return (
      <Box>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <InfoRow icon={<SubscriptionsIcon />} label="Plan Type" value={sub.type} />
            <InfoRow icon={<Work />} label="Plan Name" value={sub.plan} />
            <InfoRow icon={<CheckCircle />} label="Status" value={sub.status} />
            <InfoRow icon={<Payment />} label="Billing Cycle" value={sub.billing_cycle} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <InfoRow icon={<CalendarToday />} label="Period Start" value={formatDateTime(sub.current_period_start)} />
            <InfoRow icon={<Schedule />} label="Period End" value={formatDateTime(sub.current_period_end)} />
            <InfoRow icon={<Star />} label="Remaining Days" value={sub.remaining_days > 0 ? `${sub.remaining_days} days` : 'Expired'} />
            <InfoRow icon={<Security />} label="Stripe ID" value={sub.stripe_subscription_id || 'N/A'} />
          </Grid>
        </Grid>

        {/* Subscription Features */}
        {sub.features && sub.features.length > 0 && (
          <Box mt={2}>
            <Typography variant="subtitle2" gutterBottom>Features:</Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {sub.features.map((feature, index) => (
                <Chip key={index} label={feature} size="small" variant="outlined" />
              ))}
            </Box>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
        <AccountCircle />
        User Details - {displayName}
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Profile Header */}
          <Grid item xs={12}>
            <Box display="flex" alignItems="center" gap={3}>
              <Avatar 
                sx={{ 
                  width: 80, 
                  height: 80,
                  bgcolor: user.role === 'brand' ? 'primary.main' : 'secondary.main'
                }}
                src={getProfileImage(user)}
              >
                {displayName.charAt(0).toUpperCase()}
              </Avatar>
              
              <Box flex={1}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Typography variant="h5" fontWeight="600">
                    {displayName}
                  </Typography>
                  <Chip 
                    label={isActive ? "Active" : "Suspended"} 
                    size="small" 
                    color={isActive ? "success" : "error"}
                  />
                  {subscriptionData.current && (
                    <SubscriptionBadge subscription={subscriptionData.current} />
                  )}
                </Box>
                
                <Typography variant="body1" color="textSecondary" gutterBottom>
                  @{user.username} • {user.email}
                </Typography>
                
                <Box display="flex" gap={1} flexWrap="wrap">
                  <Chip 
                    label={user.role} 
                    color={user.role === 'brand' ? 'primary' : 'secondary'}
                  />
                  {profileData.basic_info?.location && (
                    <Chip 
                      label={profileData.basic_info.location} 
                      variant="outlined"
                      icon={<LocationOn />}
                    />
                  )}
                </Box>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Basic Information */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Work /> Basic Information
            </Typography>
            
            <InfoRow icon={<AccountCircle />} label="User ID" value={user._id} />
            <InfoRow icon={<Email />} label="Email" value={user.email} />
            <InfoRow icon={<CalendarToday />} label="Member Since" value={formatDateTime(user.created_at)} />
            <InfoRow icon={<Login />} label="Last Login" value={formatDateTime(user.last_login) || 'Never'} />
            
            {user.role === 'influencer' && profileData.role_specific_profile?.nickname && (
              <InfoRow icon={<Person />} label="Nickname" value={profileData.role_specific_profile.nickname} />
            )}
            
            {user.role === 'brand' && profileData.role_specific_profile?.contact_person_name && (
              <InfoRow icon={<People />} label="Contact Person" value={profileData.role_specific_profile.contact_person_name} />
            )}
          </Grid>

          {/* Profile Details */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Category /> Profile Details
            </Typography>
            
            <InfoRow icon={<Work />} label="Bio" value={profileData.role_specific_profile?.bio} multiline />
            <InfoRow icon={<Phone />} label="Phone" value={profileData.basic_info?.phone} />
            <InfoRow icon={<Language />} label="Website" value={profileData.role_specific_profile?.website} isLink />
            <InfoRow icon={<LocationOn />} label="Location" value={profileData.basic_info?.location} />
          </Grid>

          {/* Subscription Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SubscriptionsIcon /> Subscription Information
            </Typography>
            {renderSubscriptionDetails()}
          </Grid>

          {/* Statistics */}
          {/* // In UserDetailDialog, replace the statistics section: */}
{/* Statistics */}
<Grid item xs={12}>
  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <TrendingUp /> Statistics
  </Typography>
  
  <Grid container spacing={2}>
    <Grid item xs={6} sm={3}>
      <StatCardMini 
        label="Posts" 
        value={user.activity_metrics?.post_count || user.post_count || 0} 
        icon={<PostAdd />}
        color="primary" 
      />
    </Grid>
    <Grid item xs={6} sm={3}>
      <StatCardMini 
        label="Followers" 
        value={user.activity_metrics?.followers_count || user.followers_count || 0} 
        icon={<People />}
        color="secondary" 
      />
    </Grid>
    <Grid item xs={6} sm={3}>
      <StatCardMini 
        label="Following" 
        value={user.activity_metrics?.following_count || user.following_count || 0} 
        icon={<Group />}
        color="info" 
      />
    </Grid>
    <Grid item xs={6} sm={3}>
      <StatCardMini 
        label="Engagement" 
        value={user.activity_metrics?.average_engagement_per_post || 0} 
        icon={<ThumbUp />}
        color="success" 
      />
    </Grid>
  </Grid>
</Grid>

          {/* Social Links */}
          {profileData.social_links && Object.values(profileData.social_links).some(Boolean) && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Link /> Social Links
              </Typography>
              
              <Box display="flex" gap={1} flexWrap="wrap">
                {Object.entries(profileData.social_links).map(([platform, url]) => (
                  url && (
                    <Tooltip key={platform} title={url}>
                      <Chip
                        icon={<SocialIcon platform={platform} />}
                        label={platform}
                        component="a"
                        href={url}
                        target="_blank"
                        clickable
                        variant="outlined"
                      />
                    </Tooltip>
                  )
                ))}
              </Box>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ borderRadius: 2 }}>
          Close
        </Button>
        {/* <Button 
          onClick={onEdit}
          variant="outlined"
          startIcon={<Edit />}
          sx={{ borderRadius: 2 }}
        >
          Edit User
        </Button> */}
        <Button 
          onClick={() => onToggleStatus(user._id, isActive)}
          color={isActive ? "error" : "success"}
          variant="contained"
          disabled={statusLoading[user._id]}
          startIcon={isActive ? <Block /> : <CheckCircle />}
          sx={{ borderRadius: 2 }}
        >
          {statusLoading[user._id] ? (
            <CircularProgress size={20} />
          ) : isActive ? (
            "Suspend User"
          ) : (
            "Activate User"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Helper functions
const getProfileImage = (user) => {
  if (user.role === 'brand' && user.brand_profile?.logo) {
    return getImageUrl(user.brand_profile.logo);
  }
  if (user.role === 'influencer' && user.influencer_profile?.profile_picture) {
    return getImageUrl(user.influencer_profile.profile_picture);
  }
  if (user.profile?.basic_info?.picture) {
    return getImageUrl(user.profile.basic_info.picture);
  }
  return null;
};

const getSelectedUserDisplayName = (user) => {
  if (!user) return '';
  if (user.role === 'brand') {
    return user.brand_profile?.company_name || user.profile?.role_specific_profile?.company_name || user.username;
  }
  return user.influencer_profile?.full_name || user.influencer_profile?.nickname || user.profile?.role_specific_profile?.full_name || user.username;
};

// ... (Keep all the existing helper components: StatCard, TableSortHeader, EmptyState, EditUserDialog, DeleteConfirmationDialog, NotificationSnackbars, InfoRow, StatCardMini)

// The rest of the helper components remain the same as in the previous version
// Only adding the missing ones for completeness:

const StatCard = ({ title, value, icon, color = 'primary', subtitle }) => {
  const theme = useTheme();
  
  return (
    <Card sx={{ 
      background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.1)} 0%, ${alpha(theme.palette[color].main, 0.05)} 100%)`,
      border: `1px solid ${alpha(theme.palette[color].main, 0.2)}`,
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[4]
      }
    }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="subtitle2">
              {title}
            </Typography>
            <Typography variant="h4" color={`${color}.main`} fontWeight="600">
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ 
            bgcolor: alpha(theme.palette[color].main, 0.1), 
            color: `${color}.main` 
          }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

const TableSortHeader = ({ label, sortKey, sortConfig, onSort }) => {
  const isActive = sortConfig.key === sortKey;
  
  return (
    <Box 
      display="flex" 
      alignItems="center" 
      sx={{ cursor: 'pointer' }}
      onClick={() => onSort(sortKey)}
    >
      <Typography variant="subtitle2" fontWeight="600">
        {label}
      </Typography>
      <Sort 
        sx={{ 
          ml: 0.5,
          fontSize: 16,
          opacity: isActive ? 1 : 0.3,
          transform: isActive && sortConfig.direction === 'desc' ? 'rotate(180deg)' : 'none'
        }} 
      />
    </Box>
  );
};

const EmptyState = ({ icon, title, subtitle }) => (
  <Box textAlign="center" py={6}>
    <Box sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }}>
      {icon}
    </Box>
    <Typography variant="h6" color="textSecondary" gutterBottom>
      {title}
    </Typography>
    <Typography variant="body2" color="textSecondary">
      {subtitle}
    </Typography>
  </Box>
);

const EditUserDialog = ({ open, onClose, user, onUpdate }) => {
  const [role, setRole] = useState(user?.role || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setRole(user.role);
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!user || !role) return;
    
    setLoading(true);
    try {
      await onUpdate(user._id, role);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit User Role</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Update the role for {user?.email}
        </Typography>
        
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>User Role</InputLabel>
          <Select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            label="User Role"
          >
            <MenuItem value="brand">Brand</MenuItem>
            <MenuItem value="influencer">Influencer</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="moderator">Moderator</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !role}
        >
          {loading ? <CircularProgress size={20} /> : 'Update Role'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const DeleteConfirmationDialog = ({ open, onClose, onConfirm }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Warning color="error" />
      Confirm Delete
    </DialogTitle>
    <DialogContent>
      <Typography>
        Are you sure you want to permanently remove this user? This action cannot be undone and will delete all associated data including posts, followers, and profile information.
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button onClick={onConfirm} color="error" variant="contained">
        Delete User
      </Button>
    </DialogActions>
  </Dialog>
);

const NotificationSnackbars = ({ error, success, onClose }) => (
  <>
    <Snackbar open={!!error} autoHideDuration={6000} onClose={onClose}>
      <Alert onClose={onClose} severity="error" variant="filled">
        {error}
      </Alert>
    </Snackbar>
    
    <Snackbar open={!!success} autoHideDuration={6000} onClose={onClose}>
      <Alert onClose={onClose} severity="success" variant="filled">
        {success}
      </Alert>
    </Snackbar>
  </>
);

const InfoRow = ({ icon, label, value, multiline = false, isLink = false }) => (
  <Box display="flex" alignItems={multiline ? 'flex-start' : 'center'} gap={1} mb={1.5}>
    <Box sx={{ color: 'text.secondary', minWidth: 24, mt: multiline ? 0.5 : 0 }}>
      {icon}
    </Box>
    <Box flex={1}>
      <Typography variant="subtitle2" color="textSecondary" gutterBottom={multiline}>
        {label}
      </Typography>
      {isLink && value ? (
        <Typography 
          component="a" 
          href={value} 
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
          {value || 'N/A'}
        </Typography>
      )}
    </Box>
  </Box>
);

const StatCardMini = ({ label, value, icon, color = 'primary' }) => (
  <Card 
    variant="outlined" 
    sx={{ 
      textAlign: 'center',
      p: 2,
      borderColor: theme => theme.palette[color].main,
      background: theme => alpha(theme.palette[color].main, 0.05)
    }}
  >
    <Box sx={{ color: `${color}.main`, mb: 1 }}>
      {icon}
    </Box>
    <Typography variant="h6" color={`${color}.main`} fontWeight="600">
      {typeof value === 'number' ? value.toLocaleString() : value}
    </Typography>
    <Typography variant="caption" color="textSecondary">
      {label}
    </Typography>
  </Card>
);

// Helper function
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

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