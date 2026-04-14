import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Types
export interface InfluencerProfile {
  _id?: string;
  user_id?: string;
  full_name?: string;
  nickname?: string;
  email?: string;
  phone_number?: string;
  location?: string;
  bio?: string;
  categories?: string[];
  profile_picture?: string;
  social_links?: Record<string, string>;
  followers?: number;
  engagement_rate?: number;
  rating?: number;
  created_at?: string;
  updated_at?: string;
}

export interface BankAccount {
  _id: string;
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
  created_at: string;
  updated_at?: string;
}

export interface UserBasicInfo {
  _id: string;
  email: string;
  username: string;
  role: string;
  is_suspended: boolean;
  created_at: string;
  last_login?: string;
}

export interface Campaign {
  _id: string;
  title: string;
  description: string;
  budget: number;
  currency: string;
  category: string;
  status: 'active' | 'paused' | 'completed' | 'draft';
  deadline: string;
  created_at: string;
  brand_id: string;
  brand_name?: string;
  applications?: CampaignApplication[];
}

export interface CampaignApplication {
  application_id: string;
  influencer_id: string;
  influencer_name: string;
  status: 'pending' | 'approved' | 'rejected' | 'contracted' | 'media_submitted' | 'completed';
  message?: string;
  applied_at: string;
  contract_signed?: boolean;
  contract_signed_at?: string;
  submitted_media?: any[];
  media_submitted_at?: string;
  bank_snapshot?: any;
  payment_status?: 'pending' | 'processing' | 'completed' | 'failed';
  payment_amount?: number;
  payment_currency?: string;
  payment_id?: string;
}

export interface InfluencerDetailsResponse {
  profile: {
    profile: InfluencerProfile;
    user?: UserBasicInfo;
  };
  bankAccounts: BankAccount[];
  campaigns?: Campaign[];
  applications?: CampaignApplication[];
  totalEarnings?: number;
  pendingPayments?: number;
  completedPayments?: number;
}

export interface CampaignDetailsResponse {
  campaign: Campaign;
  brandDetails: {
    profile: {
      company_name?: string;
      contact_person_name?: string;
      email?: string;
      phone_number?: string;
      website?: string;
      location?: string;
      logo?: string;
    };
    bankAccounts?: BankAccount[];
  };
  applications: CampaignApplication[];
  metrics: {
    totalApplications: number;
    pending: number;
    approved: number;
    rejected: number;
    contracted: number;
    completed: number;
    totalBudget: number;
  };
}

export interface PaymentCreateData {
  campaign_id: string;
  influencer_id: string;
  amount: number;
  currency: string;
  payment_method?: 'bank_transfer' | 'stripe' | 'paypal';
  notes?: string;
}

export interface PaymentResponse {
  message: string;
  payment_id: string;
  status: string;
}

export interface PaymentStatusResponse {
  payment_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  amount: number;
  currency: string;
  transaction_id?: string;
  created_at: string;
  completed_at?: string;
  error_message?: string;
}

// API Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || (Platform.OS === 'android' ? 'https://quickbox-backend-docker-b9cbaye9a3bvhad5.southindia-01.azurewebsites.net' : 'https://quickbox-backend-docker-b9cbaye9a3bvhad5.southindia-01.azurewebsites.net');

class AdminPaymentFinderAPI {
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

  // ==================== INFLUENCER PAYMENT DETAILS ====================

