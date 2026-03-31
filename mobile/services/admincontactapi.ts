import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Types
export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  submitted_at: string;
  status: 'new' | 'read' | 'replied';
  read: boolean;
}

export interface ContactSubmissionData {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export interface ContactSubmissionResponse {
  message: string;
  submission_id: string;
}

export interface ContactMessagesResponse {
  success: boolean;
  data: ContactMessage[];
}

export interface MarkReadResponse {
  success: boolean;
  message: string;
}

export interface ContactStats {
  total: number;
  unread: number;
  read: number;
  replied: number;
}

// API Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || (Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000');

class AdminContactAPI {
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
   * Submit new contact form (public)
   */
  async submitContactForm(data: ContactSubmissionData): Promise<ContactSubmissionResponse> {
    try {
      const response = await this.api.post('/contact', data);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get all contact messages (admin only)
   */
  async getContactMessages(): Promise<ContactMessage[]> {
    try {
      const response = await this.api.get('/contact/messages');
      const result: ContactMessagesResponse = response.data;
      return result.data || [];
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Mark a message as read (admin only)
   */
  async markMessageAsRead(messageId: string): Promise<MarkReadResponse> {
    try {
      const response = await this.api.put(`/contact/mark-read/${messageId}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get contact statistics
   */
  getContactStats(messages: ContactMessage[]): ContactStats {
    const stats: ContactStats = {
      total: messages.length,
      unread: 0,
      read: 0,
      replied: 0,
    };

    messages.forEach((message) => {
      if (!message.read) {
        stats.unread++;
      } else {
        stats.read++;
      }
      if (message.status === 'replied') {
        stats.replied++;
      }
    });

    return stats;
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
   * Filter messages by read status
   */
  filterByReadStatus(messages: ContactMessage[], unreadOnly: boolean): ContactMessage[] {
    if (!unreadOnly) return messages;
    return messages.filter(msg => !msg.read);
  }

  /**
   * Search messages by name, email, or message content
   */
  searchMessages(messages: ContactMessage[], searchText: string): ContactMessage[] {
    if (!searchText.trim()) return messages;
    const searchLower = searchText.toLowerCase();
    return messages.filter(msg =>
      msg.name.toLowerCase().includes(searchLower) ||
      msg.email.toLowerCase().includes(searchLower) ||
      (msg.subject && msg.subject.toLowerCase().includes(searchLower)) ||
      msg.message.toLowerCase().includes(searchLower)
    );
  }

  /**
   * Get status color for display
   */
  getStatusColor(read: boolean, status: string): string {
    if (status === 'replied') return '#4CAF50';
    if (!read) return '#F44336';
    return '#9E9E9E';
  }

  /**
   * Get status background color (light)
   */
  getStatusBackgroundColor(read: boolean, status: string): string {
    if (status === 'replied') return '#E8F5E9';
    if (!read) return '#FFEBEE';
    return '#F5F5F5';
  }

  /**
   * Get status label
   */
  getStatusLabel(read: boolean, status: string): string {
    if (status === 'replied') return 'Replied';
    if (!read) return 'Unread';
    return 'Read';
  }
}

export default new AdminContactAPI();