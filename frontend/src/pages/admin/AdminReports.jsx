import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button,
  FormControl, InputLabel, Select, MenuItem, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Chip, useTheme, alpha, IconButton, Avatar,
  Alert, CircularProgress, Badge, Tabs, Tab, Paper,
  Tooltip, LinearProgress, Switch, FormControlLabel,
  TextField, InputAdornment, Menu, ListItemIcon,
  Collapse, List, ListItem, ListItemText
} from '@mui/material';
import {
  Refresh, TrendingUp, BarChart, ShowChart,
  People, Campaign, Payment, Notifications,
  Download, Visibility, Warning, CheckCircle,
  Error, AccessTime, MoreVert, FilterList,
  Search, DateRange, Download as DownloadIcon,
  Email, Chat, AccountCircle, Receipt,
  ArrowUpward, ArrowDownward, Equalizer,
  CloudUpload, CloudDownload, Security
} from '@mui/icons-material';
import { AuthContext } from '../../context/AuthContext';
import API_BASE_URL from "../../config/api";
import { formatDistanceToNow } from 'date-fns';

// Activity Type Badge Component
const ActivityBadge = ({ type }) => {
  const theme = useTheme();
  const typeConfig = {
    campaign: { color: 'primary', icon: <Campaign fontSize="small" /> },
    application: { color: 'info', icon: <People fontSize="small" /> },
    payment: { color: 'success', icon: <Payment fontSize="small" /> },
    user: { color: 'warning', icon: <AccountCircle fontSize="small" /> },
    system: { color: 'secondary', icon: <Security fontSize="small" /> },
    notification: { color: 'error', icon: <Notifications fontSize="small" /> }
  };

  const config = typeConfig[type] || typeConfig.system;

  return (
    <Chip
      icon={config.icon}
      label={type.charAt(0).toUpperCase() + type.slice(1)}
      size="small"
      sx={{
        backgroundColor: alpha(theme.palette[config.color].main, 0.1),
        color: theme.palette[config.color].main,
        border: `1px solid ${alpha(theme.palette[config.color].main, 0.3)}`
      }}
    />
  );
};

// Severity Indicator
const SeverityIndicator = ({ severity }) => {
  const theme = useTheme();
  const severityConfig = {
    high: { color: 'error', icon: <Warning /> },
    medium: { color: 'warning', icon: <Error /> },
    low: { color: 'info', icon: <AccessTime /> },
    success: { color: 'success', icon: <CheckCircle /> }
  };

  const config = severityConfig[severity] || severityConfig.low;

  return (
    <Tooltip title={`${severity} priority`}>
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: theme.palette[config.color].main,
          display: 'inline-block',
          mr: 1
        }}
      />
    </Tooltip>
  );
};

