import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://quickbox-backend-docker-b9cbaye9a3bvhad5.southindia-01.azurewebsites.net';

// Types for Analytics Data
export interface DashboardData {
  campaigns_summary: {
    total_campaigns: number;
    total_budget: number;
    campaigns_by_status: Record<string, number>;
    applications_by_status: Record<string, number>;
    performance_metrics: {
      engagement_rate: number;
      conversion_rate: number;
      completion_rate: number;
      budget_utilization: number;
      avg_cost_per_application: number;
      total_views: number;
      total_likes: number;
      total_applications: number;
      total_spent: number;
      total_budget: number;
      average_roi?: number;
    };
  };
  payment_summary: {
    total_payments: number;
    total_amount_paid: number;
    pending_payments: number;
    failed_payments: number;
    total_earnings: number;
    payment_status_distribution: Record<string, number>;
  };
  application_summary: {
    total_applications: number;
    conversion_rates: {
      approval_rate: number;
      completion_rate: number;
      payment_rate: number;
    };
  };
  financial_summary: {
    total_budget: number;
    total_spent: number;
    remaining_budget: number;
    pending_payments: number;
    budget_utilization: number;
    average_roi: number;
  };
  performance_metrics: {
    engagement_rate: number;
    conversion_rate: number;
    completion_rate: number;
    budget_utilization: number;
    avg_cost_per_application: number;
    average_roi: number;
  };
  recent_activity: {
    payments: Array<{
      _id: string;
      amount: number;
      status: string;
      created_at: string;
      influencer_name: string;
      campaign_title: string;
    }>;
    applications: Array<{
      _id: string;
      status: string;
      applied_at: string;
      proposed_amount: number;
      match_score: number;
      influencer_name: string;
      influencer_followers: number;
      campaign_title: string;
    }>;
  };
  charts: {
    campaign_status: Record<string, number>;
    application_status: Record<string, number>;
    payment_status: Record<string, number>;
    monthly_spending: Array<{ month: string; amount: number }>;
  };
}

export interface CampaignsData {
  summary: {
    total_campaigns: number;
    total_budget: number;
    total_spent: number;
    total_applications: number;
    average_performance: number;
    budget_utilization: number;
  };
  campaigns: Array<{
    _id: string;
    title: string;
    category?: string;
    status: string;
    budget: number;
    created_at: string;
    analytics: {
      engagement_rate: number;
      conversion_rate: number;
      completion_rate: number;
      payment_rate: number;
      roi: number;
      performance_score: number;
      budget_utilization: number;
      cost_per_application: number;
      cost_per_completion: number;
    };
    payment_summary: {
      total_payments: number;
      completed_payments: number;
      total_amount_paid: number;
    };
    application_stats: {
      total: number;
      by_status: Record<string, number>;
    };
  }>;
  filters_applied: Record<string, any>;
}

export interface CampaignDetailData {
  campaign: {
    _id: string;
    title: string;
    description?: string;
    category?: string;
    budget: number;
    status: string;
    created_at: string;
    requirements?: string;
    target_audience?: string;
  };
  analytics: {
    engagement_rate: number;
    conversion_rate: number;
    completion_rate: number;
    payment_rate: number;
    roi: number;
    performance_score: number;
    performance_grade: string;
    budget_utilization: number;
    cost_per_application: number;
    cost_per_completion: number;
    timeline_data?: Array<{ date: string; engagement: number; applications: number }>;
  };
  applications: {
    total: number;
    details: Array<{
      influencer_id: string;
      influencer_name?: string;
      influencer_followers?: number;
      status: string;
      applied_at: string;
      proposed_amount: number;
      match_score: number;
      payment_status?: string;
      payment_amount?: number;
      payment_id?: string;
    }>;
    status_distribution: Record<string, number>;
  };
  payments: {
    total: number;
    details: Array<{
      _id: string;
      amount: number;
      status: string;
      created_at: string;
      influencer_id?: string;
      influencer_name?: string;
      payment_intent_id?: string;
    }>;
    total_amount_paid: number;
    pending_amount?: number;
    completed_count?: number;
  };
  influencer_insights: {
    top_influencers: Array<{
      influencer_id: string;
      profile: any;
      stats: {
        total_applications: number;
        approved_applications: number;
        completed_applications: number;
        average_match_score: number;
      };
    }>;
    total_unique_influencers: number;
  };
}

