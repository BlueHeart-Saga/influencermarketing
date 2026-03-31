// C:\Sagadevan\quickbox\mobile\services\influencerNotificationAPI.ts
import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

// Types
export interface InfluencerNotification {
  _id: string;
  influencer_id: string;
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  is_read: boolean;
  action_url?: string;
  metadata?: {
    campaign_id?: string;
    campaign_title?: string;
    brand_name?: string;
    amount?: number;
    status?: string;
    days_remaining?: number;
    hours_remaining?: number;
    match_reason?: string;
    completion_percentage?: number;
    missing_fields?: string[];
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

export interface NotificationsResponse {
  notifications: InfluencerNotification[];
  unread_count: number;
  total: number;
}

export interface NotificationStats {
  total_count: number;
  unread_count: number;
  read_count: number;
  by_type: {
    application_updates: number;
    payment_updates: number;
    messages: number;
    other: number;
  };
}

export interface RealTimeNotificationsResponse {
  real_time_alerts: InfluencerNotification[];
  total_alerts: number;
  last_updated: string;
}

// Create axios instance with default config
const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  // Request interceptor to add auth token
  instance.interceptors.request.use(
    async (config) => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        if (__DEV__) {
          console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
        }
        
        return config;
      } catch (error) {
        return config;
      }
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor for error handling
  instance.interceptors.response.use(
    (response) => {
      if (__DEV__) {
        console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`);
      }
      return response;
    },
    async (error) => {
      if (__DEV__) {
        console.error('❌ API Error:', {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          data: error.response?.data,
        });
      }

      // Handle token expiration
      if (error.response?.status === 401) {
        try {
          const refreshToken = await AsyncStorage.getItem('refresh_token');
          if (refreshToken) {
            const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
              refresh_token: refreshToken,
            });
            
            if (response.data.access_token) {
              await AsyncStorage.setItem('access_token', response.data.access_token);
              error.config.headers.Authorization = `Bearer ${response.data.access_token}`;
              return axios(error.config);
            }
          }
        } catch (refreshError) {
          // Refresh failed, clear tokens
          await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

// Influencer Notification API Class
class InfluencerNotificationAPI {
  private api: AxiosInstance;

  constructor() {
    this.api = createAxiosInstance();
  }

  /**
   * Get influencer notifications
   * @param skip Number of notifications to skip
   * @param limit Maximum number of notifications to return
   * @param unreadOnly Only fetch unread notifications
   */
  async getNotifications(
    skip: number = 0,
    limit: number = 100,
    unreadOnly: boolean = false
  ): Promise<NotificationsResponse> {
    try {
      const response = await this.api.get('/influencer/notifications', {
        params: { skip, limit, unread_only: unreadOnly }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching influencer notifications:', error);
      throw error;
    }
  }

  /**
   * Mark a notification as read
   * @param notificationId ID of the notification to mark as read
   */
  async markAsRead(notificationId: string): Promise<{ message: string }> {
    try {
      const response = await this.api.post(`/influencer/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<{ message: string }> {
    try {
      const response = await this.api.post('/influencer/notifications/read-all');
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Delete a notification
   * @param notificationId ID of the notification to delete
   */
  async deleteNotification(notificationId: string): Promise<{ message: string }> {
    try {
      const response = await this.api.delete(`/influencer/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(): Promise<NotificationStats> {
    try {
      const response = await this.api.get('/influencer/notifications/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      throw error;
    }
  }

  /**
   * Get real-time notifications for dashboard
   * @param limit Maximum number of real-time alerts to return
   */
  async getRealTimeNotifications(limit: number = 20): Promise<RealTimeNotificationsResponse> {
    try {
      const response = await this.api.get('/influencer/notifications/real-time', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching real-time notifications:', error);
      throw error;
    }
  }

  /**
   * Create a test notification (for debugging)
   */
  async createTestNotification(): Promise<{ message: string; notification: InfluencerNotification }> {
    try {
      const response = await this.api.post('/influencer/notifications/test');
      return response.data;
    } catch (error) {
      console.error('Error creating test notification:', error);
      throw error;
    }
  }

  /**
   * Clean up old notifications
   * @param daysOld Age in days for notifications to clean up
   */
  async cleanupOldNotifications(daysOld: number = 30): Promise<{
    message: string;
    cleaned_count: number;
  }> {
    try {
      const response = await this.api.post('/influencer/notifications/cleanup', null, {
        params: { days_old: daysOld }
      });
      return response.data;
    } catch (error) {
      console.error('Error cleaning up notifications:', error);
      throw error;
    }
  }

  /**
   * Format notification for display
   */
  formatNotification(notification: InfluencerNotification): InfluencerNotification & {
    formatted_date: string;
    priority_color: string;
    priority_label: string;
    type_label: string;
    type_icon: string;
    type_color: string;
  } {
    const priorityColors: Record<string, string> = {
      low: '#9E9E9E',
      medium: '#2196F3',
      high: '#FF9800',
      urgent: '#F44336'
    };

    const priorityLabels: Record<string, string> = {
      low: 'Low Priority',
      medium: 'Medium Priority',
      high: 'High Priority',
      urgent: 'Urgent'
    };

    const typeLabels: Record<string, string> = {
      registration_success: 'Welcome',
      login_alert: 'Login Alert',
      google_login: 'Google Login',
      profile_incomplete: 'Profile Required',
      profile_approved: 'Profile Approved',
      password_change: 'Password Changed',
      application_status: 'Application Update',
      new_campaign_match: 'New Match',
      campaign_invitation: 'Campaign Invitation',
      campaign_reminder: 'Campaign Reminder',
      campaign_urgent: 'Urgent Campaign',
      payment_received: 'Payment Received',
      payment_pending: 'Payment Processing',
      earning_milestone: 'Milestone Achieved',
      new_message: 'New Message',
      brand_response: 'Brand Response',
      performance_insight: 'Performance Insight',
      engagement_boost: 'Engagement Boost',
      platform_update: 'Platform Update',
      tip_suggestion: 'Pro Tip',
      default: 'Notification'
    };

    const typeIcons: Record<string, string> = {
      registration_success: 'checkmark-circle-outline',
      login_alert: 'lock-open-outline',
      google_login: 'logo-google',
      profile_incomplete: 'person-outline',
      profile_approved: 'checkmark-done-circle-outline',
      password_change: 'key-outline',
      application_status: 'document-text-outline',
      new_campaign_match: 'megaphone-outline',
      campaign_invitation: 'mail-outline',
      campaign_reminder: 'time-outline',
      campaign_urgent: 'alert-circle-outline',
      payment_received: 'cash-outline',
      payment_pending: 'hourglass-outline',
      earning_milestone: 'trophy-outline',
      new_message: 'chatbubble-outline',
      brand_response: 'chatbubble-ellipses-outline',
      performance_insight: 'trending-up-outline',
      engagement_boost: 'rocket-outline',
      platform_update: 'cloud-upload-outline',
      tip_suggestion: 'bulb-outline',
      default: 'notifications-outline'
    };

    const typeColors: Record<string, string> = {
      registration_success: '#4CAF50',
      login_alert: '#2196F3',
      google_login: '#DB4437',
      profile_incomplete: '#FF9800',
      profile_approved: '#4CAF50',
      password_change: '#9C27B0',
      application_status: '#2196F3',
      new_campaign_match: '#FF9800',
      campaign_invitation: '#9C27B0',
      campaign_reminder: '#FF9800',
      campaign_urgent: '#F44336',
      payment_received: '#4CAF50',
      payment_pending: '#FFC107',
      earning_milestone: '#FFD700',
      new_message: '#2196F3',
      brand_response: '#4CAF50',
      performance_insight: '#00BCD4',
      engagement_boost: '#FF5722',
      platform_update: '#607D8B',
      tip_suggestion: '#795548',
      default: '#9E9E9E'
    };

    const date = new Date(notification.created_at);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    let formatted_date: string;
    if (diffMins < 1) formatted_date = 'Just now';
    else if (diffMins < 60) formatted_date = `${diffMins}m ago`;
    else if (diffHours < 24) formatted_date = `${diffHours}h ago`;
    else if (diffDays < 7) formatted_date = `${diffDays}d ago`;
    else formatted_date = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return {
      ...notification,
      formatted_date,
      priority_color: priorityColors[notification.priority] || '#9E9E9E',
      priority_label: priorityLabels[notification.priority] || 'Normal',
      type_label: typeLabels[notification.type] || typeLabels.default,
      type_icon: typeIcons[notification.type] || typeIcons.default,
      type_color: typeColors[notification.type] || typeColors.default
    };
  }

  /**
   * Group notifications by date
   */
  groupNotificationsByDate(notifications: InfluencerNotification[]): Record<string, InfluencerNotification[]> {
    const grouped: Record<string, InfluencerNotification[]> = {};
    
    notifications.forEach(notification => {
      const date = new Date(notification.created_at).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(notification);
    });
    
    return grouped;
  }

  /**
   * Get status chip color for application status
   */
  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      approved: '#4CAF50',
      rejected: '#F44336',
      pending: '#FF9800',
      reviewing: '#2196F3',
      shortlisted: '#9C27B0',
      contracted: '#00BCD4',
      completed: '#4CAF50'
    };
    return colors[status] || '#9E9E9E';
  }

  /**
   * Get status chip label
   */
  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      approved: 'Approved',
      rejected: 'Rejected',
      pending: 'Pending',
      reviewing: 'Under Review',
      shortlisted: 'Shortlisted',
      contracted: 'Contract Signed',
      completed: 'Completed'
    };
    return labels[status] || status;
  }

  /**
   * Clear all notification-related cache
   */
  async clearCache(): Promise<void> {
    try {
      // Implement cache clearing logic if needed
      console.log('Influencer notification cache cleared');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
}

// Export a singleton instance
export const influencerNotificationAPI = new InfluencerNotificationAPI();

// Also export the class for testing or custom instances
export default InfluencerNotificationAPI;