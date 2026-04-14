import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://quickbox-backend-docker-b9cbaye9a3bvhad5.southindia-01.azurewebsites.net';

// Types for Analytics Data
export interface DashboardData {
  influencer_id: string;
  influencer_name: string;
  period: string;
  generated_at: string;
  performance_score: {
    overall: number;
    application_quality: number;
    engagement: number;
    consistency: number;
    earnings_efficiency: number;
    tier: string;
    percentile: number;
  };
  earnings_summary: {
    total: number;
    available: number;
    pending: number;
    withdrawn: number;
    projected_monthly: number;
    currency: string;
  };
  application_stats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    contracted: number;
    media_submitted: number;
    completed: number;
    success_rate: number;
    approval_rate: number;
  };
  financial_summary?: {
    total_earnings: number;
    available_balance: number;
    pending_earnings: number;
  };
  engagement_metrics?: {
    engagement_score: number;
  };
  campaign_performance?: {
    active_campaigns: number;
    completed_campaigns: number;
    pending_campaigns: number;
    completion_rate: number;
  };
  key_metrics: Array<{
    name: string;
    value: number;
    unit: string;
    change_percentage?: number;
    trend?: string;
    is_positive?: boolean;
  }>;
  top_campaigns: Array<{
    campaign_id: string;
    title: string;
    brand_name: string;
    status: string;
    budget: number;
    earnings: number;
    roi: number;
    duration_days?: number;
    satisfaction_score?: number;
  }>;
  insights: Array<{
    id: string;
    title: string;
    description: string;
    type: string;
    priority: string;
    action_items: string[];
    impact_score: number;
  }>;
  trends: Array<{
    metric: string;
    data_points: Array<{
      date: string;
      value: number;
      label: string;
    }>;
    trend: string;
    slope: number;
    confidence: number;
    forecast_next?: number;
  }>;
  quick_stats: {
    today_applications: number;
    today_earnings: number;
    week_applications: number;
    week_earnings: number;
    month_applications: number;
    month_earnings: number;
  };
  recent_activity?: {
    items: Array<{
      type: string;
      title: string;
      timestamp: string;
      amount?: number;
    }>;
  };
  profile_summary?: {
    username: string;
    profile_picture?: string;
    tier?: string;
  };
}

export interface PerformanceData {
  overall_score: number;
  application_quality: number;
  completion_rate: number;
  satisfaction_score: number;
  content_quality: number;
  response_time_score: number;
  earnings_efficiency: number;
  tier: string;
  trends: Array<{
    period: string;
    overall_score: number;
    average_score: number;
  }>;
}

export interface EarningsTrendData {
  period: string;
  total_amount: number;
  transaction_count: number;
  average_amount: number;
  min_amount: number;
  max_amount: number;
  growth_percentage?: number;
  growth_trend?: string;
}

export interface ApplicationsAnalysisData {
  summary: {
    total_applications: number;
    time_period: string;
    avg_applications_per_day: number;
  };
  status_distribution: Record<string, number>;
  category_distribution: Record<string, number>;
  top_brands: Record<string, number>;
  response_time_analysis: {
    average_hours: number;
    median_hours: number;
    min_hours: number;
    max_hours: number;
  };
  timeline: Array<{
    date: string;
    applications: number;
    approved: number;
  }>;
  conversion_funnel: {
    applied: number;
    approved: number;
    completed: number;
  };
  total_applications?: number;
  pending?: number;
  approved?: number;
  rejected?: number;
  completed?: number;
  success_rate?: number;
  recent_applications?: Array<{
    campaign_id: string;
    campaign_title: string;
    brand_name: string;
    status: string;
    applied_at: string;
    payment_amount: number;
  }>;
}

export interface CampaignData {
  _id: string;
  title: string;
  description?: string;
  budget: number;
  status: string;
  category?: string;
  created_at: string;
  deadline?: string;
  brand_id?: string;
  brand_name?: string;
  brand?: {
    id: string;
    company_name?: string;
    logo?: string;
    email?: string;
    bio?: string;
    website?: string;
    location?: string;
  };
  brand_profile?: any;
  created_by?: any;
  application_status: string;
  application_date: string;
  application_id: string;
  campaign_earnings: number;
}