export interface PaymentsData {
  summary: {
    total_payments: number;
    total_amount: number;
    completed_payments: number;
    pending_payments: number;
    failed_payments: number;
    completion_rate: number;
  };
  trends: {
    daily_trends: Array<{
      date: string;
      total_amount: number;
      completed_amount: number;
      count: number;
      completed_count: number;
    }>;
    average_daily_payment: number;
    total_last_30_days: number;
    growth_rate: number;
  };
  status_distribution: Record<string, number>;
  payments: Array<{
    _id: string;
    amount: number;
    status: string;
    created_at: string;
    campaign_id?: string;
    campaign_title?: string;
    influencer_id?: string;
    influencer_name?: string;
    influencer_email?: string;
    payment_intent_id?: string;
    influencer_profile?: any;
  }>;
}

export interface ApplicationsData {
  summary: {
    total_applications: number;
    conversion_rates: {
      approval_rate: number;
      completion_rate: number;
      payment_rate: number;
    };
  };
  status_distribution: Record<string, number>;
  applications: Array<{
    influencer_id: string;
    influencer_name?: string;
    influencer_followers?: number;
    influencer_profile?: any;
    campaign_id: string;
    campaign_title: string;
    campaign_status: string;
    status: string;
    applied_at: string;
    proposed_amount: number;
    match_score: number;
    payment_status?: string;
    payment_amount?: number;
  }>;
}

export interface FinancialData {
  summary: {
    total_budget: number;
    total_spent: number;
    remaining_budget: number;
    pending_payments: number;
    budget_utilization: number;
    average_roi: number;
  };
  period_analysis: {
    period: string;
    data: Array<{
      period: string;
      amount: number;
      count: number;
      campaigns: number;
      avg_amount_per_campaign: number;
    }>;
    total_periods: number;
    total_amount: number;
    average_per_period: number;
  };
  campaign_spending: {
    top_campaigns: Array<{
      campaign_id: string;
      title: string;
      category: string;
      budget: number;
      spent: number;
      budget_utilization: number;
      payments: number;
    }>;
    total_campaigns: number;
    total_spent: number;
  };
  earnings_summary: {
    total_earnings: number;
    pending_earnings: number;
    total_transactions: number;
  };
  category_analysis: Array<{
    category: string;
    amount: number;
  }>;
  campaign_performance: Array<{
    campaign_id: string;
    title: string;
    budget: number;
    spent: number;
    budget_utilization: number;
    total_applications: number;
    completed_applications: number;
    completion_rate: number;
    status: string;
  }>;
}

export interface InfluencerPerformanceData {
  total_influencers: number;
  influencer_performance: Array<{
    influencer_id: string;
    profile: any;
    metrics: {
      total_applications: number;
      total_campaigns: number;
      completed_campaigns: number;
      total_earnings: number;
      approval_rate: number;
      completion_rate: number;
      average_response_time: number;
      earnings_per_campaign: number;
    };
    recent_applications: Array<any>;
  }>;
  filters: {
    min_applications: number;
    min_completed: number;
    specific_influencer: string;
  };
}

export interface BrandProfile {
  type: string;
  profile: {
    company_name: string;
    website?: string;
    industry?: string;
    logo?: string;
    description?: string;
    contact_email?: string;
    phone?: string;
    address?: string;
    social_links?: {
      instagram?: string;
      twitter?: string;
      linkedin?: string;
      facebook?: string;
    };
    followers?: {
      total: number;
    };
  };
}

