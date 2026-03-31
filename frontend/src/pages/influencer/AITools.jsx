// src/pages/influencer/AITools.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Brain,
  Zap,
  FileText,
  Hash,
  Calculator,
  Mic,
  TrendingUp,
  Users,
  Calendar,
  Search,
  Sun,
  Moon,
  ArrowRight,
  Filter,
  Rocket,
  Activity,
  Image,
  Clock,
  Award
} from "lucide-react";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const AITools = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterValue, setFilterValue] = useState("All");
  const [hoveredTool, setHoveredTool] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Real-time usage stats
  const [usageStats, setUsageStats] = useState({
    contentGenerator: { today: 0, total: 0, remaining: 0, limit: 10 },
    hashtagGenerator: { today: 0, total: 0, remaining: 0, limit: 10 },
    imageGenerator: { today: 0, total: 0, remaining: 0, limit: 10 },
    totalToday: 0,
    totalAllTime: 0,
    timeSaved: 0,
    planName: "Free Trial",
    planTier: "trial",
    trialDaysLeft: 15
  });

  // Get auth header
  const getAuthHeader = () => {
    const token = localStorage.getItem('access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch all usage statistics
  const fetchAllUsageStats = async () => {
    setLoading(true);
    try {
      // Parallel API calls for all tools
      const [contentStats, hashtagStats, imageStats] = await Promise.allSettled([
        axios.get(`${API_BASE_URL}/api/content/stats`, { headers: getAuthHeader() }).catch(() => null),
        axios.get(`${API_BASE_URL}/api/hashtag/usage`, { headers: getAuthHeader() }).catch(() => null),
        axios.get(`${API_BASE_URL}/api/images/usage`, { headers: getAuthHeader() }).catch(() => null)
      ]);

      // Get user info for plan details
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const subscription = userData.subscription || { type: 'trial', plan_name: 'Free Trial' };

      // Process Content Generator stats
      const contentData = contentStats.value?.data?.stats || {};
      
      // Process Hashtag Generator stats
      const hashtagData = hashtagStats.value?.data || {};
      
      // Process Image Generator stats
      const imageData = imageStats.value?.data || {};

      // Calculate totals
      const contentToday = contentData.today_usage || 0;
      const hashtagToday = hashtagData.requests_used || 0;
      const imageToday = imageData.usage?.today_used || 0;
      
      const totalToday = contentToday + hashtagToday + imageToday;
      
      const contentTotal = contentData.total_generations || 0;
      const hashtagTotal = hashtagData.total_requests || 0;
      const imageTotal = imageData.usage?.total_used || 0;
      
      const totalAllTime = contentTotal + hashtagTotal + imageTotal;

      // Calculate time saved (average 5 minutes per generation)
      const TIME_PER_GENERATION = 5; // minutes
      const timeSavedMinutes = totalAllTime * TIME_PER_GENERATION;
      const timeSavedHours = Math.round(timeSavedMinutes / 60 * 10) / 10;

      // Determine plan tier
      const planTier = subscription.type || 'trial';
      const planName = subscription.plan_name || 'Free Trial';
      
      // Calculate trial days left
      let trialDaysLeft = 15;
      if (subscription.trial_remaining_days !== undefined) {
        trialDaysLeft = subscription.trial_remaining_days;
      } else if (subscription.remaining_days !== undefined) {
        trialDaysLeft = subscription.remaining_days;
      }

      setUsageStats({
        contentGenerator: {
          today: contentToday,
          total: contentTotal,
          remaining: contentData.remaining_today || 0,
          limit: contentData.daily_limit || 10
        },
        hashtagGenerator: {
          today: hashtagToday,
          total: hashtagTotal,
          remaining: hashtagData.remaining_requests || 0,
          limit: hashtagData.daily_limit || 10
        },
        imageGenerator: {
          today: imageToday,
          total: imageTotal,
          remaining: imageData.remaining?.daily || 0,
          limit: imageData.limits?.max_image_generations_per_day || 10
        },
        totalToday,
        totalAllTime,
        timeSaved: timeSavedHours,
        planName,
        planTier,
        trialDaysLeft
      });

    } catch (error) {
      console.error("Error fetching usage stats:", error);
      // Fallback to localStorage if API fails
      loadFallbackStats();
    } finally {
      setLoading(false);
    }
  };

  // Load fallback stats from localStorage
  const loadFallbackStats = () => {
    try {
      // Try to get saved stats from localStorage
      const contentHistory = localStorage.getItem("contentGenerationHistory");
      const contentCount = contentHistory ? JSON.parse(contentHistory).length : 0;
      
      const hashtagHistory = localStorage.getItem("hashtagGenerationHistory");
      const hashtagCount = hashtagHistory ? JSON.parse(hashtagHistory).length : 0;
      
      const imageHistory = localStorage.getItem("imageGenerationHistory");
      const imageCount = imageHistory ? JSON.parse(imageHistory).length : 0;

      const totalAllTime = contentCount + hashtagCount + imageCount;
      const timeSavedHours = Math.round(totalAllTime * 5 / 60 * 10) / 10;

      setUsageStats(prev => ({
        ...prev,
        contentGenerator: { ...prev.contentGenerator, total: contentCount },
        hashtagGenerator: { ...prev.hashtagGenerator, total: hashtagCount },
        imageGenerator: { ...prev.imageGenerator, total: imageCount },
        totalAllTime,
        timeSaved: timeSavedHours
      }));
    } catch (error) {
      console.error("Error loading fallback stats:", error);
    }
  };

  // Fetch stats on mount and set up refresh interval
  useEffect(() => {
    fetchAllUsageStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchAllUsageStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // AI Tools data
  const aiTools = [
    {
      id: "content-creator",
      title: "AI Content Creator",
      icon: Brain,
      description: "Generate engaging content ideas and drafts with AI assistance",
      path: "/influencer/aitools/aicontentcreator",
      status: "Available",
      statusColor: "#3b82f6",
      usageToday: usageStats.contentGenerator.today,
      usageTotal: usageStats.contentGenerator.total,
      usageRemaining: usageStats.contentGenerator.remaining,
      usageLimit: usageStats.contentGenerator.limit
    },
    {
      id: "smart-caption",
      title: "Smart Caption & Hashtag",
      icon: Hash,
      description: "Generate catchy captions and relevant hashtags for your content",
      path: "/influencer/aitools/aihashtag",
      status: "Available",
      statusColor: "#8b5cf6",
      usageToday: usageStats.hashtagGenerator.today,
      usageTotal: usageStats.hashtagGenerator.total,
      usageRemaining: usageStats.hashtagGenerator.remaining,
      usageLimit: usageStats.hashtagGenerator.limit
    },
    {
      id: "image-generator",
      title: "AI Image Generator",
      icon: Image,
      description: "Transform your ideas into stunning visuals with AI",
      path: "/influencer/aitools/imagegenerate",
      status: "Available",
      statusColor: "#10b981",
      usageToday: usageStats.imageGenerator.today,
      usageTotal: usageStats.imageGenerator.total,
      usageRemaining: usageStats.imageGenerator.remaining,
      usageLimit: usageStats.imageGenerator.limit
    },
    {
      id: "fast-post",
      title: "Fast Post",
      icon: Zap,
      description: "Quickly create and schedule social media posts",
      path: "/influencer/aitools/fastpost",
      status: "Available",
      statusColor: "#10b981",
      usageToday: 0,
      usageTotal: 0,
      usageRemaining: 0,
      usageLimit: 0
    },
    {
      id: "ai-calculator",
      title: "AI Calculator",
      icon: Calculator,
      description: "Calculate engagement rates, ROI, and other important metrics",
      path: "/influencer/aitools/aicalculator",
      status: "Available",
      statusColor: "#f97316",
      usageToday: 0,
      usageTotal: 0,
      usageRemaining: 0,
      usageLimit: 0
    },
    {
      id: "voice-to-text",
      title: "VoiceToText AI",
      icon: Mic,
      description: "Convert your voice notes to text content instantly",
      path: "/influencer/aitools/voicetotextai",
      status: "Available",
      statusColor: "#ec4899",
      usageToday: 0,
      usageTotal: 0,
      usageRemaining: 0,
      usageLimit: 0
    },
    {
      id: "trend-analyzer",
      title: "Trend Analyzer",
      icon: TrendingUp,
      description: "Discover trending topics in your niche",
      path: "/influencer/aitools/trendanalyzer",
      status: "Coming Soon",
      statusColor: "#f59e0b"
    },
    {
      id: "audience-insights",
      title: "Audience Insights",
      icon: Users,
      description: "Get detailed analytics about your audience demographics",
      path: "/influencer/aitools/audienceinsights",
      status: "Coming Soon",
      statusColor: "#06b6d4"
    },
    {
      id: "content-scheduler",
      title: "Content Scheduler",
      icon: Calendar,
      description: "Plan and schedule your content for optimal engagement",
      path: "/influencer/aitools/contentscheduler",
      status: "Coming Soon",
      statusColor: "#ef4444"
    }
  ];

  // Calculate overall usage percentage
  const getOverallUsagePercentage = () => {
    const totalUsed = usageStats.totalToday;
    const totalLimit = usageStats.contentGenerator.limit + 
                      usageStats.hashtagGenerator.limit + 
                      usageStats.imageGenerator.limit;
    if (totalLimit === 0) return 0;
    return Math.round((totalUsed / totalLimit) * 100);
  };

  // Get color based on usage percentage
  const getUsageColor = (used, limit) => {
    if (limit === 0 || limit === -1) return "#3b82f6";
    const percentage = (used / limit) * 100;
    if (percentage >= 90) return "#ef4444";
    if (percentage >= 70) return "#f59e0b";
    return "#3b82f6";
  };

  const filteredTools = aiTools.filter(
    (tool) =>
      (tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (filterValue === "All" || tool.status === filterValue)
  );

  return (
    <div className={`tdb-wrapper ${darkMode ? "tdb-dark" : ""}`}>
      <div className="tdb-container">
        {/* Header Section */}
        <header className="tdb-header">
          <div className="tdb-header-left">
            <div className="tdb-title-wrapper">
              <Brain className="tdb-title-icon" size={28} />
              <h1 className="tdb-title">AI Tools Dashboard</h1>
            </div>
            <p className="tdb-subtitle">Supercharge your content creation with our AI-powered tools</p>
          </div>

          <div className="tdb-header-actions">
            <div className="tdb-search-box">
              <Search className="tdb-search-icon" size={18} />
              <input
                type="text"
                placeholder="Search AI tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="tdb-search-input"
              />
            </div>
            <button 
              className="tdb-toggle-dark" 
              onClick={() => setDarkMode(!darkMode)}
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        {/* Plan Banner */}
        <div className="tdb-plan-banner">
          <div className="tdb-plan-info">
            <Award className="tdb-plan-icon" size={24} />
            <div>
              <span className="tdb-plan-name">{usageStats.planName}</span>
              {usageStats.planTier === 'trial' && usageStats.trialDaysLeft > 0 && (
                <span className="tdb-plan-days">
                  {usageStats.trialDaysLeft} days remaining in trial
                </span>
              )}
              {usageStats.planTier === 'trial' && usageStats.trialDaysLeft <= 0 && (
                <span className="tdb-plan-expired">Trial expired - Upgrade required</span>
              )}
            </div>
          </div>
          <Link to="/influencer/subscription" className="tdb-upgrade-btn">
            <Rocket size={18} />
            {usageStats.planTier === 'trial' ? 'Upgrade Plan' : 'Manage Plan'}
          </Link>
        </div>

        {/* Stats Overview - REAL TIME CALCULATIONS */}
        <section className="tdb-stats-section">
          <div className="tdb-stats-grid">
            <div className="tdb-stat-card">
              <div className="tdb-stat-icon tdb-stat-blue">
                <Brain size={24} />
              </div>
              <div className="tdb-stat-content">
                <h3 className="tdb-stat-label">AI Tools Used Today</h3>
                {loading ? (
                  <div className="tdb-stat-skeleton"></div>
                ) : (
                  <>
                    <p className="tdb-stat-number">{usageStats.totalToday}</p>
                    <div className="tdb-stat-progress">
                      <div 
                        className="tdb-stat-progress-bar"
                        style={{ 
                          width: `${getOverallUsagePercentage()}%`,
                          backgroundColor: getUsageColor(usageStats.totalToday, 
                            usageStats.contentGenerator.limit + usageStats.hashtagGenerator.limit + usageStats.imageGenerator.limit)
                        }}
                      />
                    </div>
                    <span className="tdb-stat-sub">
                      {getOverallUsagePercentage()}% of daily limit
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="tdb-stat-card">
              <div className="tdb-stat-icon tdb-stat-green">
                <Clock size={24} />
              </div>
              <div className="tdb-stat-content">
                <h3 className="tdb-stat-label">Time Saved</h3>
                {loading ? (
                  <div className="tdb-stat-skeleton"></div>
                ) : (
                  <>
                    <p className="tdb-stat-number">{usageStats.timeSaved}h</p>
                    <span className="tdb-stat-sub">
                      ~{Math.round(usageStats.timeSaved * 60)} minutes saved
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="tdb-stat-card">
              <div className="tdb-stat-icon tdb-stat-purple">
                <FileText size={24} />
              </div>
              <div className="tdb-stat-content">
                <h3 className="tdb-stat-label">Content Generated</h3>
                {loading ? (
                  <div className="tdb-stat-skeleton"></div>
                ) : (
                  <>
                    <p className="tdb-stat-number">{usageStats.totalAllTime}</p>
                    <span className="tdb-stat-sub">
                      {usageStats.totalAllTime > 0 
                        ? `+${Math.round(usageStats.totalAllTime * 0.23)}% efficiency` 
                        : 'Start generating today'}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Tool Usage Overview */}
        <section className="tdb-usage-overview">
          <div className="tdb-section-header">
            <h2 className="tdb-section-title">Today's Usage Overview</h2>
            <div className="tdb-refresh-info">
              <span>Auto-updates every 30s</span>
            </div>
          </div>
          <div className="tdb-usage-grid">
            <div className="tdb-usage-item">
              <div className="tdb-usage-header">
                <Brain size={18} color="#3b82f6" />
                <span>Content Generator</span>
              </div>
              <div className="tdb-usage-stats">
                <span className="tdb-usage-count">
                  {usageStats.contentGenerator.today} / {usageStats.contentGenerator.limit}
                </span>
                <span className="tdb-usage-percent">
                  {Math.round((usageStats.contentGenerator.today / usageStats.contentGenerator.limit) * 100)}%
                </span>
              </div>
              <div className="tdb-usage-bar">
                <div 
                  className="tdb-usage-fill"
                  style={{ 
                    width: `${Math.min((usageStats.contentGenerator.today / usageStats.contentGenerator.limit) * 100, 100)}%`,
                    backgroundColor: getUsageColor(usageStats.contentGenerator.today, usageStats.contentGenerator.limit)
                  }}
                />
              </div>
            </div>

            <div className="tdb-usage-item">
              <div className="tdb-usage-header">
                <Hash size={18} color="#8b5cf6" />
                <span>Hashtag Generator</span>
              </div>
              <div className="tdb-usage-stats">
                <span className="tdb-usage-count">
                  {usageStats.hashtagGenerator.today} / {usageStats.hashtagGenerator.limit}
                </span>
                <span className="tdb-usage-percent">
                  {Math.round((usageStats.hashtagGenerator.today / usageStats.hashtagGenerator.limit) * 100)}%
                </span>
              </div>
              <div className="tdb-usage-bar">
                <div 
                  className="tdb-usage-fill"
                  style={{ 
                    width: `${Math.min((usageStats.hashtagGenerator.today / usageStats.hashtagGenerator.limit) * 100, 100)}%`,
                    backgroundColor: getUsageColor(usageStats.hashtagGenerator.today, usageStats.hashtagGenerator.limit)
                  }}
                />
              </div>
            </div>

            <div className="tdb-usage-item">
              <div className="tdb-usage-header">
                <Image size={18} color="#10b981" />
                <span>Image Generator</span>
              </div>
              <div className="tdb-usage-stats">
                <span className="tdb-usage-count">
                  {usageStats.imageGenerator.today} / {usageStats.imageGenerator.limit}
                </span>
                <span className="tdb-usage-percent">
                  {Math.round((usageStats.imageGenerator.today / usageStats.imageGenerator.limit) * 100)}%
                </span>
              </div>
              <div className="tdb-usage-bar">
                <div 
                  className="tdb-usage-fill"
                  style={{ 
                    width: `${Math.min((usageStats.imageGenerator.today / usageStats.imageGenerator.limit) * 100, 100)}%`,
                    backgroundColor: getUsageColor(usageStats.imageGenerator.today, usageStats.imageGenerator.limit)
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* AI Tools Section with Usage Badges */}
        <section className="tdb-tools-section">
          <div className="tdb-section-header">
            <h2 className="tdb-section-title">All AI Tools</h2>
            <div className="tdb-filter-box">
              <Filter size={16} />
              <span className="tdb-filter-label">Filter by:</span>
              <select 
                className="tdb-filter-select"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
              >
                <option>All</option>
                <option>Available</option>
                <option>Coming Soon</option>
              </select>
            </div>
          </div>

          <div className="tdb-tools-grid">
            {filteredTools.map((tool) => {
              const IconComponent = tool.icon;
              const hasUsage = tool.usageToday !== undefined;
              
              return (
                <div 
                  key={tool.id} 
                  className={`tdb-tool-card ${tool.status === "Coming Soon" ? "coming-soon" : ""}`}
                  onMouseEnter={() => setHoveredTool(tool.id)}
                  onMouseLeave={() => setHoveredTool(null)}
                >
                  <div 
                    className="tdb-status-badge" 
                    style={{ backgroundColor: tool.statusColor }}
                  >
                    {tool.status}
                  </div>
                  
                  {hasUsage && tool.usageToday > 0 && (
                    <div className="tdb-tool-usage-badge">
                      <span className="tdb-tool-usage-count">
                        {tool.usageToday} used today
                      </span>
                    </div>
                  )}
                  
                  <div className="tdb-tool-content">
                    <div 
                      className="tdb-tool-icon"
                      style={{ backgroundColor: `${tool.statusColor}15` }}
                    >
                      <IconComponent size={28} style={{ color: tool.statusColor }} />
                    </div>
                    <h3 className="tdb-tool-title">{tool.title}</h3>
                    <p className="tdb-tool-description">{tool.description}</p>
                    
                    {hasUsage && tool.usageLimit > 0 && (
                      <div className="tdb-tool-usage">
                        <div className="tdb-tool-usage-header">
                          <span>Daily usage</span>
                          <span style={{ 
                            color: getUsageColor(tool.usageToday, tool.usageLimit),
                            fontWeight: '600'
                          }}>
                            {tool.usageToday}/{tool.usageLimit}
                          </span>
                        </div>
                        <div className="tdb-tool-progress-bar">
                          <div 
                            className="tdb-tool-progress-fill"
                            style={{ 
                              width: `${Math.min((tool.usageToday / tool.usageLimit) * 100, 100)}%`,
                              backgroundColor: getUsageColor(tool.usageToday, tool.usageLimit)
                            }}
                          />
                        </div>
                        {tool.usageRemaining > 0 && (
                          <span className="tdb-tool-remaining">
                            {tool.usageRemaining} remaining
                          </span>
                        )}
                      </div>
                    )}
                    
                    {tool.status === "Available" ? (
                      <div className="tdb-explore-link">
                        <Link to={tool.path} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>Use Tool</span>
                          <ArrowRight size={16} />
                        </Link>
                      </div>
                    ) : (
                      <div className="tdb-explore-link" style={{ color: '#94a3b8' }}>
                        <span>Coming Soon</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="tdb-cta-section">
          <div className="tdb-cta-box">
            <div className="tdb-cta-content">
              <h2 className="tdb-cta-title">
                {usageStats.planTier === 'trial' && usageStats.trialDaysLeft <= 0
                  ? 'Your free trial has ended'
                  : 'Need a custom AI tool?'}
              </h2>
              <p className="tdb-cta-text">
                {usageStats.planTier === 'trial' && usageStats.trialDaysLeft <= 0
                  ? 'Upgrade your plan to continue using AI tools and unlock more features'
                  : 'Request custom AI solutions tailored to your specific needs'}
              </p>
            </div>
            <Link to="/influencer/subscription" className="tdb-cta-button">
              {usageStats.planTier === 'trial' && usageStats.trialDaysLeft <= 0
                ? 'Upgrade Now'
                : 'Request Custom AI Tool'}
            </Link>
          </div>
        </section>

        {/* Quick Actions Footer */}
        <section className="tdb-quick-actions">
          <div className="tdb-quick-actions-grid">
            {[
              {
                title: "Create Content",
                description: "Generate new AI content",
                icon: Brain,
                color: "#3b82f6",
                path: "/influencer/aitools/aicontentcreator"
              },
              {
                title: "Generate Images",
                description: `${usageStats.imageGenerator.remaining} generations left`,
                icon: Image,
                color: "#10b981",
                path: "/influencer/aitools/imagegenerate"
              },
              {
                title: "Hashtags",
                description: `${usageStats.hashtagGenerator.remaining} requests remaining`,
                icon: Hash,
                color: "#8b5cf6",
                path: "/influencer/aitools/aihashtag"
              },
              {
                title: "View Analytics",
                description: "Check your performance",
                icon: Activity,
                color: "#f59e0b",
                path: "/influencer/analytics"
              }
            ].map((action, index) => {
              const IconComponent = action.icon;
              return (
                <Link to={action.path} key={index} style={{ textDecoration: 'none' }}>
                  <div className="tdb-quick-action-card">
                    <div 
                      className="tdb-quick-action-icon"
                      style={{ backgroundColor: action.color }}
                    >
                      <IconComponent size={20} color="white" />
                    </div>
                    <div className="tdb-quick-action-content">
                      <h4 className="tdb-quick-action-title">{action.title}</h4>
                      <p className="tdb-quick-action-desc">{action.description}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>

      <style>{`
        /* Add these new styles to your existing CSS */
        
        /* ==========================================================================
   AI Tools Dashboard - Professional CSS
   Author: Your Company
   Version: 1.0.0
   ========================================================================== */

/* --------------------------------------------------------------------------
   CSS Variables & Theme Configuration
   -------------------------------------------------------------------------- */

:root {
  /* Color System - Light Theme */
  --tdb-color-primary: #3b82f6;
  --tdb-color-primary-dark: #2563eb;
  --tdb-color-primary-light: #60a5fa;
  --tdb-color-primary-bg: rgba(59, 130, 246, 0.1);
  
  --tdb-color-secondary: #2563eb;
  --tdb-color-secondary-dark: #2564ebd7;
  --tdb-color-secondary-light: #5889f2;
  --tdb-color-secondary-bg: rgba(139, 92, 246, 0.1);
  
  --tdb-color-success: #10b981;
  --tdb-color-success-dark: #059669;
  --tdb-color-success-light: #34d399;
  --tdb-color-success-bg: rgba(16, 185, 129, 0.1);
  
  --tdb-color-warning: #f59e0b;
  --tdb-color-warning-dark: #d97706;
  --tdb-color-warning-light: #fbbf24;
  --tdb-color-warning-bg: rgba(245, 158, 11, 0.1);
  
  --tdb-color-danger: #ef4444;
  --tdb-color-danger-dark: #dc2626;
  --tdb-color-danger-light: #f87171;
  --tdb-color-danger-bg: rgba(239, 68, 68, 0.1);
  
  --tdb-color-purple: #2563eb;
  --tdb-color-pink: #ec4899;
  --tdb-color-indigo: #2563eb;
  --tdb-color-cyan: #06b6d4;
  
  /* Neutral Colors - Light Theme */
  --tdb-bg-primary: #ffffff;
  --tdb-bg-secondary: #f8fafc;
  --tdb-bg-tertiary: #f1f5f9;
  --tdb-bg-elevated: #ffffff;
  
  --tdb-border-light: #e2e8f0;
  --tdb-border-medium: #cbd5e1;
  --tdb-border-strong: #94a3b8;
  
  --tdb-text-primary: #0f172a;
  --tdb-text-secondary: #334155;
  --tdb-text-tertiary: #64748b;
  --tdb-text-disabled: #94a3b8;
  --tdb-text-inverse: #ffffff;
  
  /* Shadows */
  --tdb-shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --tdb-shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --tdb-shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  --tdb-shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
  --tdb-shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  
  /* Spacing */
  --tdb-space-xs: 0.25rem;  /* 4px */
  --tdb-space-sm: 0.5rem;   /* 8px */
  --tdb-space-md: 1rem;     /* 16px */
  --tdb-space-lg: 1.5rem;   /* 24px */
  --tdb-space-xl: 2rem;     /* 32px */
  --tdb-space-2xl: 2.5rem;  /* 40px */
  --tdb-space-3xl: 3rem;    /* 48px */
  --tdb-space-4xl: 4rem;    /* 64px */
  
  /* Typography */
  --tdb-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --tdb-font-size-xs: 0.75rem;    /* 12px */
  --tdb-font-size-sm: 0.875rem;   /* 14px */
  --tdb-font-size-md: 1rem;       /* 16px */
  --tdb-font-size-lg: 1.125rem;   /* 18px */
  --tdb-font-size-xl: 1.25rem;    /* 20px */
  --tdb-font-size-2xl: 1.5rem;    /* 24px */
  --tdb-font-size-3xl: 1.875rem;  /* 30px */
  --tdb-font-size-4xl: 2.25rem;   /* 36px */
  
  /* Border Radius */
  --tdb-radius-sm: 0.375rem;  /* 6px */
  --tdb-radius-md: 0.5rem;    /* 8px */
  --tdb-radius-lg: 0.75rem;   /* 12px */
  --tdb-radius-xl: 1rem;      /* 16px */
  --tdb-radius-2xl: 1.5rem;   /* 24px */
  --tdb-radius-full: 9999px;
  
  /* Transitions */
  --tdb-transition-fast: 150ms;
  --tdb-transition-base: 200ms;
  --tdb-transition-slow: 300ms;
  --tdb-transition-timing: cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Z-index */
  --tdb-z-dropdown: 1000;
  --tdb-z-sticky: 1020;
  --tdb-z-fixed: 1030;
  --tdb-z-modal: 1040;
  --tdb-z-popover: 1050;
  --tdb-z-tooltip: 1060;
}

/* Dark Theme Variables */
.tdb-dark {
  --tdb-bg-primary: #0f172a;
  --tdb-bg-secondary: #1e293b;
  --tdb-bg-tertiary: #334155;
  --tdb-bg-elevated: #1e293b;
  
  --tdb-border-light: #334155;
  --tdb-border-medium: #475569;
  --tdb-border-strong: #64748b;
  
  --tdb-text-primary: #f8fafc;
  --tdb-text-secondary: #e2e8f0;
  --tdb-text-tertiary: #cbd5e1;
  --tdb-text-disabled: #94a3b8;
  --tdb-text-inverse: #0f172a;
}

/* --------------------------------------------------------------------------
   Base Styles & Reset
   -------------------------------------------------------------------------- */

*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.tdb-wrapper {
  min-height: 100vh;
  background: var(--tdb-bg-secondary);
  font-family: var(--tdb-font-family);
  color: var(--tdb-text-primary);
  transition: background-color var(--tdb-transition-base) var(--tdb-transition-timing),
              color var(--tdb-transition-base) var(--tdb-transition-timing);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.tdb-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: var(--tdb-space-3xl) var(--tdb-space-2xl);
}

/* --------------------------------------------------------------------------
   Typography
   -------------------------------------------------------------------------- */

.tdb-title {
  font-size: var(--tdb-font-size-3xl);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--tdb-text-primary);
  line-height: 1.2;
}

.tdb-subtitle {
  font-size: var(--tdb-font-size-md);
  color: var(--tdb-text-tertiary);
  line-height: 1.6;
}

.tdb-section-title {
  font-size: var(--tdb-font-size-xl);
  font-weight: 700;
  color: var(--tdb-text-primary);
  margin-bottom: var(--tdb-space-lg);
  letter-spacing: -0.01em;
}

/* --------------------------------------------------------------------------
   Header Section
   -------------------------------------------------------------------------- */

.tdb-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--tdb-space-2xl);
  gap: var(--tdb-space-xl);
}

.tdb-header-left {
  flex: 1;
}

.tdb-title-wrapper {
  display: flex;
  align-items: center;
  gap: var(--tdb-space-sm);
  margin-bottom: var(--tdb-space-xs);
}

.tdb-title-icon {
  color: var(--tdb-color-primary);
  transition: transform var(--tdb-transition-base) var(--tdb-transition-timing);
}

.tdb-title-wrapper:hover .tdb-title-icon {
  transform: rotate(10deg);
}

.tdb-header-actions {
  display: flex;
  align-items: center;
  gap: var(--tdb-space-sm);
}

/* Search Box */
.tdb-search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.tdb-search-icon {
  position: absolute;
  left: var(--tdb-space-md);
  color: var(--tdb-text-tertiary);
  pointer-events: none;
}

.tdb-search-input {
  padding: var(--tdb-space-sm) var(--tdb-space-md) var(--tdb-space-sm) calc(var(--tdb-space-md) * 2 + 18px);
  border: 1px solid var(--tdb-border-light);
  border-radius: var(--tdb-radius-lg);
  font-size: var(--tdb-font-size-sm);
  width: 300px;
  background: var(--tdb-bg-primary);
  color: var(--tdb-text-primary);
  transition: all var(--tdb-transition-base) var(--tdb-transition-timing);
}

.tdb-search-input:focus {
  outline: none;
  border-color: var(--tdb-color-primary);
  box-shadow: 0 0 0 3px var(--tdb-color-primary-bg);
}

.tdb-search-input::placeholder {
  color: var(--tdb-text-disabled);
}

/* Theme Toggle */
.tdb-toggle-dark {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--tdb-bg-primary);
  border: 1px solid var(--tdb-border-light);
  border-radius: var(--tdb-radius-lg);
  cursor: pointer;
  transition: all var(--tdb-transition-base) var(--tdb-transition-timing);
  color: var(--tdb-text-tertiary);
}

.tdb-toggle-dark:hover {
  border-color: var(--tdb-color-primary);
  color: var(--tdb-color-primary);
  transform: translateY(-2px);
  box-shadow: var(--tdb-shadow-md);
}

/* --------------------------------------------------------------------------
   Plan Banner
   -------------------------------------------------------------------------- */

.tdb-plan-banner {
  background: linear-gradient(135deg, var(--tdb-color-primary) 0%, var(--tdb-color-secondary) 100%);
  border-radius: var(--tdb-radius-xl);
  padding: var(--tdb-space-md) var(--tdb-space-xl);
  margin-bottom: var(--tdb-space-2xl);
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--tdb-text-inverse);
  box-shadow: var(--tdb-shadow-lg);
  position: relative;
  overflow: hidden;
}

.tdb-plan-banner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
  pointer-events: none;
}

.tdb-plan-info {
  display: flex;
  align-items: center;
  gap: var(--tdb-space-md);
  position: relative;
  z-index: 1;
}

.tdb-plan-icon {
  width: 40px;
  height: 40px;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}

.tdb-plan-name {
  font-size: var(--tdb-font-size-lg);
  font-weight: 700;
  margin-right: var(--tdb-space-sm);
}

.tdb-plan-days {
  font-size: var(--tdb-font-size-xs);
  opacity: 0.9;
  background: rgba(255, 255, 255, 0.2);
  padding: var(--tdb-space-xs) var(--tdb-space-sm);
  border-radius: var(--tdb-radius-full);
  font-weight: 600;
  backdrop-filter: blur(4px);
}

.tdb-plan-expired {
  font-size: var(--tdb-font-size-xs);
  background: var(--tdb-color-danger);
  padding: var(--tdb-space-xs) var(--tdb-space-sm);
  border-radius: var(--tdb-radius-full);
  font-weight: 600;
  animation: pulse 2s infinite;
}

.tdb-upgrade-btn {
  display: flex;
  align-items: center;
  gap: var(--tdb-space-sm);
  padding: var(--tdb-space-sm) var(--tdb-space-xl);
  background: var(--tdb-text-inverse);
  color: var(--tdb-color-primary);
  border-radius: var(--tdb-radius-lg);
  text-decoration: none;
  font-weight: 600;
  font-size: var(--tdb-font-size-sm);
  transition: all var(--tdb-transition-base) var(--tdb-transition-timing);
  position: relative;
  z-index: 1;
  border: none;
  cursor: pointer;
}

.tdb-upgrade-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--tdb-shadow-lg);
  background: var(--tdb-text-inverse);
  color: var(--tdb-color-primary-dark);
}

/* --------------------------------------------------------------------------
   Stats Cards
   -------------------------------------------------------------------------- */

.tdb-stats-section {
  margin-bottom: var(--tdb-space-2xl);
}

.tdb-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--tdb-space-xl);
}

.tdb-stat-card {
  background: var(--tdb-bg-primary);
  border: 1px solid var(--tdb-border-light);
  border-radius: var(--tdb-radius-xl);
  padding: var(--tdb-space-xl);
  display: flex;
  align-items: center;
  gap: var(--tdb-space-lg);
  transition: all var(--tdb-transition-base) var(--tdb-transition-timing);
  position: relative;
  overflow: hidden;
}

.tdb-stat-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--tdb-color-primary), var(--tdb-color-secondary));
  opacity: 0;
  transition: opacity var(--tdb-transition-base) var(--tdb-transition-timing);
}

.tdb-stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--tdb-shadow-lg);
  border-color: var(--tdb-border-medium);
}

.tdb-stat-card:hover::after {
  opacity: 1;
}

.tdb-stat-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--tdb-radius-lg);
  flex-shrink: 0;
  transition: all var(--tdb-transition-base) var(--tdb-transition-timing);
}

.tdb-stat-card:hover .tdb-stat-icon {
  transform: scale(1.1);
}

.tdb-stat-blue {
  background: var(--tdb-color-primary-bg);
  color: var(--tdb-color-primary);
}

.tdb-stat-green {
  background: var(--tdb-color-success-bg);
  color: var(--tdb-color-success);
}

.tdb-stat-purple {
  background: var(--tdb-color-secondary-bg);
  color: var(--tdb-color-secondary);
}

.tdb-stat-content {
  flex: 1;
}

.tdb-stat-label {
  font-size: var(--tdb-font-size-xs);
  color: var(--tdb-text-tertiary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--tdb-space-xs);
}

.tdb-stat-number {
  font-size: var(--tdb-font-size-3xl);
  font-weight: 700;
  color: var(--tdb-text-primary);
  line-height: 1;
  margin-bottom: var(--tdb-space-xs);
}

.tdb-stat-progress {
  width: 100%;
  height: 4px;
  background: var(--tdb-border-light);
  border-radius: var(--tdb-radius-full);
  margin: var(--tdb-space-xs) 0;
  overflow: hidden;
}

.tdb-stat-progress-bar {
  height: 100%;
  border-radius: var(--tdb-radius-full);
  transition: width var(--tdb-transition-slow) var(--tdb-transition-timing);
}

.tdb-stat-sub {
  font-size: var(--tdb-font-size-xs);
  color: var(--tdb-text-tertiary);
  display: block;
}

.tdb-stat-skeleton {
  height: 32px;
  background: linear-gradient(90deg, 
    var(--tdb-border-light) 25%, 
    var(--tdb-border-medium) 50%, 
    var(--tdb-border-light) 75%
  );
  background-size: 200% 100%;
  border-radius: var(--tdb-radius-sm);
  animation: skeleton-loading 1.5s infinite;
}

/* --------------------------------------------------------------------------
   Usage Overview Section
   -------------------------------------------------------------------------- */

.tdb-usage-overview {
  margin-bottom: var(--tdb-space-2xl);
  background: var(--tdb-bg-primary);
  border: 1px solid var(--tdb-border-light);
  border-radius: var(--tdb-radius-xl);
  padding: var(--tdb-space-xl);
  box-shadow: var(--tdb-shadow-sm);
}

.tdb-usage-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--tdb-space-xl);
  margin-top: var(--tdb-space-md);
}

.tdb-usage-item {
  padding: var(--tdb-space-lg);
  background: var(--tdb-bg-secondary);
  border-radius: var(--tdb-radius-lg);
  transition: all var(--tdb-transition-base) var(--tdb-transition-timing);
  border: 1px solid transparent;
}

.tdb-usage-item:hover {
  border-color: var(--tdb-color-primary);
  transform: translateY(-2px);
  box-shadow: var(--tdb-shadow-md);
}

.tdb-usage-header {
  display: flex;
  align-items: center;
  gap: var(--tdb-space-sm);
  margin-bottom: var(--tdb-space-md);
  font-weight: 600;
  color: var(--tdb-text-primary);
}

.tdb-usage-stats {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: var(--tdb-space-sm);
}

.tdb-usage-count {
  font-size: var(--tdb-font-size-lg);
  font-weight: 700;
  color: var(--tdb-text-primary);
}

.tdb-usage-percent {
  font-size: var(--tdb-font-size-xs);
  color: var(--tdb-text-tertiary);
  font-weight: 600;
}

.tdb-usage-bar {
  width: 100%;
  height: 6px;
  background: var(--tdb-border-light);
  border-radius: var(--tdb-radius-full);
  overflow: hidden;
}

.tdb-usage-fill {
  height: 100%;
  border-radius: var(--tdb-radius-full);
  transition: width var(--tdb-transition-slow) var(--tdb-transition-timing);
}

/* --------------------------------------------------------------------------
   Tools Grid Section
   -------------------------------------------------------------------------- */

.tdb-tools-section {
  margin-bottom: var(--tdb-space-2xl);
}

.tdb-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--tdb-space-xl);
  flex-wrap: wrap;
  gap: var(--tdb-space-md);
}

.tdb-filter-box {
  display: flex;
  align-items: center;
  gap: var(--tdb-space-sm);
  padding: var(--tdb-space-xs) var(--tdb-space-md);
  background: var(--tdb-bg-primary);
  border: 1px solid var(--tdb-border-light);
  border-radius: var(--tdb-radius-lg);
  transition: all var(--tdb-transition-base) var(--tdb-transition-timing);
}

.tdb-filter-box:hover {
  border-color: var(--tdb-color-primary);
  box-shadow: var(--tdb-shadow-sm);
}

.tdb-filter-label {
  font-size: var(--tdb-font-size-xs);
  color: var(--tdb-text-tertiary);
  font-weight: 500;
}

.tdb-filter-select {
  padding: var(--tdb-space-xs) var(--tdb-space-sm);
  border: none;
  background: transparent;
  font-size: var(--tdb-font-size-xs);
  font-weight: 600;
  color: var(--tdb-text-primary);
  cursor: pointer;
  outline: none;
}

.tdb-tools-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--tdb-space-xl);
}

.tdb-tool-card {
  position: relative;
  background: var(--tdb-bg-primary);
  border: 1px solid var(--tdb-border-light);
  border-radius: var(--tdb-radius-xl);
  padding: var(--tdb-space-xl);
  cursor: pointer;
  transition: all var(--tdb-transition-base) var(--tdb-transition-timing);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.tdb-tool-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--tdb-color-primary), var(--tdb-color-secondary));
  opacity: 0;
  transition: opacity var(--tdb-transition-base) var(--tdb-transition-timing);
}

.tdb-tool-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--tdb-shadow-xl);
  border-color: var(--tdb-color-primary);
}

.tdb-tool-card:hover::before {
  opacity: 1;
}

.tdb-tool-card.coming-soon {
  opacity: 0.85;
  cursor: not-allowed;
}

.tdb-tool-card.coming-soon:hover {
  transform: none;
  box-shadow: none;
  border-color: var(--tdb-border-light);
}

.tdb-tool-card.coming-soon:hover::before {
  opacity: 0;
}

.tdb-status-badge {
  position: absolute;
  top: var(--tdb-space-md);
  right: var(--tdb-space-md);
  padding: var(--tdb-space-xs) var(--tdb-space-sm);
  border-radius: var(--tdb-radius-full);
  font-size: var(--tdb-font-size-xs);
  font-weight: 700;
  color: var(--tdb-text-inverse);
  z-index: 2;
  box-shadow: var(--tdb-shadow-sm);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.tdb-tool-usage-badge {
  position: absolute;
  top: var(--tdb-space-md);
  left: var(--tdb-space-md);
  padding: var(--tdb-space-xs) var(--tdb-space-sm);
  background: var(--tdb-color-primary);
  color: var(--tdb-text-inverse);
  border-radius: var(--tdb-radius-full);
  font-size: var(--tdb-font-size-xs);
  font-weight: 600;
  z-index: 2;
  box-shadow: var(--tdb-shadow-sm);
  animation: fadeIn var(--tdb-transition-slow) var(--tdb-transition-timing);
}

.tdb-tool-content {
  display: flex;
  flex-direction: column;
  gap: var(--tdb-space-md);
  height: 100%;
}

.tdb-tool-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--tdb-radius-lg);
  transition: all var(--tdb-transition-base) var(--tdb-transition-timing);
}

.tdb-tool-card:hover .tdb-tool-icon {
  transform: scale(1.1) rotate(5deg);
}

.tdb-tool-title {
  font-size: var(--tdb-font-size-lg);
  font-weight: 700;
  color: var(--tdb-text-primary);
  margin: 0;
  line-height: 1.3;
}

.tdb-tool-description {
  font-size: var(--tdb-font-size-sm);
  color: var(--tdb-text-tertiary);
  line-height: 1.6;
  margin: 0;
  flex-grow: 1;
}

.tdb-tool-usage {
  margin: var(--tdb-space-sm) 0 0;
  padding-top: var(--tdb-space-sm);
  border-top: 1px solid var(--tdb-border-light);
}

.tdb-tool-usage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--tdb-font-size-xs);
  margin-bottom: var(--tdb-space-xs);
  color: var(--tdb-text-tertiary);
}

.tdb-tool-progress-bar {
  width: 100%;
  height: 4px;
  background: var(--tdb-border-light);
  border-radius: var(--tdb-radius-full);
  overflow: hidden;
}

.tdb-tool-progress-fill {
  height: 100%;
  border-radius: var(--tdb-radius-full);
  transition: width var(--tdb-transition-slow) var(--tdb-transition-timing);
}

.tdb-tool-remaining {
  display: block;
  margin-top: var(--tdb-space-xs);
  font-size: var(--tdb-font-size-xs);
  color: var(--tdb-color-success);
  font-weight: 600;
}

.tdb-explore-link {
  display: inline-flex;
  align-items: center;
  gap: var(--tdb-space-xs);
  font-size: var(--tdb-font-size-sm);
  font-weight: 600;
  color: var(--tdb-color-primary);
  margin-top: auto;
  padding-top: var(--tdb-space-sm);
  text-decoration: none;
  transition: all var(--tdb-transition-base) var(--tdb-transition-timing);
}

.tdb-explore-link:hover {
  gap: var(--tdb-space-sm);
  color: var(--tdb-color-primary-dark);
}

/* --------------------------------------------------------------------------
   CTA Section
   -------------------------------------------------------------------------- */

.tdb-cta-section {
  margin-bottom: var(--tdb-space-2xl);
}

.tdb-cta-box {
  background: linear-gradient(135deg, var(--tdb-color-secondary) 0%, var(--tdb-color-primary) 100%);
  border-radius: var(--tdb-radius-2xl);
  padding: var(--tdb-space-3xl);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--tdb-space-xl);
  position: relative;
  overflow: hidden;
  box-shadow: var(--tdb-shadow-xl);
}

.tdb-cta-box::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%);
  animation: rotate 20s linear infinite;
}

.tdb-cta-content {
  flex: 1;
  position: relative;
  z-index: 1;
}

.tdb-cta-title {
  font-size: var(--tdb-font-size-2xl);
  font-weight: 700;
  color: var(--tdb-text-inverse);
  margin-bottom: var(--tdb-space-xs);
  letter-spacing: -0.02em;
}

.tdb-cta-text {
  font-size: var(--tdb-font-size-md);
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
}

.tdb-cta-button {
  padding: var(--tdb-space-md) var(--tdb-space-2xl);
  background: var(--tdb-text-inverse);
  color: var(--tdb-color-primary);
  border: none;
  border-radius: var(--tdb-radius-lg);
  font-size: var(--tdb-font-size-md);
  font-weight: 700;
  cursor: pointer;
  transition: all var(--tdb-transition-base) var(--tdb-transition-timing);
  position: relative;
  z-index: 1;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  box-shadow: var(--tdb-shadow-lg);
}

.tdb-cta-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--tdb-shadow-xl);
  background: var(--tdb-text-inverse);
  color: var(--tdb-color-primary-dark);
}

/* --------------------------------------------------------------------------
   Quick Actions Section
   -------------------------------------------------------------------------- */

.tdb-quick-actions {
  margin-top: var(--tdb-space-3xl);
}

.tdb-quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--tdb-space-lg);
}

.tdb-quick-action-card {
  background: var(--tdb-bg-primary);
  border: 1px solid var(--tdb-border-light);
  border-radius: var(--tdb-radius-lg);
  padding: var(--tdb-space-lg);
  display: flex;
  align-items: center;
  gap: var(--tdb-space-md);
  transition: all var(--tdb-transition-base) var(--tdb-transition-timing);
  cursor: pointer;
  text-decoration: none;
  color: inherit;
}

.tdb-quick-action-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--tdb-shadow-lg);
  border-color: var(--tdb-color-primary);
}

.tdb-quick-action-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--tdb-radius-lg);
  flex-shrink: 0;
  transition: all var(--tdb-transition-base) var(--tdb-transition-timing);
}

.tdb-quick-action-card:hover .tdb-quick-action-icon {
  transform: scale(1.1);
}

.tdb-quick-action-content {
  flex: 1;
}

.tdb-quick-action-title {
  font-size: var(--tdb-font-size-sm);
  font-weight: 700;
  color: var(--tdb-text-primary);
  margin-bottom: var(--tdb-space-xs);
}

.tdb-quick-action-desc {
  font-size: var(--tdb-font-size-xs);
  color: var(--tdb-text-tertiary);
  line-height: 1.4;
}

/* --------------------------------------------------------------------------
   Refresh Info
   -------------------------------------------------------------------------- */

.tdb-refresh-info {
  font-size: var(--tdb-font-size-xs);
  color: var(--tdb-text-tertiary);
  display: flex;
  align-items: center;
  gap: var(--tdb-space-xs);
  padding: var(--tdb-space-xs) var(--tdb-space-sm);
  background: var(--tdb-bg-tertiary);
  border-radius: var(--tdb-radius-full);
}

.tdb-refresh-info::before {
  content: '';
  width: 8px;
  height: 8px;
  background: var(--tdb-color-success);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

/* --------------------------------------------------------------------------
   Animations
   -------------------------------------------------------------------------- */

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes skeleton-loading {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* --------------------------------------------------------------------------
   Responsive Design
   -------------------------------------------------------------------------- */

/* Desktop Large */
@media (max-width: 1440px) {
  .tdb-container {
    max-width: 1280px;
    padding: var(--tdb-space-2xl) var(--tdb-space-xl);
  }
}

/* Desktop */
@media (max-width: 1280px) {
  .tdb-container {
    max-width: 1024px;
  }
  
  .tdb-tools-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .tdb-quick-actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Tablet Landscape */
@media (max-width: 1024px) {
  .tdb-container {
    max-width: 768px;
    padding: var(--tdb-space-xl) var(--tdb-space-lg);
  }
  
  .tdb-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .tdb-header-actions {
    width: 100%;
  }
  
  .tdb-search-input {
    width: 100%;
  }
  
  .tdb-stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .tdb-usage-grid {
    grid-template-columns: 1fr;
  }
  
  .tdb-cta-box {
    flex-direction: column;
    text-align: center;
    padding: var(--tdb-space-2xl);
  }
}

/* Tablet Portrait */
@media (max-width: 768px) {
  .tdb-container {
    max-width: 640px;
    padding: var(--tdb-space-lg);
  }
  
  .tdb-title {
    font-size: var(--tdb-font-size-2xl);
  }
  
  .tdb-stats-grid {
    grid-template-columns: 1fr;
  }
  
  .tdb-tools-grid {
    grid-template-columns: 1fr;
  }
  
  .tdb-quick-actions-grid {
    grid-template-columns: 1fr;
  }
  
  .tdb-plan-banner {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--tdb-space-md);
  }
  
  .tdb-upgrade-btn {
    width: 100%;
    justify-content: center;
  }
  
  .tdb-section-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .tdb-filter-box {
    width: 100%;
  }
  
  .tdb-filter-select {
    flex: 1;
  }
}

/* Mobile Large */
@media (max-width: 640px) {
  .tdb-container {
    padding: var(--tdb-space-md);
  }
  
  .tdb-stat-card {
    padding: var(--tdb-space-lg);
  }
  
  .tdb-tool-card {
    padding: var(--tdb-space-lg);
  }
  
  .tdb-cta-box {
    padding: var(--tdb-space-xl);
  }
  
  .tdb-cta-title {
    font-size: var(--tdb-font-size-xl);
  }
  
  .tdb-cta-button {
    width: 100%;
    padding: var(--tdb-space-md) var(--tdb-space-lg);
  }
  
  .tdb-quick-action-card {
    padding: var(--tdb-space-md);
  }
}

/* Mobile Small */
@media (max-width: 480px) {
  .tdb-stat-icon {
    width: 48px;
    height: 48px;
  }
  
  .tdb-stat-number {
    font-size: var(--tdb-font-size-2xl);
  }
  
  .tdb-tool-icon {
    width: 56px;
    height: 56px;
  }
  
  .tdb-tool-title {
    font-size: var(--tdb-font-size-md);
  }
  
  .tdb-plan-info {
    flex-wrap: wrap;
  }
  
  .tdb-plan-name {
    width: 100%;
  }
}

/* --------------------------------------------------------------------------
   Print Styles
   -------------------------------------------------------------------------- */

@media print {
  .tdb-wrapper {
    background: white;
    color: black;
  }
  
  .tdb-header-actions,
  .tdb-toggle-dark,
  .tdb-upgrade-btn,
  .tdb-cta-button,
  .tdb-quick-actions {
    display: none !important;
  }
  
  .tdb-stat-card,
  .tdb-tool-card {
    break-inside: avoid;
    border: 1px solid #ddd;
    box-shadow: none;
  }
  
  .tdb-plan-banner {
    background: #f0f0f0;
    color: black;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}

/* --------------------------------------------------------------------------
   Accessibility
   -------------------------------------------------------------------------- */

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

.tdb-wrapper:focus-visible {
  outline: 2px solid var(--tdb-color-primary);
  outline-offset: 2px;
}

.tdb-search-input:focus-visible,
.tdb-filter-select:focus-visible,
.tdb-toggle-dark:focus-visible,
.tdb-upgrade-btn:focus-visible,
.tdb-cta-button:focus-visible {
  outline: 2px solid var(--tdb-color-primary);
  outline-offset: 2px;
}

/* --------------------------------------------------------------------------
   Utility Classes
   -------------------------------------------------------------------------- */

.tdb-text-center {
  text-align: center;
}

.tdb-mt-auto {
  margin-top: auto;
}

.tdb-w-100 {
  width: 100%;
}

.tdb-h-100 {
  height: 100%;
}

.tdb-d-none {
  display: none;
}

@media (max-width: 768px) {
  .tdb-d-none-mobile {
    display: none;
  }
}
      `}</style>
    </div>
  );
};

export default AITools;