// Activity Card Component
const ActivityCard = ({ activity }) => {
  const theme = useTheme();
  
  return (
    <Card 
      sx={{ 
        mb: 2, 
        borderRadius: 2,
        borderLeft: `4px solid ${theme.palette.primary.main}`,
        transition: 'all 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4]
        }
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between">
          <Box flex={1}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <SeverityIndicator severity={activity.severity} />
              <ActivityBadge type={activity.type} />
              <Typography variant="caption" color="text.secondary">
                {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
              </Typography>
            </Box>
            
            <Typography variant="body2" fontWeight="500" gutterBottom>
              {activity.description}
            </Typography>
            
            {activity.user && (
              <Box display="flex" alignItems="center" gap={1} mt={1}>
                <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                  {activity.user.name?.charAt(0) || 'U'}
                </Avatar>
                <Typography variant="caption" color="text.secondary">
                  {activity.user.name} • {activity.user.role}
                </Typography>
              </Box>
            )}
            
            {activity.metadata && (
              <Box mt={1}>
                <Typography variant="caption" color="text.secondary">
                  Campaign: {activity.metadata.campaign_title || 'N/A'} • 
                  Amount: {activity.metadata.amount || 'N/A'}
                </Typography>
              </Box>
            )}
          </Box>
          
          <IconButton size="small">
            <MoreVert fontSize="small" />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
};

// Stat Card Component
const StatCard = ({ title, value, change, icon, color, subtitle }) => {
  const theme = useTheme();
  
  return (
    <Card 
      sx={{ 
        height: '100%', 
        borderRadius: 2,
        background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.1)} 0%, ${alpha(theme.palette[color].main, 0.05)} 100%)`,
        border: `1px solid ${alpha(theme.palette[color].main, 0.2)}`
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box>
            <Typography 
              color="text.secondary" 
              variant="overline"
              fontWeight="600"
            >
              {title}
            </Typography>
            <Typography 
              variant="h3" 
              color="text.primary"
              fontWeight="700"
            >
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              p: 1.5,
              borderRadius: '50%',
              backgroundColor: alpha(theme.palette[color].main, 0.1)
            }}
          >
            {icon}
          </Box>
        </Box>
        
        {change !== undefined && (
          <Box display="flex" alignItems="center" gap={0.5}>
            {change > 0 ? (
              <ArrowUpward sx={{ fontSize: 16, color: 'success.main' }} />
            ) : (
              <ArrowDownward sx={{ fontSize: 16, color: 'error.main' }} />
            )}
            <Typography 
              variant="body2" 
              color={change > 0 ? 'success.main' : 'error.main'}
              fontWeight="600"
            >
              {change > 0 ? '+' : ''}{change}%
            </Typography>
            <Typography variant="caption" color="text.secondary" ml={0.5}>
              vs last period
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Real-time Activity Feed Component
const ActivityFeed = ({ activities, loading, error, onRefresh }) => {
  const [filter, setFilter] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);

  const handleFilterClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    return activity.type === filter;
  });

  const activityCounts = activities.reduce((acc, activity) => {
    acc[activity.type] = (acc[activity.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <Card sx={{ height: '100%', borderRadius: 2 }}>
      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="h6" fontWeight="600">
              Real-time Activities
            </Typography>
            <Badge 
              badgeContent={activities.length} 
              color="primary"
              sx={{ '& .MuiBadge-badge': { top: 8, right: -8 } }}
            />
          </Box>
          
          <Box display="flex" alignItems="center" gap={1}>
            <Tooltip title="Filter activities">
              <IconButton size="small" onClick={handleFilterClick}>
                <Badge 
                  badgeContent={filter !== 'all' ? 1 : 0} 
                  color="primary"
                  sx={{ '& .MuiBadge-badge': { top: 5, right: 5 } }}
                >
                  <FilterList fontSize="small" />
                </Badge>
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleFilterClose}
            >
              <MenuItem 
                onClick={() => { setFilter('all'); handleFilterClose(); }}
                selected={filter === 'all'}
              >
                All Activities ({activities.length})
              </MenuItem>
              {Object.entries(activityCounts).map(([type, count]) => (
                <MenuItem 
                  key={type}
                  onClick={() => { setFilter(type); handleFilterClose(); }}
                  selected={filter === type}
                >
                  <ActivityBadge type={type} />
                  <Typography variant="body2" ml={1} color="text.secondary">
                    ({count})
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
            
            <Tooltip title="Refresh">
              <IconButton size="small" onClick={onRefresh}>
                <Refresh fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box flex={1} sx={{ overflow: 'auto' }}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="200px">
              <CircularProgress />
            </Box>
          ) : filteredActivities.length === 0 ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="200px" flexDirection="column">
              <Notifications sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography color="text.secondary">No activities found</Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {filteredActivities.map((activity, index) => (
                <React.Fragment key={activity.id}>
                  <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                          <SeverityIndicator severity={activity.severity} />
                          <Typography variant="body2" fontWeight="600" flex={1}>
                            {activity.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box mt={0.5}>
                          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                            <ActivityBadge type={activity.type} />
                            {activity.user && (
                              <Typography variant="caption" color="text.secondary">
                                By {activity.user.name} ({activity.user.role})
                              </Typography>
                            )}
                          </Box>
                          {activity.metadata && (
                            <Typography variant="caption" color="text.secondary">
                              {activity.metadata.campaign_title && `Campaign: ${activity.metadata.campaign_title}`}
                              {activity.metadata.amount && ` • Amount: $${activity.metadata.amount}`}
                              {activity.metadata.status && ` • Status: ${activity.metadata.status}`}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < filteredActivities.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
        
        <Box mt={2}>
          <Button
            fullWidth
            variant="outlined"
            size="small"
            startIcon={<DownloadIcon />}
            disabled={loading}
          >
            Export Activities
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

// Main Component
export default function AdminActivities() {
  const { user } = useContext(AuthContext);
  const theme = useTheme();
  
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeCampaigns: 0,
    totalRevenue: 0,
    pendingApplications: 0
  });
  const [activities, setActivities] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeRange, setTimeRange] = useState('24h');

  // Fetch activities
  const fetchActivities = useCallback(async () => {
    if (!user?.token) return;
    
    try {
      setError('');
      const response = await fetch(`${API_BASE_URL}/admin/activities`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch activities');
      const data = await response.json();
      
      // Transform data for display
      const transformedActivities = data.map((item, index) => ({
        id: item._id || index,
        type: item.type || 'system',
        severity: item.severity || 'low',
        description: item.description || 'Unknown activity',
        timestamp: item.timestamp || new Date().toISOString(),
        user: item.user || null,
        metadata: item.metadata || {}
      }));
      
      setActivities(transformedActivities);
      
    } catch (err) {
      setError(err.message);
      console.error('Error fetching activities:', err);
      
      // Mock data for demo purposes
      setActivities(generateMockActivities());
    }
  }, [user]);

  // Fetch statistics
  const fetchStatistics = useCallback(async () => {
    if (!user?.token) return;
    
    try {
      // Fetch user statistics
      const usersResponse = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      
      let totalUsers = 0;
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        totalUsers = usersData.length || 0;
      }
      
      // Fetch campaign statistics
      const campaignStatsResponse = await fetch(`${API_BASE_URL}/api/admin/campaigns/stats`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      
      let activeCampaigns = 0;
      let pendingApplications = 0;
      
      if (campaignStatsResponse.ok) {
        const campaignStats = await campaignStatsResponse.json();
        activeCampaigns = campaignStats.active || 0;
        
        // Fetch applications for pending count
        const applicationsResponse = await fetch(`${API_BASE_URL}/admin/applications`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        
        if (applicationsResponse.ok) {
          const applications = await applicationsResponse.json();
          pendingApplications = applications.filter(app => app.status === 'pending').length;
        }
      }
      
      setStats({
        totalUsers,
        activeCampaigns,
        totalRevenue: 12540, // Would come from payments API
        pendingApplications
      });
      
    } catch (err) {
      console.error('Error fetching statistics:', err);
      // Set default stats
      setStats({
        totalUsers: 124,
        activeCampaigns: 18,
        totalRevenue: 12540,
        pendingApplications: 7
      });
    }
  }, [user]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;
    
    const intervalId = setInterval(() => {
      fetchActivities();
      fetchStatistics();
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [autoRefresh, fetchActivities, fetchStatistics]);

  // Initial load
  useEffect(() => {
    if (user?.token) {
      setLoading(true);
      Promise.all([
        fetchActivities(),
        fetchStatistics()
      ]).finally(() => setLoading(false));
    }
  }, [user, fetchActivities, fetchStatistics]);

  // Mock data generator (for demo)
  const generateMockActivities = () => {
    const mockUsers = [
      { name: 'John Doe', role: 'influencer' },
      { name: 'Jane Smith', role: 'brand' },
      { name: 'Acme Corp', role: 'brand' },
      { name: 'Mike Johnson', role: 'influencer' }
    ];
    
    const types = ['campaign', 'application', 'payment', 'user', 'system', 'notification'];
    const severities = ['high', 'medium', 'low', 'success'];
    
    return Array.from({ length: 15 }, (_, i) => ({
      id: i,
      type: types[Math.floor(Math.random() * types.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      description: [
        'New campaign created by Acme Corp',
        'Payment processed successfully',
        'User registration completed',
        'Campaign application submitted',
        'System maintenance completed',
        'New influencer verified',
        'Campaign completed successfully',
        'Payment failed - retry initiated',
        'User subscription upgraded',
        'New brand registered'
      ][i % 10],
      timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      user: mockUsers[Math.floor(Math.random() * mockUsers.length)],
      metadata: {
        campaign_title: i % 3 === 0 ? 'Summer Collection 2024' : null,
        amount: i % 4 === 0 ? (Math.random() * 1000).toFixed(2) : null,
        status: ['pending', 'approved', 'completed', 'failed'][Math.floor(Math.random() * 4)]
      }
    }));
  };

  // Filter activities based on search and time range
  const filteredActivities = activities.filter(activity => {
    // Search filter
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      activity.description.toLowerCase().includes(searchLower) ||
      (activity.user?.name?.toLowerCase().includes(searchLower)) ||
      (activity.metadata?.campaign_title?.toLowerCase().includes(searchLower));
    
    if (!matchesSearch) return false;
    
    // Time range filter
    const activityDate = new Date(activity.timestamp);
    const now = new Date();
    const timeDiff = now - activityDate;
    
    switch (timeRange) {
      case '1h': return timeDiff <= 3600000;
      case '24h': return timeDiff <= 86400000;
      case '7d': return timeDiff <= 604800000;
      case '30d': return timeDiff <= 2592000000;
      default: return true;
    }
  });

  const handleExport = () => {
    // Export logic here
    alert('Exporting activities data...');
  };

  const handleRefresh = () => {
    setLoading(true);
    Promise.all([
      fetchActivities(),
      fetchStatistics()
    ]).finally(() => setLoading(false));
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="700" gutterBottom>
            Admin Activities Monitor
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Real-time monitoring of all platform activities
          </Typography>
        </Box>
        
        <Box display="flex" alignItems="center" gap={2}>
          <FormControlLabel
            control={
              <Switch
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.value)}
                color="primary"
              />
            }
            label={
              <Box display="flex" alignItems="center" gap={0.5}>
                <Refresh fontSize="small" />
                <Typography variant="caption">Auto-refresh</Typography>
              </Box>
            }
          />
          
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={handleExport}
          >
            Export
          </Button>
        </Box>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Users"
            value={stats.totalUsers.toLocaleString()}
            change={12.5}
            icon={<People sx={{ fontSize: 32, color: 'primary.main' }} />}
            color="primary"
            subtitle={`${Math.floor(stats.totalUsers * 0.6)} influencers, ${Math.floor(stats.totalUsers * 0.4)} brands`}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Active Campaigns"
            value={stats.activeCampaigns}
            change={8.2}
            icon={<Campaign sx={{ fontSize: 32, color: 'info.main' }} />}
            color="info"
            subtitle={`${stats.pendingApplications} pending applications`}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Revenue"
            value={`$${stats.totalRevenue.toLocaleString()}`}
            change={18.3}
            icon={<Payment sx={{ fontSize: 32, color: 'success.main' }} />}
            color="success"
            subtitle="This month"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="System Health"
            value="98.7%"
            change={0.5}
            icon={<Security sx={{ fontSize: 32, color: 'warning.main' }} />}
            color="warning"
            subtitle="Uptime last 30 days"
          />
        </Grid>
      </Grid>

      {/* Controls */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeRange}
                label="Time Range"
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <MenuItem value="1h">Last 1 hour</MenuItem>
                <MenuItem value="24h">Last 24 hours</MenuItem>
                <MenuItem value="7d">Last 7 days</MenuItem>
                <MenuItem value="30d">Last 30 days</MenuItem>
                <MenuItem value="all">All time</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Activity Type</InputLabel>
              <Select
                value={activeTab === 0 ? 'all' : ['campaign', 'application', 'payment', 'user'][activeTab - 1]}
                label="Activity Type"
                onChange={(e) => {
                  const value = e.target.value;
                  setActiveTab(value === 'all' ? 0 : ['campaign', 'application', 'payment', 'user'].indexOf(value) + 1);
                }}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="campaign">Campaigns</MenuItem>
                <MenuItem value="application">Applications</MenuItem>
                <MenuItem value="payment">Payments</MenuItem>
                <MenuItem value="user">Users</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleRefresh}
              disabled={loading}
            >
              Refresh
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Activity Feed */}
        <Grid item xs={12} lg={8}>
          <ActivityFeed
            activities={filteredActivities}
            loading={loading}
            error={error}
            onRefresh={handleRefresh}
          />
        </Grid>
        
        {/* Sidebar - Activity Summary */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ borderRadius: 2, mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Activity Summary
              </Typography>
              
              <Box mt={3}>
                {['campaign', 'application', 'payment', 'user', 'system'].map((type) => {
                  const count = activities.filter(a => a.type === type).length;
                  const percentage = activities.length > 0 ? (count / activities.length) * 100 : 0;
                  
                  return (
                    <Box key={type} mb={2}>
                      <Box display="flex" justifyContent="space-between" mb={0.5}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <ActivityBadge type={type} />
                          <Typography variant="body2">
                            {count}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {percentage.toFixed(1)}%
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={percentage}
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          backgroundColor: alpha(theme.palette.primary.main, 0.1)
                        }}
                      />
                    </Box>
                  );
                })}
              </Box>
              
              <Divider sx={{ my: 3 }} />
              
              <Box>
                <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                  Recent Users Online
                </Typography>
                <List dense>
                  {[1, 2, 3].map((i) => (
                    <ListItem key={i} sx={{ px: 0 }}>
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight="500">
                            User {i}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            Last active 5 minutes ago
                          </Typography>
                        }
                      />
                      <Chip label="Online" size="small" color="success" />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </CardContent>
          </Card>
          
          {/* System Status */}
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                System Status
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemText
                    primary="API Server"
                    secondary="Response time: 120ms"
                  />
                  <Chip label="Healthy" size="small" color="success" />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Database"
                    secondary="Connection pool: 85%"
                  />
                  <Chip label="Normal" size="small" color="success" />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Email Service"
                    secondary="Queue: 12 messages"
                  />
                  <Chip label="Active" size="small" color="warning" />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Payment Gateway"
                    secondary="Success rate: 99.2%"
                  />
                  <Chip label="Stable" size="small" color="success" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Loading Overlay */}
      {loading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: alpha('#000', 0.5),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={60} />
            <Typography color="white" mt={2}>
              Loading activities...
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}