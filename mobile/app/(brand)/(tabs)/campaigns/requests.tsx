// C:\Sagadevan\quickbox\mobile\app\(brand)\(tabs)\requests.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  ScrollView,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  Pressable,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import Slider from '@react-native-community/slider';
import { campaignAPI } from '../../../../services/campaignAPI';
import profileAPI from '../../../../services/profileAPI';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../../../contexts/AuthContext';
import { useScroll } from "@/contexts/ScrollContext";
import { Animated } from "react-native";

const { width } = Dimensions.get('window');

// Types
interface Application {
  application_id?: string;
  influencer_id: string;
  influencer_name: string;
  influencer_email?: string;
  status: 'pending' | 'approved' | 'rejected' | 'contracted' | 'media_submitted' | 'completed';
  message?: string;
  applied_at: string;
  contract_signed?: boolean;
  contract_signed_at?: string;
  submitted_media?: any[];
  media_submitted_at?: string;

  // Campaign fields
  campaign_id: string;
  campaign_title: string;
  campaign_description?: string;
  campaign_requirements?: string;
  campaign_budget?: number;
  campaign_category?: string;
  campaign_deadline?: string;
  campaign_status?: string;
  campaign_currency?: string;
  campaign_image_id?: string;
  campaign_video_id?: string;

  // Brand fields
  brand_id?: string;
  brand_name?: string;
  brand_email?: string;

  // Additional fields from original app
  title?: string;
  description?: string;
  requirements?: string;
  budget?: number;
  category?: string;
  deadline?: string;
  currency?: string;
  campaign_image?: string;
  campaign_video?: string;
}

interface FilterState {
  globalSearch: string;
  title: string;
  influencerName: string;
  influencerEmail: string;
  category: string;
  status: string[];
  minBudget: string;
  maxBudget: string;
  dateRange: string;
  startDate: string;
  endDate: string;
}

interface MediaFile {
  file_id: string;
  filename: string;
  content_type: string;
  media_type: string;
  size: number;
  description?: string;
  submitted_at: string;
  download_url: string;
  influencer_id?: string;
  campaign_id?: string;
}

// Helper functions
const getImageUrl = (fileId: string | null) => {
  if (!fileId) return null;
  if (fileId.startsWith('http') || fileId.startsWith('data:')) {
    return fileId;
  }
  return `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000'}/api/campaigns/image/${fileId}`;
};

const getVideoUrl = (fileId: string | null) => {
  if (!fileId) return null;
  if (fileId.startsWith('http') || fileId.startsWith('data:')) {
    return fileId;
  }
  return `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000'}/api/campaigns/video/${fileId}`;
};

const getMediaViewUrl = (fileId: string) => {
  return `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000'}/api/media/${fileId}/view`;
};

const getMediaDownloadUrl = (fileId: string) => {
  return `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000'}/api/media/${fileId}/download`;
};

