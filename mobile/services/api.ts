import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';// Change this to your actual API URL

console.log("API BASE URL:", API_BASE_URL);

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  role: 'brand' | 'influencer';
}

interface GoogleAuthData {
  token: string;
  role: 'brand' | 'influencer';
}

interface PasswordResetRequest {
  email: string;
}

interface OTPVerifyData {
  email: string;
  otp: string;
}

interface PasswordResetConfirm {
  new_password: string;
  confirm_password: string;
}

interface UserProfile {
  id: string;
  _id?: string; // MongoDB style ID support
  email: string;
  role: string;
  username: string;
  created_at: string;
  last_login: string;
  auth_provider: string;
  email_verified: boolean;
  is_active: boolean;
  name?: string;
  phone?: string;
  bio?: string;
  website?: string;
  location?: string;
  profile_picture?: string;
  brand_id?: string;
  brand_profile?: any;
  influencer_id?: string;
  influencer_profile?: any;
  subscription?: SubscriptionStatus;
}

interface SubscriptionStatus {
  type: 'free' | 'trial' | 'paid';
  plan: string;
  billing_cycle?: string;
  status: string;
  is_active: boolean;
  is_trial: boolean;
  current_period_start?: string;
  current_period_end?: string;
  stripe_subscription_id?: string;
}

interface TrialStatus {
  is_trial_active: boolean;
  remaining_days: number;
  current_period_start?: string;
  current_period_end?: string;
  current_plan?: string;
  message?: string;
}

interface EmailCheckResponse {
  exists: boolean;
}

interface UserListResponse {
  success: boolean;
  count: number;
  users: UserListItem[];
}

interface UserListItem {
  id: string;
  username: string;
  email: string;
  role: string;
  name?: string;
  profile_picture?: string;
  display_name?: string;
  company_name?: string;
  contact_person?: string;
  industry?: string;
  categories?: string[];
  location?: string;
  website?: string;
  full_name?: string;
  nickname?: string;
  niche?: string;
  bio?: string;
}

interface ChangePasswordData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

interface ProfileUpdateData {
  username?: string;
  name?: string;
  phone?: string;
  bio?: string;
  website?: string;
  location?: string;
  profile_picture?: string;
  // Brand specific
  company_name?: string;
  company_size?: string;
  industry?: string;
  // Influencer specific
  niche?: string;
  social_media_handles?: Record<string, string>;
  follower_count?: number;
  engagement_rate?: number;
}

interface ProfileCompletionResponse {
  profile_completion: {
    total_fields: number;
    completed_fields: number;
    completion_percentage: number;
    missing_fields: string[];
    profile_strength: string;
    last_updated?: string;
    created_at?: string;
  };
  recommendations: string[];
}

// Token management
const getToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem('access_token');
};

const setToken = async (token: string): Promise<void> => {
  await AsyncStorage.setItem('access_token', token);
};

const removeToken = async (): Promise<void> => {
  await AsyncStorage.removeItem('access_token');
};

