// Chat utility functions
export const formatMessageTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  // Less than 24 hours
  if (diff < 24 * 60 * 60 * 1000) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // Less than 7 days
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    return date.toLocaleDateString([], { weekday: 'short' });
  }
  
  // Show date
  return date.toLocaleDateString();
};

export const formatConversationTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (days === 1) {
    return 'Yesterday';
  } else if (days < 7) {
    return date.toLocaleDateString([], { weekday: 'long' });
  } else {
    return date.toLocaleDateString();
  }
};

export const getLastActive = (timestamp) => {
  if (!timestamp) return 'Never';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return date.toLocaleDateString();
};

export const getFileIcon = (contentType) => {
  if (!contentType) return '📄';
  
  if (contentType.startsWith('image/')) return '🖼️';
  if (contentType.startsWith('video/')) return '🎬';
  if (contentType.startsWith('audio/')) return '🎵';
  if (contentType === 'application/pdf') return '📕';
  if (contentType.includes('word')) return '📝';
  if (contentType.includes('excel') || contentType.includes('spreadsheet')) return '📊';
  if (contentType.includes('powerpoint') || contentType.includes('presentation')) return '📊';
  if (contentType === 'application/zip' || contentType.includes('compressed')) return '🗜️';
  if (contentType.startsWith('text/')) return '📄';
  
  return '📄';
};

export const formatFileSize = (bytes) => {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const validateFileUpload = (file, limits = {}) => {
  const maxSize = limits.max_media_size || 10 * 1024 * 1024; // 10MB default
  const allowedTypes = limits.allowed_media_types || [
    'image/jpeg', 'image/png', 'image/gif', 'application/pdf'
  ];
  
  if (file.size > maxSize) {
    return {
      valid: false,
      message: `File size must be less than ${formatFileSize(maxSize)}`
    };
  }
  
  if (!allowedTypes.includes(file.type) && !allowedTypes.some(type => type.includes('/*'))) {
    return {
      valid: false,
      message: 'File type not allowed'
    };
  }
  
  return { valid: true, message: '' };
};

export const getProfilePictureUrl = (user) => {
  if (!user) return '';
  
  // Check for brand logo
  if (user.brand_profile?.logo) return user.brand_profile.logo;
  
  // Check for influencer profile picture
  if (user.influencer_profile?.profile_picture) return user.influencer_profile.profile_picture;
  
  // Check for general profile picture
  if (user.profile_picture) return user.profile_picture;
  
  // Generate avatar from name
  const name = getDisplayName(user);
  if (name) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=200`;
  }
  
  return '';
};

export const getDisplayName = (user) => {
  if (!user) return 'Unknown User';
  
  // For brand users
  if (user.brand_profile?.company_name) return user.brand_profile.company_name;
  
  // For influencer users
  if (user.influencer_profile?.full_name) return user.influencer_profile.full_name;
  
  // For regular users
  if (user.username) return user.username;
  
  return 'Unknown User';
};

export const getUserCategories = (user) => {
  if (!user) return [];
  
  if (user.brand_profile?.industry) return [user.brand_profile.industry];
  if (user.brand_profile?.tags) return user.brand_profile.tags.slice(0, 3);
  
  if (user.influencer_profile?.niche) return [user.influencer_profile.niche];
  if (user.influencer_profile?.content_categories) return user.influencer_profile.content_categories.slice(0, 3);
  
  return user.tags || [];
};

export const getUserBio = (user) => {
  if (!user) return '';
  
  if (user.brand_profile?.description) return user.brand_profile.description;
  if (user.influencer_profile?.bio) return user.influencer_profile.bio;
  
  return user.bio || '';
};

export const getFollowerCount = (user) => {
  if (!user?.influencer_profile?.follower_counts) return 0;
  
  const counts = user.influencer_profile.follower_counts;
  const total = Object.values(counts).reduce((sum, count) => sum + (count || 0), 0);
  
  if (total >= 1000000) return `${(total / 1000000).toFixed(1)}M`;
  if (total >= 1000) return `${(total / 1000).toFixed(1)}K`;
  
  return total.toString();
};

export const generateAvatarInitial = (name) => {
  if (!name) return 'U';
  
  const names = name.split(' ');
  if (names.length >= 2) {
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  }
  
  return name.substring(0, 2).toUpperCase();
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// New helper function to get user role display
export const getUserRoleDisplay = (user) => {
  if (!user) return '';
  
  const role = user.role || '';
  switch (role.toLowerCase()) {
    case 'brand':
      return 'Brand';
    case 'influencer':
      return 'Influencer';
    case 'admin':
      return 'Admin';
    default:
      return 'User';
  }
};

// New helper to check if user is online
export const isUserOnline = (user, onlineUsers) => {
  if (!user || !onlineUsers) return false;
  return onlineUsers.has(user.id);
};

// Format message content
export const formatMessageContent = (message) => {
  if (!message) return '';
  
  if (message.message_type === 'media') {
    if (message.content && message.content.trim() !== '') {
      return message.content;
    }
    return '📎 Media';
  }
  
  return message.content || '';
};