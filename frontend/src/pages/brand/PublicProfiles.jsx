// src/pages/profile/PublicProfiles.jsx
import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import profileAPI from "../../services/profileAPI";
import API_BASE_URL from "../../config/api";
import { AuthContext } from "../../context/AuthContext";
import "../../style/PublicProfiles.css";

const PublicProfiles = () => {
  const [profiles, setProfiles] = useState([]);
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);
  const role = user?.role || "brand";

  const getImageUrl = (fileId) => `${API_BASE_URL}/profiles/image/${fileId}`;

  // ---------------- FETCH PUBLIC PROFILES WITH OPTIMIZED LOADING ----------------
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const res = await profileAPI.getPublicProfiles();
        
        // Slice to show first 12 profiles immediately
        const initialProfiles = res.slice(0, 12);
        const remainingProfiles = res.slice(12);

        // Set initial profiles immediately
        setProfiles(initialProfiles.map(p => ({
          ...p,
          isFollowing: false,
          followersCount: p.profile.followers?.length || 0,
          followingCount: p.profile.following?.length || 0,
        })));
        setFilteredProfiles(initialProfiles.map(p => ({
          ...p,
          isFollowing: false,
          followersCount: p.profile.followers?.length || 0,
          followingCount: p.profile.following?.length || 0,
        })));
        setLoading(false);

        // Load remaining profiles and follow states in background
        if (remainingProfiles.length > 0 || token) {
          setTimeout(async () => {
            const allProfilesWithCounts = await Promise.all(
              res.map(async (p) => {
                const profileId = p.profile._id || p.profile.id;
                let isFollowing = false;
                let followersCount = p.profile.followers?.length || 0;
                let followingCount = p.profile.following?.length || 0;

                if (token && user?.id !== profileId) {
                  try {
                    const followingList = await profileAPI.getFollowing(user.id, token);
                    isFollowing = followingList.some(f => f._id === profileId);
                  } catch (err) {
                    console.error("Error checking follow state:", err);
                  }
                }

                // Fetch counts from backend if available
                try {
                  const followersData = await profileAPI.getFollowers(profileId, token);
                  const followingData = await profileAPI.getFollowing(profileId, token);
                  followersCount = followersData.length;
                  followingCount = followingData.length;
                } catch {}

                return {
                  ...p,
                  isFollowing,
                  followersCount,
                  followingCount,
                };
              })
            );

            setProfiles(allProfilesWithCounts);
            setFilteredProfiles(allProfilesWithCounts);
          }, 1000);
        }
      } catch (err) {
        console.error("Failed to fetch public profiles:", err);
        setLoading(false);
      }
    };

    fetchProfiles();
  }, [token, user?.id]);

  // ---------------- FILTER & SEARCH ----------------
  // ---------------- FILTER & ADVANCED SEARCH ----------------