  /**
   * Get complete influencer details for payment processing
   */
  async getInfluencerDetails(influencerId: string): Promise<InfluencerDetailsResponse> {
    try {
      // Fetch influencer profile
      const profileRes = await this.api.get(`/profiles/user/${influencerId}`);
      
      // Fetch bank accounts
      const bankRes = await this.api.get(`/account/user/${influencerId}/bank-accounts`);
      
      // Fetch user basic info
      const userRes = await this.api.get(`/account/user/${influencerId}`);
      
      // Fetch influencer's completed campaigns and payments
      const campaignsRes = await this.api.get(`/influencer/${influencerId}/campaigns`);
      const earningsRes = await this.api.get(`/influencer/${influencerId}/earnings`);

      const profile = profileRes.data;
      const bankAccounts = bankRes.data.data || bankRes.data || [];
      const user = userRes.data.data || userRes.data;
      const campaigns = campaignsRes.data.data || campaignsRes.data || [];
      
      // Calculate earnings from campaigns
      let totalEarnings = 0;
      let pendingPayments = 0;
      let completedPayments = 0;
      
      campaigns.forEach((campaign: Campaign) => {
        campaign.applications?.forEach((app: CampaignApplication) => {
          if (app.status === 'completed' && app.payment_status === 'completed') {
            totalEarnings += app.payment_amount || 0;
            completedPayments++;
          } else if (app.status === 'completed' && app.payment_status === 'pending') {
            pendingPayments++;
          }
        });
      });

      return {
        profile: {
          profile: profile.profile || profile,
          user: user,
        },
        bankAccounts,
        campaigns,
        totalEarnings,
        pendingPayments,
        completedPayments,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get campaign details for payment processing
   */
  async getCampaignDetails(campaignId: string): Promise<CampaignDetailsResponse> {
    try {
      // Fetch campaign
      const campaignRes = await this.api.get(`/campaigns/${campaignId}`);
      const campaign = campaignRes.data;
      
      // Fetch brand details
      const brandRes = await this.api.get(`/profiles/user/${campaign.brand_id}`);
      const brandProfile = brandRes.data;
      
      // Fetch brand bank accounts (if needed for payment reference)
      const bankRes = await this.api.get(`/account/user/${campaign.brand_id}/bank-accounts`);
      const bankAccounts = bankRes.data.data || bankRes.data || [];
      
      // Get applications for this campaign
      const applications = campaign.applications || [];
      
      // Calculate metrics
      const metrics = {
        totalApplications: applications.length,
        pending: applications.filter((a: any) => a.status === 'pending').length,
        approved: applications.filter((a: any) => a.status === 'approved').length,
        rejected: applications.filter((a: any) => a.status === 'rejected').length,
        contracted: applications.filter((a: any) => a.status === 'contracted').length,
        completed: applications.filter((a: any) => a.status === 'completed').length,
        totalBudget: campaign.budget || 0,
      };
      
      return {
        campaign,
        brandDetails: {
          profile: brandProfile.profile || brandProfile,
          bankAccounts,
        },
        applications,
        metrics,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  // ==================== PAYMENT MANAGEMENT ====================

  /**
   * Create a payment for an influencer
   */
  async createPayment(paymentData: PaymentCreateData): Promise<PaymentResponse> {
    try {
      const response = await this.api.post('/payments/create', paymentData);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentStatusResponse> {
    try {
      const response = await this.api.get(`/payments/${paymentId}/status`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Complete a payment (admin only)
   */
  async completePayment(paymentId: string, transactionId: string): Promise<{ message: string }> {
    try {
      const response = await this.api.put(`/payments/${paymentId}/complete`, {
        transaction_id: transactionId,
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Process payment for completed campaign
   */
  async processCampaignPayment(
    campaignId: string,
    influencerId: string,
    amount?: number
  ): Promise<PaymentResponse> {
    try {
      const response = await this.api.post('/payments/process-campaign', {
        campaign_id: campaignId,
        influencer_id: influencerId,
        amount,
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // ==================== SEARCH & DISCOVERY ====================

  /**
   * Search influencers by name, email, or ID
   */
  async searchInfluencers(searchTerm: string): Promise<InfluencerDetailsResponse[]> {
    try {
      const response = await this.api.get('/admin/influencers/search', {
        params: { q: searchTerm },
      });
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Search campaigns by title, ID, or brand
   */
  async searchCampaigns(searchTerm: string): Promise<CampaignDetailsResponse[]> {
    try {
      const response = await this.api.get('/admin/campaigns/search', {
        params: { q: searchTerm },
      });
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get influencers with pending payments
   */
  async getInfluencersWithPendingPayments(): Promise<InfluencerDetailsResponse[]> {
    try {
      const response = await this.api.get('/admin/influencers/pending-payments');
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get campaigns ready for payment
   */
  async getCampaignsReadyForPayment(): Promise<CampaignDetailsResponse[]> {
    try {
      const response = await this.api.get('/admin/campaigns/ready-for-payment');
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // ==================== UTILITY FUNCTIONS ====================

  /**
   * Format currency for display
   */
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

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  /**
   * Format account number for display (masked)
   */
  maskAccountNumber(accountNumber: string): string {
    if (!accountNumber) return '****';
    const last4 = accountNumber.slice(-4);
    return `****${last4}`;
  }

  /**
   * Get payment status color
   */
  getPaymentStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'completed': return '#4CAF50';
      case 'processing': return '#2196F3';
      case 'pending': return '#FF9800';
      case 'failed': return '#F44336';
      default: return '#9E9E9E';
    }
  }

  /**
   * Get payment status label
   */
  getPaymentStatusLabel(status: string): string {
    switch (status?.toLowerCase()) {
      case 'completed': return 'Paid';
      case 'processing': return 'Processing';
      case 'pending': return 'Pending';
      case 'failed': return 'Failed';
      default: return 'Unknown';
    }
  }

  /**
   * Get campaign status color
   */
  getCampaignStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active': return '#4CAF50';
      case 'paused': return '#FF9800';
      case 'completed': return '#2196F3';
      case 'draft': return '#9E9E9E';
      default: return '#757575';
    }
  }

  /**
   * Get application status color
   */
  getApplicationStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'approved': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'rejected': return '#F44336';
      case 'contracted': return '#9C27B0';
      case 'media_submitted': return '#2196F3';
      case 'completed': return '#00BCD4';
      default: return '#757575';
    }
  }
}

export default new AdminPaymentFinderAPI();