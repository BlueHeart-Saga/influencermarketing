import React, { createContext, useState, useContext, useEffect } from 'react';
import { authApi, UserProfile, SubscriptionStatus } from '../services/api';
import { useRouter } from 'expo-router';

import profileAPI from "../services/profileAPI";

interface AuthContextData {
  user: UserProfile | null;
  isLoading: boolean;
  isInitializing: boolean;
  isAuthenticated: boolean;
  subscription: SubscriptionStatus | null;
  login: (email: string, password: string) => Promise<UserProfile | null>;
  register: (data: {
    username: string;
    email: string;
    password: string;
    role: 'brand' | 'influencer';
  }) => Promise<boolean>;
  googleAuth: (token: string, role: 'brand' | 'influencer') => Promise<UserProfile | null>;
  logout: () => Promise<void>;
  updateUserProfile: (data: any) => Promise<void>;
  refreshUser: () => Promise<void>;
  checkEmailExists: (email: string) => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [authChecking, setAuthChecking] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const response = await authApi.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data);
        if (response.data.subscription) {
          setSubscription(response.data.subscription);
        }
      }
    } catch (error) {
      console.error('Failed to load stored user:', error);
    } finally {
      setIsInitializing(false);
    }
  };

  const login = async (email: string, password: string): Promise<UserProfile | null> => {
    try {
      setIsLoading(true);
      setAuthChecking(true);

      const response = await authApi.login({ email, password });

      if (!response.success) {
        throw new Error(response.error || "Invalid email or password");
      }

      const userResponse = await authApi.getCurrentUser();

      if (userResponse.success && userResponse.data) {
        setUser(userResponse.data);

        if (userResponse.data.subscription) {
          setSubscription(userResponse.data.subscription);
        }

        return userResponse.data;
      }

      throw new Error("Failed to parse user profile");

    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
      setAuthChecking(false);
    }
  };

  const register = async (data: {
    username: string;
    email: string;
    password: string;
    role: 'brand' | 'influencer';
  }): Promise<boolean> => {
    try {
      setIsLoading(true);

      const response = await authApi.register(data);

      if (!response.success) {
        console.log("Registration failed:", response.error);
        throw new Error(response.error || "Registration failed");
      }

      if (response.data) {
        const userResponse = await authApi.getCurrentUser();

        if (userResponse.success && userResponse.data) {
          setUser(userResponse.data);

          if (userResponse.data.subscription) {
            setSubscription(userResponse.data.subscription);
          }

          // Remove navigateToDashboard as register.tsx handles it
          return true;
        }
      }

      throw new Error("Failed to configure new acccount");

    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const googleAuth = async (idToken: string, role: 'brand' | 'influencer') => {
    try {
      setIsLoading(true);
      console.log('Starting Google auth with role:', role);

      const response = await authApi.googleAuth({
        token: idToken,
        role: role
      });

      if (response.success && response.data) {
        console.log('Google auth successful:', response.data);

        // IMPORTANT: Wait a moment for the token to be properly saved
        await new Promise(resolve => setTimeout(resolve, 500));

        // Get full user profile
        const userResponse = await authApi.getCurrentUser();
        console.log('User profile response:', userResponse);

        if (userResponse.success && userResponse.data) {
          setUser(userResponse.data);

          if (userResponse.data.subscription) {
            setSubscription(userResponse.data.subscription);
          }

          return userResponse.data; // ✅ RETURN USER
        } else {
          console.error('Failed to fetch user profile:', userResponse.error);
          // Even if profile fetch fails, try to navigate with the data we have
          if (response.data) {
            const tempUser: UserProfile = {
              id: response.data.user_id,
              email: response.data.email,
              role: response.data.role,
              username: response.data.username,
              created_at: new Date().toISOString(),
              last_login: new Date().toISOString(),
              auth_provider: 'google',
              email_verified: true,
              is_active: true,
              subscription: response.data.subscription
            };
            setUser(tempUser);
            setTimeout(() => {
              navigateToDashboard(tempUser);
            }, 100);
            return tempUser;
          }
          return null;
        }
      } else {
        console.error('Google auth failed:', response.error);
        throw new Error(response.error || 'Google authentication failed');
      }
    } catch (error) {
      console.error('Google auth error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToDashboard = (user: UserProfile) => {
    const hasCompletedProfile = checkProfileCompletion(user);

    if (!hasCompletedProfile) {
      if (user.role === 'brand') {
        router.replace('/(brand)/(tabs)/account/profile');
      } else if (user.role === 'influencer') {
        router.replace('/(influencer)/settings/profile');
      }
    } else {
      if (user.role === 'brand') {
        router.replace('/(brand)/(tabs)/dashboard');
      } else if (user.role === 'influencer') {
        router.replace('/(influencer)/(tabs)/dashboard');
      } else if (user.role === 'admin') {
        router.replace('/(admin)/dashboard');
      }
    }
  };

  const checkProfileCompletion = (user: UserProfile): boolean => {
    if (!user) return false;

    if (user.role === 'brand') {
      return !!(user.name || user.brand_profile);
    } else if (user.role === 'influencer') {
      return !!(user.name || user.influencer_profile);
    }

    return false;
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authApi.logout();
      setUser(null);
      setSubscription(null);
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (data: any) => {
    try {
      setIsLoading(true);
      const response = await authApi.updateProfile(data);

      if (!response.success) {
        throw new Error(response.error || 'Profile update failed');
      }

      await refreshUser();
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authApi.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data);
        if (response.data.subscription) {
          setSubscription(response.data.subscription);
        }
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      const response = await authApi.checkEmail(email);
      return response.success && response.data?.exists || false;
    } catch (error) {
      console.error('Failed to check email:', error);
      return false;
    }
  };


  const refreshProfileStatus = async () => {
    try {
      const status = await profileAPI.getProfileCompletionStatus();
      return status;
    } catch (err) {
      console.error("Error refreshing profile status:", err);
      return null;
    }
  };

  const contextValue = React.useMemo(() => ({
    user,
    isLoading,
    isInitializing,
    isAuthenticated: !!user,
    authChecking,
    subscription,
    login,
    register,
    googleAuth,
    logout,
    updateUserProfile,
    refreshUser,
    checkEmailExists,
    refreshProfileStatus,
  }), [user, isLoading, isInitializing, authChecking, subscription]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};