// C:\Sagadevan\quickbox\mobile\app\(brand)\(tabs)\campaigns\index.tsx
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
  Switch,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Video } from 'expo-video';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import Slider from '@react-native-community/slider';
import { TabView, TabBar } from 'react-native-tab-view';
import { campaignAPI, Campaign } from '../../../../services/campaignAPI';
import profileAPI from '../../../../services/profileAPI';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../../../contexts/AuthContext';
import { useScroll } from "@/contexts/ScrollContext";
import { Animated } from "react-native";


const { width } = Dimensions.get('window');
const HEADER_HEIGHT = 180; // Total approximate height of the header section


// Types
interface CampaignForm {
  title: string;
  description: string;
  requirements: string;
  budget: string;
  category: string;
  deadline: Date | null;
  status: 'active' | 'paused' | 'completed' | 'draft';
  currency: string;
  campaignImage: any | null;
  campaignVideo: any | null;
}

interface FilterState {
  selectedCategories: string[];
  selectedStatuses: string[];
  budgetRange: [number, number];
  timelineFilter: string;
  sortBy: string;
}

interface Application {
  influencer_id: string;
  influencer_name: string;
  status: string;
  message?: string;
  applied_at: string;
  contract_signed?: boolean;
  contract_signed_at?: string;
  submitted_media?: any[];
  media_submitted_at?: string;
}

// Animation keyframes (simulated with Animated API later)
const fadeIn = (delay: number = 0) => ({
  from: { opacity: 0, transform: [{ translateY: 20 }] },
  to: { opacity: 1, transform: [{ translateY: 0 }] },
});

// Constants
const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
];

const CATEGORIES = [
  { value: 'Fashion', label: 'Fashion', icon: '👗', color: '#FF6B93' },
  { value: 'Beauty', label: 'Beauty', icon: '💄', color: '#FF9F43' },
  { value: 'Lifestyle', label: 'Lifestyle', icon: '🏡', color: '#36BDCB' },
  { value: 'Food', label: 'Food', icon: '🍔', color: '#FF9F43' },
  { value: 'Travel', label: 'Travel', icon: '✈️', color: '#6C5CE7' },
  { value: 'Fitness', label: 'Fitness', icon: '💪', color: '#00B894' },
  { value: 'Technology', label: 'Technology', icon: '📱', color: '#0984E3' },
  { value: 'Gaming', label: 'Gaming', icon: '🎮', color: '#E84393' },
  { value: 'Other', label: 'Other', icon: '🔮', color: '#636E72' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active', color: '#4CAF50' },
  { value: 'paused', label: 'Paused', color: '#FF9800' },
  { value: 'completed', label: 'Completed', color: '#2196F3' },
  { value: 'draft', label: 'Draft', color: '#9E9E9E' },
];

const TIMELINE_OPTIONS = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'year', label: 'This Year' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'budget-high', label: 'Budget: High to Low' },
  { value: 'budget-low', label: 'Budget: Low to High' },
  { value: 'applications-high', label: 'Applications: High to Low' },
  { value: 'applications-low', label: 'Applications: Low to High' },
];

const APPLICATION_TABS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'contracted', label: 'Contracted' },
  { value: 'media_submitted', label: 'Media Submitted' },
  { value: 'completed', label: 'Completed' },
];

// Helper function to get image URL
const getImageUrl = (fileId: string | null) => {
  if (!fileId) return null;
  if (fileId.startsWith('http') || fileId.startsWith('data:')) {
    return fileId;
  }
  return `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000'}/api/campaigns/image/${fileId}`;
};

// Helper function to get video URL
const getVideoUrl = (fileId: string | null) => {
  if (!fileId) return null;
  if (fileId.startsWith('http') || fileId.startsWith('data:')) {
    return fileId;
  }
  return `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000'}/api/campaigns/video/${fileId}`;
};

// Format currency
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

// Get application count badge color
const getApplicationCountColor = (count: number) => {
  if (count === 0) return '#9E9E9E';
  if (count <= 5) return '#2196F3';
  if (count <= 15) return '#0f6eea';
  if (count <= 30) return '#9C27B0';
  return '#F44336';
};

