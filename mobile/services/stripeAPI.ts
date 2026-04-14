import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { loadStripe } from '@stripe/stripe-react-native';

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
  console.error('Stripe API Error:', err.response?.data || err.message);
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
// 📊 STRIPE PAYMENT TYPES
// ======================================================
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'processing';
export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'contracted' | 'media_submitted' | 'completed';

export interface Payment {
  _id?: string;
  id?: string;
  campaign_id: string;
  campaign_title?: string;
  brand_id: string;
  brand_name?: string;
  influencer_id: string;
  influencer_name?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  payment_intent_id?: string;
  transaction_id?: string;
  created_at: string;
  updated_at?: string;
  completed_at?: string;
  metadata?: {
    campaign_title?: string;
    influencer_name?: string;
    brand_name?: string;
  };
}

export interface Application {
  _id?: string;
  id?: string;
  campaign_id: string;
  campaign_title?: string;
  campaign_budget?: number;
  campaign_currency?: string;
  campaign_image_id?: string;
  influencer_id: string;
  influencer_name?: string;
  status: ApplicationStatus;
  budget?: number;
  currency?: string;
  message?: string;
  submitted_media?: MediaFile[];
  created_at: string;
  updated_at?: string;
  title?: string;
  applied_at?: string;
}

export interface MediaFile {
  file_id: string;
  filename: string;
  media_type: 'image' | 'video' | 'audio' | 'document';
  size?: number;
  description?: string;
  submitted_at: string;
  influencer_id?: string;
  campaign_id?: string;
  url?: string;
}

export interface CreatePaymentIntentRequest {
  campaign_id: string;
  influencer_id: string;
  amount: number;
  currency: string;
}

export interface CreatePaymentIntentResponse {
  success: boolean;
  payment_intent_id: string;
  client_secret: string;
  amount: number;
  currency: string;
  message?: string;
}

export interface ConfirmPaymentRequest {
  payment_intent_id: string;
  payment_method_id: string;
}

export interface ConfirmPaymentResponse {
  success: boolean;
  message: string;
  payment_id?: string;
  transaction_id?: string;
  amount?: number;
  currency?: string;
  status?: string;
}

export interface PaymentHistoryResponse {
  success: boolean;
  payments: Payment[];
  total: number;
}

export interface PaymentEligibilityResponse {
  success: boolean;
  is_eligible: boolean;
  campaign_title: string;
  influencer_name: string;
  message: string;
}

// ======================================================
// 🚀 STRIPE API METHODS
// ======================================================

/**
 * Create a Stripe Payment Intent
 */
export const createPaymentIntent = async (
  data: CreatePaymentIntentRequest
): Promise<CreatePaymentIntentResponse> => {
  return request('post', '/stripe/create-payment-intent', data);
};

/**
 * Confirm Stripe Payment
 */
export const confirmPayment = async (
  data: ConfirmPaymentRequest
): Promise<ConfirmPaymentResponse> => {
  return request('post', '/stripe/confirm-payment', data);
};

/**
 * Get payment history for current user
 */
export const getPaymentHistory = async (): Promise<PaymentHistoryResponse> => {
  return request('get', '/history');
};

/**
 * Check if a campaign is eligible for payment
 */
export const checkPaymentEligibility = async (
  campaignId: string,
  influencerId: string
): Promise<PaymentEligibilityResponse> => {
  return request('get', `/campaigns/${campaignId}/influencer/${influencerId}/eligibility`);
};

/**
 * Get payment details by ID
 */
export const getPaymentDetails = async (paymentId: string): Promise<{ success: boolean; payment: Payment }> => {
  return request('get', `/${paymentId}`);
};

/**
 * Get campaign media files
 */
export const getCampaignMediaFiles = async (
  campaignId: string,
  influencerId?: string
): Promise<MediaFile[]> => {
  const params: any = { campaign_id: campaignId };
  if (influencerId) params.influencer_id = influencerId;
  
  return request('get', '/campaigns/media', undefined, params);
};

/**
 * Download media file
 */
export const downloadMediaFile = async (
  fileId: string,
  filename: string
): Promise<void> => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    const url = `${API_BASE_URL}/api/media/${fileId}/download`;
    
    const downloadResumable = FileSystem.createDownloadResumable(
      url,
      FileSystem.documentDirectory + filename,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    
    const result = await downloadResumable.downloadAsync();
    
    if (result?.uri && await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(result.uri);
    } else if (result?.uri) {
      alert(`File saved to: ${result.uri}`);
    }
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
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
 * Get status color and icon
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
    refunded: {
      color: '#8B5CF6',
      backgroundColor: '#EDE9FE',
      icon: 'refresh-ccw',
      label: 'Refunded',
    },
    media_submitted: {
      color: '#9C27B0',
      backgroundColor: '#F3E5F5',
      icon: 'image',
      label: 'Ready for Payment',
    },
  };
  
  return configs[status] || configs.pending;
};

/**
 * Get application status config
 */
export const getApplicationStatusConfig = (status: string): {
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
    approved: {
      color: '#10B981',
      backgroundColor: '#D1FAE5',
      icon: 'check-circle',
      label: 'Approved',
    },
    rejected: {
      color: '#EF4444',
      backgroundColor: '#FEE2E2',
      icon: 'x-circle',
      label: 'Rejected',
    },
    contracted: {
      color: '#3B82F6',
      backgroundColor: '#DBEAFE',
      icon: 'file-text',
      label: 'Contracted',
    },
    media_submitted: {
      color: '#9C27B0',
      backgroundColor: '#F3E5F5',
      icon: 'image',
      label: 'Media Submitted',
    },
    completed: {
      color: '#10B981',
      backgroundColor: '#D1FAE5',
      icon: 'check-circle',
      label: 'Completed',
    },
  };
  
  return configs[status] || configs.pending;
};

/**
 * Get media type icon
 */
export const getMediaTypeIcon = (mediaType: string): string => {
  const icons: Record<string, string> = {
    image: 'image',
    video: 'play-circle',
    audio: 'music',
    document: 'file-text',
  };
  return icons[mediaType] || 'file';
};

// ======================================================
// 📦 EXPORT
// ======================================================
const stripeAPI = {
  createPaymentIntent,
  confirmPayment,
  getPaymentHistory,
  checkPaymentEligibility,
  getPaymentDetails,
  getCampaignMediaFiles,
  downloadMediaFile,
  formatCurrency,
  formatDate,
  getPaymentStatusConfig,
  getApplicationStatusConfig,
  getMediaTypeIcon,
};

export default stripeAPI;