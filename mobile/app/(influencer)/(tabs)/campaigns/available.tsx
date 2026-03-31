// C:\Sagadevan\quickbox\mobile\app\(influencer)\(tabs)\campaigns\available.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  Platform,
  Dimensions,
  StatusBar,
  SafeAreaView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Linking,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Animated } from "react-native";
import { useScroll } from "@/contexts/ScrollContext";

// Import services
import { campaignAPI, ApplicationResponse, PopularCampaign } from '../../../../services/campaignAPI';
import profileAPI from '../../../../services/profileAPI';
import { accountAPI } from '../../../../services/accountAPI';

// Types
type RootStackParamList = {
  CampaignDetails: { campaignId: string; campaign: any };
  BrandProfile: { brandId: string; brandName: string };
  Messages: { conversationId?: string; brandId?: string; campaignId?: string };
  Applications: undefined;
  Contracts: undefined;
  AddBankAccount: { onSuccess?: () => void };
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width - 32;


const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

// Helper function to format currency
const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  const symbols: Record<string, string> = {
    USD: '$', EUR: '€', GBP: '£', JPY: '¥', CAD: 'C$', AUD: 'A$', INR: '₹',
  };
  const symbol = symbols[currency] || '$';
  return `${symbol}${amount?.toFixed(2) || '0.00'}`;
};

// Helper function to format date
const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return 'Invalid date';
  }
};

// Helper function to format view count
const formatViews = (views: number): string => {
  if (!views || views === 0) return '0';
  if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M';
  if (views >= 1000) return (views / 1000).toFixed(1) + 'K';
  return views.toString();
};

// Campaign Card Component
const CampaignCard = ({ campaign, onPress, onLike, onBookmark, onViewBrand, isLiked, isBookmarked }: {
  campaign: any;
  onPress: () => void;
  onLike: () => void;
  onBookmark: () => void;
  onViewBrand: () => void;
  isLiked: boolean;
  isBookmarked: boolean;
}) => {
  const [imageError, setImageError] = useState(false);
  const currency = campaign.currency || 'USD';

  const getImageUrl = () => {
    if (!campaign.campaign_image_id) return null;
    if (campaign.campaign_image_id.startsWith('http')) return campaign.campaign_image_id;
    return `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000'}/api/campaigns/image/${campaign.campaign_image_id}`;
  };

  const imageUrl = getImageUrl();

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.card}>
      {/* Campaign Image */}
      <View style={styles.imageContainer}>
        {imageUrl && !imageError ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.campaignImage}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: 'rgb(15, 110, 234)' }]}>
            <Ionicons name="megaphone-outline" size={48} color="rgba(255,255,255,0.8)" />
          </View>
        )}
        
        {/* Status Badge */}
        <View style={[styles.statusBadge, getStatusStyle(campaign.status)]}>
          <Text style={styles.statusText}>{campaign.status?.toUpperCase() || 'ACTIVE'}</Text>
        </View>
        
        {/* Action Buttons Overlay */}
        <View style={styles.actionOverlay}>
          <TouchableOpacity
            style={[styles.actionButton, isBookmarked && styles.actionButtonActive]}
            onPress={onBookmark}
          >
            <Ionicons
              name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={isBookmarked ? '#4CAF50' : '#FFF'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, isLiked && styles.actionButtonActive]}
            onPress={onLike}
          >
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={20}
              color={isLiked ? '#FF6B6B' : '#FFF'}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {campaign.title}
        </Text>
        
        {/* Brand Info */}
        <TouchableOpacity style={styles.brandInfo} onPress={onViewBrand}>
          <View style={styles.brandAvatar}>
            <Text style={styles.brandInitial}>
              {(campaign.brand_name || campaign.brand?.name || 'B').charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.brandName} numberOfLines={1}>
            {campaign.brand_name || campaign.brand?.name || 'Unknown Brand'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.description} numberOfLines={2}>
          {campaign.description}
        </Text>

        <View style={styles.divider} />

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="cash-outline" size={16} color="#666" />
            <Text style={styles.statText}>
              {formatCurrency(campaign.budget, currency)}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="pricetag-outline" size={16} color="#666" />
            <Text style={styles.statText}>{campaign.category || 'General'}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.statText}>{formatDate(campaign.deadline)}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="eye-outline" size={16} color="#666" />
            <Text style={styles.statText}>{formatViews(campaign.total_views || campaign.views || 0)} views</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="heart-outline" size={16} color={campaign.likes_count > 0 ? '#FF6B6B' : '#666'} />
            <Text style={[styles.statText, campaign.likes_count > 0 && styles.likedText]}>
              {campaign.likes_count || 0} likes
            </Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="people-outline" size={16} color="#666" />
            <Text style={styles.statText}>{campaign.applications?.length || 0} applied</Text>
          </View>
        </View>

        {/* Apply Button */}
        <TouchableOpacity style={styles.applyButton} onPress={onPress}>
          <View style={[styles.applyGradient, { backgroundColor: 'rgb(15, 110, 234)' }]}>
            <Text style={styles.applyButtonText}>Apply Now</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFF" />
          </View>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const getStatusStyle = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'active': return styles.statusActive;
    case 'paused': return styles.statusPaused;
    case 'completed': return styles.statusCompleted;
    default: return styles.statusActive;
  }
};