// API request helper
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {},
  requiresAuth: boolean = true
): Promise<ApiResponse<T>> => {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (requiresAuth) {
      const token = await getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle token expiration
      if (response.status === 401) {
        await removeToken();
      }
      return {
        success: false,
        error: data.detail || 'Request failed',
      };
    }

    return {
      success: true,
      data: data as T,
      message: data.message,
    };
  } catch (error) {
    console.error('API Request Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
};

// Auth API
export const authApi = {
  // Register new user
  register: async (data: RegisterData): Promise<ApiResponse<{
    access_token: string;
    token_type: string;
    role: string;
    username: string;
    user_id: string;
    email: string;
    is_new_user: boolean;
    subscription?: SubscriptionStatus;
    message: string;
  }>> => {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }, false);

    if (response.success && response.data?.access_token) {
      await setToken(response.data.access_token);
    }

    return response;
  },

  // Login user
  login: async (credentials: LoginCredentials): Promise<ApiResponse<{
    access_token: string;
    token_type: string;
    role: string;
    username: string;
    user_id: string;
    email: string;
    subscription?: SubscriptionStatus;
    message: string;
  }>> => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }, false);

    if (response.success && response.data?.access_token) {
      await setToken(response.data.access_token);
    }

    return response;
  },

  // Google authentication
  // Google authentication
  googleAuth: async (data: GoogleAuthData): Promise<ApiResponse<{
    access_token: string;
    token_type: string;
    role: string;
    username: string;
    user_id: string;
    email: string;
    is_new_user: boolean;
    subscription?: SubscriptionStatus;
    message: string;
  }>> => {
    console.log('Making Google auth API call with token:', data.token.substring(0, 20) + '...');

    const response = await apiRequest('/auth/google', {
      method: 'POST',
      body: JSON.stringify({
        token: data.token,
        role: data.role
      }),
    }, false);

    console.log('Google auth response:', response);

    // IMPORTANT: Save token immediately if successful
    if (response.success && response.data?.access_token) {
      console.log('Saving access token to AsyncStorage');
      await setToken(response.data.access_token);

      // Verify token was saved
      const savedToken = await getToken();
      console.log('Token saved successfully:', !!savedToken);
    }

    return response;
  },

  // Check email existence
  checkEmail: async (email: string): Promise<ApiResponse<EmailCheckResponse>> => {
    return await apiRequest(`/auth/check-email?email=${encodeURIComponent(email)}`, {
      method: 'GET',
    }, false);
  },

  // Get current user profile
  getCurrentUser: async (): Promise<ApiResponse<UserProfile>> => {
    return await apiRequest('/auth/me', {
      method: 'GET',
    });
  },

  // Update profile
  updateProfile: async (data: ProfileUpdateData): Promise<ApiResponse<{
    message: string;
    changes: string[];
    completion_stats: any;
  }>> => {
    return await apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Get profile completion
  getProfileCompletion: async (): Promise<ApiResponse<ProfileCompletionResponse>> => {
    return await apiRequest('/auth/profile/completion', {
      method: 'GET',
    });
  },

  // Remind profile completion
  remindProfileCompletion: async (): Promise<ApiResponse<{
    message: string;
    completion_stats: any;
  }>> => {
    return await apiRequest('/auth/profile/remind-completion', {
      method: 'POST',
    });
  },

  // Change password
  changePassword: async (data: ChangePasswordData): Promise<ApiResponse<{
    message: string;
    security_alert: boolean;
  }>> => {
    return await apiRequest('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Set password for Google users
  setPassword: async (data: Omit<ChangePasswordData, 'current_password'>): Promise<ApiResponse<{
    message: string;
  }>> => {
    const { new_password, confirm_password } = data;
    return await apiRequest('/auth/set-password', {
      method: 'POST',
      body: JSON.stringify({ new_password, confirm_password }),
    });
  },

  // Password reset request
  requestPasswordReset: async (email: string): Promise<ApiResponse<{
    message: string;
  }>> => {
    return await apiRequest('/auth/password-reset-request', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }, false);
  },

  // Verify OTP
  verifyOTP: async (email: string, otp: string): Promise<ApiResponse<{
    message: string;
    reset_token: string;
    token_type: string;
  }>> => {
    return await apiRequest('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    }, false);
  },

  // Reset password with token
  resetPassword: async (newPassword: string, confirmPassword: string, resetToken: string): Promise<ApiResponse<{
    message: string;
  }>> => {
    return await apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({
        new_password: newPassword,
        confirm_password: confirmPassword
      }),
      headers: {
        'Authorization': `Bearer ${resetToken}`,
      },
    }, false);
  },

  // Get trial status
  getTrialStatus: async (): Promise<ApiResponse<TrialStatus>> => {
    return await apiRequest('/auth/trial-status', {
      method: 'GET',
    });
  },

  // List users by role
  listUsers: async (role: 'brand' | 'influencer'): Promise<ApiResponse<UserListResponse>> => {
    return await apiRequest(`/auth/users?role=${role}`, {
      method: 'GET',
    });
  },

  // Logout
  logout: async (): Promise<void> => {
    await removeToken();
  },
};

// Export types
export type {
  LoginCredentials,
  RegisterData,
  GoogleAuthData,
  PasswordResetRequest,
  OTPVerifyData,
  PasswordResetConfirm,
  UserProfile,
  SubscriptionStatus,
  TrialStatus,
  UserListItem,
  ChangePasswordData,
  ProfileUpdateData,
  ProfileCompletionResponse,
  EmailCheckResponse,
};