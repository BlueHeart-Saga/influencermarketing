import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://quickbox-backend-docker-b9cbaye9a3bvhad5.southindia-01.azurewebsites.net';

const BASE_URL = `${API_BASE_URL}/api/payments`;

// ======================================================
// 🔐 AUTH HELPERS
// ======================================================
const getAuthHeader = async () => {
  const token = await AsyncStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleError = (err: any) => {
  console.error('Payments API Error:', err.response?.data || err.message);
  const errorData = err.response?.data || { error: err.message };
  throw errorData;
};

const request = async (method: string, url: string, data?: any, params?: any) => {
  try {
    const headers = await getAuthHeader();
    
    const res = await axios({
      method,
      url: `${BASE_URL}${url}`,
      data,
      params,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });

    return res.data;
  } catch (err) {
    handleError(err);
  }
};

// ======================================================
// 📊 PAYMENT TYPES
// ======================================================
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'processing' | 'cancelled' | 'pending_bank_transfer';
export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'contracted' | 'media_submitted' | 'paid' | 'cancelled';

export interface BankAccount {
  id: string;
  account_holder_name: string;
  bank_name: string;
  branch_name?: string;
  last4?: string;
  ifsc_code?: string;
  account_type?: string;
  verified: boolean;
  status: string;
  is_primary: boolean;
}

export interface Influencer {
  id: string;
  name: string;
  email?: string;
  profile?: any;
}

export interface PendingApplication {
  application_id: string;
  campaign_id: string;
  campaign_title: string;
  campaign_image_id?: string;
  status: string;
  applied_at?: string;
  message?: string;
  media_submitted: boolean;
  influencer: Influencer;
  amount_due: number;
  currency: string;
  has_bank_account: boolean;
  bank_account: BankAccount | null;
}

export interface PendingPaymentsResponse {
  success: boolean;
  count: number;
  applications: PendingApplication[];
}

export interface DirectPaymentRequest {
  campaign_id: string;
  influencer_id: string;
  amount: number;
  payment_method?: string;
  notes?: string;
}

export interface DirectPaymentResponse {
  success: boolean;
  message: string;
  payment_id: string;
  status: string;
  amount: number;
  currency: string;
  transaction_id: string;
}

export interface PaymentHistoryItem {
  id?: string;
  payment_id?: string;
  transaction_id?: string;
  campaign_id: string;
  campaign_title?: string;
  influencer_id: string;
  influencer_name?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  payment_method?: string;
  created_at: string;
  completed_at?: string;
}

export interface PaymentHistoryResponse {
  success: boolean;
  payments: PaymentHistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface PaymentStatistics {
  total_payments: number;
  completed_payments: number;
  pending_payments: number;
  total_amount: number;
  recent_payments_30d: number;
  payment_methods: Array<{
    _id: string;
    count: number;
    total: number;
  }>;
}

export interface PaymentMethodsResponse {
  success: boolean;
  available_methods: Array<{
    id: string;
    name: string;
    description: string;
    fee_percentage: number;
    processing_time: string;
    enabled: boolean;
  }>;
  saved_methods: any[];
}

export interface WalletBalanceResponse {
  success: boolean;
  balance: number;
  currency: string;
}

export interface CampaignApplicationsResponse {
  success: boolean;
  campaign_id: string;
  campaign_title: string;
  applications: Array<{
    application_id: string;
    status: string;
    applied_at?: string;
    message?: string;
    submitted_media: any[];
    media_submitted: boolean;
    influencer: Influencer;
    has_bank_account: boolean;
    bank_account: BankAccount | null;
  }>;
}

// ======================================================
// 🚀 PAYMENT API METHODS
// ======================================================

/**
 * Get all pending direct payments for brand
 */
export const getPendingDirectPayments = async (): Promise<PendingPaymentsResponse> => {
  return request('get', '/pending-direct-payments');
};

/**
 * Process direct payment to influencer
 */
export const directPayInfluencer = async (
  campaignId: string,
  influencerId: string,
  amount: number,
  paymentMethod: string = 'bank_transfer',
  notes?: string
): Promise<DirectPaymentResponse> => {
  const data: DirectPaymentRequest = {
    campaign_id: campaignId,
    influencer_id: influencerId,
    amount,
    payment_method: paymentMethod,
    notes,
  };
  return request('post', '/direct-pay', data);
};

/**
 * Get payment history
 */
export const getPaymentHistory = async (
  page: number = 1,
  limit: number = 20,
  status?: string,
  paymentType?: string
): Promise<PaymentHistoryResponse> => {
  const params: any = { page, limit };
  if (status) params.status = status;
  if (paymentType) params.payment_type = paymentType;
  return request('get', '/history', undefined, params);
};

/**
 * Get payment details by ID
 */
export const getPaymentDetails = async (paymentId: string): Promise<any> => {
  return request('get', `/${paymentId}`);
};

/**
 * Cancel a pending payment
 */
export const cancelPayment = async (
  paymentId: string,
  reason?: string
): Promise<{ success: boolean; message: string; payment_id: string }> => {
  return request('post', `/${paymentId}/cancel`, { reason });
};

/**
 * Get payment statistics
 */
export const getPaymentStatistics = async (): Promise<{ success: boolean; statistics: PaymentStatistics }> => {
  return request('get', '/statistics');
};

/**
 * Get available payment methods
 */
export const getPaymentMethods = async (): Promise<PaymentMethodsResponse> => {
  return request('get', '/methods');
};

/**
 * Get wallet balance
 */
export const getWalletBalance = async (): Promise<WalletBalanceResponse> => {
  return request('get', '/wallet/balance');
};

/**
 * Get campaign applications with bank accounts
 */
export const getCampaignApplicationsWithAccounts = async (
  campaignId: string
): Promise<CampaignApplicationsResponse> => {
  return request('get', `/campaigns/${campaignId}/applications`);
};

// ======================================================
// 📱 HELPER FUNCTIONS
// ======================================================

/**
 * Format currency for display
 */
export const formatCurrency = (
  amount: number,
  currencyCode: string = 'USD'
): string => {
  if (!amount && amount !== 0) return 'N/A';
  
  const symbols: Record<string, string> = {
    USD: '$',
    GBP: '£',
    EUR: '€',
    JPY: '¥',
    CNY: '¥',
    INR: '₹',
    AUD: 'A$',
    CAD: 'C$',
  };
  
  const symbol = symbols[currencyCode] || currencyCode;
  const formattedAmount = amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  
  return `${symbol}${formattedAmount}`;
};

/**
 * Format date for display
 */
export const formatDate = (
  dateString?: string,
  format: 'short' | 'medium' | 'long' = 'medium'
): string => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  
  if (format === 'short') {
    return date.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: '2-digit',
    });
  } else if (format === 'long') {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Get payment status config
 */
export const getPaymentStatusConfig = (status: string): {
  color: string;
  backgroundColor: string;
  icon: string;
  label: string;
} => {
  const configs: Record<string, any> = {
    pending: {
      color: '#F59E0B',
      backgroundColor: '#FEF3C7',
      icon: 'clock',
      label: 'Pending',
    },
    completed: {
      color: '#10B981',
      backgroundColor: '#D1FAE5',
      icon: 'check-circle',
      label: 'Completed',
    },
    failed: {
      color: '#EF4444',
      backgroundColor: '#FEE2E2',
      icon: 'alert-circle',
      label: 'Failed',
    },
    processing: {
      color: '#3B82F6',
      backgroundColor: '#DBEAFE',
      icon: 'refresh-cw',
      label: 'Processing',
    },
    cancelled: {
      color: '#EF4444',
      backgroundColor: '#FEE2E2',
      icon: 'x-circle',
      label: 'Cancelled',
    },
    pending_bank_transfer: {
      color: '#F59E0B',
      backgroundColor: '#FEF3C7',
      icon: 'clock',
      label: 'Bank Transfer Pending',
    },
    paid: {
      color: '#10B981',
      backgroundColor: '#D1FAE5',
      icon: 'check-circle',
      label: 'Paid',
    },
  };
  
  return configs[status] || configs.pending;
};

/**
 * Get bank account status config
 */
export const getBankStatusConfig = (bankAccount: BankAccount | null): {
  color: string;
  backgroundColor: string;
  label: string;
  status: string;
} => {
  if (!bankAccount) {
    return {
      color: '#757575',
      backgroundColor: '#F5F5F5',
      label: 'No Bank Account',
      status: 'no_bank',
    };
  }
  
  if (bankAccount.verified) {
    return {
      color: '#10B981',
      backgroundColor: '#D1FAE5',
      label: 'Verified',
      status: 'bank_verified',
    };
  }
  
  return {
    color: '#F59E0B',
    backgroundColor: '#FEF3C7',
    label: 'Unverified',
    status: 'bank_unverified',
  };
};

/**
 * Mask account number
 */
export const maskAccountNumber = (accountNumber?: string): string => {
  if (!accountNumber) return '****';
  const last4 = accountNumber.slice(-4);
  return `****${last4}`;
};

// ======================================================
// 📦 EXPORT
// ======================================================
const paymentsAPI = {
  getPendingDirectPayments,
  directPayInfluencer,
  getPaymentHistory,
  getPaymentDetails,
  cancelPayment,
  getPaymentStatistics,
  getPaymentMethods,
  getWalletBalance,
  getCampaignApplicationsWithAccounts,
  formatCurrency,
  formatDate,
  getPaymentStatusConfig,
  getBankStatusConfig,
  maskAccountNumber,
};

export default paymentsAPI;