import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

export interface GenerateRequest {
  prompt: string;
  model?: string;
  max_tokens?: number;
}

export interface GenerateResponse {
  success: boolean;
  generated_text: string;
  usage: {
    tokens_used: number;
    model_used: string;
    remaining_today: number;
    daily_limit: number;
  };
  plan_info: {
    plan_name: string;
    type: string;
    remaining_days: number;
  };
}

export interface LimitsResponse {
  success: boolean;
  user_email: string;
  plan: string;
  plan_key: string;
  plan_type: string;
  limits: {
    max_generations_per_day: number;
    max_tokens: number;
    allowed_models: string[];
    can_generate_content: boolean;
    features: string[];
  };
  usage_stats: {
    today_usage: number;
    daily_limit: number;
    remaining_today: number;
    total_generations: number;
    max_tokens: number;
    allowed_models: string[];
    plan_name: string;
  };
  can_analyze: boolean;
  subscription_data: {
    is_active: boolean;
    is_trial: boolean;
    remaining_days: number;
    trial_remaining_days: number;
  };
}

export interface StatsResponse {
  success: boolean;
  user_email: string;
  stats: {
    today_usage: number;
    daily_limit: number;
    remaining_today: number;
    total_generations: number;
    max_tokens: number;
    allowed_models: string[];
    plan_name: string;
    weekly_usage?: Array<{
      date: string;
      count: number;
      tokens: number;
    }>;
  };
  subscription: {
    plan: string;
    type: string;
    is_active: boolean;
    remaining_days: number;
    trial_remaining_days: number;
    current_period_end?: string;
  };
}

class ContentIntelligenceAPI {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string = API_BASE_URL, timeout: number = 60000) {
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

