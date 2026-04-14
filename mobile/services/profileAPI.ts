// C:\Sagadevan\quickbox\mobile\services\profileAPI.ts
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || (Platform.OS === 'android' ? 'https://quickbox-backend-docker-b9cbaye9a3bvhad5.southindia-01.azurewebsites.net' : 'https://quickbox-backend-docker-b9cbaye9a3bvhad5.southindia-01.azurewebsites.net');

const BASE_URL = `${API_BASE_URL}/profiles`;

// ======================================================
// 🧩 HELPERS
// ======================================================
const getAuthHeader = async () => {
  const token = await AsyncStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const createFormData = (data: any): FormData => {
  const formData = new FormData();

  // If data is already FormData, return it
  if (data instanceof FormData) {
    return data;
  }

  Object.entries(data || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;

    if (key === "logo" && value?.uri) {
      // Handle image file for React Native
      formData.append(key, {
        uri: value.uri,
        type: value.type || 'image/jpeg',
        name: value.fileName || `photo_${Date.now()}.jpg`,
      } as any);
    } 
    else if (key === "bg_image" && value?.uri) {
      // Handle background image file for React Native
      formData.append(key, {
        uri: value.uri,
        type: value.type || 'image/jpeg',
        name: value.fileName || `bg_${Date.now()}.jpg`,
      } as any);
    }
    else if (key === "social_links" && typeof value === "object") {
      Object.entries(value).forEach(([platform, url]) => {
        if (url && url.toString().trim() !== '') {
          formData.append(platform.toLowerCase(), url.toString());
        }
      });
    }
    else if (key === "categories" && Array.isArray(value)) {
      // Handle categories array - send as comma-separated string
      if (value.length > 0) {
        formData.append("categories", value.join(","));
      }
    }
    else if (Array.isArray(value)) {
      // For other arrays, join with commas
      formData.append(key, value.join(","));
    } 
    else {
      formData.append(key, value.toString());
    }
  });

  return formData;
};

const handleError = (err: any) => {
  console.error("API Error:", err.response?.data || err.message);
  const errorData = err.response?.data || { error: err.message };
  
  // Check for subscription restriction errors
  if (err.response?.status === 403) {
    const detail = errorData.detail || errorData.error || '';
    if (detail.includes('subscription') || detail.includes('plan') || 
        detail.includes('limit') || detail.includes('upgrade')) {
      errorData.isPlanRestriction = true;
      errorData.restrictionType = getRestrictionType(detail);
    }
  }
  
  throw errorData;
};

const getRestrictionType = (errorMessage: string): string => {
  if (errorMessage.includes('post') || errorMessage.includes('Post')) return 'post_creation';
  if (errorMessage.includes('profile') || errorMessage.includes('Profile')) return 'profile_view';
  if (errorMessage.includes('follow') || errorMessage.includes('Follow')) return 'following';
  if (errorMessage.includes('follower') || errorMessage.includes('Follower')) return 'followers_view';
  return 'general';
};

const request = async (method: string, url: string, { data, isForm = false }: { data?: any; isForm?: boolean } = {}) => {
  try {
    const headers = {
      ...(await getAuthHeader()),
      ...(isForm ? { "Content-Type": "multipart/form-data" } : {}),
    };

    const res = await axios({
      method,
      url: `${BASE_URL}${url}`,
      data,
      headers,
    });

    return res.data;
  } catch (err) {
    handleError(err);
  }
};

// ======================================================
// 📊 SUBSCRIPTION MANAGEMENT
// ======================================================
export const getSubscriptionStatus = async () => {
  return request("get", "/subscription/status");
};

