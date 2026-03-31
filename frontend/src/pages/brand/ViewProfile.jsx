// src/pages/profile/ViewProfile.jsx
import React, { useEffect, useState, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import profileAPI from "../../services/profileAPI";
import API_BASE_URL from "../../config/api";
import "../../style/ViewProfile.css";
import {
  FaInstagram,
  FaYoutube,
  FaTiktok,
  FaLinkedin,
  FaFacebook,
  FaLink,
  FaHeart,
  FaRegComment,
  FaShare,
  FaEye,
  FaArrowLeft,
  FaUsers,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
  FaGlobe,
  FaBullseye,
  FaTags,
  FaUserCircle,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

// ---------------- POST PREVIEW MODAL ----------------
const PostPreviewModal = ({ post, profile, onClose, onPrev, onNext, getImageUrl }) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  if (!post) return null;

  const media = post.media || [];
  const currentMedia = media[currentMediaIndex];

  const handlePrevMedia = () => {
    setCurrentMediaIndex((prev) => (prev > 0 ? prev - 1 : media.length - 1));
  };

  const handleNextMedia = () => {
    setCurrentMediaIndex((prev) => (prev < media.length - 1 ? prev + 1 : 0));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="post-preview-overlay" onClick={onClose}>
      <div className="post-preview-container" onClick={(e) => e.stopPropagation()}>
        
        {/* Close Button */}
        <button className="preview-close-btn" onClick={onClose}>
          <FaTimes />
        </button>

        {/* Navigation Buttons for Posts */}
        {onPrev && (
          <button className="preview-nav-btn prev-post" onClick={onPrev}>
            <FaChevronLeft />
          </button>
        )}
        {onNext && (
          <button className="preview-nav-btn next-post" onClick={onNext}>
            <FaChevronRight />
          </button>
        )}

        <div className="post-preview-content">
          
          {/* Media Section */}
          <div className="preview-media-section">
            {media.length > 0 ? (
              <>
                {(() => {
                  const fileId = currentMedia.id || currentMedia;
                  const url = getImageUrl(fileId);
                  if (currentMedia.type?.startsWith("video") || url.endsWith(".mp4") || url.includes("video")) {
                    return <video src={url} controls className="preview-media" />;
                  }
                  return <img src={url} alt="post" className="preview-media" />;
                })()}

                {/* Media Navigation */}
                {media.length > 1 && (
                  <>
                    <button className="media-nav-btn prev" onClick={handlePrevMedia}>
                      <FaChevronLeft />
                    </button>
                    <button className="media-nav-btn next" onClick={handleNextMedia}>
                      <FaChevronRight />
                    </button>
                    <div className="media-indicators">
                      {media.map((_, idx) => (
                        <span
                          key={idx}
                          className={`indicator ${idx === currentMediaIndex ? 'active' : ''}`}
                          onClick={() => setCurrentMediaIndex(idx)}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="no-media-preview">No media</div>
            )}
          </div>

          {/* Info Section */}
          <div className="preview-info-section">
            {/* Header */}
            <div className="preview-header">
              {(profile.logo || profile.profile_picture) ? (
                <img
                  src={getImageUrl(profile.logo || profile.profile_picture)}
                  alt="profile"
                  className="preview-avatar"
                />
              ) : (
                <div className="preview-avatar-placeholder">
                  <FaUserCircle />
                </div>
              )}
              <div>
                <h3>{profile.company_name || profile.full_name || "User"}</h3>
                <p className="preview-time">
                  {post.created_at && formatDate(post.created_at)}
                </p>
              </div>
            </div>

            {/* Caption */}
            {post.caption && (
              <div className="preview-caption">
                <p>{post.caption}</p>
              </div>
            )}

            {/* Stats */}
            <div className="preview-stats">
              <span><FaHeart /> {post.likes?.length || 0} likes</span>
              <span><FaRegComment /> {post.comments?.length || 0} comments</span>
              <span><FaEye /> {post.views?.length || 0} views</span>
            </div>

            {/* Comments */}
            <div className="preview-comments">
              <h4>Comments ({post.comments?.length || 0})</h4>
              <div className="preview-comments-list">
                {post.comments && post.comments.length > 0 ? (
                  [...post.comments]
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .map((c, idx) => {
                      const commentText = c.comment || c.text || c.content || c.body;
                      const userName = c.user_name || c.username || "Unknown User";
                      const userAvatar = c.profile_picture;

                      if (!commentText || !commentText.trim()) return null;

                      return (
                        <div key={idx} className="comment-item-preview">
                          {userAvatar ? (
                            <img 
                              src={getImageUrl(userAvatar)} 
                              alt="avatar" 
                              className="comment-avatar-preview"
                            />
                          ) : (
                            <div className="comment-avatar-preview">
                              <span>{(userName || "U")[0].toUpperCase()}</span>
                            </div>
                          )}
                          <div className="comment-content-preview">
                            <p className="comment-author-preview">{userName}</p>
                            <p className="comment-text-preview">{commentText}</p>
                            {c.created_at && (
                              <p className="comment-time-preview">{formatDate(c.created_at)}</p>
                            )}
                          </div>
                        </div>
                      );
                    }).filter(Boolean)
                ) : (
                  <p className="no-comments-text-preview">No comments yet. Be the first to comment!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------------- USERS MODAL ----------------
const UsersModal = ({ open, onClose, title, users, getImageUrl }) => {
  if (!open) return null;
  
  return (
    <div className="modal-overlay-view" onClick={onClose}>
      <div className="modal-content-view" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-view">
          <h3>{title}</h3>
          <button onClick={onClose} className="modal-close-btn-view">×</button>
        </div>
        <div className="modal-body-view">
          {users.length === 0 ? (
            <p className="no-users-text-view">No users yet.</p>
          ) : (
            <div className="users-list-view">
              {users.map((user) => (
                <div key={user._id || user.id} className="user-item-view">
                  {user.profile_picture ? (
                    <img
                      src={getImageUrl(user.profile_picture)}
                      alt={user.user_name || user.username}
                      className="user-avatar-view"
                    />
                  ) : (
                    <div className="user-avatar-view placeholder">
                      <span>{(user.user_name || user.username || "U")[0].toUpperCase()}</span>
                    </div>
                  )}
                  <div className="user-info-view">
                    <span className="user-name-view">{user.user_name || user.username || "Unknown User"}</span>
                    {user.email && <span className="user-email-view">{user.email}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ViewProfile = () => {
  const { token, user: currentUser } = useContext(AuthContext);
  const { type, id } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);

  const [previewPost, setPreviewPost] = useState(null);
  const [previewIndex, setPreviewIndex] = useState(null);
  const [commentToggles, setCommentToggles] = useState({});

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalUsers, setModalUsers] = useState([]);

  const getImageUrl = (fileId) => `${API_BASE_URL}/profiles/image/${fileId}`;

  // ---------------- FETCH PROFILE DATA ----------------
  const fetchProfileData = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      // Fetch profile
      const profileRes = await profileAPI.getProfileById(id);
      const fetchedProfile = profileRes.profile || profileRes;
      
      if (!fetchedProfile) {
        throw new Error("Profile not found");
      }

      setProfile(fetchedProfile);
      const profileId = fetchedProfile._id || fetchedProfile.id || id;

      // Fetch all data in parallel
      const [postsData, followersData, followingData] = await Promise.all([
        profileAPI.getUserPosts(profileId),
        profileAPI.getFollowers(profileId),
        profileAPI.getFollowing(profileId)
      ]);

      setPosts(postsData || []);
      setFollowers(followersData || []);
      setFollowing(followingData || []);
      setFollowersCount(followersData.length);
      setFollowingCount(followingData.length);

      // Check if current user is following this profile
      if (token && currentUser) {
        const currentUserId = currentUser._id || currentUser.id;
        const myFollowing = await profileAPI.getFollowing(currentUserId);
        const isUserFollowing = myFollowing.some(f => 
          (f._id || f.id) === profileId
        );
        setIsFollowing(isUserFollowing);
      }

    } catch (err) {
      console.error("Error fetching profile data:", err);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [id, token, currentUser]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  // ---------------- FOLLOW / UNFOLLOW ----------------
  const handleFollowToggle = async () => {
    if (!token) {
      alert("Please login to follow users.");
      return;
    }

    try {
      const profileId = profile._id || profile.id || id;
      
      if (isFollowing) {
        await profileAPI.unfollowUser(profileId);
      } else {
        await profileAPI.followUser(profileId);
      }

      // Refresh follow data
      const [updatedFollowers, updatedFollowing] = await Promise.all([
        profileAPI.getFollowers(profileId),
        profileAPI.getFollowing(profileId)
      ]);

      setFollowers(updatedFollowers);
      setFollowersCount(updatedFollowers.length);
      setFollowing(updatedFollowing);
      setFollowingCount(updatedFollowing.length);
      setIsFollowing(!isFollowing);

    } catch (err) {
      console.error("Failed to follow/unfollow:", err);
      alert("Failed to update follow status");
    }
  };

  // ---------------- POST INTERACTIONS ----------------
  const handleLike = async (postId) => {
    if (!token) {
      alert("Please login to like posts.");
      return;
    }
    try {
      await profileAPI.likePost(postId);
      fetchProfileData(); // Refresh all data
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const handleViewPost = async (postId) => {
    if (!token) return;
    try {
      await profileAPI.viewPost(postId);
      fetchProfileData(); // Refresh all data
    } catch (err) {
      console.error("Error viewing post:", err);
    }
  };

  const handleComment = async (postId, comment) => {
    if (!token) {
      alert("Please login to comment.");
      return;
    }
    if (!comment.trim()) return;
    
    try {
      await profileAPI.commentPost(postId, comment);
      fetchProfileData(); // Refresh all data
    } catch (err) {
      console.error("Error commenting:", err);
    }
  };

  // ---------------- MODAL MANAGEMENT ----------------
  // ---------------- MODAL MANAGEMENT ----------------
const openModal = async (title, postId, modalType) => {
  try {
    let users = [];
    if (modalType === "likes") {
      users = await profileAPI.getPostLikes(postId);
    } else if (modalType === "views") {
      users = await profileAPI.getPostViews(postId);
    }
    // Removed followers and following from modal - now using navigation

    setModalTitle(title);
    setModalUsers(users);
    setModalOpen(true);
  } catch (err) {
    console.error("Error fetching users for modal:", err);
  }
};

  // ---------------- POST PREVIEW ----------------
  const openPostPreview = (post, index) => {
    setPreviewPost(post);
    setPreviewIndex(index);
    if (token) handleViewPost(post._id || post.id);
  };

  const closePostPreview = () => {
    setPreviewPost(null);
    setPreviewIndex(null);
  };

  const showPrevPost = () => {
    if (previewIndex > 0) {
      const newIndex = previewIndex - 1;
      setPreviewIndex(newIndex);
      setPreviewPost(posts[newIndex]);
    }
  };

  const showNextPost = () => {
    if (previewIndex < posts.length - 1) {
      const newIndex = previewIndex + 1;
      setPreviewIndex(newIndex);
      setPreviewPost(posts[newIndex]);
    }
  };

  // ---------------- UTILITIES ----------------
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const toggleComments = (postId) => {
    setCommentToggles((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleShare = (post) => {
    if (navigator.share) {
      navigator.share({
        title: post.caption || "Check out this post!",
        text: "Check this post!",
        url: window.location.href,
      }).catch((err) => console.error("Error sharing:", err));
    } else {
      alert("Sharing not supported in this browser.");
    }
  };

  // ---------------- RENDER LOGIC ----------------
  if (loading) {
    return (
      <div className="brand-dashboard-loader">
        <div className="brand-loader-spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="loading-container-view">
        <div className="loading-text-view">Profile not found.</div>
      </div>
    );
  }

  const profileId = profile._id || profile.id || id;
  const isBrand = !!profile.company_name;
  const displayName = profile.company_name || profile.full_name || profile.nickname || "Unnamed User";
  const socialLinks = profile.social_links || {};

  const socialIcons = {
    instagram: <FaInstagram className="social-icon-view instagram" />,
    youtube: <FaYoutube className="social-icon-view youtube" />,
    tiktok: <FaTiktok className="social-icon-view tiktok" />,
    linkedin: <FaLinkedin className="social-icon-view linkedin" />,
    facebook: <FaFacebook className="social-icon-view facebook" />,
    other: <FaLink className="social-icon-view other" />,
  };

  const isOwnProfile = currentUser && (currentUser._id === profileId || currentUser.id === profileId);

  return (
    <div className="view-profile-layout">
      <div className="view-container-wrapper">
        
        {/* ---------------- LEFT SIDEBAR ---------------- */}
        <aside className="view-sidebar">
          <div className="view-sidebar-content">
            
            {/* Profile Card */}
            <div className="view-profile-card">
              {/* Background Image */}
              {profile.bg_image ? (
                <div className="view-bg-header">
                  <img src={getImageUrl(profile.bg_image)} alt="Background" />
                </div>
              ) : (
                <div className="view-bg-header gradient-bg-view"></div>
              )}

              {/* Profile Picture/Logo */}
              <div className="view-picture-container">
                <div className="view-picture-wrapper">
                  {(profile.logo || profile.profile_picture) ? (
                    <img
                      src={getImageUrl(profile.logo || profile.profile_picture)}
                      alt={displayName}
                      className="view-picture-img"
                    />
                  ) : (
                    <div className="view-picture-placeholder">
                      <FaUserCircle />
                    </div>
                  )}
                </div>
              </div>

              {/* Name & Type */}
              <div className="view-name-section">
                <h1>{displayName}</h1>
                <span className="profile-type-badge">{type.toUpperCase()}</span>
                {profile.nickname && !isBrand && <p className="nickname-view">@{profile.nickname}</p>}
              </div>

              {/* Bio */}
              {profile.bio && (
                <div className="view-bio">
                  <p>{profile.bio}</p>
                </div>
              )}

              {/* Follow Button */}
              {!isOwnProfile && token && (
                <div className="follow-button-container">
                  <button
                    className={`follow-btn-view ${isFollowing ? "following" : ""}`}
                    onClick={handleFollowToggle}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </button>
                </div>
              )}

              {/* Stats */}
              {/* Stats */}
<div className="view-stats">
  <button 
    onClick={() => navigate(`/${currentUser?.role || 'brand'}/profiles/connections/${profileId}?type=followers`)}
    className="stat-item-view"
  >
    <div className="stat-number-view">{followersCount}</div>
    <div className="stat-label-view">Followers</div>
  </button>
  <button 
    onClick={() => navigate(`/${currentUser?.role || 'brand'}/profiles/connections/${profileId}?type=following`)}
    className="stat-item-view"
  >
    <div className="stat-number-view">{followingCount}</div>
    <div className="stat-label-view">Following</div>
  </button>
  <div className="stat-item-view">
    <div className="stat-number-view">{posts.length}</div>
    <div className="stat-label-view">Posts</div>
  </div>
</div>

              {/* Contact Info */}
              <div className="view-info-section">
                {profile.email && (
                  <div className="info-item-view">
                    <FaEnvelope className="info-icon-view" />
                    <span className="truncate-view">{profile.email}</span>
                  </div>
                )}
                {profile.phone_number && (
                  <div className="info-item-view">
                    <FaPhone className="info-icon-view" />
                    <span>{profile.phone_number}</span>
                  </div>
                )}
                {profile.website && (
                  <div className="info-item-view">
                    <FaGlobe className="info-icon-view" />
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="info-link-view">
                      {profile.website}
                    </a>
                  </div>
                )}
                {profile.location && (
                  <div className="info-item-view">
                    <FaMapMarkerAlt className="info-icon-view" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.contact_person_name && (
                  <div className="info-item-view">
                    <FaUsers className="info-icon-view" />
                    <span>{profile.contact_person_name}</span>
                  </div>
                )}
                {profile.target_audience && (
                  <div className="info-item-view">
                    <FaBullseye className="info-icon-view" />
                    <span>{profile.target_audience}</span>
                  </div>
                )}
                {(profile.categories || profile.niches) && (
                  <div className="info-item-view">
                    <FaTags className="info-icon-view" />
                    <div className="categories-tags-view">
                      {(profile.categories || profile.niches).map((cat, idx) => (
                        <span key={idx} className="category-tag-view">{cat}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Social Links */}
              {Object.keys(socialLinks).length > 0 && (
                <div className="view-social-section">
                  <div className="view-social-grid">
                    {Object.entries(socialLinks).map(([platform, url]) =>
                      url ? (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="social-link-btn-view"
                        >
                          {socialIcons[platform] || socialIcons.other}
                          <span>{platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
                        </a>
                      ) : null
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="view-actions-section">
                <button onClick={() => navigate(-1)} className="action-btn-view secondary-view">
                  <FaArrowLeft /> Back
                </button>
                <button 
                  onClick={() => navigate(`/${currentUser?.role || 'brand'}/profiles/public`)} 
                  className="action-btn-view primary-view"
                >
                  <FaUsers /> View Profiles
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* ---------------- RIGHT CONTENT ---------------- */}
        <main className="view-main-content">
          
          {/* Posts Feed */}
          <div className="posts-feed-view">
            <h2 className="posts-title">{isBrand ? "Brand Posts" : "Posts"} ({posts.length})</h2>
            
            {posts.length === 0 ? (
              <div className="no-posts-card-view">
                <FaRegComment className="no-posts-icon-view" />
                <p>No posts yet.</p>
              </div>
            ) : (
              posts.map((post, index) => (
                <article key={post._id || post.id} className="post-card-view">
                  
                  {/* Post Header */}
                  <div className="post-header-view">
                    {(profile.logo || profile.profile_picture) ? (
                      <img
                        src={getImageUrl(profile.logo || profile.profile_picture)}
                        alt="Profile"
                        className="post-author-avatar-view"
                      />
                    ) : (
                      <div className="post-author-avatar-placeholder-view">
                        <FaUserCircle />
                      </div>
                    )}
                    <div className="post-author-info-view">
                      <h3>{displayName}</h3>
                      {profile.nickname && !isBrand && (
                        <span className="post-nickname-view">@{profile.nickname}</span>
                      )}
                      <p>{formatDate(post.created_at)}</p>
                    </div>
                  </div>

                  {/* Post Caption */}
                  {post.caption && (
                    <div className="post-caption-view">
                      <p>{post.caption}</p>
                    </div>
                  )}

                  {/* Post Media Grid */}
                  {post.media && post.media.length > 0 && (
                    <div
                      className={`post-media-grid-view grid-view-${Math.min(post.media.length, 4)}`}
                      onClick={() => openPostPreview(post, index)}
                    >
                      {post.media.slice(0, 4).map((file, idx) => {
                        const fileId = file.id || file;
                        const url = getImageUrl(fileId);
                        const isLast = idx === 3 && post.media.length > 4;
                        
                        if (file.type?.startsWith("video") || url.endsWith(".mp4") || url.includes("video")) {
                          return (
                            <div key={fileId} className="post-media-item-view video-view">
                              <video src={url} className="media-content" />
                              {isLast && (
                                <div className="more-media-overlay">
                                  +{post.media.length - 4}
                                </div>
                              )}
                            </div>
                          );
                        }
                        return (
                          <div key={fileId} className={`post-media-item-view ${post.media.length === 1 ? 'single-view' : ''}`}>
                            <img src={url} alt="post" className="media-content" />
                            {isLast && (
                              <div className="more-media-overlay">
                                +{post.media.length - 4}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Post Stats */}
                  <div className="post-stats-bar-view">
                    <button onClick={() => openModal("Likes", post._id || post.id, "likes")} className="stat-btn-view">
                      {post.likes?.length || 0} likes
                    </button>
                    <div className="stat-group-view">
                      <button onClick={() => toggleComments(post._id || post.id)} className="stat-btn-view">
                        {post.comments?.length || 0} comments
                      </button>
                      <button onClick={() => openModal("Views", post._id || post.id, "views")} className="stat-btn-view">
                        {post.views?.length || 0} views
                      </button>
                    </div>
                  </div>

                  {/* Post Actions */}
                  {token && (
                    <div className="post-actions-bar-view">
                      <button
                        onClick={() => handleLike(post._id || post.id)}
                        className={`post-action-btn-view ${
                          post.likes?.some(like => 
                            (like._id || like.id) === (currentUser?._id || currentUser?.id)
                          ) ? 'liked-view' : ''
                        }`}
                      >
                        <FaHeart />
                        <span>Like</span>
                      </button>
                      <button onClick={() => toggleComments(post._id || post.id)} className="post-action-btn-view">
                        <FaRegComment />
                        <span>Comment</span>
                      </button>
                      <button onClick={() => handleShare(post)} className="post-action-btn-view">
                        <FaShare />
                        <span>Share</span>
                      </button>
                    </div>
                  )}

                  {/* Comments Section */}
                  {commentToggles[post._id || post.id] && (
                    <div className="comments-section-view">
                      <div className="comments-list-view">
                        {post.comments && post.comments.length > 0 ? (
                          [...post.comments]
                            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                            .map((c, idx) => {
                              const commentText = c.comment || c.text || c.content || c.body;
                              const userName = c.user_name || c.username || "Unknown User";
                              const userAvatar = c.profile_picture;

                              if (!commentText || !commentText.trim()) return null;

                              return (
                                <div key={idx} className="comment-item-view">
                                  {userAvatar ? (
                                    <img 
                                      src={getImageUrl(userAvatar)} 
                                      alt="avatar" 
                                      className="comment-avatar-view"
                                    />
                                  ) : (
                                    <div className="comment-avatar-view">
                                      <span>{(userName || "U")[0].toUpperCase()}</span>
                                    </div>
                                  )}
                                  <div className="comment-content-view">
                                    <p className="comment-author-view">{userName}</p>
                                    <p className="comment-text-view">{commentText}</p>
                                    {c.created_at && (
                                      <p className="comment-time-view">{formatDate(c.created_at)}</p>
                                    )}
                                  </div>
                                </div>
                              );
                            }).filter(Boolean)
                        ) : (
                          <p className="no-comments-text-view">No comments yet. Be the first to comment!</p>
                        )}
                      </div>
                      {token && (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            const comment = e.target.comment.value;
                            handleComment(post._id || post.id, comment);
                            e.target.reset();
                          }}
                          className="comment-form-view"
                        >
                          <input 
                            name="comment" 
                            placeholder="Write a comment..." 
                            className="comment-input-view" 
                            required
                          />
                          <button type="submit" className="comment-submit-btn-view">Post</button>
                        </form>
                      )}
                    </div>
                  )}
                </article>
              ))
            )}
          </div>
        </main>
      </div>

      {/* Post Preview Modal */}
      {previewPost && (
        <PostPreviewModal
          post={previewPost}
          profile={profile}
          onClose={closePostPreview}
          onPrev={previewIndex > 0 ? showPrevPost : null}
          onNext={previewIndex < posts.length - 1 ? showNextPost : null}
          getImageUrl={getImageUrl}
        />
      )}

      {/* Users Modal */}
      <UsersModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalTitle}
        users={modalUsers}
        getImageUrl={getImageUrl}
      />
    </div>
  );
};

export default ViewProfile;