// src/services/profileAPI.js
import axios from "axios";
import API_BASE_URL from "../config/api";

const BASE_URL = `${API_BASE_URL}/profiles`;

// ======================================================
// 🧩 HELPERS
// ======================================================
const getAuthHeader = () => {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// In profileAPI.js - Fix the createFormData function
const createFormData = (data) => {
  const formData = new FormData();

  // If data is already FormData, return it
  if (data instanceof FormData) {
    return data;
  }

  Object.entries(data || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;

    if (value instanceof File) {
      formData.append(key, value);
    } 
    else if (key === "social_links" && typeof value === "object") {
      Object.entries(value).forEach(([platform, url]) => {
        if (url && url.trim() !== '') {
          formData.append(platform.toLowerCase(), url);
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


const handleError = (err) => {
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

const getRestrictionType = (errorMessage) => {
  if (errorMessage.includes('post') || errorMessage.includes('Post')) return 'post_creation';
  if (errorMessage.includes('profile') || errorMessage.includes('Profile')) return 'profile_view';
  if (errorMessage.includes('follow') || errorMessage.includes('Follow')) return 'following';
  if (errorMessage.includes('follower') || errorMessage.includes('Follower')) return 'followers_view';
  return 'general';
};

const request = async (method, url, { data, isForm = false } = {}) => {
  try {
    const headers = {
      ...getAuthHeader(),
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
export const checkPlanRestriction = (action, subscriptionData) => {
  if (!subscriptionData) {
    return { allowed: false, message: "Subscription data not available" };
  }

  const { limits, usage, subscription } = subscriptionData;
  const planType = subscription?.type || 'trial';
  const planName = subscription?.plan_name || 'Free Trial';

  const restrictions = {
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

// Enhanced API calls with pre-check
export const createPostWithPlanCheck = async (mediaFiles, caption, subscriptionData) => {
  const restriction = checkPlanRestriction('create_post', subscriptionData);
  if (!restriction.allowed) {
    const error = new Error(restriction.message);
    error.isPlanRestriction = true;
    error.restrictionType = 'post_creation';
    throw error;
  }

  return createPost(mediaFiles, caption);
};

export const followUserWithPlanCheck = async (targetUserId, subscriptionData) => {
  const restriction = checkPlanRestriction('follow_users', subscriptionData);
  if (!restriction.allowed) {
    const error = new Error(restriction.message);
    error.isPlanRestriction = true;
    error.restrictionType = 'following';
    throw error;
  }

  return followUser(targetUserId);
};

export const getPublicProfilesWithPlanCheck = async (subscriptionData) => {
  const restriction = checkPlanRestriction('view_profiles', subscriptionData);
  if (!restriction.allowed) {
    const error = new Error(restriction.message);
    error.isPlanRestriction = true;
    error.restrictionType = 'profile_view';
    throw error;
  }

  return getPublicProfiles();
};

export const getFollowersWithPlanCheck = async (userId, subscriptionData) => {
  const restriction = checkPlanRestriction('see_followers', subscriptionData);
  if (!restriction.allowed) {
    const error = new Error(restriction.message);
    error.isPlanRestriction = true;
    error.restrictionType = 'followers_view';
    throw error;
  }

  return getFollowers(userId);
};

export const getFollowingWithPlanCheck = async (userId, subscriptionData) => {
  const restriction = checkPlanRestriction('see_following', subscriptionData);
  if (!restriction.allowed) {
    const error = new Error(restriction.message);
    error.isPlanRestriction = true;
    error.restrictionType = 'followers_view';
    throw error;
  }

  return getFollowing(userId);
};

// ======================================================
// 👤 PROFILE CRUD
// ======================================================
// In profileAPI.js - Update createProfile function
export const createProfile = async (role, data) => {
  const formData = createFormData(data);
  const endpoint = role === "brand" ? "/brand" : "/influencer";
  return request("post", endpoint, { data: formData, isForm: true });
};

// In profileAPI.js - Update the updateProfile function
export const updateProfile = async (role, data) => {
  const formData = new FormData();
  
  // Handle form data properly - data might already be FormData or an object
  if (data instanceof FormData) {
    // If it's already FormData, use it directly
    return request("put", role === "brand" ? "/brand" : "/influencer", { 
      data: data, 
      isForm: true 
    });
  } else {
    // If it's an object, convert to FormData
    Object.entries(data || {}).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      
      if (value instanceof File) {
        formData.append(key, value);
      } 
      else if (key === "social_links" && typeof value === "object") {
        Object.entries(value).forEach(([platform, url]) => {
          if (url) formData.append(platform, url);
        });
      }
      else if (key === "niches" || key === "categories") {
        // Send categories as comma-separated string
        if (Array.isArray(value) && value.length > 0) {
          formData.append("categories", value.join(","));
        }
      }
      else if (Array.isArray(value)) {
        value.forEach((item) => formData.append(key, item.toString()));
      } 
      else {
        formData.append(key, value.toString());
      }
    });
    
    return request("put", role === "brand" ? "/brand" : "/influencer", { 
      data: formData, 
      isForm: true 
    });
  }
};

export const deleteProfile = async (role) => {
  const endpoint = role === "brand" ? "/brand" : "/influencer";
  return request("delete", endpoint);
};

// ======================================================
// 👥 PROFILE FETCHING
// ======================================================
export const getMyProfile = async () => request("get", "/me");
export const getProfileById = async (userId) => request("get", `/user/${userId}`);
export const getPublicProfiles = async () => request("get", "/public");
export const getAllProfilesAdmin = async () => {
  return request("get", "/admin/all");
};

// ======================================================
// 🤝 FOLLOW SYSTEM
// ======================================================
const mapUserData = (raw) => {
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


export const getFollowers = async (userId) => {
  const data = await request("get", `/followers/${userId}`);
  return data.map(mapUserData);
};

export const getFollowing = async (userId) => {
  const data = await request("get", `/following/${userId}`);
  return data.map(mapUserData);
};

export const followUser = async (targetUserId) =>
  request("post", `/follow/${targetUserId}`);

export const unfollowUser = async (targetUserId) =>
  request("post", `/unfollow/${targetUserId}`);

// ======================================================
// 📸 POSTS
// ======================================================
export const createPost = async (mediaFiles, caption) => {
  const formData = new FormData();
  (mediaFiles || []).forEach((file) => formData.append("media", file));
  if (caption) formData.append("caption", caption);

  return request("post", "/posts", { data: formData, isForm: true });
};

// --- Helper to normalize post structure ---
const mapPost = (p) => {
  // Ensure comments is always an array with proper structure
  const mappedComments = (p.comments || []).map((comment) => {
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

export const getUserPosts = async (userId) => {
  const data = await request("get", `/posts/${userId}`);
  return data.map(mapPost);
};

export const likePost = async (postId) => request("post", `/posts/${postId}/like`);

export const commentPost = async (postId, comment) => {
  const formData = new FormData();
  formData.append("comment", comment);
  return request("post", `/posts/${postId}/comment`, { data: formData, isForm: true });
};

export const viewPost = async (postId) => request("post", `/posts/${postId}/view`);

// ======================================================
// ❤️ WHO LIKED / WHO VIEWED
// ======================================================
export const getPostLikes = async (postId) => {
  const data = await request("get", `/posts/${postId}/likes`);
  return data.map(mapUserData);
};

export const getPostViews = async (postId) => {
  const data = await request("get", `/posts/${postId}/views`);
  return data.map(mapUserData);
};

// Add to profileAPI.js
export const getCompleteUserProfile = async (userId) => {
  return request("get", `/user/${userId}/complete`);
};

export const getProfileCompletionStatus = async () => {
  return request("get", "/completion/status");
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
  getPublicProfilesWithPlanCheck,

  // subscription
  getSubscriptionStatus,
  checkPlanRestriction,
  createPostWithPlanCheck,
  followUserWithPlanCheck,
  getFollowersWithPlanCheck,
  getFollowingWithPlanCheck,

  // admin
  getAllProfilesAdmin,

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
};



export default profileAPI;

