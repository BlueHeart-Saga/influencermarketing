import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Avatar,
  List, ListItem, ListItemText, ListItemIcon, Divider,
  Chip, LinearProgress, useTheme, alpha, IconButton,
  Alert, CircularProgress, Button, Stack, Paper, Tooltip,
  Collapse, TextField, InputAdornment, Menu, MenuItem
} from '@mui/material';
import {
  People, Business, Campaign, Category,
  TrendingUp, TrendingDown, Schedule,
  CheckCircle, PauseCircle, StopCircle,
  Refresh, ArrowForward, AdminPanelSettings,
  MonetizationOn, Warning, HowToReg, GroupAdd,
  Visibility, Comment, Favorite, Analytics,
  Search, FilterList, MoreVert, Download,
  Email, Phone, LocationOn, CalendarToday,
  BarChart, PieChart, Timeline, Dashboard as DashboardIcon,
  ExpandMore, ExpandLess, Notifications, Security,
  Storage, Speed, Cloud, Devices, VerifiedUser
} from '@mui/icons-material';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import API_BASE_URL from "../../config/api";

// Enhanced Stat Card Component
const StatCard = ({ title, value, icon, color, subtitle, trend, loading, error }) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: '100%',
        minHeight: 130,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[4],
          borderColor: theme.palette[color].main,
        }
      }}
    >
      <CardContent sx={{
        flexGrow: 1,
        display: 'flex',
        alignItems: 'center',
      }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
          <Box flex={1}>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight="600"
              sx={{ mb: 0.5, display: 'block' }}
            >
              {title}
            </Typography>

            {loading ? (
              <Box display="flex" alignItems="center" height={40}>
                <CircularProgress size={20} color={color} />
              </Box>
            ) : error ? (
              <Typography
                variant="h6"
                color="error"
                fontWeight="600"
                sx={{ lineHeight: 1.2 }}
              >
                Error
              </Typography>
            ) : (
              <Typography
                variant="h5"
                fontWeight="700"
                sx={{
                  lineHeight: 1.2,
                  mb: 0.5,
                  color: theme.palette.text.primary
                }}
              >
                {typeof value === 'number' ? value.toLocaleString() : value}
              </Typography>
            )}

            {subtitle && !loading && !error && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mb: 0.5 }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>

          <Avatar
            sx={{
              bgcolor: alpha(theme.palette[color].main, 0.1),
              color: `${color}.main`,
              width: 44,
              height: 44,
              border: `1px solid ${alpha(theme.palette[color].main, 0.2)}`,
            }}
          >
            {React.cloneElement(icon, { fontSize: 'medium' })}
          </Avatar>
        </Box>

        {trend !== undefined && !loading && !error && (
          <Box display="flex" alignItems="center" mt={1}>
            {trend > 0 ? (
              <TrendingUp sx={{
                fontSize: 14,
                mr: 0.5,
                color: 'success.main'
              }} />
            ) : (
              <TrendingDown sx={{
                fontSize: 14,
                mr: 0.5,
                color: 'error.main'
              }} />
            )}
            <Typography
              variant="caption"
              fontWeight="600"
              color={trend > 0 ? 'success.main' : 'error.main'}
            >
              {trend > 0 ? '+' : ''}{trend}%
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Compact Activity Item Component
const ActivityItem = ({ item, index }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'user':
        return <People fontSize="small" color="primary" />;
      case 'subscription':
        return <MonetizationOn fontSize="small" color="success" />;
      case 'post':
        return <Category fontSize="small" color="warning" />;
      case 'admin':
        return <AdminPanelSettings fontSize="small" color="error" />;
      default:
        return <CheckCircle fontSize="small" color="info" />;
    }
  };

  return (
    <ListItem
      sx={{
        px: 2,
        py: 1.5,
        borderBottom: `1px solid`,
        borderColor: 'divider',
        '&:last-child': {
          borderBottom: 'none'
        },
        '&:hover': {
          backgroundColor: 'action.hover',
        }
      }}
    >
      <ListItemIcon sx={{ minWidth: 40 }}>
        {getIcon(item.type)}
      </ListItemIcon>
      <ListItemText
        primary={
          <Typography variant="body2" fontWeight="500" noWrap>
            {item.title}
          </Typography>
        }
        secondary={
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" color="text.secondary" noWrap flex={1}>
              {item.description}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              {item.time}
            </Typography>
          </Box>
        }
      />
    </ListItem>
  );
};

// Helper functions
const formatTimeAgo = (dateString) => {
  try {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Just now';

    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch (error) {
    return 'Just now';
  }
};

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [activitiesOpen, setActivitiesOpen] = useState(false);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');

  // Stats state
  const [dashboardData, setDashboardData] = useState({
    platform_overview: {
      total_users: 0,
      brands: 0,
      influencers: 0,
      admins: 0,
      total_posts: 0,
      total_collaborations: 0,
      active_collaborations: 0
    },
    subscription_analytics: {
      active_subscriptions: 0,
      trial_users: 0,
      free_users: 0
    },
    engagement_metrics: {
      total_likes: 0,
      total_comments: 0,
      total_views: 0
    },
    recent_activity: {
      last_24h_posts: 0,
      last_7d_users: 0,
      last_7d_posts: 0
    }
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [lastUpdated, setLastUpdated] = useState('');

  // Simplified fetch function - only gets essential data
  const fetchEssentialData = useCallback(async () => {
    try {
      setRefreshing(true);
      setError('');

      const token = user?.token;
      if (!token) {
        setError('Authentication required');
        setRefreshing(false);
        setLoading(false);
        return;
      }

      console.log('Fetching essential dashboard data...');

      // 1. Fetch dashboard data (cached endpoint - should be fast)
      const dashboardResponse = await fetch(`${API_BASE_URL}/admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!dashboardResponse.ok) {
        throw new Error(`Dashboard API error: ${dashboardResponse.status}`);
      }

      const dashboardData = await dashboardResponse.json();
      console.log('Dashboard data loaded');
      setDashboardData(dashboardData);

      // 2. Fetch recent activities (separate endpoint)
      const activitiesResponse = await fetch(`${API_BASE_URL}/admin/activities/recent?limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json();
        setRecentActivities(activitiesData.activities || []);
      }

      // 3. Fetch quick stats for extra info
      const quickStatsResponse = await fetch(`${API_BASE_URL}/admin/quick/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (quickStatsResponse.ok) {
        // We'll use this data for status counts if needed
      }

      setLastUpdated(new Date().toISOString());

    } catch (err) {
      console.error('Data fetch error:', err);
      setError(err.message || 'Failed to load dashboard data');

      // Fallback to mock data
      console.log('Using mock data as fallback');
      setDashboardData(getMockDashboardData());
      setRecentActivities(getMockActivities());
      setLastUpdated(new Date().toISOString());
    } finally {
      setLoading(false);
      setRefreshing(false);
      console.log('Essential data fetch completed');
    }
  }, [user]);

  // Mock data fallback
  const getMockDashboardData = () => ({
    platform_overview: {
      total_users: 1250,
      brands: 320,
      influencers: 930,
      admins: 8,
      total_posts: 8450,
      total_collaborations: 1200,
      active_collaborations: 450
    },
    subscription_analytics: {
      active_subscriptions: 580,
      trial_users: 45,
      free_users: 625
    },
    engagement_metrics: {
      total_likes: 45200,
      total_comments: 12300,
      total_views: 189500
    },
    recent_activity: {
      last_24h_posts: 42,
      last_7d_users: 68,
      last_7d_posts: 320
    }
  });

  const getMockActivities = () => [
    { type: 'user', title: 'New brand registered', description: 'techcorp@example.com', time: new Date(Date.now() - 7200000).toISOString() },
    { type: 'subscription', title: 'Pro subscription activated', description: 'Status: active', time: new Date(Date.now() - 14400000).toISOString() },
    { type: 'user', title: 'New influencer registered', description: 'sarah@example.com', time: new Date(Date.now() - 21600000).toISOString() },
    { type: 'post', title: 'New post created', description: 'Post by user ID: 507f1f77bcf86cd7', time: new Date(Date.now() - 86400000).toISOString() },
  ];

  useEffect(() => {
    if (user?.token) {
      fetchEssentialData();
    } else {
      setLoading(false);
      setError('Please log in');
    }
  }, [user, fetchEssentialData]);

  // Filter menu handlers
  const handleFilterMenuOpen = (event) => {
    setFilterMenuAnchor(event.currentTarget);
  };

  const handleFilterMenuClose = () => {
    setFilterMenuAnchor(null);
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    handleFilterMenuClose();
  };

  // Format recent activities
  const formattedActivities = recentActivities.map(activity => ({
    type: activity.type,
    title: activity.title,
    description: activity.description,
    time: formatTimeAgo(activity.time),
    data: activity.data
  }));

  // Stat cards configuration
  const statCards = [
    {
      title: "Total Users",
      value: dashboardData.platform_overview?.total_users || 0,
      icon: <People />,
      color: "primary",
      subtitle: `${dashboardData.platform_overview?.brands || 0} brands, ${dashboardData.platform_overview?.influencers || 0} influencers`,
      trend: 12.5
    },
    {
      title: "Active Subs",
      value: dashboardData.subscription_analytics?.active_subscriptions || 0,
      icon: <MonetizationOn />,
      color: "success",
      subtitle: `${dashboardData.subscription_analytics?.trial_users || 0} trials`,
      trend: 8.3
    },
    {
      title: "Total Posts",
      value: dashboardData.platform_overview?.total_posts || 0,
      icon: <Category />,
      color: "warning",
      subtitle: `${dashboardData.recent_activity?.last_24h_posts || 0} today`,
      trend: 15.2
    },
    {
      title: "Engagement",
      value: dashboardData.engagement_metrics?.total_likes > 1000
        ? `${(dashboardData.engagement_metrics?.total_likes / 1000).toFixed(1)}K`
        : dashboardData.engagement_metrics?.total_likes || 0,
      icon: <Favorite />,
      color: "error",
      subtitle: `${dashboardData.engagement_metrics?.total_comments || 0} comments`,
      trend: 18.7
    },
    {
      title: "New Users",
      value: dashboardData.recent_activity?.last_7d_users || 0,
      icon: <GroupAdd />,
      color: "secondary",
      subtitle: `This week`,
      trend: 23.4
    },
    {
      title: "Active Campaigns",
      value: dashboardData.platform_overview?.active_collaborations || 0,
      icon: <Campaign />,
      color: "info",
      subtitle: `${dashboardData.platform_overview?.total_collaborations || 0} total`,
      trend: -2.1
    },
  ];

  if (loading && !refreshing) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight="700">
              Admin Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Welcome back, {user?.email?.split('@')[0] || 'Admin'}
              {lastUpdated && ` • Updated ${formatTimeAgo(lastUpdated)}`}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1}>
            <Tooltip title="Refresh dashboard data">
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={fetchEssentialData}
                disabled={refreshing}
                size="small"
              >
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </Tooltip>
          </Stack>
        </Box>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: 1,
            border: `1px solid ${theme.palette.error.main}`
          }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={fetchEssentialData}
              disabled={refreshing}
            >
              Retry
            </Button>
          }
        >
          <Typography fontWeight="500">{error}</Typography>
        </Alert>
      )}

      {/* SECTION 1: Statistics Overview */}
      <Paper
        elevation={0}
        sx={{
          mb: 4,
          p: 3,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 3,
            pb: 2,
            borderBottom: `2px solid`,
            borderColor: theme.palette.divider
          }}
        >
          <Box display="flex" alignItems="center" gap={1.5}>
            <DashboardIcon sx={{ color: theme.palette.primary.main }} />
            <Typography variant="h6" fontWeight="600">
              Platform Overview
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            {lastUpdated ? `Updated ${formatTimeAgo(lastUpdated)}` : 'Loading...'}
          </Typography>
        </Box>

        <Grid container spacing={2}>
          {statCards.map((stat, index) => (
            <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
              <StatCard {...stat} loading={refreshing} />
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* SECTION 2: Recent Activities */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper',
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 3,
            borderBottom: `2px solid`,
            borderColor: theme.palette.divider
          }}
        >
          <Box display="flex" alignItems="center" gap={1.5}>
            <Notifications sx={{ color: theme.palette.primary.main }} />
            <Typography variant="h6" fontWeight="600">
              Recent Activities
            </Typography>
            <Chip
              label={`${recentActivities.length} activities`}
              size="small"
              variant="outlined"
              color="primary"
            />
          </Box>
          <Button
            size="small"
            endIcon={activitiesOpen ? <ExpandLess /> : <ExpandMore />}
            onClick={() => setActivitiesOpen(!activitiesOpen)}
            sx={{ textTransform: 'none' }}
          >
            {activitiesOpen ? 'Hide' : 'Show All'}
          </Button>
        </Box>

        <Box sx={{ p: 0 }}>
          {/* Collapsible Activities List */}
          <Collapse in={activitiesOpen}>
            <List sx={{ maxHeight: 300, overflow: 'auto' }}>
              {formattedActivities.length > 0 ? (
                formattedActivities.map((item, index) => (
                  <ActivityItem key={index} item={item} index={index} />
                ))
              ) : (
                <ListItem sx={{ py: 3 }}>
                  <ListItemText
                    primary={
                      <Typography color="text.secondary" textAlign="center">
                        No recent activities to display
                      </Typography>
                    }
                  />
                </ListItem>
              )}
            </List>
            {formattedActivities.length > 0 && (
              <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                <Link to="/admin/activities" style={{ textDecoration: 'none' }}>
                  <Button
                    fullWidth
                    size="small"
                    endIcon={<ArrowForward />}
                    sx={{ textTransform: 'none' }}
                  >
                    View Complete Activity Log
                  </Button>
                </Link>
              </Box>
            )}
          </Collapse>

          {/* Quick Summary (when collapsed) */}
          {!activitiesOpen && (
            <Box sx={{ p: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {formattedActivities.length} activities in the last 24 hours
              </Typography>
              {formattedActivities.slice(0, 2).map((item, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mt: 1.5 }}>
                  <Box sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: theme.palette.primary.main,
                    mr: 1.5
                  }} />
                  <Typography variant="body2" noWrap flex={1}>
                    {item.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.time}
                  </Typography>
                </Box>
              ))}
              {formattedActivities.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  No recent activities to display
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
}