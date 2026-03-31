// utils/subscriptionUtils.js
import API_BASE_URL from '../../config/api';

// Subscription utility functions
export const getPlanDisplayName = (planType) => {
  switch (planType?.toLowerCase()) {
    case 'free':
      return 'Free';
    case 'trial':
      return 'Trial';
    case 'starter':
      return 'Starter';
    case 'pro':
      return 'Pro';
    case 'enterprise':
      return 'Enterprise';
    case 'business':
      return 'Business';
    default:
      return 'Free';
  }
};

export const getPlanColor = (planType) => {
  switch (planType?.toLowerCase()) {
    case 'free':
      return '#6c757d';
    case 'trial':
      return '#17a2b8';
    case 'starter':
      return '#28a745';
    case 'pro':
      return '#007bff';
    case 'enterprise':
      return '#6610f2';
    case 'business':
      return '#dc3545';
    default:
      return '#6c757d';
  }
};

export const checkMessagePermission = async (token, messageType = 'text') => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/can-initiate`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      
      if (messageType === 'text') {
        return {
          allowed: data.can_initiate,
          message: data.reason || 'Can send messages'
        };
      }
      
      // For media messages
      if (messageType === 'media') {
        const canSendMedia = data.features?.can_send_media;
        return {
          allowed: canSendMedia,
          message: canSendMedia ? 'Can send media' : 'Media sending not allowed in your plan'
        };
      }
    }
    
    return { allowed: true, message: 'Can send messages' };
  } catch (error) {
    console.error('Error checking message permission:', error);
    return { allowed: true, message: 'Can send messages' };
  }
};

export const fetchChatUsage = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/usage`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error('Error fetching chat usage:', error);
    return null;
  }
};

export const checkConversationLimit = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/can-initiate`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      return {
        allowed: data.can_initiate,
        message: data.reason,
        limits: data.limits
      };
    }
    
    return { allowed: true, message: 'Can initiate conversation' };
  } catch (error) {
    console.error('Error checking conversation limit:', error);
    return { allowed: true, message: 'Can initiate conversation' };
  }
};

// New function to get subscription tier info
export const getSubscriptionTierInfo = (subscriptionData) => {
  if (!subscriptionData) return null;
  
  const planType = subscriptionData.subscription?.plan_type || 'free';
  const isActive = subscriptionData.subscription?.is_active !== false;
  const isTrial = subscriptionData.subscription?.is_trial === true;
  
  return {
    planType,
    planName: getPlanDisplayName(planType),
    planColor: getPlanColor(planType),
    isActive,
    isTrial,
    remainingDays: subscriptionData.subscription?.trial_remaining_days || 0,
    features: subscriptionData.features || {}
  };
};

// Check if user can send media
export const canSendMedia = (subscriptionData) => {
  if (!subscriptionData) return true;
  return subscriptionData.features?.can_send_media !== false;
};

// Check if user can video call
export const canVideoCall = (subscriptionData) => {
  if (!subscriptionData) return false;
  return subscriptionData.features?.can_video_call === true;
};

// Get daily message limit info
export const getDailyMessageInfo = (subscriptionData) => {
  if (!subscriptionData) return { used: 0, limit: 100, remaining: 100 };
  
  const usage = subscriptionData.usage?.messages || {};
  const limits = subscriptionData.features || {};
  
  return {
    used: usage.today || 0,
    limit: limits.daily_message_limit || 100,
    remaining: Math.max(0, (limits.daily_message_limit || 100) - (usage.today || 0))
  };
};