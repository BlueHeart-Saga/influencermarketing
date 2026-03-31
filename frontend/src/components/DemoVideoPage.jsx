import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, Volume2, Maximize, ChevronRight, CheckCircle, Zap, Users, Target, BarChart3, Shield, Globe } from 'lucide-react';

const DemoVideoPage = () => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef(null);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleSeek = (e) => {
    const value = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = value;
      setCurrentTime(value);
    }
  };

  const handleVolumeChange = (e) => {
    const value = parseFloat(e.target.value);
    setVolume(value);
    if (videoRef.current) {
      videoRef.current.volume = value;
      setIsMuted(value === 0);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if (videoRef.current.webkitRequestFullscreen) {
        videoRef.current.webkitRequestFullscreen();
      }
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const platformFeatures = [
    // ... (keep the same platformFeatures array as before)
    {
      icon: <Zap size={24} />,
      title: "AI-Powered Campaign Management",
      description: "Launch campaigns in minutes with intelligent automation, smart workflows, and predictive analytics.",
      features: [
        "One-click campaign creation",
        "AI influencer matching",
        "Automated outreach sequences",
        "Smart budget optimization"
      ]
    },
    {
      icon: <Users size={24} />,
      title: "Influencer Discovery & Matching",
      description: "Find the perfect creators with our advanced AI algorithms analyzing 200+ data points.",
      features: [
        "10M+ verified influencers",
        "Advanced audience insights",
        "Authenticity verification",
        "Performance prediction"
      ]
    },
    {
      icon: <Target size={24} />,
      title: "Advanced Analytics & Insights",
      description: "Track performance, measure ROI, and optimize campaigns with real-time data.",
      features: [
        "Real-time performance tracking",
        "ROI and conversion analytics",
        "Custom reporting",
        "Predictive analytics"
      ]
    },
    {
      icon: <BarChart3 size={24} />,
      title: "Workflow Automation",
      description: "Streamline your entire influencer marketing process with intelligent automation.",
      features: [
        "Automated contract management",
        "Payment processing",
        "Content approval workflows",
        "Team collaboration tools"
      ]
    },
    {
      icon: <Shield size={24} />,
      title: "Enterprise Security",
      description: "Bank-level security and compliance for your sensitive campaign data.",
      features: [
        "End-to-end encryption",
        "GDPR & CCPA compliant",
        "SOC 2 certified",
        "Regular security audits"
      ]
    },
    {
      icon: <Globe size={24} />,
      title: "Global Platform",
      description: "Run campaigns across 100+ countries with multi-language support.",
      features: [
        "Multi-currency support",
        "Local payment methods",
        "Regional compliance",
        "24/7 global support"
      ]
    }
  ];

  const platformStats = [
    { value: "10K+", label: "Active Brands" },
    { value: "50K+", label: "Influencers" },
    { value: "$2.5B+", label: "Campaign Value" },
    { value: "98%", label: "Satisfaction Rate" }
  ];

  return (
    <div className="demo-video-wrapper">
      {/* Hero Section with Video */}
      <section className="demo-hero">
        <div className="demo-container">
          <div className="demo-header">
            <h1 className="demo-title">Platform Demo & Tour</h1>
            <p className="demo-subtitle">
              See our AI-powered influencer marketing platform in action. Watch how brands and creators achieve remarkable results.
            </p>
          </div>

          {/* Video Player */}
          <div className="video-player-container">
            <div className="video-wrapper">
              <video
                ref={videoRef}
                className="demo-video"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleTimeUpdate}
                poster="/images/video-thumbnail.jpg"
              >
                <source src="/videos/platform-demo.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              {/* Custom Video Controls - Positioned absolutely over video */}
              <div className="video-controls-overlay">
                <div className="progress-bar-container">
                  <input
                    type="range"
                    className="progress-bar"
                    min="0"
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeek}
                    style={{
                      background: `linear-gradient(to right, #3b82f6 ${(currentTime / duration) * 100}%, #e2e8f0 ${(currentTime / duration) * 100}%)`
                    }}
                  />
                </div>

                {/* Control Buttons */}
                <div className="control-buttons">
                  <div className="left-controls">
                    <button className="control-btn" onClick={handlePlayPause}>
                      {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                    
                    <div className="time-display">
                      <span>{formatTime(currentTime)}</span>
                      <span>/</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  <div className="right-controls">
                    <div className="volume-control">
                      <button 
                        className="control-btn"
                        onClick={() => {
                          if (videoRef.current) {
                            if (isMuted) {
                              videoRef.current.volume = volume;
                            } else {
                              videoRef.current.volume = 0;
                            }
                            setIsMuted(!isMuted);
                          }
                        }}
                      >
                        <Volume2 size={20} />
                      </button>
                      <input
                        type="range"
                        className="volume-slider"
                        min="0"
                        max="1"
                        step="0.1"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                      />
                    </div>

                    <button className="control-btn" onClick={handleFullscreen}>
                      <Maximize size={20} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Video Chapters */}
              <div className="video-chapters">
                <button className="chapter-btn active">
                  <span className="chapter-marker">▶</span>
                  <span className="chapter-label">Platform Overview</span>
                  <span className="chapter-time">0:00</span>
                </button>
                <button className="chapter-btn">
                  <span className="chapter-marker">02</span>
                  <span className="chapter-label">Campaign Creation</span>
                  <span className="chapter-time">2:30</span>
                </button>
                <button className="chapter-btn">
                  <span className="chapter-marker">03</span>
                  <span className="chapter-label">Influencer Discovery</span>
                  <span className="chapter-time">5:45</span>
                </button>
                <button className="chapter-btn">
                  <span className="chapter-marker">04</span>
                  <span className="chapter-label">Analytics Dashboard</span>
                  <span className="chapter-time">8:15</span>
                </button>
              </div>
            </div>

            {/* Video Info */}
            <div className="video-info">
              <h3 className="video-info-title">What You'll Learn</h3>
              <ul className="video-points">
                <li>
                  <CheckCircle size={16} />
                  <span>How to create and launch campaigns in minutes</span>
                </li>
                <li>
                  <CheckCircle size={16} />
                  <span>AI-powered influencer matching in action</span>
                </li>
                <li>
                  <CheckCircle size={16} />
                  <span>Real-time analytics and performance tracking</span>
                </li>
                <li>
                  <CheckCircle size={16} />
                  <span>Automated workflow and payment processing</span>
                </li>
                <li>
                  <CheckCircle size={16} />
                  <span>Team collaboration and project management</span>
                </li>
              </ul>

              <div className="video-actions">
                <button className="demo-request-btn" onClick={handleLoginRedirect}>
                  Request Personal Demo
                  <ChevronRight size={18} />
                </button>
                <button className="docs-btn" onClick={handleLoginRedirect}>
                  View Documentation
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Stats */}
      <section className="platform-stats-section">
        <div className="demo-container">
          <div className="stats-grid">
            {platformStats.map((stat, index) => (
              <div key={index} className="stat-card">
                <h3 className="stat-value">{stat.value}</h3>
                <p className="stat-label">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="platform-features-section">
        <div className="demo-container">
          <div className="features-header">
            <h2 className="features-title">Comprehensive Platform Features</h2>
            <p className="features-subtitle">
              Everything you need to run successful influencer marketing campaigns at scale
            </p>
          </div>

          <div className="features-grid">
            {platformFeatures.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                
                <div className="feature-list">
                  {feature.features.map((item, idx) => (
                    <div key={idx} className="feature-item">
                      <CheckCircle size={16} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <button className="learn-more-btn" onClick={handleLoginRedirect}>
                  Learn More
                  <ChevronRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Comparison */}
      <section className="platform-comparison">
        <div className="demo-container">
          <div className="comparison-header">
            <h2 className="comparison-title">Why Choose Our Platform?</h2>
            <p className="comparison-subtitle">
              Compare how we stack up against traditional influencer marketing methods
            </p>
          </div>

          <div className="comparison-table">
            <div className="comparison-header-row">
              <div className="comparison-header-cell feature-column">Features</div>
              <div className="comparison-header-cell">Traditional Methods</div>
              <div className="comparison-header-cell highlight">Brio Platform</div>
            </div>

            {[
              { feature: "Campaign Setup Time", traditional: "2-3 weeks", brio: "10 minutes" },
              { feature: "Influencer Discovery", traditional: "Manual research", brio: "AI-powered matching" },
              { feature: "Performance Tracking", traditional: "Spreadsheets", brio: "Real-time analytics" },
              { feature: "Contract Management", traditional: "Email chains", brio: "Automated workflows" },
              { feature: "Payment Processing", traditional: "Manual transfers", brio: "Automated payouts" },
              { feature: "ROI Measurement", traditional: "Estimated", brio: "Data-driven insights" }
            ].map((row, index) => (
              <div key={index} className="comparison-row">
                <div className="comparison-cell feature-column">{row.feature}</div>
                <div className="comparison-cell traditional-cell">{row.traditional}</div>
                <div className="comparison-cell highlight-cell">
                  <CheckCircle size={16} />
                  <span>{row.brio}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="demo-cta">
        <div className="demo-container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to See It Live?</h2>
            <p className="cta-text">
              Schedule a personalized demo with our team and see how our platform can transform your influencer marketing strategy.
            </p>
            <div className="cta-buttons">
              <button className="cta-btn primary" onClick={handleLoginRedirect}>
                Schedule Live Demo
                <ChevronRight size={20} />
              </button>
              <button className="cta-btn secondary" onClick={handleLoginRedirect}>
                Start Free Trial
              </button>
            </div>
            <div className="cta-features">
              <span>✓ 30-minute personalized walkthrough</span>
              <span>✓ Q&A with platform experts</span>
              <span>✓ Free strategy consultation</span>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .demo-video-wrapper {
          width: 100%;
          background: #ffffff;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .demo-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        /* Hero Section */
        .demo-hero {
          padding: 60px 0 40px;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }

        .demo-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .demo-title {
          font-size: 42px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 16px;
          background: linear-gradient(135deg, #3b82f6 0%, #0f6eea 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .demo-subtitle {
          font-size: 18px;
          color: #64748b;
          line-height: 1.6;
          max-width: 700px;
          margin: 0 auto;
        }

        /* Video Player */
        .video-player-container {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 32px;
          margin-bottom: 60px;
        }

        @media (max-width: 968px) {
          .video-player-container {
            grid-template-columns: 1fr;
          }
        }

        .video-wrapper {
          background: #000;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          position: relative;
        }

        .demo-video {
          width: 100%;
          height: 400px;
          object-fit: cover;
          display: block;
        }

        /* Fixed Video Controls Overlay */
        .video-controls-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent);
          padding: 20px 20px 10px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .video-wrapper:hover .video-controls-overlay {
          opacity: 1;
        }

        .progress-bar-container {
          margin-bottom: 15px;
        }

        .progress-bar {
          width: 100%;
          height: 4px;
          -webkit-appearance: none;
          appearance: none;
          background: #e2e8f0;
          border-radius: 2px;
          outline: none;
          cursor: pointer;
          opacity: 0.8;
          transition: opacity 0.2s;
        }

        .progress-bar:hover {
          opacity: 1;
          height: 6px;
        }

        .progress-bar::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .progress-bar:hover::-webkit-slider-thumb {
          opacity: 1;
        }

        .control-buttons {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .left-controls, .right-controls {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .control-btn {
          background: transparent;
          border: none;
          color: white;
          cursor: pointer;
          padding: 8px;
          border-radius: 6px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.9;
        }

        .control-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          opacity: 1;
          transform: scale(1.1);
        }

        .time-display {
          color: white;
          font-size: 14px;
          font-weight: 500;
          display: flex;
          gap: 4px;
          opacity: 0.9;
        }

        .volume-control {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .volume-slider {
          width: 80px;
          height: 4px;
          -webkit-appearance: none;
          background: rgba(255, 255, 255, 0.7);
          border-radius: 2px;
          outline: none;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.2s, width 0.2s;
        }

        .volume-control:hover .volume-slider {
          opacity: 1;
          width: 100px;
        }

        .volume-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
        }

        /* Video Chapters */
        .video-chapters {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1px;
          background: #e2e8f0;
          border-radius: 0 0 16px 16px;
          overflow: hidden;
        }

        .chapter-btn {
          padding: 16px;
          background: white;
          border: none;
          cursor: pointer;
          text-align: left;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .chapter-btn:hover {
          background: #f8fafc;
        }

        .chapter-btn.active {
          background: #eff6ff;
          border-left: 3px solid #3b82f6;
        }

        .chapter-marker {
          font-size: 12px;
          color: #3b82f6;
          font-weight: 600;
        }

        .chapter-label {
          font-size: 13px;
          font-weight: 600;
          color: #1e293b;
        }

        .chapter-time {
          font-size: 12px;
          color: #64748b;
        }

        /* Video Info */
        .video-info {
          padding: 24px;
          background: white;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
        }

        .video-info-title {
          font-size: 20px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 20px;
        }

        .video-points {
          list-style: none;
          margin-bottom: 24px;
        }

        .video-points li {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 12px;
          font-size: 15px;
          color: #475569;
        }

        .video-points li svg {
          color: #10b981;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .video-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .demo-request-btn {
          padding: 14px 20px;
          background: linear-gradient(135deg, #3b82f6 0%, #0f6eea 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s;
        }

        .demo-request-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);
        }

        .docs-btn {
          padding: 14px 20px;
          background: white;
          color: #3b82f6;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .docs-btn:hover {
          border-color: #3b82f6;
          background: #f8fafc;
        }

        /* Platform Stats */
        .platform-stats-section {
          padding: 60px 0;
          background: white;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }

        .stat-card {
          text-align: center;
          padding: 32px 24px;
          background: #f8fafc;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          transition: all 0.3s;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
          border-color: #3b82f6;
        }

        .stat-value {
          font-size: 42px;
          font-weight: 800;
          color: #3b82f6;
          margin-bottom: 8px;
          line-height: 1;
        }

        .stat-label {
          font-size: 15px;
          color: #64748b;
          font-weight: 600;
        }

        /* Platform Features */
        .platform-features-section {
          padding: 80px 0;
          background: #f8fafc;
        }

        .features-header {
          text-align: center;
          margin-bottom: 60px;
        }

        .features-title {
          font-size: 36px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 16px;
        }

        .features-subtitle {
          font-size: 18px;
          color: #64748b;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 32px;
        }

        @media (max-width: 968px) {
          .features-grid {
            grid-template-columns: 1fr;
          }
        }

        .feature-card {
          background: white;
          padding: 32px;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          transition: all 0.3s;
        }

        .feature-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          border-color: #3b82f6;
        }

        .feature-icon {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #3b82f6 0%, #0f6eea 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin-bottom: 24px;
        }

        .feature-title {
          font-size: 20px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 12px;
        }

        .feature-description {
          font-size: 15px;
          color: #64748b;
          line-height: 1.6;
          margin-bottom: 20px;
        }

        .feature-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 24px;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          color: #475569;
        }

        .feature-item svg {
          color: #10b981;
          flex-shrink: 0;
        }

        .learn-more-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          color: #3b82f6;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          padding: 8px 0;
          transition: all 0.2s;
        }

        .learn-more-btn:hover {
          gap: 12px;
        }

        /* Platform Comparison */
        .platform-comparison {
          padding: 80px 0;
          background: white;
        }

        .comparison-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .comparison-title {
          font-size: 36px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 16px;
        }

        .comparison-subtitle {
          font-size: 18px;
          color: #64748b;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .comparison-table {
          background: white;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
        }

        .comparison-header-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }

        .comparison-header-cell {
          padding: 20px 24px;
          font-size: 16px;
          font-weight: 700;
          color: #1e293b;
          text-align: center;
        }

        .comparison-header-cell.highlight {
          background: #eff6ff;
          color: #3b82f6;
        }

        .feature-column {
          text-align: left;
        }

        .comparison-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          border-bottom: 1px solid #e2e8f0;
          transition: all 0.2s;
        }

        .comparison-row:hover {
          background: #f8fafc;
        }

        .comparison-cell {
          padding: 20px 24px;
          font-size: 15px;
          color: #475569;
          display: flex;
          align-items: center;
        }

        .traditional-cell {
          color: #94a3b8;
          justify-content: center;
        }

        .highlight-cell {
          background: #eff6ff;
          color: #3b82f6;
          font-weight: 600;
          justify-content: center;
          gap: 8px;
        }

        /* CTA Section */
        .demo-cta {
          padding: 80px 0;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          text-align: center;
        }

        .cta-content {
          max-width: 600px;
          margin: 0 auto;
        }

        .cta-title {
          font-size: 36px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 16px;
        }

        .cta-text {
          font-size: 18px;
          color: #64748b;
          line-height: 1.6;
          margin-bottom: 32px;
        }

        .cta-buttons {
          display: flex;
          gap: 16px;
          justify-content: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .cta-btn {
          padding: 16px 32px;
          font-size: 16px;
          font-weight: 600;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .cta-btn.primary {
          background: linear-gradient(135deg, #3b82f6 0%, #0f6eea 100%);
          color: white;
        }

        .cta-btn.primary:hover {
          transform: translateY(-2px);
          color: #3b82f6;
          border: 2px solid #3b82f6;
          box-shadow: 0 12px 32px rgba(59, 130, 246, 0.3);
        }

        .cta-btn.secondary {
          background: white;
          color: #3b82f6;
          border: 2px solid #3b82f6;
        }

        .cta-btn.secondary:hover {
          background: #f8fafc;
          transform: translateY(-2px);
        }

        .cta-features {
          display: flex;
          justify-content: center;
          gap: 24px;
          flex-wrap: wrap;
          font-size: 14px;
          color: #64748b;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .demo-title {
            font-size: 32px;
          }

          .features-title,
          .comparison-title,
          .cta-title {
            font-size: 28px;
          }

          .video-chapters {
            grid-template-columns: repeat(2, 1fr);
          }

          .comparison-header-row,
          .comparison-row {
            grid-template-columns: 1fr;
          }

          .cta-buttons {
            flex-direction: column;
            align-items: center;
          }

          .cta-btn {
            width: 100%;
            max-width: 300px;
          }

          .video-controls-overlay {
            opacity: 1;
            padding: 15px 15px 8px;
          }
        }

        @media (max-width: 480px) {
          .demo-title {
            font-size: 28px;
          }

          .demo-subtitle {
            font-size: 16px;
          }

          .video-chapters {
            grid-template-columns: 1fr;
          }

          .cta-features {
            flex-direction: column;
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default DemoVideoPage;