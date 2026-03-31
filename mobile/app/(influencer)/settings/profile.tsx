// C:\Sagadevan\quickbox\mobile\app\(influencer)\profile\index.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
  RefreshControl,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Linking,
  Platform,
  Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import profileAPI from '../../../services/profileAPI';

const { width, height } = Dimensions.get('window');

// Types
interface User {
  _id: string;
  user_name?: string;
  username?: string;
  email?: string;
  profile_picture?: string;
}

interface Post {
  _id: string;
  caption?: string;
  media: Array<{ id: string; type?: string }>;
  likes: User[];
  comments: Array<{
    user_id: string;
    user_name: string;
    profile_picture?: string;
    comment: string;
    created_at: string;
  }>;
  views: User[];
  created_at: string;
}

interface Profile {
  _id: string;
  id?: string;
  full_name?: string;
  nickname?: string;
  bio?: string;
  email?: string;
  phone_number?: string;
  website?: string;
  location?: string;
  profile_picture?: string;
  bg_image?: string;
  social_links?: Record<string, string>;
}

// Helper Components
const ProfileImage = ({ uri, size = 80, onPress }: { uri?: string; size?: number; onPress?: () => void }) => {
  const [error, setError] = useState(false);

  if (!uri || error) {
    return (
      <TouchableOpacity onPress={onPress} disabled={!onPress}>
        <View
          style={[styles.profileImagePlaceholder, { width: size, height: size, borderRadius: size / 2, backgroundColor: '#0f6eea' }]}
        >
          <Ionicons name="person-outline" size={size * 0.5} color="#FFF" />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <Image
        source={{ uri }}
        style={[styles.profileImage, { width: size, height: size, borderRadius: size / 2 }]}
        onError={() => setError(true)}
      />
    </TouchableOpacity>
  );
};

const BackgroundImage = ({ uri, height = 120 }: { uri?: string; height?: number }) => {
  const [error, setError] = useState(false);

  if (!uri || error) {
    return (
      <View
        style={[styles.backgroundImage, { height, backgroundColor: '#0f6eea' }]}
      />
    );
  }

  return (
    <Image
      source={{ uri }}
      style={[styles.backgroundImage, { height }]}
      onError={() => setError(true)}
    />
  );
};

const StatButton = ({ value, label, onPress }: { value: number; label: string; onPress?: () => void }) => (
  <TouchableOpacity style={styles.statItem} onPress={onPress} disabled={!onPress}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </TouchableOpacity>
);

const InfoRow = ({ icon, label, value, onPress, isLink }: { icon: string; label: string; value?: string; onPress?: () => void; isLink?: boolean }) => {
  if (!value) return null;

  return (
    <TouchableOpacity style={styles.infoRow} onPress={onPress} disabled={!onPress}>
      <Ionicons name={icon as any} size={18} color="#666" />
      <Text style={[styles.infoText, isLink && styles.linkText]} numberOfLines={1}>
        {value}
      </Text>
    </TouchableOpacity>
  );
};

const SocialLink = ({ platform, url }: { platform: string; url: string }) => {
  const getIcon = () => {
    switch (platform) {
      case 'instagram': return 'logo-instagram';
      case 'youtube': return 'logo-youtube';
      case 'tiktok': return 'logo-tiktok';
      case 'linkedin': return 'logo-linkedin';
      case 'facebook': return 'logo-facebook';
      default: return 'link-outline';
    }
  };

  const getColor = () => {
    switch (platform) {
      case 'instagram': return '#E4405F';
      case 'youtube': return '#FF0000';
      case 'tiktok': return '#000000';
      case 'linkedin': return '#0077B5';
      case 'facebook': return '#1877F2';
      default: return '#667eea';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.socialLink, { backgroundColor: getColor() + '20' }]}
      onPress={() => Linking.openURL(url)}
    >
      <Ionicons name={getIcon() as any} size={20} color={getColor()} />
      <Text style={[styles.socialLinkText, { color: getColor() }]}>
        {platform.charAt(0).toUpperCase() + platform.slice(1)}
      </Text>
    </TouchableOpacity>
  );
};

