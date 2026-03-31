import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

export interface GenerateRequest {
  prompt: string;
  mode: string;
}

export interface GenerateResponse {
  success: boolean;
  mode: string;
  result: string;
  usage: {
    remaining_today: number;
    daily_limit: number;
    today_usage: number;
  };
}

export interface AnalyzeProductRequest {
  link: string;
}

export interface AnalyzeProductResponse {
  success: boolean;
  data: {
    title: string;
    description: string;
    ai_suggestions: string;
    url: string;
  };
  usage: {
    remaining_today: number;
    daily_limit: number;
    today_usage: number;
  };
}

export interface LimitsResponse {
  success: boolean;
  user_email: string;
  plan: string;
  plan_key: string;
  plan_type: string;
  limits: {
    name: string;
    can_generate_content: boolean;
    max_analyses_per_day: number;
    max_character_limit: number;
    available_modes: string[];
    features: string[];
  };
  usage_stats: {
    today_usage: number;
    daily_limit: number;
    remaining_today: number;
    total_analyses: number;
    max_character_limit: number;
    available_modes: string[];
    plan_name: string;
    plan_type: string;
    is_active: boolean;
    is_trial: boolean;
    remaining_days: number;
    trial_remaining_days: number;
  };
  can_analyze: boolean;
  upgrade_required: boolean;
  subscription_data: {
    is_active: boolean;
    is_trial: boolean;
    remaining_days: number;
    trial_remaining_days: number;
    current_period_end?: string;
  };
}

