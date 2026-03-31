import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Platform,
  Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import profileAPI from '../../../services/profileAPI';
import { Video } from 'expo-video';

import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import { Feather, Ionicons, AntDesign } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Types
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
  author?: {
    id: string;
    name: string;
    profile_picture?: string;
  };
  has_liked?: boolean;
  isFollowingAuthor?: boolean;
}

interface Comment {
  user_id: string;
  user_name: string;
  profile_picture?: string;
  comment: string;
  created_at: string;
}

const FeedScreen = () => {
  const router = useRouter();
  const { token, user: currentUser } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeTab, setActiveTab] = useState<'forYou' | 'following'>('forYou');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState('');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});

  const videoRefs = useRef<Record<string, Video>>({});

  // Get image URL
  const getImageUrl = (fileId: string) => {
    if (!fileId) return 'https://via.placeholder.com/150';
    return `${profileAPI.BASE_URL}/profiles/image/${fileId}`;
  };

  // Fetch following list
  const fetchFollowingMap = useCallback(async () => {
    if (!token || !currentUser?.id) return;

    try {
      const followingList = await profileAPI.getFollowing(currentUser.id);
      const map: Record<string, boolean> = {};
      followingList.forEach((user: any) => {
        const userId = user._id || user.id;
        if (userId) map[userId] = true;
      });
      setFollowingMap(map);
    } catch (err) {
      console.error('Error fetching following list:', err);
    }
  }, [token, currentUser?.id]);

  // Fetch posts
  const fetchPosts = useCallback(async (pageNum = 1, isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError('');

      const endpoint = activeTab === 'forYou'
        ? `${profileAPI.BASE_URL}/profiles/posts/feed/me?page=${pageNum}&limit=10`
        : `${profileAPI.BASE_URL}/profiles/posts/feed/discovery?page=${pageNum}&limit=10`;

      const headers: any = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(endpoint, { headers });

      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.status}`);
      }

      const data = await response.json();
      const newPosts = data.posts || data.reels || [];

      // Enhance posts with following status
      const enhancedPosts = newPosts.map((post: Post) => {
        const authorId = post.author?.id;
        return {
          ...post,
          isFollowingAuthor: authorId ? followingMap[authorId] || false : false,
        };
      });

      if (isLoadMore) {
        setPosts(prev => [...prev, ...enhancedPosts]);
      } else {
        setPosts(enhancedPosts);
      }

      setHasMore(data.has_more || false);
      setPage(pageNum);

    } catch (err: any) {
      console.error('Error fetching posts:', err);
      setError(err.message || 'Failed to load posts');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [activeTab, token, followingMap]);

  // Load initial data
  useEffect(() => {
    fetchFollowingMap();
  }, [fetchFollowingMap]);

  useEffect(() => {
    fetchPosts(1, false);
  }, [activeTab]);

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPosts(1, false);
  }, [fetchPosts]);

  // Handle load more
  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchPosts(page + 1, true);
    }
  };

  // Handle like/unlike
  const handleLike = async (postId: string, currentlyLiked: boolean) => {
    if (!token) {
      Alert.alert('Login Required', 'Please login to like posts');
      return;
    }

    try {
      await profileAPI.likePost(postId);

      // Optimistically update UI
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
            has_liked: !currentlyLiked,
          };
        }
        return post;
      }));
    } catch (err) {
      console.error('Error liking post:', err);
      Alert.alert('Error', 'Failed to like post');
    }
  };

  // Handle comment submission
  const handleComment = async () => {
    if (!token) {
      Alert.alert('Login Required', 'Please login to comment');
      return;
    }

    if (!commentText.trim() || !selectedPost) return;

    setSubmittingComment(true);
    try {
      const postId = selectedPost._id || selectedPost.id;
      await profileAPI.commentPost(postId, commentText);

      // Refresh the specific post
      const updatedPost = await profileAPI.getUserPosts(selectedPost.user_id);
      const refreshedPost = updatedPost.find((p: Post) =>
        (p._id || p.id) === postId
      );

      if (refreshedPost) {
        setPosts(prev => prev.map(post =>
          (post._id || post.id) === postId ? { ...post, comments: refreshedPost.comments } : post
        ));

        setSelectedPost(prev => prev ? { ...prev, comments: refreshedPost.comments } : null);
      }

      setCommentText('');
    } catch (err) {
      console.error('Error commenting:', err);
      Alert.alert('Error', 'Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  // Handle follow/unfollow
  const handleFollowToggle = async (authorId: string, isFollowing: boolean) => {
    if (!token) {
      Alert.alert('Login Required', 'Please login to follow users');
      return;
    }

    try {
      if (isFollowing) {
        await profileAPI.unfollowUser(authorId);
      } else {
        await profileAPI.followUser(authorId);
      }

      // Update following map
      setFollowingMap(prev => ({
        ...prev,
        [authorId]: !isFollowing,
      }));

      // Update posts
      setPosts(prev => prev.map(post => {
        const postAuthorId = post.author?.id;
        if (postAuthorId === authorId) {
          return {
            ...post,
            isFollowingAuthor: !isFollowing,
          };
        }
        return post;
      }));

      if (selectedPost) {
        const selectedAuthorId = selectedPost.author?.id;
        if (selectedAuthorId === authorId) {
          setSelectedPost({
            ...selectedPost,
            isFollowingAuthor: !isFollowing,
          });
        }
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
      Alert.alert('Error', 'Failed to update follow status');
    }
  };

  // Handle share
  const handleShare = async (post: Post) => {
    try {
      const postUrl = `${profileAPI.BASE_URL}/posts/${post._id || post.id}`;
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
      console.error('Error sharing:', err);
      Alert.alert('Error', 'Failed to share post');
    }
  };

  // Handle view post
  const handleViewPost = async (postId: string) => {
    if (!token) return;
    try {
      await profileAPI.viewPost(postId);
    } catch (err) {
      console.error('Error recording view:', err);
    }
  };

  // Open post modal
  const openPostModal = (post: Post) => {
    setSelectedPost(post);
    setModalVisible(true);
    handleViewPost(post._id || post.id);
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

    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Render post item
  const renderPost = ({ item }: { item: Post }) => {
    const postId = item._id || item.id;
    const authorId = item.author?.id;
    const isCurrentUser = authorId === (currentUser?._id || currentUser?.id);
    const hasLiked = item.likes?.some(like =>
      (like.user_id || like._id) === (currentUser?._id || currentUser?.id)
    ) || item.has_liked;

    const mediaItem = item.media?.[0];
    const isVideo = mediaItem?.type?.startsWith('video') ||
      mediaItem?.toString().includes('video');

    return (
      <TouchableOpacity
        style={styles.postCard}
        activeOpacity={0.9}
        onPress={() => openPostModal(item)}
      >
        <View style={styles.postHeader}>
          <TouchableOpacity
            style={styles.authorInfo}
            onPress={() => router.push(`/(shared)/profile/${authorId}`)}
          >
            {item.author?.profile_picture ? (
              <Image
                source={{ uri: getImageUrl(item.author.profile_picture) }}
                style={styles.authorAvatar}
              />
            ) : (
              <View style={styles.authorAvatarPlaceholder}>
                <Feather name="user" size={20} color="#666" />
              </View>
            )}
            <View style={styles.authorDetails}>
              <Text style={styles.authorName}>{item.author?.name || 'Unknown User'}</Text>
              <Text style={styles.postTime}>{formatDate(item.created_at)}</Text>
            </View>
          </TouchableOpacity>

          {!isCurrentUser && authorId && (
            <TouchableOpacity
              style={[styles.followBtn, item.isFollowingAuthor && styles.followingBtn]}
              onPress={() => handleFollowToggle(authorId, item.isFollowingAuthor || false)}
            >
              <Text style={styles.followBtnText}>
                {item.isFollowingAuthor ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {item.caption ? (
          <Text style={styles.caption} numberOfLines={2}>
            {item.caption}
          </Text>
        ) : null}

        <View style={styles.mediaContainer}>
          {mediaItem ? (
            isVideo ? (
              <Video
                ref={ref => {
                  if (ref) videoRefs.current[postId] = ref;
                }}
                source={{ uri: getImageUrl(mediaItem.id || mediaItem) }}
                style={styles.media}
                resizeMode="cover"
                shouldPlay={false}
                isMuted={true}
              />
            ) : (
              <Image
                source={{ uri: getImageUrl(mediaItem.id || mediaItem) }}
                style={styles.media}
                resizeMode="cover"
              />
            )
          ) : (
            <View style={styles.noMedia}>
              <Feather name="image" size={40} color="#ccc" />
            </View>
          )}
        </View>

        <View style={styles.postStats}>
          <TouchableOpacity
            style={styles.statItem}
            onPress={() => handleLike(postId, hasLiked)}
          >
            <Ionicons
              name={hasLiked ? "heart" : "heart-outline"}
              size={18}
              color={hasLiked ? "#ff3b30" : "#666"}
            />
            <Text style={styles.statText}>{item.likes?.length || 0}</Text>
          </TouchableOpacity>

          <View style={styles.statItem}>
            <Feather name="message-circle" size={18} color="#666" />
            <Text style={styles.statText}>{item.comments?.length || 0}</Text>
          </View>

          <View style={styles.statItem}>
            <Feather name="eye" size={18} color="#666" />
            <Text style={styles.statText}>{item.views?.length || 0}</Text>
          </View>

          <TouchableOpacity
            style={styles.statItem}
            onPress={() => handleShare(item)}
          >
            <Feather name="share" size={18} color="#666" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
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

  // Render footer
  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.footerText}>Loading more...</Text>
      </View>
    );
  };

  // Render empty state
  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Feather name="inbox" size={60} color="#ccc" />
        <Text style={styles.emptyTitle}>No posts yet</Text>
        <Text style={styles.emptyText}>
          {activeTab === 'following' && !token
            ? 'Login to see posts from accounts you follow'
            : activeTab === 'following'
              ? 'Follow some creators to see their posts here!'
              : 'No posts available at the moment'}
        </Text>
        {!token && (
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.loginBtnText}>Login</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />



      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'forYou' && styles.activeTab]}
          onPress={() => setActiveTab('forYou')}
        >
          <Text style={[styles.tabText, activeTab === 'forYou' && styles.activeTabText]}>
            For You
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'following' && styles.activeTab]}
          onPress={() => setActiveTab('following')}
        >
          <Text style={[styles.tabText, activeTab === 'following' && styles.activeTabText]}>
            Following
          </Text>
        </TouchableOpacity>
      </View>

      {/* Error */}
      {error ? (
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={40} color="#ff3b30" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={onRefresh}>
            <Text style={styles.retryBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item, index) => (item._id || item.id || index.toString())}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
        />
      )}

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
                    <TouchableOpacity
                      style={styles.modalAuthorInfo}
                      onPress={() => {
                        setModalVisible(false);
                        router.push(`/shared/profile/${selectedPost.author?.id}`);
                      }}
                    >
                      {selectedPost.author?.profile_picture ? (
                        <Image
                          source={{ uri: getImageUrl(selectedPost.author.profile_picture) }}
                          style={styles.modalAuthorAvatar}
                        />
                      ) : (
                        <View style={styles.modalAuthorAvatarPlaceholder}>
                          <Feather name="user" size={24} color="#666" />
                        </View>
                      )}
                      <View>
                        <Text style={styles.modalAuthorName}>
                          {selectedPost.author?.name || 'Unknown User'}
                        </Text>
                        <Text style={styles.modalPostTime}>
                          {formatDate(selectedPost.created_at)}
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {selectedPost.author?.id !== (currentUser?._id || currentUser?.id) && (
                      <TouchableOpacity
                        style={[
                          styles.modalFollowBtn,
                          selectedPost.isFollowingAuthor && styles.modalFollowingBtn
                        ]}
                        onPress={() => handleFollowToggle(
                          selectedPost.author?.id,
                          selectedPost.isFollowingAuthor || false
                        )}
                      >
                        <Text style={styles.modalFollowBtnText}>
                          {selectedPost.isFollowingAuthor ? 'Following' : 'Follow'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Post Caption */}
                  {selectedPost.caption && (
                    <View style={styles.modalCaption}>
                      <Text style={styles.modalCaptionText}>
                        {selectedPost.caption}
                      </Text>
                    </View>
                  )}

                  {/* Post Media Grid */}
                  {selectedPost.media && selectedPost.media.length > 0 && (
                    <View style={styles.modalMediaContainer}>
                      {selectedPost.media.slice(0, 3).map((file, index) => {
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
            {token && (
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
                  onPress={handleComment}
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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerIcon: {
    padding: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#999',
  },
  activeTabText: {
    color: '#007AFF',
  },
  listContent: {
    padding: 16,
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  authorAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  postTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  followBtn: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  followingBtn: {
    backgroundColor: '#e0e0e0',
  },
  followBtnText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
  },
  caption: {
    fontSize: 14,
    color: '#333',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  mediaContainer: {
    width: '100%',
    height: 300,
  },
  media: {
    width: '100%',
    height: '100%',
  },
  noMedia: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  postStats: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
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
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
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
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
  },
  loginBtn: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 16,
  },
  loginBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalAuthorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
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
  modalFollowBtn: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  modalFollowingBtn: {
    backgroundColor: '#e0e0e0',
  },
  modalFollowBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
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
  commentItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
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
  commentInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 80,
    marginRight: 8,
  },
  commentSendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentSendBtnDisabled: {
    backgroundColor: '#ccc',
  },
});

export default FeedScreen;