// src/pages/feed/Feed.jsx
import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import API_BASE_URL from '../config/api';
import '../style/Feed.css';
import profileAPI from '../services/profileAPI';
import {
  FaHeart,
  FaRegHeart,
  FaComment,
  FaShare,
  FaMusic,
  FaEllipsisH,
  FaUserCircle,
  FaSpinner,
  FaExclamationTriangle,
  FaUsers,
  FaSearch,
  FaTimes,
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeMute,
  FaBookmark,
  FaRegBookmark,
  FaHome,
  FaCompass,
  FaPlusSquare,
  FaInstagram,
  FaCheck,
  FaUserPlus,
  FaUserCheck,
  FaHeart as FaSolidHeart
} from 'react-icons/fa';

// Instagram Reels Player Component
const ReelsPlayer = ({ media, getImageUrl, onView, postId }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
        if (onView && postId) onView(postId);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  if (!media) return null;

  const isVideo = media.type?.startsWith('video') || 
                 (media.id || media).toString().includes('video');

  if (isVideo) {
    return (
      <div className="reels-player">
        <video
          ref={videoRef}
          src={getImageUrl(media.id || media)}
          className="reels-video"
          loop
          playsInline
          muted={isMuted}
          onClick={togglePlay}
        />
        <div className="video-controls">
          <button className="control-btn play-btn" onClick={togglePlay}>
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
          <button className="control-btn mute-btn" onClick={toggleMute}>
            {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <img
      src={getImageUrl(media.id || media)}
      alt="Post content"
      className="reels-image"
    />
  );
};

// Post Preview Modal Component
const PostPreviewModal = ({ post, onClose, onLike, onComment, onFollowToggle, currentUser, getImageUrl }) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(post?.isFollowingAuthor || false);

  if (!post) return null;

  const media = post.media || [];
  const currentMedia = media[currentMediaIndex];
  const hasLiked = post.likes?.some(like => 
    (like.user_id || like._id || like.id) === (currentUser?._id || currentUser?.id)
  );
  const authorId = post.author?._id || post.author?.id;
  const isCurrentUser = authorId === (currentUser?._id || currentUser?.id);

  const handlePrevMedia = () => {
    setCurrentMediaIndex(prev => prev > 0 ? prev - 1 : media.length - 1);
  };

  const handleNextMedia = () => {
    setCurrentMediaIndex(prev => prev < media.length - 1 ? prev + 1 : 0);
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onComment(post._id || post.id, commentText);
      setCommentText('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFollowClick = async (e) => {
    e.stopPropagation();
    if (!authorId || isCurrentUser) return;

    try {
      setIsFollowing(!isFollowing);
      await onFollowToggle(authorId, isFollowing);
    } catch (error) {
      setIsFollowing(isFollowing); // Revert on error
      console.error('Error toggling follow:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="instagram-modal-overlay" onClick={onClose}>
      <div className="instagram-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="instagram-close-btn" onClick={onClose}>
          <FaTimes />
        </button>

        <div className="instagram-modal-content">
          <div className="instagram-media-section">
            {media.length > 0 ? (
              <ReelsPlayer 
                media={currentMedia}
                getImageUrl={getImageUrl}
              />
            ) : (
              <div className="no-media-instagram">
                <FaUserCircle className="no-media-icon" />
                <p>No media available</p>
              </div>
            )}
          </div>

          <div className="instagram-info-section">
            <div className="instagram-header">
              <div className="instagram-author">
                {post.author?.profile_picture ? (
                  <img
                    src={getImageUrl(post.author.profile_picture)}
                    alt={post.author.name}
                    className="instagram-avatar"
                  />
                ) : (
                  <div className="instagram-avatar placeholder">
                    <FaUserCircle />
                  </div>
                )}
                <div className="instagram-author-info">
                  <h4>{post.author?.name || 'Unknown User'}</h4>
                  <span className="instagram-time">
                    {formatDate(post.created_at)}
                  </span>
                </div>
                {authorId && !isCurrentUser && (
                  <button 
                    className={`instagram-follow-btn ${isFollowing ? 'following' : ''}`}
                    onClick={handleFollowClick}
                  >
                    {isFollowing ? (
                      <>
                        <FaUserCheck className="follow-icon" />
                        Following
                      </>
                    ) : (
                      <>
                        <FaUserPlus className="follow-icon" />
                        Follow
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            <div className="instagram-comments-section">
              {post.caption && (
                <div className="instagram-caption">
                  <div className="comment-avatar">
                    {post.author?.profile_picture ? (
                      <img
                        src={getImageUrl(post.author.profile_picture)}
                        alt={post.author.name}
                      />
                    ) : (
                      <FaUserCircle />
                    )}
                  </div>
                  <div className="comment-content">
                    <div className="comment-header">
                      <span className="comment-author">{post.author?.name || 'Unknown User'}</span>
                      <span className="comment-text">{post.caption}</span>
                    </div>
                    <span className="comment-time">{formatDate(post.created_at)}</span>
                  </div>
                </div>
              )}

              <div className="instagram-comments-list">
                {post.comments && post.comments.length > 0 ? (
                  post.comments.map((comment, index) => (
                    <div key={index} className="instagram-comment-item">
                      <div className="comment-avatar">
                        {comment.profile_picture ? (
                          <img
                            src={getImageUrl(comment.profile_picture)}
                            alt={comment.user_name}
                          />
                        ) : (
                          <FaUserCircle />
                        )}
                      </div>
                      <div className="comment-content">
                        <div className="comment-header">
                          <span className="comment-author">{comment.user_name}</span>
                          <span className="comment-text">{comment.comment}</span>
                        </div>
                        <div className="comment-footer">
                          <span className="comment-time">{formatDate(comment.created_at)}</span>
                          <button className="comment-like-btn">Like</button>
                          <button className="comment-reply-btn">Reply</button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-comments">
                    <p>No comments yet.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="instagram-actions">
              <div className="main-actions">
                <button 
                  className={`action-btn like-btn ${hasLiked ? 'liked' : ''}`}
                  onClick={() => onLike(post._id || post.id, hasLiked)}
                >
                  {hasLiked ? <FaSolidHeart /> : <FaRegHeart />}
                </button>
                <button className="action-btn comment-btn">
                  <FaComment />
                </button>
                <button className="action-btn share-btn">
                  <FaShare />
                </button>
                <button 
                  className={`action-btn bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
                  onClick={() => setIsBookmarked(!isBookmarked)}
                >
                  {isBookmarked ? <FaBookmark /> : <FaRegBookmark />}
                </button>
              </div>
            </div>

            <div className="instagram-stats">
              <span className="stat">{post.likes?.length || 0} likes</span>
              <span className="stat">{formatDate(post.created_at)}</span>
            </div>

            <form onSubmit={handleSubmitComment} className="instagram-comment-form">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="comment-input"
                disabled={isSubmitting}
              />
              <button 
                type="submit" 
                disabled={!commentText.trim() || isSubmitting}
                className="comment-submit-btn"
              >
                Post
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Feed Component
const ReelsFeed = () => {
  const { token, user: currentUser } = useContext(AuthContext);
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('reels');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [previewReel, setPreviewReel] = useState(null);
  const [followingMap, setFollowingMap] = useState({});
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const getImageUrl = (fileId) => {
    if (!fileId) return '/placeholder-avatar.png';
    return `${API_BASE_URL}/profiles/image/${fileId}`;
  };

  // Fetch following list
  const fetchFollowingMap = useCallback(async () => {
    if (!token || !currentUser?.id) return;
    
    try {
      const followingList = await profileAPI.getFollowing(currentUser.id, token);
      const map = {};
      followingList.forEach(user => {
        const userId = user._id || user.id;
        if (userId) {
          map[userId] = true;
        }
      });
      setFollowingMap(map);
    } catch (err) {
      console.error('Error fetching following list:', err);
    }
  }, [token, currentUser?.id]);

  // Refresh following list
  const refreshFollowing = async () => {
    if (!token || !currentUser?.id) return;
    
    try {
      const followingList = await profileAPI.getFollowing(currentUser.id, token);
      const map = {};
      followingList.forEach(user => {
        const userId = user._id || user.id;
        if (userId) {
          map[userId] = true;
        }
      });
      setFollowingMap(map);
    } catch (err) {
      console.error('Error refreshing following list:', err);
    }
  };

  // Fetch reels
  const fetchReels = useCallback(async (pageNum = 1, isLoadMore = false) => {
    try {
      setLoading(true);
      setError('');

      const endpoint = activeTab === 'reels' 
        ? `${API_BASE_URL}/profiles/posts/feed/me?page=${pageNum}&limit=10`
        : `${API_BASE_URL}/profiles/posts/feed/discovery?page=${pageNum}&limit=10`;

      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      };

      const response = await fetch(endpoint, { headers });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch reels: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const newReels = data.posts || data.reels || [];
      
      // Enhance reels with following status
      const enhancedReels = newReels.map(reel => {
        const authorId = reel.author?._id || reel.author?.id;
        return {
          ...reel,
          isFollowingAuthor: authorId ? followingMap[authorId] || false : false
        };
      });

      if (isLoadMore) {
        setReels(prev => [...prev, ...enhancedReels]);
      } else {
        setReels(enhancedReels);
      }
      
      setHasMore(data.has_more || false);
      setPage(pageNum);
      
    } catch (err) {
      console.error('Error fetching reels:', err);
      setError(err.message || 'Failed to load reels. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [activeTab, token, followingMap]);

  // Show notification
  const showNotification = (message, severity = 'info') => {
    setNotification({ open: true, message, severity });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, open: false }));
    }, 3000);
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
    setHasMore(true);
    setReels([]);
  };

  // Handle follow/unfollow
  const handleFollowToggle = async (profileId, currentlyFollowing) => {
    if (!token) {
      showNotification('Please login to follow users', 'error');
      return;
    }

    try {
      if (currentlyFollowing) {
        await profileAPI.unfollowUser(profileId, token);
        showNotification('Unfollowed successfully', 'success');
      } else {
        await profileAPI.followUser(profileId, token);
        showNotification('Followed successfully', 'success');
      }

      // Refresh following map
      await refreshFollowing();

      // Update reels state
      setReels(prev => prev.map(reel => {
        const authorId = reel.author?._id || reel.author?.id;
        if (authorId === profileId) {
          return {
            ...reel,
            isFollowingAuthor: !currentlyFollowing
          };
        }
        return reel;
      }));

    } catch (err) {
      console.error('Failed to follow/unfollow:', err);
      showNotification('Failed to follow user. Please try again.', 'error');
    }
  };

  // Handle like/unlike
  const handleLike = async (reelId, currentlyLiked) => {
    if (!token) {
      showNotification('Please login to like reels', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/profiles/posts/${reelId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to like reel');
      }

      // Optimistically update UI
      setReels(prev => prev.map(reel => {
        if ((reel._id || reel.id) === reelId) {
          const updatedLikes = currentlyLiked 
            ? reel.likes.filter(like => (like.user_id || like._id) !== (currentUser?._id || currentUser?.id))
            : [...reel.likes, { 
                user_id: currentUser?._id || currentUser?.id, 
                user_name: currentUser?.name || 'You', 
                liked_at: new Date().toISOString() 
              }];
          
          return {
            ...reel,
            likes: updatedLikes,
            has_liked: !currentlyLiked
          };
        }
        return reel;
      }));

      showNotification(currentlyLiked ? 'Unliked' : 'Liked', 'success');
    } catch (err) {
      console.error('Error liking reel:', err);
      showNotification('Failed to like reel. Please try again.', 'error');
    }
  };

  // Handle comment submission
  const handleComment = async (reelId, commentText) => {
    if (!token) {
      showNotification('Please login to comment', 'error');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('comment', commentText);

      const response = await fetch(`${API_BASE_URL}/profiles/posts/${reelId}/comment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      // Refresh the specific reel to get updated comments
      const updatedReel = await fetch(`${API_BASE_URL}/profiles/post/${reelId}`).then(res => {
        if (!res.ok) throw new Error('Failed to fetch updated reel');
        return res.json();
      });

      setReels(prev => prev.map(reel => 
        (reel._id || reel.id) === reelId ? { ...reel, comments: updatedReel.comments || [] } : reel
      ));

      showNotification('Comment added successfully', 'success');
    } catch (err) {
      console.error('Error adding comment:', err);
      showNotification('Failed to add comment. Please try again.', 'error');
    }
  };

  // Handle view reel
  const handleView = async (reelId) => {
    if (!token) return;

    try {
      await fetch(`${API_BASE_URL}/profiles/posts/${reelId}/view`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (err) {
      console.error('Error recording view:', err);
    }
  };

  // Load more reels
  const loadMore = () => {
    if (!loading && hasMore) {
      fetchReels(page + 1, true);
    }
  };

  // Open reel preview
  const openReelPreview = (reel) => {
    setPreviewReel(reel);
    if (token) handleView(reel._id || reel.id);
  };

  // Close reel preview
  const closeReelPreview = () => {
    setPreviewReel(null);
  };

  // Handle share
  const handleShare = async (reel) => {
    const reelUrl = `${window.location.origin}/reel/${reel._id || reel.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this reel!',
          text: reel.caption || 'Interesting reel',
          url: reelUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(reelUrl);
        showNotification('Reel link copied to clipboard!', 'success');
      } catch (err) {
        console.error('Error copying to clipboard:', err);
        showNotification('Failed to copy link', 'error');
      }
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Handle follow button click on card
  const handleCardFollowClick = (e, authorId, isCurrentlyFollowing) => {
    e.stopPropagation();
    handleFollowToggle(authorId, isCurrentlyFollowing);
  };

  // Initial load
  useEffect(() => {
    fetchFollowingMap();
  }, [fetchFollowingMap]);

  useEffect(() => {
    fetchReels(1, false);
  }, [activeTab, fetchReels]);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 100) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore]);

  if (loading && reels.length === 0) {
    return (
      // <div className="reels-loading">
      //   <FaSpinner className="spinner-large" />
      //   <p>Loading reels...</p>
      // </div>
      <div className="brand-dashboard-loader">
        <div className="brand-loader-spinner"></div>
        <p>Loading posts...</p>
      </div>
    );
  }

  return (
    <div className="instagram-reels-page">
      {/* Notification */}
      {notification.open && (
        <div className={`notification ${notification.severity}`}>
          <div className="notification-content">
            {notification.message}
            <button 
              className="notification-close"
              onClick={() => setNotification(prev => ({ ...prev, open: false }))}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Instagram-like Header */}
      <div className="instagram-header-container">
        <div className="instagram-header">
          <div className="instagram-logo">
            <span className="logo-text">Feed</span>
          </div>
          <div className="instagram-search">
            <FaSearch />
            <input type="text" placeholder="Search" />
          </div>
          <div className="instagram-nav">
            <button className="nav-btn active">
              <FaHome />
            </button>
            <button className="nav-btn user-avatar">
              {currentUser?.profile_picture ? (
                <img src={getImageUrl(currentUser.profile_picture)} alt={currentUser.name} />
              ) : (
                <FaUserCircle />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Reels Tabs */}
      <div className="reels-tabs-container">
        <div className="reels-tabs">
          <button
            onClick={() => handleTabChange('reels')}
            className={`reels-tab ${activeTab === 'reels' ? 'active' : ''}`}
          >
            For You
          </button>
          <button
            onClick={() => handleTabChange('following')}
            className={`reels-tab ${activeTab === 'following' ? 'active' : ''}`}
            disabled={!token}
          >
            Following
            {!token && <span className="tab-hint">(Login required)</span>}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="reels-error">
          <FaExclamationTriangle />
          <p>{error}</p>
          <button onClick={() => fetchReels(1, false)} className="retry-btn">
            Try Again
          </button>
        </div>
      )}

      {/* Reels Grid */}
      <div className="reels-content">
        {reels.length === 0 && !loading ? (
          <div className="reels-empty">
            <FaUsers className="empty-icon" />
            <h3>No reels yet</h3>
            <p>
              {activeTab === 'following' && !token
                ? "Login to see reels from accounts you follow"
                : activeTab === 'following'
                ? "Follow some creators to see their posts here!"
                : "No reels available at the moment. Create one!"
              }
            </p>
            {!token && (
              <button 
                onClick={() => window.location.href = '/login'}
                className="login-btn"
              >
                Login to see reels
              </button>
            )}
          </div>
        ) : (
          <div className="reels-grid">
            {reels.map((reel) => {
              const hasLiked = reel.likes?.some(like => 
                (like.user_id || like._id) === (currentUser?._id || currentUser?.id)
              );
              const authorId = reel.author?._id || reel.author?.id;
              const isFollowingAuthor = reel.isFollowingAuthor || false;
              const isCurrentUser = authorId === (currentUser?._id || currentUser?.id);
              
              return (
                <div 
                  key={reel._id || reel.id} 
                  className="reel-card"
                  onClick={() => openReelPreview(reel)}
                >
                  <div className="reel-media-container">
                    <ReelsPlayer 
                      media={reel.media?.[0]}
                      getImageUrl={getImageUrl}
                      onView={handleView}
                      postId={reel._id || reel.id}
                    />
                    
                    <div className="reel-overlay">
                      <div className="reel-author-info">
                        {reel.author?.profile_picture ? (
                          <img
                            src={getImageUrl(reel.author.profile_picture)}
                            alt={reel.author.name}
                            className="reel-author-avatar"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (reel.author?.profile_url) {
                                window.location.href = reel.author.profile_url;
                              }
                            }}
                          />
                        ) : (
                          <div className="reel-author-avatar placeholder">
                            <FaUserCircle />
                          </div>
                        )}
                        <span className="reel-author-name">
                          {reel.author?.name || 'Unknown User'}
                        </span>
                        {!isCurrentUser && authorId && (
                          <button 
                            className={`follow-btn-small ${isFollowingAuthor ? 'following' : ''}`}
                            onClick={(e) => handleCardFollowClick(e, authorId, isFollowingAuthor)}
                          >
                            {isFollowingAuthor ? (
                              <>
                                <FaUserCheck className="follow-icon" />
                                Following
                              </>
                            ) : (
                              <>
                                <FaUserPlus className="follow-icon" />
                                Follow
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      {reel.caption && (
                        <div className="reel-caption">
                          <p>{reel.caption}</p>
                        </div>
                      )}

                      <div className="reel-sidebar-actions">
                        <button 
                          className={`sidebar-action-btn like-btn ${hasLiked ? 'liked' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLike(reel._id || reel.id, hasLiked);
                          }}
                        >
                          {hasLiked ? <FaSolidHeart /> : <FaRegHeart />}
                          <span>{reel.likes?.length || 0}</span>
                        </button>
                        <button 
                          className="sidebar-action-btn comment-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            openReelPreview(reel);
                          }}
                        >
                          <FaComment />
                          <span>{reel.comments?.length || 0}</span>
                        </button>
                        <button 
                          className="sidebar-action-btn share-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare(reel);
                          }}
                        >
                          <FaShare />
                          <span>Share</span>
                        </button>
                        <button className="sidebar-action-btn more-btn">
                          <FaEllipsisH />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="reel-stats">
                    <span className="reel-stat">
                      {reel.likes?.length || 0} likes
                    </span>
                    <span className="reel-stat">
                      {reel.comments?.length || 0} comments
                    </span>
                    <span className="reel-time">
                      {formatDate(reel.created_at)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {loading && reels.length > 0 && (
          // <div className="loading-more">
          //   <FaSpinner className="spinner" />
          //   <p>Loading more Feeds...</p>
          // </div>
          <div className="brand-dashboard-loader">
        <div className="brand-loader-spinner"></div>
        <p>Loading your more feeds...</p>
      </div>
        )}

        {!hasMore && reels.length > 0 && (
          <div className="no-more-reels">
            <p>You've seen all reels for now</p>
          </div>
        )}
      </div>

      {/* Reel Preview Modal */}
      {previewReel && (
        <PostPreviewModal
          post={previewReel}
          onClose={closeReelPreview}
          onLike={handleLike}
          onComment={handleComment}
          onFollowToggle={handleFollowToggle}
          currentUser={currentUser}
          getImageUrl={getImageUrl}
        />
      )}

      {/* Bottom Navigation */}
      <div className="instagram-bottom-nav">
        <button className="bottom-nav-btn active">
          <FaHome />
          <span>Home</span>
        </button>
        <button className="bottom-nav-btn">
          <FaSearch />
          <span>Search</span>
        </button>
        <button className="bottom-nav-btn">
          <FaPlusSquare />
          <span>Create</span>
        </button>
        <button className="bottom-nav-btn">
          <FaCompass />
          <span>Explore</span>
        </button>
        <button className="bottom-nav-btn">
          {currentUser?.profile_picture ? (
            <img 
              src={getImageUrl(currentUser.profile_picture)} 
              alt={currentUser.name}
              className="bottom-nav-avatar"
            />
          ) : (
            <FaUserCircle />
          )}
          <span>Profile</span>
        </button>
      </div>
    </div>
  );
};

export default ReelsFeed;