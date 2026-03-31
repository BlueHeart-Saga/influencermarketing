import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Types
export type PaymentStatus = 'pending_approval' | 'approved' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'on_hold' | 'refunded';
export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type WithdrawalStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type PaymentMethod = 'razorpay' | 'stripe' | 'paypal' | 'bank_transfer' | 'upi' | 'manual_transfer' | 'cash';
export type PayoutMethod = 'bank_transfer' | 'stripe_connect' | 'razorpay_x' | 'paypal' | 'upi' | 'manual';

export interface Payment {
  _id: string;
  payment_reference: string;
  campaign_id: string;
  campaign_title?: string;
  influencer_id: string;
  influencer_name?: string;
  influencer_email?: string;
  brand_id: string;
  brand_name?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  payment_method: PaymentMethod;
  payout_id?: string;
  notes?: string;
  transaction_id?: string;
  created_at: string;
  updated_at: string;
  approved_at?: string;
  processed_at?: string;
  completed_at?: string;
  metadata?: Record<string, any>;
}

export interface Payout {
  _id: string;
  payout_reference: string;
  payment_ids: string[];
  influencer_id: string;
  influencer_name?: string;
  influencer_email?: string;
  total_amount: number;
  currency: string;
  status: PayoutStatus;
  payout_method: PayoutMethod;
  payout_details: {
    bank_details?: {
      account_holder_name: string;
      account_number: string;
      ifsc_code: string;
      bank_name: string;
      branch?: string;
    };
    upi_details?: {
      upi_id: string;
      provider: string;
    };
    paypal_details?: {
      email: string;
      account_name: string;
    };
    stripe_connect_id?: string;
    razorpay_contact_id?: string;
  };
  scheduled_date?: string;
  processed_date?: string;
  completed_date?: string;
  notes?: string;
  transaction_id?: string;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface Withdrawal {
  _id: string;
  withdrawal_reference: string;
  influencer_id: string;
  influencer_name?: string;
  influencer_email?: string;
  amount: number;
  currency: string;
  status: WithdrawalStatus;
  payout_method: PayoutMethod;
  payout_details: any;
  requested_at: string;
  processed_at?: string;
  completed_at?: string;
  notes?: string;
  transaction_id?: string;
  metadata?: Record<string, any>;
}

export interface Earning {
  _id: string;
  earning_reference: string;
  influencer_id: string;
  influencer_name?: string;
  campaign_id: string;
  campaign_title?: string;
  payment_id?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'available' | 'withdrawn' | 'cancelled';
  created_at: string;
  available_at?: string;
  withdrawn_at?: string;
  metadata?: Record<string, any>;
}

export interface Application {
  application_id: string;
  campaign_id: string;
  campaign_title: string;
  influencer_id: string;
  influencer_name: string;
  brand_id: string;
  brand_name: string;
  payment_amount: number;
  payment_currency: string;
  payment_status?: PaymentStatus;
  payment_created?: boolean;
  application_completed_at?: string;
  created_at: string;
  status: string;
}

export interface DashboardStats {
  total_brand_payments: number;
  total_platform_fees: number;
  total_influencer_payouts: number;
  total_applications: number;
  completed_payments: number;
  pending_payments: number;
  waiting_payments: number;
  processing_payments: number;
  failed_payments: number;
  pending_withdrawals: number;
  revenue_this_month: number;
  revenue_last_month: number;
}

export interface RevenueAnalytics {
  _id: string;
  total_revenue: number;
  completed_revenue: number;
  pending_revenue: number;
}

export interface TopInfluencer {
  influencer_id: string;
  name: string;
  total_earnings: number;
  payment_count: number;
}

export interface TopBrand {
  brand_id: string;
  name: string;
  total_spent: number;
  payment_count: number;
}

export interface PaymentMethodData {
  name: string;
  value: number;
  color: string;
}

export interface PaymentFlow {
  campaign_id: string;
  campaign_title: string;
  influencer_id: string;
  influencer_name: string;
  brand_id: string;
  brand_name: string;
  application_status: string;
  application_completed_at?: string;
  overall_status: string;
  payment?: Payment;
  earning?: Earning;
  withdrawal?: Withdrawal;
  payout?: Payout;
}

export interface CreatePaymentData {
  campaign_id: string;
  influencer_id: string;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  notes?: string;
  scheduled_payout_date?: string;
  auto_approve?: boolean;
}

export interface CreatePayoutData {
  payment_ids: string[];
  payout_method: PayoutMethod;
  payout_details: any;
  scheduled_date?: string;
  notes?: string;
}

export interface BatchCreateResponse {
  message: string;
  summary: {
    successful: number;
    failed: number;
    already_processed: number;
  };
}

// API Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || (Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000');

class AdminTransactionsAPI {
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

