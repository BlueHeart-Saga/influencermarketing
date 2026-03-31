// src/pages/influencer/InfluencerProfile.jsx
import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import profileAPI from "../../services/profileAPI";
import API_BASE_URL from "../../config/api";

import {
  FaInstagram,
  FaYoutube,
  FaLinkedin,
  FaTiktok,
  FaLink,
  FaHeart,
  FaRegComment,
  FaShare,
  FaEye,
  FaEdit,
  FaTrash,
  FaUsers,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
  FaGlobe,
  FaUserCircle,
} from "react-icons/fa";
import "../../style/InfluencerProfile.css";

// ---------------- USERS MODAL ----------------
const UsersModal = ({ open, onClose, title, users, getImageUrl }) => {
  if (!open) return null;
  return (
    <div className="modal-overlay-inf" onClick={onClose}>
      <div className="modal-content-inf" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-inf">
          <h3>{title}</h3>
          <button onClick={onClose} className="modal-close-btn-inf">×</button>
        </div>
        <div className="modal-body-inf">
          {users.length === 0 ? (
            <p className="no-users-text-inf">No users yet.</p>
          ) : (
            <div className="users-list-inf">
              {users.map((user, index) => {
                const userName = user.user_name || user.username || "Unknown User";
                const userAvatar = user.profile_picture;
                
                return (
                  <div key={user._id || user.id || index} className="user-item-inf">
                    {userAvatar ? (
                      <img
                        src={getImageUrl(userAvatar)}
                        alt={userName}
                        className="user-avatar-inf"
                      />
                    ) : (
                      <div className="user-avatar-inf placeholder">
                        <span>{(userName || "U")[0].toUpperCase()}</span>
                      </div>
                    )}
                    <div className="user-info-inf">
                      <span className="user-name-inf">{userName}</span>
                      {user.email && <span className="user-email-inf">{user.email}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DeleteConfirmationDialog = ({ isOpen, onClose, onConfirm, influencerName }) => {
  if (!isOpen) return null;

  return (
    <div className="influencer-dialog-overlay">
      <div className="influencer-dialog influencer-dialog-danger">
        <div className="influencer-dialog-warning-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0377 2.66667 10.2679 4L3.3397 16C2.56994 17.3333 3.53216 19 5.07183 19Z"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <h3 className="influencer-dialog-title">Delete Influencer Profile</h3>

        <div className="influencer-dialog-danger-content">
          <p className="influencer-dialog-message">
            Are you sure you want to delete <strong>"{influencerName}"</strong> profile?
          </p>

          <div className="influencer-dialog-risks">
            <h4>This action cannot be undone and will permanently:</h4>
            <ul>
              <li>Delete all your influencer information</li>
              <li>Remove your profile from search results</li>
              <li>Cancel any ongoing collaborations</li>
              <li>Delete your profile assets and images</li>
              <li>Remove your social media connections</li>
            </ul>
          </div>
        </div>

        <div className="influencer-dialog-actions">
          <button className="influencer-dialog-btn influencer-dialog-btn-danger" onClick={onConfirm}>
            Yes, Delete Permanently
          </button>

          <button className="influencer-dialog-btn influencer-dialog-btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};


const PostPreviewModal = ({ post, onClose, getImageUrl, formatDate }) => {
  if (!post) return null;

  return (
    <div className="post-preview-overlay" onClick={onClose}>
      <div className="post-preview-container" onClick={(e) => e.stopPropagation()}>
        
        {/* Close */}
        <button className="post-preview-close" onClick={onClose}>×</button>

        {/* Left – Media */}
        <div className="post-preview-media">
          {post.media?.length === 1 ? (
            post.media[0].type?.startsWith("video") ? (
              <video src={getImageUrl(post.media[0].id || post.media[0])} controls />
            ) : (
              <img src={getImageUrl(post.media[0].id || post.media[0])} alt="post" />
            )
          ) : (
            <div className="post-preview-media-grid">
              {post.media.map((m, i) =>
                m.type?.startsWith("video") ? (
                  <video key={i} src={getImageUrl(m.id || m)} controls />
                ) : (
                  <img key={i} src={getImageUrl(m.id || m)} alt="post" />
                )
              )}
            </div>
          )}
        </div>

        {/* Right – Details */}
        <div className="post-preview-details">

          <div className="post-preview-header">
            <strong>{post.author_name || "You"}</strong>
            <span>{formatDate(post.created_at)}</span>
          </div>

          {post.caption && (
            <p className="post-preview-caption">{post.caption}</p>
          )}

          <div className="post-preview-stats">
            <span>{post.likes?.length || 0} likes</span>
            <span>{post.comments?.length || 0} comments</span>
            <span>{post.views?.length || 0} views</span>
          </div>

        </div>
      </div>
    </div>
  );
};





const InfluencerProfile = () => {
  const { token, user: currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [posts, setPosts] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalUsers, setModalUsers] = useState([]);

  const [commentToggles, setCommentToggles] = useState({});
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [mediaPreviews, setMediaPreviews] = useState([]);
const [showDeleteDialog, setShowDeleteDialog] = useState(false);
const [previewPost, setPreviewPost] = useState(null);
const [showPostConfirm, setShowPostConfirm] = useState(false);
const [pendingPost, setPendingPost] = useState(null);
const [isPosting, setIsPosting] = useState(false);





  const getImageUrl = (fileId) => `${API_BASE_URL}/profiles/image/${fileId}`;
  const currentUserId = currentUser?._id || currentUser?.id;

  // ---------------- FETCH PROFILE ----------------
  useEffect(() => {
    if (!token) return;

    const fetchProfileData = async () => {
      setLoading(true);
      try {
        const res = await profileAPI.getMyProfile();
        if (res.type !== "influencer") {
          setMessage("No influencer profile found.");
          return;
        }
        setProfile(res.profile);
        const profileId = res.profile._id || res.profile.id;
        await fetchFollowersAndFollowing(profileId);
        await fetchPosts(profileId);
      } catch (err) {
        console.error(err);
        setMessage("Error fetching profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [token]);

  // ---------------- FETCH POSTS ----------------
  const fetchPosts = async (userId) => {
    try {
      const data = await profileAPI.getUserPosts(userId);
      if (data) {
        data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }
      setPosts(data || []);
    } catch (err) {
      console.error("Error fetching posts", err);
      setPosts([]);
    }
  };

  // ---------------- FETCH FOLLOWERS / FOLLOWING ----------------
  const fetchFollowersAndFollowing = async (userId) => {
    try {
      const [followersData, followingData] = await Promise.all([
        profileAPI.getFollowers(userId),
        profileAPI.getFollowing(userId)
      ]);
      setFollowers(followersData || []);
      setFollowing(followingData || []);
    } catch (err) {
      console.error("Error fetching followers/following", err);
      setFollowers([]);
      setFollowing([]);
    }
  };

  // ---------------- CREATE POST ----------------
  const handleCreatePost = async () => {
  if (!pendingPost) return;

  try {
    setIsPosting(true);

    await profileAPI.createPost(
      pendingPost.media.map(m => m.file),
      pendingPost.caption
    );

    // clear UI
    setMediaPreviews([]);
    setPendingPost(null);
    setShowPostConfirm(false);
    setShowCreatePost(false);

    // clear caption box
    const captionBox = document.querySelector('textarea[name="caption"]');
    if (captionBox) captionBox.value = "";

    // revoke object URLs
    pendingPost.media.forEach(m => URL.revokeObjectURL(m.url));

    // refresh posts
    await fetchPosts(profile._id || profile.id);

  } catch (err) {
    console.error("Error creating post", err);
  } finally {
    setIsPosting(false);
  }
};




useEffect(() => {
  return () => {
    mediaPreviews.forEach(m => URL.revokeObjectURL(m.url));
  };
}, [mediaPreviews]);

const CreatePostPreviewModal = ({ open, post, onClose, onConfirm }) => {
  if (!open || !post) return null;

  return (
    <div className="modal-overlay-inf" onClick={onClose}>
      <div className="modal-content-inf" onClick={(e) => e.stopPropagation()}>
        
        <div className="modal-header-inf">
          <h3>Preview Post</h3>
          <button className="modal-close-btn-inf" onClick={onClose}>×</button>
        </div>

        <div className="modal-body-inf">

          {post.caption && (
            <p style={{ marginBottom: "12px", fontSize: "15px" }}>
              {post.caption}
            </p>
          )}

          {post.media?.length > 0 && (
            <div className="post-media-grid-inf">
              {post.media.map((m, i) =>
                m.type.startsWith("video") ? (
                  <video key={i} src={m.url} controls className="post-media-item-inf" />
                ) : (
                  <img key={i} src={m.url} alt="preview" className="post-media-item-inf" />
                )
              )}
            </div>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", padding: "12px 16px" }}>
          <button className="cancel-post-btn-inf" onClick={onClose}>
            Edit
          </button>

          <button
  className="submit-post-btn-inf"
  onClick={onConfirm}
  disabled={isPosting}
>
  {isPosting ? "Posting..." : "Confirm & Post"}
</button>

        </div>
      </div>
    </div>
  );
};




  // ---------------- LIKE POST ----------------
  const handleLike = async (postId) => {
    try {
      // Update local state immediately
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if ((post._id || post.id) === postId) {
            const isCurrentlyLiked = post.likes?.some(like => 
              (like._id || like.id || like.user_id) === currentUserId
            );
            
            if (isCurrentlyLiked) {
              // Unlike: remove current user from likes
              return {
                ...post,
                likes: post.likes?.filter(like => 
                  (like._id || like.id || like.user_id) !== currentUserId
                ) || []
              };
            } else {
              // Like: add current user to likes
              const newLike = {
                _id: currentUserId,
                id: currentUserId,
                user_id: currentUserId,
                user_name: currentUser?.username || currentUser?.full_name || "You",
                profile_picture: currentUser?.profile_picture
              };
              
              return {
                ...post,
                likes: [...(post.likes || []), newLike]
              };
            }
          }
          return post;
        })
      );

      // Make API call
      await profileAPI.likePost(postId);

    } catch (err) {
      console.error("Error liking post", err);
      // Optional: Revert optimistic update on error
    }
  };

  // ---------------- VIEW POST ----------------
  const handleViewPost = async (postId) => {
    try {
      await profileAPI.viewPost(postId);
      // We don't need to update state for views as it's not displayed in real-time
    } catch (err) {
      console.error("Error viewing post:", err);
    }
  };

  // ---------------- COMMENT ON POST ----------------
  const toggleComments = (postId) => {
    setCommentToggles((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleComment = async (postId, commentText) => {
    if (!commentText.trim()) return;
    
    try {
      // Create new comment object for immediate display
      const newComment = {
        user_id: currentUserId,
        user_name: currentUser?.username || currentUser?.full_name || "You",
        profile_picture: currentUser?.profile_picture,
        comment: commentText,
        created_at: new Date().toISOString()
      };

      // Update local state immediately
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if ((post._id || post.id) === postId) {
            return {
              ...post,
              comments: [newComment, ...(post.comments || [])]
            };
          }
          return post;
        })
      );

      // Make API call
      await profileAPI.commentPost(postId, commentText);

    } catch (err) {
      console.error("Error commenting", err);
      // Optional: Revert optimistic update on error
    }
  };

  // ---------------- MODAL ----------------
  const openModal = async (title, postId, type) => {
    try {
      let users = [];
      if (type === "likes") users = await profileAPI.getPostLikes(postId);
      if (type === "views") users = await profileAPI.getPostViews(postId);

      setModalTitle(title);
      setModalUsers(users);
      setModalOpen(true);
    } catch (err) {
      console.error("Error fetching users for modal:", err);
    }
  };

  // ---------------- SHARE ----------------
  const handleShare = (post) => {
    if (navigator.share) {
      navigator
        .share({
          title: post.caption || "Check out this post!",
          text: "Check this post!",
          url: window.location.href,
        })
        .catch((err) => console.error("Error sharing:", err));
    } else {
      alert("Sharing not supported in this browser.");
    }
  };

  // ---------------- DELETE PROFILE ----------------
  const handleDeleteConfirm = async () => {
  try {
    await profileAPI.deleteProfile("influencer");
    setProfile(null);
    setMessage("Your influencer profile has been permanently deleted.");
    setShowDeleteDialog(false);
    navigate("/influencer/register"); // optional redirect
  } catch (err) {
    console.error(err);
    setMessage("Error deleting profile.");
    setShowDeleteDialog(false);
  }
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

  if (loading) return (
    <div className="brand-dashboard-loader">
        <div className="brand-loader-spinner"></div>
        <p>Loading your profile...</p>
      </div>
  );

  if (!profile) return (
    <div className="loading-container-inf">
      <div className="loading-text-inf">{message || "No influencer profile found."}</div>
    </div>
  );

  const socialIcons = {
    instagram: <FaInstagram className="social-icon-inf instagram" />,
    youtube: <FaYoutube className="social-icon-inf youtube" />,
    tiktok: <FaTiktok className="social-icon-inf tiktok" />,
    linkedin: <FaLinkedin className="social-icon-inf linkedin" />,
    other: <FaLink className="social-icon-inf other" />,
  };

  const socialLinks = profile.social_links || {};
  const profileId = profile._id || profile.id;

  return (
    <div className="influencer-profile-layout">
      <div className="influencer-container-wrapper">
        
        {/* ---------------- LEFT SIDEBAR (FIXED) ---------------- */}
        <aside className="influencer-sidebar">
          <div className="influencer-sidebar-content">
            
            {/* Profile Card */}
            <div className="influencer-profile-card">
              {/* Background Image */}
              {profile.bg_image ? (
                <div className="influencer-bg-header">
                  <img src={getImageUrl(profile.bg_image)} alt="Background" />
                </div>
              ) : (
                <div className="influencer-bg-header gradient-bg-inf"></div>
              )}

              {/* Profile Picture */}
              <div className="influencer-picture-container">
                <div className="influencer-picture-wrapper">
                  {profile.profile_picture ? (
                    <img src={getImageUrl(profile.profile_picture)} alt="Profile" className="influencer-picture-img" />
                  ) : (
                    <div className="influencer-picture-placeholder">
                      <FaUserCircle />
                    </div>
                  )}
                </div>
              </div>

              {/* Name & Nickname */}
              <div className="influencer-name-section">
                <h1>{profile.full_name || "Influencer Name"}</h1>
                {profile.nickname && <p className="nickname-inf">@{profile.nickname}</p>}
              </div>

              {/* Bio */}
              {profile.bio && (
                <div className="influencer-bio">
                  <p>{profile.bio}</p>
                </div>
              )}

              {/* Stats */}
              <div className="influencer-stats">
                <button 
                  onClick={() => navigate(`/influencer/profiles/connections/${profileId}?type=followers`)}
                  className="stat-item-inf"
                >
                  <div className="stat-number-inf">{followers.length}</div>
                  <div className="stat-label-inf">Followers</div>
                </button>
                <button 
                  onClick={() => navigate(`/influencer/profiles/connections/${profileId}?type=following`)}
                  className="stat-item-inf"
                >
                  <div className="stat-number-inf">{following.length}</div>
                  <div className="stat-label-inf">Following</div>
                </button>
                <div className="stat-item-inf">
                  <div className="stat-number-inf">{posts.length}</div>
                  <div className="stat-label-inf">Posts</div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="influencer-info-section">
                {profile.email && (
                  <div className="info-item-inf">
                    <FaEnvelope className="info-icon-inf" />
                    <span className="truncate-inf">{profile.email}</span>
                  </div>
                )}
                {profile.phone_number && (
                  <div className="info-item-inf">
                    <FaPhone className="info-icon-inf" />
                    <span>{profile.phone_number}</span>
                  </div>
                )}
                {profile.website && (
                  <div className="info-item-inf">
                    <FaGlobe className="info-icon-inf" />
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="info-link-inf">
                      {profile.website}
                    </a>
                  </div>
                )}
                {profile.location && (
                  <div className="info-item-inf">
                    <FaMapMarkerAlt className="info-icon-inf" />
                    <span>{profile.location}</span>
                  </div>
                )}
              </div>

              {/* Social Links */}
              {Object.keys(socialLinks).length > 0 && (
                <div className="influencer-social-section">
                  <div className="influencer-social-grid">
                    {Object.entries(socialLinks).map(([platform, url]) =>
                      url ? (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="social-link-btn-inf"
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
              <div className="influencer-actions-section">
                <button onClick={() => navigate("/influencer/register")} className="action-btn-inf primary-inf">
                  <FaEdit /> Edit Profile
                </button>
                <button onClick={() => setShowDeleteDialog(true)} className="action-btn-inf danger-inf">

                  <FaTrash /> Delete Profile
                </button>
              </div>
            </div>

          </div>
        </aside>

        {/* ---------------- RIGHT CONTENT (SCROLLABLE) ---------------- */}
        <main className="influencer-main-content">
          
          {/* Create Post Card */}
          <div className="create-post-card-inf">
            <button
              onClick={() => setShowCreatePost(!showCreatePost)}
              className="create-post-trigger-inf"
            >
              What's on your mind?
            </button>

            {showCreatePost && (
              <form onSubmit={handleCreatePost} className="create-post-form-inf">
                <textarea
                  name="caption"
                  placeholder="Write a caption..."
                  className="post-textarea-inf"
                  rows="4"
                />
                <div className="create-post-actions-inf">
                  <label className="media-upload-btn-inf">
                    <FaShare className="rotate-180-inf" />
                    <span>Add Media</span>
                    <input
  type="file"
  name="media"
  multiple
  accept="image/*,video/*"
  onChange={(e) => {
    const files = Array.from(e.target.files);

    const previews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      type: file.type,
    }));

    setMediaPreviews(previews);
  }}
/>

                  </label>
                  <button
  type="button"
  className="submit-post-btn-inf"
  onClick={() => {
    if (mediaPreviews.length === 0 && !document.querySelector('textarea[name="caption"]').value.trim()) {
      return;
    }

    setPendingPost({
      caption: document.querySelector('textarea[name="caption"]').value,
      media: mediaPreviews,
    });

    setShowPostConfirm(true);
  }}
>
  Post
</button>

                  <button
  type="button"
  onClick={() => {
    setShowCreatePost(false);
    setMediaPreviews([]);
  }}
  className="cancel-post-btn-inf"
>
  Cancel
</button>


                </div>
              </form>
            )}
            {mediaPreviews.length > 0 && (
  <div className="post-media-grid-inf grid-inf-preview">
    {mediaPreviews.map((media, idx) =>
      media.type.startsWith("video") ? (
        <video
          key={idx}
          src={media.url}
          controls
          className="post-media-item-inf video-inf"
        />
      ) : (
        <img
          key={idx}
          src={media.url}
          alt="preview"
          className="post-media-item-inf"
        />
      )
    )}
  </div>
)}

          </div>

          {/* Posts Feed */}
          <div className="posts-feed-inf">
            {posts.length === 0 ? (
              <div className="no-posts-card-inf">
                <FaRegComment className="no-posts-icon-inf" />
                <p>No posts yet. Share your first post!</p>
              </div>
            ) : (
              posts.map((post) => {
                const isLiked = post.likes?.some(like => 
                  (like._id || like.id || like.user_id) === currentUserId
                );

                return (
                  <article key={post._id || post.id} className="post-card-inf">
                    
                    {/* Post Header */}
                    <div className="post-header-inf">
                      {profile.profile_picture ? (
                        <img src={getImageUrl(profile.profile_picture)} alt="Profile" className="post-author-avatar-inf" />
                      ) : (
                        <div className="post-author-avatar-placeholder-inf">
                          <FaUserCircle />
                        </div>
                      )}
                      <div className="post-author-info-inf">
                        <h3>{profile.full_name}</h3>
                        {profile.nickname && <span className="post-nickname-inf">@{profile.nickname}</span>}
                        <p>{formatDate(post.created_at)}</p>
                      </div>
                    </div>

                    {/* Post Caption */}
                    {post.caption && (
                      <div className="post-caption-inf">
                        <p>{post.caption}</p>
                      </div>
                    )}

                    {/* Post Media */}
                    {post.media && post.media.length > 0 && (
                      <div className={`post-media-grid-inf grid-inf-${Math.min(post.media.length, 4)}`}>
                        {post.media.map((file, idx) => {
                          const fileId = file.id || file;
                          const url = getImageUrl(fileId);
                          if (file.type?.startsWith("video") || url.endsWith(".mp4") || url.includes("video")) {
                            return (
                              <video
                                key={fileId}
                                src={url}
                                controls
                                className="post-media-item-inf video-inf"
                                onClick={() => {
  handleViewPost(post._id || post.id);
  setPreviewPost(post);
}}

                              />
                            );
                          }
                          return (
                            <img
                              key={fileId}
                              src={url}
                              alt="post"
                              className={`post-media-item-inf ${post.media.length === 1 ? 'single-inf' : ''}`}
                              onClick={() => {
  handleViewPost(post._id || post.id);
  setPreviewPost(post);
}}

                            />
                          );
                        })}
                      </div>
                    )}

                    {/* Post Stats */}
                    <div className="post-stats-bar-inf">
                      <button onClick={() => openModal("Likes", post._id || post.id, "likes")} className="stat-btn-inf">
                        {post.likes?.length || 0} likes
                      </button>
                      <div className="stat-group-inf">
                        <button onClick={() => toggleComments(post._id || post.id)} className="stat-btn-inf">
                          {post.comments?.length || 0} comments
                        </button>
                        <button onClick={() => openModal("Views", post._id || post.id, "views")} className="stat-btn-inf">
                          {post.views?.length || 0} views
                        </button>
                      </div>
                    </div>

                    {/* Post Actions */}
                    <div className="post-actions-bar-inf">
                      <button
                        onClick={() => handleLike(post._id || post.id)}
                        className={`post-action-btn-inf ${isLiked ? 'liked-inf' : ''}`}
                      >
                        <FaHeart />
                        <span>{isLiked ? 'Liked' : 'Like'}</span>
                      </button>
                      <button onClick={() => toggleComments(post._id || post.id)} className="post-action-btn-inf">
                        <FaRegComment />
                        <span>Comment</span>
                      </button>
                      <button onClick={() => handleShare(post)} className="post-action-btn-inf">
                        <FaShare />
                        <span>Share</span>
                      </button>
                    </div>

                    {/* Comments Section */}
                    {commentToggles[post._id || post.id] && (
                      <div className="comments-section-inf">
                        <div className="comments-list-inf">
                          {post.comments && post.comments.length > 0 ? (
                            [...post.comments]
                              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                              .map((c, idx) => {
                                const commentText = c.comment || c.text || c.content || c.body;
                                const userName = c.user_name || c.username || "Unknown User";
                                const userAvatar = c.profile_picture;

                                if (!commentText || !commentText.trim()) return null;

                                return (
                                  <div key={idx} className="comment-item-inf">
                                    {userAvatar ? (
                                      <img 
                                        src={getImageUrl(userAvatar)} 
                                        alt="avatar" 
                                        className="comment-avatar-inf"
                                      />
                                    ) : (
                                      <div className="comment-avatar-inf">
                                        <span>{(userName || "U")[0].toUpperCase()}</span>
                                      </div>
                                    )}
                                    <div className="comment-content-inf">
                                      <p className="comment-author-inf">{userName}</p>
                                      <p className="comment-text-inf">{commentText}</p>
                                      {c.created_at && (
                                        <p className="comment-time-inf">{formatDate(c.created_at)}</p>
                                      )}
                                    </div>
                                  </div>
                                );
                              }).filter(Boolean)
                          ) : (
                            <p className="no-comments-text-inf">No comments yet. Be the first to comment!</p>
                          )}
                        </div>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            const comment = e.target.comment.value;
                            handleComment(post._id || post.id, comment);
                            e.target.reset();
                          }}
                          className="comment-form-inf"
                        >
                          <input name="comment" placeholder="Write a comment..." className="comment-input-inf" required />
                          <button type="submit" className="comment-submit-btn-inf">Post</button>
                        </form>
                      </div>
                    )}

                  </article>
                );
              })
            )}
          </div>

        </main>

      </div>

      {/* ---------------- USERS MODAL ---------------- */}
      <UsersModal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={modalTitle} 
        users={modalUsers}
        getImageUrl={getImageUrl}
      />

      <DeleteConfirmationDialog
  isOpen={showDeleteDialog}
  onClose={() => setShowDeleteDialog(false)}
  onConfirm={handleDeleteConfirm}
  influencerName={profile.full_name || profile.nickname || "your"}
/>

<PostPreviewModal
  post={previewPost}
  onClose={() => setPreviewPost(null)}
  getImageUrl={getImageUrl}
  formatDate={formatDate}
/>
 <CreatePostPreviewModal
  open={showPostConfirm}
  post={pendingPost}
  onClose={() => setShowPostConfirm(false)}
  onConfirm={handleCreatePost}
/>

    </div>
   


  );
};

export default InfluencerProfile;