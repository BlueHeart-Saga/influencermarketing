// src/pages/profile/ConnectionsList.jsx
import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import profileAPI from "../../services/profileAPI";
import API_BASE_URL from "../../config/api";
import "../../style/ConnectionsList.css";

const ConnectionsList = () => {
  const { userId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const role = user?.role || "brand";

  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [currentUserFollowing, setCurrentUserFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState({});
  const [error, setError] = useState(null);

  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get("type") || "followers";

  const getImageUrl = (fileId) =>
    fileId ? `${API_BASE_URL}/profiles/image/${fileId}` : "/default-avatar.png";

  const mapUserData = (raw) => {
    const userData = raw.user || raw;
    const profile = raw.profile || userData.profile || userData;
    
    const isBrand = profile.company_name || 
                    profile.brand_profile?.company_name || 
                    raw.company_name ||
                    (profile.type === "brand");
    
    let display_name = "User";
    
    if (isBrand) {
      display_name = profile.company_name || 
                     profile.brand_profile?.company_name || 
                     userData.company_name ||
                     profile.username ||
                     raw.username ||
                     "Brand";
    } else {
      display_name = profile.full_name ||
                     profile.influencer_profile?.full_name ||
                     profile.nickname ||
                     profile.influencer_profile?.nickname ||
                     userData.full_name ||
                     userData.nickname ||
                     profile.username ||
                     raw.username ||
                     "Influencer";
    }
    
    const profile_picture = 
      profile.profile_picture ||
      profile.logo ||
      profile.brand_profile?.logo ||
      profile.influencer_profile?.profile_picture ||
      userData.profile_picture ||
      raw.profilePicture ||
      null;
    
    const email = profile.email || userData.email || raw.email || "";
    const nickname = profile.nickname || 
                     profile.influencer_profile?.nickname || 
                     userData.nickname ||
                     null;
    
    const username = profile.username || raw.username || "";
    
    return {
      _id: (raw._id || profile._id || userData._id)?.toString(),
      id: raw.id || profile.id || userData.id,
      display_name,
      email,
      type: isBrand ? "brand" : "influencer",
      company_name: isBrand ? display_name : null,
      full_name: !isBrand ? display_name : null,
      nickname,
      username,
      profile_picture,
      original: raw
    };
  };

  const fetchConnections = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [followersData, followingData] = await Promise.all([
        profileAPI.getFollowers(userId),
        profileAPI.getFollowing(userId)
      ]);

      const processData = (data) => {
        if (!data) return [];
        return data.map(item => mapUserData(item));
      };

      setFollowers(processData(followersData));
      setFollowing(processData(followingData));

      if (user) {
        const myId = user._id || user.id;
        const currentFollowing = await profileAPI.getFollowing(myId);
        setCurrentUserFollowing(processData(currentFollowing));
      }
    } catch (err) {
      console.error("Error fetching connections:", err);
      setError("Failed to load connections. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchConnections();
  }, [userId, user]);

  const handleFollowToggle = async (target) => {
    if (!user) {
      alert("Please login to follow/unfollow.");
      return;
    }

    const targetId = target._id || target.id;
    const alreadyFollowing = currentUserFollowing.some(
      (u) => (u._id || u.id) === targetId
    );

    setFollowLoading((prev) => ({ ...prev, [targetId]: true }));

    try {
      if (alreadyFollowing) {
        await profileAPI.unfollowUser(targetId);
        setCurrentUserFollowing((prev) =>
          prev.filter((u) => (u._id || u.id) !== targetId)
        );
      } else {
        await profileAPI.followUser(targetId);
        setCurrentUserFollowing((prev) => [...prev, target]);
      }
      fetchConnections();
    } catch (err) {
      console.error("Follow toggle failed:", err);
      alert("Failed to update follow status.");
    } finally {
      setFollowLoading((prev) => ({ ...prev, [targetId]: false }));
    }
  };

  const isFollowingUser = (target) => {
    const id = target._id || target.id;
    return currentUserFollowing.some((u) => (u._id || u.id) === id);
  };

  const handleTabChange = (tab) => {
    navigate(`/${role}/profiles/connections/${userId}?type=${tab}`);
  };

  const UserCard = ({ user: item }) => {
    const id = item._id || item.id;
    const selfId = user?._id || user?.id;
    const isSelf = id === selfId;
    const following = isFollowingUser(item);
    const busy = followLoading[id];
    const profileType = item.type === "brand" ? "brand" : "influencer";

    let subText = null;
    if (profileType === "brand") {
      if (item.email) subText = item.email;
    } else {
      if (item.nickname) subText = `@${item.nickname}`;
      else if (item.email) subText = item.email;
    }

    return (
      <div className="connections-card">
        <div className="connections-card__main">
          <div className="connections-card__avatar-container">
            <img
              src={getImageUrl(item.profile_picture)}
              alt={item.display_name}
              className="connections-card__avatar"
              onError={(e) => (e.target.src = "/default-avatar.png")}
            />
          </div>
          
          <div className="connections-card__info">
            <h3 className="connections-card__name">{item.display_name}</h3>
            {subText && (
              <p className="connections-card__subtitle">{subText}</p>
            )}
            <span className={`connections-card__badge connections-card__badge--${profileType}`}>
              {profileType.charAt(0).toUpperCase() + profileType.slice(1)}
            </span>
          </div>
        </div>

        <div className="connections-card__actions">
          {!isSelf && user && (
            <button
              className={`connections-card__follow-btn ${
                following 
                  ? "connections-card__follow-btn--following" 
                  : "connections-card__follow-btn--follow"
              } ${busy ? "connections-card__follow-btn--loading" : ""}`}
              onClick={() => handleFollowToggle(item)}
              disabled={busy}
              aria-label={following ? `Unfollow ${item.display_name}` : `Follow ${item.display_name}`}
            >
              {busy ? (
                <span className="connections-card__spinner"></span>
              ) : following ? (
                "Following"
              ) : (
                "Follow"
              )}
            </button>
          )}
          
          <button
            className="connections-card__view-btn"
            onClick={() =>
              navigate(`/${role}/profile/view/${profileType}/${id}`)
            }
            aria-label={`View ${item.display_name}'s profile`}
          >
            View Profile
          </button>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="connections-loading">
          <div className="connections-loading__spinner"></div>
          <p className="connections-loading__text">Loading connections...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="connections-error">
          <div className="connections-error__icon">⚠️</div>
          <p className="connections-error__text">{error}</p>
          <button 
            className="connections-error__retry-btn"
            onClick={fetchConnections}
          >
            Retry
          </button>
        </div>
      );
    }

    const currentList = activeTab === "followers" ? followers : following;

    if (currentList.length === 0) {
      return (
        <div className="connections-empty">
          <div className="connections-empty__icon">👥</div>
          <h3 className="connections-empty__title">No {activeTab} yet</h3>
          <p className="connections-empty__description">
            {activeTab === "followers" 
              ? "This user doesn't have any followers yet." 
              : "This user isn't following anyone yet."}
          </p>
        </div>
      );
    }

    return (
      <div className="connections-list">
        {currentList.map((user) => (
          <UserCard key={user._id || user.id} user={user} />
        ))}
      </div>
    );
  };

  return (
    <div className="connections">
      <div className="connections__container">
        <header className="connections__header">
          <button 
            className="connections__back-btn"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <svg className="connections__back-icon" viewBox="0 0 24 24">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
            {/* Back */}
          </button>
          <h1 className="connections__title">Connections</h1>
        </header>

        <div className="connections__tabs">
          <button
    role="tab"
    id="tab-followers"
    aria-controls="panel-followers"
    className={`connections__tab ${activeTab === "followers" ? "connections__tab--active" : ""}`}
    onClick={() => handleTabChange("followers")}
    aria-selected={activeTab === "followers"}
    tabIndex={activeTab === "followers" ? 0 : -1}
  >
    <span className="connections__tab-label">Followers</span>
    <span className="connections__tab-count">{followers.length}</span>
  </button>

  <button
    role="tab"
    id="tab-following"
    aria-controls="panel-following"
    className={`connections__tab ${activeTab === "following" ? "connections__tab--active" : ""}`}
    onClick={() => handleTabChange("following")}
    aria-selected={activeTab === "following"}
    tabIndex={activeTab === "following" ? 0 : -1}
  >
    <span className="connections__tab-label">Following</span>
    <span className="connections__tab-count">{following.length}</span>
  </button>
        </div>

        <main className="connections__content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default ConnectionsList;