class BrandAnalyticsAPI {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string = API_BASE_URL, timeout: number = 30000) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('accessToken');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const token = await this.getAuthToken();

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please check your connection.');
      }

      throw error;
    }
  }

  // Get brand profile
  async getBrandProfile(): Promise<BrandProfile> {
    return this.request<BrandProfile>('/profiles/me');
  }

  // Get dashboard analytics
  async getDashboardAnalytics(): Promise<{ success: boolean; data: DashboardData }> {
    return this.request<{ success: boolean; data: DashboardData }>('/api/brand/analytics/dashboard');
  }

  // Get campaigns analytics
  async getCampaignsAnalytics(params?: {
    status?: string;
    category?: string;
    start_date?: string;
    end_date?: string;
    sort_by?: string;
    sort_order?: string;
  }): Promise<{ success: boolean; data: CampaignsData }> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params?.sort_order) queryParams.append('sort_order', params.sort_order);

    const url = `/api/brand/analytics/campaigns${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<{ success: boolean; data: CampaignsData }>(url);
  }

  // Get single campaign analytics
  async getCampaignDetail(campaignId: string): Promise<{ success: boolean; data: CampaignDetailData }> {
    return this.request<{ success: boolean; data: CampaignDetailData }>(`/api/brand/analytics/campaign/${campaignId}`);
  }

  // Get payment analytics
  async getPaymentAnalytics(params?: {
    status?: string;
    campaign_id?: string;
    start_date?: string;
    end_date?: string;
    min_amount?: number;
    max_amount?: number;
    sort_by?: string;
    sort_order?: string;
  }): Promise<{ success: boolean; data: PaymentsData }> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.campaign_id) queryParams.append('campaign_id', params.campaign_id);
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    if (params?.min_amount) queryParams.append('min_amount', params.min_amount.toString());
    if (params?.max_amount) queryParams.append('max_amount', params.max_amount.toString());
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params?.sort_order) queryParams.append('sort_order', params.sort_order);

    const url = `/api/brand/analytics/payments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<{ success: boolean; data: PaymentsData }>(url);
  }

  // Get application analytics
  async getApplicationAnalytics(params?: {
    status?: string;
    campaign_id?: string;
    influencer_id?: string;
    start_date?: string;
    end_date?: string;
    sort_by?: string;
    sort_order?: string;
  }): Promise<{ success: boolean; data: ApplicationsData }> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.campaign_id) queryParams.append('campaign_id', params.campaign_id);
    if (params?.influencer_id) queryParams.append('influencer_id', params.influencer_id);
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params?.sort_order) queryParams.append('sort_order', params.sort_order);

    const url = `/api/brand/analytics/applications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<{ success: boolean; data: ApplicationsData }>(url);
  }

  // Get financial analytics
  async getFinancialAnalytics(period: string = 'monthly'): Promise<{ success: boolean; data: FinancialData }> {
    return this.request<{ success: boolean; data: FinancialData }>(`/api/brand/analytics/financial?period=${period}`);
  }

  // Get influencer performance analytics
  async getInfluencerPerformance(minApplications: number = 1, minCompleted: number = 0): Promise<{ success: boolean; data: InfluencerPerformanceData }> {
    return this.request<{ success: boolean; data: InfluencerPerformanceData }>(
      `/api/brand/analytics/influencer-performance?min_applications=${minApplications}&min_completed=${minCompleted}`
    );
  }

  // Export data
  async exportData(
    dataType: string,
    format: 'json' | 'csv' = 'json',
    params?: {
      start_date?: string;
      end_date?: string;
    }
  ): Promise<string> {
    const token = await this.getAuthToken();
    const queryParams = new URLSearchParams({
      data_type: dataType,
      format: format,
    });

    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);

    const url = `${this.baseURL}/api/brand/analytics/export?${queryParams.toString()}`;

    try {
      const response = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      if (format === 'json') {
        const data = await response.json();
        return JSON.stringify(data, null, 2);
      } else {
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  }

  // Share exported data
  async shareExportedData(dataType: string, format: 'json' | 'csv' = 'json'): Promise<void> {
    try {
      const content = await this.exportData(dataType, format);
      const fileName = `${dataType}_export_${new Date().toISOString().split('T')[0]}.${format}`;

      if (format === 'json') {
        await Share.open({
          title: `Export ${dataType} data`,
          message: content,
          subject: `${dataType} Export`,
        });
      } else {
        // For CSV, we need to save and share file
        const fileUri = FileSystem.documentDirectory + fileName;

        await FileSystem.writeAsStringAsync(fileUri, content, {
          encoding: FileSystem.EncodingType.Base64,
        });

        await Sharing.shareAsync(fileUri);
      }
    } catch (error) {
      console.error('Share export error:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<any> {
    return this.request('/api/brand/analytics/health');
  }

  // Format helpers
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  }

  formatPercentage(value: number): string {
    return `${value?.toFixed(1) || 0}%`;
  }

  formatNumber(num: number): string {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  formatDateTime(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      active: '#06d6a0',
      completed: '#4361ee',
      pending: '#f9c74f',
      draft: '#64748b',
      paused: '#ef476f',
      approved: '#06d6a0',
      rejected: '#ef476f',
      reviewed: '#7209b7',
      shortlisted: '#f9c74f',
      contracted: '#4361ee',
      paid: '#06d6a0',
      failed: '#ef476f',
      processing: '#7209b7',
    };
    return colors[status.toLowerCase()] || '#64748b';
  }

  // Cache management
  async cacheDashboardData(data: DashboardData): Promise<void> {
    try {
      await AsyncStorage.setItem('brand_dashboard_cache', JSON.stringify({
        data,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.error('Error caching dashboard data:', error);
    }
  }

  async getCachedDashboardData(maxAge: number = 5 * 60 * 1000): Promise<DashboardData | null> {
    try {
      const cached = await AsyncStorage.getItem('brand_dashboard_cache');
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < maxAge) {
          return data;
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting cached dashboard data:', error);
      return null;
    }
  }

  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem('brand_dashboard_cache');
      await AsyncStorage.removeItem('brand_campaigns_cache');
      await AsyncStorage.removeItem('brand_payments_cache');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
}

export const brandAnalyticsApi = new BrandAnalyticsAPI();
export default brandAnalyticsApi;