export interface StatsResponse {
  success: boolean;
  user_email: string;
  stats: {
    today_usage: number;
    daily_limit: number;
    remaining_today: number;
    total_analyses: number;
    max_character_limit: number;
    available_modes: string[];
    plan_name: string;
    plan_type: string;
    is_active: boolean;
    is_trial: boolean;
    remaining_days: number;
    trial_remaining_days: number;
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

class ContentAPI {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string = API_BASE_URL, timeout: number = 30000) {
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
        throw new Error(errorData.detail?.message || 'Daily limit reached. Please upgrade your plan.');
      }

      if (response.status === 401) {
        throw new Error('Please login to use this feature');
      }

      if (response.status === 400) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.detail) {
          if (typeof errorData.detail === 'object') {
            throw new Error(errorData.detail.message || errorData.detail.detail || 'Invalid request');
          }
          throw new Error(errorData.detail);
        }
        throw new Error('Invalid request');
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
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please check your connection.');
      }
      
      throw error;
    }
  }

  // Get content analysis limits
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

  // Analyze product link
  async analyzeProduct(
    data: AnalyzeProductRequest,
    options?: { signal?: AbortSignal }
  ): Promise<AnalyzeProductResponse> {
    return this.request<AnalyzeProductResponse>('/analyze-product', {
      method: 'POST',
      body: JSON.stringify(data),
      signal: options?.signal,
    });
  }

  // Reset usage (admin only)
  async resetUsage(options?: { signal?: AbortSignal }): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>('/reset-usage', {
      method: 'POST',
      signal: options?.signal,
    });
  }

  // Cache management
  async cacheLimits(limits: LimitsResponse): Promise<void> {
    try {
      await AsyncStorage.setItem('content_limits', JSON.stringify({
        data: limits,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.error('Error caching limits:', error);
    }
  }

  async getCachedLimits(maxAge: number = 5 * 60 * 1000): Promise<LimitsResponse | null> {
    try {
      const cached = await AsyncStorage.getItem('content_limits');
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

  // Platform configurations
  getPlatforms(): Array<{ name: string; icon: string; color: string }> {
    return [
      { name: 'Instagram', icon: 'instagram', color: '#E4405F' },
      { name: 'Twitter (X)', icon: 'twitter', color: '#000000' },
      { name: 'LinkedIn', icon: 'linkedin', color: '#0A66C2' },
      { name: 'Facebook', icon: 'facebook', color: '#1877F2' },
      { name: 'TikTok', icon: 'music', color: '#000000' },
      { name: 'YouTube', icon: 'youtube', color: '#FF0000' }
    ];
  }

  // Platform stats
  getPlatformStats(platform: string): {
    length: string;
    hashtags: string;
    bestTime: string;
    tips: string[];
  } {
    const stats: Record<string, { length: string; hashtags: string; bestTime: string; tips: string[] }> = {
      'Instagram': { 
        length: '125-150', 
        hashtags: '9-12', 
        bestTime: '9 AM - 11 AM',
        tips: ['Use high-quality images/videos', 'Include 5-10 relevant hashtags', 'Engage with comments']
      },
      'Twitter (X)': { 
        length: '71-100', 
        hashtags: '1-2', 
        bestTime: '12 PM - 3 PM',
        tips: ['Keep tweets concise', 'Use trending hashtags', 'Include mentions']
      },
      'LinkedIn': { 
        length: '150-200', 
        hashtags: '3-5', 
        bestTime: '8 AM - 10 AM',
        tips: ['Professional tone', 'Industry-specific hashtags', 'Share insights']
      },
      'Facebook': { 
        length: '100-150', 
        hashtags: '2-3', 
        bestTime: '1 PM - 4 PM',
        tips: ['Casual tone', 'Ask questions', 'Share stories']
      },
      'TikTok': { 
        length: '100-150', 
        hashtags: '4-6', 
        bestTime: '5 PM - 9 PM',
        tips: ['Trending sounds', 'Challenges', 'Quick cuts']
      },
      'YouTube': { 
        length: '200-300', 
        hashtags: '5-8', 
        bestTime: '2 PM - 4 PM',
        tips: ['Descriptive titles', 'Timestamps', 'Call to action']
      }
    };
    return stats[platform] || stats['Instagram'];
  }

  // Get templates based on platform
  getTemplates(platform: string): Array<{ label: string; content: string }> {
    const templates: Record<string, Array<{ label: string; content: string }>> = {
      'Instagram': [
        { label: 'Product Launch', content: 'Just launched something amazing! Check it out 👇 #new #launch' },
        { label: 'Behind The Scenes', content: '🌟 Behind the scenes today! Working hard to bring you the best content. #bts #work' },
        { label: 'Engagement Post', content: "What's your biggest challenge this week? Let's discuss in the comments! 👇 #discussion #community" }
      ],
      'Twitter (X)': [
        { label: 'Announcement', content: 'Big news! We\'re launching something exciting today. Stay tuned! 🚀' },
        { label: 'Thread Start', content: '🧵 A quick thread on how we built our product in 30 days...' },
        { label: 'Poll', content: 'What feature would you like to see next? Vote below! 👇' }
      ],
      'LinkedIn': [
        { label: 'Career Milestone', content: 'Thrilled to announce I\'ve joined @company as new role! Excited for this journey. 🚀' },
        { label: 'Industry Insight', content: 'Here\'s what I\'ve learned about [industry] after 5 years...' },
        { label: 'Company Update', content: 'Proud to share our latest achievement. Check out the full story below! 👇' }
      ],
      'Facebook': [
        { label: 'Community Post', content: 'Throwback to our amazing community event last week! Thanks to everyone who joined. ❤️' },
        { label: 'Product Update', content: 'Exciting news! We\'ve just launched new features based on your feedback.' },
        { label: 'Question', content: 'What would you like to see from us in 2024? Drop your ideas below! 💡' }
      ],
      'TikTok': [
        { label: 'Trending', content: 'POV: When you try the new dance challenge and fail miserably 😂 #fyp #comedy' },
        { label: 'Tutorial', content: 'Learn how to do this viral effect in 30 seconds! #tutorial #creator' },
        { label: 'Behind Scenes', content: 'Day in the life of a creator 🎥 #dayinmylife #creator' }
      ],
      'YouTube': [
        { label: 'Video Intro', content: 'In this video, I\'ll show you how to master content creation in 2024 🚀 #tutorial' },
        { label: 'Community Post', content: 'New video is live! Check out the link in description and let me know your thoughts! 👇' },
        { label: 'Update', content: 'Exciting channel updates coming soon! Here\'s a sneak peek... 👀' }
      ]
    };
    return templates[platform] || templates['Instagram'];
  }

  // Get plan color
  getPlanColor(planType: string, isTrial: boolean): string {
    if (isTrial) return '#f59e0b';
    
    switch (planType) {
      case 'enterprise': return '#8b5cf6';
      case 'pro': return '#3b82f6';
      case 'starter': return '#10b981';
      default: return '#f59e0b';
    }
  }

  // Format remaining text
  formatRemaining(remaining: number, limit: number): string {
    if (limit === -1) return 'Unlimited';
    return `${remaining} left`;
  }

  // Check if can analyze
  canAnalyze(usageStats: any): boolean {
    return usageStats?.remaining_today > 0;
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
}

export const contentApi = new ContentAPI();
export default contentApi;