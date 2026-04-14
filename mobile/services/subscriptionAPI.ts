import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://quickbox-backend-docker-b9cbaye9a3bvhad5.southindia-01.azurewebsites.net';

const BASE_URL = `${API_BASE_URL}/subscriptions`;

// ======================================================
// 🔐 AUTH HELPERS
// ======================================================
const getAuthHeader = async () => {
  const token = await AsyncStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleError = (err: any) => {
  console.error('Subscription API Error:', err.response?.data || err.message);
  const errorData = err.response?.data || { error: err.message };
  throw errorData;
};

const request = async (method: string, url: string, data?: any) => {
  try {
    const headers = await getAuthHeader();
    
    const res = await axios({
      method,
      url: `${BASE_URL}${url}`,
      data,
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
// 📊 SUBSCRIPTION TYPES
// ======================================================
export interface Plan {
  key: string;
  plan: string;
  price_id: string | null;
  billing_cycle: 'monthly' | 'yearly' | 'trial';
  is_free?: boolean;
  featured?: boolean;
}

export interface SubscriptionStatus {
  type: 'trial' | 'paid' | 'free';
  plan: string;
  status: 'active' | 'inactive' | 'past_due' | 'canceled';
  is_active: boolean;
  is_trial: boolean;
  current_period_start?: string;
  current_period_end?: string;
  trial_start?: string;
  trial_end?: string;
  cancel_at?: string;
  canceled_at?: string;
  limits?: {
    max_campaigns?: number;
    max_influencers?: number;
    max_emails?: number;
    max_sms?: number;
    has_api_access?: boolean;
    has_analytics?: boolean;
    has_custom_branding?: boolean;
  };
  usage?: {
    campaigns_used: number;
    influencers_used: number;
    emails_sent: number;
    sms_sent: number;
  };
}

export interface CreateSubscriptionRequest {
  plan_key: string;
  payment_method_id?: string;
}

export interface CreateSubscriptionResponse {
  stripe_subscription_id?: string;
  client_secret?: string;
  status: string;
  message: string;
  requires_action?: boolean;
}

// ======================================================
// 🚀 SUBSCRIPTION API METHODS
// ======================================================

/**
 * Get current user's subscription status
 */
export const getSubscriptionStatus = async (): Promise<SubscriptionStatus> => {
  return request('get', '/me');
};

/**
 * Get all available subscription plans
 */
export const getAllPlans = async (): Promise<{ plans: Plan[] }> => {
  return request('get', '/all-plans');
};

/**
 * Create a new subscription (paid or free trial)
 */
export const createSubscription = async (
  planKey: string,
  paymentMethodId?: string
): Promise<CreateSubscriptionResponse> => {
  const data: CreateSubscriptionRequest = {
    plan_key: planKey,
  };
  
  if (paymentMethodId) {
    data.payment_method_id = paymentMethodId;
  }
  
  return request('post', '/create', data);
};

/**
 * Cancel current subscription
 */
export const cancelSubscription = async (): Promise<{ message: string }> => {
  return request('post', '/cancel');
};

/**
 * Sync subscription status with Stripe
 */
export const syncSubscriptionStatus = async (): Promise<{ message: string }> => {
  return request('post', '/sync-status');
};

/**
 * Test endpoint - check if Stripe is configured
 */
export const testCreateSubscription = async (planKey: string): Promise<any> => {
  return request('post', '/test-create', { plan_key: planKey });
};

/**
 * Get all subscriptions (admin only)
 */
export const getAllSubscriptions = async (): Promise<any[]> => {
  return request('get', '/all');
};

/**
 * Debug user subscriptions (admin only)
 */
export const debugUserSubscriptions = async (userEmail: string): Promise<any> => {
  return request('get', `/debug/${encodeURIComponent(userEmail)}`);
};

// ======================================================
// 📱 HELPER FUNCTIONS FOR UI
// ======================================================

/**
 * Format date for display
 */
export const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Calculate days remaining until period end
 */
export const getDaysRemaining = (endDateString?: string): number => {
  if (!endDateString) return 0;
  const end = new Date(endDateString).getTime();
  const now = new Date().getTime();
  const diff = end - now;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

/**
 * Calculate progress percentage for current period
 */
export const getPeriodProgress = (
  startDateString?: string,
  endDateString?: string
): number => {
  if (!startDateString || !endDateString) return 0;
  
  const start = new Date(startDateString).getTime();
  const end = new Date(endDateString).getTime();
  const now = new Date().getTime();
  
  const total = end - start;
  const elapsed = now - start;
  
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
};

/**
 * Check if a feature is available in current plan
 */
export const hasFeature = (
  subscription: SubscriptionStatus | null,
  feature: keyof SubscriptionStatus['limits']
): boolean => {
  if (!subscription?.limits) return false;
  
  // If limit is undefined or null, feature is not available
  if (subscription.limits[feature] === undefined) return false;
  
  // For boolean features
  if (typeof subscription.limits[feature] === 'boolean') {
    return subscription.limits[feature] as boolean;
  }
  
  // For numeric features, check if used count is within limit
  if (typeof subscription.limits[feature] === 'number') {
    const limit = subscription.limits[feature] as number;
    if (limit === 0) return false; // 0 means not available
    if (limit === null) return true; // null means unlimited
    
    // Check usage if available
    const usageKey = `${String(feature).replace('max_', '')}_used` as keyof SubscriptionStatus['usage'];
    const used = subscription.usage?.[usageKey] || 0;
    return used < limit;
  }
  
  return true;
};

/**
 * Get plan display name based on role
 */
export const getPlanDisplayName = (
  planKey: string,
  userRole: 'brand' | 'influencer' = 'brand'
): string => {
  const planMap: Record<string, Record<string, string>> = {
    free_trial: { brand: 'Free Trial', influencer: 'Free Trial' },
    starter_monthly: { brand: 'Starter', influencer: 'Basic' },
    starter_yearly: { brand: 'Starter', influencer: 'Basic' },
    pro_monthly: { brand: 'Pro', influencer: 'Pro' },
    pro_yearly: { brand: 'Pro', influencer: 'Pro' },
    enterprise_monthly: { brand: 'Enterprise', influencer: 'Premium' },
    enterprise_yearly: { brand: 'Enterprise', influencer: 'Premium' },
  };
  
  return planMap[planKey]?.[userRole] || planKey;
};

/**
 * Get plan level for styling
 */
export const getPlanLevel = (planKey: string): 'starter' | 'pro' | 'enterprise' | 'free' => {
  if (planKey.includes('starter')) return 'starter';
  if (planKey.includes('pro')) return 'pro';
  if (planKey.includes('enterprise')) return 'enterprise';
  return 'free';
};

/**
 * Get features based on role and plan
 */
export const getPlanFeatures = (
  planKey: string,
  userRole: 'brand' | 'influencer' = 'brand'
): { text: string; icon: string }[] => {
  const features: Record<string, Record<string, { text: string; icon: string }[]>> = {
    free_trial: {
      brand: [
        { text: "15-day free trial", icon: "timer" },
        { text: "1 active campaign", icon: "rocket" },
        { text: "Up to 10 influencers", icon: "group" },
        { text: "Basic analytics", icon: "analytics" },
        { text: "Email support", icon: "support-agent" },
      ],
      influencer: [
        { text: "15-day free trial", icon: "timer" },
        { text: "Basic profile listing", icon: "verified-user" },
        { text: "Apply to 3 campaigns/month", icon: "campaign" },
        { text: "Basic analytics", icon: "analytics" },
        { text: "Email support", icon: "support-agent" },
      ]
    },
    starter_monthly: {
      brand: [
        { text: "5 active campaigns", icon: "rocket" },
        { text: "Up to 50 influencers", icon: "group" },
        { text: "Advanced analytics", icon: "analytics" },
        { text: "Priority email support", icon: "support-agent" },
        { text: "Collaboration chat (10 users)", icon: "chat" },
      ],
      influencer: [
        { text: "Apply to 10 campaigns/month", icon: "campaign" },
        { text: "Verified profile badge", icon: "verified-user" },
        { text: "Portfolio showcase (10 items)", icon: "photo-library" },
        { text: "Advanced analytics", icon: "analytics" },
        { text: "Priority email support", icon: "support-agent" },
      ]
    },
    starter_yearly: {
      brand: [
        { text: "5 active campaigns", icon: "rocket" },
        { text: "Up to 50 influencers", icon: "group" },
        { text: "Advanced analytics", icon: "analytics" },
        { text: "Priority email support", icon: "support-agent" },
        { text: "Save with yearly billing", icon: "trending-up" },
      ],
      influencer: [
        { text: "Apply to 10 campaigns/month", icon: "campaign" },
        { text: "Verified profile badge", icon: "verified-user" },
        { text: "Portfolio showcase (10 items)", icon: "photo-library" },
        { text: "Advanced analytics", icon: "analytics" },
        { text: "Save with yearly billing", icon: "trending-up" },
      ]
    },
    pro_monthly: {
      brand: [
        { text: "20 active campaigns", icon: "rocket" },
        { text: "Up to 200 influencers", icon: "group" },
        { text: "Premium analytics", icon: "analytics" },
        { text: "Phone & email support", icon: "support-agent" },
        { text: "API access", icon: "api" },
      ],
      influencer: [
        { text: "Apply to 30 campaigns/month", icon: "campaign" },
        { text: "Premium verified badge", icon: "verified-user" },
        { text: "Portfolio showcase (50 items)", icon: "photo-library" },
        { text: "Premium analytics", icon: "analytics" },
        { text: "Priority support", icon: "support-agent" },
      ]
    },
    pro_yearly: {
      brand: [
        { text: "20 active campaigns", icon: "rocket" },
        { text: "Up to 200 influencers", icon: "group" },
        { text: "Premium analytics", icon: "analytics" },
        { text: "Phone & email support", icon: "support-agent" },
        { text: "Save with yearly billing", icon: "trending-up" },
      ],
      influencer: [
        { text: "Apply to 30 campaigns/month", icon: "campaign" },
        { text: "Premium verified badge", icon: "verified-user" },
        { text: "Portfolio showcase (50 items)", icon: "photo-library" },
        { text: "Premium analytics", icon: "analytics" },
        { text: "Save with yearly billing", icon: "trending-up" },
      ]
    },
    enterprise_monthly: {
      brand: [
        { text: "Unlimited campaigns", icon: "rocket" },
        { text: "Unlimited influencers", icon: "group" },
        { text: "Enterprise analytics", icon: "analytics" },
        { text: "24/7 dedicated support", icon: "support-agent" },
        { text: "Full API access", icon: "api" },
      ],
      influencer: [
        { text: "Unlimited campaign applications", icon: "campaign" },
        { text: "Enterprise verified badge", icon: "workspace-premium" },
        { text: "Unlimited portfolio items", icon: "photo-library" },
        { text: "Enterprise analytics", icon: "analytics" },
        { text: "24/7 dedicated support", icon: "support-agent" },
      ]
    },
    enterprise_yearly: {
      brand: [
        { text: "Unlimited campaigns", icon: "rocket" },
        { text: "Unlimited influencers", icon: "group" },
        { text: "Enterprise analytics", icon: "analytics" },
        { text: "24/7 dedicated support", icon: "support-agent" },
        { text: "Save with yearly billing", icon: "trending-up" },
      ],
      influencer: [
        { text: "Unlimited campaign applications", icon: "campaign" },
        { text: "Enterprise verified badge", icon: "workspace-premium" },
        { text: "Unlimited portfolio items", icon: "photo-library" },
        { text: "Enterprise analytics", icon: "analytics" },
        { text: "Save with yearly billing", icon: "trending-up" },
      ]
    }
  };

  const plan = planKey.replace('_monthly', '').replace('_yearly', '');
  const planKeyNormalized = planKey.includes('yearly') ? `${plan}_yearly` : `${plan}_monthly`;
  
  const planFeatures = features[planKeyNormalized] || features[planKey] || {};
  return planFeatures[userRole] || planFeatures.brand || [];
};

/**
 * Get highlights based on role and plan
 */
export const getPlanHighlights = (
  planKey: string,
  userRole: 'brand' | 'influencer' = 'brand'
): string[] => {
  const highlights: Record<string, Record<string, string[]>> = {
    free_trial: {
      brand: [
        "15-day free trial",
        "1 active campaign", 
        "Up to 10 influencers",
        "Basic analytics",
        "Email support"
      ],
      influencer: [
        "15-day free trial",
        "Basic profile listing",
        "Apply to 3 campaigns/month",
        "Basic analytics",
        "Email support"
      ]
    },
    starter_monthly: {
      brand: [
        "5 active campaigns",
        "Up to 50 influencers",
        "Collaboration chat (10 users)",
        "Priority email support",
        "Advanced analytics"
      ],
      influencer: [
        "Apply to 10 campaigns/month",
        "Verified profile badge",
        "Portfolio showcase (10 items)",
        "Priority email support",
        "Advanced analytics"
      ]
    },
    starter_yearly: {
      brand: [
        "5 active campaigns",
        "Up to 50 influencers", 
        "Save 17% with yearly",
        "Priority email support",
        "Advanced analytics"
      ],
      influencer: [
        "Apply to 10 campaigns/month",
        "Verified profile badge",
        "Save 17% with yearly",
        "Priority email support",
        "Advanced analytics"
      ]
    },
    pro_monthly: {
      brand: [
        "20 active campaigns", 
        "Up to 200 influencers",
        "API access",
        "Phone & email support",
        "Premium analytics"
      ],
      influencer: [
        "Apply to 30 campaigns/month",
        "Premium verified badge",
        "Portfolio showcase (50 items)",
        "Priority support",
        "Premium analytics"
      ]
    },
    pro_yearly: {
      brand: [
        "20 active campaigns",
        "Up to 200 influencers",
        "Save 17% with yearly",
        "Phone & email support", 
        "Premium analytics"
      ],
      influencer: [
        "Apply to 30 campaigns/month",
        "Premium verified badge",
        "Save 17% with yearly",
        "Priority support",
        "Premium analytics"
      ]
    },
    enterprise_monthly: {
      brand: [
        "Unlimited campaigns & influencers",
        "Full API access", 
        "24/7 dedicated support",
        "Enterprise analytics",
        "Custom branding"
      ],
      influencer: [
        "Unlimited campaign applications",
        "Enterprise verified badge",
        "24/7 dedicated support",
        "Unlimited portfolio items",
        "Enterprise analytics"
      ]
    },
    enterprise_yearly: {
      brand: [
        "Unlimited campaigns & influencers",
        "Full API access",
        "Save 17% with yearly",
        "24/7 dedicated support", 
        "Custom branding"
      ],
      influencer: [
        "Unlimited campaign applications",
        "Enterprise verified badge",
        "Save 17% with yearly",
        "24/7 dedicated support",
        "Enterprise analytics"
      ]
    }
  };
  
  const plan = planKey.replace('_monthly', '').replace('_yearly', '');
  const planKeyNormalized = planKey.includes('yearly') ? `${plan}_yearly` : `${plan}_monthly`;
  
  const planHighlights = highlights[planKeyNormalized] || highlights[planKey] || {};
  return planHighlights[userRole] || planHighlights.brand || [];
};

// ======================================================
// 📦 EXPORT
// ======================================================
const subscriptionAPI = {
  getSubscriptionStatus,
  getAllPlans,
  createSubscription,
  cancelSubscription,
  syncSubscriptionStatus,
  testCreateSubscription,
  getAllSubscriptions,
  debugUserSubscriptions,
  
  // Helper functions
  formatDate,
  getDaysRemaining,
  getPeriodProgress,
  hasFeature,
  getPlanDisplayName,
  getPlanLevel,
  getPlanFeatures,
  getPlanHighlights,
};

export default subscriptionAPI;