      const response = await fetch(`${this.baseURL}/api/content${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle specific status codes
      if (response.status === 403) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.detail) {
          if (typeof errorData.detail === 'object') {
            throw new Error(errorData.detail.message || 'Daily limit reached');
          }
          throw new Error(errorData.detail);
        }
        throw new Error('Daily limit reached. Please upgrade your plan.');
      }

      if (response.status === 401) {
        throw new Error('Please login to use this feature');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (errorData.detail) {
          if (typeof errorData.detail === 'object') {
            throw new Error(errorData.detail.message || JSON.stringify(errorData.detail));
          }
          throw new Error(errorData.detail);
        }
        
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      clearTimeout(timeid);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please check your connection.');
      }
      
      throw error;
    }
  }

  // Get content generation limits
  async getContentLimits(options?: { signal?: AbortSignal }): Promise<LimitsResponse> {
    return this.request<LimitsResponse>('/limits', {
      signal: options?.signal,
    });
  }

  // Get user stats
  async getUserStats(options?: { signal?: AbortSignal }): Promise<StatsResponse> {
    return this.request<StatsResponse>('/stats', {
      signal: options?.signal,
    });
  }

  // Generate content
  async generateContent(
    data: GenerateRequest,
    options?: { signal?: AbortSignal }
  ): Promise<GenerateResponse> {
    return this.request<GenerateResponse>('/generate', {
      method: 'POST',
      body: JSON.stringify(data),
      signal: options?.signal,
    });
  }

  // Reset usage (admin only - for testing)
  async resetUsage(options?: { signal?: AbortSignal }): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>('/reset-usage', {
      method: 'POST',
      signal: options?.signal,
    });
  }

  // Cache management
  async cacheLimits(limits: LimitsResponse): Promise<void> {
    try {
      await AsyncStorage.setItem('content_intelligence_limits', JSON.stringify({
        data: limits,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.error('Error caching limits:', error);
    }
  }

  async getCachedLimits(maxAge: number = 5 * 60 * 1000): Promise<LimitsResponse | null> {
    try {
      const cached = await AsyncStorage.getItem('content_intelligence_limits');
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < maxAge) {
          return data;
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting cached limits:', error);
      return null;
    }
  }

  async saveGenerationHistory(history: any[]): Promise<void> {
    try {
      await AsyncStorage.setItem('content_generation_history', JSON.stringify(history));
    } catch (error) {
      console.error('Error saving history:', error);
    }
  }

  async loadGenerationHistory(): Promise<any[]> {
    try {
      const history = await AsyncStorage.getItem('content_generation_history');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error loading history:', error);
      return [];
    }
  }

  async clearHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem('content_generation_history');
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  }

  // Available models with descriptions
  getAvailableModels(): Array<{ id: string; name: string; maxTokens: number; description: string }> {
    return [
      { 
        id: 'command-a-03-2025', 
        name: 'Command (Standard)', 
        maxTokens: 500,
        description: 'Balanced performance for most content needs'
      },
      { 
        id: 'command-r-plus', 
        name: 'Command R+ (Enhanced)', 
        maxTokens: 1000,
        description: 'Enhanced quality for complex content'
      },
      { 
        id: 'command-light', 
        name: 'Command Light (Fast)', 
        maxTokens: 2000,
        description: 'Fast generation for simple content'
      },
      { 
        id: 'command-xlarge', 
        name: 'Command XLarge (Premium)', 
        maxTokens: 5000,
        description: 'Premium model for ultra-long content'
      }
    ];
  }

  // Quick prompts for inspiration
  getQuickPrompts(): string[] {
    return [
      "Write a catchy Instagram caption about coffee",
      "Create a professional email subject line",
      "Generate a blog post introduction about AI",
      "Write a product description for a smartwatch",
      "Create a social media post for a fitness app",
      "Write a YouTube video title about productivity",
      "Draft a LinkedIn post about leadership",
      "Create a tweet thread about remote work",
      "Write a Facebook ad for a new restaurant",
      "Generate a TikTok script about fashion tips"
    ];
  }

  // Plan configurations
  getPlans(): Record<string, { 
    name: string; 
    dailyLimit: number; 
    color: string; 
    features: string[];
    badgeColor: string;
  }> {
    return {
      trial: {
        name: 'Free Trial',
        dailyLimit: 10,
        color: '#f59e0b',
        badgeColor: '#f59e0b',
        features: [
          '10 generations/day',
          'Basic models',
          '500 tokens max',
          'Standard quality'
        ]
      },
      starter: {
        name: 'Starter',
        dailyLimit: 50,
        color: '#10b981',
        badgeColor: '#10b981',
        features: [
          '50 generations/day',
          'Enhanced models',
          '1000 tokens max',
          'Better quality'
        ]
      },
      pro: {
        name: 'Pro',
        dailyLimit: 200,
        color: '#3b82f6',
        badgeColor: '#3b82f6',
        features: [
          '200 generations/day',
          'All models',
          '2000 tokens max',
          'High quality'
        ]
      },
      enterprise: {
        name: 'Enterprise',
        dailyLimit: 1000,
        color: '#8b5cf6',
        badgeColor: '#8b5cf6',
        features: [
          '1000 generations/day',
          'Premium models',
          '5000 tokens max',
          'Ultra quality'
        ]
      }
    };
  }

  // Get plan based on subscription
  getPlanKey(subscription: any): string {
    if (!subscription) return 'trial';
    
    const planName = subscription.plan_name?.toLowerCase() || '';
    const planType = subscription.plan?.toLowerCase() || '';
    
    if (planName.includes('enterprise') || planType.includes('enterprise')) return 'enterprise';
    if (planName.includes('pro') || planType.includes('pro')) return 'pro';
    if (planName.includes('starter') || planType.includes('starter')) return 'starter';
    return 'trial';
  }

  // Check if upgrade is needed
  isUpgradeRequired(subscription: any, limits: LimitsResponse | null): boolean {
    if (!subscription?.is_active) return true;
    if (subscription.type === 'trial' && (subscription.trial_remaining_days || 0) <= 0) return true;
    if (limits && !limits.can_analyze) return true;
    return false;
  }

  // Get usage percentage
  getUsagePercentage(used: number, limit: number): number {
    if (limit <= 0) return 0;
    return Math.min(100, Math.round((used / limit) * 100));
  }

  // Get progress color based on usage
  getProgressColor(percentage: number): string {
    if (percentage >= 90) return '#ef4444';
    if (percentage >= 70) return '#f59e0b';
    return '#10b981';
  }

  // Format date for display
  formatDate(dateString?: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  }

  // Format time for display
  formatTime(dateString?: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  }
}

export const contentIntelligenceApi = new ContentIntelligenceAPI();
export default contentIntelligenceApi;