  // ==================== DASHBOARD & STATS ====================

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await this.api.get('/admin/payments/dashboard/stats');
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getRevenueAnalytics(timeframe: string = '30d'): Promise<RevenueAnalytics[]> {
    try {
      const response = await this.api.get('/admin/payments/analytics/revenue', {
        params: { timeframe }
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getTopInfluencers(limit: number = 10): Promise<TopInfluencer[]> {
    try {
      const response = await this.api.get('/admin/payments/analytics/top-influencers', {
        params: { limit }
      });
      return response.data?.top_influencers || [];
    } catch (error) {
      this.handleError(error);
    }
  }

  async getTopBrands(limit: number = 10): Promise<TopBrand[]> {
    try {
      const response = await this.api.get('/admin/payments/analytics/top-brands', {
        params: { limit }
      });
      return response.data?.top_brands || [];
    } catch (error) {
      this.handleError(error);
    }
  }

  async getPaymentMethodsAnalytics(timeframe: string = '30d'): Promise<PaymentMethodData[]> {
    try {
      const response = await this.api.get('/admin/payments/analytics/payment-methods', {
        params: { timeframe }
      });
      return response.data?.payment_methods || [];
    } catch (error) {
      this.handleError(error);
    }
  }

  // ==================== APPLICATIONS ====================

  async getCompletedApplications(params?: {
    skip?: number;
    limit?: number;
    status?: string;
    brand_id?: string;
    influencer_id?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<{ applications: Application[]; total: number }> {
    try {
      const response = await this.api.get('/admin/payments/applications/completed', { params });
      return { applications: response.data || [], total: response.data?.length || 0 };
    } catch (error) {
      this.handleError(error);
    }
  }

  async batchCreatePayments(applicationIds: string[]): Promise<BatchCreateResponse> {
    try {
      const response = await this.api.post('/admin/payments/applications/batch-create-payments', {
        application_ids: applicationIds
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // ==================== PAYMENTS ====================

  async getPayments(params?: {
    skip?: number;
    limit?: number;
    status?: PaymentStatus;
    payment_method?: PaymentMethod;
    currency?: string;
    brand_id?: string;
    influencer_id?: string;
    campaign_id?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<{ payments: Payment[]; total: number }> {
    try {
      const response = await this.api.get('/admin/payments/payments', { params });
      return {
        payments: response.data?.payments || [],
        total: response.data?.total || 0
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async createPayment(data: CreatePaymentData): Promise<Payment> {
    try {
      const response = await this.api.post('/admin/payments/payments/create', data);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async approvePayment(paymentId: string): Promise<{ message: string }> {
    try {
      const response = await this.api.put(`/admin/payments/payments/${paymentId}/approve`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async markPaymentAsPaid(paymentId: string, transactionId: string): Promise<{ message: string }> {
    try {
      const response = await this.api.put(`/admin/payments/payments/${paymentId}/mark-paid`, null, {
        params: { transaction_id: transactionId }
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // ==================== PAYOUTS ====================

  async getPayouts(params?: {
    skip?: number;
    limit?: number;
    status?: PayoutStatus;
    payout_method?: PayoutMethod;
    influencer_id?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<{ payouts: Payout[]; total: number }> {
    try {
      const response = await this.api.get('/admin/payments/payouts', { params });
      return {
        payouts: response.data?.payouts || [],
        total: response.data?.total || 0
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async createPayout(data: CreatePayoutData): Promise<Payout> {
    try {
      const response = await this.api.post('/admin/payments/payouts/create', data);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // ==================== WITHDRAWALS ====================

  async getWithdrawals(params?: {
    skip?: number;
    limit?: number;
    status?: WithdrawalStatus;
    influencer_id?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<{ withdrawals: Withdrawal[]; total: number }> {
    try {
      const response = await this.api.get('/admin/payments/withdrawals', { params });
      return {
        withdrawals: response.data?.withdrawals || [],
        total: response.data?.total || 0
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  // ==================== EARNINGS ====================

  async getEarnings(params?: {
    skip?: number;
    limit?: number;
    status?: string;
    influencer_id?: string;
    campaign_id?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<{ earnings: Earning[]; total: number }> {
    try {
      const response = await this.api.get('/admin/payments/earnings', { params });
      return {
        earnings: response.data?.earnings || [],
        total: response.data?.total || 0
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  // ==================== PAYMENT FLOW ====================

  async getPaymentFlow(campaignId: string, influencerId: string): Promise<PaymentFlow> {
    try {
      const response = await this.api.get(`/admin/payments/payments/flow/${campaignId}/${influencerId}`);
      return response.data?.flow;
    } catch (error) {
      this.handleError(error);
    }
  }

  // ==================== EXPORTS ====================

  async exportData(type: 'payments' | 'payouts' | 'report', format: 'csv' | 'excel' | 'pdf', filters?: any): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      params.append('format', format);
      
      if (filters) {
        if (filters.status) params.append('status', filters.status);
        if (filters.payment_method) params.append('payment_method', filters.payment_method);
        if (filters.currency) params.append('currency', filters.currency);
        if (filters.date_from) params.append('date_from', filters.date_from);
        if (filters.date_to) params.append('date_to', filters.date_to);
      }

      let url = '';
      switch (type) {
        case 'payments':
          url = `/admin/payments/export/payments?${params.toString()}`;
          break;
        case 'payouts':
          url = `/admin/payments/export/payouts?${params.toString()}`;
          break;
        default:
          url = `/admin/payments/reports/generate/payment-summary?${params.toString()}`;
      }

      const response = await this.api.get(url, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // ==================== UTILITY FUNCTIONS ====================

  formatCurrency(amount: number, currency: string = 'USD'): string {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      CAD: 'C$',
      AUD: 'A$',
      INR: '₹',
    };
    const symbol = symbols[currency] || '$';
    return `${symbol}${amount?.toFixed(2) || '0.00'}`;
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatStatus(status: string): string {
    if (!status) return 'Unknown';
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      pending_approval: '#FF9800',
      approved: '#14B8A6',
      processing: '#0EA5E9',
      completed: '#10B981',
      failed: '#EF4444',
      cancelled: '#6B7280',
      on_hold: '#F59E0B',
      refunded: '#8B5CF6',
      pending: '#F59E0B',
      available: '#10B981',
      withdrawn: '#8B5CF6',
      initiated: '#3B82F6',
      processed: '#10B981',
      paid: '#059669',
    };
    return colors[status] || '#6B7280';
  }

  getPaymentMethodLabel(method: string): string {
    const methods: Record<string, string> = {
      razorpay: 'Razorpay',
      stripe: 'Stripe',
      paypal: 'PayPal',
      bank_transfer: 'Bank Transfer',
      upi: 'UPI',
      manual_transfer: 'Manual Transfer',
      cash: 'Cash',
      stripe_connect: 'Stripe Connect',
      razorpay_x: 'RazorpayX',
      manual: 'Manual',
    };
    return methods[method] || method;
  }

  getPaymentMethodIcon(method: string): string {
    const icons: Record<string, string> = {
      razorpay: '💳',
      stripe: '💠',
      paypal: '🔵',
      bank_transfer: '🏦',
      upi: '📱',
      manual_transfer: '✍️',
      cash: '💵',
    };
    return icons[method] || '💰';
  }
}

export default new AdminTransactionsAPI();