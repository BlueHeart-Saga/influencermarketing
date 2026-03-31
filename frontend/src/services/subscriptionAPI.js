// services/subscriptionAPI.js
import API_BASE_URL from '../config/api';

class SubscriptionAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async getAuthHeader() {
    const token = localStorage.getItem('access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async getCurrentSubscription() {
    try {
      const response = await fetch(`${this.baseURL}/subscriptions/me`, {
        headers: await this.getAuthHeader()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching subscription:', error);
      throw error;
    }
  }

  async getChatLimits() {
    try {
      const response = await fetch(`${this.baseURL}/chat/limits`, {
        headers: await this.getAuthHeader()
      });
      
      if (!response.ok) {
        // If endpoint doesn't exist, fall back to general subscription
        return await this.getCurrentSubscription();
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching chat limits:', error);
      // Fall back to general subscription
      return await this.getCurrentSubscription();
    }
  }

  async getPlanFeatures() {
    try {
      const response = await fetch(`${this.baseURL}/subscriptions/plans`, {
        headers: await this.getAuthHeader()
      });
      
      if (!response.ok) {
        // Return default plans if endpoint doesn't exist
        return this.getDefaultPlans();
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching plan features:', error);
      return this.getDefaultPlans();
    }
  }

  getDefaultPlans() {
    return {
      trial: {
        name: "Free Trial",
        max_conversations: 1,
        daily_message_limit: 50,
        max_media_uploads: 0,
        allowed_message_types: ["text"],
        price: 0,
        features: ["1 active conversation", "50 messages/day", "Text messages only"]
      },
      starter: {
        name: "Starter",
        max_conversations: 10,
        daily_message_limit: 200,
        max_media_uploads: 50,
        allowed_message_types: ["text", "image", "document"],
        price: 29,
        features: ["10 conversations", "200 messages/day", "Image & document support"]
      },
      pro: {
        name: "Professional",
        max_conversations: 25,
        daily_message_limit: 1000,
        max_media_uploads: 200,
        allowed_message_types: ["text", "image", "video", "audio", "document"],
        price: 79,
        features: ["25 conversations", "1000 messages/day", "All media types", "Priority support"]
      },
      enterprise: {
        name: "Enterprise",
        max_conversations: null, // Unlimited
        daily_message_limit: null, // Unlimited
        max_media_uploads: null, // Unlimited
        allowed_message_types: ["text", "image", "video", "audio", "document", "archive"],
        price: null, // Custom
        features: ["Unlimited conversations", "Unlimited messages", "All features", "Dedicated support"]
      }
    };
  }

  async checkMessagePermission(messageType = 'text') {
    const limits = await this.getChatLimits();
    return this.hasMessagePermission(limits, messageType);
  }

  async checkConversationPermission() {
    const limits = await this.getChatLimits();
    return this.hasConversationPermission(limits);
  }

  hasMessagePermission(limits, messageType = 'text') {
    if (!limits) return true;

    // Check daily message limit
    if (limits.daily_message_limit && 
        limits.today_messages >= limits.daily_message_limit) {
      return {
        allowed: false,
        reason: `Daily message limit reached (${limits.daily_message_limit}). Upgrade your plan to continue messaging.`
      };
    }

    // Check media permissions
    if (messageType !== 'text') {
      const allowedTypes = limits.allowed_message_types || ['text'];
      if (!allowedTypes.includes(messageType)) {
        return {
          allowed: false,
          reason: `Your ${limits.plan_tier} plan doesn't support ${messageType} messages. Upgrade to send media files.`
        };
      }

      // Check media upload limit
      if (limits.max_media_uploads && 
          limits.media_uploads_used >= limits.max_media_uploads) {
        return {
          allowed: false,
          reason: `Media upload limit reached (${limits.max_media_uploads}). Upgrade your plan for more media uploads.`
        };
      }
    }

    return { allowed: true };
  }

  hasConversationPermission(limits) {
    if (!limits) return { allowed: true };

    if (limits.max_conversations && 
        limits.current_conversations >= limits.max_conversations) {
      return {
        allowed: false,
        reason: `Conversation limit reached (${limits.max_conversations}). Upgrade your plan to start more conversations.`
      };
    }

    return { allowed: true };
  }
}

export default SubscriptionAPI();