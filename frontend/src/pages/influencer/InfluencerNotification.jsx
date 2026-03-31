import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Badge,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Avatar
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  MarkEmailRead as ReadIcon,
  Delete as DeleteIcon,
  Campaign as CampaignIcon,
  Payment as PaymentIcon,
  Person as PersonIcon,
  Message as MessageIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  TrendingUp as AnalyticsIcon,
  Announcement as AnnouncementIcon
} from '@mui/icons-material';
import { formatDistanceToNow, parseISO } from 'date-fns';

// API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const InfluencerNotification = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Priority configuration
  const priorityConfig = {
    low: { color: 'default', icon: <InfoIcon /> },
    medium: { color: 'primary', icon: <CampaignIcon /> },
    high: { color: 'warning', icon: <WarningIcon /> },
    urgent: { color: 'error', icon: <ErrorIcon /> }
  };

  // Notification type icons and colors
  const typeConfig = {
    application_status: { icon: <CheckCircleIcon />, color: 'primary' },
    new_campaign_match: { icon: <CampaignIcon />, color: 'success' },
    campaign_invitation: { icon: <PersonIcon />, color: 'info' },
    payment_received: { icon: <PaymentIcon />, color: 'success' },
    campaign_reminder: { icon: <WarningIcon />, color: 'warning' },
    new_message: { icon: <MessageIcon />, color: 'primary' },
    profile_approved: { icon: <CheckCircleIcon />, color: 'success' },
    profile_update_required: { icon: <WarningIcon />, color: 'error' },
    weekly_summary: { icon: <AnalyticsIcon />, color: 'info' },
    system_announcement: { icon: <AnnouncementIcon />, color: 'default' },
    default: { icon: <NotificationsIcon />, color: 'default' }
  };

  const statusColors = {
    approved: 'success',
    rejected: 'error',
    pending: 'warning',
    reviewing: 'info'
  };

  const fetchNotifications = useCallback(async () => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setError('Please log in to view notifications');
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/influencer/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        setError('Session expired. Please log in again.');
        localStorage.removeItem('access_token');
        return;
      }

      if (response.status === 403) {
        setError('Access denied. You must be an influencer to view these notifications.');
        return;
      }

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Fetched influencer notifications:', data); // Debug log
      setNotifications(data.notifications || []);
      setError('');
    } catch (err) {
      console.error('Error fetching influencer notifications:', err);
      if (err.message.includes('Failed to fetch')) {
        setError('Cannot connect to server. Please check your internet connection and ensure the backend is running.');
      } else {
        setError(err.message || 'Failed to load notifications. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/api/influencer/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to mark as read: ${response.status}`);
      }

      setNotifications(prev => prev.map(notif => 
        notif._id === notificationId ? { ...notif, is_read: true } : notif
      ));
      
      setSuccess('Notification marked as read');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/api/influencer/notifications/read-all`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to mark all as read: ${response.status}`);
      }

      setNotifications(prev => prev.map(notif => ({ ...notif, is_read: true })));
      
      setSuccess('All notifications marked as read');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to mark all notifications as read');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/api/influencer/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to delete: ${response.status}`);
      }

      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
      setDeleteDialog(null);
      setSuccess('Notification deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete notification');
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsRead(notification._id);
    }

    if (notification.action_url) {
      // Use your app's navigation method
      if (notification.action_url.startsWith('/')) {
        window.location.href = notification.action_url;
      } else {
        window.open(notification.action_url, '_blank');
      }
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (tabValue === 0) return true;
    if (tabValue === 1) return !notification.is_read;
    if (tabValue === 2) return notification.type === 'application_status';
    if (tabValue === 3) return notification.type === 'campaign_invitation';
    if (tabValue === 4) return notification.type === 'payment_received';
    return notification.priority === ['urgent', 'high', 'medium', 'low'][tabValue - 5];
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getTypeConfig = (type) => {
    return typeConfig[type] || typeConfig.default;
  };

  const getPriorityConfig = (priority) => {
    return priorityConfig[priority] || priorityConfig.medium;
  };

  const getStatusChip = (metadata) => {
    if (metadata?.status && statusColors[metadata.status]) {
      return (
        <Chip
          label={metadata.status.charAt(0).toUpperCase() + metadata.status.slice(1)}
          size="small"
          color={statusColors[metadata.status]}
          variant="outlined"
          sx={{ ml: 1 }}
        />
      );
    }
    return null;
  };

  const handleRetry = () => {
    setError('');
    setLoading(true);
    fetchNotifications();
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px" flexDirection="column" gap={2}>
          <CircularProgress />
          <Typography variant="body1" color="text.secondary">
            Loading notifications...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box display="flex" alignItems="center" gap={2}>
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon fontSize="large" color="primary" />
          </Badge>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Notifications
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Stay updated on your campaigns, applications, and earnings
            </Typography>
          </Box>
        </Box>
        
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchNotifications}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="contained"
              startIcon={<ReadIcon />}
              onClick={markAllAsRead}
            >
              Mark All Read
            </Button>
          )}
        </Box>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }} 
          action={
            <Button color="inherit" size="small" onClick={handleRetry}>
              RETRY
            </Button>
          }
        >
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Stats Summary */}
      {notifications.length > 0 && (
        <Box display="flex" gap={2} mb={3} flexWrap="wrap">
          <Chip
            icon={<NotificationsIcon />}
            label={`Total: ${notifications.length}`}
            variant="outlined"
          />
          <Chip
            icon={<WarningIcon />}
            label={`Unread: ${unreadCount}`}
            color={unreadCount > 0 ? "error" : "default"}
            variant="outlined"
          />
          <Chip
            icon={<CampaignIcon />}
            label={`Applications: ${notifications.filter(n => n.type === 'application_status').length}`}
            variant="outlined"
          />
          <Chip
            icon={<PaymentIcon />}
            label={`Payments: ${notifications.filter(n => n.type === 'payment_received').length}`}
            variant="outlined"
          />
          <Chip
            icon={<PersonIcon />}
            label={`Invitations: ${notifications.filter(n => n.type === 'campaign_invitation').length}`}
            variant="outlined"
          />
        </Box>
      )}

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons="auto"
        >
          <Tab label={`All (${notifications.length})`} />
          <Tab label={
            <Badge badgeContent={unreadCount} color="error" sx={{ '& .MuiBadge-badge': { right: -8, top: -8 } }}>
              Unread
            </Badge>
          } />
          <Tab label="Applications" />
          <Tab label="Invitations" />
          <Tab label="Payments" />
          <Tab label="Urgent" />
          <Tab label="High" />
          <Tab label="Medium" />
          <Tab label="Low" />
        </Tabs>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {filteredNotifications.length === 0 ? (
            <Box textAlign="center" py={6}>
              <NotificationsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No notifications found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {tabValue === 1 ? "You're all caught up! No unread notifications." : "No notifications match your current filter."}
              </Typography>
              <Button variant="outlined" onClick={fetchNotifications}>
                Refresh Notifications
              </Button>
            </Box>
          ) : (
            <List>
              {filteredNotifications.map((notification) => {
                const typeConfig = getTypeConfig(notification.type);
                const priorityConfig = getPriorityConfig(notification.priority);
                
                return (
                  <ListItem
                    key={notification._id}
                    alignItems="flex-start"
                    sx={{
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      backgroundColor: notification.is_read ? 'transparent' : 'action.hover',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                        transform: 'translateY(-1px)',
                        transition: 'all 0.2s ease-in-out'
                      },
                      cursor: notification.action_url ? 'pointer' : 'default',
                      transition: 'all 0.2s ease-in-out'
                    }}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <ListItemIcon sx={{ minWidth: 48 }}>
                      <Badge
                        color="error"
                        variant="dot"
                        invisible={notification.is_read}
                      >
                        <Avatar
                          sx={{
                            bgcolor: `${typeConfig.color}.main`,
                            width: 40,
                            height: 40
                          }}
                        >
                          {typeConfig.icon}
                        </Avatar>
                      </Badge>
                    </ListItemIcon>
                    
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1} mb={0.5} flexWrap="wrap">
                          <Typography 
                            variant="subtitle1" 
                            component="span"
                            sx={{ 
                              fontWeight: notification.is_read ? 'normal' : 'bold',
                              color: notification.is_read ? 'text.primary' : 'primary.main'
                            }}
                          >
                            {notification.title}
                          </Typography>
                          <Chip
                            label={notification.priority}
                            size="small"
                            color={priorityConfig.color}
                            variant="outlined"
                          />
                          {getStatusChip(notification.metadata)}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography 
                            variant="body2" 
                            color="text.primary" 
                            paragraph
                            sx={{ opacity: notification.is_read ? 0.8 : 1 }}
                          >
                            {notification.message}
                          </Typography>
                          
                          {/* Metadata Display */}
                          {notification.metadata && (
                            <Box display="flex" gap={1} flexWrap="wrap" mb={1}>
                              {notification.metadata.campaign_title && (
                                <Chip
                                  label={`Campaign: ${notification.metadata.campaign_title}`}
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                              {notification.metadata.brand_name && (
                                <Chip
                                  label={`Brand: ${notification.metadata.brand_name}`}
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                              {notification.metadata.amount && (
                                <Chip
                                  label={`Amount: $${notification.metadata.amount}`}
                                  size="small"
                                  color="success"
                                  variant="outlined"
                                />
                              )}
                              {notification.metadata.days_remaining && (
                                <Chip
                                  label={`${notification.metadata.days_remaining} days remaining`}
                                  size="small"
                                  color="warning"
                                  variant="outlined"
                                />
                              )}
                              {notification.metadata.status && (
                                <Chip
                                  label={`Status: ${notification.metadata.status}`}
                                  size="small"
                                  color={statusColors[notification.metadata.status] || 'default'}
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          )}
                          
                          <Typography variant="caption" color="text.secondary">
                            {formatDistanceToNow(parseISO(notification.created_at), { addSuffix: true })}
                          </Typography>
                        </Box>
                      }
                    />
                    
                    <ListItemSecondaryAction>
                      <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} gap={0.5}>
                        {!notification.is_read && (
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification._id);
                            }}
                            title="Mark as read"
                            color="primary"
                          >
                            <ReadIcon fontSize="small" />
                          </IconButton>
                        )}
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteDialog(notification._id);
                          }}
                          title="Delete notification"
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                );
              })}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteDialog}
        onClose={() => setDeleteDialog(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Notification</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this notification? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(null)}>Cancel</Button>
          <Button
            onClick={() => deleteNotification(deleteDialog)}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default InfluencerNotification;