const PostCard = ({ post, profile, onLike, onComment, onView, onOpenLikes, onOpenViews, onShare, currentUserId }: {
  post: Post;
  profile: Profile;
  onLike: () => void;
  onComment: (text: string) => void;
  onView: () => void;
  onOpenLikes: () => void;
  onOpenViews: () => void;
  onShare: () => void;
  currentUserId: string;
}) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [viewsCount, setViewsCount] = useState(0);

  useEffect(() => {
    setIsLiked(post.likes?.some(like => like._id === currentUserId) || false);
    setLikesCount(post.likes?.length || 0);
    setCommentsCount(post.comments?.length || 0);
    setViewsCount(post.views?.length || 0);
  }, [post, currentUserId]);

  const handleLike = () => {
    onLike();
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleSubmitComment = () => {
    if (commentText.trim()) {
      onComment(commentText);
      setCommentText('');
      setCommentsCount(prev => prev + 1);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderMedia = () => {
    if (!post.media || post.media.length === 0) return null;

    const mediaCount = post.media.length;
    const isVideo = (media: any) => media.type?.startsWith('video') || media.id?.includes('video');

    return (
      <View style={[styles.postMediaGrid, styles[`grid${Math.min(mediaCount, 4)}` as keyof typeof styles]]}>
        {post.media.slice(0, 4).map((media, index) => {
          const imageUrl = `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000'}/profiles/image/${media.id}`;

          if (isVideo(media)) {
            return (
              <TouchableOpacity key={index} onPress={onView} style={styles.mediaItem}>
                <View style={styles.videoOverlay}>
                  <Ionicons name="play-circle" size={40} color="#FFF" />
                </View>
                <Image source={{ uri: imageUrl }} style={styles.mediaImage} />
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity key={index} onPress={onView} style={styles.mediaItem}>
              <Image source={{ uri: imageUrl }} style={styles.mediaImage} />
            </TouchableOpacity>
          );
        })}
        {mediaCount > 4 && (
          <TouchableOpacity onPress={onView} style={styles.moreMediaOverlay}>
            <Text style={styles.moreMediaText}>+{mediaCount - 4}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.postCard}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <ProfileImage uri={profile.profile_picture ? `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000'}/profiles/image/${profile.profile_picture}` : undefined} size={40} />
        <View style={styles.postHeaderInfo}>
          <Text style={styles.postAuthorName}>{profile.full_name || 'Influencer'}</Text>
          {profile.nickname && <Text style={styles.postNickname}>@{profile.nickname}</Text>}
          <Text style={styles.postDate}>{formatDate(post.created_at)}</Text>
        </View>
      </View>

      {/* Caption */}
      {post.caption && (
        <Text style={styles.postCaption}>{post.caption}</Text>
      )}

      {/* Media */}
      {renderMedia()}

      {/* Stats Bar */}
      <View style={styles.postStatsBar}>
        <TouchableOpacity onPress={onOpenLikes} style={styles.statButton}>
          <Text style={styles.statButtonText}>{likesCount} likes</Text>
        </TouchableOpacity>
        <View style={styles.statsRight}>
          <TouchableOpacity onPress={() => setShowComments(!showComments)} style={styles.statButton}>
            <Text style={styles.statButtonText}>{commentsCount} comments</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onOpenViews} style={styles.statButton}>
            <Text style={styles.statButtonText}>{viewsCount} views</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.postActions}>
        <TouchableOpacity style={[styles.actionButton, isLiked && styles.actionButtonLiked]} onPress={handleLike}>
          <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={22} color={isLiked ? '#F44336' : '#666'} />
          <Text style={[styles.actionButtonText, isLiked && styles.actionButtonTextLiked]}>Like</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => setShowComments(!showComments)}>
          <Ionicons name="chatbubble-outline" size={22} color="#666" />
          <Text style={styles.actionButtonText}>Comment</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onShare}>
          <Ionicons name="share-outline" size={22} color="#666" />
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>
      </View>

      {/* Comments Section */}
      {showComments && (
        <View style={styles.commentsSection}>
          <FlatList
            data={post.comments}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.commentItem}>
                <ProfileImage
                  uri={item.profile_picture ? `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000'}/profiles/image/${item.profile_picture}` : undefined}
                  size={32}
                />
                <View style={styles.commentContent}>
                  <Text style={styles.commentAuthor}>{item.user_name}</Text>
                  <Text style={styles.commentText}>{item.comment}</Text>
                  <Text style={styles.commentTime}>{formatDate(item.created_at)}</Text>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.noCommentsText}>No comments yet. Be the first to comment!</Text>
            }
          />

          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Write a comment..."
              value={commentText}
              onChangeText={setCommentText}
              multiline
            />
            <TouchableOpacity style={styles.commentSubmitButton} onPress={handleSubmitComment}>
              <Text style={styles.commentSubmitText}>Post</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

// Users Modal Component
const UsersModal = ({ visible, title, users, onClose }: {
  visible: boolean;
  title: string;
  users: User[];
  onClose: () => void;
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={users}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <View style={styles.userItem}>
                <ProfileImage
                  uri={item.profile_picture ? `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000'}/profiles/image/${item.profile_picture}` : undefined}
                  size={40}
                />
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{item.user_name || item.username || 'Unknown User'}</Text>
                  {item.email && <Text style={styles.userEmail}>{item.email}</Text>}
                </View>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.noUsersText}>No users yet.</Text>
            }
          />
        </View>
      </View>
    </Modal>
  );
};