export interface MediaAnalyticsData {
  total_submissions: number;
  total_files: number;
  images: number;
  videos: number;
  documents: number;
  avg_file_size: string;
  storage_used: string;
  type_distribution: Array<{
    name: string;
    value: number;
  }>;
  recent_media: Array<{
    filename: string;
    type: string;
    submitted_at: string;
    size: string;
    campaign_title: string;
  }>;
}

export interface QuickStatsData {
  today: {
    applications: number;
    earnings: number;
    approvals: number;
    completed: number;
  };
  this_week: {
    applications: number;
    earnings: number;
    approvals: number;
    completed: number;
  };
  this_month: {
    applications: number;
    earnings: number;
    approvals: number;
    completed: number;
  };
  all_time: {
    applications: number;
    earnings: number;
    approvals: number;
    completed: number;
  };
}

export interface ComprehensiveReportData {
  executive_summary: string;
  dashboard: DashboardData;
  performance_breakdown: any;
  earnings_analysis: any;
  application_analysis: any;
  media_analysis: MediaAnalyticsData;
  engagement_analysis: {
    likes_received: number;
    comments_received: number;
    shares_received: number;
    engagement_rate: number;
    audience_growth: number;
    content_reach: number;
    top_engaging_content: any[];
  };
  competitive_analysis: any;
  recommendations: Array<{
    category: string;
    recommendation: string;
    priority: string;
    estimated_impact: string;
  }>;
  raw_data_summary: any;
  monthly_growth?: number;
  audience_growth?: number;
  engagement_growth?: number;
  revenue_growth?: number;
  growth_trend?: number;
  revenue_trend?: number;
  trends?: Array<{
    period: string;
    earnings_growth: number;
    applications_growth: number;
    engagement_growth: number;
  }>;
}

export interface ProfileSummary {
  username: string;
  profile_picture?: string;
  full_name?: string;
}

// Constants
export const STATUS_COLORS = {
  pending: '#F59E0B',
  approved: '#ae10b9',
  rejected: '#EF4444',
  contracted: '#3B82F6',
  completed: '#10ce0d',
  cancelled: '#6B7280',
  media_submitted: '#06B6D4'
};

export const METRIC_COLORS = {
  primary: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#06B6D4',
  purple: '#8B5CF6',
  pink: '#EC4899',
  teal: '#14B8A6',
  orange: '#F97316',
  indigo: '#6366F1'
};

