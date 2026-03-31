import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Types
export type FeedbackType = 'general' | 'bug' | 'feature' | 'help';
export type FeedbackStatus = 'new' | 'reviewed' | 'in_progress' | 'resolved';

export interface Feedback {
  _id: string;
  message: string;
  type: FeedbackType;
  page_url?: string;
  email?: string;
  created_at: string;
  updated_at?: string;
  status: FeedbackStatus;
}

export interface SubmitFeedbackData {
  message: string;
  type?: FeedbackType;
  page_url?: string;
  email?: string;
}

export interface FeedbackStats {
  total: number;
  new: number;
  reviewed: number;
  in_progress: number;
  resolved: number;
  byType: {
    general: number;
    bug: number;
    feature: number;
    help: number;
  };
}

export interface UpdateStatusResponse {
  message: string;
}

export interface SubmitFeedbackResponse {
  message: string;
  id: string;
}

// API Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || (Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000');

class AdminFeedbackAPI {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/api`,
      timeout: 30000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        try {
          const token = await AsyncStorage.getItem('access_token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.error('Error getting token:', error);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  private handleError(error: any): never {
    if (error.response) {
      throw new Error(error.response.data?.detail || error.response.data?.message || 'API request failed');
    } else if (error.request) {
      throw new Error('No response from server. Please check your connection.');
    } else {
      throw new Error(error.message || 'Request failed');
    }
  }

  /**
   * Get all feedback (admin only)
   */
  async getAllFeedback(): Promise<Feedback[]> {
    try {
      const response = await this.api.get('/feedback');
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get feedback by ID
   */
  async getFeedbackById(feedbackId: string): Promise<Feedback> {
    try {
      const response = await this.api.get(`/feedback/${feedbackId}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Update feedback status
   */
  async updateFeedbackStatus(feedbackId: string, status: FeedbackStatus): Promise<UpdateStatusResponse> {
    try {
      const response = await this.api.put(`/feedback/${feedbackId}/status?status=${status}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Submit new feedback (public)
   */
  async submitFeedback(data: SubmitFeedbackData): Promise<SubmitFeedbackResponse> {
    try {
      const response = await this.api.post('/feedback', data);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get feedback statistics
   */
  getFeedbackStats(feedbackList: Feedback[]): FeedbackStats {
    const stats: FeedbackStats = {
      total: feedbackList.length,
      new: 0,
      reviewed: 0,
      in_progress: 0,
      resolved: 0,
      byType: {
        general: 0,
        bug: 0,
        feature: 0,
        help: 0,
      },
    };

    feedbackList.forEach((item) => {
      // Count by status
      switch (item.status) {
        case 'new':
          stats.new++;
          break;
        case 'reviewed':
          stats.reviewed++;
          break;
        case 'in_progress':
          stats.in_progress++;
          break;
        case 'resolved':
          stats.resolved++;
          break;
      }

      // Count by type
      switch (item.type) {
        case 'general':
          stats.byType.general++;
          break;
        case 'bug':
          stats.byType.bug++;
          break;
        case 'feature':
          stats.byType.feature++;
          break;
        case 'help':
          stats.byType.help++;
          break;
      }
    });

    return stats;
  }

  /**
   * Get status color for display
   */
  getStatusColor(status: FeedbackStatus): string {
    switch (status) {
      case 'new': return '#F44336';
      case 'reviewed': return '#2196F3';
      case 'in_progress': return '#FF9800';
      case 'resolved': return '#4CAF50';
      default: return '#9E9E9E';
    }
  }

  /**
   * Get status background color (light)
   */
  getStatusBackgroundColor(status: FeedbackStatus): string {
    switch (status) {
      case 'new': return '#FFEBEE';
      case 'reviewed': return '#E3F2FD';
      case 'in_progress': return '#FFF3E0';
      case 'resolved': return '#E8F5E9';
      default: return '#F5F5F5';
    }
  }

  /**
   * Get status label
   */
  getStatusLabel(status: FeedbackStatus): string {
    switch (status) {
      case 'new': return 'New';
      case 'reviewed': return 'Reviewed';
      case 'in_progress': return 'In Progress';
      case 'resolved': return 'Resolved';
      default: return status;
    }
  }

  /**
   * Get type color
   */
  getTypeColor(type: FeedbackType): string {
    switch (type) {
      case 'general': return '#9E9E9E';
      case 'bug': return '#F44336';
      case 'feature': return '#4CAF50';
      case 'help': return '#2196F3';
      default: return '#9E9E9E';
    }
  }

  /**
   * Get type icon name
   */
  getTypeIcon(type: FeedbackType): string {
    switch (type) {
      case 'general': return 'chatbubble-outline';
      case 'bug': return 'bug-outline';
      case 'feature': return 'bulb-outline';
      case 'help': return 'help-circle-outline';
      default: return 'chatbubble-outline';
    }
  }

  /**
   * Get type label
   */
  getTypeLabel(type: FeedbackType): string {
    switch (type) {
      case 'general': return 'General';
      case 'bug': return 'Bug Report';
      case 'feature': return 'Feature Request';
      case 'help': return 'Help';
      default: return type;
    }
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Get relative time (e.g., "2 hours ago")
   */
  getRelativeTime(dateString: string): string {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return this.formatDate(dateString);
  }

  /**
   * Filter feedback by status
   */
  filterByStatus(feedbackList: Feedback[], status: FeedbackStatus | 'all'): Feedback[] {
    if (status === 'all') return feedbackList;
    return feedbackList.filter(item => item.status === status);
  }

  /**
   * Filter feedback by type
   */
  filterByType(feedbackList: Feedback[], type: FeedbackType | 'all'): Feedback[] {
    if (type === 'all') return feedbackList;
    return feedbackList.filter(item => item.type === type);
  }

  /**
   * Search feedback by message or email
   */
  searchFeedback(feedbackList: Feedback[], searchText: string): Feedback[] {
    if (!searchText.trim()) return feedbackList;
    const searchLower = searchText.toLowerCase();
    return feedbackList.filter(item =>
      item.message.toLowerCase().includes(searchLower) ||
      (item.email && item.email.toLowerCase().includes(searchLower))
    );
  }
}

export default new AdminFeedbackAPI();