const formatCurrency = (amount: number, currency: string = 'USD') => {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$',
    INR: '₹',
  };
  const symbol = symbols[currency] || '$';
  return `${symbol}${amount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    return 'Invalid date';
  }
};

const formatDateTime = (dateString: string) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    return 'Invalid date';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved': return '#4CAF50';
    case 'pending': return '#FF9800';
    case 'rejected': return '#F44336';
    case 'completed': return '#2196F3';
    case 'contracted': return '#9C27B0';
    case 'media_submitted': return '#FF9800';
    default: return '#9E9E9E';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'pending': return 'Under Review';
    case 'approved': return 'Approved - Send Contract';
    case 'rejected': return 'Rejected';
    case 'completed': return 'Completed';
    case 'contracted': return 'Contract Signed';
    case 'media_submitted': return 'Media Submitted';
    default: return status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'approved': return 'checkmark-circle';
    case 'pending': return 'time';
    case 'rejected': return 'close-circle';
    case 'completed': return 'checkmark-done-circle';
    case 'contracted': return 'document-text';
    case 'media_submitted': return 'image';
    default: return 'help-circle';
  }
};

const getMediaIcon = (mediaType: string) => {
  switch (mediaType) {
    case 'image': return 'image';
    case 'video': return 'videocam';
    case 'audio': return 'musical-notes';
    case 'document': return 'document';
    default: return 'document-attach';
  }
};

// Status Chip Component
const StatusChip = ({ status }: { status: string }) => {
  const color = getStatusColor(status);
  const icon = getStatusIcon(status);

  return (
    <View style={[styles.statusChip, { backgroundColor: color + '20' }]}>
      <Ionicons name={icon as any} size={12} color={color} />
      <Text style={[styles.statusText, { color }]}>{getStatusText(status)}</Text>
    </View>
  );
};

// Profile Image Component
const ProfileImage = ({
  userId,
  profileType,
  size = 40,
  onPress
}: {
  userId: string;
  profileType: 'influencer' | 'brand';
  size?: number;
  onPress?: () => void;
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const response = await profileAPI.getProfileById(userId);

        if (response && response.profile) {
          const profileData = response.profile;

          let name = '';
          if (profileType === 'influencer') {
            name = profileData.nickname || profileData.full_name || 'Influencer';
          } else {
            name = profileData.company_name || profileData.contact_person_name || 'Brand';
          }
          setDisplayName(name);

          let imageId = null;
          if (profileType === 'influencer' && profileData.profile_picture) {
            imageId = profileData.profile_picture;
          } else if (profileType === 'brand' && profileData.logo) {
            imageId = profileData.logo;
          }

          if (imageId) {
            setImageUrl(`${process.env.EXPO_PUBLIC_API_URL}/profiles/image/${imageId}`);
          } else {
            setError(true);
          }
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProfileData();
    }
  }, [userId, profileType]);

  const getInitial = () => {
    return displayName?.charAt(0)?.toUpperCase() || 'U';
  };

  if (error || !imageUrl) {
    return (
      <TouchableOpacity onPress={onPress} disabled={!onPress}>
        <View
          style={[styles.profileImage, { width: size, height: size, borderRadius: size / 2, backgroundColor: '#0f6eea' }]}
        >
          <Text style={[styles.profileInitial, { fontSize: size * 0.4 }]}>
            {getInitial()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <View>
        {loading && (
          <View style={[styles.profileImageLoader, { width: size, height: size, borderRadius: size / 2 }]}>
            <ActivityIndicator size="small" color="#0f6eea" />
          </View>
        )}
        <Image
          source={{ uri: imageUrl }}
          style={[styles.profileImage, { width: size, height: size, borderRadius: size / 2 }]}
          contentFit="cover"
          transition={200}
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
        />
      </View>
    </TouchableOpacity>
  );
};

// User Info Component
const UserInfo = ({
  userId,
  profileType,
  showEmail = true,
  size = 40,
  showStats = false,
  onPress
}: {
  userId: string;
  profileType: 'influencer' | 'brand';
  showEmail?: boolean;
  size?: number;
  showStats?: boolean;
  onPress?: () => void;
}) => {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await profileAPI.getProfileById(userId);
        if (response && response.profile) {
          setUserData(response.profile);
        }
      } catch (error: any) {
        // Only log if it's not a "User not found" error to reduce noise
        if (error?.detail !== "User not found") {
          console.error('Error fetching user data:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const getDisplayName = () => {
    if (!userData) return 'Brio User';

    if (profileType === 'influencer') {
      return userData.nickname || userData.full_name || 'Influencer User';
    } else {
      return userData.company_name || userData.contact_person_name || 'Brio User';
    }
  };

  if (loading) {
    return (
      <View style={styles.userInfoContainer}>
        <ActivityIndicator size="small" color="#0f6eea" />
      </View>
    );
  }

  return (
    <TouchableOpacity style={styles.userInfoContainer} onPress={onPress} disabled={!onPress}>
      <ProfileImage
        userId={userId}
        profileType={profileType}
        size={size}
      />
      <View style={styles.userInfoText}>
        <Text style={styles.userInfoName} numberOfLines={1}>
          {getDisplayName()}
        </Text>
        {showEmail && userData?.email && (
          <Text style={styles.userInfoEmail} numberOfLines={1}>
            {userData.email}
          </Text>
        )}
        {showStats && profileType === 'influencer' && userData?.followers && (
          <View style={styles.userInfoStats}>
            <Ionicons name="people" size={12} color="#666666" />
            <Text style={styles.userInfoFollowers}>
              {userData.followers?.toLocaleString()} followers
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

// Campaign Image Component
const CampaignImage = ({
  fileId,
  title,
  category,
  budget,
  currency,
  onPress
}: {
  fileId: string | null;
  title: string;
  category?: string;
  budget?: number;
  currency?: string;
  onPress?: () => void;
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const imageUrl = fileId ? getImageUrl(fileId) : null;

  if (!imageUrl || error) {
    return (
      <TouchableOpacity onPress={onPress} disabled={!onPress} style={styles.campaignImageContainer}>
        <View
          style={[styles.campaignImagePlaceholder, { backgroundColor: '#0f6eea' }]}
        >
          <Ionicons name="megaphone" size={32} color="#FFFFFF" />
          <Text style={styles.campaignImageTitle} numberOfLines={1}>
            {title}
          </Text>
        </View>

        {budget && (
          <View style={styles.campaignBudgetBadge}>
            <Ionicons name="cash" size={12} color="#FFFFFF" />
            <Text style={styles.campaignBudgetText}>
              {formatCurrency(budget, currency)}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress} style={styles.campaignImageContainer}>
      {loading && (
        <View style={styles.campaignImageLoader}>
          <ActivityIndicator size="small" color="#FFFFFF" />
        </View>
      )}
      <Image
        source={{ uri: imageUrl }}
        style={styles.campaignImage}
        contentFit="cover"
        transition={200}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
      />

      {budget && (
        <View style={styles.campaignBudgetBadge}>
          <Ionicons name="cash" size={12} color="#FFFFFF" />
          <Text style={styles.campaignBudgetText}>
            {formatCurrency(budget, currency)}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// Application Card Component
const ApplicationCard = ({
  application,
  onPress,
  onChat,
  onViewMedia,
  onApprove,
  onReject,
  onSendContract,
  onProcessPayment,
  updating
}: {
  application: Application;
  onPress: () => void;
  onChat: () => void;
  onViewMedia: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onSendContract?: () => void;
  onProcessPayment?: () => void;
  updating: boolean;
}) => {
  const statusColor = getStatusColor(application.status);

  return (
    <View style={styles.applicationCard}>
      {/* Campaign Image */}
      <CampaignImage
        fileId={application.campaign_image_id || application.campaign_image || null}
        title={application.campaign_title || application.title || 'Campaign'}
        category={application.campaign_category || application.category}
        budget={application.campaign_budget || application.budget}
        currency={application.campaign_currency || application.currency}
      />

      <View style={styles.applicationCardContent}>
        {/* Header with Influencer Info */}
        <View style={styles.applicationCardHeader}>
          <UserInfo
            userId={application.influencer_id}
            profileType="influencer"
            showEmail={false}
            showStats
            size={36}
            onPress={() => router.push(`/(shared)/profile/${application.influencer_id}`)}
          />
          <StatusChip status={application.status} />
        </View>

        {/* Campaign Title */}
        <Text style={styles.applicationCampaignTitle} numberOfLines={1}>
          {application.campaign_title || application.title || 'Unknown Campaign'}
        </Text>

        {/* Meta Info */}
        <View style={styles.applicationMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="pricetag" size={12} color="#666666" />
            <Text style={styles.metaText}>
              {application.campaign_category || application.category || 'General'}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="calendar" size={12} color="#666666" />
            <Text style={styles.metaText}>
              {formatDate(application.applied_at)}
            </Text>
          </View>
        </View>

        {/* Budget */}
        {(application.campaign_budget || application.budget) ? (
          <View style={styles.budgetContainer}>
            <Ionicons name="cash" size={14} color="#4CAF50" />
            <Text style={styles.budgetText}>
              {formatCurrency(
                application.campaign_budget || application.budget || 0,
                application.campaign_currency || application.currency
              )}
            </Text>
          </View>
        ) : null}

        {/* Message Preview */}
        {application.message ? (
          <View style={styles.messagePreview}>
            <Text style={styles.messagePreviewText} numberOfLines={2}>
              "{application.message}"
            </Text>
          </View>
        ) : null}

        {/* Action Buttons */}
        <View style={styles.applicationActions}>
          {/* Primary Actions Row */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.viewButton} onPress={onPress}>
              <View style={[styles.viewButtonGradient, { backgroundColor: '#0f6eea' }]}>
                <Ionicons name="eye" size={16} color="#FFFFFF" />
                <Text style={styles.viewButtonText}>View</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.chatButton} onPress={onChat}>
              <Ionicons name="chatbubble" size={16} color="#4CAF50" />
            </TouchableOpacity>

            {(application.status === 'media_submitted' || application.status === 'completed') && (
              <TouchableOpacity style={styles.mediaButton} onPress={onViewMedia}>
                <Ionicons name="images" size={16} color="#2196F3" />
              </TouchableOpacity>
            )}
          </View>

          {/* Status-specific Actions */}
          {application.status === 'pending' && onApprove && onReject && (
            <View style={styles.statusActionRow}>
              <TouchableOpacity
                style={styles.approveButton}
                onPress={onApprove}
                disabled={updating}
              >
                <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                <Text style={styles.buttonText}>
                  {updating ? '...' : 'Approve'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.rejectButton}
                onPress={onReject}
                disabled={updating}
              >
                <Ionicons name="close-circle" size={16} color="#FFFFFF" />
                <Text style={styles.buttonText}>
                  {updating ? '...' : 'Reject'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {application.status === 'approved' && onSendContract && (
            <TouchableOpacity
              style={styles.contractButton}
              onPress={onSendContract}
              disabled={updating}
            >
              <Ionicons name="document-text" size={16} color="#FFFFFF" />
              <Text style={styles.buttonText}>Send Contract</Text>
            </TouchableOpacity>
          )}

          {application.status === 'media_submitted' && onProcessPayment && (
            <TouchableOpacity
              style={styles.paymentButton}
              onPress={onProcessPayment}
              disabled={updating}
            >
              <Ionicons name="cash" size={16} color="#FFFFFF" />
              <Text style={styles.buttonText}>Process Payment</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

// Filter Modal Component
const FilterModal = ({
  visible,
  onClose,
  filters,
  onApply,
  onClear
}: {
  visible: boolean;
  onClose: () => void;
  filters: FilterState;
  onApply: (filters: FilterState) => void;
  onClear: () => void;
}) => {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerType, setDatePickerType] = useState<'start' | 'end'>('start');

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleClear = () => {
    const clearedFilters = {
      globalSearch: '',
      title: '',
      influencerName: '',
      influencerEmail: '',
      category: '',
      status: [],
      minBudget: '',
      maxBudget: '',
      dateRange: '',
      startDate: '',
      endDate: ''
    };
    setLocalFilters(clearedFilters);
    onClear();
    onClose();
  };

  const toggleStatus = (status: string) => {
    setLocalFilters(prev => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status]
    }));
  };

  const statusOptions = [
    { value: 'pending', label: 'Under Review', color: '#FF9800' },
    { value: 'approved', label: 'Approved', color: '#4CAF50' },
    { value: 'rejected', label: 'Rejected', color: '#F44336' },
    { value: 'contracted', label: 'Contracted', color: '#9C27B0' },
    { value: 'media_submitted', label: 'Media Submitted', color: '#FF9800' },
    { value: 'completed', label: 'Completed', color: '#2196F3' },
  ];

  const categoryOptions = [
    'Fashion', 'Beauty', 'Lifestyle', 'Food', 'Travel', 'Fitness', 'Technology', 'Gaming', 'Other'
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.filterModalContent}>
          <View
            style={[styles.filterModalHeader, { backgroundColor: '#0f6eea' }]}
          >
            <Text style={styles.filterModalTitle}>Filters</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterModalBody}>
            {/* Global Search */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Global Search</Text>
              <View style={styles.filterInputContainer}>
                <Ionicons name="search" size={18} color="#999999" />
                <TextInput
                  style={styles.filterInput}
                  placeholder="Search all fields..."
                  value={localFilters.globalSearch}
                  onChangeText={(text) => setLocalFilters({ ...localFilters, globalSearch: text })}
                />
              </View>
            </View>

            {/* Campaign Title */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Campaign Title</Text>
              <View style={styles.filterInputContainer}>
                <Ionicons name="megaphone" size={18} color="#999999" />
                <TextInput
                  style={styles.filterInput}
                  placeholder="Filter by campaign title..."
                  value={localFilters.title}
                  onChangeText={(text) => setLocalFilters({ ...localFilters, title: text })}
                />
              </View>
            </View>

            {/* Influencer Name */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Influencer Name</Text>
              <View style={styles.filterInputContainer}>
                <Ionicons name="person" size={18} color="#999999" />
                <TextInput
                  style={styles.filterInput}
                  placeholder="Filter by influencer name..."
                  value={localFilters.influencerName}
                  onChangeText={(text) => setLocalFilters({ ...localFilters, influencerName: text })}
                />
              </View>
            </View>

            {/* Category */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                {categoryOptions.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryChip,
                      localFilters.category === category && styles.categoryChipSelected,
                    ]}
                    onPress={() => setLocalFilters({
                      ...localFilters,
                      category: localFilters.category === category ? '' : category
                    })}
                  >
                    <Text style={[
                      styles.categoryChipText,
                      localFilters.category === category && styles.categoryChipTextSelected,
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Status */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Status</Text>
              <View style={styles.statusGrid}>
                {statusOptions.map((status) => (
                  <TouchableOpacity
                    key={status.value}
                    style={[
                      styles.statusFilterChip,
                      localFilters.status.includes(status.value) && styles.statusFilterChipSelected,
                      { borderColor: status.color }
                    ]}
                    onPress={() => toggleStatus(status.value)}
                  >
                    <Text style={[
                      styles.statusFilterChipText,
                      localFilters.status.includes(status.value) && { color: status.color }
                    ]}>
                      {status.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Budget Range */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Budget Range</Text>
              <View style={styles.budgetRow}>
                <View style={styles.budgetInputContainer}>
                  <Text style={styles.budgetPrefix}>Min</Text>
                  <TextInput
                    style={styles.budgetInput}
                    placeholder="0"
                    keyboardType="numeric"
                    value={localFilters.minBudget}
                    onChangeText={(text) => setLocalFilters({ ...localFilters, minBudget: text })}
                  />
                </View>
                <View style={styles.budgetSeparator}>
                  <Text>to</Text>
                </View>
                <View style={styles.budgetInputContainer}>
                  <Text style={styles.budgetPrefix}>Max</Text>
                  <TextInput
                    style={styles.budgetInput}
                    placeholder="10000"
                    keyboardType="numeric"
                    value={localFilters.maxBudget}
                    onChangeText={(text) => setLocalFilters({ ...localFilters, maxBudget: text })}
                  />
                </View>
              </View>
            </View>

            {/* Date Range */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Date Range</Text>
              <View style={styles.dateRangeContainer}>
                <TouchableOpacity
                  style={[
                    styles.dateRangeOption,
                    localFilters.dateRange === 'today' && styles.dateRangeOptionSelected,
                  ]}
                  onPress={() => setLocalFilters({ ...localFilters, dateRange: 'today' })}
                >
                  <Text style={[
                    styles.dateRangeText,
                    localFilters.dateRange === 'today' && styles.dateRangeTextSelected,
                  ]}>
                    Today
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.dateRangeOption,
                    localFilters.dateRange === 'week' && styles.dateRangeOptionSelected,
                  ]}
                  onPress={() => setLocalFilters({ ...localFilters, dateRange: 'week' })}
                >
                  <Text style={[
                    styles.dateRangeText,
                    localFilters.dateRange === 'week' && styles.dateRangeTextSelected,
                  ]}>
                    Last 7 Days
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.dateRangeOption,
                    localFilters.dateRange === 'month' && styles.dateRangeOptionSelected,
                  ]}
                  onPress={() => setLocalFilters({ ...localFilters, dateRange: 'month' })}
                >
                  <Text style={[
                    styles.dateRangeText,
                    localFilters.dateRange === 'month' && styles.dateRangeTextSelected,
                  ]}>
                    Last 30 Days
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          <View style={styles.filterModalFooter}>
            <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <View style={[styles.applyButtonGradient, { backgroundColor: '#0f6eea' }]}>
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Application Detail Modal
const ApplicationDetailModal = ({
  visible,
  onClose,
  application,
  onStatusChange,
  onSendMessage,
  onViewProfile,
  onViewMedia,
  onSendContract,
  onProcessPayment,
  updating
}: {
  visible: boolean;
  onClose: () => void;
  application: Application | null;
  onStatusChange?: (status: string) => void;
  onSendMessage?: () => void;
  onViewProfile?: () => void;
  onViewMedia?: () => void;
  onSendContract?: () => void;
  onProcessPayment?: () => void;
  updating: boolean;
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [influencerData, setInfluencerData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInfluencerData = async () => {
      if (application?.influencer_id) {
        try {
          setLoading(true);
          const response = await profileAPI.getProfileById(application.influencer_id);
          if (response?.profile) {
            setInfluencerData(response.profile);
          }
        } catch (error) {
          console.error('Error fetching influencer data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    if (visible && application) {
      fetchInfluencerData();
    }
  }, [visible, application]);

  if (!application) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View
          style={[styles.modalHeader, { backgroundColor: '#0f6eea' }]}
        >
          <TouchableOpacity onPress={onClose} style={styles.modalBackButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.modalTitle} numberOfLines={1}>
            Application Details
          </Text>
          <View style={styles.modalHeaderRight} />
        </View>

        <View style={styles.modalTabs}>
          <TouchableOpacity
            style={[styles.modalTab, activeTab === 'overview' && styles.modalTabActive]}
            onPress={() => setActiveTab('overview')}
          >
            <Text style={[styles.modalTabText, activeTab === 'overview' && styles.modalTabTextActive]}>
              Overview
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalTab, activeTab === 'profile' && styles.modalTabActive]}
            onPress={() => setActiveTab('profile')}
          >
            <Text style={[styles.modalTabText, activeTab === 'profile' && styles.modalTabTextActive]}>
              Profile
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalTab, activeTab === 'campaign' && styles.modalTabActive]}
            onPress={() => setActiveTab('campaign')}
          >
            <Text style={[styles.modalTabText, activeTab === 'campaign' && styles.modalTabTextActive]}>
              Campaign
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {activeTab === 'overview' && (
            <View>
              {/* Campaign Details */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Campaign Details</Text>
                <View style={styles.modalCard}>
                  <Text style={styles.modalCampaignTitle}>
                    {application.campaign_title || application.title || 'Unknown Campaign'}
                  </Text>

                  <View style={styles.modalMetaGrid}>
                    <View style={styles.modalMetaItem}>
                      <Ionicons name="cash" size={16} color="#4CAF50" />
                      <Text style={styles.modalMetaLabel}>Budget</Text>
                      <Text style={styles.modalMetaValue}>
                        {formatCurrency(
                          application.campaign_budget || application.budget || 0,
                          application.campaign_currency || application.currency
                        )}
                      </Text>
                    </View>
                    <View style={styles.modalMetaItem}>
                      <Ionicons name="pricetag" size={16} color="#0f6eea" />
                      <Text style={styles.modalMetaLabel}>Category</Text>
                      <Text style={styles.modalMetaValue}>
                        {application.campaign_category || application.category || 'General'}
                      </Text>
                    </View>
                    <View style={styles.modalMetaItem}>
                      <Ionicons name="calendar" size={16} color="#FF9800" />
                      <Text style={styles.modalMetaLabel}>Deadline</Text>
                      <Text style={styles.modalMetaValue}>
                        {formatDate(application.campaign_deadline || application.deadline || '')}
                      </Text>
                    </View>
                    <View style={styles.modalMetaItem}>
                      <StatusChip status={application.status} />
                    </View>
                  </View>

                  {application.campaign_description || application.description ? (
                    <View style={styles.modalTextBox}>
                      <Text style={styles.modalTextLabel}>Description</Text>
                      <Text style={styles.modalText}>
                        {application.campaign_description || application.description}
                      </Text>
                    </View>
                  ) : null}

                  {application.campaign_requirements || application.requirements ? (
                    <View style={styles.modalTextBox}>
                      <Text style={styles.modalTextLabel}>Requirements</Text>
                      <Text style={styles.modalText}>
                        {application.campaign_requirements || application.requirements}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>

              {/* Quick Actions */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Quick Actions</Text>
                <View style={styles.quickActionsGrid}>
                  <TouchableOpacity style={styles.quickAction} onPress={onViewProfile}>
                    <Ionicons name="person" size={20} color="#0f6eea" />
                    <Text style={styles.quickActionText}>Profile</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.quickAction} onPress={onSendMessage}>
                    <Ionicons name="chatbubble" size={20} color="#4CAF50" />
                    <Text style={styles.quickActionText}>Message</Text>
                  </TouchableOpacity>

                  {application.status === 'approved' && (
                    <TouchableOpacity
                      style={[styles.quickAction, styles.quickActionPrimary]}
                      onPress={onSendContract}
                      disabled={updating}
                    >
                      <Ionicons name="document-text" size={20} color="#FFFFFF" />
                      <Text style={[styles.quickActionText, styles.quickActionTextLight]}>
                        {updating ? '...' : 'Contract'}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {application.status === 'media_submitted' && (
                    <>
                      <TouchableOpacity
                        style={[styles.quickAction, styles.quickActionInfo]}
                        onPress={onViewMedia}
                      >
                        <Ionicons name="images" size={20} color="#FFFFFF" />
                        <Text style={[styles.quickActionText, styles.quickActionTextLight]}>
                          Media
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.quickAction, styles.quickActionSuccess]}
                        onPress={onProcessPayment}
                        disabled={updating}
                      >
                        <Ionicons name="cash" size={20} color="#FFFFFF" />
                        <Text style={[styles.quickActionText, styles.quickActionTextLight]}>
                          Pay
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>

              {/* Influencer Message */}
              {application.message && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Influencer Message</Text>
                  <View style={styles.messageBox}>
                    <Text style={styles.messageText}>"{application.message}"</Text>
                  </View>
                </View>
              )}

              {/* Timeline */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Timeline</Text>
                <View style={styles.timelineCard}>
                  <View style={styles.timelineItem}>
                    <Ionicons name="time" size={16} color="#666666" />
                    <Text style={styles.timelineLabel}>Applied on:</Text>
                    <Text style={styles.timelineValue}>{formatDateTime(application.applied_at)}</Text>
                  </View>
                  {application.media_submitted_at && (
                    <View style={styles.timelineItem}>
                      <Ionicons name="image" size={16} color="#666666" />
                      <Text style={styles.timelineLabel}>Media submitted:</Text>
                      <Text style={styles.timelineValue}>{formatDateTime(application.media_submitted_at)}</Text>
                    </View>
                  )}
                  {application.contract_signed_at && (
                    <View style={styles.timelineItem}>
                      <Ionicons name="document-text" size={16} color="#666666" />
                      <Text style={styles.timelineLabel}>Contract signed:</Text>
                      <Text style={styles.timelineValue}>{formatDateTime(application.contract_signed_at)}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          )}

          {activeTab === 'profile' && (
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Influencer Profile</Text>
              {loading ? (
                <ActivityIndicator size="large" color="#0f6eea" />
              ) : influencerData ? (
                <View style={styles.profileCard}>
                  <ProfileImage
                    userId={application.influencer_id}
                    profileType="influencer"
                    size={80}
                  />
                  <Text style={styles.profileName}>
                    {influencerData.nickname || influencerData.full_name}
                  </Text>
                  <Text style={styles.profileEmail}>{influencerData.email}</Text>

                  {influencerData.bio && (
                    <View style={styles.profileBio}>
                      <Text style={styles.profileBioLabel}>Bio</Text>
                      <Text style={styles.profileBioText}>{influencerData.bio}</Text>
                    </View>
                  )}

                  {influencerData.followers && (
                    <View style={styles.profileStats}>
                      <View style={styles.profileStat}>
                        <Ionicons name="people" size={16} color="#666666" />
                        <Text style={styles.profileStatValue}>
                          {influencerData.followers.toLocaleString()} followers
                        </Text>
                      </View>
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.viewProfileButton}
                    onPress={onViewProfile}
                  >
                    <View style={[styles.viewProfileGradient, { backgroundColor: '#0f6eea' }]}>
                      <Ionicons name="person" size={18} color="#FFFFFF" />
                      <Text style={styles.viewProfileText}>View Full Profile</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={styles.noDataText}>Profile data not available</Text>
              )}
            </View>
          )}

          {activeTab === 'campaign' && (
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Campaign Details</Text>
              <View style={styles.campaignDetailCard}>
                {application.campaign_image_id && (
                  <Image
                    source={{ uri: getImageUrl(application.campaign_image_id) || '' }}
                    style={styles.campaignDetailImage}
                    contentFit="cover"
                  />
                )}

                <Text style={styles.campaignDetailTitle}>
                  {application.campaign_title || application.title}
                </Text>

                <Text style={styles.campaignDetailDescription}>
                  {application.campaign_description || application.description}
                </Text>

                <View style={styles.campaignDetailMeta}>
                  <View style={styles.campaignDetailMetaItem}>
                    <Ionicons name="cash" size={16} color="#4CAF50" />
                    <Text style={styles.campaignDetailMetaLabel}>Budget</Text>
                    <Text style={styles.campaignDetailMetaValue}>
                      {formatCurrency(
                        application.campaign_budget || application.budget || 0,
                        application.campaign_currency || application.currency
                      )}
                    </Text>
                  </View>
                  <View style={styles.campaignDetailMetaItem}>
                    <Ionicons name="calendar" size={16} color="#FF9800" />
                    <Text style={styles.campaignDetailMetaLabel}>Deadline</Text>
                    <Text style={styles.campaignDetailMetaValue}>
                      {formatDate(application.campaign_deadline || application.deadline || '')}
                    </Text>
                  </View>
                </View>

                {application.campaign_requirements || application.requirements ? (
                  <View style={styles.campaignDetailBox}>
                    <Text style={styles.campaignDetailBoxLabel}>Requirements</Text>
                    <Text style={styles.campaignDetailBoxText}>
                      {application.campaign_requirements || application.requirements}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.modalFooter}>
          {application.status === 'pending' && (
            <View style={styles.modalFooterActions}>
              <TouchableOpacity
                style={styles.modalApproveButton}
                onPress={() => onStatusChange?.('approved')}
                disabled={updating}
              >
                <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                <Text style={styles.modalButtonText}>
                  {updating ? '...' : 'Approve'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalRejectButton}
                onPress={() => onStatusChange?.('rejected')}
                disabled={updating}
              >
                <Ionicons name="close-circle" size={18} color="#FFFFFF" />
                <Text style={styles.modalButtonText}>
                  {updating ? '...' : 'Reject'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
            <Text style={styles.modalCloseText}>Close</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

// Media Files Modal
const MediaFilesModal = ({
  visible,
  onClose,
  application
}: {
  visible: boolean;
  onClose: () => void;
  application: Application | null;
}) => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMediaFiles = async () => {
      if (visible && application) {
        setLoading(true);
        setError('');
        try {
          let mediaData: MediaFile[] = [];

          try {
            const response = await campaignAPI.getCampaignMediaFiles(application.campaign_id);
            if (response && Array.isArray(response)) {
              mediaData = response.filter((media: any) =>
                media.influencer_id === application.influencer_id
              );
            }
          } catch (campaignError) {
            console.warn('Campaign media API failed:', campaignError);
          }

          if (mediaData.length === 0 && application.submitted_media) {
            mediaData = application.submitted_media.map((media: any) => ({
              ...media,
              campaign_id: application.campaign_id,
              influencer_id: application.influencer_id
            }));
          }

          setMediaFiles(mediaData);

          if (mediaData.length === 0) {
            setError('No media files found for this application.');
          }

        } catch (error) {
          console.error('Error fetching media files:', error);
          setError('Failed to load media files.');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchMediaFiles();
  }, [visible, application]);

  if (!application) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View
          style={[styles.modalHeader, { backgroundColor: '#0f6eea' }]}
        >
          <TouchableOpacity onPress={onClose} style={styles.modalBackButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.modalTitle} numberOfLines={1}>
            Media Files ({mediaFiles.length})
          </Text>
          <View style={styles.modalHeaderRight} />
        </View>

        <ScrollView style={styles.modalContent}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0f6eea" />
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={48} color="#F44336" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : mediaFiles.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="images-outline" size={64} color="#CCCCCC" />
              <Text style={styles.emptyText}>No media files found</Text>
            </View>
          ) : (
            <View style={styles.mediaGrid}>
              {mediaFiles.map((media, index) => (
                <TouchableOpacity
                  key={media.file_id || index}
                  style={styles.mediaCard}
                  onPress={() => setSelectedMedia(media)}
                >
                  <View style={styles.mediaPreview}>
                    {media.media_type === 'image' ? (
                      <Image
                        source={{ uri: getMediaViewUrl(media.file_id) }}
                        style={styles.mediaImage}
                        contentFit="cover"
                      />
                    ) : (
                      <View style={styles.mediaPlaceholder}>
                        <Ionicons name={getMediaIcon(media.media_type) as any} size={32} color="#0f6eea" />
                      </View>
                    )}
                  </View>
                  <View style={styles.mediaInfo}>
                    <Text style={styles.mediaFilename} numberOfLines={1}>
                      {media.filename || `File ${index + 1}`}
                    </Text>
                    <Text style={styles.mediaMeta}>
                      {media.media_type} • {media.size ? `${(media.size / 1024).toFixed(1)} KB` : 'Unknown'}
                    </Text>
                    {media.description && (
                      <Text style={styles.mediaDescription} numberOfLines={1}>
                        {media.description}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Media Viewer Modal */}
      <Modal
        visible={!!selectedMedia}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedMedia(null)}
      >
        <View style={styles.viewerOverlay}>
          <View style={styles.viewerContent}>
            <View style={styles.viewerHeader}>
              <Text style={styles.viewerTitle}>
                {selectedMedia?.filename || 'Media File'}
              </Text>
              <TouchableOpacity onPress={() => setSelectedMedia(null)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.viewerBody}>
              {selectedMedia?.media_type === 'image' ? (
                <Image
                  source={{ uri: getMediaViewUrl(selectedMedia.file_id) }}
                  style={styles.viewerImage}
                  contentFit="contain"
                />
              ) : (
                <View style={styles.viewerPlaceholder}>
                  <Ionicons name={getMediaIcon(selectedMedia?.media_type || '') as any} size={64} color="#FFFFFF" />
                  <Text style={styles.viewerPlaceholderText}>
                    {selectedMedia?.media_type?.toUpperCase()} file preview not available
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.viewerFooter}>
              <TouchableOpacity
                style={styles.viewerDownloadButton}
                onPress={() => {
                  // Open download URL
                  // In React Native, you'd use Linking or a download library
                }}
              >
                <Ionicons name="download" size={20} color="#FFFFFF" />
                <Text style={styles.viewerDownloadText}>Download</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

// Main Component
const HEADER_HEIGHT = 260; // Approximate height of the requests page header section

export default function BrandRequests() {

  const scrollY = useScroll();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [mediaModalVisible, setMediaModalVisible] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<Record<string, boolean>>({});

  // 🛠️ Header Animation Logic
  const clampedScrollY = Animated.diffClamp(scrollY, 0, HEADER_HEIGHT);
  const headerTranslateY = clampedScrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, -HEADER_HEIGHT],
    extrapolate: 'clamp',
  });


  const [filters, setFilters] = useState<FilterState>({
    globalSearch: '',
    title: '',
    influencerName: '',
    influencerEmail: '',
    category: '',
    status: [],
    minBudget: '',
    maxBudget: '',
    dateRange: '',
    startDate: '',
    endDate: ''
  });

  // Fetch applications
  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await campaignAPI.getBrandApplications();

      const appsData = Array.isArray(response) ? response : [];

      setApplications(appsData as any[]);
    } catch (err) {
      setError('Failed to load applications');
      console.error('Failed to fetch applications:', err);
      setApplications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchApplications();
    }, [])
  );

  // Apply filters
  useEffect(() => {
    let filtered = applications;

    // Tab filtering
    if (activeTab !== 'all') {
      filtered = filtered.filter(app => app.status === activeTab);
    }

    // Global search
    if (filters.globalSearch) {
      const query = filters.globalSearch.toLowerCase();
      filtered = filtered.filter(app =>
      (app.influencer_name?.toLowerCase().includes(query) ||
        app.campaign_title?.toLowerCase().includes(query) ||
        app.title?.toLowerCase().includes(query) ||
        app.influencer_email?.toLowerCase().includes(query) ||
        app.message?.toLowerCase().includes(query))
      );
    }

    // Campaign title filter
    if (filters.title) {
      filtered = filtered.filter(app =>
        (app.campaign_title || app.title || '')
          .toLowerCase()
          .includes(filters.title.toLowerCase())
      );
    }

    // Influencer name filter
    if (filters.influencerName) {
      filtered = filtered.filter(app =>
        app.influencer_name?.toLowerCase().includes(filters.influencerName.toLowerCase())
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(app =>
        (app.campaign_category || app.category || '')
          .toLowerCase() === filters.category.toLowerCase()
      );
    }

    // Status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(app => filters.status.includes(app.status));
    }

    // Budget range filter
    if (filters.minBudget) {
      filtered = filtered.filter(app =>
        (app.campaign_budget || app.budget || 0) >= parseInt(filters.minBudget)
      );
    }
    if (filters.maxBudget) {
      filtered = filtered.filter(app =>
        (app.campaign_budget || app.budget || 0) <= parseInt(filters.maxBudget)
      );
    }

    setFilteredApplications(filtered);
  }, [applications, filters, activeTab]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchApplications();
  }, []);

  const handleStatusChange = async (campaignId: string, influencerId: string, newStatus: any) => {
    const key = `${campaignId}-${influencerId}`;
    setUpdatingStatus(prev => ({ ...prev, [key]: true }));

    try {
      await campaignAPI.updateApplicationStatus(campaignId, influencerId, { status: newStatus });

      if (newStatus === 'approved') {
        setSuccess(`Application approved! You can now send the contract.`);
        const approvedApp = applications.find(app =>
          app.campaign_id === campaignId && app.influencer_id === influencerId
        );
        if (approvedApp) {
          setSelectedApplication(approvedApp);
          setDetailModalVisible(false);
          // Open contract modal or navigate
        }
      } else {
        setSuccess(`Application ${newStatus} successfully!`);
      }

      await fetchApplications();
    } catch (err) {
      setError('Failed to update application status');
      console.error('Status update error:', err);
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleSendContract = async (application: Application) => {
    try {
      await campaignAPI.sendContractAgreement(application.campaign_id, application.influencer_id);
      setSuccess('Contract agreement sent successfully!');
      await fetchApplications();
      setDetailModalVisible(false);
      router.push('/(brand)/(tabs)/account/agreements');
    } catch (err) {
      setError('Failed to send contract');
      console.error('Contract error:', err);
    }
  };

  const handleProcessPayment = (application: Application) => {
    router.push(`/(brand)/(tabs)/account/payments?campaign=${application.campaign_id}&influencer=${application.influencer_id}`);
    setDetailModalVisible(false);
  };

  const handleDirectChat = (application: Application) => {
    router.push(`/(brand)/(tabs)/chat?user=${application.influencer_id}&campaign=${application.campaign_id}`);
  };

  const handleViewProfile = (userId: string) => {
    router.push(`/(shared)/profile/${userId}`);
  };

  const handleViewMediaFiles = (application: Application) => {
    setSelectedApplication(application);
    setMediaModalVisible(true);
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value =>
      value !== '' &&
      !(Array.isArray(value) && value.length === 0)
    ).length;
  };

  const clearAllFilters = () => {
    setFilters({
      globalSearch: '',
      title: '',
      influencerName: '',
      influencerEmail: '',
      category: '',
      status: [],
      minBudget: '',
      maxBudget: '',
      dateRange: '',
      startDate: '',
      endDate: ''
    });
  };

  const tabCounts = {
    all: applications.length,
    pending: applications.filter(app => app.status === 'pending').length,
    approved: applications.filter(app => app.status === 'approved').length,
    rejected: applications.filter(app => app.status === 'rejected').length,
    contracted: applications.filter(app => app.status === 'contracted').length,
    media_submitted: applications.filter(app => app.status === 'media_submitted').length,
    completed: applications.filter(app => app.status === 'completed').length,
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header - Animated Sticky */}
      <Animated.View style={[
        styles.header,
        {
          paddingTop: insets.top + 10,
          transform: [{ translateY: headerTranslateY }],
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
        }
      ]}>

        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Influencer Applications</Text>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => router.push('/(brand)/(tabs)/account/agreements')}
          >
            <Ionicons name="document-text" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>
          Manage and review influencer applications for your campaigns
        </Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#FFFFFF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search applications..."
              value={filters.globalSearch}
              onChangeText={(text) => setFilters({ ...filters, globalSearch: text })}
              placeholderTextColor="rgba(255,255,255,0.7)"
            />
            {filters.globalSearch ? (
              <TouchableOpacity onPress={() => setFilters({ ...filters, globalSearch: '' })}>
                <Ionicons name="close-circle" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            ) : null}
          </View>

          <TouchableOpacity
            style={[styles.filterButton, getActiveFilterCount() > 0 && styles.filterButtonActive]}
            onPress={() => setFilterModalVisible(true)}
          >
            <Ionicons
              name="options-outline"
              size={20}
              color="#FFFFFF"
            />
            {getActiveFilterCount() > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{getActiveFilterCount()}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'all' && styles.tabActive]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
              All ({tabCounts.all})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'pending' && styles.tabActive]}
            onPress={() => setActiveTab('pending')}
          >
            <Text style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>
              Under Review ({tabCounts.pending})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'approved' && styles.tabActive]}
            onPress={() => setActiveTab('approved')}
          >
            <Text style={[styles.tabText, activeTab === 'approved' && styles.tabTextActive]}>
              Approved ({tabCounts.approved})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'contracted' && styles.tabActive]}
            onPress={() => setActiveTab('contracted')}
          >
            <Text style={[styles.tabText, activeTab === 'contracted' && styles.tabTextActive]}>
              Contracted ({tabCounts.contracted})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'media_submitted' && styles.tabActive]}
            onPress={() => setActiveTab('media_submitted')}
          >
            <Text style={[styles.tabText, activeTab === 'media_submitted' && styles.tabTextActive]}>
              Media Ready ({tabCounts.media_submitted})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'completed' && styles.tabActive]}
            onPress={() => setActiveTab('completed')}
          >
            <Text style={[styles.tabText, activeTab === 'completed' && styles.tabTextActive]}>
              Completed ({tabCounts.completed})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'rejected' && styles.tabActive]}
            onPress={() => setActiveTab('rejected')}
          >
            <Text style={[styles.tabText, activeTab === 'rejected' && styles.tabTextActive]}>
              Rejected ({tabCounts.rejected})
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Results Info */}
        <View style={styles.resultsInfo}>
          <Text style={styles.resultsText}>
            Showing {filteredApplications.length} of {applications.length} applications
          </Text>
          {getActiveFilterCount() > 0 && (
            <TouchableOpacity onPress={clearAllFilters}>
              <Text style={styles.clearFiltersText}>Clear Filters</Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>


      {/* Alerts */}
      {error ? (
        <View style={styles.errorAlert}>
          <Ionicons name="alert-circle" size={20} color="#F44336" />
          <Text style={styles.errorAlertText}>{error}</Text>
          <TouchableOpacity onPress={() => setError('')}>
            <Ionicons name="close" size={18} color="#F44336" />
          </TouchableOpacity>
        </View>
      ) : null}

      {success ? (
        <View style={styles.successAlert}>
          <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
          <Text style={styles.successAlertText}>{success}</Text>
          <TouchableOpacity onPress={() => setSuccess('')}>
            <Ionicons name="close" size={18} color="#4CAF50" />
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Applications List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0f6eea" />
        </View>
      ) : filteredApplications.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="mail-unread-outline" size={64} color="#CCCCCC" />
          <Text style={styles.emptyStateTitle}>No applications found</Text>
          <Text style={styles.emptyStateSubtitle}>
            {getActiveFilterCount() > 0
              ? 'Try adjusting your filters'
              : 'Applications from influencers will appear here'
            }
          </Text>
          {getActiveFilterCount() > 0 && (
            <TouchableOpacity style={styles.clearFiltersButton} onPress={clearAllFilters}>
              <Text style={styles.clearFiltersButtonText}>Clear Filters</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <Animated.FlatList
          data={filteredApplications}
          keyExtractor={(item) => `${item.campaign_id}-${item.influencer_id}`}
          renderItem={({ item }) => (
            <ApplicationCard
              application={item}
              onPress={() => {
                setSelectedApplication(item);
                setDetailModalVisible(true);
              }}
              onChat={() => handleDirectChat(item)}
              onViewMedia={() => handleViewMediaFiles(item)}
              onApprove={() => handleStatusChange(item.campaign_id, item.influencer_id, 'approved')}
              onReject={() => handleStatusChange(item.campaign_id, item.influencer_id, 'rejected')}
              onSendContract={() => handleSendContract(item)}
              onProcessPayment={() => handleProcessPayment(item)}
              updating={updatingStatus[`${item.campaign_id}-${item.influencer_id}`]}
            />
          )}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: 100, paddingTop: HEADER_HEIGHT + 10 } // Add padding for tab bar and sticky header
          ]}

          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0f6eea']} />
          }
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        />
      )}

      {/* Modals */}
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        filters={filters}
        onApply={setFilters}
        onClear={clearAllFilters}
      />

      <ApplicationDetailModal
        visible={detailModalVisible}
        onClose={() => setDetailModalVisible(false)}
        application={selectedApplication}
        onStatusChange={(status) => {
          if (selectedApplication) {
            handleStatusChange(selectedApplication.campaign_id, selectedApplication.influencer_id, status);
          }
        }}
        onSendMessage={() => {
          if (selectedApplication) {
            handleDirectChat(selectedApplication);
            setDetailModalVisible(false);
          }
        }}
        onViewProfile={() => {
          if (selectedApplication) {
            handleViewProfile(selectedApplication.influencer_id);
            setDetailModalVisible(false);
          }
        }}
        onViewMedia={() => {
          if (selectedApplication) {
            handleViewMediaFiles(selectedApplication);
            setDetailModalVisible(false);
          }
        }}
        onSendContract={() => {
          if (selectedApplication) {
            handleSendContract(selectedApplication);
            setDetailModalVisible(false);
          }
        }}
        onProcessPayment={() => {
          if (selectedApplication) {
            handleProcessPayment(selectedApplication);
            setDetailModalVisible(false);
          }
        }}
        updating={selectedApplication ? updatingStatus[`${selectedApplication.campaign_id}-${selectedApplication.influencer_id}`] : false}
      />

      <MediaFilesModal
        visible={mediaModalVisible}
        onClose={() => setMediaModalVisible(false)}
        application={selectedApplication}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#0f6eea',
    paddingHorizontal: 16,
    paddingBottom: 16,



    elevation: 6, // Android shadow
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF', // ✅ WHITE
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerIconBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  headerSubtitle: {
    fontSize: 14,
    color: '#E0E7FF', // ✅ LIGHT WHITE/BLUE
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)', // 🔥 GLASS EFFECT
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    color: '#FFFFFF',
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF', // ✅ WHITE TEXT
  },
  searchIcon: {
    marginRight: 8,
    color: '#FFFFFF',
  },

  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: '#0f6eea',
    color: '#FFFFFF',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 12,
    color: '#E0E7FF',
  },
  tabTextActive: {
    color: '#0f6eea',
  },
  resultsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultsText: {
    fontSize: 12,
    color: '#E0E7FF',
  },
  clearFiltersText: {
    fontSize: 12,
    color: '#E0E7FF',
    fontWeight: '500',
  },
  listContent: {
    padding: 12,
  },
  applicationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  applicationCardContent: {
    padding: 16,
  },
  applicationCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  applicationCampaignTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  applicationMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: '#666666',
  },
  budgetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  budgetText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4CAF50',
  },
  messagePreview: {
    backgroundColor: '#F8F9FA',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  messagePreviewText: {
    fontSize: 11,
    color: '#666666',
    fontStyle: 'italic',
  },
  applicationActions: {
    gap: 8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  viewButton: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 8,
  },
  viewButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 4,
  },
  viewButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  chatButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  approveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    borderRadius: 8,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#F44336',
    paddingVertical: 10,
    borderRadius: 8,
  },
  contractButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#9C27B0',
    paddingVertical: 10,
    borderRadius: 8,
  },
  paymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
  },
  profileImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  profileImageLoader: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  userInfoContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 8,
  },
  userInfoText: {
    flex: 1,
  },
  userInfoName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  userInfoEmail: {
    fontSize: 11,
    color: '#999999',
  },
  userInfoStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  userInfoFollowers: {
    fontSize: 10,
    color: '#666666',
  },
  campaignImageContainer: {
    position: 'relative',
    height: 140,
    width: '100%',
  },
  campaignImage: {
    width: '100%',
    height: '100%',
  },
  campaignImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  campaignImageTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  campaignImageLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  campaignBudgetBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(255,215,0,0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  campaignBudgetText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  filterModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  filterModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  filterModalBody: {
    padding: 16,
    maxHeight: 500,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  filterInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },
  filterInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333333',
    marginLeft: 8,
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F7FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 8,
  },
  categoryChipSelected: {
    backgroundColor: '#0f6eea',
    borderColor: '#0f6eea',
  },
  categoryChipText: {
    fontSize: 12,
    color: '#666666',
  },
  categoryChipTextSelected: {
    color: '#FFFFFF',
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusFilterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F7FA',
    borderWidth: 1,
  },
  statusFilterChipSelected: {
    backgroundColor: 'transparent',
  },
  statusFilterChipText: {
    fontSize: 12,
    color: '#666666',
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  budgetInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 8,
  },
  budgetPrefix: {
    fontSize: 12,
    color: '#666666',
    marginRight: 4,
  },
  budgetInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333333',
  },
  budgetSeparator: {
    paddingHorizontal: 4,
  },
  dateRangeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dateRangeOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  dateRangeOptionSelected: {
    backgroundColor: '#0f6eea',
    borderColor: '#0f6eea',
  },
  dateRangeText: {
    fontSize: 12,
    color: '#666666',
  },
  dateRangeTextSelected: {
    color: '#FFFFFF',
  },
  filterModalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  clearButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#0f6eea',
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f6eea',
  },
  applyButton: {
    flex: 2,
    overflow: 'hidden',
    borderRadius: 12,
  },
  applyButtonGradient: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Detail Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 20,
  },
  modalBackButton: {
    marginRight: 12,
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalHeaderRight: {
    width: 40,
  },
  modalTabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTab: {
    paddingVertical: 12,
    marginRight: 24,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  modalTabActive: {
    borderBottomColor: '#0f6eea',
  },
  modalTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  modalTabTextActive: {
    color: '#0f6eea',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modalCampaignTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 12,
  },
  modalMetaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: 16,
  },
  modalMetaItem: {
    width: '50%',
    padding: 4,
    marginBottom: 8,
  },
  modalMetaLabel: {
    fontSize: 11,
    color: '#999999',
    marginTop: 2,
  },
  modalMetaValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333333',
  },
  modalTextBox: {
    marginTop: 12,
  },
  modalTextLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 4,
  },
  modalText: {
    fontSize: 13,
    color: '#333333',
    lineHeight: 18,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickAction: {
    minWidth: 80,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
    gap: 4,
  },
  quickActionPrimary: {
    backgroundColor: '#0f6eea',
  },
  quickActionSuccess: {
    backgroundColor: '#4CAF50',
  },
  quickActionInfo: {
    backgroundColor: '#2196F3',
  },
  quickActionText: {
    fontSize: 11,
    color: '#666666',
  },
  quickActionTextLight: {
    color: '#FFFFFF',
  },
  messageBox: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
  },
  messageText: {
    fontSize: 14,
    color: '#333333',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  timelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  timelineLabel: {
    fontSize: 12,
    color: '#666666',
    width: 80,
  },
  timelineValue: {
    flex: 1,
    fontSize: 12,
    color: '#333333',
    fontWeight: '500',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
    marginTop: 12,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  profileBio: {
    width: '100%',
    marginTop: 12,
    marginBottom: 12,
  },
  profileBioLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 4,
  },
  profileBioText: {
    fontSize: 13,
    color: '#333333',
    lineHeight: 18,
  },
  profileStats: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  profileStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  profileStatValue: {
    fontSize: 12,
    color: '#666666',
  },
  viewProfileButton: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 12,
  },
  viewProfileGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  viewProfileText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  campaignDetailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  campaignDetailImage: {
    width: '100%',
    height: 200,
  },
  campaignDetailTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
    padding: 16,
    paddingBottom: 8,
  },
  campaignDetailDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  campaignDetailMeta: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 16,
  },
  campaignDetailMetaItem: {
    flex: 1,
  },
  campaignDetailMetaLabel: {
    fontSize: 11,
    color: '#999999',
    marginTop: 2,
  },
  campaignDetailMetaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginTop: 2,
  },
  campaignDetailBox: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  campaignDetailBoxLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 4,
  },
  campaignDetailBoxText: {
    fontSize: 13,
    color: '#333333',
    lineHeight: 18,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  modalFooterActions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  modalApproveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 12,
  },
  modalRejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#F44336',
    paddingVertical: 14,
    borderRadius: 12,
  },
  modalButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalCloseButton: {
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#0f6eea',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f6eea',
  },
  // Media Modal Styles
  mediaGrid: {
    gap: 12,
  },
  mediaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    flexDirection: 'row',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  mediaPreview: {
    width: 80,
    height: 80,
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  mediaPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaInfo: {
    flex: 1,
    padding: 12,
  },
  mediaFilename: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  mediaMeta: {
    fontSize: 11,
    color: '#999999',
    marginBottom: 4,
  },
  mediaDescription: {
    fontSize: 11,
    color: '#666666',
    fontStyle: 'italic',
  },
  // Media Viewer Styles
  viewerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  viewerContent: {
    flex: 1,
  },
  viewerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  viewerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  viewerBody: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewerImage: {
    width: width,
    height: width,
  },
  viewerPlaceholder: {
    alignItems: 'center',
  },
  viewerPlaceholderText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 12,
  },
  viewerFooter: {
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  viewerDownloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0f6eea',
    paddingVertical: 14,
    borderRadius: 12,
  },
  viewerDownloadText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  // Loading and Empty States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  clearFiltersButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#0f6eea',
  },
  clearFiltersButtonText: {
    fontSize: 14,
    color: '#0f6eea',
    fontWeight: '500',
  },
  errorContainer: {
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginTop: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginTop: 12,
  },
  noDataText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  // Alerts
  errorAlert: {
    position: 'absolute',
    top: 40,
    left: 16,
    right: 16,
    zIndex: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
  },
  errorAlertText: {
    flex: 1,
    fontSize: 13,
    color: '#F44336',
  },
  successAlert: {
    position: 'absolute',
    top: 40,
    left: 16,
    right: 16,
    zIndex: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
  },
  successAlertText: {
    flex: 1,
    fontSize: 13,
    color: '#4CAF50',
  },
});