useEffect(() => {
  let temp = [...profiles];

  // tab filter
  if (activeTab !== "all") {
    temp = temp.filter((p) => p.type === activeTab);
  }

  if (search.trim() !== "") {
    const q = search.trim().toLowerCase();

    temp = temp.filter((p) => {
      const profile = p.profile || {};

      // brand vs influencer display names
      const name =
        p.type === "brand"
          ? profile.company_name || ""
          : profile.full_name || "";

      const username = profile.username || profile.handle || "";
      const location = profile.location || "";
      const bio = profile.bio || profile.description || "";
      const categories = Array.isArray(profile.categories)
        ? profile.categories.join(" ")
        : "";

      // Combine all searchable fields
      const haystack = [
        name,
        username,
        location,
        bio,
        categories
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }

  setFilteredProfiles(temp);
}, [activeTab, search, profiles]);


  // ---------------- FOLLOW / UNFOLLOW ----------------
  const handleFollowToggle = async (profileId) => {
    if (!token) return alert("Please login to follow.");

    try {
      const targetProfile = profiles.find((p) => (p.profile._id || p.profile.id) === profileId);
      if (!targetProfile) return;

      if (targetProfile.isFollowing) {
        await profileAPI.unfollowUser(profileId, token);
      } else {
        await profileAPI.followUser(profileId, token);
      }

      // Optimistically update state
      const updatedProfiles = profiles.map((p) => {
        const pid = p.profile._id || p.profile.id;
        if (pid === profileId) {
          let followersCount = p.followersCount;
          if (p.isFollowing) {
            followersCount = Math.max(followersCount - 1, 0);
          } else {
            followersCount = followersCount + 1;
          }
          return { ...p, isFollowing: !p.isFollowing, followersCount };
        }
        return p;
      });

      setProfiles(updatedProfiles);
      setFilteredProfiles(updatedProfiles);
    } catch (err) {
      console.error("Failed to follow/unfollow:", err);
    }
  };

  // ---------------- HANDLE VIEW CONNECTIONS ----------------
  const handleViewConnections = (profileId, type) => {
    navigate(`/${role}/profiles/connections/${profileId}?type=${type}`);
  };

  return (
    <div className="public-profiles-page">
      {/* Header Section */}
      <div className="public-profiles-header">
        <h1 className="public-profiles-main-title">Discover Creators & Brands</h1>
        <p className="public-profiles-subtitle">
          Connect with influencers and brands to grow your network
        </p>
      </div>

      {/* Controls Section */}
      <div className="public-profiles-controls">
        {/* Tabs */}
        <div className="public-profiles-tabs-container">
          <div className="public-profiles-tabs">
            {[
              { id: "all", label: "All Profiles" },
              { id: "brand", label: "Brands" },
              { id: "influencer", label: "Influencers" }
            ].map((tab) => (
              <button
                key={tab.id}
                className={`public-profiles-tab ${activeTab === tab.id ? "public-profiles-tab-active" : "public-profiles-tab-inactive"}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="public-profiles-search-container">
          <div className="public-profiles-search-wrapper">
            <svg className="public-profiles-search-icon" viewBox="0 0 24 24" fill="none">
              <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" 
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input
              type="text"
              className="public-profiles-search-input"
              placeholder="Search by name or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="public-profiles-loading">
          <div className="public-profiles-loading-spinner"></div>
          <p className="public-profiles-loading-text">Loading profiles...</p>
        </div>
      )}

      {/* Results Count */}
      {!loading && (
        <div className="public-profiles-results-info">
          <p className="public-profiles-results-count">
            Showing {filteredProfiles.length} {filteredProfiles.length === 1 ? 'profile' : 'profiles'}
            {search && ` for "${search}"`}
          </p>
        </div>
      )}

      {/* Profiles Grid */}
      {!loading && (
        <div className="public-profiles-grid-container">
          <div className="public-profiles-grid">
            {filteredProfiles.map(({ type, profile, isFollowing, followersCount, followingCount }) => {
              const profileId = profile._id || profile.id;
              const displayName = type === "brand" ? profile.company_name : profile.full_name;
              const img = profile.logo || profile.profile_picture;
              const bio = profile.bio || "No description available";
              const location = profile.location || "Location not specified";
              const categories = profile.categories || [];

              return (
                <div key={profileId} className="public-profile-card">
                  {/* Card Header with Image */}
                  <div className="public-profile-card-header">
                    <div className="public-profile-image-container">
                      <img
                        src={img ? getImageUrl(img) : "/placeholder-avatar.png"}
                        alt={displayName}
                        className="public-profile-image"
                        onError={(e) => {
                          e.target.src = "/placeholder-avatar.png";
                        }}
                      />
                      <div className={`public-profile-badge public-profile-badge-${type}`}>
                        {type === 'brand' ? '🏢 Brand' : '⭐ Influencer'}
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="public-profile-card-body">
                    <h3 className="public-profile-name">{displayName}</h3>
                    
                    {location && (
                      <p className="public-profile-location">
                        <svg className="public-profile-location-icon" viewBox="0 0 24 24" fill="none">
                          <path d="M12 21C15.5 17.4 19 14.1764 19 10.2C19 6.22355 15.7764 3 12 3C8.22355 3 5 6.22355 5 10.2C5 14.1764 8.5 17.4 12 21Z" 
                                stroke="currentColor" strokeWidth="2"/>
                          <path d="M12 12C13.1046 12 14 11.1046 14 10C14 8.89543 13.1046 8 12 8C10.8954 8 10 8.89543 10 10C10 11.1046 10.8954 12 12 12Z" 
                                stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        {location}
                      </p>
                    )}

                    <p className="public-profile-bio">{bio.slice(0, 100)}{bio.length > 100 ? '...' : ''}</p>

                    {/* Categories/Tags */}
                    {categories.length > 0 && (
                      <div className="public-profile-categories">
                        {categories.slice(0, 3).map((category, index) => (
                          <span key={index} className="public-profile-category-tag">
                            {category}
                          </span>
                        ))}
                        {categories.length > 3 && (
                          <span className="public-profile-category-more">
                            +{categories.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Stats with Clickable Buttons */}
                    <div className="public-profile-stats">
                      <button 
                        onClick={() => handleViewConnections(profileId, 'followers')}
                        className="public-profile-stat-item"
                      >
                        <div className="public-profile-stat-number">{followersCount}</div>
                        <div className="public-profile-stat-label">Followers</div>
                      </button>
                      <button 
                        onClick={() => handleViewConnections(profileId, 'following')}
                        className="public-profile-stat-item"
                      >
                        <div className="public-profile-stat-number">{followingCount}</div>
                        <div className="public-profile-stat-label">Following</div>
                      </button>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="public-profile-card-footer">
                    {user && user.id !== profileId && token && (
                      <button
                        className={`public-profile-follow-btn ${isFollowing ? "public-profile-following" : "public-profile-follow"}`}
                        onClick={() => handleFollowToggle(profileId)}
                      >
                        {isFollowing ? (
                          <>
                            <svg className="public-profile-check-icon" viewBox="0 0 24 24" fill="none">
                              <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Following
                          </>
                        ) : (
                          <>
                            <svg className="public-profile-plus-icon" viewBox="0 0 24 24" fill="none">
                              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Follow
                          </>
                        )}
                      </button>
                    )}
                    
                    <button
                      onClick={() => navigate(`/${role}/profile/view/${type}/${profileId}`)}
                      className="public-profile-view-btn"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredProfiles.length === 0 && (
        <div className="public-profiles-empty">
          <div className="public-profiles-empty-icon">🔍</div>
          <h3 className="public-profiles-empty-title">No profiles found</h3>
          <p className="public-profiles-empty-message">
            {search 
              ? `No profiles match your search for "${search}". Try different keywords.`
              : "No profiles available at the moment. Please check back later."
            }
          </p>
          {(search || activeTab !== 'all') && (
            <button 
              className="public-profiles-empty-action"
              onClick={() => {
                setSearch('');
                setActiveTab('all');
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PublicProfiles;