// C:\Sagadevan\quickbox\mobile\app\(influencer)\(tabs)\campaigns\applications.tsx
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
  Animated,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { router } from 'expo-router';
import { useScroll } from "@/contexts/ScrollContext";

// Import services
import { campaignAPI, ApplicationResponse } from '../../../../services/campaignAPI';
import profileAPI from '../../../../services/profileAPI';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

// Types
type RootStackParamList = {
  BrandProfile: { brandId: string; brandName: string };
  Messages: { conversationId?: string; brandId?: string; campaignId?: string };
  CampaignDetails: { campaignId: string; campaign: any };
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

// Helper functions
const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return 'Invalid date';
  }
};

const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  const symbols: Record<string, string> = {
    USD: '$', EUR: '€', GBP: '£', JPY: '¥', CAD: 'C$', AUD: 'A$', INR: '₹',
  };
  const symbol = symbols[currency] || '$';
  return `${symbol}${amount?.toFixed(2) || '0.00'}`;
};

// Status helpers
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'pending': return '#FF9800';
    case 'approved': return '#4CAF50';
    case 'contracted': return '#9C27B0';
    case 'media_submitted': return '#2196F3';
    case 'completed': return '#00BCD4';
    case 'rejected': return '#F44336';
    default: return '#9E9E9E';
  }
};

const getStatusIcon = (status: string): string => {
  switch (status) {
    case 'pending': return 'time-outline';
    case 'approved': return 'checkmark-circle-outline';
    case 'contracted': return 'document-text-outline';
    case 'media_submitted': return 'image-outline';
    case 'completed': return 'checkmark-done-circle-outline';
    case 'rejected': return 'close-circle-outline';
    default: return 'alert-circle-outline';
  }
};

const getStatusText = (status: string, contractSigned?: boolean): string => {
  switch (status) {
    case 'pending': return 'Under Review';
    case 'approved': return 'Approved - Contract Ready';
    case 'contracted': return contractSigned ? 'Contract Signed ✓' : 'Contract Sent - Action Required';
    case 'media_submitted': return 'Media Submitted';
    case 'completed': return 'Completed';
    case 'rejected': return 'Not Selected';
    default: return status;
  }
};