// Campaign Details Modal Component
const CampaignDetailsModal = ({ visible, campaign, onClose, onApply, onViewBrand }: {
  visible: boolean;
  campaign: any;
  onClose: () => void;
  onApply: () => void;
  onViewBrand: () => void;
}) => {
  const [brandProfile, setBrandProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && campaign) {
      fetchBrandProfile();
    }
  }, [visible, campaign]);

  const fetchBrandProfile = async () => {
    if (!campaign?.brand_id) return;
    setLoading(true);
    try {
      const response = await profileAPI.getProfileById(campaign.brand_id);
      setBrandProfile(response.profile || response);
    } catch (error) {
      console.error('Error fetching brand profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateLong = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return 'Invalid date';
    }
  };

  if (!campaign) return null;

  const currency = campaign.currency || 'USD';
  const views = campaign.total_views || campaign.views || 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Campaign Details</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Campaign Image */}
            {campaign.campaign_image_id && (
              <Image
                source={{ uri: `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000'}/api/campaigns/image/${campaign.campaign_image_id}` }}
                style={styles.modalImage}
                resizeMode="cover"
              />
            )}

            <View style={styles.modalBody}>
              {/* Title and Status */}
              <View style={styles.modalTitleRow}>
                <Text style={styles.modalCampaignTitle}>{campaign.title}</Text>
                <View style={[styles.statusBadgeSmall, getStatusStyle(campaign.status)]}>
                  <Text style={styles.statusTextSmall}>{campaign.status?.toUpperCase() || 'ACTIVE'}</Text>
                </View>
              </View>

              {/* Brand Info */}
              <TouchableOpacity style={styles.modalBrandSection} onPress={onViewBrand}>
                <View style={styles.modalBrandAvatar}>
                  <Text style={styles.modalBrandInitial}>
                    {(campaign.brand_name || campaign.brand?.name || 'B').charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.modalBrandInfo}>
                  <Text style={styles.modalBrandName}>
                    {campaign.brand_name || campaign.brand?.name || 'Unknown Brand'}
                  </Text>
                  {brandProfile?.rating > 0 && (
                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={14} color="#FFD700" />
                      <Text style={styles.ratingText}>{brandProfile.rating.toFixed(1)}</Text>
                    </View>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>

              {/* Description */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Description</Text>
                <Text style={styles.modalSectionText}>{campaign.description}</Text>
              </View>

              {/* Requirements */}
              {campaign.requirements && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Requirements</Text>
                  <Text style={styles.modalSectionText}>{campaign.requirements}</Text>
                </View>
              )}

              {/* Details Grid */}
              <View style={styles.detailsGrid}>
                <View style={styles.detailCard}>
                  <Ionicons name="cash-outline" size={24} color="#667eea" />
                  <Text style={styles.detailLabel}>Budget</Text>
                  <Text style={styles.detailValue}>{formatCurrency(campaign.budget, currency)}</Text>
                </View>
                <View style={styles.detailCard}>
                  <Ionicons name="calendar-outline" size={24} color="#667eea" />
                  <Text style={styles.detailLabel}>Deadline</Text>
                  <Text style={styles.detailValue}>{formatDateLong(campaign.deadline)}</Text>
                </View>
                <View style={styles.detailCard}>
                  <Ionicons name="eye-outline" size={24} color="#667eea" />
                  <Text style={styles.detailLabel}>Views</Text>
                  <Text style={styles.detailValue}>{formatViews(views)}</Text>
                </View>
                <View style={styles.detailCard}>
                  <Ionicons name="people-outline" size={24} color="#667eea" />
                  <Text style={styles.detailLabel}>Applications</Text>
                  <Text style={styles.detailValue}>{campaign.applications?.length || 0}</Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Apply Button */}
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.modalApplyButton} onPress={onApply}>
              <View style={[styles.modalApplyGradient, { backgroundColor: 'rgb(15, 110, 234)' }]}>
                <Text style={styles.modalApplyButtonText}>Apply to Campaign</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFF" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