// Plan restriction checker utility
export const checkPlanRestriction = (action: string, subscriptionData: any) => {
  if (!subscriptionData) {
    return { allowed: false, message: "Subscription data not available" };
  }

  const { limits, usage, subscription } = subscriptionData;
  const planType = subscription?.type || 'trial';
  const planName = subscription?.plan_name || 'Free Trial';

  const restrictions: Record<string, { allowed: boolean; message: string }> = {
    create_post: {
      allowed: limits?.max_posts !== 0 && (limits?.max_posts === null || usage?.posts_remaining > 0),
      message: limits?.max_posts === 0 
        ? `🚫 Post creation not available in ${planName}. Upgrade to create posts.`
        : `📊 Post limit reached! You've used ${usage?.posts_created}/${limits?.max_posts} posts. Upgrade for more.`
    },
    view_profiles: {
      allowed: limits?.max_profile_views === null || (usage?.profiles_viewed || 0) < limits?.max_profile_views,
      message: `👀 Profile view limit reached! You can view only ${limits?.max_profile_views} profiles in ${planName}. Upgrade for unlimited access.`
    },
    follow_users: {
      allowed: limits?.can_follow === true,
      message: `🔒 Following users is not available in ${planName}. Upgrade to connect with others.`
    },
    see_followers: {
      allowed: limits?.can_see_followers === true,
      message: `👥 Viewing followers is not available in ${planName}. Upgrade to see who follows you.`
    },
    see_following: {
      allowed: limits?.can_see_following === true,
      message: `📋 Viewing following lists is not available in ${planName}. Upgrade to manage your connections.`
    },
    access_feed: {
      allowed: limits?.max_feed_items === null || (usage?.feed_views || 0) < limits?.max_feed_items,
      message: `📱 Feed access limited! Upgrade to view more content in your feed.`
    }
  };

  return restrictions[action] || { allowed: true, message: "" };
};

// ======================================================
// 👤 PROFILE CRUD
// ======================================================
export const createProfile = async (role: string, data: any) => {
  const formData = createFormData(data);
  const endpoint = role === "brand" ? "/brand" : "/influencer";
  return request("post", endpoint, { data: formData, isForm: true });
};

export const updateProfile = async (role: string, data: any) => {
  const formData = createFormData(data);
  return request("put", role === "brand" ? "/brand" : "/influencer", { 
    data: formData, 
    isForm: true 
  });
};

export const deleteProfile = async (role: string) => {
  const endpoint = role === "brand" ? "/brand" : "/influencer";
  return request("delete", endpoint);
};

// ======================================================
// 👥 PROFILE FETCHING
// ======================================================
export const getMyProfile = async () => request("get", "/me");
export const getProfileById = async (userId: string) => request("get", `/user/${userId}`);
export const getPublicProfiles = async () => request("get", "/public");
export const getAllProfilesAdmin = async () => {
  return request("get", "/admin/all");
};

// ======================================================
// 🤝 FOLLOW SYSTEM
// ======================================================
const mapUserData = (raw: any) => {
  const role = raw.role || raw.user?.role;

  // Brand profile
  const brand = raw.brand_profile || raw.profile?.brand_profile;

  // Influencer profile
  const influencer = raw.influencer_profile || raw.profile?.influencer_profile;

  return {
    _id: raw._id || raw.id || raw.user?._id,
    type: role === "brand" ? "brand" : "influencer",

    // ---------- MAIN NAMES ----------
    company_name: brand?.company_name || null,
    nickname: influencer?.nickname || null,
    full_name: influencer?.full_name || null,

    // ---------- EMAIL ----------
    email: raw.email || raw.user?.email || "",

    // ---------- PROFILE IMAGE ----------
    profile_picture:
      brand?.logo ||
      influencer?.profile_picture ||
      raw.profile_picture ||
      null,
  };
};

export const getFollowers = async (userId: string) => {
  const data = await request("get", `/followers/${userId}`);
  return Array.isArray(data) ? data.map(mapUserData) : [];
};

export const getFollowing = async (userId: string) => {
  const data = await request("get", `/following/${userId}`);
  return Array.isArray(data) ? data.map(mapUserData) : [];
};

export const followUser = async (targetUserId: string) =>
  request("post", `/follow/${targetUserId}`);

