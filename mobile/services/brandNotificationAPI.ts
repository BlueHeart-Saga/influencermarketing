// C:\Sagadevan\quickbox\mobile\services\brandNotificationAPI.ts
import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://quickbox-backend-docker-b9cbaye9a3bvhad5.southindia-01.azurewebsites.net';

// Types
export interface Notification {
  _id: string;
  brand_id: string;
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  is_read: boolean;
  action_url?: string;
  metadata?: {
    campaign_id?: string;
    campaign_title?: string;
    influencer_username?: string;
    amount?: number;
    plan?: string;
    days_remaining?: number;
    [key: string]: any;
  };
  real_time_alert?: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unread_count: number;
  total: number;
}

export interface NotificationStats {
  total_count: number;
  unread_count: number;
  high_priority_count: number;
  urgent_priority_count: number;
  read_count: number;
}

export interface RealTimeNotificationsResponse {
  real_time_alerts: Notification[];
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

// Brand Notification API Class
class BrandNotificationAPI {
  private api: AxiosInstance;

  constructor() {
    this.api = createAxiosInstance();
  }

  /**
   * Get brand notifications
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
      const response = await this.api.get('/brand/notifications', {
        params: { skip, limit, unread_only: unreadOnly }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  /**
   * Mark a notification as read
   * @param notificationId ID of the notification to mark as read
   */
  async markAsRead(notificationId: string): Promise<{ message: string }> {
    try {
      const response = await this.api.post(`/brand/notifications/${notificationId}/read`);
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
      const response = await this.api.post('/brand/notifications/read-all');
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
      const response = await this.api.delete(`/brand/notifications/${notificationId}`);
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
      const response = await this.api.get('/brand/notifications/stats');
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
      const response = await this.api.get('/brand/notifications/real-time', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching real-time notifications:', error);
      throw error;
    }
  }

  /**
   * Get campaign notifications summary
   */
  async getCampaignNotificationsSummary(): Promise<{
    campaign_notifications_summary: Record<string, number>;
    total_campaign_notifications: number;
    unread_campaign_notifications: number;
  }> {
    try {
      const response = await this.api.get('/brand/notifications/campaigns/summary');
      return response.data;
    } catch (error) {
      console.error('Error fetching campaign notifications summary:', error);
      throw error;
    }
  }

  /**
   * Clean up old notifications (admin only)
   * @param daysOld Age in days for notifications to clean up
   */
  async cleanupOldNotifications(daysOld: number = 30): Promise<{
    message: string;
    cleaned_count: number;
  }> {
    try {
      const response = await this.api.post('/brand/notifications/cleanup', null, {
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
  formatNotification(notification: Notification): Notification & {
    formatted_date: string;
    priority_color: string;
    icon_name: string;
  } {
    const priorityColors: Record<string, string> = {
      low: '#9E9E9E',
      medium: '#2196F3',
      high: '#FF9800',
      urgent: '#F44336'
    };

    const iconNames: Record<string, string> = {
      campaign_application: 'megaphone-outline',
      campaign_approved: 'checkmark-circle-outline',
      subscription_update: 'card-outline',
      trial_ending: 'alert-circle-outline',
      payment_success: 'cash-outline',
      payment_failed: 'close-circle-outline',
      new_message: 'chatbubble-outline',
      campaign_completed: 'checkmark-done-circle-outline',
      default: 'notifications-outline'
    };

    return {
      ...notification,
      formatted_date: new Date(notification.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      priority_color: priorityColors[notification.priority] || '#9E9E9E',
      icon_name: iconNames[notification.type] || iconNames.default
    };
  }

  /**
   * Group notifications by date
   */
  groupNotificationsByDate(notifications: Notification[]): Record<string, Notification[]> {
    const grouped: Record<string, Notification[]> = {};
    
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
   * Get notification priority label
   */
  getPriorityLabel(priority: string): string {
    const labels: Record<string, string> = {
      low: 'Low Priority',
      medium: 'Medium Priority',
      high: 'High Priority',
      urgent: 'Urgent'
    };
    return labels[priority] || 'Normal';
  }

  /**
   * Get notification type label
   */
  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      campaign_application: 'New Application',
      campaign_approved: 'Application Approved',
      campaign_created: 'Campaign Created',
      campaign_status_change: 'Status Update',
      campaign_performance: 'Performance Update',
      subscription_update: 'Subscription Update',
      trial_ending: 'Trial Ending Soon',
      payment_success: 'Payment Received',
      payment_failed: 'Payment Failed',
      payment_pending: 'Payment Pending',
      new_message: 'New Message',
      media_submitted: 'Media Submitted',
      media_approved: 'Media Approved',
      profile_incomplete: 'Profile Incomplete',
      profile_updated: 'Profile Updated',
      dashboard_alert: 'Dashboard Alert',
      system_update: 'System Update',
      default: 'Notification'
    };
    return labels[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Clear all notification-related cache
   */
  async clearCache(): Promise<void> {
    try {
      // Implement cache clearing logic if needed
      console.log('Brand notification cache cleared');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
}

// Export a singleton instance
export const brandNotificationAPI = new BrandNotificationAPI();

// Also export the class for testing or custom instances
export default BrandNotificationAPI;