// Apply Modal Component
const ApplyModal = ({ visible, campaign, onClose, onSubmit, loading }: {
  visible: boolean;
  campaign: any;
  onClose: () => void;
  onSubmit: (message: string) => void;
  loading: boolean;
}) => {
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    onSubmit(message);
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.applyModalOverlay}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.applyModalContainer}
            >
              <View style={styles.applyModalContent}>
                <View style={styles.applyModalHeader}>
                  <Text style={styles.applyModalTitle}>Apply to Campaign</Text>
                  <TouchableOpacity onPress={onClose}>
                    <Ionicons name="close" size={24} color="#999" />
                  </TouchableOpacity>
                </View>

                {campaign && (
                  <>
                    <Text style={styles.applyCampaignTitle}>{campaign.title}</Text>
                    <Text style={styles.applyCampaignBrand}>
                      by {campaign.brand_name || campaign.brand?.name || 'Unknown Brand'}
                    </Text>
                    <Text style={styles.applyBudget}>
                      Budget: {formatCurrency(campaign.budget, campaign.currency || 'USD')}
                    </Text>

                    <TextInput
                      style={styles.applyMessageInput}
                      placeholder="Tell the brand why you're a good fit for this campaign..."
                      placeholderTextColor="#999"
                      multiline
                      numberOfLines={6}
                      textAlignVertical="top"
                      value={message}
                      onChangeText={setMessage}
                    />

                    <TouchableOpacity
                      style={[styles.applySubmitButton, loading && styles.applySubmitButtonDisabled]}
                      onPress={handleSubmit}
                      disabled={loading}
                    >
                      <View style={[styles.applySubmitGradient, { backgroundColor: 'rgb(15, 110, 234)' }]}>
                        {loading ? (
                          <ActivityIndicator color="#FFF" size="small" />
                        ) : (
                          <>
                            <Text style={styles.applySubmitText}>Submit Application</Text>
                            <Ionicons name="send" size={18} color="#FFF" />
                          </>
                        )}
                      </View>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// Add Bank Account Modal Component
const AddBankAccountModal = ({ visible, onClose, onSuccess }: {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const [formData, setFormData] = useState({
    account_holder_name: '',
    account_number: '',
    bank_name: '',
    ifsc_code: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.account_holder_name.trim()) newErrors.account_holder_name = 'Account holder name is required';
    if (!formData.account_number.trim()) newErrors.account_number = 'Account number is required';
    if (!formData.bank_name.trim()) newErrors.bank_name = 'Bank name is required';
    if (!formData.ifsc_code.trim()) newErrors.ifsc_code = 'IFSC code is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await accountAPI.addBankAccount(formData);
      Alert.alert('Success', 'Bank account added successfully!');
      onSuccess();
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to add bank account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.bankModalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Bank Account</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView style={styles.bankForm} showsVerticalScrollIndicator={false}>
            <Text style={styles.bankNote}>
              A bank account is required to apply for campaigns and receive payments.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Account Holder Name</Text>
              <TextInput
                style={[styles.input, errors.account_holder_name && styles.inputError]}
                placeholder="Enter account holder name"
                value={formData.account_holder_name}
                onChangeText={(text) => setFormData({ ...formData, account_holder_name: text })}
              />
              {errors.account_holder_name && (
                <Text style={styles.errorText}>{errors.account_holder_name}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Account Number</Text>
              <TextInput
                style={[styles.input, errors.account_number && styles.inputError]}
                placeholder="Enter account number"
                keyboardType="numeric"
                value={formData.account_number}
                onChangeText={(text) => setFormData({ ...formData, account_number: text })}
              />
              {errors.account_number && (
                <Text style={styles.errorText}>{errors.account_number}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Bank Name</Text>
              <TextInput
                style={[styles.input, errors.bank_name && styles.inputError]}
                placeholder="Enter bank name"
                value={formData.bank_name}
                onChangeText={(text) => setFormData({ ...formData, bank_name: text })}
              />
              {errors.bank_name && (
                <Text style={styles.errorText}>{errors.bank_name}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>IFSC Code</Text>
              <TextInput
                style={[styles.input, errors.ifsc_code && styles.inputError]}
                placeholder="Enter IFSC code"
                autoCapitalize="characters"
                value={formData.ifsc_code}
                onChangeText={(text) => setFormData({ ...formData, ifsc_code: text.toUpperCase() })}
              />
              {errors.ifsc_code && (
                <Text style={styles.errorText}>{errors.ifsc_code}</Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.bankSubmitButton}
              onPress={handleSubmit}
              disabled={loading}
            >
              <View style={[styles.bankSubmitGradient, { backgroundColor: 'rgb(15, 110, 234)' }]}>
                {loading ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.bankSubmitText}>Add Bank Account</Text>
                )}
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

// Main Component
const InfluencerCampaignsScreen = () => {
  const scrollY = useScroll();
  const navigation = useNavigation<NavigationProp>();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [applyModalVisible, setApplyModalVisible] = useState(false);
  const [bankModalVisible, setBankModalVisible] = useState(false);
  const [applying, setApplying] = useState(false);
  const [hasBankAccount, setHasBankAccount] = useState(false);
  const [checkingBank, setCheckingBank] = useState(false);

  // Fetch campaigns
  const fetchCampaigns = async () => {
    try {
      const response = await campaignAPI.getAvailableCampaigns();
      let campaignsData = [];
      
      if (Array.isArray(response)) {
        campaignsData = response;
      } else if (response?.data) {
        campaignsData = response.data;
      } else if (response?.campaigns) {
        campaignsData = response.campaigns;
      } else if (response?.results) {
        campaignsData = response.results;
      }
      
      // Format campaigns
      const formattedCampaigns = campaignsData.map((campaign: any) => ({
        ...campaign,
        total_views: campaign.total_views || campaign.views || 0,
        likes_count: campaign.likes_count || 0,
        user_liked: campaign.user_liked || false,
        user_bookmarked: campaign.user_bookmarked || false,
        applications: campaign.applications || [],
      }));
      
      setCampaigns(formattedCampaigns);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      Alert.alert('Error', 'Failed to load campaigns');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Check bank account status
  const checkBankAccount = async () => {
    setCheckingBank(true);
    try {
      const response = await accountAPI.getBankAccountStatus();
      setHasBankAccount(response?.data?.has_accounts || false);
    } catch (error) {
      console.error('Error checking bank account:', error);
      setHasBankAccount(false);
    } finally {
      setCheckingBank(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCampaigns();
      checkBankAccount();
    }, [])
  );

  // Handle like toggle
  const handleLike = async (campaign: any) => {
    try {
      const newLikeState = !campaign.user_liked;
      const response = await campaignAPI.likeCampaign(campaign._id, newLikeState);
      
      // Update local state
      setCampaigns(prev => prev.map(c => 
        c._id === campaign._id 
          ? { ...c, user_liked: newLikeState, likes_count: response.likes_count }
          : c
      ));
    } catch (error: any) {
      console.error('Error toggling like:', error);
      Alert.alert('Error', error.response?.data?.detail || 'Failed to update like');
    }
  };

  // Handle bookmark toggle
  const handleBookmark = async (campaign: any) => {
    try {
      const newBookmarkState = !campaign.user_bookmarked;
      await campaignAPI.bookmarkCampaign(campaign._id, newBookmarkState);
      
      // Update local state
      setCampaigns(prev => prev.map(c => 
        c._id === campaign._id 
          ? { ...c, user_bookmarked: newBookmarkState }
          : c
      ));
    } catch (error: any) {
      console.error('Error toggling bookmark:', error);
      Alert.alert('Error', error.response?.data?.detail || 'Failed to update bookmark');
    }
  };

  // Handle view campaign details
  const handleViewDetails = (campaign: any) => {
    // Track view
    campaignAPI.trackCampaignView(campaign._id).catch(console.error);
    
    setSelectedCampaign(campaign);
    setDetailsModalVisible(true);
  };

  // Handle apply to campaign
  const handleApply = async () => {
    if (!selectedCampaign) return;
    
    // Check if bank account exists
    if (!hasBankAccount) {
      setDetailsModalVisible(false);
      setBankModalVisible(true);
      return;
    }
    
    // Open apply modal
    setDetailsModalVisible(false);
    setApplyModalVisible(true);
  };

  // Submit application
  const submitApplication = async (message: string) => {
    if (!selectedCampaign) return;
    
    setApplying(true);
    try {
      await campaignAPI.applyToCampaign(selectedCampaign._id, { message });
      Alert.alert('Success', 'Application submitted successfully!');
      setApplyModalVisible(false);
      setSelectedCampaign(null);
      fetchCampaigns(); // Refresh campaigns
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  // Handle view brand profile
  const handleViewBrandProfile = (brandId: string, brandName: string) => {
    router.push(`/(shared)/profile/${brandId}`);
  };

  // Handle bank account added
  const handleBankAccountAdded = () => {
    setHasBankAccount(true);
    // Re-open details modal if there was a pending campaign
    if (selectedCampaign) {
      setDetailsModalVisible(true);
    }
  };

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchCampaigns();
    checkBankAccount();
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="megaphone-outline" size={64} color="#CCC" />
      <Text style={styles.emptyTitle}>No Campaigns Available</Text>
      <Text style={styles.emptyText}>
        Check back later for new campaign opportunities.
      </Text>
    </View>
  );

  // Render loading state
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading campaigns...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Available Campaigns</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={22} color="#667eea" />
        </TouchableOpacity>
      </View>

      <AnimatedFlatList
        data={campaigns}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <CampaignCard
            campaign={item}
            onPress={() => handleViewDetails(item)}
            onLike={() => handleLike(item)}
            onBookmark={() => handleBookmark(item)}
            onViewBrand={() => handleViewBrandProfile(item.brand_id, item.brand_name || item.brand?.name)}
            isLiked={item.user_liked}
            isBookmarked={item.user_bookmarked}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 100 } // Add padding for tab bar
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#667eea']} />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        ListEmptyComponent={renderEmptyState}
      />

      {/* Campaign Details Modal */}
      <CampaignDetailsModal
        visible={detailsModalVisible}
        campaign={selectedCampaign}
        onClose={() => setDetailsModalVisible(false)}
        onApply={handleApply}
        onViewBrand={() => {
          if (selectedCampaign) {
            setDetailsModalVisible(false);
            handleViewBrandProfile(
              selectedCampaign.brand_id,
              selectedCampaign.brand_name || selectedCampaign.brand?.name
            );
          }
        }}
      />

      {/* Apply Modal */}
      <ApplyModal
        visible={applyModalVisible}
        campaign={selectedCampaign}
        onClose={() => setApplyModalVisible(false)}
        onSubmit={submitApplication}
        loading={applying}
      />

      {/* Add Bank Account Modal */}
      <AddBankAccountModal
        visible={bankModalVisible}
        onClose={() => setBankModalVisible(false)}
        onSuccess={handleBankAccountAdded}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    padding: 8,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  // Card Styles
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    height: 180,
  },
  campaignImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusActive: {
    backgroundColor: '#4CAF50',
  },
  statusPaused: {
    backgroundColor: '#FF9800',
  },
  statusCompleted: {
    backgroundColor: '#9E9E9E',
  },
  statusText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  actionOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonActive: {
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    lineHeight: 24,
  },
  brandInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  brandInitial: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  brandName: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  statText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  likedText: {
    color: '#FF6B6B',
  },
  applyButton: {
    marginTop: 4,
  },
  applyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  applyButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: 60,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalImage: {
    width: '100%',
    height: 200,
  },
  modalBody: {
    padding: 20,
  },
  modalTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalCampaignTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  statusBadgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusTextSmall: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  modalBrandSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  modalBrandAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalBrandInitial: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalBrandInfo: {
    flex: 1,
  },
  modalBrandName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  modalSectionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  detailCard: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  modalApplyButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalApplyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  modalApplyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Apply Modal Styles
  applyModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyModalContainer: {
    width: width - 40,
    maxHeight: height * 0.8,
  },
  applyModalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
  },
  applyModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  applyModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  applyCampaignTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  applyCampaignBrand: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  applyBudget: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 16,
  },
  applyMessageInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#333',
    minHeight: 120,
    marginBottom: 20,
  },
  applySubmitButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  applySubmitButtonDisabled: {
    opacity: 0.7,
  },
  applySubmitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  applySubmitText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Bank Modal Styles
  bankModalContent: {
    flex: 1,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: 60,
  },
  bankForm: {
    padding: 20,
  },
  bankNote: {
    fontSize: 14,
    color: '#FF9800',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  errorText: {
    fontSize: 12,
    color: '#FF6B6B',
    marginTop: 4,
  },
  bankSubmitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 20,
    marginBottom: 40,
  },
  bankSubmitGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  bankSubmitText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default InfluencerCampaignsScreen;