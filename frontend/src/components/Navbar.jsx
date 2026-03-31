// src/components/Navbar.jsx
import React, { useEffect, useState, useContext, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Joyride from "react-joyride";

import * as FaIcons from "react-icons/fa";
import "../style/Navbar.css";

import API_BASE_URL from "../config/api";

export default function Navbar({ toggleSidebar, isSidebarOpen, isMobile }) {
  const { user, logout, subscription, profileImageVersion  } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [runTour, setRunTour] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  
  const [navItems, setNavItems] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  
  const [logoUrl, setLogoUrl] = useState("");
  const [brandName, setBrandName] = useState("Brio"); // Default fallback
  const [loading, setLoading] = useState({ logo: true, name: true });
  const [remainingTime, setRemainingTime] = useState({ days: 0, hours: 0, minutes: 0 });

  const [profileImage, setProfileImage] = useState(
    user?.role === "influencer"
      ? `${API_BASE_URL}/static/defaults/influencer-avatar.png`
      : `${API_BASE_URL}/static/defaults/brand-logo.png`
  );


 


  const tourSteps = [
  {
    target: ".qb-sidebar-toggle",
    content: "Click here to open the main navigation menu.",
    disableBeacon: true
  },
  {
    target: ".qb-nav-links",
    content: "These are your primary navigation controls."
  },
  {
    target: ".qb-subscription-batch",
    content: "This shows your current subscription status."
  },
  {
    target: ".qb-user-dropdown",
    content: "Access your profile and account controls here."
  }
];

useEffect(() => {
  if (!user?.token) return;

  const userKey = user.id || user.email; // MUST be stable & unique
  const storageKey = `seenNavbarTour_${userKey}`;

  if (localStorage.getItem(storageKey)) return;

  setRunTour(true);
  setStepIndex(0);
  localStorage.setItem(storageKey, "true");

}, [user?.token]);





  // ==================== IMPROVED ICON RENDERER ====================
  const renderIcon = (iconData) => {
    if (!iconData || !iconData.value) {
      return <FaIcons.FaPalette className="qb-nav-icon-component" />;
    }

    const { type, value, alt_text } = iconData;

    switch (type) {
      case "fa_icon":
        const iconVariations = [
          value,
          value.replace(/^Fa/, ""),
          `Fa${value}`,
          value.split(" ").pop(),
          value.toLowerCase(),
          value.toUpperCase()
        ];

        for (const iconName of iconVariations) {
          if (FaIcons[iconName]) {
            const IconComponent = FaIcons[iconName];
            return <IconComponent className="qb-nav-icon-component" />;
          }
        }
        
        if (value.includes('fa-')) {
          return <i className={value} />;
        }
        
        return <FaIcons.FaPalette className="qb-nav-icon-component" />;

      case "emoji":
        return (
          <span 
            className="qb-emoji-icon" 
            title={alt_text}
            role="img"
            aria-label={alt_text || "icon"}
          >
            {value}
          </span>
        );

      case "url":
        return (
          <img 
            src={value} 
            alt={alt_text || "icon"} 
            className="qb-url-icon"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
            loading="lazy"
          />
        );

      case "upload":
        const iconUrl = `${API_BASE_URL}/icon/${value}`;
        return (
          <img 
            src={iconUrl} 
            alt={alt_text || "icon"} 
            className="qb-uploaded-icon"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
            loading="lazy"
          />
        );

      default:
        if (typeof value === 'string') {
          const IconComponent = FaIcons[value] || FaIcons[`Fa${value}`] || FaIcons[value.replace(/^Fa/, "")];
          if (IconComponent) {
            return <IconComponent className="qb-nav-icon-component" />;
          }
          if (value.length <= 3) {
            return (
              <span 
                className="qb-emoji-icon"
                role="img"
                aria-label="icon"
              >
                {value}
              </span>
            );
          }
        }
        return <FaIcons.FaPalette className="qb-nav-icon-component" />;
    }
  };

  // ==================== DATA FETCHING ====================

  // Fetch logo dynamically
  const fetchLogo = useCallback(async () => {
    if (!user?.token) return;

    try {
      setLoading(prev => ({ ...prev, logo: true }));
      const res = await fetch(`${API_BASE_URL}/api/logo/current`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setLogoUrl(url);
      } else {
        setLogoUrl("");
      }
    } catch (err) {
      console.error("Failed to fetch logo:", err);
      setLogoUrl("");
    } finally {
      setLoading(prev => ({ ...prev, logo: false }));
    }
  }, [user?.token]);

  // Fetch brand name dynamically
  const fetchBrandName = useCallback(async () => {
    if (!user?.token) return;

    try {
      setLoading(prev => ({ ...prev, name: true }));
      const res = await fetch(`${API_BASE_URL}/api/platform/name`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setBrandName(data.platform_name || "Brio");
      } else {
        setBrandName("Brio");
      }
    } catch (err) {
      console.error("Failed to fetch brand name:", err);
      setBrandName("Brio");
    } finally {
      setLoading(prev => ({ ...prev, name: false }));
    }
  }, [user?.token]);

  // Poll for brand name updates every 30 seconds
  const pollBrandName = useCallback(() => {
    const interval = setInterval(() => {
      fetchBrandName();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [fetchBrandName]);

  const DEFAULT_INFLUENCER_AVATAR =
    `${API_BASE_URL}/static/defaults/influencer-avatar.png`;

  const DEFAULT_BRAND_LOGO =
    `${API_BASE_URL}/static/defaults/brand-logo.png`;

  const fetchProfileImage = useCallback(async () => {
    if (!user?.token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/profiles/me`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      if (!res.ok) return;

      const data = await res.json();
      const profile = data.profile || data;
      const imageValue = profile.profile_picture || profile.logo;

      // 1️⃣ No image → role-based default
      if (!imageValue || imageValue.trim?.() === "") {
        setProfileImage(
          user.role === "influencer"
            ? DEFAULT_INFLUENCER_AVATAR
            : DEFAULT_BRAND_LOGO
        );
        return;
      }

      // 2️⃣ Static default image (FIXED)
      if (typeof imageValue === "string" && imageValue.startsWith("/static/")) {
        setProfileImage(`${API_BASE_URL}${imageValue}`);
        return;
      }

      // 3️⃣ Uploaded image (GridFS)
      setProfileImage(
        `${API_BASE_URL}/profiles/image/${imageValue}?t=${Date.now()}`
      );

    } catch (err) {
      console.error("Profile image fetch error:", err);
      setProfileImage(
        user.role === "influencer"
          ? DEFAULT_INFLUENCER_AVATAR
          : DEFAULT_BRAND_LOGO
      );
    }
  }, [user]);

  const fetchNavbar = useCallback(async () => {
    if (!user?.role || !user?.token) {
      setNavItems([]);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/navbar/${user.role}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      
      const data = await res.json();
      const items = data?.items || data?.navbar || [];
      setNavItems(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error("❌ Navbar fetch error:", err);
      setNavItems([]);
    }
  }, [user]);

  const calculateRemainingTime = useCallback(() => {
    if (!subscription?.current_period_end) return;

    try {
      const endDate = new Date(subscription.current_period_end);
      const now = new Date();
      const difference = endDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        setRemainingTime({ days, hours, minutes });
      } else {
        setRemainingTime({ days: 0, hours: 0, minutes: 0 });
      }
    } catch (error) {
      console.error("Error calculating countdown:", error);
    }
  }, [subscription]);

  // ==================== EFFECTS ====================

  useEffect(() => {
    fetchLogo();
    fetchBrandName();
    fetchNavbar();
    fetchProfileImage();
    
    const cleanup = pollBrandName();
    
    return () => {
      cleanup();
      if (logoUrl) {
        URL.revokeObjectURL(logoUrl);
      }
    };
  }, [fetchLogo, fetchBrandName, fetchNavbar, fetchProfileImage, profileImageVersion, pollBrandName]);

  useEffect(() => {
    calculateRemainingTime();
    const interval = setInterval(calculateRemainingTime, 60000);
    return () => clearInterval(interval);
  }, [calculateRemainingTime]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownOpen && !event.target.closest(".qb-user-dropdown")) {
        setUserDropdownOpen(false);
      }
      if (isMenuOpen && !event.target.closest(".qb-mobile-menu") && !event.target.closest(".qb-mobile-toggle")) {
        setIsMenuOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userDropdownOpen, isMenuOpen]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // ==================== SUBSCRIPTION BATCH ====================

  const getBatchConfig = () => {
    if (!subscription) {
      return {
        label: "FREE",
        gradient: "linear-gradient(135deg, #6B7280, #4B5563)",
        borderColor: "#6B7280",
        icon: <FaIcons.FaStar className="qb-batch-icon" />,
        showCountdown: false
      };
    }

    const plans = {
      free_trial: {
        label: "FREE TRIAL",
        gradient: "linear-gradient(135deg, #10B981, #059669)",
        borderColor: "#10B981",
        icon: <FaIcons.FaClock className="qb-batch-icon" />,
        showCountdown: true
      },
      trial: {
        label: "FREE TRIAL",
        gradient: "linear-gradient(135deg, #10B981, #059669)",
        borderColor: "#10B981",
        icon: <FaIcons.FaClock className="qb-batch-icon" />,
        showCountdown: true
      },
      starter: {
        label: "STARTER",
        gradient: "linear-gradient(135deg, #3B82F6, #1D4ED8)",
        borderColor: "#3B82F6",
        icon: <FaIcons.FaRocket className="qb-batch-icon" />,
        showCountdown: true
      },
      pro: {
        label: "PRO",
        gradient: "linear-gradient(135deg, #8B5CF6, #7C3AED)",
        borderColor: "#8B5CF6",
        icon: <FaIcons.FaGem className="qb-batch-icon" />,
        showCountdown: true
      },
      enterprise: {
        label: "ENTERPRISE",
        gradient: "linear-gradient(135deg, #F59E0B, #D97706)",
        borderColor: "#F59E0B",
        icon: <FaIcons.FaCrown className="qb-batch-icon" />,
        showCountdown: true
      },
      free: {
        label: "FREE",
        gradient: "linear-gradient(135deg, #6B7280, #4B5563)",
        borderColor: "#6B7280",
        icon: <FaIcons.FaStar className="qb-batch-icon" />,
        showCountdown: false
      }
    };

    let planKey = 'free';
    
    if (subscription.plan) {
      planKey = subscription.plan.split('_')[0];
    } else if (subscription.type === 'trial') {
      planKey = 'free_trial';
    } else if (subscription.type === 'paid') {
      planKey = subscription.plan_name?.toLowerCase().includes('pro') ? 'pro' : 
                subscription.plan_name?.toLowerCase().includes('enterprise') ? 'enterprise' : 'starter';
    }

    return plans[planKey] || plans.free;
  };

  const renderSubscriptionBatch = () => {
    const batchConfig = getBatchConfig();
    const shouldShowCountdown = batchConfig.showCountdown && 
                               subscription?.current_period_end && 
                               remainingTime.days >= 0;

    return (
      <div className="qb-subscription-batch-wrapper">
        <div 
          className="qb-subscription-batch"
          style={{
            background: batchConfig.gradient,
            border: `2px solid ${batchConfig.borderColor}`,
            color: "white"
          }}
        >
          <span className="qb-batch-icon-container">{batchConfig.icon}</span>
          <span className="qb-batch-label">{batchConfig.label}</span>
          
          {shouldShowCountdown && (
            <div className="qb-countdown-timer">
              <div className="qb-countdown-item">
                <span className="qb-countdown-value">{remainingTime.days}</span>
                <span className="qb-countdown-label">D</span>
              </div>
              <div className="qb-countdown-separator">:</div>
              <div className="qb-countdown-item">
                <span className="qb-countdown-value">{remainingTime.hours.toString().padStart(2, '0')}</span>
                <span className="qb-countdown-label">H</span>
              </div>
              <div className="qb-countdown-separator">:</div>
              <div className="qb-countdown-item">
                <span className="qb-countdown-value">{remainingTime.minutes.toString().padStart(2, '0')}</span>
                <span className="qb-countdown-label">M</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderMobileSubscriptionBatch = () => {
    const batchConfig = getBatchConfig();
    const shouldShowCountdown = batchConfig.showCountdown && 
                               subscription?.current_period_end && 
                               remainingTime.days >= 0;

    return (
      <div className="qb-mobile-subscription-container">
        <div 
          className="qb-mobile-subscription-batch"
          style={{
            background: batchConfig.gradient,
            border: `2px solid ${batchConfig.borderColor}`,
            color: "white"
          }}
        >
          <span className="qb-mobile-batch-icon">{batchConfig.icon}</span>
          <span className="qb-mobile-batch-label">{batchConfig.label}</span>
          {shouldShowCountdown && (
            <div className="qb-mobile-countdown">
              <span className="qb-mobile-countdown-text">
                {remainingTime.days}d {remainingTime.hours}h {remainingTime.minutes}m
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ==================== NAVIGATION RENDERING ====================

  const renderNavItems = (items, isMobile = false, depth = 0) => {
    return items.map((item) => {
      const isActive = location.pathname === item.path || 
                      location.pathname.startsWith(`${item.path}/`);
      const hasChildren = item.children && item.children.length > 0;

      return (
        <div
          key={item.path}
          className={`qb-nav-group ${isMobile ? "qb-mobile-nav-group" : ""} ${
            hasChildren ? "qb-has-children" : ""
          } depth-${depth}`}
        >
          <Link
            to={item.path}
            className={`qb-nav-item ${isActive ? "qb-active" : ""}`}
            onClick={() => isMobile && setIsMenuOpen(false)}
          >
            <span className="qb-nav-icon">
              {renderIcon(item.icon)}
            </span>
            <span className="qb-nav-text">{item.title}</span>
            {hasChildren && <FaIcons.FaChevronDown className="qb-nav-chevron" />}
          </Link>
          
          {hasChildren && (
            <div className={`qb-nav-children ${isMobile ? "qb-mobile-nav-children" : ""}`}>
              {renderNavItems(item.children, isMobile, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  // ==================== EVENT HANDLERS ====================

  const toggleMobileMenu = () => setIsMenuOpen(prev => !prev);
  const toggleUserDropdown = () => setUserDropdownOpen(prev => !prev);

  const handleProfileNavigation = () => {
    if (user?.role === "influencer") navigate("/influencer/me");
    else if (user?.role === "brand") navigate("/brand/me");
    else navigate("/profile");
    setUserDropdownOpen(false);
    setIsMenuOpen(false);
  };

  // ==================== RENDER ====================

  if (!user) return null;

  return (
    <>
      {/* Inline styles for loading skeletons */}
      <style>{`
        .brand-name-skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 4px;
          display: inline-block;
          width: 100px;
          height: 20px;
          margin-left: 10px;
        }

        .logo-skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 8px;
          width: 40px;
          height: 40px;
        }

        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .qb-brand-name {
          transition: opacity 0.3s ease;
        }

        .qb-brand-name.loading {
          opacity: 0.7;
        }
          .qb-tour-pulse {
  animation: qbPulse 1s infinite;
}

@keyframes qbPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.12); }
  100% { transform: scale(1); }
}

      `}</style>
      
      <nav className="qb-navbar">
        <Joyride
        key={runTour ? "tour-running" : "tour-idle"}
  steps={tourSteps}
  run={runTour}
  stepIndex={stepIndex}
  continuous
  showSkipButton
  showProgress
  scrollToFirstStep
  disableOverlayClose
  spotlightClicks={true} 
  styles={{
    options: {
      primaryColor: "#00A3A3",
      zIndex: 10000
    }
  }}
 callback={(data) => {
  const { action, index, status, type } = data;

  if (status === "finished" || status === "skipped") {
    setRunTour(false);
    setStepIndex(0);
    return;
  }

  if (type === "step:after") {
    if (action === "next") setStepIndex(index + 1);
    if (action === "prev") setStepIndex(index - 1);
  }
}}



/>


        {/* LEFT: Logo + Sidebar Toggle */}
        <div className="qb-navbar-left">
          <button 
            className={`qb-sidebar-toggle ${runTour && stepIndex === 0 ? "qb-tour-pulse" : ""}`}
            onClick={() => {
    toggleSidebar();
    if (runTour && stepIndex === 0) {
      setStepIndex(1); // move tour forward after click
    }
  }}
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {isSidebarOpen ? <FaIcons.FaTimes /> : <FaIcons.FaBars />}
          </button>

          <div className="qb-nav-brand">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="qb-brand-link">
              {loading.logo ? (
                // <div className="logo-skeleton"></div>
                 <div className="qb-logo-placeholder">
      <span className="qb-brand-name">
  {loading.name ? "Brio" : (brandName || "Brio")}
</span>
  </div>
              ) : logoUrl ? (
                <>
                  <img 
                    src={logoUrl} 
                    alt={`${brandName} Logo`} 
                    className="qb-navbar-logo"
                    onError={(e) => {
                      console.error("Logo failed to load");
                      e.target.style.display = 'none';
                    }}
                  />
                  {/* <span className={`qb-brand-name ${loading.name ? 'loading' : ''}`}>
                    {loading.name ? (
                      <div className="brand-name-skeleton"></div>
                    ) : (
                      brandName
                    )}
                  </span> */}
                  <span className="qb-brand-name">
  {loading.name ? "Brio" : (brandName || "Brio")}
</span>
                </>
              ) : (
                <div className="qb-logo-placeholder">
                  <FaIcons.FaProjectDiagram className="qb-logo-fallback" />
                  <span className="qb-brand-name">
                    {loading.name ? (
                      <div className="brand-name-skeleton"></div>
                    ) : (
                      brandName
                    )}
                  </span>
                </div>
              )}
            </Link>
          </div>
        </div>

        {/* CENTER: Navigation Links */}
        <div className="qb-navbar-center">
          <div className="qb-nav-links">
            {renderNavItems(navItems)}
          </div>
        </div>

        {/* RIGHT: Subscription + User Controls */}
        <div className="qb-navbar-right">
          {user.role !== "admin" && renderSubscriptionBatch()}

          <div className="qb-user-dropdown">
            <button
              className={`qb-user-toggle ${userDropdownOpen ? "qb-active" : ""}`}
              onClick={toggleUserDropdown}
              aria-expanded={userDropdownOpen}
            >
              {user.role !== "admin" && (
                <div className="qb-user-avatar">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                    />
                  ) : (
                    <FaIcons.FaUserCircle className="qb-avatar-icon" />
                  )}
                </div>
              )}

              <div className="qb-user-info">
                <span className="qb-user-name">{user.name || user.email}</span>
                <span className="qb-user-role">{user.role}</span>
              </div>
              <FaIcons.FaChevronDown className={`qb-dropdown-chevron ${userDropdownOpen ? "qb-rotate" : ""}`} />
            </button>

            {userDropdownOpen && (
              <div className="qb-dropdown-menu">
                <div className="qb-dropdown-user">
                  {user.role !== "admin" && (
                    <div className="qb-dropdown-avatar">
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt={user.name || user.email}
                          className="qb-dropdown-avatar-img"
                          onError={(e) => {
                            e.currentTarget.src =
                              user.role === "influencer"
                                ? DEFAULT_INFLUENCER_AVATAR
                                : DEFAULT_BRAND_LOGO;
                          }}
                        />
                      ) : (
                        <FaIcons.FaUserCircle className="qb-dropdown-avatar-icon" />
                      )}
                    </div>
                  )}
                  <div className="qb-dropdown-details">
                    <div className="qb-dropdown-name">{user.username || user.email}</div>
                    <div className="qb-dropdown-role">{user.role}</div>
                  </div>
                </div>
                <div className="qb-dropdown-divider"></div>

                {user.role !== "admin" && (
                  <button onClick={handleProfileNavigation} className="qb-dropdown-item">
                    <FaIcons.FaUser className="qb-dropdown-icon" />
                    <span>View Profile</span>
                  </button>
                )}
                <div className="qb-dropdown-divider"></div>
                <button onClick={() => {
                  logout();
                  navigate("/login");
                }} className="qb-dropdown-item">
                  <FaIcons.FaSignOutAlt className="qb-dropdown-icon" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>

          <button
            className={`qb-mobile-toggle ${isMenuOpen ? "qb-active" : ""}`}
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        {/* MOBILE MENU */}
        <div className={`qb-mobile-menu ${isMenuOpen ? "qb-active" : ""}`}>
          <div className="qb-mobile-header">
            <div className="qb-mobile-logo">
              {loading.logo ? (
                <div className="logo-skeleton" style={{ width: '32px', height: '32px' }}></div>
              ) : logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={`${brandName} Logo`} 
                  className="qb-mobile-logo-img"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="qb-mobile-logo-placeholder">
                  <FaIcons.FaProjectDiagram className="qb-mobile-logo-fallback" />
                  <span>{loading.name ? 'Loading...' : brandName}</span>
                </div>
              )}
            </div>
            <button 
              className="qb-mobile-close" 
              onClick={() => setIsMenuOpen(false)}
              aria-label="Close mobile menu"
            >
              <FaIcons.FaTimes />
            </button>
          </div>

          {user.role !== "admin" && renderMobileSubscriptionBatch()}

          <div className="qb-mobile-nav">
            {renderNavItems(navItems, true)}
          </div>

          <div className="qb-mobile-user">
            {user.role !== "admin" && (
              <div className="qb-mobile-user-info" onClick={handleProfileNavigation}>
                <div className="qb-mobile-avatar">
                  {profileImage ? (
                    <img src={profileImage} alt={user.name || user.email} className="qb-mobile-avatar-img" />
                  ) : (
                    <FaIcons.FaUserCircle className="qb-mobile-avatar-icon" />
                  )}
                </div>
                <div className="qb-mobile-user-details">
                  <div className="qb-mobile-user-name">{user.name || user.email}</div>
                  <div className="qb-mobile-user-role">{user.role}</div>
                  <div className="qb-view-profile">View Profile →</div>
                </div>
              </div>
            )}
            <button
              onClick={() => {
                logout();
                setIsMenuOpen(false);
                navigate("/login");
              }}
              className="qb-mobile-logout"
            >
              <FaIcons.FaSignOutAlt className="qb-logout-icon" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>
      <div className="qb-navbar-spacer"></div>
    </>
  );
}