// Profile Image Component
const ProfileImage = ({ userId, profileType, size = 40, onPress }: {
  userId: string;
  profileType: 'brand' | 'influencer';
  size?: number;
  onPress?: () => void;
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);


  const profileCache = useRef<Record<string, any>>({});

  useEffect(() => {
  const fetchProfileData = async () => {
    if (!userId) return;

    try {
      setLoading(true);

      let profileData = null;

      // ✅ Check cache first
      if (profileCache.current[userId]) {
        profileData = profileCache.current[userId];
      } else {
        const res = await profileAPI.getProfileById(userId);
        profileData = res?.profile;

        if (profileData) {
          profileCache.current[userId] = profileData; // store in cache
        }
      }

      // ✅ Handle data
      if (profileData) {
        setUserData(profileData);

        let imageId = null;

        if (profileType === 'influencer' && profileData.profile_picture) {
          imageId = profileData.profile_picture;
        } else if (profileType === 'brand' && profileData.logo) {
          imageId = profileData.logo;
        }

        if (imageId) {
          const BASE_URL =
            process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.100:8000';

          setImageUrl(`${BASE_URL}/profiles/image/${imageId}`);
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

  fetchProfileData();
}, [userId, profileType]);

  const getDisplayName = () => {
    if (!userData) return 'User';
    if (profileType === 'influencer') {
      return userData.nickname || userData.full_name || 'Influencer';
    }
    return userData.company_name || userData.contact_person_name || 'Brand';
  };

  const getDisplayInitial = () => {
    const name = getDisplayName();
    return name?.charAt(0)?.toUpperCase() || 'U';
  };

  if (error || !imageUrl) {
    return (
      <TouchableOpacity onPress={onPress} disabled={!onPress}>
        <View style={[styles.avatarPlaceholder, { width: size, height: size, borderRadius: size / 2 }]}>
          <Text style={[styles.avatarInitial, { fontSize: size * 0.4 }]}>
            {getDisplayInitial()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <Image
        source={{ uri: imageUrl }}
        style={[styles.avatarImage, { width: size, height: size, borderRadius: size / 2 }]}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
      />
      {loading && (
        <View style={[styles.avatarLoading, { width: size, height: size, borderRadius: size / 2 }]}>
          <ActivityIndicator size="small" color="#667eea" />
        </View>
      )}
    </TouchableOpacity>
  );
};

// Status Chip Component
const StatusChip = ({ status, contractSigned }: { status: string; contractSigned?: boolean }) => {
  const color = getStatusColor(status);
  const icon = getStatusIcon(status);
  const text = getStatusText(status, contractSigned);

  return (
    <View style={[styles.statusChip, { backgroundColor: color + '20', borderColor: color }]}>
      <Ionicons name={icon as any} size={14} color={color} />
      <Text style={[styles.statusText, { color }]}>{text}</Text>
    </View>
  );
};

// Campaign Image Component
const CampaignImage = ({ fileId, alt, onPress, height = 160 }: {
  fileId?: string;
  alt: string;
  onPress?: () => void;
  height?: number;
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const getImageUrl = () => {
    if (!fileId) return null;
    if (fileId.startsWith('http')) return fileId;
    return `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000'}/api/campaigns/image/${fileId}`;
  };

  const imageUrl = getImageUrl();

  if (!imageUrl || error) {
    return (
      <TouchableOpacity onPress={onPress} disabled={!onPress} style={{ flex: 1 }}>
        <View style={[styles.imagePlaceholder, { height, backgroundColor: 'rgb(15, 110, 234)' }]}>
          <Ionicons name="megaphone-outline" size={48} color="rgba(255,255,255,0.8)" />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress} style={{ flex: 1 }}>
      <Image
        source={{ uri: imageUrl }}
        style={[styles.campaignImage, { height }]}
        resizeMode="cover"
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
      />
      {loading && (
        <View style={[styles.imageLoading, { height }]}>
          <ActivityIndicator size="large" color="#FFF" />
        </View>
      )}
    </TouchableOpacity>
  );
};

// Media Viewer Modal Component
const MediaViewerModal = ({ visible, media, onClose }: {
  visible: boolean;
  media: any;
  onClose: () => void;
}) => {
  const [loading, setLoading] = useState(true);

  if (!media) return null;

  const getMediaUrl = () => {
    if (media.media_type === 'image') {
      return `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000'}/api/media/${media.file_id}/view`;
    }
    return `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000'}/api/media/${media.file_id}/download`;
  };

  const handleDownload = async () => {
    try {
      const url = getMediaUrl();
      const filename = media.filename || `media_${media.file_id}`;
      const downloadPath = `${FileSystem.documentDirectory}${filename}`;
      
      const downloadResumable = FileSystem.createDownloadResumable(
        url,
        downloadPath,
        {},
        (downloadProgress) => {
          console.log('Download progress:', downloadProgress);
        }
      );
      
      const { uri } = await downloadResumable.downloadAsync();
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('Download Complete', `File saved to: ${uri}`);
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to download file');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView intensity={100} style={styles.mediaModalOverlay} tint="dark">
        <View style={styles.mediaModalContainer}>
          <View style={styles.mediaModalHeader}>
            <Text style={styles.mediaModalTitle} numberOfLines={1}>
              {media.filename || 'Media File'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.mediaModalClose}>
              <Ionicons name="close" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.mediaModalContent}>
            {media.media_type === 'image' ? (
              <Image
                source={{ uri: getMediaUrl() }}
                style={styles.mediaModalImage}
                resizeMode="contain"
                onLoadStart={() => setLoading(true)}
                onLoadEnd={() => setLoading(false)}
              />
            ) : (
              <View style={styles.mediaModalPlaceholder}>
                <Ionicons name="document-outline" size={64} color="#FFF" />
                <Text style={styles.mediaModalPlaceholderText}>
                  Preview not available
                </Text>
              </View>
            )}
            
            {loading && (
              <View style={styles.mediaModalLoading}>
                <ActivityIndicator size="large" color="#FFF" />
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.mediaModalDownload} onPress={handleDownload}>
            <View style={[styles.mediaModalDownloadGradient, { backgroundColor: 'rgb(15, 110, 234)' }]}>
              <Ionicons name="download-outline" size={20} color="#FFF" />
              <Text style={styles.mediaModalDownloadText}>Download</Text>
            </View>
          </TouchableOpacity>

          {media.description && (
            <View style={styles.mediaModalDescription}>
              <Text style={styles.mediaModalDescriptionText}>
                {media.description}
              </Text>
            </View>
          )}
        </View>
      </BlurView>
    </Modal>
  );
};

// Media Files Viewer Component
const MediaFilesViewer = ({ visible, application, onClose }: {
  visible: boolean;
  application: any;
  onClose: () => void;
}) => {
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [mediaViewerVisible, setMediaViewerVisible] = useState(false);

  useEffect(() => {
    const fetchMediaFiles = async () => {
      if (visible && application) {
        setLoading(true);
        try {
          let mediaData: any[] = [];
          
          // Try to get media from application data first
          if (application.submitted_media && application.submitted_media.length > 0) {
            mediaData = application.submitted_media;
          } else {
            // Try API
            const response = await campaignAPI.getCampaignMediaFiles(application.campaign_id);
            if (Array.isArray(response)) {
              mediaData = response.filter(m => m.influencer_id === application.influencer_id);
            }
          }
          
          setMediaFiles(mediaData);
        } catch (error) {
          console.error('Error fetching media files:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchMediaFiles();
  }, [visible, application]);

  const getMediaIcon = (mediaType: string) => {
    switch (mediaType) {
      case 'image': return 'image-outline';
      case 'video': return 'videocam-outline';
      case 'audio': return 'musical-notes-outline';
      case 'document': return 'document-text-outline';
      default: return 'document-outline';
    }
  };

  const handleViewMedia = (media: any) => {
    setSelectedMedia(media);
    setMediaViewerVisible(true);
  };

  if (!application) return null;

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.mediaModalContent}>
            <View style={styles.mediaModalHeader}>
              <Text style={styles.mediaModalTitle}>
                Submitted Media Files
                {mediaFiles.length > 0 && ` (${mediaFiles.length})`}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.mediaInfo}>
              <Text style={styles.mediaCampaignTitle}>{application.campaign_title}</Text>
              <Text style={styles.mediaDate}>
                Submitted: {formatDate(application.media_submitted_at)}
              </Text>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#667eea" />
                <Text style={styles.loadingText}>Loading media files...</Text>
              </View>
            ) : mediaFiles.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="image-outline" size={64} color="#CCC" />
                <Text style={styles.emptyTitle}>No Media Files</Text>
                <Text style={styles.emptyText}>
                  No media files have been submitted for this campaign yet.
                </Text>
              </View>
            ) : (
              <AnimatedFlatList
                data={mediaFiles}
                keyExtractor={(item) => item.file_id}
                numColumns={2}
                contentContainerStyle={styles.mediaGrid}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.mediaCard}
                    onPress={() => handleViewMedia(item)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.mediaCardContent}>
                      <View style={styles.mediaIconContainer}>
                        <Ionicons name={getMediaIcon(item.media_type) as any} size={32} color="#667eea" />
                      </View>
                      <Text style={styles.mediaFilename} numberOfLines={2}>
                        {item.filename || 'Media File'}
                      </Text>
                      <Text style={styles.mediaSize}>
                        {item.size ? `${(item.size / 1024 / 1024).toFixed(2)} MB` : 'Size unknown'}
                      </Text>
                      {item.description && (
                        <Text style={styles.mediaDescription} numberOfLines={2}>
                          {item.description}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}

            <TouchableOpacity style={styles.closeModalButton} onPress={onClose}>
              <Text style={styles.closeModalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      <MediaViewerModal
        visible={mediaViewerVisible}
        media={selectedMedia}
        onClose={() => setMediaViewerVisible(false)}
      />
    </>
  );
};

// Contract Acceptance Dialog Component
const ContractAcceptanceDialog = ({ visible, application, onClose, onAccept }: {
  visible: boolean;
  application: any;
  onClose: () => void;
  onAccept: () => Promise<void>;
}) => {
  const [accepting, setAccepting] = useState(false);

  if (!application) return null;

  const handleAccept = async () => {
    setAccepting(true);
    await onAccept();
    setAccepting(false);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView intensity={100} style={styles.modalOverlay} tint="dark">
        <View style={styles.contractModal}>
          <View style={styles.contractModalHeader}>
            <View style={styles.contractModalIcon}>
              <Ionicons name="document-text-outline" size={32} color="#9C27B0" />
            </View>
            <Text style={styles.contractModalTitle}>Contract Agreement</Text>
            <TouchableOpacity onPress={onClose} style={styles.contractModalClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.contractModalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.contractSuccess}>
              <Ionicons name="checkmark-circle" size={48} color="#4CAF50" />
              <Text style={styles.contractSuccessTitle}>Congratulations! 🎉</Text>
              <Text style={styles.contractSuccessText}>
                Your application for {application.campaign_title} has been approved!
              </Text>
            </View>

            <View style={styles.contractDetails}>
              <Text style={styles.contractDetailsTitle}>Campaign Details:</Text>
              <View style={styles.contractDetailRow}>
                <Text style={styles.contractDetailLabel}>Budget:</Text>
                <Text style={styles.contractDetailValue}>
                  {application.campaign_currency || 'USD'} {application.campaign_budget}
                </Text>
              </View>
              <View style={styles.contractDetailRow}>
                <Text style={styles.contractDetailLabel}>Deadline:</Text>
                <Text style={styles.contractDetailValue}>
                  {formatDate(application.campaign_deadline)}
                </Text>
              </View>
              <View style={styles.contractDetailRow}>
                <Text style={styles.contractDetailLabel}>Requirements:</Text>
                <Text style={styles.contractDetailValue}>
                  {application.campaign_requirements || 'No specific requirements provided.'}
                </Text>
              </View>
            </View>

            <View style={styles.contractTerms}>
              <Text style={styles.contractTermsTitle}>Terms & Conditions:</Text>
              <View style={styles.contractTermItem}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#4CAF50" />
                <Text style={styles.contractTermText}>Deliver high-quality media content as per campaign requirements</Text>
              </View>
              <View style={styles.contractTermItem}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#4CAF50" />
                <Text style={styles.contractTermText}>Submit all deliverables before the campaign deadline</Text>
              </View>
              <View style={styles.contractTermItem}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#4CAF50" />
                <Text style={styles.contractTermText}>Payment upon successful completion</Text>
              </View>
            </View>

            <Text style={styles.contractNote}>
              By accepting this contract, you agree to deliver the required media content according to the campaign specifications and timeline.
            </Text>
          </ScrollView>

          <View style={styles.contractModalActions}>
            <TouchableOpacity style={styles.contractCancelButton} onPress={onClose}>
              <Text style={styles.contractCancelText}>Review Later</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.contractAcceptButton, accepting && styles.contractAcceptButtonDisabled]}
              onPress={handleAccept}
              disabled={accepting}
            >
              <View style={[styles.contractAcceptGradient, { backgroundColor: 'rgb(15, 110, 234)' }]}>
                {accepting ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <>
                    <Ionicons name="checkmark-outline" size={20} color="#FFF" />
                    <Text style={styles.contractAcceptText}>Accept Contract</Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
};

// Media Submission Dialog Component
const MediaSubmissionDialog = ({ visible, application, onClose, onSubmit }: {
  visible: boolean;
  application: any;
  onClose: () => void;
  onSubmit: (files: any[], description: string) => Promise<void>;
}) => {
  const [files, setFiles] = useState<any[]>([]);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setFiles(prev => [...prev, ...result.assets]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      Alert.alert('Error', 'Please select at least one file to upload');
      return;
    }

    setUploading(true);
    try {
      await onSubmit(files, description);
      setFiles([]);
      setDescription('');
      onClose();
    } catch (error) {
      console.error('Error submitting media:', error);
    } finally {
      setUploading(false);
    }
  };

  if (!application) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContent}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Submit Media Files</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.mediaForm} showsVerticalScrollIndicator={false}>
            <Text style={styles.campaignTitle}>
              {application.campaign_title}
            </Text>
            <Text style={styles.campaignBrand}>
              by {application.brand_name || 'Unknown Brand'}
            </Text>

            <TouchableOpacity style={styles.pickMediaButton} onPress={pickMedia}>
              <LinearGradient
                colors={['#FF9800', '#F57C00']}
                style={styles.pickMediaGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="add-circle-outline" size={24} color="#FFF" />
                <Text style={styles.pickMediaText}>Select Media Files</Text>
              </LinearGradient>
            </TouchableOpacity>

            {files.length > 0 && (
              <View style={styles.selectedFiles}>
                <Text style={styles.selectedFilesTitle}>
                  Selected Files ({files.length})
                </Text>
                {files.map((file, index) => (
                  <View key={index} style={styles.fileItem}>
                    <View style={styles.fileInfo}>
                      <Ionicons name="document-outline" size={24} color="#667eea" />
                      <View style={styles.fileDetails}>
                        <Text style={styles.fileName} numberOfLines={1}>
                          {file.fileName || file.uri?.split('/').pop() || `File ${index + 1}`}
                        </Text>
                        <Text style={styles.fileSize}>
                          {(file.fileSize || 0) / 1024 / 1024} MB
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity onPress={() => removeFile(index)}>
                      <Ionicons name="close-circle" size={24} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <TextInput
              style={styles.descriptionInput}
              placeholder="Media Description (Optional)"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, uploading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={uploading || files.length === 0}
            >
              <LinearGradient
                colors={['#FF9800', '#F57C00']}
                style={styles.submitGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {uploading ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <>
                    <Ionicons name="send" size={20} color="#FFF" />
                    <Text style={styles.submitButtonText}>Submit {files.length} File(s)</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

// Application Card Component
const ApplicationCard = ({ application, onPress, onContact, onViewMedia, onAction }: {
  application: any;
  onPress: () => void;
  onContact: () => void;
  onViewMedia?: () => void;
  onAction?: () => void;
}) => {
  const [imageError, setImageError] = useState(false);

  const getActionButton = () => {
    switch (application.status) {
      case 'approved':
        return (
          <TouchableOpacity style={styles.contractActionButton} onPress={onAction}>
            <View style={[styles.actionGradient, { backgroundColor: 'rgb(15, 110, 234)' }]}>
              <Ionicons name="document-text-outline" size={18} color="#FFF" />
              <Text style={styles.actionButtonText}>Review Contract</Text>
            </View>
          </TouchableOpacity>
        );
      
      case 'contracted':
        if (application.contract_signed) {
          return (
            <TouchableOpacity style={styles.mediaActionButton} onPress={onAction}>
              <LinearGradient
                colors={['#FF9800', '#F57C00']}
                style={styles.actionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="image-outline" size={18} color="#FFF" />
                <Text style={styles.actionButtonText}>Submit Media</Text>
              </LinearGradient>
            </TouchableOpacity>
          );
        } else {
          return (
            <TouchableOpacity style={styles.contractActionButton} onPress={onAction}>
              <View style={[styles.actionGradient, { backgroundColor: 'rgb(15, 110, 234)' }]}>
                <Ionicons name="document-text-outline" size={18} color="#FFF" />
                <Text style={styles.actionButtonText}>Accept Contract First</Text>
              </View>
            </TouchableOpacity>
          );
        }
      
      case 'media_submitted':
        return (
          <View style={styles.waitingContainer}>
            <Text style={styles.waitingText}>Waiting for payment</Text>
          </View>
        );
      
      case 'completed':
        return (
          <View style={styles.completedContainer}>
            <Ionicons name="checkmark-done-circle" size={18} color="#00BCD4" />
            <Text style={styles.completedText}>Completed</Text>
          </View>
        );
      
      default:
        return (
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>{getStatusText(application.status)}</Text>
          </View>
        );
    }
  };

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.card}>
      {/* Campaign Image */}
      <CampaignImage
        fileId={application.campaign_image_id}
        alt={application.campaign_title}
        height={160}
      />
      
      {/* Status Badge */}
      <View style={styles.statusBadge}>
        <StatusChip status={application.status} contractSigned={application.contract_signed} />
      </View>

      <View style={styles.cardContent}>
        {/* Title and Date */}
        <View style={styles.titleRow}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {application.campaign_title}
          </Text>
          <Text style={styles.dateText}>
            {formatDate(application.applied_at)}
          </Text>
        </View>

        {/* Brand Profile */}
        <TouchableOpacity style={styles.brandSection} onPress={onPress}>
          <ProfileImage
            userId={application.brand_id}
            profileType="brand"
            size={40}
          />
          <View style={styles.brandInfo}>
            <Text style={styles.brandName}>
              {application.brand_name || 'Unknown Brand'}
            </Text>
            <Text style={styles.brandCategory}>
              {application.campaign_category || 'General'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Campaign Details */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Ionicons name="cash-outline" size={16} color="#4CAF50" />
            <Text style={styles.detailLabel}>Budget</Text>
            <Text style={styles.detailValue}>
              {formatCurrency(application.campaign_budget, application.campaign_currency)}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={16} color="#FF9800" />
            <Text style={styles.detailLabel}>Deadline</Text>
            <Text style={styles.detailValue}>
              {formatDate(application.campaign_deadline)}
            </Text>
          </View>
        </View>

        {/* Application Message */}
        {application.message && (
          <View style={styles.messageContainer}>
            <Text style={styles.messageLabel}>Your Message:</Text>
            <Text style={styles.messageText} numberOfLines={2}>
              "{application.message}"
            </Text>
          </View>
        )}

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${getProgressPercentage(application.status)}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {getStatusText(application.status, application.contract_signed)}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.viewButton} onPress={onPress}>
            <Ionicons name="eye-outline" size={18} color="#667eea" />
            <Text style={styles.viewButtonText}>View</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.contactButton} onPress={onContact}>
            <Ionicons name="chatbubble-outline" size={18} color="#667eea" />
            <Text style={styles.contactButtonText}>Message</Text>
          </TouchableOpacity>

          {(application.status === 'media_submitted' || application.status === 'completed') && (
            <TouchableOpacity style={styles.mediaButton} onPress={onViewMedia}>
              <Ionicons name="images-outline" size={18} color="#2196F3" />
              <Text style={styles.mediaButtonText}>Media</Text>
            </TouchableOpacity>
          )}

          <View style={styles.actionButtonContainer}>
            {getActionButton()}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Helper function to get progress percentage
const getProgressPercentage = (status: string): number => {
  switch (status) {
    case 'pending': return 20;
    case 'approved': return 40;
    case 'contracted': return 60;
    case 'media_submitted': return 80;
    case 'completed': return 100;
    default: return 0;
  }
};

// Main Component
const InfluencerApplicationsScreen = () => {
  const scrollY = useScroll();
  const navigation = useNavigation<NavigationProp>();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [contractDialogVisible, setContractDialogVisible] = useState(false);
  const [mediaSubmissionVisible, setMediaSubmissionVisible] = useState(false);
  const [mediaFilesVisible, setMediaFilesVisible] = useState(false);
  const [selectedApplicationForContract, setSelectedApplicationForContract] = useState<any>(null);
  const [selectedApplicationForMedia, setSelectedApplicationForMedia] = useState<any>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState<any>(null);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        setUser(JSON.parse(userStr));
      }
    };
    fetchUser();
  }, []);

  // Fetch applications
  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await campaignAPI.getInfluencerApplications();
      const appsData = Array.isArray(response) ? response : 
                      response?.data ? response.data : 
                      response?.applications ? response.applications : [];
      setApplications(appsData);
    } catch (err: any) {
      setError('Failed to fetch applications. Please check your connection.');
      console.error('Fetch applications error:', err);
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

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchApplications();
  };

  // Handle accept contract
  const handleAcceptContract = async () => {
    if (!selectedApplicationForContract) return;
    
    try {
      const currentUserId = user?._id || user?.id;
      if (!currentUserId) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      await campaignAPI.acceptContract({
        campaign_id: selectedApplicationForContract.campaign_id,
        influencer_id: currentUserId,
        terms_accepted: true,
        signed_at: new Date().toISOString()
      });
      
      setSuccess('Contract accepted successfully! You can now submit media files.');
      fetchApplications();
      setContractDialogVisible(false);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to accept contract');
    }
  };

  // Handle submit media
  const handleSubmitMedia = async (files: any[], description: string) => {
    if (!selectedApplicationForMedia) return;
    
    try {
      const formData = new FormData();
      formData.append('campaign_id', selectedApplicationForMedia.campaign_id);
      if (description) {
        formData.append('description', description);
      }
      
      files.forEach((file, index) => {
        formData.append('media_files', {
          uri: file.uri,
          type: file.mimeType || file.type || 'image/jpeg',
          name: file.fileName || `media_${index}.jpg`,
        } as any);
      });

      await campaignAPI.submitMediaFiles(formData);
      setSuccess('Media files submitted successfully!');
      fetchApplications();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit media files');
      throw err;
    }
  };

  // Handle view brand profile
  const handleViewBrandProfile = (brandId: string, brandName: string) => {
    router.push(`/(shared)/profile/${brandId}`);
  };

  // Handle contact brand
  const handleContactBrand = (application: any) => {
    const brandId = application.brand_id;
    if (brandId) {
      navigation.navigate('Messages', { 
        brandId, 
        campaignId: application.campaign_id 
      });
    }
  };

  // Handle view details
  const handleViewDetails = (application: any) => {
    setSelectedApplication(application);
    setDetailModalVisible(true);
  };

  // Handle action button press
  const handleActionPress = (application: any) => {
    if (application.status === 'approved') {
      setSelectedApplicationForContract(application);
      setContractDialogVisible(true);
    } else if (application.status === 'contracted') {
      if (application.contract_signed) {
        setSelectedApplicationForMedia(application);
        setMediaSubmissionVisible(true);
      } else {
        setSelectedApplicationForContract(application);
        setContractDialogVisible(true);
      }
    }
  };

  // Handle view media
  const handleViewMedia = (application: any) => {
    setSelectedApplication(application);
    setMediaFilesVisible(true);
  };

  // Filter applications by tab
  const getFilteredApplications = () => {
    if (activeTab === 'all') return applications;
    return applications.filter(app => app.status === activeTab);
  };

  // Get tab counts
  const getTabCounts = () => {
    const counts: Record<string, number> = {
      all: applications.length,
      pending: 0,
      approved: 0,
      contracted: 0,
      media_submitted: 0,
      completed: 0,
      rejected: 0,
    };
    
    applications.forEach(app => {
      if (counts[app.status] !== undefined) {
        counts[app.status]++;
      }
    });
    
    return counts;
  };

  const tabCounts = getTabCounts();
  const filteredApplications = getFilteredApplications();

  // Render tab item
  const renderTab = (tabId: string, label: string, icon: string, color?: string) => (
    <TouchableOpacity
      style={[styles.tab, activeTab === tabId && styles.tabActive]}
      onPress={() => setActiveTab(tabId)}
    >
      <Ionicons 
        name={icon as any} 
        size={20} 
        color={activeTab === tabId ? '#667eea' : (color || '#666')} 
      />
      <Text style={[styles.tabText, activeTab === tabId && styles.tabTextActive]}>
        {label}
      </Text>
      {tabCounts[tabId] > 0 && (
        <View style={styles.tabBadge}>
          <Text style={styles.tabBadgeText}>{tabCounts[tabId]}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  // Render loading state
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading your applications...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: 'rgb(15, 110, 234)' }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>My Applications</Text>
            <Text style={styles.headerSubtitle}>
              Track your campaign applications and workflow
            </Text>
          </View>
          <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
            <Ionicons name="refresh-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, flexShrink: 0, backgroundColor: '#FFF' }}
        contentContainerStyle={styles.tabsContainer}
      >
        {renderTab('all', 'All', 'apps-outline')}
        {renderTab('pending', 'Review', 'time-outline', '#FF9800')}
        {renderTab('approved', 'Approved', 'checkmark-circle-outline', '#4CAF50')}
        {renderTab('contracted', 'Contract', 'document-text-outline', '#9C27B0')}
        {renderTab('media_submitted', 'Media', 'image-outline', '#2196F3')}
        {renderTab('completed', 'Done', 'checkmark-done-circle-outline', '#00BCD4')}
        {renderTab('rejected', 'Rejected', 'close-circle-outline', '#F44336')}
      </ScrollView>

      {/* Error/Success Messages */}
      {error ? (
        <View style={styles.messageContainer}>
          <Ionicons name="alert-circle" size={24} color="#F44336" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : success ? (
        <View style={styles.messageContainer}>
          <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
          <Text style={styles.successText}>{success}</Text>
        </View>
      ) : null}

      {/* Applications List */}
      <AnimatedFlatList
        data={filteredApplications}
        keyExtractor={(item) => `${item.campaign_id}-${item.influencer_id}`}
        renderItem={({ item }) => (
          <ApplicationCard
            application={item}
            onPress={() => handleViewDetails(item)}
            onContact={() => handleContactBrand(item)}
            onViewMedia={() => handleViewMedia(item)}
            onAction={() => handleActionPress(item)}
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
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#CCC" />
            <Text style={styles.emptyTitle}>
              {applications.length === 0 ? 'No Applications Yet' : 'No Matching Applications'}
            </Text>
            <Text style={styles.emptyText}>
              {applications.length === 0 
                ? 'Start your influencer journey by applying to exciting brand campaigns!'
                : 'Try changing your filter to see more results'}
            </Text>
          </View>
        }
      />

      {/* Detail Modal */}
      <Modal
        visible={detailModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.detailModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Application Details</Text>
              <TouchableOpacity onPress={() => setDetailModalVisible(false)} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedApplication && (
                <View style={styles.detailContent}>
                  {/* Campaign Image */}
                  <CampaignImage
                    fileId={selectedApplication.campaign_image_id}
                    alt={selectedApplication.campaign_title}
                    height={200}
                  />

                  <View style={styles.detailBody}>
                    <Text style={styles.detailTitle}>
                      {selectedApplication.campaign_title}
                    </Text>
                    
                    <StatusChip 
                      status={selectedApplication.status} 
                      contractSigned={selectedApplication.contract_signed}
                    />

                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>Campaign Description</Text>
                      <Text style={styles.detailText}>
                        {selectedApplication.campaign_description || 'No description provided.'}
                      </Text>
                    </View>

                    {selectedApplication.campaign_requirements && (
                      <View style={styles.detailSection}>
                        <Text style={styles.detailSectionTitle}>Requirements</Text>
                        <Text style={styles.detailText}>
                          {selectedApplication.campaign_requirements}
                        </Text>
                      </View>
                    )}

                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>Campaign Details</Text>
                      <View style={styles.detailGrid}>
                        <View style={styles.detailGridItem}>
                          <Ionicons name="cash-outline" size={20} color="#4CAF50" />
                          <Text style={styles.detailGridLabel}>Budget</Text>
                          <Text style={styles.detailGridValue}>
                            {formatCurrency(selectedApplication.campaign_budget, selectedApplication.campaign_currency)}
                          </Text>
                        </View>
                        <View style={styles.detailGridItem}>
                          <Ionicons name="calendar-outline" size={20} color="#FF9800" />
                          <Text style={styles.detailGridLabel}>Deadline</Text>
                          <Text style={styles.detailGridValue}>
                            {formatDate(selectedApplication.campaign_deadline)}
                          </Text>
                        </View>
                        <View style={styles.detailGridItem}>
                          <Ionicons name="pricetag-outline" size={20} color="#667eea" />
                          <Text style={styles.detailGridLabel}>Category</Text>
                          <Text style={styles.detailGridValue}>
                            {selectedApplication.campaign_category || 'General'}
                          </Text>
                        </View>
                        <View style={styles.detailGridItem}>
                          <Ionicons name="flag-outline" size={20} color="#9C27B0" />
                          <Text style={styles.detailGridLabel}>Campaign Status</Text>
                          <Text style={styles.detailGridValue}>
                            {selectedApplication.campaign_status?.charAt(0).toUpperCase() + 
                             selectedApplication.campaign_status?.slice(1) || 'Active'}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>Timeline</Text>
                      <View style={styles.timelineItem}>
                        <Ionicons name="calendar-outline" size={20} color="#667eea" />
                        <View>
                          <Text style={styles.timelineLabel}>Applied On</Text>
                          <Text style={styles.timelineValue}>
                            {formatDate(selectedApplication.applied_at)}
                          </Text>
                        </View>
                      </View>
                      {selectedApplication.contract_signed_at && (
                        <View style={styles.timelineItem}>
                          <Ionicons name="document-text-outline" size={20} color="#9C27B0" />
                          <View>
                            <Text style={styles.timelineLabel}>Contract Signed</Text>
                            <Text style={styles.timelineValue}>
                              {formatDate(selectedApplication.contract_signed_at)}
                            </Text>
                          </View>
                        </View>
                      )}
                      {selectedApplication.media_submitted_at && (
                        <View style={styles.timelineItem}>
                          <Ionicons name="image-outline" size={20} color="#2196F3" />
                          <View>
                            <Text style={styles.timelineLabel}>Media Submitted</Text>
                            <Text style={styles.timelineValue}>
                              {formatDate(selectedApplication.media_submitted_at)}
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>

                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>Brand Information</Text>
                      <TouchableOpacity
                        style={styles.brandDetailCard}
                        onPress={() => {
                          setDetailModalVisible(false);
                          handleViewBrandProfile(
                            selectedApplication.brand_id,
                            selectedApplication.brand_name
                          );
                        }}
                      >
                        <ProfileImage
                          userId={selectedApplication.brand_id}
                          profileType="brand"
                          size={50}
                        />
                        <View style={styles.brandDetailInfo}>
                          <Text style={styles.brandDetailName}>
                            {selectedApplication.brand_name || 'Unknown Brand'}
                          </Text>
                          <Text style={styles.brandDetailEmail}>
                            {selectedApplication.brand_email || 'No email available'}
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#999" />
                      </TouchableOpacity>
                    </View>

                    {selectedApplication.message && (
                      <View style={styles.detailSection}>
                        <Text style={styles.detailSectionTitle}>Your Application Message</Text>
                        <View style={styles.messageCard}>
                          <Text style={styles.messageCardText}>
                            "{selectedApplication.message}"
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.closeModalButton} 
                onPress={() => setDetailModalVisible(false)}
              >
                <Text style={styles.closeModalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Contract Acceptance Dialog */}
      <ContractAcceptanceDialog
        visible={contractDialogVisible}
        application={selectedApplicationForContract}
        onClose={() => setContractDialogVisible(false)}
        onAccept={handleAcceptContract}
      />

      {/* Media Submission Dialog */}
      <MediaSubmissionDialog
        visible={mediaSubmissionVisible}
        application={selectedApplicationForMedia}
        onClose={() => setMediaSubmissionVisible(false)}
        onSubmit={handleSubmitMedia}
      />

      {/* Media Files Viewer */}
      <MediaFilesViewer
        visible={mediaFilesVisible}
        application={selectedApplication}
        onClose={() => setMediaFilesVisible(false)}
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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  refreshButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 40,
  },
  tabsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  tabActive: {
    backgroundColor: 'rgba(15, 110, 234, 0.1)',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginLeft: 6,
  },
  tabTextActive: {
    color: 'rgb(15, 110, 234)',
  },
  tabBadge: {
    backgroundColor: 'rgb(15, 110, 234)',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
    minWidth: 20,
    alignItems: 'center',
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFF',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  campaignImage: {
    width: '100%',
    height: 160,
  },
  imagePlaceholder: {
    width: '100%',
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardContent: {
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  brandSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  brandInfo: {
    marginLeft: 12,
    flex: 1,
  },
  brandName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  brandCategory: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginHorizontal: 4,
  },
  detailLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginTop: 2,
  },
  messageContainer: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  messageLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#667eea',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#F0F0F0',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    gap: 4,
  },
  viewButtonText: {
    fontSize: 13,
    color: '#667eea',
    fontWeight: '500',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    gap: 4,
  },
  contactButtonText: {
    fontSize: 13,
    color: '#667eea',
    fontWeight: '500',
  },
  mediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    gap: 4,
  },
  mediaButtonText: {
    fontSize: 13,
    color: '#2196F3',
    fontWeight: '500',
  },
  actionButtonContainer: {
    flex: 1,
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFF',
  },
  contractActionButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  mediaActionButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  waitingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
  },
  waitingText: {
    fontSize: 13,
    color: '#666',
  },
  completedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#E0F7FA',
    borderRadius: 8,
    gap: 6,
  },
  completedText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00BCD4',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
  },
  avatarPlaceholder: {
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  avatarImage: {
    backgroundColor: '#F0F0F0',
  },
  avatarLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
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
  errorText: {
    fontSize: 14,
    color: '#F44336',
    flex: 1,
    marginLeft: 12,
  },
  successText: {
    fontSize: 14,
    color: '#4CAF50',
    flex: 1,
    marginLeft: 12,
  },
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
  detailModalContent: {
    flex: 1,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  detailContent: {
    flex: 1,
  },
  detailBody: {
    padding: 20,
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  detailSection: {
    marginBottom: 24,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailGridItem: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  detailGridLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
  },
  detailGridValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 2,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    gap: 12,
  },
  timelineLabel: {
    fontSize: 12,
    color: '#666',
  },
  timelineValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  brandDetailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  brandDetailInfo: {
    flex: 1,
  },
  brandDetailName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  brandDetailEmail: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  messageCard: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  messageCardText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  modalActions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  closeModalButton: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeModalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  mediaForm: {
    padding: 20,
  },
  campaignTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  campaignBrand: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  pickMediaButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  pickMediaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  pickMediaText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  selectedFiles: {
    marginBottom: 20,
  },
  selectedFilesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    color: '#333',
  },
  fileSize: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#333',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    flex: 1,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  contractModal: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    marginHorizontal: 20,
    maxHeight: height * 0.9,
  },
  contractModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  contractModalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3E5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contractModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  contractModalClose: {
    padding: 8,
  },
  contractModalContent: {
    padding: 20,
  },
  contractSuccess: {
    alignItems: 'center',
    marginBottom: 24,
  },
  contractSuccessTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 12,
  },
  contractSuccessText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  contractDetails: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  contractDetailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  contractDetailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  contractDetailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    width: 80,
  },
  contractDetailValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  contractTerms: {
    marginBottom: 20,
  },
  contractTermsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  contractTermItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 10,
  },
  contractTermText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  contractNote: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 16,
  },
  contractModalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  contractCancelButton: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  contractCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  contractAcceptButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  contractAcceptButtonDisabled: {
    opacity: 0.7,
  },
  contractAcceptGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  contractAcceptText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaModalContainer: {
    backgroundColor: '#000',
    borderRadius: 20,
    width: width - 40,
    maxHeight: height - 100,
    overflow: 'hidden',
  },
  mediaModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  mediaModalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    flex: 1,
  },
  mediaModalClose: {
    padding: 8,
  },
  mediaModalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400,
  },
  mediaModalImage: {
    width: width - 80,
    height: height - 200,
  },
  mediaModalPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  mediaModalPlaceholderText: {
    color: '#FFF',
    fontSize: 16,
    marginTop: 16,
  },
  mediaModalLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  mediaModalDownload: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  mediaModalDownloadGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  mediaModalDownloadText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  mediaModalDescription: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  mediaModalDescriptionText: {
    color: '#CCC',
    fontSize: 14,
  },
  
  mediaInfo: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  mediaCampaignTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  mediaDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  mediaGrid: {
    padding: 16,
  },
  mediaCard: {
    flex: 1,
    margin: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    overflow: 'hidden',
  },
  mediaCardContent: {
    padding: 12,
    alignItems: 'center',
  },
  mediaIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E8EAF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  mediaFilename: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    marginTop: 8,
  },
  mediaSize: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
  mediaDescription: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default InfluencerApplicationsScreen;