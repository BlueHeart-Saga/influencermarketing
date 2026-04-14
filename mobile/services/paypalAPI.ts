import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://quickbox-backend-docker-b9cbaye9a3bvhad5.southindia-01.azurewebsites.net';

const BASE_URL = `${API_BASE_URL}/api/payments/paypal`;

// ======================================================
// 🔐 AUTH HELPERS
// ======================================================
const getAuthHeader = async () => {
  const token = await AsyncStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleError = (err: any) => {
  console.error('PayPal API Error:', err.response?.data || err.message);
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
// 📊 PAYPAL PAYMENT TYPES
// ======================================================
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'processing' | 'created' | 'approved' | 'cancelled';
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
  order_id?: string;
  transaction_id?: string;
  payment_gateway?: string;
  created_at: string;
  updated_at?: string;
  completed_at?: string;
  metadata?: {
    campaign_title?: string;
    influencer_name?: string;
    brand_name?: string;
    description?: string;
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

export interface CreatePayPalOrderRequest {
  campaign_id: string;
  influencer_id: string;
  amount: number;
  currency: string;
  description: string;
}

export interface CreatePayPalOrderResponse {
  success: boolean;
  order_id: string;
  approval_url: string;
  amount: number;
  currency: string;
  status: string;
  message?: string;
}

export interface CapturePayPalOrderRequest {
  order_id: string;
  payer_id?: string;
}

export interface CapturePayPalOrderResponse {
  success: boolean;
  transaction_id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: string;
  payer_email?: string;
  payer_name?: string;
  message?: string;
}

export interface PaymentHistoryResponse {
  success: boolean;
  payments: Payment[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface PaymentEligibilityResponse {
  success: boolean;
  is_eligible: boolean;
  campaign_title: string;
  influencer_name: string;
  message: string;
}

export interface PaymentDetailsResponse {
  success: boolean;
  payment: Payment;
}

// ======================================================
// 🚀 PAYPAL API METHODS
// ======================================================

/**
 * Create a PayPal order
 */
export const createOrder = async (
  data: CreatePayPalOrderRequest
): Promise<CreatePayPalOrderResponse> => {
  return request('post', '/create-order', data);
};

/**
 * Capture a PayPal payment
 */
export const captureOrder = async (
  data: CapturePayPalOrderRequest
): Promise<CapturePayPalOrderResponse> => {
  return request('post', '/capture-order', data);
};

/**
 * Get payment history for current user
 */
export const getPaymentHistory = async (
  page: number = 1,
  limit: number = 20,
  status?: string
): Promise<PaymentHistoryResponse> => {
  const params: any = { page, limit };
  if (status) params.status = status;
  return request('get', '/payment-history', undefined, params);
};

/**
 * Get payment details by ID
 */
export const getPaymentDetails = async (paymentId: string): Promise<PaymentDetailsResponse> => {
  return request('get', `/payments/${paymentId}`);
};

/**
 * Get order details from PayPal
 */
export const getOrderDetails = async (orderId: string): Promise<any> => {
  return request('get', `/orders/${orderId}`);
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
    created: {
      color: '#0066CC',
      backgroundColor: '#E3F2FD',
      icon: 'file-text',
      label: 'Created',
    },
    approved: {
      color: '#0066CC',
      backgroundColor: '#E3F2FD',
      icon: 'check-circle',
      label: 'Approved',
    },
    cancelled: {
      color: '#EF4444',
      backgroundColor: '#FEE2E2',
      icon: 'x-circle',
      label: 'Cancelled',
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

/**
 * Calculate estimated PayPal fee
 */
export const calculatePayPalFee = (amount: number): number => {
  // PayPal standard fee: 2.9% + $0.30
  return amount * 0.029 + 0.30;
};

// ======================================================
// 📦 EXPORT
// ======================================================
const paypalAPI = {
  createOrder,
  captureOrder,
  getPaymentHistory,
  getPaymentDetails,
  getOrderDetails,
  checkPaymentEligibility,
  getCampaignMediaFiles,
  downloadMediaFile,
  formatCurrency,
  formatDate,
  getPaymentStatusConfig,
  getApplicationStatusConfig,
  getMediaTypeIcon,
  calculatePayPalFee,
};

export default paypalAPI;