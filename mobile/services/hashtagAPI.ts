import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://quickbox-backend-docker-b9cbaye9a3bvhad5.southindia-01.azurewebsites.net';

interface HashtagRequest {
  text: string;
}

interface HashtagResponse {
  hashtags: string[];
}

interface UsageResponse {
  daily_limit: number | null;
  requests_used: number;
  remaining_requests: number | null;
  limit_type: string;
  trial_expired: boolean;
  plan: string;
}

class HashtagAPI {
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

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle 403 specifically for trial expired / limit reached
      if (response.status === 403) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Daily limit reached or trial expired');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle FastAPI validation errors
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            const messages = errorData.detail.map((d: any) => d.msg || JSON.stringify(d)).join('; ');
            throw new Error(messages);
          }
          throw new Error(errorData.detail);
        }
        
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please check your connection and try again.');
      }
      
      // Re-throw the error with its message
      throw error;
    }
  }

  // Get hashtag usage stats
  async getHashtagUsage(options?: { signal?: AbortSignal }): Promise<UsageResponse> {
    return this.request<UsageResponse>('/hashtags/usage', {
      signal: options?.signal,
    });
  }

  // Generate hashtags
  async generateHashtags(data: HashtagRequest, options?: { signal?: AbortSignal }): Promise<HashtagResponse> {
    return this.request<HashtagResponse>('/hashtags', {
      method: 'POST',
      body: JSON.stringify(data),
      signal: options?.signal,
    });
  }

  // Check if user can generate more hashtags
  async canGenerate(): Promise<{ can: boolean; reason?: string }> {
    try {
      const usage = await this.getHashtagUsage();
      
      if (usage.trial_expired) {
        return { can: false, reason: 'Trial expired' };
      }
      
      if (usage.daily_limit !== null && usage.remaining_requests !== null && usage.remaining_requests <= 0) {
        return { can: false, reason: 'Daily limit reached' };
      }
      
      return { can: true };
    } catch (error) {
      console.error('Error checking generation status:', error);
      return { can: false, reason: 'Unable to verify usage status' };
    }
  }

  // Clear any cached usage data
  async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const usageKeys = keys.filter(key => key.startsWith('hashtag_usage_'));
      await AsyncStorage.multiRemove(usageKeys);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  // Cache usage data to reduce API calls
  async cacheUsageData(usage: UsageResponse): Promise<void> {
    try {
      await AsyncStorage.setItem('hashtag_usage', JSON.stringify({
        data: usage,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.error('Error caching usage data:', error);
    }
  }

  // Get cached usage data (valid for 5 minutes)
  async getCachedUsage(): Promise<UsageResponse | null> {
    try {
      const cached = await AsyncStorage.getItem('hashtag_usage');
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        // Cache for 5 minutes
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          return data;
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting cached usage:', error);
      return null;
    }
  }
}

export const hashtagApi = new HashtagAPI();
export default HashtagAPI;