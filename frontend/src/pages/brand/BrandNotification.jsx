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
  useMediaQuery
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  MarkEmailRead as ReadIcon,
  Delete as DeleteIcon,
  Campaign as CampaignIcon,
  Payment as PaymentIcon,
  Message as MessageIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { formatDistanceToNow, parseISO } from 'date-fns';
import SubscriptionsIcon from "@mui/icons-material/Subscriptions";

// API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const BrandNotification = () => {
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

  // Notification type icons
  const typeIcons = {
    campaign_application: <CampaignIcon />,
    campaign_approved: <CheckCircleIcon />,
    subscription_update: <SubscriptionsIcon />,
    trial_ending: <WarningIcon />,
    payment_success: <PaymentIcon />,
    payment_failed: <ErrorIcon />,
    new_message: <MessageIcon />,
    campaign_completed: <CheckCircleIcon />,
    default: <NotificationsIcon />
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

      const response = await fetch(`${API_BASE_URL}/api/brand/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        setError('Session expired. Please log in again.');
        localStorage.removeItem('access_token');
        // Redirect to login or show login modal
        return;
      }

      if (response.status === 403) {
        setError('Access denied. You must be a brand to view these notifications.');
        return;
      }

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Fetched notifications:', data); // Debug log
      setNotifications(data.notifications || []);
      setError('');
    } catch (err) {
      console.error('Error fetching notifications:', err);
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
      const response = await fetch(`${API_BASE_URL}/api/brand/notifications/${notificationId}/read`, {
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

      // Update local state
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
      const response = await fetch(`${API_BASE_URL}/api/brand/notifications/read-all`, {
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

      // Update local state
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
      const response = await fetch(`${API_BASE_URL}/api/brand/notifications/${notificationId}`, {
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

      // Remove from local state
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
      setDeleteDialog(null);
      setSuccess('Notification deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete notification');
    }
  };

  const handleNotificationClick = (notification) => {
    // Mark as read when clicked
    if (!notification.is_read) {
      markAsRead(notification._id);
    }

    // Navigate to action URL if available
    if (notification.action_url) {
      // Use your app's navigation method (React Router, window.location, etc.)
      if (notification.action_url.startsWith('/')) {
        // Internal navigation
        window.location.href = notification.action_url;
      } else {
        // External URL
        window.open(notification.action_url, '_blank');
      }
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (tabValue === 0) return true; // All
    if (tabValue === 1) return !notification.is_read; // Unread
    return notification.priority === ['urgent', 'high', 'medium', 'low'][tabValue - 2];
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getTypeIcon = (type) => {
    return typeIcons[type] || typeIcons.default;
  };

  const getPriorityConfig = (priority) => {
    return priorityConfig[priority] || priorityConfig.medium;
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
              Manage your campaign and account notifications
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
            label={`Campaigns: ${notifications.filter(n => n.type.includes('campaign')).length}`}
            variant="outlined"
          />
          <Chip
            icon={<PaymentIcon />}
            label={`Payments: ${notifications.filter(n => n.type.includes('payment')).length}`}
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
              {filteredNotifications.map((notification) => (
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
                      {getTypeIcon(notification.type)}
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
                          color={getPriorityConfig(notification.priority).color}
                          variant="outlined"
                        />
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
                        {notification.metadata && Object.keys(notification.metadata).length > 0 && (
                          <Box display="flex" gap={1} flexWrap="wrap" mb={1}>
                            {notification.metadata.campaign_title && (
                              <Chip
                                label={`Campaign: ${notification.metadata.campaign_title}`}
                                size="small"
                                variant="outlined"
                              />
                            )}
                            {notification.metadata.influencer_username && (
                              <Chip
                                label={`Influencer: ${notification.metadata.influencer_username}`}
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
              ))}
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

export default BrandNotification;