export const unfollowUser = async (targetUserId: string) =>
  request("post", `/unfollow/${targetUserId}`);

// ======================================================
// 📸 POSTS
// ======================================================
export const createPost = async (mediaFiles: any[], caption: string) => {
  const formData = new FormData();
  (mediaFiles || []).forEach((file) => {
    formData.append("media", {
      uri: file.uri,
      type: file.type || 'image/jpeg',
      name: file.fileName || `photo_${Date.now()}.jpg`,
    } as any);
  });
  if (caption) formData.append("caption", caption);

  return request("post", "/posts", { data: formData, isForm: true });
};

// --- Helper to normalize post structure ---
const mapPost = (p: any) => {
  // Ensure comments is always an array with proper structure
  const mappedComments = (p.comments || []).map((comment: any) => {
    return {
      // User info
      user_id: comment.user_id || comment.userId || comment.user?.id,
      user_name: comment.user_name || comment.username || comment.user?.name || "Unknown User",
      profile_picture: comment.profile_picture || comment.user?.profile_picture,
      
      // Comment content
      comment: comment.comment || comment.text || comment.content || comment.body || "",
      
      // Timestamp
      created_at: comment.created_at || comment.timestamp || comment.date,
      
      // Keep original data for safety
      ...comment
    };
  });

  const mappedPost = {
    ...p,
    media: p.media || [],
    likes: (p.likes || []).map(mapUserData),
    comments: mappedComments,
    views: (p.views || []).map(mapUserData),
  };

  return mappedPost;
};

export const getUserPosts = async (userId: string) => {
  const data = await request("get", `/posts/${userId}`);
  return Array.isArray(data) ? data.map(mapPost) : [];
};

export const likePost = async (postId: string) => request("post", `/posts/${postId}/like`);

export const commentPost = async (postId: string, comment: string) => {
  const formData = new FormData();
  formData.append("comment", comment);
  return request("post", `/posts/${postId}/comment`, { data: formData, isForm: true });
};

export const viewPost = async (postId: string) => request("post", `/posts/${postId}/view`);

// ======================================================
// ❤️ WHO LIKED / WHO VIEWED
// ======================================================
export const getPostLikes = async (postId: string) => {
  const data = await request("get", `/posts/${postId}/likes`);
  return Array.isArray(data) ? data.map(mapUserData) : [];
};

export const getPostViews = async (postId: string) => {
  const data = await request("get", `/posts/${postId}/views`);
  return Array.isArray(data) ? data.map(mapUserData) : [];
};

export const getCompleteUserProfile = async (userId: string) => {
  return request("get", `/user/${userId}/complete`);
};

export const getProfileCompletionStatus = async () => {
  return request("get", "/completion/status");
};

// ======================================================
// 📸 IMAGE PICKER HELPER
// ======================================================
export const pickImage = async (options?: any) => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.8,
    ...options
  });
  
  if (!result.canceled && result.assets[0]) {
    const asset = result.assets[0];
    return {
      uri: asset.uri,
      type: asset.type || 'image/jpeg',
      fileName: asset.fileName || `photo_${Date.now()}.jpg`,
      width: asset.width,
      height: asset.height
    };
  }
  return null;
};

// ======================================================
// 🚀 EXPORT
// ======================================================
const profileAPI = {
  // profile
  createProfile,
  updateProfile,
  deleteProfile,
  getMyProfile,
  getProfileById,
  getPublicProfiles,

  // subscription
  getSubscriptionStatus,
  checkPlanRestriction,

  // follow
  getFollowers,
  getFollowing,
  followUser,
  unfollowUser,

  // posts
  createPost,
  getUserPosts,
  likePost,
  commentPost,
  viewPost,

  // likes/views lists
  getPostLikes,
  getPostViews,

  getProfileCompletionStatus,
  getCompleteUserProfile,
  
  // helpers
  pickImage,


  
};

export default profileAPI;