// Delete Confirmation Dialog
const DeleteConfirmationDialog = ({ visible, onClose, onConfirm, name }: {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  name: string;
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.dialogContainer}>
          <View style={styles.dialogWarningIcon}>
            <Ionicons name="alert-circle" size={48} color="#F44336" />
          </View>

          <Text style={styles.dialogTitle}>Delete Influencer Profile</Text>

          <Text style={styles.dialogMessage}>
            Are you sure you want to delete <Text style={styles.dialogName}>"{name}"</Text> profile?
          </Text>

          <View style={styles.dialogRisks}>
            <Text style={styles.dialogRisksTitle}>This action cannot be undone and will permanently:</Text>
            <Text style={styles.dialogRiskItem}>• Delete all your influencer information</Text>
            <Text style={styles.dialogRiskItem}>• Remove your profile from search results</Text>
            <Text style={styles.dialogRiskItem}>• Cancel any ongoing collaborations</Text>
            <Text style={styles.dialogRiskItem}>• Delete your profile assets and images</Text>
          </View>

          <View style={styles.dialogActions}>
            <TouchableOpacity style={styles.dialogButtonDanger} onPress={onConfirm}>
              <Text style={styles.dialogButtonText}>Yes, Delete Permanently</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dialogButtonSecondary} onPress={onClose}>
              <Text style={styles.dialogButtonSecondaryText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Post Preview Modal
const PostPreviewModal = ({ visible, post, onClose }: { visible: boolean; post: Post | null; onClose: () => void }) => {
  if (!post) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const getImageUrl = (fileId: string) => `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000'}/profiles/image/${fileId}`;

  const renderMedia = () => {
    if (!post.media || post.media.length === 0) return null;

    return (
      <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.previewMediaContainer}>
        {post.media.map((media, index) => {
          const isVideo = media.type?.startsWith('video');
          const url = getImageUrl(media.id);

          if (isVideo) {
            return (
              <View key={index} style={styles.previewMediaItem}>
                <Ionicons name="play-circle" size={60} color="#FFF" />
                <Text style={styles.previewVideoText}>Video Preview</Text>
              </View>
            );
          }

          return (
            <Image key={index} source={{ uri: url }} style={styles.previewMediaImage} resizeMode="contain" />
          );
        })}
      </ScrollView>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.previewModalContent}>
          <TouchableOpacity style={styles.previewCloseButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#FFF" />
          </TouchableOpacity>

          <ScrollView style={styles.previewScrollView}>
            {renderMedia()}

            <View style={styles.previewDetails}>
              <Text style={styles.previewCaption}>{post.caption || 'No caption'}</Text>
              <Text style={styles.previewDate}>{formatDate(post.created_at)}</Text>

              <View style={styles.previewStats}>
                <Text style={styles.previewStat}>{post.likes?.length || 0} likes</Text>
                <Text style={styles.previewStat}>{post.comments?.length || 0} comments</Text>
                <Text style={styles.previewStat}>{post.views?.length || 0} views</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// Create Post Modal
const CreatePostModal = ({ visible, onClose, onSubmit, loading }: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (media: any[], caption: string) => Promise<void>;
  loading: boolean;
}) => {
  const [caption, setCaption] = useState('');
  const [media, setMedia] = useState<any[]>([]);
  const [preview, setPreview] = useState(false);
  const [postData, setPostData] = useState<{ media: any[]; caption: string } | null>(null);

  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const selectedMedia = result.assets.map(asset => ({
        uri: asset.uri,
        type: asset.type || 'image/jpeg',
        fileName: asset.fileName || `photo_${Date.now()}.jpg`,
        mimeType: asset.mimeType,
      }));
      setMedia(prev => [...prev, ...selectedMedia]);
    }
  };

  const removeMedia = (index: number) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
  };

  const handlePreview = () => {
    if (media.length === 0 && !caption.trim()) {
      Alert.alert('Error', 'Please add media or a caption');
      return;
    }
    setPostData({ media, caption });
    setPreview(true);
  };

  const handleSubmit = async () => {
    if (postData) {
      await onSubmit(postData.media, postData.caption);
      setCaption('');
      setMedia([]);
      setPostData(null);
      setPreview(false);
      onClose();
    }
  };

  const renderMediaPreview = () => {
    if (media.length === 0) return null;

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.createPostMediaPreview}>
        {media.map((item, index) => (
          <View key={index} style={styles.previewItem}>
            <Image source={{ uri: item.uri }} style={styles.previewImage} />
            <TouchableOpacity style={styles.removeMediaButton} onPress={() => removeMedia(index)}>
              <Ionicons name="close-circle" size={24} color="#F44336" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    );
  };

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.createPostModal}>
            <View style={styles.createPostHeader}>
              <Text style={styles.createPostTitle}>Create Post</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.createPostContent}>
              <TextInput
                style={styles.createPostInput}
                placeholder="What's on your mind?"
                multiline
                numberOfLines={4}
                value={caption}
                onChangeText={setCaption}
              />

              {renderMediaPreview()}

              <TouchableOpacity style={styles.addMediaButton} onPress={pickMedia}>
                <View
                  style={[styles.addMediaGradient, { backgroundColor: '#0f6eea' }]}
                >
                  <Ionicons name="add-circle-outline" size={24} color="#FFF" />
                  <Text style={styles.addMediaText}>Add Media</Text>
                </View>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.createPostActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.previewButton} onPress={handlePreview}>
                <Text style={styles.previewButtonText}>Preview</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Preview Modal */}
      <Modal
        visible={preview}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPreview(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.previewConfirmModal}>
            <View style={styles.previewConfirmHeader}>
              <Text style={styles.previewConfirmTitle}>Preview Post</Text>
              <TouchableOpacity onPress={() => setPreview(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.previewConfirmContent}>
              {postData?.caption && (
                <Text style={styles.previewConfirmCaption}>{postData.caption}</Text>
              )}

              {postData?.media && postData.media.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.previewConfirmMedia}>
                  {postData.media.map((item, index) => (
                    item.type?.startsWith('video') ? (
                      <View key={index} style={styles.previewConfirmVideoPlaceholder}>
                        <Ionicons name="play-circle" size={48} color="#667eea" />
                      </View>
                    ) : (
                      <Image key={index} source={{ uri: item.uri }} style={styles.previewConfirmImage} />
                    )
                  ))}
                </ScrollView>
              )}
            </ScrollView>

            <View style={styles.previewConfirmActions}>
              <TouchableOpacity style={styles.previewConfirmCancel} onPress={() => setPreview(false)}>
                <Text style={styles.previewConfirmCancelText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.previewConfirmSubmit} onPress={handleSubmit} disabled={loading}>
                <View
                  style={[styles.previewConfirmGradient, { backgroundColor: '#0f6eea' }]}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <Text style={styles.previewConfirmSubmitText}>Confirm & Post</Text>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