class InfluencerAnalyticsAPI {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string = API_BASE_URL, timeout: number = 30000) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('access_token');
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

  // Profile endpoints
  async getProfileSummary(): Promise<ProfileSummary> {
    return this.request<{ type: string; profile: ProfileSummary }>('/profiles/me').then(
      res => res.profile
    );
  }

  // Analytics endpoints
  async getDashboard(timeRange: string = 'last_30_days'): Promise<DashboardData> {
    return this.request<DashboardData>(
      `/influencer/analytics/dashboard?time_range=${timeRange}`
    );
  }

  async getPerformance(timeRange: string = 'last_30_days'): Promise<PerformanceData> {
    return this.request<PerformanceData>(
      `/influencer/analytics/performance?time_range=${timeRange}`
    );
  }

  async getEarningsTrends(
    period: string = 'last_30_days',
    groupBy: 'day' | 'week' | 'month' = 'week'
  ): Promise<EarningsTrendData[]> {
    return this.request<EarningsTrendData[]>(
      `/influencer/analytics/earnings-trends?period=${period}&group_by=${groupBy}`
    );
  }

  async getApplicationsAnalysis(timeRange: string = 'last_30_days'): Promise<ApplicationsAnalysisData> {
    return this.request<ApplicationsAnalysisData>(
      `/influencer/analytics/applications/analysis?time_range=${timeRange}`
    );
  }

  async getCampaigns(
    status?: string,
    limit: number = 20
  ): Promise<CampaignData[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('limit', limit.toString());
    
    return this.request<CampaignData[]>(
      `/influencer/analytics/campaigns?${params.toString()}`
    );
  }

  async getMediaAnalytics(): Promise<MediaAnalyticsData> {
    return this.request<MediaAnalyticsData>('/influencer/analytics/media');
  }

  async getComprehensiveReport(
    timeRange: string = 'last_90_days'
  ): Promise<ComprehensiveReportData> {
    return this.request<ComprehensiveReportData>(
      `/influencer/analytics/comprehensive-report?time_range=${timeRange}`
    );
  }

  async getQuickStats(): Promise<QuickStatsData> {
    return this.request<QuickStatsData>('/influencer/analytics/quick-stats');
  }

  // Export functionality
  async exportData(
    reportType: string,
    format: 'json' | 'csv' | 'excel' | 'pdf' = 'json',
    timeRange: string = 'last_30_days'
  ): Promise<string> {
    const token = await this.getAuthToken();
    const url = `${this.baseURL}/influencer/analytics/export?report_type=${reportType}&format=${format}&time_range=${timeRange}`;
    
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

  async shareExportedData(
  reportType: string,
  format: 'json' | 'csv' = 'json',
  timeRange: string = 'last_30_days'
): Promise<void> {
  try {
    const content = await this.exportData(reportType, format, timeRange);
    const fileName = `influencer-${reportType}-${new Date().toISOString().split('T')[0]}.${format}`;
    const fileUri = FileSystem.documentDirectory + fileName;

    if (format === 'json') {
      await FileSystem.writeAsStringAsync(fileUri, content);
    } else {
      await FileSystem.writeAsStringAsync(fileUri, content, {
        encoding: FileSystem.EncodingType.Base64,
      });
    }

    await Sharing.shareAsync(fileUri, {
      dialogTitle: `Export ${reportType} data`,
    });

  } catch (error) {
    console.error('Share export error:', error);
    throw error;
  }
}

  // Cache management
  async clearCache(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/influencer/analytics/clear-cache', {
      method: 'POST',
    });
  }

  // Health check
  async healthCheck(): Promise<any> {
    return this.request('/influencer/analytics/health');
  }

  // Cache management for offline
  async cacheDashboardData(data: DashboardData, timeRange: string): Promise<void> {
    try {
      await AsyncStorage.setItem(`analytics_dashboard_${timeRange}`, JSON.stringify({
        data,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.error('Error caching dashboard data:', error);
    }
  }

  async getCachedDashboardData(timeRange: string, maxAge: number = 5 * 60 * 1000): Promise<DashboardData | null> {
    try {
      const cached = await AsyncStorage.getItem(`analytics_dashboard_${timeRange}`);
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

  // Utility functions
  formatCurrency(amount: number, currency: string = 'USD'): string {
    if (amount === null || amount === undefined) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  formatNumber(num: number): string {
    if (num === null || num === undefined) return '0';
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  }

  formatPercentage(value: number): string {
    if (value === null || value === undefined) return '0%';
    return `${value.toFixed(1)}%`;
  }

  formatDate(dateString: string, format: 'short' | 'full' | 'month' = 'short'): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    
    if (format === 'full') {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } else if (format === 'month') {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  }

  formatDateTime(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  calculateChange(current: number, previous: number): number | null {
    if (!previous || previous === 0) return null;
    return ((current - previous) / previous) * 100;
  }

  getStatusColor(status: string): string {
    return STATUS_COLORS[status.toLowerCase()] || '#64748b';
  }

  getGroupByFromTimeRange(timeRange: string): 'day' | 'week' | 'month' | 'hour' {
    if (timeRange.includes('today') || timeRange.includes('yesterday')) return 'hour';
    if (timeRange.includes('7_days')) return 'day';
    if (timeRange.includes('30_days') || timeRange.includes('month')) return 'week';
    if (timeRange.includes('90_days') || timeRange.includes('quarter')) return 'week';
    if (timeRange.includes('year')) return 'month';
    return 'month';
  }

  // Resolve profile image URL
  resolveProfileImage(imageValue: string | null | undefined): string {
    if (!imageValue) {
      return `${this.baseURL}/static/defaults/influencer-avatar.png`;
    }

    if (typeof imageValue === "string" && imageValue.startsWith("/static/")) {
      return `${this.baseURL}${imageValue}`;
    }

    if (imageValue.startsWith("http")) return imageValue;

    return `${this.baseURL}/profiles/image/${imageValue}`;
  }
}

export const influencerAnalyticsApi = new InfluencerAnalyticsAPI();
export default influencerAnalyticsApi;