// Get status color
const getStatusColor = (status: string) => {
  const option = STATUS_OPTIONS.find(s => s.value === status);
  return option?.color || '#9E9E9E';
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
  showStats = false
}: {
  userId: string;
  profileType: 'influencer' | 'brand';
  showEmail?: boolean;
  size?: number;
  showStats?: boolean;
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
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const handleViewProfile = () => {
    router.push(`/(shared)/profile/${userId}`);
  };

  const getDisplayName = () => {
    if (!userData) return 'Loading...';

    if (profileType === 'influencer') {
      return userData.nickname || userData.full_name || 'Unknown Influencer';
    } else {
      return userData.company_name || userData.contact_person_name || 'Unknown Brand';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform?.toLowerCase()) {
      case 'instagram': return 'logo-instagram';
      case 'youtube': return 'logo-youtube';
      case 'tiktok': return 'logo-tiktok';
      case 'linkedin': return 'logo-linkedin';
      case 'twitter': return 'logo-twitter';
      default: return 'globe-outline';
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
    <TouchableOpacity style={styles.userInfoContainer} onPress={handleViewProfile}>
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
            <Ionicons
              name={getPlatformIcon(userData.primary_platform)}
              size={12}
              color="#666666"
            />
            <Text style={styles.userInfoFollowers}>
              {userData.followers?.toLocaleString()} followers
            </Text>
            {userData.engagement_rate && (
              <Text style={styles.userInfoEngagement}>
                {userData.engagement_rate}% eng.
              </Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

// Campaign Card Component
const CampaignCard = ({
  campaign,
  onPress,
  onEdit,
  onDelete,
  viewMode = 'grid'
}: {
  campaign: Campaign;
  onPress: (campaign: Campaign) => void;
  onEdit: (campaign: Campaign) => void;
  onDelete: (campaign: Campaign) => void;
  viewMode: 'grid' | 'list';
}) => {
  const appCount = campaign.applications?.length || 0;
  const statusColor = getStatusColor(campaign.status);
  const imageUrl = campaign.campaign_image_id ? getImageUrl(campaign.campaign_image_id) : null;

  if (viewMode === 'list') {
    return (
      <TouchableOpacity
        style={styles.listCard}
        onPress={() => onPress(campaign)}
        activeOpacity={0.7}
      >
        <View style={styles.listCardContent}>
          {/* Image Section */}
          <View style={styles.listImageContainer}>
            {imageUrl ? (
              <Image
                source={{ uri: imageUrl }}
                style={styles.listImage}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <View
                style={[styles.listImagePlaceholder, { backgroundColor: '#0f6eea' }]}
              >
                <Ionicons name="megaphone" size={24} color="#FFFFFF" />
              </View>
            )}

            {/* Application Badge */}
            {appCount > 0 ? (
              <View style={[styles.appBadge, { backgroundColor: getApplicationCountColor(appCount) }]}>
                <Text style={styles.appBadgeText}>{appCount}</Text>
              </View>
            ) : null}
          </View>

          {/* Content Section */}
          <View style={styles.listDetails}>
            <View style={styles.listHeader}>
              <Text style={styles.listTitle} numberOfLines={2}>
                {campaign.title}
              </Text>
              <View style={[styles.statusChip, { backgroundColor: statusColor + '20' }]}>
                <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                <Text style={[styles.statusText, { color: statusColor }]}>
                  {campaign.status}
                </Text>
              </View>
            </View>

            <Text style={styles.listDescription} numberOfLines={2}>
              {campaign.description}
            </Text>

            <View style={styles.listMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="cash-outline" size={14} color="#4CAF50" />
                <Text style={styles.metaText}>
                  {formatCurrency(campaign.budget, campaign.currency)}
                </Text>
              </View>

              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={14} color="#FF9800" />
                <Text style={styles.metaText}>
                  {new Date(campaign.deadline).toLocaleDateString()}
                </Text>
              </View>

              <View style={styles.metaItem}>
                <Ionicons name="people-outline" size={14} color="#2196F3" />
                <Text style={styles.metaText}>{appCount} apps</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="eye-outline" size={14} color="#666666" />
                <Text style={styles.statText}>{campaign.total_views || 0}</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="thumbs-up-outline" size={14} color="#666666" />
                <Text style={styles.statText}>{campaign.likes_count || 0}</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="bookmark-outline" size={14} color="#666666" />
                <Text style={styles.statText}>{campaign.bookmarked_by?.length || 0}</Text>
              </View>
            </View>

            <View style={styles.listActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onEdit(campaign)}
              >
                <Ionicons name="create-outline" size={18} color="#0f6eea" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => onDelete(campaign)}
              >
                <Ionicons name="trash-outline" size={18} color="#F44336" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Grid View Card
  return (
    <TouchableOpacity
      style={styles.gridCard}
      onPress={() => onPress(campaign)}
      activeOpacity={0.7}
    >
      {/* Image Section */}
      <View style={styles.gridImageContainer}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.gridImage}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View
            style={[styles.gridImagePlaceholder, { backgroundColor: '#0f6eea' }]}
          >
            <Ionicons name="megaphone" size={32} color="#FFFFFF" />
          </View>
        )}

        {/* Application Badge */}
        {appCount > 0 ? (
          <View style={[styles.appBadge, { backgroundColor: getApplicationCountColor(appCount) }]}>
            <Text style={styles.appBadgeText}>{appCount}</Text>
          </View>
        ) : null}

        {/* Status Chip */}
        <View style={[styles.gridStatusChip, { backgroundColor: statusColor }]}>
          <Text style={styles.gridStatusText}>{campaign.status}</Text>
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.gridContent}>
        <Text style={styles.gridTitle} numberOfLines={2}>
          {campaign.title}
        </Text>

        <Text style={styles.gridDescription} numberOfLines={2}>
          {campaign.description}
        </Text>

        <View style={styles.gridMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="cash-outline" size={14} color="#4CAF50" />
            <Text style={styles.metaText}>
              {formatCurrency(campaign.budget, campaign.currency)}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={14} color="#FF9800" />
            <Text style={styles.metaText}>
              {new Date(campaign.deadline).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.gridStats}>
          <View style={styles.statItem}>
            <Ionicons name="eye-outline" size={12} color="#666666" />
            <Text style={styles.statText}>{campaign.total_views || 0}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="thumbs-up-outline" size={12} color="#666666" />
            <Text style={styles.statText}>{campaign.likes_count || 0}</Text>
          </View>
        </View>

        <View style={styles.gridActions}>
          <TouchableOpacity
            style={styles.gridEditButton}
            onPress={() => onEdit(campaign)}
          >
            <Ionicons name="create-outline" size={16} color="#0f6eea" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.gridEditButton, styles.gridDeleteButton]}
            onPress={() => onDelete(campaign)}
          >
            <Ionicons name="trash-outline" size={16} color="#F44336" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Campaign Statistics Component
const CampaignStatistics = ({ campaign }: { campaign: Campaign }) => {
  const stats = {
    totalApplications: campaign.applications?.length || 0,
    approvedApplications: campaign.applications?.filter(app => app.status === 'approved').length || 0,
    pendingApplications: campaign.applications?.filter(app => app.status === 'pending').length || 0,
    rejectedApplications: campaign.applications?.filter(app => app.status === 'rejected').length || 0,
    completionRate: campaign.applications?.length > 0 ?
      Math.round((campaign.applications.filter(app =>
        ['completed', 'media_submitted', 'contracted'].includes(app.status)
      ).length / campaign.applications.length) * 100) : 0,
    totalViews: campaign.total_views || 0,
    uniqueViews: campaign.unique_views || 0,
    likesCount: campaign.likes_count || 0,
    bookmarksCount: campaign.bookmarked_by?.length || 0
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Text style={styles.statCardValue}>{stats.totalApplications}</Text>
        <Text style={styles.statCardLabel}>Total Apps</Text>
      </View>
      <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
        <Text style={[styles.statCardValue, { color: '#4CAF50' }]}>{stats.approvedApplications}</Text>
        <Text style={styles.statCardLabel}>Approved</Text>
      </View>
      <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
        <Text style={[styles.statCardValue, { color: '#FF9800' }]}>{stats.pendingApplications}</Text>
        <Text style={styles.statCardLabel}>Pending</Text>
      </View>
      <View style={[styles.statCard, { backgroundColor: '#FFEBEE' }]}>
        <Text style={[styles.statCardValue, { color: '#F44336' }]}>{stats.rejectedApplications}</Text>
        <Text style={styles.statCardLabel}>Rejected</Text>
      </View>
      <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
        <Text style={[styles.statCardValue, { color: '#2196F3' }]}>{stats.completionRate}%</Text>
        <Text style={styles.statCardLabel}>Completion</Text>
      </View>
      <View style={[styles.statCard, { backgroundColor: '#F3E5F5' }]}>
        <Text style={[styles.statCardValue, { color: '#9C27B0' }]}>{stats.totalViews}</Text>
        <Text style={styles.statCardLabel}>Views</Text>
      </View>
      <View style={[styles.statCard, { backgroundColor: '#E0F2F1' }]}>
        <Text style={[styles.statCardValue, { color: '#009688' }]}>{stats.likesCount}</Text>
        <Text style={styles.statCardLabel}>Likes</Text>
      </View>
    </ScrollView>
  );
};

// Application Workflow Component
const ApplicationWorkflow = ({ application }: { application: Application }) => {
  const steps = [
    {
      label: 'Submitted',
      status: 'completed',
      date: application.applied_at,
      icon: 'document-text-outline',
    },
    {
      label: 'Under Review',
      status: application.status === 'pending' ? 'active' : 'completed',
      icon: 'time-outline',
    },
    {
      label: 'Decision',
      status: ['approved', 'rejected', 'contracted', 'media_submitted', 'completed'].includes(application.status) ? 'completed' : 'pending',
      icon: application.status === 'approved' ? 'thumbs-up-outline' :
        application.status === 'rejected' ? 'thumbs-down-outline' : 'briefcase-outline',
    },
    {
      label: 'Contract',
      status: ['contracted', 'media_submitted', 'completed'].includes(application.status) ? 'completed' : 'pending',
      icon: 'document-outline',
    },
    {
      label: 'Media',
      status: ['media_submitted', 'completed'].includes(application.status) ? 'completed' : 'pending',
      icon: 'image-outline',
    },
    {
      label: 'Payment',
      status: application.status === 'completed' ? 'completed' : 'pending',
      icon: 'cash-outline',
    },
  ];

  const getStepColor = (stepStatus: string) => {
    switch (stepStatus) {
      case 'completed': return '#4CAF50';
      case 'active': return '#0f6eea';
      default: return '#CCCCCC';
    }
  };

  return (
    <View style={styles.workflowContainer}>
      <Text style={styles.sectionTitle}>Application Workflow</Text>
      {steps.map((step, index) => (
        <View key={index} style={styles.workflowStep}>
          <View style={styles.workflowStepLeft}>
            <View style={[styles.workflowIcon, { backgroundColor: getStepColor(step.status) + '20' }]}>
              <Ionicons
                name={step.icon as any}
                size={20}
                color={getStepColor(step.status)}
              />
            </View>
            {index < steps.length - 1 && (
              <View style={[styles.workflowLine, { backgroundColor: getStepColor(step.status) }]} />
            )}
          </View>
          <View style={styles.workflowStepContent}>
            <Text style={[
              styles.workflowStepLabel,
              step.status === 'active' && styles.workflowStepLabelActive
            ]}>
              {step.label}
            </Text>
            {step.date && (
              <Text style={styles.workflowStepDate}>
                {new Date(step.date).toLocaleDateString()}
              </Text>
            )}
          </View>
        </View>
      ))}
    </View>
  );
};

// Application Detail Modal
const ApplicationDetailModal = ({
  visible,
  onClose,
  application,
  campaign,
  onStatusChange
}: {
  visible: boolean;
  onClose: () => void;
  application: Application | null;
  campaign: Campaign | null;
  onStatusChange: (campaignId: string, influencerId: string, status: string) => void;
}) => {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'overview', title: 'Overview' },
    { key: 'profile', title: 'Profile' },
    { key: 'workflow', title: 'Workflow' },
    { key: 'campaign', title: 'Campaign' },
  ]);

  const influencerIdRef = useRef<string | null>(null);

  useEffect(() => {
    const fetchInfluencerData = async () => {
      if (application?.influencer_id && application.influencer_id !== influencerIdRef.current) {
        influencerIdRef.current = application.influencer_id;
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
    } else {
      influencerIdRef.current = null;
      setIndex(0);
    }
  }, [visible, application]);

  const handleStatusChange = async (status: string) => {
    if (!campaign || !application) return;

    setUpdating(true);
    try {
      await onStatusChange(campaign._id, application.influencer_id, status);
      onClose();
    } catch (error) {
      console.error('Status change error:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleSendMessage = () => {
    if (!application || !campaign) return;
    router.push(`/brand/collaborations?user=${application.influencer_id}&campaign=${campaign._id}`);
    onClose();
  };

  const handleViewProfile = () => {
    if (!application) return;
    router.push(`/(shared)/profile/${application.influencer_id}`);
    onClose();
  };

  const renderScene = ({ route }: any) => {
    switch (route.key) {
      case 'overview':
        return (
          <ScrollView style={styles.modalContent}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Application Information</Text>

              <View style={styles.applicationStatusRow}>
                <View style={[styles.statusChip, {
                  backgroundColor:
                    application.status === 'approved' ? '#4CAF5020' :
                      application.status === 'rejected' ? '#F4433620' :
                        application.status === 'pending' ? '#FF980020' : '#E0E0E0'
                }]}>
                  <Text style={[styles.statusText, {
                    color:
                      application.status === 'approved' ? '#4CAF50' :
                        application.status === 'rejected' ? '#F44336' :
                          application.status === 'pending' ? '#FF9800' : '#666666'
                  }]}>
                    {application.status === 'approved' ? 'Approved - Send Contract' :
                      application.status === 'rejected' ? 'Rejected' :
                        application.status === 'pending' ? 'Under Review' : application.status}
                  </Text>
                </View>
                <Text style={styles.applicationDate}>
                  Applied: {new Date(application.applied_at).toLocaleDateString()}
                </Text>
              </View>

              {application.message && (
                <View style={styles.messageBox}>
                  <Text style={styles.messageLabel}>MESSAGE FROM INFLUENCER</Text>
                  <Text style={styles.messageText}>"{application.message}"</Text>
                </View>
              )}

              <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Quick Actions</Text>
              <View style={styles.quickActionCard}>
                <View style={styles.quickActionsRow}>
                  <TouchableOpacity style={styles.quickActionItem} onPress={handleSendMessage}>
                    <View style={[styles.quickActionIcon, { backgroundColor: '#E3F2FD' }]}>
                      <Ionicons name="chatbubbles" size={24} color="#0f6eea" />
                    </View>
                    <Text style={styles.quickActionLabel}>Message</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.quickActionItem} onPress={handleViewProfile}>
                    <View style={[styles.quickActionIcon, { backgroundColor: '#F3E5F5' }]}>
                      <Ionicons name="person" size={24} color="#9C27B0" />
                    </View>
                    <Text style={styles.quickActionLabel}>Profile</Text>
                  </TouchableOpacity>

                  {application.status === 'pending' && (
                    <>
                      <TouchableOpacity
                        style={styles.quickActionItem}
                        onPress={() => handleStatusChange('approved')}
                        disabled={updating}
                      >
                        <View style={[styles.quickActionIcon, { backgroundColor: '#E8F5E9' }]}>
                          <Ionicons name="checkmark-done-circle" size={26} color="#4CAF50" />
                        </View>
                        <Text style={styles.quickActionLabel}>Approve</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.quickActionItem}
                        onPress={() => handleStatusChange('rejected')}
                        disabled={updating}
                      >
                        <View style={[styles.quickActionIcon, { backgroundColor: '#FFEBEE' }]}>
                          <Ionicons name="close-circle" size={26} color="#F44336" />
                        </View>
                        <Text style={styles.quickActionLabel}>Reject</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Campaign Details</Text>
              <View style={styles.campaignCard}>
                <Text style={styles.campaignTitle}>{campaign.title}</Text>
                <View style={styles.campaignMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="cash-outline" size={16} color="#4CAF50" />
                    <Text style={styles.metaText}>
                      {campaign.currency} {campaign.budget}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="pricetag-outline" size={16} color="#0f6eea" />
                    <Text style={styles.metaText}>{campaign.category}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="calendar-outline" size={16} color="#FF9800" />
                    <Text style={styles.metaText}>
                      Deadline: {new Date(campaign.deadline).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {campaign.requirements && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Campaign Requirements</Text>
                <View style={styles.requirementsBox}>
                  <Text style={styles.requirementsText}>{campaign.requirements}</Text>
                </View>
              </View>
            )}
          </ScrollView>
        );
      case 'profile':
        return (
          <ScrollView style={styles.modalContent}>
            <View style={styles.section}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#0f6eea" />
                </View>
              ) : influencerData ? (
                <View style={styles.profileContainer}>
                  <ProfileImage
                    userId={application.influencer_id}
                    profileType="influencer"
                    size={100}
                  />
                  <Text style={styles.profileName}>
                    {influencerData.nickname || influencerData.full_name}
                  </Text>
                  <Text style={styles.profileEmail}>{influencerData.email}</Text>

                  <View style={styles.ratingContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name="star"
                        size={20}
                        color={star <= 4.5 ? '#FFC107' : '#E0E0E0'}
                      />
                    ))}
                  </View>

                  <View style={styles.profileActions}>
                    <TouchableOpacity style={styles.profileActionButton} onPress={handleSendMessage}>
                      <View
                        style={[styles.profileActionGradient, { backgroundColor: '#0f6eea' }]}
                      >
                        <Ionicons name="chatbubble-outline" size={18} color="#FFFFFF" />
                        <Text style={styles.profileActionText}>Message</Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.profileOutlineButton} onPress={handleViewProfile}>
                      <Ionicons name="person-outline" size={18} color="#0f6eea" />
                      <Text style={styles.profileOutlineText}>Full Profile</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="person-outline" size={48} color="#CCCCCC" />
                  <Text style={styles.emptyStateText}>Profile Not Available</Text>
                </View>
              )}
            </View>
          </ScrollView>
        );
      case 'workflow':
        return (
          <ScrollView style={styles.modalContent}>
            <ApplicationWorkflow application={application} />
          </ScrollView>
        );
      case 'campaign':
        return (
          <ScrollView style={styles.modalContent}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Campaign Overview</Text>
              <View style={styles.campaignDetailCard}>
                <Text style={styles.campaignDetailTitle}>{campaign.title}</Text>
                <Text style={styles.campaignDetailDescription}>{campaign.description}</Text>

                <View style={styles.campaignDetailChips}>
                  <View style={styles.chip}>
                    <Text style={styles.chipText}>{campaign.category}</Text>
                  </View>
                  <View style={[styles.chip, { backgroundColor: getStatusColor(campaign.status) + '20' }]}>
                    <Text style={[styles.chipText, { color: getStatusColor(campaign.status) }]}>
                      {campaign.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.campaignDetailGrid}>
                  <View style={styles.campaignDetailItem}>
                    <Ionicons name="cash-outline" size={20} color="#4CAF50" />
                    <Text style={styles.campaignDetailLabel}>Budget</Text>
                    <Text style={styles.campaignDetailValue}>
                      {formatCurrency(campaign.budget, campaign.currency)}
                    </Text>
                  </View>
                  <View style={styles.campaignDetailItem}>
                    <Ionicons name="calendar-outline" size={20} color="#FF9800" />
                    <Text style={styles.campaignDetailLabel}>Deadline</Text>
                    <Text style={styles.campaignDetailValue}>
                      {new Date(campaign.deadline).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Campaign Requirements</Text>
              <View style={styles.requirementsBox}>
                <Text style={styles.requirementsText}>{campaign.requirements}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Application Statistics</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                  <Text style={styles.statBoxValue}>{campaign.applications?.length || 0}</Text>
                  <Text style={styles.statBoxLabel}>Total Applications</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={[styles.statBoxValue, { color: '#4CAF50' }]}>
                    {campaign.applications?.filter(app => app.status === 'approved').length || 0}
                  </Text>
                  <Text style={styles.statBoxLabel}>Approved</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        );
      default:
        return null;
    }
  };

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      indicatorStyle={styles.modalTabIndicator}
      style={styles.modalTabBar}
      labelStyle={styles.modalTabLabel}
      activeColor="#0f6eea"
      inactiveColor="#666666"
      pressColor="transparent"
      scrollEnabled={false}
    />
  );

  if (!application || !campaign) return null;

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

        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          renderTabBar={renderTabBar}
          onIndexChange={setIndex}
          initialLayout={{ width: Dimensions.get('window').width }}
        />

        <View style={styles.modalFooter}>
          <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
            <Text style={styles.modalCloseText}>Close</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

// Filter Modal Component
const FilterModal = ({
  visible,
  onClose,
  filters,
  onApply,
  maxBudget
}: {
  visible: boolean;
  onClose: () => void;
  filters: FilterState;
  onApply: (filters: FilterState) => void;
  maxBudget: number;
}) => {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleClear = () => {
    const clearedFilters = {
      selectedCategories: [],
      selectedStatuses: [],
      budgetRange: [0, maxBudget] as [number, number],
      timelineFilter: 'all',
      sortBy: 'newest',
    };
    setLocalFilters(clearedFilters);
    onApply(clearedFilters);
  };

  const toggleCategory = (category: string) => {
    setLocalFilters(prev => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(category)
        ? prev.selectedCategories.filter(c => c !== category)
        : [...prev.selectedCategories, category]
    }));
  };

  const toggleStatus = (status: string) => {
    setLocalFilters(prev => ({
      ...prev,
      selectedStatuses: prev.selectedStatuses.includes(status)
        ? prev.selectedStatuses.filter(s => s !== status)
        : [...prev.selectedStatuses, status]
    }));
  };

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
            {/* Categories */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Categories</Text>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category.value}
                    style={[
                      styles.filterChip,
                      localFilters.selectedCategories.includes(category.value) &&
                      styles.filterChipSelected,
                    ]}
                    onPress={() => toggleCategory(category.value)}
                  >
                    <Text style={styles.filterChipIcon}>{category.icon}</Text>
                    <Text style={[
                      styles.filterChipText,
                      localFilters.selectedCategories.includes(category.value) &&
                      styles.filterChipTextSelected,
                    ]}>
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Status */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Status</Text>
              <View style={styles.statusGrid}>
                {STATUS_OPTIONS.map((status) => (
                  <TouchableOpacity
                    key={status.value}
                    style={[
                      styles.filterChip,
                      localFilters.selectedStatuses.includes(status.value) &&
                      styles.filterChipSelected,
                      { borderColor: status.color }
                    ]}
                    onPress={() => toggleStatus(status.value)}
                  >
                    <View style={[styles.statusDot, { backgroundColor: status.color }]} />
                    <Text style={[
                      styles.filterChipText,
                      localFilters.selectedStatuses.includes(status.value) &&
                      styles.filterChipTextSelected,
                    ]}>
                      {status.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Timeline */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Time Period</Text>
              <View style={styles.timelineGrid}>
                {TIMELINE_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.filterChip,
                      localFilters.timelineFilter === option.value &&
                      styles.filterChipSelected,
                    ]}
                    onPress={() => setLocalFilters({ ...localFilters, timelineFilter: option.value })}
                  >
                    <Text style={[
                      styles.filterChipText,
                      localFilters.timelineFilter === option.value &&
                      styles.filterChipTextSelected,
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Sort By */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Sort By</Text>
              <View style={styles.sortGrid}>
                {SORT_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.filterChip,
                      localFilters.sortBy === option.value &&
                      styles.filterChipSelected,
                    ]}
                    onPress={() => setLocalFilters({ ...localFilters, sortBy: option.value })}
                  >
                    <Text style={[
                      styles.filterChipText,
                      localFilters.sortBy === option.value &&
                      styles.filterChipTextSelected,
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Budget Range */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>
                Budget Range: {formatCurrency(localFilters.budgetRange[0])} - {formatCurrency(localFilters.budgetRange[1])}
              </Text>
              <View style={styles.sliderContainer}>
                <Text style={styles.sliderLabel}>Min: {formatCurrency(localFilters.budgetRange[0])}</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={maxBudget}
                  value={localFilters.budgetRange[0]}
                  onValueChange={(value) => setLocalFilters({
                    ...localFilters,
                    budgetRange: [value, localFilters.budgetRange[1]]
                  })}
                  minimumTrackTintColor="#0f6eea"
                  maximumTrackTintColor="#E0E0E0"
                  thumbTintColor="#0f6eea"
                />
              </View>
              <View style={styles.sliderContainer}>
                <Text style={styles.sliderLabel}>Max: {formatCurrency(localFilters.budgetRange[1])}</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={maxBudget}
                  value={localFilters.budgetRange[1]}
                  onValueChange={(value) => setLocalFilters({
                    ...localFilters,
                    budgetRange: [localFilters.budgetRange[0], value]
                  })}
                  minimumTrackTintColor="#0f6eea"
                  maximumTrackTintColor="#E0E0E0"
                  thumbTintColor="#0f6eea"
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.filterModalFooter}>
            <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <View
                style={[styles.applyButtonGradient, { backgroundColor: '#0f6eea' }]}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Media Modal Component
const MediaModal = ({
  visible,
  onClose,
  media
}: {
  visible: boolean;
  onClose: () => void;
  media: { url: string; type: 'image' | 'video' } | null;
}) => {
  if (!media) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.mediaModalOverlay}>
        <View style={styles.mediaModalContent}>
          <View style={styles.mediaModalHeader}>
            <Text style={styles.mediaModalTitle}>
              {media.type === 'image' ? 'Campaign Image' : 'Campaign Video'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333333" />
            </TouchableOpacity>
          </View>
          <View style={styles.mediaModalBody}>
            {media.type === 'image' ? (
              <Image
                source={{ uri: media.url }}
                style={styles.mediaModalImage}
                contentFit="contain"
              />
            ) : (
              <Video
                source={{ uri: media.url }}
                style={styles.mediaModalVideo}
                useNativeControls
                resizeMode="cover"
                shouldPlay
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Delete Confirmation Dialog
const DeleteDialog = ({
  visible,
  onClose,
  onConfirm,
  campaignTitle
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  campaignTitle: string;
}) => (
  <Modal
    visible={visible}
    transparent={true}
    animationType="fade"
    onRequestClose={onClose}
  >
    <View style={styles.dialogOverlay}>
      <View style={styles.dialogContent}>
        <Ionicons name="warning" size={48} color="#FF9800" />
        <Text style={styles.dialogTitle}>Delete Campaign</Text>
        <Text style={styles.dialogMessage}>
          Are you sure you want to delete "{campaignTitle}"? This action cannot be undone.
        </Text>
        <View style={styles.dialogActions}>
          <TouchableOpacity style={styles.dialogCancelButton} onPress={onClose}>
            <Text style={styles.dialogCancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dialogDeleteButton} onPress={onConfirm}>
            <Text style={styles.dialogDeleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const editStyles = StyleSheet.create({
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  closeButton: { padding: 4 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  saveButton: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#0f6eea', borderRadius: 8 },
  saveButtonText: { color: '#fff', fontWeight: '600' },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginTop: 16, marginBottom: 8 },
  textInput: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, color: '#333' },
  pickerContainer: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, overflow: 'hidden' },
  datePickerButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, gap: 8 },
  datePickerText: { fontSize: 16, color: '#333' },
  uploadButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eef2ff', borderWidth: 1, borderColor: '#0f6eea', borderRadius: 8, padding: 12, borderStyle: 'dashed', gap: 8 },
  uploadButtonText: { color: '#0f6eea', fontWeight: '600', fontSize: 16 },
  mediaPreview: { width: '100%', height: 200, borderRadius: 8, marginTop: 12, backgroundColor: '#eee', overflow: 'hidden' },
});

const EditCampaignModal = ({
  visible,
  onClose,
  campaign,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  campaign: Campaign | null;
  onSave: (campaignId: string, data: any) => Promise<void>;
}) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    requirements: '',
    budget: '',
    category: '',
    deadline: new Date(),
    status: 'active',
    currency: 'USD',
  });
  const [image, setImage] = useState<any>(null);
  const [video, setVideo] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (campaign && visible) {
      setForm({
        title: campaign.title || '',
        description: campaign.description || '',
        requirements: campaign.requirements || '',
        budget: campaign.budget?.toString() || '',
        category: campaign.category || '',
        deadline: campaign.deadline ? new Date(campaign.deadline) : new Date(),
        status: campaign.status || 'active',
        currency: campaign.currency || 'USD',
      });
      setImage(null);
      setVideo(null);
      setImagePreview(campaign.campaign_image_id ? getImageUrl(campaign.campaign_image_id) : null);
      setVideoPreview(campaign.campaign_video_id ? getVideoUrl(campaign.campaign_video_id) : null);
    }
  }, [campaign, visible]);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0]);
      setImagePreview(result.assets[0].uri);
    }
  };

  const handlePickVideo = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'video/*',
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setVideo(result.assets[0]);
      setVideoPreview(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!campaign) return;
    try {
      setSaving(true);
      const updateData: any = {
        title: form.title,
        description: form.description,
        requirements: form.requirements,
        budget: parseFloat(form.budget) || 0,
        category: form.category,
        deadline: form.deadline.toISOString(),
        status: form.status,
        currency: form.currency,
      };
      if (image) updateData.campaign_image = image;
      if (video) updateData.campaign_video = video;

      await onSave(campaign._id, updateData);
      onClose();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to update campaign');
    } finally {
      setSaving(false);
    }
  };

  if (!campaign) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: '#F5F7FA' }}>
        <View style={editStyles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={editStyles.closeButton}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={editStyles.modalTitle}>Edit Campaign</Text>
          <TouchableOpacity onPress={handleSave} disabled={saving} style={editStyles.saveButton}>
            {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={editStyles.saveButtonText}>Save</Text>}
          </TouchableOpacity>
        </View>
        <ScrollView style={{ flex: 1, padding: 16 }} showsVerticalScrollIndicator={false}>
          <Text style={editStyles.inputLabel}>Campaign Title</Text>
          <TextInput style={editStyles.textInput} value={form.title} onChangeText={(t) => setForm({ ...form, title: t })} />

          <Text style={editStyles.inputLabel}>Description</Text>
          <TextInput style={[editStyles.textInput, { height: 80, textAlignVertical: 'top' }]} value={form.description} onChangeText={(t) => setForm({ ...form, description: t })} multiline />

          <Text style={editStyles.inputLabel}>Requirements</Text>
          <TextInput style={[editStyles.textInput, { height: 80, textAlignVertical: 'top' }]} value={form.requirements} onChangeText={(t) => setForm({ ...form, requirements: t })} multiline />

          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={editStyles.inputLabel}>Currency</Text>
              <View style={editStyles.pickerContainer}>
                <Picker selectedValue={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
                  {CURRENCIES.map(c => <Picker.Item key={c.code} label={`${c.code} (${c.symbol})`} value={c.code} />)}
                </Picker>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={editStyles.inputLabel}>Budget</Text>
              <TextInput style={editStyles.textInput} value={form.budget} onChangeText={(t) => setForm({ ...form, budget: t })} keyboardType="numeric" />
            </View>
          </View>

          <Text style={editStyles.inputLabel}>Category</Text>
          <View style={editStyles.pickerContainer}>
            <Picker selectedValue={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <Picker.Item label="Select Category" value="" />
              {CATEGORIES.map(c => <Picker.Item key={c.value} label={c.label} value={c.value} />)}
            </Picker>
          </View>

          <Text style={editStyles.inputLabel}>Status</Text>
          <View style={editStyles.pickerContainer}>
            <Picker selectedValue={form.status} onValueChange={(v) => setForm({ ...form, status: v as any })}>
              {STATUS_OPTIONS.map(s => <Picker.Item key={s.value} label={s.label} value={s.value} />)}
            </Picker>
          </View>

          <Text style={editStyles.inputLabel}>Application Deadline</Text>
          <TouchableOpacity style={editStyles.datePickerButton} onPress={() => setShowDatePicker(true)}>
            <Ionicons name="calendar-outline" size={20} color="#0f6eea" />
            <Text style={editStyles.datePickerText}>{form.deadline.toLocaleDateString()}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={form.deadline}
              mode="date"
              display="default"
              minimumDate={new Date()}
              onChange={(e, date) => {
                setShowDatePicker(false);
                if (date) setForm({ ...form, deadline: date });
              }}
            />
          )}

          <Text style={[editStyles.modalTitle, { marginTop: 24, marginBottom: 8 }]}>Campaign Media</Text>
          <Text style={editStyles.inputLabel}>Campaign Image</Text>
          <TouchableOpacity style={editStyles.uploadButton} onPress={handlePickImage}>
            <Ionicons name="image-outline" size={24} color="#0f6eea" />
            <Text style={editStyles.uploadButtonText}>Upload Image</Text>
          </TouchableOpacity>
          {imagePreview && <Image source={{ uri: imagePreview }} style={editStyles.mediaPreview} contentFit="contain" />}

          <Text style={editStyles.inputLabel}>Campaign Video</Text>
          <TouchableOpacity style={editStyles.uploadButton} onPress={handlePickVideo}>
            <Ionicons name="videocam-outline" size={24} color="#0f6eea" />
            <Text style={editStyles.uploadButtonText}>Upload Video</Text>
          </TouchableOpacity>
          {videoPreview && (
            <View style={editStyles.mediaPreview}>
              <Video source={{ uri: videoPreview }} style={{ flex: 1 }} resizeMode="cover" useNativeControls={false} />
            </View>
          )}
          <View style={{ height: 60 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// Main Component
export default function BrandCampaigns() {
  const scrollY = useScroll();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [applicationDetailVisible, setApplicationDetailVisible] = useState(false);
  const [mediaModalVisible, setMediaModalVisible] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [campaignToEdit, setCampaignToEdit] = useState<Campaign | null>(null);
  const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<Record<string, boolean>>({});
  const [applicationsTab, setApplicationsTab] = useState('all');
  const [maxBudget, setMaxBudget] = useState(10000);
  const snackbarAnim = useRef(new Animated.Value(0)).current;

  // 🛠️ Snackbar Animation & Timer Logic
  const showSnackbar = useCallback(() => {
    Animated.spring(snackbarAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 60,
      friction: 8
    }).start();
  }, [snackbarAnim]);

  const hideSnackbar = useCallback(() => {
    Animated.timing(snackbarAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setError('');
      setSuccess('');
    });
  }, [snackbarAnim]);

  useEffect(() => {
    if (error || success) {
      showSnackbar();
      const timer = setTimeout(() => {
        hideSnackbar();
      }, 5000); // 5 second auto-hide
      return () => clearTimeout(timer);
    }
  }, [error, success, showSnackbar, hideSnackbar]);

  const [filters, setFilters] = useState<FilterState>({
    selectedCategories: [],
    selectedStatuses: [],
    budgetRange: [0, 100000],
    timelineFilter: 'all',
    sortBy: 'newest',
  });

  // 🛠️ Header Animation Logic
  const clampedScrollY = Animated.diffClamp(scrollY, 0, HEADER_HEIGHT);
  const headerTranslateY = clampedScrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, -HEADER_HEIGHT],
    extrapolate: 'clamp',
  });


  // Fetch campaigns
  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await campaignAPI.getBrandCampaigns();
      const data = response.data || [];

      // Sort by newest first
      const sorted = data.sort((a: Campaign, b: Campaign) =>
        new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
      );

      setCampaigns(sorted);

      // Calculate max budget for slider
      const max = Math.max(...data.map((c: Campaign) => c.budget || 0), 10000);
      setMaxBudget(max);
      setFilters(prev => ({ ...prev, budgetRange: [0, max] }));

      setError('');
    } catch (err) {
      console.error('Failed to load campaigns:', err);
      setError('Failed to load campaigns');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCampaigns();
    }, [])
  );

  // Apply filters and search
  useEffect(() => {
    let filtered = [...campaigns];

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (filters.selectedCategories.length > 0) {
      filtered = filtered.filter(c => filters.selectedCategories.includes(c.category));
    }

    // Apply status filter
    if (filters.selectedStatuses.length > 0) {
      filtered = filtered.filter(c => filters.selectedStatuses.includes(c.status));
    }

    // Apply budget range
    filtered = filtered.filter(c =>
      c.budget >= filters.budgetRange[0] && c.budget <= filters.budgetRange[1]
    );

    // Apply timeline filter
    if (filters.timelineFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(c => {
        const campaignDate = new Date(c.created_at || '');
        switch (filters.timelineFilter) {
          case 'today':
            return campaignDate.toDateString() === now.toDateString();
          case 'week':
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            startOfWeek.setHours(0, 0, 0, 0);
            return campaignDate >= startOfWeek;
          case 'month':
            return campaignDate.getMonth() === now.getMonth() &&
              campaignDate.getFullYear() === now.getFullYear();
          case 'quarter':
            const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
            const campaignQuarter = Math.floor(campaignDate.getMonth() / 3) + 1;
            return campaignQuarter === currentQuarter &&
              campaignDate.getFullYear() === now.getFullYear();
          case 'year':
            return campaignDate.getFullYear() === now.getFullYear();
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest':
          return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
        case 'oldest':
          return new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime();
        case 'budget-high':
          return (b.budget || 0) - (a.budget || 0);
        case 'budget-low':
          return (a.budget || 0) - (b.budget || 0);
        case 'applications-high':
          return (b.applications?.length || 0) - (a.applications?.length || 0);
        case 'applications-low':
          return (a.applications?.length || 0) - (b.applications?.length || 0);
        default:
          return 0;
      }
    });

    setFilteredCampaigns(filtered);
  }, [campaigns, searchQuery, filters]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCampaigns();
  }, []);

  const handleCreateCampaign = () => {
    router.push('/(brand)/(tabs)/campaigns/create');
  };

  const handleViewCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
  };

  const handleBackToList = () => {
    setSelectedCampaign(null);
    setApplicationsTab('all');
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setCampaignToEdit(campaign);
    setEditModalVisible(true);
  };

  const handleSaveCampaign = async (campaignId: string, updateData: any) => {
    try {
      await campaignAPI.updateCampaign(campaignId, updateData);
      setSuccess('Campaign updated successfully!');
      fetchCampaigns();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to update campaign');
      throw err;
    }
  };

  const handleDeleteCampaign = (campaign: Campaign) => {
    setCampaignToDelete(campaign);
    setDeleteDialogVisible(true);
  };

  const confirmDelete = async () => {
    if (!campaignToDelete) return;

    try {
      await campaignAPI.deleteBrandCampaign(campaignToDelete._id);
      setSuccess('Campaign deleted successfully');
      fetchCampaigns();
    } catch (error) {
      console.error('Delete error:', error);
      setError('Failed to delete campaign');
    } finally {
      setDeleteDialogVisible(false);
      setCampaignToDelete(null);
    }
  };

  const handleStatusChange = async (campaignId: string, influencerId: string, newStatus: string) => {
    const key = `${campaignId}-${influencerId}`;
    setUpdatingStatus(prev => ({ ...prev, [key]: true }));

    try {
      await campaignAPI.updateApplicationStatus(campaignId, influencerId, { status: newStatus });
      setSuccess(`Application ${newStatus} successfully!`);
      fetchCampaigns();
    } catch (err) {
      setError('Failed to update application status');
      console.error('Status update error:', err);
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleViewApplicationDetails = (application: Application) => {
    setSelectedApplication(application);
    setApplicationDetailVisible(true);
  };

  const openMediaModal = (url: string, type: 'image' | 'video') => {
    setSelectedMedia({ url, type });
    setMediaModalVisible(true);
  };

  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const activeFiltersCount = [
    filters.selectedCategories.length,
    filters.selectedStatuses.length,
    filters.timelineFilter !== 'all' ? 1 : 0,
    filters.sortBy !== 'newest' ? 1 : 0,
    filters.budgetRange[0] > 0 || filters.budgetRange[1] < maxBudget ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  // Filter applications based on selected tab
  const filteredApplications = selectedCampaign?.applications?.filter(app => {
    if (applicationsTab === 'all') return true;
    return app.status === applicationsTab;
  }) || [];

  // Render Campaign Detail View
  const renderCampaignDetail = () => {
    if (!selectedCampaign) return null;

    return (
      <View style={styles.detailContainer}>
        <Animated.View style={[
          styles.detailHeader,
          {
            paddingTop: insets.top,
            transform: [{ translateY: headerTranslateY }],
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
          }
        ]}>
          <TouchableOpacity onPress={handleBackToList} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#0f6eea" />
          </TouchableOpacity>
          <Text style={styles.detailTitle} numberOfLines={1}>
            {selectedCampaign.title}
          </Text>
          <View style={styles.detailHeaderRight}>
            <View style={[styles.statusChip, { backgroundColor: getStatusColor(selectedCampaign.status) + '20' }]}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(selectedCampaign.status) }]} />
              <Text style={[styles.statusText, { color: getStatusColor(selectedCampaign.status) }]}>
                {selectedCampaign.status}
              </Text>
            </View>
          </View>
        </Animated.View>


        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingBottom: 100, paddingTop: HEADER_HEIGHT + 20 }} // Space for sticky header
        >

          {/* Campaign Statistics */}
          <CampaignStatistics campaign={selectedCampaign} />

          {/* Campaign Media */}
          {(selectedCampaign.campaign_image_id || selectedCampaign.campaign_video_id) && (
            <View style={styles.mediaSection}>
              <Text style={styles.sectionTitle}>Campaign Media</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {selectedCampaign.campaign_image_id ? (
                  <TouchableOpacity
                    style={styles.mediaThumb}
                    onPress={() => openMediaModal(getImageUrl(selectedCampaign.campaign_image_id)!, 'image')}
                  >
                    <Image
                      source={{ uri: getImageUrl(selectedCampaign.campaign_image_id)! }}
                      style={styles.mediaThumbImage}
                      contentFit="cover"
                    />
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.5)']}
                      style={styles.mediaThumbOverlay}
                    >
                      <Ionicons name="image-outline" size={24} color="#FFFFFF" />
                    </LinearGradient>
                  </TouchableOpacity>
                ) : null}
                {selectedCampaign.campaign_video_id ? (
                  <TouchableOpacity
                    style={styles.mediaThumb}
                    onPress={() => openMediaModal(getVideoUrl(selectedCampaign.campaign_video_id)!, 'video')}
                  >
                    <View style={styles.mediaThumbVideo}>
                      <Ionicons name="play-circle" size={40} color="#FFFFFF" />
                    </View>
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.5)']}
                      style={styles.mediaThumbOverlay}
                    >
                      <Ionicons name="videocam-outline" size={24} color="#FFFFFF" />
                    </LinearGradient>
                  </TouchableOpacity>
                ) : null}
              </ScrollView>
            </View>
          )}

          {/* Campaign Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Campaign Details</Text>
            <Text style={styles.campaignDescription}>{selectedCampaign.description}</Text>

            <View style={styles.campaignInfoGrid}>
              <View style={styles.campaignInfoItem}>
                <Ionicons name="cash-outline" size={20} color="#4CAF50" />
                <Text style={styles.campaignInfoLabel}>Budget</Text>
                <Text style={styles.campaignInfoValue}>
                  {formatCurrency(selectedCampaign.budget, selectedCampaign.currency)}
                </Text>
              </View>
              <View style={styles.campaignInfoItem}>
                <Ionicons name="calendar-outline" size={20} color="#FF9800" />
                <Text style={styles.campaignInfoLabel}>Deadline</Text>
                <Text style={styles.campaignInfoValue}>
                  {new Date(selectedCampaign.deadline).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.campaignInfoItem}>
                <Ionicons name="pricetag-outline" size={20} color="#0f6eea" />
                <Text style={styles.campaignInfoLabel}>Category</Text>
                <Text style={styles.campaignInfoValue}>{selectedCampaign.category}</Text>
              </View>
              <View style={styles.campaignInfoItem}>
                <Ionicons name="people-outline" size={20} color="#9C27B0" />
                <Text style={styles.campaignInfoLabel}>Applications</Text>
                <Text style={styles.campaignInfoValue}>{selectedCampaign.applications?.length || 0}</Text>
              </View>
            </View>

            {selectedCampaign.requirements ? (
              <View style={styles.requirementsContainer}>
                <Text style={styles.requirementsTitle}>Requirements:</Text>
                <Text style={styles.requirementsText}>{selectedCampaign.requirements || ""}</Text>
              </View>
            ) : null}
          </View>

          {/* Applications Section */}
          <View style={styles.section}>
            <View style={styles.applicationsHeader}>
              <Text style={styles.sectionTitle}>
                Applications ({selectedCampaign.applications?.length || 0})
              </Text>
              <TouchableOpacity onPress={fetchCampaigns}>
                <Ionicons name="refresh" size={20} color="#0f6eea" />
              </TouchableOpacity>
            </View>

            {/* Application Tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
              {APPLICATION_TABS.map((tab) => {
                const count = selectedCampaign.applications?.filter(app =>
                  tab.value === 'all' ? true : app.status === tab.value
                ).length || 0;

                return (
                  <TouchableOpacity
                    key={tab.value}
                    style={[
                      styles.tab,
                      applicationsTab === tab.value && styles.tabActive
                    ]}
                    onPress={() => setApplicationsTab(tab.value)}
                  >
                    <Text style={[
                      styles.tabText,
                      applicationsTab === tab.value && styles.tabTextActive
                    ]}>
                      {tab.label} ({count})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Applications List */}
            {filteredApplications.length > 0 ? (
              filteredApplications.map((app, index) => (
                <View key={index} style={styles.applicationCard}>
                  <View style={styles.applicationHeader}>
                    <UserInfo
                      userId={app.influencer_id}
                      profileType="influencer"
                      showEmail={false}
                      size={40}
                      showStats
                    />
                    <View style={styles.applicationStatusBadge}>
                      <View style={[styles.statusChip, {
                        backgroundColor:
                          app.status === 'approved' ? '#4CAF5020' :
                            app.status === 'rejected' ? '#F4433620' :
                              app.status === 'pending' ? '#FF980020' : '#E0E0E0'
                      }]}>
                        <Text style={[styles.statusText, {
                          color:
                            app.status === 'approved' ? '#4CAF50' :
                              app.status === 'rejected' ? '#F44336' :
                                app.status === 'pending' ? '#FF9800' : '#666666'
                        }]}>
                          {app.status}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <Text style={styles.applicationDate}>
                    Applied: {new Date(app.applied_at).toLocaleDateString()}
                  </Text>

                  {app.message ? (
                    <Text style={styles.applicationMessage} numberOfLines={2}>
                      "{app.message}"
                    </Text>
                  ) : null}

                  <View style={styles.applicationActions}>
                    {app.status === 'pending' && (
                      <>
                        <TouchableOpacity
                          style={styles.approveButton}
                          onPress={() => handleStatusChange(selectedCampaign._id, app.influencer_id, 'approved')}
                          disabled={updatingStatus[`${selectedCampaign._id}-${app.influencer_id}`]}
                        >
                          <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />
                          <Text style={styles.buttonText}>Approve</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.rejectButton}
                          onPress={() => handleStatusChange(selectedCampaign._id, app.influencer_id, 'rejected')}
                          disabled={updatingStatus[`${selectedCampaign._id}-${app.influencer_id}`]}
                        >
                          <Ionicons name="close-circle-outline" size={18} color="#FFFFFF" />
                          <Text style={styles.buttonText}>Reject</Text>
                        </TouchableOpacity>
                      </>
                    )}

                    <TouchableOpacity
                      style={styles.viewButton}
                      onPress={() => handleViewApplicationDetails(app)}
                    >
                      <Ionicons name="eye-outline" size={18} color="#0f6eea" />
                      <Text style={styles.viewButtonText}>View</Text>
                    </TouchableOpacity>

                    {app.status === 'approved' && (
                      <TouchableOpacity
                        style={styles.contractButton}
                        onPress={() => {
                          // Navigate to send contract
                          router.push('/(brand)/(tabs)/account/agreements');
                        }}
                      >
                        <Ionicons name="document-text-outline" size={18} color="#FFFFFF" />
                        <Text style={styles.buttonText}>Contract</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyApplications}>
                <Ionicons name="people-outline" size={48} color="#CCCCCC" />
                <Text style={styles.emptyApplicationsText}>
                  No {applicationsTab !== 'all' ? applicationsTab : ''} applications
                </Text>
              </View>
            )}
          </View>
        </Animated.ScrollView>
      </View>
    );
  };

  // Render Campaign List View
  const renderCampaignList = () => (
    <View style={styles.listContainer}>
      {/* Header - Animated Sticky */}
      <Animated.View style={[
        styles.header,
        {
          paddingTop: insets.top,
          transform: [{ translateY: headerTranslateY }],
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
        }
      ]}>
        <View style={styles.headerTop}>
          {/* 🔵 LEFT: TITLE + COUNT */}
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Our Campaigns</Text>

            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>
                {filteredCampaigns.length}
              </Text>
            </View>
          </View>

          {/* ⚙️ RIGHT: ACTIONS */}
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.viewModeButton}
              onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              <Ionicons
                name={viewMode === 'grid' ? 'list' : 'grid'}
                size={20}
                color="#fff" // ✅ white for contrast
              />
            </TouchableOpacity>
          </View>
        </View>


        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#999999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search campaigns..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999999"
            />
            {searchQuery ? (
              <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
                <Ionicons name="close-circle" size={18} color="#999999" />
              </TouchableOpacity>
            ) : null}
          </View>

          <TouchableOpacity
            style={[styles.filterButton, activeFiltersCount > 0 && styles.filterButtonActive]}
            onPress={() => setFilterModalVisible(true)}
          >
            <Ionicons
              name="options-outline"
              size={20}
              color={activeFiltersCount > 0 ? '#FFFFFF' : '#0f6eea'}
            />
            {activeFiltersCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Results Info */}
        <View style={styles.resultsInfo}>
          <View style={styles.resultsTextWrapper}>
            <Ionicons name="funnel-outline" size={14} color="rgba(255,255,255,0.7)" />
            <Text style={styles.resultsText}>
              Showing {filteredCampaigns.length} <Text style={{ color: 'rgba(255,255,255,0.6)' }}>of</Text> {campaigns.length} campaigns
            </Text>
          </View>

          {activeFiltersCount > 0 && (
            <TouchableOpacity
              style={styles.clearFiltersButton}
              onPress={() => setFilters({
                selectedCategories: [],
                selectedStatuses: [],
                budgetRange: [0, maxBudget],
                timelineFilter: 'all',
                sortBy: 'newest',
              })}
            >
              <Text style={styles.clearFiltersText}>Reset Filters</Text>
              <Ionicons name="refresh-circle" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0f6eea" />
        </View>
      ) : campaigns.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="megaphone-outline" size={64} color="#CCCCCC" />
          <Text style={styles.emptyStateTitle}>No campaigns yet</Text>
          <Text style={styles.emptyStateSubtitle}>
            Create your first campaign to start collaborating with influencers
          </Text>
          <TouchableOpacity style={styles.emptyStateButton} onPress={handleCreateCampaign}>
            <View
              style={[styles.emptyStateButtonGradient, { backgroundColor: '#0f6eea' }]}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.emptyStateButtonText}>Create Campaign</Text>
            </View>
          </TouchableOpacity>
        </View>
      ) : filteredCampaigns.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={64} color="#CCCCCC" />
          <Text style={styles.emptyStateTitle}>No matches found</Text>
          <Text style={styles.emptyStateSubtitle}>
            Try adjusting your search or filters
          </Text>
        </View>
      ) : (
        <Animated.FlatList
          data={filteredCampaigns}
          key={viewMode}
          keyExtractor={(item) => item._id}
          numColumns={viewMode === 'grid' ? 2 : 1}
          renderItem={({ item }) => (
            <CampaignCard
              campaign={item}
              onPress={handleViewCampaign}
              onEdit={handleEditCampaign}
              onDelete={handleDeleteCampaign}
              viewMode={viewMode}
            />
          )}
          contentContainerStyle={[
            styles.listContent,
            viewMode === 'grid' && styles.gridListContent,
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
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {selectedCampaign ? renderCampaignDetail() : renderCampaignList()}

      {/* Modals */}
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        filters={filters}
        onApply={handleApplyFilters}
        maxBudget={maxBudget}
      />

      <ApplicationDetailModal
        visible={applicationDetailVisible}
        onClose={() => setApplicationDetailVisible(false)}
        application={selectedApplication}
        campaign={selectedCampaign}
        onStatusChange={handleStatusChange}
      />

      <MediaModal
        visible={mediaModalVisible}
        onClose={() => setMediaModalVisible(false)}
        media={selectedMedia}
      />

      <DeleteDialog
        visible={deleteDialogVisible}
        onClose={() => setDeleteDialogVisible(false)}
        onConfirm={confirmDelete}
        campaignTitle={campaignToDelete?.title || ''}
      />

      <EditCampaignModal
        visible={editModalVisible}
        onClose={() => {
          setEditModalVisible(false);
          setCampaignToEdit(null);
        }}
        campaign={campaignToEdit}
        onSave={handleSaveCampaign}
      />

      {/* Success/Error Snackbar */}
      {(!!error || !!success) && (
        <Animated.View
          style={[
            styles.snackbar,
            error ? styles.errorSnackbar : styles.successSnackbar,
            {
              opacity: snackbarAnim,
              transform: [{
                translateY: snackbarAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0]
                })
              }],
              top: insets.top + (Platform.OS === 'ios' ? 10 : 20),
            }
          ]}
        >
          <View style={styles.snackbarContent}>
            <Ionicons
              name={error ? "alert-circle" : "checkmark-circle"}
              size={22}
              color="#FFFFFF"
            />
            <Text style={styles.snackbarText} numberOfLines={2}>
              {error || success}
            </Text>
          </View>
          <TouchableOpacity onPress={hideSnackbar} style={styles.snackbarAction}>
            <Ionicons name="close" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  // Header Styles
  header: {
    backgroundColor: "#0f6eea", // 🔵 main blue
  },

  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },

  headerBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  headerBadgeText: {
    color: "#fff",
    fontWeight: "600",
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },

  viewModeButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 10,
    borderRadius: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
  },
  clearButton: {
    padding: 4,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: '#0f6eea',
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
  resultsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginTop: 12,
  },
  resultsTextWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resultsText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  clearFiltersText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  // Swipeable Tab Styles
  modalTabBar: {
    backgroundColor: '#FFFFFF',
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTabIndicator: {
    backgroundColor: '#0f6eea',
    height: 3,
    borderRadius: 3,
  },
  modalTabLabel: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'none',
  },
  // Quick Actions Styles
  quickActionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  quickActionItem: {
    alignItems: 'center',
    gap: 8,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333333',
  },
  listContent: {
    padding: 12,
  },
  gridListContent: {
    padding: 8,
  },
  // Grid Card Styles
  gridCard: {
    flex: 1,
    margin: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    maxWidth: (width - 32) / 2,
  },
  gridImageContainer: {
    position: 'relative',
    height: 120,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridStatusChip: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  gridStatusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  appBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  appBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  gridContent: {
    padding: 12,
  },
  gridTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  gridDescription: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 8,
  },
  gridMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  metaText: {
    fontSize: 11,
    color: '#666666',
  },
  gridStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  statText: {
    fontSize: 10,
    color: '#666666',
  },
  gridActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 4,
  },
  gridEditButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridDeleteButton: {
    backgroundColor: '#FFEBEE',
  },
  // List Card Styles
  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  listCardContent: {
    flexDirection: 'row',
    padding: 12,
  },
  listImageContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
  },
  listImage: {
    width: '100%',
    height: '100%',
  },
  listImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listDetails: {
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  listTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginRight: 8,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
  listDescription: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 8,
  },
  listMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  listActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
  },
  // Detail View Styles
  detailContainer: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    marginRight: 12,
  },
  detailTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
  },
  detailHeaderRight: {
    marginLeft: 12,
  },
  statsContainer: {
    padding: 16,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginRight: 8,
    minWidth: 100,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statCardValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f6eea',
    marginBottom: 4,
  },
  statCardLabel: {
    fontSize: 11,
    color: '#666666',
  },
  mediaSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  mediaThumb: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginRight: 8,
    overflow: 'hidden',
  },
  mediaThumbImage: {
    width: '100%',
    height: '100%',
  },
  mediaThumbVideo: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaThumbOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  campaignDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 16,
  },
  campaignInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  campaignInfoItem: {
    width: '50%',
    padding: 4,
    marginBottom: 8,
  },
  campaignInfoLabel: {
    fontSize: 11,
    color: '#999999',
    marginTop: 2,
  },
  campaignInfoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333333',
  },
  requirementsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  requirementsText: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
  },
  applicationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#F5F7FA',
  },
  tabActive: {
    backgroundColor: '#0f6eea',
  },
  tabText: {
    fontSize: 12,
    color: '#666666',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  applicationCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  applicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  applicationStatusBadge: {
    flexShrink: 0,
  },
  applicationDate: {
    fontSize: 11,
    color: '#999999',
    marginBottom: 8,
  },
  applicationMessage: {
    fontSize: 12,
    color: '#666666',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  applicationActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  approveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#F44336',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  contractButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#9C27B0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0f6eea',
  },
  viewButtonText: {
    fontSize: 12,
    color: '#0f6eea',
    fontWeight: '500',
  },
  buttonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  emptyApplications: {
    alignItems: 'center',
    padding: 24,
  },
  emptyApplicationsText: {
    fontSize: 14,
    color: '#999999',
    marginTop: 8,
  },
  // Profile Components
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  userInfoText: {
    flex: 1,
    justifyContent: 'center',
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
  userInfoEngagement: {
    fontSize: 10,
    color: '#4CAF50',
    fontWeight: '500',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  modalCloseButton: {
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#0f6eea',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Filter Modal Styles
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
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F7FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterChipSelected: {
    backgroundColor: '#0f6eea',
    borderColor: '#0f6eea',
  },
  filterChipIcon: {
    marginRight: 4,
    fontSize: 14,
  },
  filterChipText: {
    fontSize: 12,
    color: '#666666',
  },
  filterChipTextSelected: {
    color: '#FFFFFF',
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timelineGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sortGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sliderContainer: {
    marginBottom: 12,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  slider: {
    width: '100%',
    height: 40,
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
  // Workflow Styles
  workflowContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  workflowStep: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  workflowStepLeft: {
    alignItems: 'center',
    marginRight: 12,
  },
  workflowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  workflowLine: {
    width: 2,
    height: 30,
    marginTop: 4,
  },
  workflowStepContent: {
    flex: 1,
    paddingBottom: 12,
  },
  workflowStepLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 2,
  },
  workflowStepLabelActive: {
    fontWeight: '700',
    color: '#0f6eea',
  },
  workflowStepDate: {
    fontSize: 11,
    color: '#999999',
  },
  // Profile Section Styles
  profileContainer: {
    alignItems: 'center',
    padding: 20,
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
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  profileActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  profileActionButton: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 12,
  },
  profileActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  profileActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  profileOutlineButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#0f6eea',
    gap: 8,
  },
  profileOutlineText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f6eea',
  },
  // Campaign Card Styles
  campaignCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
  },
  campaignTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  campaignMeta: {
    gap: 8,
  },
  messageBox: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  messageLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#999999',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 13,
    color: '#333333',
    fontStyle: 'italic',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  actionOutlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0f6eea',
  },
  actionOutlineButtonText: {
    fontSize: 12,
    color: '#0f6eea',
    fontWeight: '500',
  },
  actionSuccessButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
  },
  actionErrorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F44336',
  },
  applicationStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  applicationDate: {
    fontSize: 12,
    color: '#999999',
  },
  campaignDetailCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  campaignDetailTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 8,
  },
  campaignDetailDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 12,
  },
  campaignDetailChips: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: '#F0F7FF',
  },
  chipText: {
    fontSize: 12,
    color: '#0f6eea',
    fontWeight: '500',
  },
  campaignDetailGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  campaignDetailItem: {
    flex: 1,
    alignItems: 'center',
  },
  campaignDetailLabel: {
    fontSize: 11,
    color: '#999999',
    marginTop: 2,
  },
  campaignDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statBoxValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f6eea',
    marginBottom: 4,
  },
  statBoxLabel: {
    fontSize: 12,
    color: '#666666',
  },
  // Media Modal Styles
  mediaModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
  },
  mediaModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    margin: 20,
    overflow: 'hidden',
  },
  mediaModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  mediaModalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  mediaModalBody: {
    padding: 16,
    minHeight: 300,
  },
  mediaModalImage: {
    width: '100%',
    height: 300,
  },
  mediaModalVideo: {
    width: '100%',
    height: 300,
  },
  // Dialog Styles
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '80%',
    alignItems: 'center',
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    marginTop: 12,
    marginBottom: 8,
  },
  dialogMessage: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
  },
  dialogActions: {
    flexDirection: 'row',
    gap: 12,
  },
  dialogCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  dialogCancelText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  dialogDeleteButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F44336',
    alignItems: 'center',
  },
  dialogDeleteText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
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
  emptyStateButton: {
    overflow: 'hidden',
    borderRadius: 12,
  },
  emptyStateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    gap: 8,
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Snackbar
  snackbar: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 99999,
  },
  errorSnackbar: {
    backgroundColor: '#F44336',
  },
  successSnackbar: {
    backgroundColor: '#4CAF50',
  },
  snackbarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  snackbarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  snackbarAction: {
    marginLeft: 12,
    padding: 2,
  },
  listContainer: {
    flex: 1,
  },
});