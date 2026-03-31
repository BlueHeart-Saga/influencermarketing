// C:\Sagadevan\quickbox\mobile\app\(brand)\(tabs)\account\profile.tsx
import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView,
  FlatList,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
  Share,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../../../contexts/AuthContext";
import profileAPI from "../../../../services/profileAPI";
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

interface Post {
  _id: string;
  id?: string;
  caption?: string;
  media?: string[];
  likes?: any[];
  comments?: any[];
  views?: any[];
  created_at?: string;
  user_id?: string;
}

interface Comment {
  user_id: string;
  user_name: string;
  profile_picture?: string;
  comment: string;
  created_at?: string;
}

const BrandProfile = () => {
  const { user } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState("");
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalUsers, setModalUsers] = useState<any[]>([]);

  const [commentInputVisible, setCommentInputVisible] = useState<Record<string, boolean>>({});
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const lastTaps = React.useRef<Record<string, number>>({});
  const [showBigHeart, setShowBigHeart] = useState<string | null>(null);
  const bigHeartScale = React.useRef(new Animated.Value(0)).current;
  const smallHeartScale = React.useRef(new Animated.Value(1)).current;

  const getFileUrl = (fileId: string) => `${API_BASE_URL}/profiles/image/${fileId}`;

  // Fetch profile data
  const fetchProfileData = async () => {
    if (!user) return;

    try {
      const res = await profileAPI.getMyProfile();
      if (res?.type !== "brand") {
        setMessage("No brand profile found.");
        return;
      }

      setProfile(res.profile);
      const id = res.profile._id || res.profile.id;
      if (!id) {
        setMessage("Profile ID not found.");
        return;
      }
      setUserId(id);

      await fetchFollowersAndFollowing(id);
      await fetchPosts(id);
    } catch (err) {
      console.error(err);
      setMessage("Error fetching profile.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfileData();
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push("/(brand)/(tabs)/account");
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

  const fetchFollowersAndFollowing = async (userId: string) => {
    try {
      const followersData = await profileAPI.getFollowers(userId);
      const followingData = await profileAPI.getFollowing(userId);
      setFollowers(followersData || []);
      setFollowing(followingData || []);
    } catch (err) {
      console.error("Error fetching followers/following:", err);
    }
  };

  const fetchPosts = async (userId: string) => {
    try {
      const data = await profileAPI.getUserPosts(userId);
      if (data) data.sort((a: Post, b: Post) =>
        new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );
      setPosts(data || []);
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  };

  const handleLike = async (postId: string) => {
    if (!postId) return;
    try {
      await profileAPI.likePost(postId);
      if (userId) {
        await fetchPosts(userId);
      } else if (profile) {
        const id = profile._id || profile.id;
        if (id) await fetchPosts(id);
      }
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const handleMediaPress = (postId: string, hasLiked: boolean) => {
    const now = Date.now();
    if (lastTaps.current[postId] && now - lastTaps.current[postId] < 500) {
      if (!hasLiked) {
        handleLike(postId);
        animateSmallHeart();
      }
      setShowBigHeart(postId);
      animateBigHeart();
    }
    lastTaps.current[postId] = now;
  };

  const handleComment = async (postId: string) => {
    const comment = commentText[postId];
    if (!comment || !comment.trim()) return;

    try {
      await profileAPI.commentPost(postId, comment);
      setCommentText(prev => ({ ...prev, [postId]: "" }));
      setCommentInputVisible(prev => ({ ...prev, [postId]: false }));
      if (userId) await fetchPosts(userId);
    } catch (err) {
      console.error("Error commenting:", err);
    }
  };

  const openUsersModal = async (title: string, postId: string, type: 'likes' | 'views') => {
    try {
      let users: any[] = [];
      if (type === "likes") users = await profileAPI.getPostLikes(postId);
      if (type === "views") users = await profileAPI.getPostViews(postId);

      setModalTitle(title);
      setModalUsers(users);
      setModalVisible(true);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const handleShare = async (post: Post) => {
    try {
      const postId = post._id || post.id;
      if (!postId) {
        Alert.alert("Error", "Post ID not found.");
        return;
      }
      const postUrl = `${API_BASE_URL}/posts/${postId}`;
      const message = post.caption ? `${post.caption}\n\n${postUrl}` : postUrl;

      const result = await Share.share({
        message,
        url: postUrl,
        title: 'Share Post',
      });

      if (result.action === Share.sharedAction) {
        // shared
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (err) {
      console.error("Error sharing:", err);
      Alert.alert("Error", "Failed to share post");
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await profileAPI.deleteProfile("brand");
      setProfile(null);
      setShowDeleteDialog(false);
      router.push('/(brand)/(tabs)/account/settings');
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Error deleting brand profile.");
      setShowDeleteDialog(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
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

  const renderPost = ({ item }: { item: Post }) => {
    const postId = item._id || item.id || '';
    const hasLiked = item.likes?.some(like =>
      like._id === userId || like.user_id === userId
    );

    return (
      <View style={styles.postCard}>
        {/* Post Header */}
        <View style={styles.postHeader}>
          {profile?.logo ? (
            <Image source={{ uri: getFileUrl(profile.logo) }} style={styles.postAuthorAvatar} />
          ) : (
            <View style={styles.postAuthorAvatarPlaceholder}>
              <Text style={styles.postAuthorAvatarPlaceholderText}>
                {profile?.company_name?.[0] || "B"}
              </Text>
            </View>
          )}
          <View style={styles.postAuthorInfo}>
            <Text style={styles.postAuthorName}>{profile?.company_name}</Text>
            <Text style={styles.postTime}>{formatDate(item.created_at)}</Text>
          </View>
        </View>

        {/* Post Caption */}
        {item.caption && (
          <View style={styles.postCaption}>
            <Text style={styles.postCaptionText}>{item.caption}</Text>
          </View>
        )}

        {/* Post Media */}
        {item.media && item.media.length > 0 && (
          <View style={styles.postMediaGrid}>
            {item.media.map((file, idx) => {
              const url = getFileUrl(file);
              return (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.9}
                  onPress={() => handleMediaPress(postId, !!hasLiked)}
                >
                  <Image
                    source={{ uri: url }}
                    style={[
                      styles.postMediaItem,
                      item.media?.length === 1 && styles.postMediaItemSingle
                    ]}
                  />
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
              );
            })}
          </View>
        )}

        {/* Post Stats */}
        <View style={styles.postStatsBar}>
          <TouchableOpacity
            onPress={() => openUsersModal("Likes", postId, 'likes')}
            style={styles.statButton}
          >
            <Text style={styles.statText}>{item.likes?.length || 0} likes</Text>
          </TouchableOpacity>

          <View style={styles.statGroup}>
            <TouchableOpacity
              onPress={() => setCommentInputVisible(prev => ({ ...prev, [postId]: !prev[postId] }))}
              style={styles.statButton}
            >
              <Text style={styles.statText}>{item.comments?.length || 0} comments</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => openUsersModal("Views", postId, 'views')}
              style={styles.statButton}
            >
              <Text style={styles.statText}>{item.views?.length || 0} views</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Post Actions */}
        <View style={styles.postActionsBar}>
          <TouchableOpacity
            style={styles.postActionButton}
            onPress={() => {
              handleLike(postId);
              if (!hasLiked) animateSmallHeart();
            }}
          >
            <Animated.View style={hasLiked ? { transform: [{ scale: smallHeartScale }] } : {}}>
              <Ionicons
                name={hasLiked ? "heart" : "heart-outline"}
                size={22}
                color={hasLiked ? "#FF3B30" : "#666"}
              />
            </Animated.View>
            <Text style={[styles.postActionText, hasLiked && styles.likedText]}>
              {hasLiked ? 'Liked' : 'Like'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.postActionButton}
            onPress={() => setCommentInputVisible(prev => ({ ...prev, [postId]: !prev[postId] }))}
          >
            <Ionicons name="chatbubble-outline" size={22} color="#666" />
            <Text style={styles.postActionText}>Comment</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.postActionButton}
            onPress={() => handleShare(item)}
          >
            <Ionicons name="share-outline" size={22} color="#666" />
            <Text style={styles.postActionText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Comment Input */}
        {commentInputVisible[postId] && (
          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Write a comment..."
              value={commentText[postId] || ""}
              onChangeText={(text) => setCommentText(prev => ({ ...prev, [postId]: text }))}
              multiline
            />
            <TouchableOpacity
              style={styles.commentSubmitButton}
              onPress={() => handleComment(postId)}
            >
              <Ionicons name="send" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* Comments List */}
        {item.comments && item.comments.length > 0 && (
          <View style={styles.commentsList}>
            {(expandedComments[postId] ? item.comments : item.comments.slice(0, 3)).map((comment, idx) => (
              <View key={idx} style={styles.commentItem}>
                {comment.profile_picture ? (
                  <Image
                    source={{ uri: getFileUrl(comment.profile_picture) }}
                    style={styles.commentAvatar}
                  />
                ) : (
                  <View style={styles.commentAvatarPlaceholder}>
                    <Text style={styles.commentAvatarPlaceholderText}>
                      {(comment.user_name || "U")[0].toUpperCase()}
                    </Text>
                  </View>
                )}
                <View style={styles.commentContent}>
                  <Text style={styles.commentAuthor}>{comment.user_name}</Text>
                  <Text style={styles.commentText}>{comment.comment}</Text>
                  {comment.created_at && (
                    <Text style={styles.commentTime}>{formatDate(comment.created_at)}</Text>
                  )}
                </View>
              </View>
            ))}
            {item.comments.length > 3 && (
              <TouchableOpacity
                style={styles.viewMoreComments}
                onPress={() => setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }))}
              >
                <Text style={styles.viewMoreCommentsText}>
                  {expandedComments[postId] ? 'Show less' : `View all ${item.comments.length} comments`}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="person-outline" size={60} color="#ccc" />
        <Text style={styles.emptyText}>{message || "No brand profile found."}</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push('/(brand)/(tabs)/account/settings')}
        >
          <Text style={styles.createButtonText}>Create Profile</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const socialIcons: Record<string, { name: keyof typeof Ionicons.glyphMap; color: string }> = {
    instagram: { name: "logo-instagram", color: "#E4405F" },
    youtube: { name: "logo-youtube", color: "#FF0000" },
    linkedin: { name: "logo-linkedin", color: "#0077B5" },
    facebook: { name: "logo-facebook", color: "#1877F2" },
    twitter: { name: "logo-twitter", color: "#1DA1F2" },
    tiktok: { name: "logo-tiktok", color: "#000000" },
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          {profile.bg_image ? (
            <Image source={{ uri: getFileUrl(profile.bg_image) }} style={styles.profileBackground} />
          ) : (
            <View style={[styles.profileBackground, styles.gradientBackground]} />
          )}

          <View style={styles.profileLogoContainer}>
            {profile.logo ? (
              <Image source={{ uri: getFileUrl(profile.logo) }} style={styles.profileLogo} />
            ) : (
              <View style={styles.profileLogoPlaceholder}>
                <Text style={styles.profileLogoPlaceholderText}>
                  {profile.company_name?.[0] || "B"}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.profileName}>{profile.company_name || "Brand Name"}</Text>

          {/* Stats */}
          <View style={styles.profileStats}>
            <TouchableOpacity
              style={styles.statItem}
              onPress={() => router.push({
                pathname: `/(shared)/connections/${userId}`,
                params: { type: 'followers' }
              })}
            >
              <Text style={styles.statNumber}>{followers.length}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.statItem}
              onPress={() => router.push({
                pathname: `/(shared)/connections/${userId}`,
                params: { type: 'following' }
              })}
            >
              <Text style={styles.statNumber}>{following.length}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </TouchableOpacity>

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{posts.length}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
          </View>

          {/* Contact Info */}
          <View style={styles.infoSection}>
            {profile.contact_person_name && (
              <View style={styles.infoItem}>
                <Ionicons name="people-outline" size={20} color="#666" />
                <Text style={styles.infoText}>{profile.contact_person_name}</Text>
              </View>
            )}

            {user?.email && (
              <View style={styles.infoItem}>
                <Ionicons name="mail-outline" size={20} color="#666" />
                <Text style={styles.infoText}>{user.email}</Text>
              </View>
            )}

            {profile.phone_number && (
              <View style={styles.infoItem}>
                <Ionicons name="call-outline" size={20} color="#666" />
                <Text style={styles.infoText}>{profile.phone_number}</Text>
              </View>
            )}

            {profile.website && (
              <View style={styles.infoItem}>
                <Ionicons name="globe-outline" size={20} color="#666" />
                <Text style={styles.infoText}>{profile.website}</Text>
              </View>
            )}

            {profile.location && (
              <View style={styles.infoItem}>
                <Ionicons name="location-outline" size={20} color="#666" />
                <Text style={styles.infoText}>{profile.location}</Text>
              </View>
            )}

            {profile.target_audience && (
              <View style={styles.infoItem}>
                <Ionicons name="locate-outline" size={20} color="#666" />
                <Text style={styles.infoText}>{profile.target_audience}</Text>
              </View>
            )}
          </View>

          {/* Categories */}
          {profile.categories && profile.categories.length > 0 && (
            <View style={styles.categoriesContainer}>
              {profile.categories.map((cat: string, idx: number) => (
                <View key={idx} style={styles.categoryTag}>
                  <Text style={styles.categoryTagText}>{cat}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Social Links */}
          {profile.social_links && Object.keys(profile.social_links).length > 0 && (
            <View style={styles.socialLinksContainer}>
              {Object.entries(profile.social_links).map(([platform, url]) => {
                if (!url) return null;
                const icon = socialIcons[platform] || { name: "link-outline", color: "#666" };
                return (
                  <TouchableOpacity
                    key={platform}
                    style={styles.socialLink}
                    onPress={() => {
                      // Open URL
                      Alert.alert("Open Link", `Open ${url}?`);
                    }}
                  >
                    <Ionicons name={icon.name} size={24} color={icon.color} />
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Bio */}
          {profile.bio && (
            <View style={styles.bioContainer}>
              <Text style={styles.bioText}>{profile.bio}</Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton]}
              onPress={() => router.push('/(brand)/(tabs)/account/settings')}
            >
              <Ionicons name="create-outline" size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.dangerButton]}
              onPress={() => setShowDeleteDialog(true)}
            >
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              <Text style={styles.dangerButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Create Post Button */}
        <TouchableOpacity
          style={styles.createPostButton}
          onPress={() => router.push('/(brand)/(tabs)/account/create-post')}
        >
          <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
          <Text style={styles.createPostButtonText}>Create New Post</Text>
        </TouchableOpacity>

        {/* Posts Feed */}
        <View style={styles.postsFeed}>
          {posts.length === 0 ? (
            <View style={styles.noPostsContainer}>
              <Ionicons name="images-outline" size={48} color="#ccc" />
              <Text style={styles.noPostsText}>No posts yet. Share your first post!</Text>
            </View>
          ) : (
            <FlatList
              data={posts}
              renderItem={renderPost}
              keyExtractor={(item) => item._id || item.id || Math.random().toString()}
              scrollEnabled={false}
            />
          )}
        </View>

        {/* Users Modal */}
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{modalTitle}</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#000" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={modalUsers}
                keyExtractor={(item, idx) => item._id || idx.toString()}
                renderItem={({ item }) => (
                  <View style={styles.modalUserItem}>
                    {item.profile_picture ? (
                      <Image source={{ uri: getFileUrl(item.profile_picture) }} style={styles.modalUserAvatar} />
                    ) : (
                      <View style={styles.modalUserAvatarPlaceholder}>
                        <Text style={styles.modalUserAvatarPlaceholderText}>
                          {(item.company_name || item.full_name || item.nickname || "U")[0].toUpperCase()}
                        </Text>
                      </View>
                    )}
                    <View style={styles.modalUserInfo}>
                      <Text style={styles.modalUserName}>
                        {item.company_name || item.full_name || item.nickname || "Unknown User"}
                      </Text>
                      {item.email && <Text style={styles.modalUserEmail}>{item.email}</Text>}
                    </View>
                  </View>
                )}
                ListEmptyComponent={
                  <Text style={styles.modalEmptyText}>No users found</Text>
                }
              />
            </View>
          </View>
        </Modal>

        {/* Delete Confirmation Dialog */}
        <Modal
          visible={showDeleteDialog}
          transparent={true}
          animationType="fade"
        >
          <View style={styles.dialogOverlay}>
            <View style={[styles.dialogContent, styles.dialogDanger]}>
              <View style={styles.warningIcon}>
                <Ionicons name="warning" size={60} color="#FF3B30" />
              </View>
              <Text style={styles.dialogTitle}>Delete Brand Profile</Text>
              <Text style={styles.dialogMessage}>
                Are you sure you want to delete "{profile.company_name}" brand profile?
              </Text>
              <Text style={styles.dialogWarning}>
                This action cannot be undone and will permanently delete all your data.
              </Text>
              <View style={styles.dialogActions}>
                <TouchableOpacity
                  style={[styles.dialogButton, styles.dialogButtonDanger]}
                  onPress={handleDeleteConfirm}
                >
                  <Text style={styles.dialogButtonDangerText}>Yes, Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.dialogButton, styles.dialogButtonSecondary]}
                  onPress={() => setShowDeleteDialog(false)}
                >
                  <Text style={styles.dialogButtonSecondaryText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    marginBottom: 20,
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  profileHeader: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingBottom: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 15,
    left: 15,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileBackground: {
    height: 150,
    width: '100%',
  },
  gradientBackground: {
    backgroundColor: '#0f6eea',
  },
  profileLogoContainer: {
    alignItems: 'center',
    marginTop: -50,
    marginBottom: 12,
  },
  profileLogo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#fff',
  },
  profileLogoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#fff',
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileLogoPlaceholderText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 16,
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  infoSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  categoryTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryTagText: {
    fontSize: 12,
    color: '#666',
  },
  socialLinksContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 16,
  },
  socialLink: {
    padding: 8,
  },
  bioContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  bioText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  dangerButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  dangerButtonText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '500',
  },
  createPostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  createPostButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  postsFeed: {
    paddingHorizontal: 16,
  },
  noPostsContainer: {
    backgroundColor: '#fff',
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  noPostsText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    marginRight: 12,
  },
  postAuthorAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  postAuthorAvatarPlaceholderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  postAuthorInfo: {
    flex: 1,
  },
  postAuthorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
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
  postMediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 2,
  },
  postMediaItem: {
    width: '33.33%',
    aspectRatio: 1,
  },
  postMediaItemSingle: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  postStatsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statButton: {
    padding: 4,
  },
  statText: {
    fontSize: 14,
    color: '#666',
  },
  statGroup: {
    flexDirection: 'row',
    gap: 16,
  },
  postActionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  postActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
  },
  postActionText: {
    fontSize: 14,
    color: '#666',
  },
  likedText: {
    color: '#FF3B30',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    maxHeight: 100,
  },
  commentSubmitButton: {
    padding: 8,
  },
  commentsList: {
    gap: 12,
  },
  commentItem: {
    flexDirection: 'row',
    gap: 8,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  commentAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentAvatarPlaceholderText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  commentContent: {
    flex: 1,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  commentText: {
    fontSize: 14,
    color: '#333',
    marginTop: 2,
  },
  commentTime: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  viewMoreComments: {
    marginTop: 8,
  },
  viewMoreCommentsText: {
    fontSize: 14,
    color: '#007AFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  modalUserItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 12,
  },
  modalUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  modalUserAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalUserAvatarPlaceholderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalUserInfo: {
    flex: 1,
  },
  modalUserName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  modalUserEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  modalEmptyText: {
    textAlign: 'center',
    padding: 20,
    color: '#999',
  },
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    maxWidth: 400,
    alignItems: 'center',
  },
  dialogDanger: {
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  warningIcon: {
    marginBottom: 16,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  dialogMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  dialogWarning: {
    fontSize: 14,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  dialogActions: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  dialogButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  dialogButtonDanger: {
    backgroundColor: '#FF3B30',
  },
  dialogButtonDangerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  dialogButtonSecondary: {
    backgroundColor: '#f0f0f0',
  },
  dialogButtonSecondaryText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
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

export default BrandProfile;