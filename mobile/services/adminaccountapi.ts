import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Types
export interface BankAccount {
  _id?: string;
  user_id: string;
  account_holder_name: string;
  account_number: string;
  ifsc_code: string;
  bank_name?: string;
  branch_name?: string;
  account_type: 'savings' | 'current' | 'other';
  is_primary: boolean;
  is_verified: boolean;
  verification_status?: 'pending' | 'verified' | 'failed';
  created_at?: string;
  updated_at?: string;
}

export interface User {
  user_id: string;
  name?: string;
  email: string;
  phone?: string;
  role: 'brand' | 'influencer' | 'admin';
  is_suspended: boolean;
  created_at?: string;
  last_login?: string;
  verified?: boolean;
  
  // Brand specific fields
  company_name?: string;
  industry?: string;
  company_size?: string;
  website?: string;
  
  // Influencer specific fields
  nickname?: string;
  followers?: number;
  engagement_rate?: number;
  primary_platform?: string;
  bio?: string;
  social_media_links?: Record<string, string>;
  categories?: string[];
  
  // Bank accounts
  bank_accounts?: BankAccount[];
}

export interface UserStats {
  total_users: number;
  influencers: number;
  brands: number;
  admins: number;
  suspended: number;
  active: number;
  users_with_bank: number;
  users_without_bank: number;
}

export interface SuspendResponse {
  message: string;
  user_id: string;
  suspended: boolean;
}

export interface ExportResponse {
  success: boolean;
  message: string;
  download_url?: string;
}

export interface FilterOptions {
  search: string;
  role: 'all' | 'brand' | 'influencer' | 'admin';
  status: 'all' | 'active' | 'suspended';
  bank_status: 'all' | 'has_bank' | 'no_bank';
}

// API Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || (Platform.OS === 'android' ? 'https://quickbox-backend-docker-b9cbaye9a3bvhad5.southindia-01.azurewebsites.net' : 'https://quickbox-backend-docker-b9cbaye9a3bvhad5.southindia-01.azurewebsites.net');

class AdminAccountAPI {
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

  // ==================== USER MANAGEMENT ====================

  /**
   * Get all users with bank account information
   */
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await this.api.get('/account/report/all-users');
      return response.data || [];
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get user details by ID
   */
  async getUserById(userId: string): Promise<User> {
    try {
      const response = await this.api.get(`/account/user/${userId}`);
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get user bank accounts
   */
  async getUserBankAccounts(userId: string): Promise<BankAccount[]> {
    try {
      const response = await this.api.get(`/account/user/${userId}/bank-accounts`);
      return response.data.data || response.data || [];
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Suspend a user
   */
  async suspendUser(userId: string): Promise<SuspendResponse> {
    try {
      const response = await this.api.put(`/account/suspend-user/${userId}`);
      return { message: response.data.message, user_id: userId, suspended: true };
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Unsuspend a user
   */
  async unsuspendUser(userId: string): Promise<SuspendResponse> {
    try {
      const response = await this.api.put(`/account/unsuspend-user/${userId}`);
      return { message: response.data.message, user_id: userId, suspended: false };
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(users: User[]): Promise<UserStats> {
    const stats: UserStats = {
      total_users: users.length,
      influencers: users.filter(u => u.role === 'influencer').length,
      brands: users.filter(u => u.role === 'brand').length,
      admins: users.filter(u => u.role === 'admin').length,
      suspended: users.filter(u => u.is_suspended).length,
      active: users.filter(u => !u.is_suspended).length,
      users_with_bank: users.filter(u => u.bank_accounts && u.bank_accounts.length > 0).length,
      users_without_bank: users.filter(u => !u.bank_accounts || u.bank_accounts.length === 0).length,
    };
    return stats;
  }

  // ==================== EXPORT FUNCTIONALITY ====================

  /**
   * Export users data as CSV
   */
  async exportUsersCSV(): Promise<Blob> {
    try {
      const response = await this.api.get('/account/report/all-users/csv', {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // ==================== FILTERING & SEARCH ====================

  /**
   * Filter users based on criteria
   */
  filterUsers(users: User[], filters: FilterOptions): User[] {
    let filtered = [...users];

    // Search filter
    if (filters.search.trim()) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(user =>
        (user.name?.toLowerCase().includes(searchLower)) ||
        (user.email?.toLowerCase().includes(searchLower)) ||
        (user.company_name?.toLowerCase().includes(searchLower)) ||
        (user.nickname?.toLowerCase().includes(searchLower)) ||
        (user.phone?.toLowerCase().includes(searchLower))
      );
    }

    // Role filter
    if (filters.role !== 'all') {
      filtered = filtered.filter(user => user.role === filters.role);
    }

    // Status filter
    if (filters.status !== 'all') {
      const isSuspended = filters.status === 'suspended';
      filtered = filtered.filter(user => user.is_suspended === isSuspended);
    }

    // Bank status filter
    if (filters.bank_status !== 'all') {
      const hasBank = filters.bank_status === 'has_bank';
      filtered = filtered.filter(user => 
        hasBank 
          ? (user.bank_accounts && user.bank_accounts.length > 0)
          : (!user.bank_accounts || user.bank_accounts.length === 0)
      );
    }

    return filtered;
  }

  // ==================== UTILITY FUNCTIONS ====================

  /**
   * Format date for display
   */
  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  /**
   * Format date with time
   */
  formatDateTime(dateString?: string): string {
    if (!dateString) return 'N/A';
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
   * Format number (K, M)
   */
  formatNumber(num?: number): string {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  }

  /**
   * Mask account number
   */
  maskAccountNumber(accountNumber: string): string {
    if (!accountNumber) return '****';
    const last4 = accountNumber.slice(-4);
    return `****${last4}`;
  }

  /**
   * Get role color
   */
  getRoleColor(role: string): string {
    switch (role) {
      case 'influencer': return '#9C27B0';
      case 'brand': return '#2196F3';
      case 'admin': return '#F44336';
      default: return '#757575';
    }
  }

  /**
   * Get role background color
   */
  getRoleBackgroundColor(role: string): string {
    switch (role) {
      case 'influencer': return '#F3E5F5';
      case 'brand': return '#E3F2FD';
      case 'admin': return '#FFEBEE';
      default: return '#F5F5F5';
    }
  }

  /**
   * Get status color
   */
  getStatusColor(isSuspended: boolean): string {
    return isSuspended ? '#F44336' : '#4CAF50';
  }

  /**
   * Get status background color
   */
  getStatusBackgroundColor(isSuspended: boolean): string {
    return isSuspended ? '#FFEBEE' : '#E8F5E9';
  }

  /**
   * Get status label
   */
  getStatusLabel(isSuspended: boolean): string {
    return isSuspended ? 'Suspended' : 'Active';
  }

  /**
   * Get platform icon name
   */
  getPlatformIcon(platform: string): string {
    const icons: Record<string, string> = {
      instagram: 'logo-instagram',
      youtube: 'logo-youtube',
      facebook: 'logo-facebook',
      twitter: 'logo-twitter',
      linkedin: 'logo-linkedin',
      tiktok: 'logo-tiktok',
    };
    return icons[platform?.toLowerCase()] || 'globe-outline';
  }
}

export default new AdminAccountAPI();