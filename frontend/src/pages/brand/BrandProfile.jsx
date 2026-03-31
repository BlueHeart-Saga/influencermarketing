// src/pages/profile/BrandProfile.jsx
import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import profileAPI from "../../services/profileAPI";
import API_BASE_URL from "../../config/api";
import "../../style/BrandProfile.css";
import {
  FaInstagram,
  FaYoutube,
  FaLinkedin,
  FaFacebook,
  FaLink,
  FaHeart,
  FaRegComment,
  FaEye,
  FaShare,
  FaEdit,
  FaTrash,
  FaUsers,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
  FaGlobe,
  FaBullseye,
  FaTags,
} from "react-icons/fa";

// ---------------- USERS MODAL ----------------
const UsersModal = ({ open, onClose, title, users }) => {
  if (!open) return null;
  return (
    <div className="modal-overlay-new" onClick={onClose}>
      <div className="modal-content-new" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-new">
          <h3>{title}</h3>
          <button onClick={onClose} className="modal-close-btn">×</button>
        </div>
      </div>
    </div>
  );
};

const DeleteConfirmationDialog = ({ isOpen, onClose, onConfirm, brandName }) => {
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

        <h3 className="influencer-dialog-title">Delete Brand Profile</h3>

        <div className="influencer-dialog-danger-content">
          <p className="influencer-dialog-message">
            Are you sure you want to delete <strong>"{brandName}"</strong> brand profile?
          </p>

          <div className="influencer-dialog-risks">
            <h4>This action cannot be undone and will permanently:</h4>
            <ul>
              <li>Delete all your brand information</li>
              <li>Remove your profile from search results</li>
              <li>Cancel ongoing campaigns and collaborations</li>
              <li>Delete brand assets, logo, and images</li>
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


const BrandProfile = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [userId, setUserId] = useState(null);
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
  const [posting, setPosting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPostPreview, setShowPostPreview] = useState(false);
const [pendingPost, setPendingPost] = useState(null);
const [isPosting, setIsPosting] = useState(false);





  const getFileUrl = (fileId) => `${API_BASE_URL}/profiles/image/${fileId}`;

  // ---------------- FETCH PROFILE ----------------
  useEffect(() => {
    if (!token) return;

    const fetchProfileData = async () => {
      setLoading(true);
      try {
        const res = await profileAPI.getMyProfile(token);
        if (res.type !== "brand") {
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
      }
    };

    fetchProfileData();
  }, [token]);

  // ---------------- FETCH POSTS ----------------
  const fetchPosts = async (userId) => {
  try {
    const data = await profileAPI.getUserPosts(userId);
    
    // ADD THIS DEBUGGING CODE
    console.log("=== POSTS DATA DEBUG ===");
    console.log("Raw posts data:", data);
    if (data && data.length > 0) {
      data.forEach((post, index) => {
        console.log(`Post ${index}:`, {
          id: post._id || post.id,
          caption: post.caption,
          commentsCount: post.comments?.length || 0,
          comments: post.comments
        });
      });
    }
    console.log("=== END DEBUG ===");
    
    if (data) data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    setPosts(data || []);
  } catch (err) {
    console.error("Error fetching posts:", err);
  }
};

  // ---------------- FOLLOWERS / FOLLOWING ----------------
  const fetchFollowersAndFollowing = async (userId) => {
    try {
      const followersData = await profileAPI.getFollowers(userId);
      const followingData = await profileAPI.getFollowing(userId);
      setFollowers(followersData || []);
      setFollowing(followingData || []);
    } catch (err) {
      console.error("Error fetching followers/following:", err);
    }
  };

  // ---------------- CREATE POST ----------------
 const handleConfirmPost = async () => {
  if (!pendingPost) return;

  try {
    setIsPosting(true);

    await profileAPI.createPost(
      pendingPost.media.map(m => m.file),
      pendingPost.caption
    );

    // clear UI
    setPendingPost(null);
    setMediaPreviews([]);
    setShowCreatePost(false);
    setShowPostPreview(false);

    // refresh feed
    await fetchPosts(profile._id || profile.id);

  } catch (err) {
    console.error("Error posting:", err);
  } finally {
    setIsPosting(false);
  }
};


const handleDeleteConfirm = async () => {
  try {
    await profileAPI.deleteProfile("brand");
    setProfile(null);
    setMessage("Your brand profile has been permanently deleted.");
    setShowDeleteDialog(false);
    navigate("/brand/register"); // optional redirect
  } catch (err) {
    console.error(err);
    setMessage("Error deleting brand profile.");
    setShowDeleteDialog(false);
  }
};


  // ---------------- LIKE / VIEW ----------------
  const handleLike = async (postId) => {
    try {
      await profileAPI.likePost(postId);
      await fetchPosts(profile._id || profile.id);
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const handleViewPost = async (postId) => {
    try {
      await profileAPI.viewPost(postId);
      await fetchPosts(profile._id || profile.id);
    } catch (err) {
      console.error("Error viewing post:", err);
    }
  };

  // ---------------- COMMENT ----------------
  const toggleComments = (postId) => {
    setCommentToggles((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleComment = async (postId, comment) => {
    if (!comment) return;
    try {
      await profileAPI.commentPost(postId, comment);
      await fetchPosts(profile._id || profile.id);
    } catch (err) {
      console.error("Error commenting:", err);
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
        <p>Loading your Profile...</p>
      </div>
    
  );

  if (!profile) return (
    <div className="loading-container">
      <div className="loading-text">{message || "No brand profile found."}</div>
    </div>
  );

  const socialIcons = {
    instagram: <FaInstagram className="social-icon instagram" />,
    youtube: <FaYoutube className="social-icon youtube" />,
    linkedin: <FaLinkedin className="social-icon linkedin" />,
    facebook: <FaFacebook className="social-icon facebook" />,
    other: <FaLink className="social-icon other" />,
  };

  const BrandPostPreviewModal = ({ open, post, onClose, onConfirm, isPosting }) => {
  if (!open || !post) return null;

  return (
    <div className="brand-post-preview-overlay" onClick={onClose}>
      <div className="brand-post-preview-container" onClick={(e) => e.stopPropagation()}>

        <header className="brand-post-preview-header">
          <h3>Preview Post</h3>
          <button className="brand-post-preview-close" onClick={onClose}>×</button>
        </header>

        <div className="brand-post-preview-content">
          
          {post.caption && (
            <p className="brand-post-preview-caption">{post.caption}</p>
          )}

          <div className="brand-post-preview-media-grid">
            {post.media.map((m, i) =>
              m.type.startsWith("video") ? (
                <video key={i} src={m.url} controls className="brand-post-preview-media" />
              ) : (
                <img key={i} src={m.url} alt="preview" className="brand-post-preview-media" />
              )
            )}
          </div>
        </div>

        <footer className="brand-post-preview-actions">
          <button className="cancel-post-btn" onClick={onClose}>Edit</button>

          <button
            className="submit-post-btn"
            onClick={onConfirm}
            disabled={isPosting}
          >
            {isPosting ? "Posting..." : "Confirm & Post"}
          </button>
        </footer>

      </div>
    </div>
  );
};


  return (
    <div className="brand-profile-layout">
      <div className="profile-container-wrapper">
        
        {/* ---------------- LEFT SIDEBAR (FIXED) ---------------- */}
        <aside className="profile-sidebar">
          <div className="profile-sidebar-content">
            
            {/* Profile Card */}
            <div className="profile-card">
              {/* Background Image */}
              {profile.bg_image ? (
                <div className="profile-bg-header">
                  <img src={getFileUrl(profile.bg_image)} alt="Background" />
                </div>
              ) : (
                <div className="profile-bg-header gradient-bg"></div>
              )}

              {/* Logo */}
              <div className="profile-logo-container">
                <div className="profile-logo-wrapper">
                  {profile.logo ? (
                    <img src={getFileUrl(profile.logo)} alt="Logo" className="profile-logo-img" />
                  ) : (
                    <div className="profile-logo-placeholder">
                      <span>{profile.company_name?.[0] || "B"}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Company Name */}
              <h1 className="profile-company-name">{profile.company_name || "Brand Name"}</h1>

              {/* Stats */}
              <div className="profile-stats">
                <button 
                  onClick={() => navigate(`/brand/profiles/connections/${userId}?type=followers`)}
                  className="stat-item"
                >
                  <div className="stat-number">{followers.length}</div>
                  <div className="stat-label">Followers</div>
                </button>
                <button 
                  onClick={() => navigate(`/brand/profiles/connections/${userId}?type=following`)}
                  className="stat-item"
                >
                  <div className="stat-number">{following.length}</div>
                  <div className="stat-label">Following</div>
                </button>
                <div className="stat-item">
                  <div className="stat-number">{posts.length}</div>
                  <div className="stat-label">Posts</div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="profile-info-section">
                {profile.contact_person_name && (
                  <div className="info-item">
                    <FaUsers className="info-icon" />
                    <span>{profile.contact_person_name}</span>
                  </div>
                )}
                {profile.email && (
                  <div className="info-item">
                    <FaEnvelope className="info-icon" />
                    <span className="truncate">{profile.email}</span>
                  </div>
                )}
                {profile.phone_number && (
                  <div className="info-item">
                    <FaPhone className="info-icon" />
                    <span>{profile.phone_number}</span>
                  </div>
                )}
                {profile.website && (
                  <div className="info-item">
                    <FaGlobe className="info-icon" />
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="info-link">
                      {profile.website}
                    </a>
                  </div>
                )}
                {profile.location && (
                  <div className="info-item">
                    <FaMapMarkerAlt className="info-icon" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.target_audience && (
                  <div className="info-item">
                    <FaBullseye className="info-icon" />
                    <span>{profile.target_audience}</span>
                  </div>
                )}
                {Array.isArray(profile.categories) && profile.categories.length > 0 && (
                  <div className="info-item">
                    <FaTags className="info-icon" />
                    <div className="categories-tags">
                      {profile.categories.map((cat, idx) => (
                        <span key={idx} className="category-tag">{cat}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Social Links */}
              {profile.social_links && Object.keys(profile.social_links).length > 0 && (
                <div className="social-links-section">
                  <div className="social-links-grid">
                    {Object.entries(profile.social_links).map(([platform, url]) =>
                      url ? (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="social-link-btn"
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
              <div className="profile-actions-section">
                <button onClick={() => navigate("/brand/register")} className="action-btn primary">
                  <FaEdit /> Edit Profile
                </button>
                <button onClick={() => navigate("/brand/profiles/public")} className="action-btn secondary">
                  <FaUsers /> View Public Profiles
                </button>
                {/* <button
                  onClick={async () => {
                    if (window.confirm("Are you sure you want to delete your profile?")) {
                      await profileAPI.deleteProfile("brand");
                      setProfile(null);
                      setMessage("Profile deleted successfully");
                    }
                  }}
                  className="action-btn danger"
                >
                  <FaTrash /> Delete Profile
                </button> */}
                <button
  onClick={() => setShowDeleteDialog(true)}
  className="action-btn danger"
>
  <FaTrash /> Delete Profile
</button>

              </div>
            </div>

          </div>
        </aside>

        {/* ---------------- RIGHT CONTENT (SCROLLABLE) ---------------- */}
        <main className="profile-main-content">
          
          {/* Create Post Card */}
          <div className="create-post-card">
            <button
              onClick={() => setShowCreatePost(!showCreatePost)}
              className="create-post-trigger"
            >
              What's on your mind?
            </button>

            {showCreatePost && (
              <form onSubmit={handleConfirmPost} className="create-post-form">
                <textarea
                  name="caption"
                  placeholder="Write a caption..."
                  className="post-textarea"
                  rows="4"
                />
                <div className="create-post-actions">
                  <label className="media-upload-btn">
                    <FaShare className="rotate-180" />
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
  className="submit-post-btn"
  onClick={(e) => {
    const form = e.target.closest("form");
    const caption = form.caption.value.trim();

    if (!caption && mediaPreviews.length === 0) return;

    setPendingPost({
      caption,
      media: mediaPreviews
    });

    setShowPostPreview(true);
  }}
>
  Preview & Post
</button>

                  <button type="button" onClick={() => setShowCreatePost(false)} className="cancel-post-btn">
                    Cancel
                  </button>
                </div>
              </form>
            )}{mediaPreviews.length > 0 && (
  <div className="post-media-grid grid-preview">
    {mediaPreviews.map((media, idx) =>
      media.type.startsWith("video") ? (
        <video
          key={idx}
          src={media.url}
          className="post-media-item video"
          controls
        />
      ) : (
        <img
          key={idx}
          src={media.url}
          className="post-media-item"
          alt="preview"
        />
      )
    )}
  </div>
)}


          </div>

          {/* Posts Feed */}
          <div className="posts-feed">
            {posts.length === 0 ? (
              <div className="no-posts-card">
                <FaRegComment className="no-posts-icon" />
                <p>No posts yet. Share your first post!</p>
              </div>
            ) : (
              posts.map((post) => (
                <article key={post._id || post.id} className="post-card-new">
                  
                  {/* Post Header */}
                  <div className="post-header-new">
                    {profile.logo ? (
                      <img src={getFileUrl(profile.logo)} alt="Logo" className="post-author-avatar" />
                    ) : (
                      <div className="post-author-avatar-placeholder">
                        <span>{profile.company_name?.[0] || "B"}</span>
                      </div>
                    )}
                    <div className="post-author-info">
                      <h3>{profile.company_name}</h3>
                      <p>{formatDate(post.created_at)}</p>
                    </div>
                  </div>

                  {/* Post Caption */}
                  {post.caption && (
                    <div className="post-caption-new">
                      <p>{post.caption}</p>
                    </div>
                  )}

                  {/* Post Media */}
                  {post.media && post.media.length > 0 && (
                    <div className={`post-media-grid grid-${Math.min(post.media.length, 4)}`}>
                      {post.media.map((file, idx) => {
                        const fileId = file.id || file;
                        const url = getFileUrl(fileId);
                        if (file.type?.startsWith("video") || url.endsWith(".mp4") || url.includes("video")) {
                          return (
                            <video
                              key={fileId}
                              src={url}
                              controls
                              className="post-media-item video"
                              onClick={() => handleViewPost(post._id || post.id)}
                            />
                          );
                        }
                        return (
                          <img
                            key={fileId}
                            src={url}
                            alt="post"
                            className={`post-media-item ${post.media.length === 1 ? 'single' : ''}`}
                            onClick={() => handleViewPost(post._id || post.id)}
                          />
                        );
                      })}
                    </div>
                  )}

                  {/* Post Stats */}
                  <div className="post-stats-bar">
                    <button onClick={() => openModal("Likes", post._id || post.id, "likes")} className="stat-btn">
                      {post.likes?.length || 0} likes
                    </button>
                    <div className="stat-group">
                      <button onClick={() => toggleComments(post._id || post.id)} className="stat-btn">
                        {post.comments?.length || 0} comments
                      </button>
                      <button onClick={() => openModal("Views", post._id || post.id, "views")} className="stat-btn">
                        {post.views?.length || 0} views
                      </button>
                    </div>
                  </div>

                  {/* Post Actions */}
                  <div className="post-actions-bar">
                    <button
                      onClick={() => handleLike(post._id || post.id)}
                      className={`post-action-btn ${post.likes?.includes(profile._id) ? 'liked' : ''}`}
                    >
                      <FaHeart />
                      <span>Like</span>
                    </button>
                    <button onClick={() => toggleComments(post._id || post.id)} className="post-action-btn">
                      <FaRegComment />
                      <span>Comment</span>
                    </button>
                    <button onClick={() => handleShare(post)} className="post-action-btn">
                      <FaShare />
                      <span>Share</span>
                    </button>
                  </div>

                  {/* Comments Section */}
                  {/* Comments Section */}
{commentToggles[post._id || post.id] && (
  <div className="comments-section">
    <div className="comments-list">
      {post.comments && post.comments.length > 0 ? (
        // Sort comments by created_at in descending order (newest first)
        [...post.comments]
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .map((c, idx) => {
            const commentText = c.comment || c.text || c.content || c.body;
            const userName = c.user_name || c.username || c.user?.name || "Unknown User";
            const userAvatar = c.profile_picture || c.user?.profile_picture;

            // Only show comments with actual text
            if (!commentText || !commentText.trim()) {
              return null;
            }

            return (
              <div key={idx} className="comment-item">
                {userAvatar ? (
                  <img 
                    src={getFileUrl(userAvatar)} 
                    alt="avatar" 
                    className="comment-avatar"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                
                {/* Fallback avatar */}
                <div className="comment-avatar" style={{display: userAvatar ? 'none' : 'flex'}}>
                  <span>{(userName || "U")[0].toUpperCase()}</span>
                </div>
                
                <div className="comment-content">
                  <p className="comment-author">{userName}</p>
                  <p className="comment-text">{commentText}</p>
                  {c.created_at && (
                    <p className="comment-time">{formatDate(c.created_at)}</p>
                  )}
                </div>
              </div>
            );
          }).filter(Boolean)
      ) : (
        <div className="no-comments-message">
          <FaRegComment className="no-comments-icon" />
          <p>No comments yet. Be the first to comment!</p>
        </div>
      )}
    </div>

    {/* Comment Input Form */}
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.target;
        const commentText = form.comment.value.trim();
        
        if (commentText) {
          try {
            await handleComment(post._id || post.id, commentText);
            form.reset();
            
            // Refresh posts to show the new comment at top
            setTimeout(() => {
              fetchPosts(profile._id || profile.id);
            }, 500);
            
          } catch (error) {
            console.error("Failed to submit comment:", error);
          }
        }
      }}
      className="comment-form"
    >
      <input 
        name="comment" 
        placeholder="Write a comment..." 
        className="comment-input" 
        required 
        minLength="1"
      />
      <button type="submit" className="comment-submit-btn">
        Post
      </button>
    </form>
  </div>
)}

                </article>
              ))
            )}
          </div>

        </main>

      </div>

      {/* ---------------- USERS MODAL ---------------- */}
      <UsersModal open={modalOpen} onClose={() => setModalOpen(false)} title={modalTitle} users={modalUsers} />
        <DeleteConfirmationDialog
  isOpen={showDeleteDialog}
  onClose={() => setShowDeleteDialog(false)}
  onConfirm={handleDeleteConfirm}
  brandName={profile.company_name || "your brand"}
/>

<BrandPostPreviewModal
  open={showPostPreview}
  post={pendingPost}
  onClose={() => setShowPostPreview(false)}
  onConfirm={handleConfirmPost}
  isPosting={isPosting}
/>


    </div>
  );
};

export default BrandProfile;