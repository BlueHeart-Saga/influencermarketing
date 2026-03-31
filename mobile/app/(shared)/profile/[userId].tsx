import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Modal,
  TextInput,
  Alert,
  Linking,
  Share,
  Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../../contexts/AuthContext';
import profileAPI from '../../../services/profileAPI';
import { Video } from 'expo-video';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import { Feather, Ionicons, AntDesign, FontAwesome } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Profile {
  _id?: string;
  id?: string;
  company_name?: string;
  full_name?: string;
  nickname?: string;
  logo?: string;
  profile_picture?: string;
  bg_image?: string;
  bio?: string;
  location?: string;
  email?: string;
  phone_number?: string;
  website?: string;
  categories?: string[];
  social_links?: Record<string, string>;
  contact_person_name?: string;
  target_audience?: string;
  created_at?: string;
  updated_at?: string;
}

interface Post {
  _id: string;
  id?: string;
  user_id: string;
  media: any[];
  caption?: string;
  likes: any[];
  comments: any[];
  views: any[];
  created_at: string;
}

interface Comment {
  user_id: string;
  user_name: string;
  profile_picture?: string;
  comment: string;
  created_at: string;
}

const ProfileScreen = () => {
  const { userId } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated, user: currentUser } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [profileType, setProfileType] = useState<'brand' | 'influencer'>('influencer');

  // Modal states
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentToggles, setCommentToggles] = useState<Record<string, boolean>>({});
  const lastTaps = useRef<Record<string, number>>({});
  const [showBigHeart, setShowBigHeart] = useState<string | null>(null);
  const bigHeartScale = useRef(new Animated.Value(0)).current;
  const smallHeartScale = useRef(new Animated.Value(1)).current;

  // Get image URL
  const getImageUrl = (fileId: string) => {
    if (!fileId) return 'https://via.placeholder.com/150';
    return `${profileAPI.BASE_URL}/profiles/image/${fileId}`;
  };

  // Fetch profile data
  const fetchProfileData = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);

      // Fetch profile
      const profileRes = await profileAPI.getProfileById(userId as string);
      const fetchedProfile = profileRes.profile || profileRes;

      if (!fetchedProfile) {
        throw new Error('Profile not found');
      }

      setProfile(fetchedProfile);
      setProfileType(fetchedProfile.company_name ? 'brand' : 'influencer');

      // Fetch posts and connections in parallel
      const [postsData, followersData, followingData] = await Promise.all([
        profileAPI.getUserPosts(userId as string),
        profileAPI.getFollowers(userId as string),
        profileAPI.getFollowing(userId as string),
      ]);

      setPosts(postsData || []);
      setFollowersCount(followersData.length);
      setFollowingCount(followingData.length);

      // Check if current user is following this profile
      if (isAuthenticated && currentUser) {
        const currentUserId = currentUser._id || currentUser.id;
        if (currentUserId !== userId) {
          const myFollowing = await profileAPI.getFollowing(currentUserId);
          const isUserFollowing = myFollowing.some((f: any) =>
            (f._id || f.id) === userId
          );
          setIsFollowing(isUserFollowing);
        }
      }

    } catch (err) {
      console.error('Error fetching profile:', err);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId, isAuthenticated, currentUser]);

  // Initial load
  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProfileData();
  }, [fetchProfileData]);

  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to follow users');
      return;
    }

    if (!userId) return;

    try {
      if (isFollowing) {
        await profileAPI.unfollowUser(userId as string);
      } else {
        await profileAPI.followUser(userId as string);
      }

      setIsFollowing(!isFollowing);
      setFollowersCount(prev => isFollowing ? prev - 1 : prev + 1);

    } catch (err) {
      console.error('Failed to follow/unfollow:', err);
      Alert.alert('Error', 'Failed to update follow status');
    }
  };

  // Handle like
  const handleLike = async (postId: string, currentlyLiked: boolean) => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to like posts');
      return;
    }

    try {
      await profileAPI.likePost(postId);

      // Update posts state
      setPosts(prev => prev.map(post => {
        if ((post._id || post.id) === postId) {
          const updatedLikes = currentlyLiked
            ? post.likes.filter(like =>
              (like.user_id || like._id) !== (currentUser?._id || currentUser?.id)
            )
            : [...post.likes, {
              user_id: currentUser?._id || currentUser?.id,
              user_name: currentUser?.name || 'You',
              liked_at: new Date().toISOString()
            }];

          return {
            ...post,
            likes: updatedLikes,
          };
        }
        return post;
      }));

    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const animateBigHeart = () => {
    bigHeartScale.setValue(0);
    Animated.sequence([
      Animated.spring(bigHeartScale, {
        toValue: 1.5,
        friction: 3,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.delay(300),
      Animated.timing(bigHeartScale, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => setShowBigHeart(null));
  };

  const animateSmallHeart = () => {
    smallHeartScale.setValue(0.5);
    Animated.spring(smallHeartScale, {
      toValue: 1,
      friction: 4,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  // Handle comment
  const handleComment = async (postId: string) => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to comment');
      return;
    }

    if (!commentText.trim() || !selectedPost) return;

    setSubmittingComment(true);
    try {
      await profileAPI.commentPost(postId, commentText);

      // Refresh the specific post
      const updatedPosts = await profileAPI.getUserPosts(userId as string);
      const refreshedPost = updatedPosts.find((p: Post) =>
        (p._id || p.id) === postId
      );

      if (refreshedPost) {
        setPosts(prev => prev.map(post =>
          (post._id || post.id) === postId ? refreshedPost : post
        ));

        setSelectedPost(refreshedPost);
      }

      setCommentText('');
    } catch (err) {
      console.error('Error commenting:', err);
      Alert.alert('Error', 'Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  // Handle share
  const handleShare = async (post: Post) => {
    try {
      const postUrl = `${profileAPI.BASE_URL}/posts/${post._id || post.id}`;
      const message = post.caption ? `${post.caption}\n\n${postUrl}` : postUrl;

      const result = await Share.share({
        message,
        url: postUrl, // URL on iOS
        title: 'Share Post',
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (err) {
      console.error('Error sharing:', err);
      Alert.alert('Error', 'Failed to share post');
    }
  };

  const tapTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleMediaPress = (post: Post, hasLiked: boolean) => {
    const postId = post._id || post.id || '';
    const now = Date.now();

    if (lastTaps.current[postId] && now - lastTaps.current[postId] < 400) {
      if (tapTimeout.current) {
        clearTimeout(tapTimeout.current);
        tapTimeout.current = null;
      }
      if (!hasLiked) {
        handleLike(postId, false);
        animateSmallHeart();
      }
      setShowBigHeart(postId);
      animateBigHeart();
    } else {
      if (tapTimeout.current) clearTimeout(tapTimeout.current);
      tapTimeout.current = setTimeout(() => {
        openPostModal(post);
        tapTimeout.current = null;
      }, 300);
    }
    lastTaps.current[postId] = now;
  };

  // Open post modal
  const openPostModal = (post: Post) => {
    setSelectedPost(post);
    setModalVisible(true);
  };

  // Toggle comments section
  const toggleComments = (postId: string) => {
    setCommentToggles(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  // Render comment
  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentItem}>
      {item.profile_picture ? (
        <Image
          source={{ uri: getImageUrl(item.profile_picture) }}
          style={styles.commentAvatar}
        />
      ) : (
        <View style={styles.commentAvatarPlaceholder}>
          <Feather name="user" size={16} color="#999" />
        </View>
      )}
      <View style={styles.commentContent}>
        <Text style={styles.commentAuthor}>{item.user_name}</Text>
        <Text style={styles.commentText}>{item.comment}</Text>
        <Text style={styles.commentTime}>{formatDate(item.created_at)}</Text>
      </View>
    </View>
  );

  // Render post
  const renderPost = ({ item }: { item: Post }) => {
    const postId = item._id || item.id;
    const hasLiked = item.likes?.some(like =>
      (like.user_id || like._id) === (currentUser?._id || currentUser?.id)
    );
    const showComments = commentToggles[postId];

    const mediaItem = item.media?.[0];
    const isVideo = mediaItem?.type?.startsWith('video') ||
      mediaItem?.toString().includes('video');

    return (
      <View style={styles.postCard}>
        {/* Post Header */}
        <TouchableOpacity
          style={styles.postHeader}
          onPress={() => openPostModal(item)}
        >
          {profile?.logo || profile?.profile_picture ? (
            <Image
              source={{ uri: getImageUrl(profile?.logo || profile?.profile_picture || '') }}
              style={styles.postAuthorAvatar}
            />
          ) : (
            <View style={styles.postAuthorAvatarPlaceholder}>
              <Feather name="user" size={20} color="#999" />
            </View>
          )}
          <View style={styles.postAuthorInfo}>
            <Text style={styles.postAuthorName}>
              {profile?.company_name || profile?.full_name || profile?.nickname || 'User'}
            </Text>
            <Text style={styles.postTime}>{formatDate(item.created_at)}</Text>
          </View>
        </TouchableOpacity>

        {/* Post Caption */}
        {item.caption && (
          <TouchableOpacity
            style={styles.postCaption}
            onPress={() => openPostModal(item)}
          >
            <Text style={styles.postCaptionText}>{item.caption}</Text>
          </TouchableOpacity>
        )}

        {/* Post Media */}
        {item.media && item.media.length > 0 && (
          <TouchableOpacity
            style={styles.postMediaContainer}
            onPress={() => handleMediaPress(item, !!hasLiked)}
            activeOpacity={0.9}
          >
            {isVideo ? (
              <Video
                source={{ uri: getImageUrl(mediaItem.id || mediaItem) }}
                style={styles.postMedia}
                resizeMode="cover"
                shouldPlay={false}
                isMuted={true}
              />
            ) : (
              <Image
                source={{ uri: getImageUrl(mediaItem.id || mediaItem) }}
                style={styles.postMedia}
                resizeMode="cover"
              />
            )}

            {showBigHeart === postId && (
              <Animated.View
                style={[
                  styles.bigHeartOverlay,
                  { transform: [{ scale: bigHeartScale }] }
                ]}
                pointerEvents="none"
              >
                <Ionicons name="heart" size={100} color="#fff" />
              </Animated.View>
            )}
          </TouchableOpacity>
        )}

        {/* Post Stats */}
        <View style={styles.postStats}>
          <TouchableOpacity
            style={styles.statItem}
            onPress={() => {
              handleLike(postId, !!hasLiked);
              if (!hasLiked) animateSmallHeart();
            }}
          >
            <Animated.View style={hasLiked ? { transform: [{ scale: smallHeartScale }] } : {}}>
              <Ionicons
                name={hasLiked ? "heart" : "heart-outline"}
                size={22}
                color={hasLiked ? "#ff3b30" : "#666"}
              />
            </Animated.View>
            <Text style={styles.statText}>{item.likes?.length || 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statItem}
            onPress={() => toggleComments(postId)}
          >
            <Feather name="message-circle" size={20} color="#666" />
            <Text style={styles.statText}>{item.comments?.length || 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statItem}
            onPress={() => handleShare(item)}
          >
            <Feather name="share" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Comments Section */}
        {showComments && (
          <View style={styles.commentsSection}>
            <FlatList
              data={item.comments || []}
              renderItem={renderComment}
              keyExtractor={(comment, index) => index.toString()}
              scrollEnabled={false}
              ListEmptyComponent={
                <Text style={styles.noCommentsText}>No comments yet</Text>
              }
            />

            {isAuthenticated && (
              <View style={styles.commentInputRow}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Add a comment..."
                  value={commentText}
                  onChangeText={setCommentText}
                  onSubmitEditing={() => handleComment(postId)}
                />
                <TouchableOpacity
                  style={styles.commentSendBtn}
                  onPress={() => handleComment(postId)}
                  disabled={!commentText.trim()}
                >
                  <Feather name="send" size={18} color="#007AFF" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  // Render header (profile info)
  const renderHeader = () => {
    if (!profile) return null;

    const isOwnProfile = currentUser &&
      ((currentUser._id || currentUser.id) === userId);
    const displayName = profile.company_name || profile.full_name || profile.nickname || 'User';
    const avatar = profile.logo || profile.profile_picture;
    const bgImage = profile.bg_image;
    const socialLinks = profile.social_links || {};

    return (
      <View style={styles.profileHeader}>
        {/* Background Image */}
        {bgImage ? (
          <Image
            source={{ uri: getImageUrl(bgImage) }}
            style={styles.profileBg}
          />
        ) : (
          <View style={[styles.profileBg, styles.profileBgGradient]} />
        )}

        {/* Profile Picture */}
        <View style={styles.profileAvatarContainer}>
          <View style={styles.profileAvatarWrapper}>
            {avatar ? (
              <Image
                source={{ uri: getImageUrl(avatar) }}
                style={styles.profileAvatar}
              />
            ) : (
              <View style={styles.profileAvatarPlaceholder}>
                <Feather name="user" size={50} color="#999" />
              </View>
            )}
          </View>
        </View>

        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{displayName}</Text>
          {profile.nickname && profileType === 'influencer' && (
            <Text style={styles.profileNickname}>@{profile.nickname}</Text>
          )}

          <View style={styles.profileBadge}>
            <Text style={styles.profileBadgeText}>
              {profileType === 'brand' ? 'BRAND' : 'INFLUENCER'}
            </Text>
          </View>

          {profile.bio && (
            <Text style={styles.profileBio}>{profile.bio}</Text>
          )}

          {/* Stats */}
          <View style={styles.profileStats}>
            <TouchableOpacity
              style={styles.profileStat}
              onPress={() => router.push({
                pathname: `/(shared)/connections/${userId}`,
                params: { type: 'followers' }
              })}
            >
              <Text style={styles.profileStatNumber}>{followersCount}</Text>
              <Text style={styles.profileStatLabel}>Followers</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.profileStat}
              onPress={() => router.push({
                pathname: `/(shared)/connections/${userId}`,
                params: { type: 'following' }
              })}
            >
              <Text style={styles.profileStatNumber}>{followingCount}</Text>
              <Text style={styles.profileStatLabel}>Following</Text>
            </TouchableOpacity>
            <View style={styles.profileStat}>
              <Text style={styles.profileStatNumber}>{posts.length}</Text>
              <Text style={styles.profileStatLabel}>Posts</Text>
            </View>
          </View>

          {/* Follow Button */}
          {!isOwnProfile && isAuthenticated && (
            <TouchableOpacity
              style={[
                styles.followProfileBtn,
                isFollowing && styles.followingProfileBtn,
              ]}
              onPress={handleFollowToggle}
            >
              <Text style={styles.followProfileBtnText}>
                {isFollowing ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Contact Info */}
          <View style={styles.contactInfo}>
            {profile.email && (
              <TouchableOpacity
                style={styles.contactItem}
                onPress={() => Linking.openURL(`mailto:${profile.email}`)}
              >
                <Feather name="mail" size={16} color="#666" />
                <Text style={styles.contactText}>{profile.email}</Text>
              </TouchableOpacity>
            )}
            {profile.phone_number && (
              <TouchableOpacity
                style={styles.contactItem}
                onPress={() => Linking.openURL(`tel:${profile.phone_number}`)}
              >
                <Feather name="phone" size={16} color="#666" />
                <Text style={styles.contactText}>{profile.phone_number}</Text>
              </TouchableOpacity>
            )}
            {profile.website && (
              <TouchableOpacity
                style={styles.contactItem}
                onPress={() => Linking.openURL(profile.website!)}
              >
                <Feather name="globe" size={16} color="#666" />
                <Text style={styles.contactText}>{profile.website}</Text>
              </TouchableOpacity>
            )}
            {profile.location && (
              <View style={styles.contactItem}>
                <Feather name="map-pin" size={16} color="#666" />
                <Text style={styles.contactText}>{profile.location}</Text>
              </View>
            )}
            {profile.contact_person_name && (
              <View style={styles.contactItem}>
                <Feather name="user" size={16} color="#666" />
                <Text style={styles.contactText}>{profile.contact_person_name}</Text>
              </View>
            )}
            {profile.target_audience && (
              <View style={styles.contactItem}>
                <Feather name="target" size={16} color="#666" />
                <Text style={styles.contactText}>{profile.target_audience}</Text>
              </View>
            )}
          </View>

          {/* Categories */}
          {profile.categories && profile.categories.length > 0 && (
            <View style={styles.categoriesContainer}>
              <Text style={styles.categoriesTitle}>Categories:</Text>
              <View style={styles.categoriesList}>
                {profile.categories.map((cat, index) => (
                  <View key={index} style={styles.categoryTag}>
                    <Text style={styles.categoryTagText}>{cat}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Social Links */}
          {Object.keys(socialLinks).length > 0 && (
            <View style={styles.socialLinks}>
              {Object.entries(socialLinks).map(([platform, url]) => (
                url ? (
                  <TouchableOpacity
                    key={platform}
                    style={styles.socialLink}
                    onPress={() => Linking.openURL(url)}
                  >
                    <FontAwesome
                      name={platform as any}
                      size={24}
                      color="#666"
                    />
                  </TouchableOpacity>
                ) : null
              ))}
            </View>
          )}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Posts</Text>
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loaderText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={60} color="#ff3b30" />
          <Text style={styles.errorTitle}>Profile not found</Text>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.backBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.headerBackBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {profile.company_name || profile.full_name || profile.nickname || 'Profile'}
        </Text>
        <TouchableOpacity style={styles.headerMoreBtn}>
          <Feather name="more-horizontal" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item, index) => (item._id || item.id || index.toString())}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyPosts}>
              <Feather name="image" size={50} color="#ccc" />
              <Text style={styles.emptyPostsText}>No posts yet</Text>
            </View>
          ) : null
        }
      />

      {/* Post Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        {selectedPost && (
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="arrow-left" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Post</Text>
              <TouchableOpacity>
                <Feather name="more-horizontal" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={selectedPost.comments || []}
              renderItem={renderComment}
              keyExtractor={(item, index) => index.toString()}
              ListHeaderComponent={() => (
                <View style={styles.modalPostContainer}>
                  {/* Post Header */}
                  <View style={styles.modalPostHeader}>
                    {profile?.logo || profile?.profile_picture ? (
                      <Image
                        source={{ uri: getImageUrl(profile?.logo || profile?.profile_picture || '') }}
                        style={styles.modalAuthorAvatar}
                      />
                    ) : (
                      <View style={styles.modalAuthorAvatarPlaceholder}>
                        <Feather name="user" size={24} color="#666" />
                      </View>
                    )}
                    <View>
                      <Text style={styles.modalAuthorName}>
                        {profile?.company_name || profile?.full_name || profile?.nickname || 'User'}
                      </Text>
                      <Text style={styles.modalPostTime}>
                        {formatDate(selectedPost.created_at)}
                      </Text>
                    </View>
                  </View>

                  {/* Post Caption */}
                  {selectedPost.caption && (
                    <View style={styles.modalCaption}>
                      <Text style={styles.modalCaptionText}>
                        {selectedPost.caption}
                      </Text>
                    </View>
                  )}

                  {/* Post Media */}
                  {selectedPost.media && selectedPost.media.length > 0 && (
                    <View style={styles.modalMediaContainer}>
                      {selectedPost.media.map((file, index) => {
                        const fileId = file.id || file;
                        const isVideo = file.type?.startsWith('video') ||
                          fileId.toString().includes('video');

                        return (
                          <View key={fileId} style={styles.modalMediaItem}>
                            {isVideo ? (
                              <Video
                                source={{ uri: getImageUrl(fileId) }}
                                style={styles.modalMedia}
                                resizeMode="cover"
                                shouldPlay={false}
                                isMuted={true}
                              />
                            ) : (
                              <Image
                                source={{ uri: getImageUrl(fileId) }}
                                style={styles.modalMedia}
                                resizeMode="cover"
                              />
                            )}
                          </View>
                        );
                      })}
                    </View>
                  )}

                  {/* Post Stats */}
                  <View style={styles.modalStats}>
                    <TouchableOpacity
                      style={styles.modalStatItem}
                      onPress={() => handleLike(
                        selectedPost._id || selectedPost.id,
                        selectedPost.likes?.some(like =>
                          (like.user_id || like._id) === (currentUser?._id || currentUser?.id)
                        )
                      )}
                    >
                      <Ionicons
                        name={selectedPost.likes?.some(like =>
                          (like.user_id || like._id) === (currentUser?._id || currentUser?.id)
                        ) ? "heart" : "heart-outline"}
                        size={24}
                        color={selectedPost.likes?.some(like =>
                          (like.user_id || like._id) === (currentUser?._id || currentUser?.id)
                        ) ? "#ff3b30" : "#333"}
                      />
                      <Text style={styles.modalStatText}>
                        {selectedPost.likes?.length || 0} likes
                      </Text>
                    </TouchableOpacity>

                    <View style={styles.modalStatItem}>
                      <Feather name="message-circle" size={24} color="#333" />
                      <Text style={styles.modalStatText}>
                        {selectedPost.comments?.length || 0} comments
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.modalStatItem}
                      onPress={() => handleShare(selectedPost)}
                    >
                      <Feather name="share" size={24} color="#333" />
                      <Text style={styles.modalStatText}>Share</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.commentsHeader}>
                    <Text style={styles.commentsTitle}>Comments</Text>
                  </View>
                </View>
              )}
              contentContainerStyle={styles.modalListContent}
              showsVerticalScrollIndicator={false}
            />

            {/* Comment Input */}
            {isAuthenticated && (
              <View style={styles.commentInputContainer}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Add a comment..."
                  value={commentText}
                  onChangeText={setCommentText}
                  multiline
                />
                <TouchableOpacity
                  style={[
                    styles.commentSendBtn,
                    (!commentText.trim() || submittingComment) && styles.commentSendBtnDisabled
                  ]}
                  onPress={() => handleComment(selectedPost._id || selectedPost.id)}
                  disabled={!commentText.trim() || submittingComment}
                >
                  {submittingComment ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Feather name="send" size={20} color="#fff" />
                  )}
                </TouchableOpacity>
              </View>
            )}
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  headerBackBtn: {
    padding: 8,
    marginLeft: -8,
  },
  headerMoreBtn: {
    padding: 8,
    marginRight: -8,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 20,
  },
  backBtn: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  listContent: {
    flexGrow: 1,
  },
  profileHeader: {
    backgroundColor: '#fff',
  },
  profileBg: {
    width: '100%',
    height: 150,
  },
  profileBgGradient: {
    backgroundColor: '#f5f5f5',
  },
  profileAvatarContainer: {
    alignItems: 'center',
    marginTop: -50,
  },
  profileAvatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#fff',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  profileAvatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    padding: 20,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  profileNickname: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 4,
  },
  profileBadge: {
    alignSelf: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  profileBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  profileBio: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  profileStat: {
    alignItems: 'center',
  },
  profileStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  profileStatLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  followProfileBtn: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  followingProfileBtn: {
    backgroundColor: '#e0e0e0',
  },
  followProfileBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  contactInfo: {
    marginTop: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  categoriesContainer: {
    marginTop: 16,
  },
  categoriesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  categoriesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryTag: {
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryTagText: {
    fontSize: 12,
    color: '#666',
  },
  socialLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  socialLink: {
    marginHorizontal: 12,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 8,
    borderTopColor: '#f5f5f5',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  postCard: {
    backgroundColor: '#fff',
    marginBottom: 12,
    padding: 16,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  postAuthorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  postAuthorAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  postAuthorInfo: {
    flex: 1,
  },
  postAuthorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  postTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  postCaption: {
    marginBottom: 12,
  },
  postCaptionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  postMediaContainer: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
  },
  postMedia: {
    width: '100%',
    height: '100%',
  },
  postStats: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  statText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  commentsSection: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  commentAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  commentText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  commentTime: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  noCommentsText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 8,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 14,
  },
  commentSendBtn: {
    padding: 8,
  },
  emptyPosts: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyPostsText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalPostContainer: {
    padding: 16,
  },
  modalPostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalAuthorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  modalAuthorAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalAuthorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  modalPostTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  modalCaption: {
    marginBottom: 12,
  },
  modalCaptionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  modalMediaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  modalMediaItem: {
    width: (SCREEN_WIDTH - 32) / 3 - 4,
    height: 100,
    marginRight: 4,
    marginBottom: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  modalMedia: {
    width: '100%',
    height: '100%',
  },
  modalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalStatItem: {
    alignItems: 'center',
  },
  modalStatText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  commentsHeader: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  modalListContent: {
    paddingBottom: 80,
  },
  commentInputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  commentSendBtnDisabled: {
    backgroundColor: '#ccc',
  },
  bigHeartOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    backgroundColor: 'transparent',
  },
});

export default ProfileScreen;