// Main Component
const InfluencerProfileScreen = ({ navigation }: any) => {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalUsers, setModalUsers] = useState<User[]>([]);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [createPostVisible, setCreatePostVisible] = useState(false);
  const [previewPost, setPreviewPost] = useState<Post | null>(null);
  const [posting, setPosting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');

  const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

  const getImageUrl = (fileId: string) => `${API_BASE_URL}/profiles/image/${fileId}`;

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await profileAPI.getMyProfile();

      if (response.type !== 'influencer') {
        Alert.alert('Error', 'No influencer profile found');
        return;
      }

      setProfile(response.profile);
      const profileId = response.profile._id || response.profile.id;
      await fetchFollowersAndFollowing(profileId);
      await fetchPosts(profileId);

      // Get current user ID
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setCurrentUserId(user._id || user.id);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchFollowersAndFollowing = async (userId: string) => {
    try {
      const [followersData, followingData] = await Promise.all([
        profileAPI.getFollowers(userId),
        profileAPI.getFollowing(userId)
      ]);
      setFollowers(followersData);
      setFollowing(followingData);
    } catch (error) {
      console.error('Error fetching followers/following:', error);
    }
  };

  const fetchPosts = async (userId: string) => {
    try {
      const data = await profileAPI.getUserPosts(userId);
      const sortedPosts = (data || []).sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setPosts(sortedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleCreatePost = async (media: any[], caption: string) => {
    setPosting(true);
    try {
      await profileAPI.createPost(media, caption);
      if (profile) {
        await fetchPosts(profile._id || profile.id);
      }
      Alert.alert('Success', 'Post created successfully!');
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post');
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!postId) return;
    try {
      await profileAPI.likePost(postId);
      if (profile) {
        await fetchPosts(profile._id || profile.id || '');
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async (postId: string, comment: string) => {
    if (!postId || !comment) return;
    try {
      await profileAPI.commentPost(postId, comment);
      if (profile) {
        await fetchPosts(profile._id || profile.id || '');
      }
    } catch (error) {
      console.error('Error commenting:', error);
    }
  };

  const handleViewPost = async (postId: string) => {
    if (!postId) return;
    try {
      await profileAPI.viewPost(postId);
    } catch (error) {
      console.error('Error viewing post:', error);
    }
  };

  const handleOpenLikes = async (postId: string) => {
    try {
      const users = await profileAPI.getPostLikes(postId);
      setModalTitle('Likes');
      setModalUsers(users);
      setModalVisible(true);
    } catch (error) {
      console.error('Error fetching likes:', error);
    }
  };

  const handleOpenViews = async (postId: string) => {
    try {
      const users = await profileAPI.getPostViews(postId);
      setModalTitle('Views');
      setModalUsers(users);
      setModalVisible(true);
    } catch (error) {
      console.error('Error fetching views:', error);
    }
  };

  const handleShare = async (post: Post) => {
    try {
      const postUrl = `${API_BASE_URL}/posts/${post._id}`;
      const message = post.caption ? `${post.caption}\n\n${postUrl}` : postUrl;

      await Share.share({
        message,
        url: postUrl,
        title: 'Share Post',
      });
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share post');
    }
  };

  const handleDeleteProfile = async () => {
    try {
      await profileAPI.deleteProfile('influencer');
      Alert.alert('Success', 'Your influencer profile has been permanently deleted.');
      navigation.navigate('InfluencerRegister');
    } catch (error) {
      console.error('Error deleting profile:', error);
      Alert.alert('Error', 'Failed to delete profile');
    } finally {
      setDeleteDialogVisible(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProfile();
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>No influencer profile found.</Text>
      </View>
    );
  }

  const socialLinks = profile.social_links || {};
  const profileId = profile._id || profile.id;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#667eea']} />
        }
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <BackgroundImage uri={profile.bg_image ? getImageUrl(profile.bg_image) : undefined} height={120} />

          <View style={styles.profileImageContainer}>
            <ProfileImage
              uri={profile.profile_picture ? getImageUrl(profile.profile_picture) : undefined}
              size={100}
            />
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile.full_name || 'Influencer Name'}</Text>
            {profile.nickname && <Text style={styles.profileNickname}>@{profile.nickname}</Text>}

            {profile.bio && (
              <Text style={styles.profileBio}>{profile.bio}</Text>
            )}
          </View>

          <View style={styles.statsContainer}>
            <StatButton
              value={followers.length}
              label="Followers"
              onPress={() => router.push({
                pathname: `/(shared)/connections/${profileId}`,
                params: { type: 'followers' }
              })}
            />
            <StatButton
              value={following.length}
              label="Following"
              onPress={() => router.push({
                pathname: `/(shared)/connections/${profileId}`,
                params: { type: 'following' }
              })}
            />
            <StatButton value={posts.length} label="Posts" />
          </View>

          {/* Contact Info */}
          <View style={styles.infoSection}>
            <InfoRow icon="mail-outline" label="Email" value={profile.email} />
            <InfoRow icon="call-outline" label="Phone" value={profile.phone_number} />
            <InfoRow icon="globe-outline" label="Website" value={profile.website} isLink onPress={() => profile.website && Linking.openURL(profile.website)} />
            <InfoRow icon="location-outline" label="Location" value={profile.location} />
          </View>

          {/* Social Links */}
          {Object.keys(socialLinks).length > 0 && (
            <View style={styles.socialSection}>
              <Text style={styles.sectionTitle}>Social Media</Text>
              <View style={styles.socialGrid}>
                {Object.entries(socialLinks).map(([platform, url]) =>
                  url ? <SocialLink key={platform} platform={platform} url={url} /> : null
                )}
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('InfluencerRegister')}>
              <Ionicons name="create-outline" size={20} color="#FFF" />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteButton} onPress={() => setDeleteDialogVisible(true)}>
              <Ionicons name="trash-outline" size={20} color="#F44336" />
              <Text style={styles.deleteButtonText}>Delete Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Create Post Button */}
        <View style={styles.createPostSection}>
          <TouchableOpacity style={styles.createPostTrigger} onPress={() => setCreatePostVisible(true)}>
            <Text style={styles.createPostTriggerText}>What's on your mind?</Text>
          </TouchableOpacity>
        </View>

        {/* Posts Feed */}
        <View style={styles.postsFeed}>
          {posts.length === 0 ? (
            <View style={styles.noPostsCard}>
              <Ionicons name="chatbubble-outline" size={48} color="#CCC" />
              <Text style={styles.noPostsText}>No posts yet. Share your first post!</Text>
            </View>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                profile={profile}
                onLike={() => handleLike(post._id)}
                onComment={(text) => handleComment(post._id, text)}
                onView={() => {
                  handleViewPost(post._id);
                  setPreviewPost(post);
                }}
                onOpenLikes={() => handleOpenLikes(post._id)}
                onOpenViews={() => handleOpenViews(post._id)}
                onShare={() => handleShare(post)}
                currentUserId={currentUserId}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Users Modal */}
      <UsersModal
        visible={modalVisible}
        title={modalTitle}
        users={modalUsers}
        onClose={() => setModalVisible(false)}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        visible={deleteDialogVisible}
        onClose={() => setDeleteDialogVisible(false)}
        onConfirm={handleDeleteProfile}
        name={profile.full_name || profile.nickname || 'your'}
      />

      {/* Post Preview Modal */}
      <PostPreviewModal
        visible={!!previewPost}
        post={previewPost}
        onClose={() => setPreviewPost(null)}
      />

      {/* Create Post Modal */}
      <CreatePostModal
        visible={createPostVisible}
        onClose={() => setCreatePostVisible(false)}
        onSubmit={handleCreatePost}
        loading={posting}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
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
  profileHeader: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 20,
  },
  backgroundImage: {
    width: '100%',
    height: 120,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginTop: -50,
    marginBottom: 12,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#FFF',
  },
  profileImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFF',
  },
  profileInfo: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  profileNickname: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  profileBio: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  infoSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  linkText: {
    color: '#667eea',
  },
  socialSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  socialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  socialLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  socialLinkText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#667eea',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#F44336',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F44336',
  },
  createPostSection: {
    padding: 16,
  },
  createPostTrigger: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  createPostTriggerText: {
    fontSize: 16,
    color: '#999',
  },
  postsFeed: {
    padding: 16,
    gap: 20,
  },
  noPostsCard: {
    backgroundColor: '#FFF',
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
  },
  noPostsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  postCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  postHeaderInfo: {
    flex: 1,
  },
  postAuthorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  postNickname: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  postDate: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  postCaption: {
    fontSize: 14,
    color: '#333',
    paddingHorizontal: 16,
    paddingBottom: 12,
    lineHeight: 20,
  },
  postMediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  grid1: {
    height: 300,
  },
  grid2: {
    height: 150,
  },
  grid3: {
    height: 150,
  },
  grid4: {
    height: 150,
  },
  mediaItem: {
    flex: 1,
    position: 'relative',
    margin: 1,
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
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
  moreMediaOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  moreMediaText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  postStatsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  statButton: {
    paddingHorizontal: 8,
  },
  statButtonText: {
    fontSize: 12,
    color: '#666',
  },
  statsRight: {
    flexDirection: 'row',
    gap: 16,
  },
  postActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionButtonLiked: {
    opacity: 1,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#666',
  },
  actionButtonTextLiked: {
    color: '#F44336',
  },
  commentsSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  commentItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentAuthor: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  commentText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  commentTime: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  noCommentsText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 12,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    maxHeight: 80,
  },
  commentSubmitButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  commentSubmitText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    width: width - 40,
    maxHeight: height * 0.8,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  userEmail: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  noUsersText: {
    textAlign: 'center',
    padding: 20,
    color: '#666',
  },
  dialogContainer: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    width: width - 40,
    maxWidth: 320,
  },
  dialogWarningIcon: {
    alignItems: 'center',
    marginBottom: 16,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  dialogMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  dialogName: {
    fontWeight: 'bold',
    color: '#333',
  },
  dialogRisks: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  dialogRisksTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F44336',
    marginBottom: 8,
  },
  dialogRiskItem: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
  dialogActions: {
    flexDirection: 'row',
    gap: 12,
  },
  dialogButtonDanger: {
    flex: 1,
    backgroundColor: '#F44336',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  dialogButtonSecondary: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  dialogButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  dialogButtonSecondaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  previewModalContent: {
    flex: 1,
    backgroundColor: '#000',
    width: width,
  },
  previewCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  previewScrollView: {
    flex: 1,
  },
  previewMediaContainer: {
    height: height * 0.6,
  },
  previewMediaItem: {
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  previewMediaImage: {
    width: width,
    height: height * 0.6,
  },
  previewVideoText: {
    color: '#FFF',
    marginTop: 12,
  },
  previewDetails: {
    backgroundColor: '#FFF',
    padding: 20,
  },
  previewCaption: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 12,
  },
  previewDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  previewStats: {
    flexDirection: 'row',
    gap: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  previewStat: {
    fontSize: 14,
    color: '#666',
  },
  createPostModal: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    width: width - 20,
    maxHeight: height * 0.9,
    overflow: 'hidden',
  },
  createPostHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  createPostTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  createPostContent: {
    padding: 16,
  },
  createPostInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  createPostMediaPreview: {
    flexDirection: 'row',
    marginTop: 12,
  },
  previewItem: {
    position: 'relative',
    marginRight: 8,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeMediaButton: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  addMediaButton: {
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  addMediaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  addMediaText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  createPostActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  previewButton: {
    flex: 1,
    backgroundColor: '#667eea',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  previewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  previewConfirmModal: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    width: width - 40,
    maxHeight: height * 0.8,
    overflow: 'hidden',
  },
  previewConfirmHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  previewConfirmTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  previewConfirmContent: {
    padding: 16,
  },
  previewConfirmCaption: {
    fontSize: 14,
    color: '#333',
    marginBottom: 16,
  },
  previewConfirmMedia: {
    flexDirection: 'row',
  },
  previewConfirmImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 8,
  },
  previewConfirmVideoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  previewConfirmActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  previewConfirmCancel: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  previewConfirmCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  previewConfirmSubmit: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewConfirmGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  previewConfirmSubmitText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
});

export default InfluencerProfileScreen;