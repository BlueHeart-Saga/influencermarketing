// SocialMediaEmbed.jsx
import React, { useState } from "react";
import { FaYoutube, FaInstagram, FaTwitter, FaTiktok, FaFacebook, FaLinkedin, FaMobileAlt, FaDesktop, FaShare, FaLink } from "react-icons/fa";
import "../style/SocialMediaEmbed.css";

const SocialMediaEmbed = () => {
  const [selected, setSelected] = useState("instagram");
  const [isMobileView, setIsMobileView] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");

  // Updated embeds with mobile-optimized versions
  const embeds = {
    facebook: {
      url: "https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Ffacebook&tabs=timeline&width=340&height=500&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=true&appId",
      mobileUrl: "https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Ffacebook&tabs=timeline&width=280&height=400&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=true&appId",
      color: "#1877F2",
      category: "social"
    },
    twitter: {
      url: "https://twitframe.com/show?url=https://twitter.com/Twitter/status/20",
      mobileUrl: "https://twitframe.com/show?url=https://twitter.com/Twitter/status/20",
      color: "#1DA1F2",
      category: "social"
    },
    instagram: {
      url: "https://www.instagram.com/p/CxvPUI3sGVo/embed/",
      mobileUrl: "https://www.instagram.com/p/CxvPUI3sGVo/embed/captioned/",
      color: "#E4405F",
      category: "visual"
    },
    tiktok: {
      url: "https://www.tiktok.com/embed/v2/7071512851395357998",
      mobileUrl: "https://www.tiktok.com/embed/v2/7071512851395357998",
      color: "#000000",
      category: "video"
    },
    youtube: {
      url: "https://www.youtube.com/embed/_tG2Ktr3Jrk",
      mobileUrl: "https://www.youtube.com/embed/_tG2Ktr3Jrk",
      color: "#FF0000",
      category: "video"
    },
    linkedin: {
      url: "https://www.linkedin.com/embed/feed/update/urn:li:share:7071512851395357998",
      mobileUrl: "https://www.linkedin.com/embed/feed/update/urn:li:share:7071512851395357998",
      color: "#0A66C2",
      category: "professional"
    }
  };

  const categories = {
    all: { name: "All Platforms", icon: "🌐" },
    social: { name: "Social", icon: "💬" },
    visual: { name: "Visual", icon: "📸" },
    video: { name: "Video", icon: "🎥" },
    professional: { name: "Professional", icon: "💼" }
  };

  const getEmbedUrl = () => {
    if (!selected) return null;
    return isMobileView ? embeds[selected].mobileUrl : embeds[selected].url;
  };

  const filteredPlatforms = activeCategory === "all" 
    ? Object.keys(embeds) 
    : Object.keys(embeds).filter(platform => embeds[platform].category === activeCategory);

  return (
    <div className="socialhub-container">
      {/* Header Section */}
      <div className="socialhub-header">
        <div className="socialhub-title">
          <h2>Social Media Hub</h2>
          <p>Explore and manage all your social platforms in one place</p>
        </div>
        <div className="socialhub-controls">
          <div className="view-toggle">
            <button 
              className={`view-toggle-btn ${!isMobileView ? 'active' : ''}`}
              onClick={() => setIsMobileView(false)}
            >
              <FaDesktop /> Desktop
            </button>
            <button 
              className={`view-toggle-btn ${isMobileView ? 'active' : ''}`}
              onClick={() => setIsMobileView(true)}
            >
              <FaMobileAlt /> Mobile
            </button>
          </div>
        </div>
      </div>

      <div className="socialhub-layout">
        {/* Sidebar Navigation */}
        <div className="socialhub-sidebar">
          <div className="platform-categories">
            <h3>Categories</h3>
            {Object.entries(categories).map(([key, category]) => (
              <button
                key={key}
                className={`category-btn ${activeCategory === key ? 'active' : ''}`}
                onClick={() => setActiveCategory(key)}
              >
                <span className="category-icon">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>

          <div className="platform-nav">
            <h3>Platforms</h3>
            <div className="platform-grid">
              {filteredPlatforms.map(platform => (
                <button
                  key={platform}
                  className={`platform-card ${selected === platform ? 'active' : ''}`}
                  onClick={() => setSelected(platform)}
                  style={{ '--platform-color': embeds[platform].color }}
                >
                  <div className="platform-icon">
                    {platform === 'facebook' && <FaFacebook />}
                    {platform === 'instagram' && <FaInstagram />}
                    {platform === 'twitter' && <FaTwitter />}
                    {platform === 'youtube' && <FaYoutube />}
                    {platform === 'tiktok' && <FaTiktok />}
                    {platform === 'linkedin' && <FaLinkedin />}
                  </div>
                  <span className="platform-name">
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <h3>Quick Actions</h3>
            <SocialMediaLinks />
            <ShareSection />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="socialhub-main">
          {/* Platform Header */}
          <div className="platform-header">
            <div className="platform-info">
              <div 
                className="platform-badge"
                style={{ backgroundColor: embeds[selected]?.color }}
              >
                {selected === 'facebook' && <FaFacebook />}
                {selected === 'instagram' && <FaInstagram />}
                {selected === 'twitter' && <FaTwitter />}
                {selected === 'youtube' && <FaYoutube />}
                {selected === 'tiktok' && <FaTiktok />}
                {selected === 'linkedin' && <FaLinkedin />}
              </div>
              <div>
                <h3>{selected.charAt(0).toUpperCase() + selected.slice(1)} Preview</h3>
                <span className="view-mode">{isMobileView ? 'Mobile View' : 'Desktop View'}</span>
              </div>
            </div>
            <button className="share-platform-btn">
              <FaShare /> Share Preview
            </button>
          </div>

          {/* Embed Viewer */}
          <div className={`embed-viewer ${isMobileView ? 'mobile-mode' : 'desktop-mode'}`}>
            {isMobileView ? (
              <div className="mobile-simulator">
                <div className="mobile-frame">
                  <div className="mobile-status-bar">
                    <span className="mobile-time">9:41</span>
                    <div className="mobile-status-icons">
                      <span>📶</span>
                      <span>🔋</span>
                    </div>
                  </div>
                  <div className="mobile-content">
                    {selected ? (
                      <iframe
                        src={getEmbedUrl()}
                        title={`${selected}-mobile-embed`}
                        className="mobile-embed"
                        frameBorder="0"
                        allowFullScreen
                      />
                    ) : (
                      <div className="no-platform">
                        <FaMobileAlt />
                        <p>Select a platform to preview</p>
                      </div>
                    )}
                  </div>
                  <div className="mobile-nav-bar">
                    <div className="home-indicator"></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="desktop-viewer">
                {selected ? (
                  <iframe
                    src={getEmbedUrl()}
                    title={`${selected}-desktop-embed`}
                    className="desktop-embed"
                    frameBorder="0"
                    allowFullScreen
                  />
                ) : (
                  <div className="no-platform">
                    <FaDesktop />
                    <p>Select a platform to preview</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Platform Stats */}
          <div className="platform-stats">
            <div className="stat-card">
              <span className="stat-value">6</span>
              <span className="stat-label">Platforms</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{isMobileView ? 'Mobile' : 'Desktop'}</span>
              <span className="stat-label">View Mode</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{categories[activeCategory].name}</span>
              <span className="stat-label">Active Category</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Social Media Links Component
const SocialMediaLinks = () => (
  <div className="social-links-widget">
    <h4>Follow Us</h4>
    <div className="social-links-grid">
      <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link">
        <FaFacebook />
        <span>Facebook</span>
      </a>
      <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link">
        <FaInstagram />
        <span>Instagram</span>
      </a>
      <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link">
        <FaTwitter />
        <span>Twitter</span>
      </a>
      <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-link">
        <FaYoutube />
        <span>YouTube</span>
      </a>
    </div>
  </div>
);

// Share Section Component
const ShareSection = () => (
  <div className="share-widget">
    <h4>Share This Hub</h4>
    <div className="share-buttons">
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} 
         target="_blank" rel="noopener noreferrer" className="share-btn">
        <FaFacebook />
      </a>
      <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}`} 
         target="_blank" rel="noopener noreferrer" className="share-btn">
        <FaTwitter />
      </a>
      <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`} 
         target="_blank" rel="noopener noreferrer" className="share-btn">
        <FaLinkedin />
      </a>
      <button className="share-btn copy-link" onClick={() => navigator.clipboard.writeText(window.location.href)}>
        <FaLink />
      </button>
    </div>
  </div>
);

export default SocialMediaEmbed;