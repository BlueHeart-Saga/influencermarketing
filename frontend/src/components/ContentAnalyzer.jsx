import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Hash, TrendingUp, Target,
  Instagram, Twitter, Linkedin, Facebook,
  Youtube, Globe, RefreshCw, Zap,
  Copy, CheckCircle, AlertCircle, MessageSquare,
  BarChart3, Users, Clock, Star,
  Loader2, AlertTriangle, Check
} from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { useAuth } from "../context/AuthContext";

export default function ContentAnalyzer() {
  const [platform, setPlatform] = useState("Instagram");
  const [content, setContent] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const [usageStats, setUsageStats] = useState(null);
  
  const { token } = useAuth();

  const socialPlatforms = [
    { name: "Instagram", icon: <Instagram size={20} />, color: "#E4405F" },
    { name: "Twitter (X)", icon: <Twitter size={20} />, color: "#000000" },
    { name: "LinkedIn", icon: <Linkedin size={20} />, color: "#0A66C2" },
    { name: "Facebook", icon: <Facebook size={20} />, color: "#1877F2" },
    { name: "TikTok", icon: <Globe size={20} />, color: "#000000" },
    { name: "YouTube", icon: <Youtube size={20} />, color: "#FF0000" }
  ];

  // Load subscription and usage info
  // Load subscription and usage info
useEffect(() => {
  const loadSubscriptionInfo = async () => {
    // Default values for all users first
    const defaultStats = {
      dailyLimit: 3,
      usedToday: 0,
      remainingToday: 3,
      planName: "Free Trial",
      isTrial: true,
      trialDaysLeft: 15,
      canAnalyze: true
    };

    if (!token) {
      // For unauthenticated users
      setUsageStats(defaultStats);
      return;
    }

    try {
      // Try to get content analysis limits
      const response = await axios.get(`${API_BASE_URL}/api/content/limits`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const data = response.data;
        
        // Calculate today's usage from the response
        const dailyLimit = data.limits?.max_generations_per_day || 
                          data.usage_stats?.max_analyses_per_day || 
                          10;
        const usedToday = data.usage_stats?.today_usage || 0;
        const remainingToday = data.usage_stats?.remaining_today || 
                              dailyLimit - usedToday;
        
        setUsageStats({
          dailyLimit: dailyLimit,
          usedToday: usedToday,
          remainingToday: Math.max(0, remainingToday),
          planName: data.plan || "Free Trial",
          isTrial: data.plan_type === "trial" || data.plan_key === "trial",
          trialDaysLeft: data.subscription_data?.trial_remaining_days || 15,
          canAnalyze: data.can_analyze || true
        });
      } else {
        // If API returns but not successful, use defaults
        setUsageStats(defaultStats);
      }
    } catch (err) {
      console.warn("Could not load subscription info:", err);
      
      // Try to get basic user info as fallback
      try {
        const userRes = await axios.get(`${API_BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const userData = userRes.data;
        
        // Extract subscription info from user data
        const subscription = userData.subscription || {};
        const planName = subscription.plan || 
                        userData.current_plan || 
                        "Free Trial";
        const isTrial = subscription.is_trial || 
                       userData.is_trial_active || 
                       planName.toLowerCase().includes('trial');
        
        setUsageStats({
          dailyLimit: 10,
          usedToday: 0,
          remainingToday: 10,
          planName: planName,
          isTrial: isTrial,
          trialDaysLeft: subscription.trial_remaining_days || 15,
          canAnalyze: true
        });
      } catch (userErr) {
        console.warn("Could not load user info:", userErr);
        // Set default values
        setUsageStats(defaultStats);
      }
    }
  };

  loadSubscriptionInfo();
}, [token]);

  const handleAnalyze = async () => {
  if (!content.trim()) {
    setError("Please enter some content to analyze");
    return;
  }

  // Check remaining usage if available
  if (usageStats && usageStats.remainingToday <= 0) {
    setError(`Daily limit reached! You've used ${usageStats.usedToday}/${usageStats.dailyLimit} analyses today. Please upgrade your plan or try again tomorrow.`);
    return;
  }

  setLoading(true);
  setError(null);
  setResult(null);
  setCopied(false);

  try {
    const prompt = `Analyze this social media content for ${platform}:

Content: """${content}"""

Please provide:
1. Improved/rewritten version for better engagement
2. 5-10 relevant hashtags
3. 3-5 performance optimization tips
4. Suggested posting time`;

    const response = await axios.post(
      `${API_BASE_URL}/api/content/generate`,
      { 
        prompt: prompt,
        mode: "analysis",
        model: "command-a-03-2025",
        max_tokens: 800
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      setResult(response.data.generated_text || "Analysis completed.");
      
      // Update usage stats locally
      if (usageStats) {
        setUsageStats(prev => ({
          ...prev,
          usedToday: prev.usedToday + 1,
          remainingToday: Math.max(0, prev.remainingToday - 1)
        }));
      }
    } else {
      setError(response.data.detail || "Failed to analyze content");
    }
  } catch (error) {
    console.error("Analysis error:", error);
    
    // Handle different error responses
    if (error.response) {
      const { status, data } = error.response;
      
      if (status === 403) {
        // Permission/limit error
        if (data.detail && typeof data.detail === 'object') {
          setError(`Limit reached: ${data.detail.message || "Daily analysis limit exceeded"}`);
        } else if (data.detail) {
          setError(`Access denied: ${data.detail}`);
        } else {
          setError("You've reached your daily analysis limit. Please upgrade your plan.");
        }
      } else if (status === 401) {
        setError("Please login to use this feature");
      } else if (status === 400) {
        setError(data.detail?.message || data.detail || "Invalid request");
      } else if (status === 404) {
        // If endpoint not found, try alternative
        await handleAnalyzeFallback();
      } else {
        setError(data.detail || "Failed to analyze content");
      }
    } else if (error.request) {
      setError("Network error. Please check your connection.");
    } else {
      setError("An unexpected error occurred");
    }
  } finally {
    setLoading(false);
  }
};

const handleAnalyzeFallback = async () => {
  try {
    // Try a different endpoint or method
    const response = await axios.post(
      `${API_BASE_URL}/api/ai/generate`,
      { 
        prompt: `Analyze this ${platform} content: ${content}`,
        type: "content_analysis"
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      setResult(response.data.result || response.data.text || "Analysis completed.");
    } else {
      setError("Analysis service temporarily unavailable. Please try again later.");
    }
  } catch (fallbackError) {
    setError("Unable to analyze content at this time. Please try again later.");
  }
};

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClear = () => {
    setContent("");
    setResult(null);
    setError(null);
    setCopied(false);
  };

  const getPlatformColor = () => {
    const platformData = socialPlatforms.find(p => p.name === platform);
    return platformData?.color || "#3B82F6";
  };

  const getPlatformStats = () => {
    const stats = {
      "Instagram": { 
        length: "125-150", 
        hashtags: "9-12", 
        bestTime: "9 AM - 11 AM",
        tips: ["Use high-quality images/videos", "Include 5-10 relevant hashtags", "Engage with comments"]
      },
      "Twitter (X)": { 
        length: "71-100", 
        hashtags: "1-2", 
        bestTime: "12 PM - 3 PM",
        tips: ["Keep tweets concise", "Use trending hashtags", "Include mentions"]
      },
      "LinkedIn": { 
        length: "150-200", 
        hashtags: "3-5", 
        bestTime: "8 AM - 10 AM",
        tips: ["Professional tone", "Industry-specific hashtags", "Share insights"]
      },
      "Facebook": { 
        length: "100-150", 
        hashtags: "2-3", 
        bestTime: "1 PM - 4 PM",
        tips: ["Casual tone", "Ask questions", "Share stories"]
      },
      "TikTok": { 
        length: "100-150", 
        hashtags: "4-6", 
        bestTime: "5 PM - 9 PM",
        tips: ["Trending sounds", "Challenges", "Quick cuts"]
      },
      "YouTube": { 
        length: "200-300", 
        hashtags: "5-8", 
        bestTime: "2 PM - 4 PM",
        tips: ["Descriptive titles", "Timestamps", "Call to action"]
      }
    };
    return stats[platform] || stats["Instagram"];
  };

  const platformStats = getPlatformStats();

  return (
    <div className="content-analyzer-wrapper">
      <div className="content-analyzer-main">
        <div className="content-analyzer-container">
          <div className="content-analyzer-layout">
            {/* Main Content */}
            <main className="content-analyzer-content">
              {/* Header */}
              <div className="content-analyzer-header-card" style={{ background: `linear-gradient(135deg, ${getPlatformColor()} 0%, #3B82F6 100%)` }}>
                <div className="content-analyzer-header-content">
                  <div className="content-analyzer-header-icon">
                    <Sparkles size={32} />
                  </div>
                  <div>
                    <h1 className="content-analyzer-header-title">AI Content Analyzer</h1>
                    <p className="content-analyzer-header-subtitle">
                      Enhance your social media content with AI-powered suggestions, hashtags, and performance tips
                    </p>
                  </div>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="content-analyzer-error">
                  <AlertCircle size={20} />
                  <div className="content-analyzer-error-content">
                    <strong>Error</strong>
                    <p>{error}</p>
                    {error.includes("limit") && (
                      <button 
                        onClick={() => window.location.href = "/plans"}
                        className="content-analyzer-upgrade-btn"
                      >
                        Upgrade Plan
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Platform Selection */}
              <div className="content-analyzer-platforms">
                <h2 className="content-analyzer-section-title">Select Platform</h2>
                <div className="content-analyzer-platform-grid">
                  {socialPlatforms.map((item) => (
                    <button
                      key={item.name}
                      className={`content-analyzer-platform-btn ${platform === item.name ? 'active' : ''}`}
                      onClick={() => setPlatform(item.name)}
                      style={{
                        borderColor: platform === item.name ? item.color : '#e2e8f0'
                      }}
                    >
                      <div className="content-analyzer-platform-icon" style={{ color: item.color }}>
                        {item.icon}
                      </div>
                      <span>{item.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Input */}
              <div className="content-analyzer-input-card">
                <div className="content-analyzer-input-header">
                  <h2 className="content-analyzer-input-title">
                    <MessageSquare size={20} />
                    <span>Your Content</span>
                  </h2>
                  <div className="content-analyzer-input-actions">
                    <button 
                      className="content-analyzer-action-btn" 
                      onClick={handleClear}
                      disabled={!content && !result}
                    >
                      <RefreshCw size={16} />
                      <span>Clear</span>
                    </button>
                  </div>
                </div>
                
                <div className="content-analyzer-input-group">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={`Paste your ${platform} content here...`}
                    className="content-analyzer-textarea"
                    rows={6}
                    disabled={loading}
                  />
                  <div className="content-analyzer-character-count">
                    {content.length} characters
                  </div>
                </div>

                {/* Platform Stats */}
                <div className="content-analyzer-stats-grid">
                  <div className="content-analyzer-stat-card">
                    <div className="content-analyzer-stat-icon">
                      <MessageSquare size={16} />
                    </div>
                    <div className="content-analyzer-stat-content">
                      <div className="content-analyzer-stat-value">{platformStats.length}</div>
                      <div className="content-analyzer-stat-label">Recommended Length</div>
                      <div className="content-analyzer-stat-unit">chars</div>
                    </div>
                  </div>
                  
                  <div className="content-analyzer-stat-card">
                    <div className="content-analyzer-stat-icon">
                      <Hash size={16} />
                    </div>
                    <div className="content-analyzer-stat-content">
                      <div className="content-analyzer-stat-value">{platformStats.hashtags}</div>
                      <div className="content-analyzer-stat-label">Hashtags</div>
                      <div className="content-analyzer-stat-unit">recommended</div>
                    </div>
                  </div>
                  
                  <div className="content-analyzer-stat-card">
                    <div className="content-analyzer-stat-icon">
                      <Clock size={16} />
                    </div>
                    <div className="content-analyzer-stat-content">
                      <div className="content-analyzer-stat-value">{platformStats.bestTime}</div>
                      <div className="content-analyzer-stat-label">Best Time</div>
                      <div className="content-analyzer-stat-unit">to post</div>
                    </div>
                  </div>
                  
                  <div className="content-analyzer-stat-card">
                    <div className="content-analyzer-stat-icon">
                      <TrendingUp size={16} />
                    </div>
                    <div className="content-analyzer-stat-content">
                      <div className="content-analyzer-stat-value">
                        {usageStats ? `${usageStats.remainingToday} left` : "Loading..."}
                      </div>
                      <div className="content-analyzer-stat-label">Daily Usage</div>
                      <div className="content-analyzer-stat-unit">analyses</div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleAnalyze} 
                  className={`content-analyzer-submit-btn ${loading ? 'loading' : ''}`}
                  disabled={loading || !content.trim() || (usageStats && usageStats.remainingToday <= 0)}
                  style={{ backgroundColor: getPlatformColor() }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      <span>
                        {usageStats && usageStats.remainingToday <= 0 ? 
                          "Limit Reached" : 
                          "Analyze Content"}
                      </span>
                    </>
                  )}
                </button>
              </div>

              {/* Results Section */}
              {result && (
                <div className="content-analyzer-results-card">
                  <div className="content-analyzer-results-header">
                    <div className="content-analyzer-results-title">
                      <Sparkles size={20} />
                      <span>AI Analysis Results</span>
                    </div>
                    <div className="content-analyzer-results-actions">
                      <button 
                        className={`content-analyzer-copy-btn ${copied ? 'copied' : ''}`}
                        onClick={handleCopy}
                      >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                        <span>{copied ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="content-analyzer-result-content">
                    <pre className="content-analyzer-result-text">{result}</pre>
                  </div>
                  
                  <div className="content-analyzer-results-tips">
                    {platformStats.tips.slice(0, 3).map((tip, index) => (
                      <div key={index} className="content-analyzer-tip">
                        <Check size={16} />
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </main>

            {/* Sidebar */}
            <aside className="content-analyzer-sidebar">
              {/* Subscription Panel */}
              <div className="content-analyzer-sidebar-section subscription-info">
                <h3 className="content-analyzer-sidebar-title">
                  <Star size={18} />
                  <span>Your Plan</span>
                </h3>
                
                {usageStats ? (
                  <>
                    <div className="subscription-stats">
                      <div className="subscription-stat">
                        <span className="stat-label">Plan</span>
                        <span className="stat-value" style={{ 
                          color: usageStats.isTrial ? '#f59e0b' : '#10b981'
                        }}>
                          {usageStats.planName}
                          {usageStats.isTrial && ' (Trial)'}
                        </span>
                      </div>
                      
                      <div className="subscription-stat">
                        <span className="stat-label">Daily Limit</span>
                        <span className="stat-value">
                          {usageStats.dailyLimit} analyses
                        </span>
                      </div>
                      
                      <div className="subscription-stat">
                        <span className="stat-label">Used Today</span>
                        <span className="stat-value">
                          {usageStats.usedToday}/{usageStats.dailyLimit}
                        </span>
                      </div>
                      
                      {usageStats.isTrial && usageStats.trialDaysLeft && (
                        <div className="subscription-stat">
                          <span className="stat-label">Trial Days Left</span>
                          <span className="stat-value" style={{ 
                            color: usageStats.trialDaysLeft <= 3 ? '#ef4444' : 
                                   usageStats.trialDaysLeft <= 7 ? '#f59e0b' : '#10b981'
                          }}>
                            {usageStats.trialDaysLeft} days
                          </span>
                        </div>
                      )}
                      
                      {/* Progress Bar */}
                      <div className="usage-progress">
                        <div className="progress-header">
                          <span className="progress-label">Daily Usage</span>
                          <span className="progress-percentage">
                            {Math.round((usageStats.usedToday / usageStats.dailyLimit) * 100)}%
                          </span>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{
                              width: `${Math.min((usageStats.usedToday / usageStats.dailyLimit) * 100, 100)}%`,
                              background: usageStats.remainingToday <= 0 ? '#ef4444' :
                                        usageStats.usedToday / usageStats.dailyLimit > 0.7 ? '#f59e0b' : '#10b981'
                            }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="subscription-actions">
                        {/* <button
                          onClick={() => window.location.href = "/plans"}
                          className="subscription-action-btn primary"
                        >
                          {usageStats.isTrial ? 'Upgrade Now' : 'Manage Plan'}
                        </button> */}
                        {/* <button
                          onClick={() => window.location.href = "/account"}
                          className="subscription-action-btn"
                        >
                          Account
                        </button> */}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="loading-state">
                    <Loader2 size={20} className="animate-spin" />
                    <span>Loading subscription...</span>
                  </div>
                )}
              </div>

              {/* Platform Tips */}
              <div className="content-analyzer-sidebar-section">
                <h3 className="content-analyzer-sidebar-title">
                  <Target size={18} />
                  <span>{platform} Tips</span>
                </h3>
                <div className="content-analyzer-platform-tips">
                  {platformStats.tips.map((tip, index) => (
                    <div key={index} className="content-analyzer-tip-item">
                      <CheckCircle size={16} />
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Templates */}
              <div className="content-analyzer-sidebar-section">
                <h3 className="content-analyzer-sidebar-title">
                  <Zap size={18} />
                  <span>Quick Templates</span>
                </h3>
                <div className="content-analyzer-templates">
                  <button 
                    className="content-analyzer-template"
                    onClick={() => setContent("Just launched something amazing! Check it out 👇 #new #launch")}
                  >
                    <Sparkles size={16} />
                    <span>Product Launch</span>
                  </button>
                  <button 
                    className="content-analyzer-template"
                    onClick={() => setContent("🌟 Behind the scenes today! Working hard to bring you the best content. #bts #work")}
                  >
                    <Sparkles size={16} />
                    <span>Behind The Scenes</span>
                  </button>
                  <button 
                    className="content-analyzer-template"
                    onClick={() => setContent("What's your biggest challenge this week? Let's discuss in the comments! 👇 #discussion #community")}
                  >
                    <Sparkles size={16} />
                    <span>Engagement Post</span>
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <style jsx>{`
        .content-analyzer-wrapper {
          width: 100%;
          background: #f8fafc;
          min-height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        
        .content-analyzer-main {
          padding: 2rem 0;
        }
        
        .content-analyzer-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 1.25rem;
        }
        
        .content-analyzer-layout {
          display: grid;
          grid-template-columns: 1fr 350px;
          gap: 2rem;
        }
        
        @media (max-width: 1024px) {
          .content-analyzer-layout {
            grid-template-columns: 1fr;
          }
        }
        
        .content-analyzer-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow-y: auto;
  max-height: calc(100vh - 40px);
  padding-right: 6px; /* avoids scrollbar overlap */
}

        
        /* Header Card */
        .content-analyzer-header-card {
          border-radius: 12px;
          padding: 2rem;
          color: white;
        }
        
        .content-analyzer-header-content {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .content-analyzer-header-icon {
          width: 64px;
          height: 64px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .content-analyzer-header-title {
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: white;
        }
        
        .content-analyzer-header-subtitle {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.9);
        }
        
        /* Error Alert */
        .content-analyzer-error {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          color: #dc2626;
        }
        
        .content-analyzer-error svg {
          flex-shrink: 0;
        }
        
        .content-analyzer-error-content {
          flex: 1;
        }
        
        .content-analyzer-error-content strong {
          display: block;
          margin-bottom: 0.25rem;
        }
        
        .content-analyzer-error-content p {
          margin: 0.5rem 0;
          font-size: 0.875rem;
        }
        
        .content-analyzer-upgrade-btn {
          padding: 0.5rem 1rem;
          background: #dc2626;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 0.875rem;
          cursor: pointer;
        }
        
        .content-analyzer-upgrade-btn:hover {
          background: #b91c1c;
        }
        
        /* Platform Selection */
        .content-analyzer-platforms {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }
        
        .content-analyzer-section-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 1rem;
        }
        
        .content-analyzer-platform-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
        }
        
        @media (max-width: 768px) {
          .content-analyzer-platform-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        .content-analyzer-platform-btn {
          padding: 0.75rem;
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }
        
        .content-analyzer-platform-btn:hover:not(:disabled) {
          border-color: #cbd5e1;
          transform: translateY(-2px);
        }
        
        .content-analyzer-platform-btn.active {
          background: #f8fafc;
          border-width: 2px;
          color: #1e293b;
        }
        
        .content-analyzer-platform-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .content-analyzer-platform-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        /* Input Card */
        .content-analyzer-input-card {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }
        
        .content-analyzer-input-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
        }
        
        .content-analyzer-input-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1e293b;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .content-analyzer-input-actions {
          display: flex;
          gap: 0.5rem;
        }
        
        .content-analyzer-action-btn {
          padding: 0.5rem 0.75rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 0.8125rem;
          color: #64748b;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.375rem;
          transition: background 0.2s ease;
        }
        
        .content-analyzer-action-btn:hover:not(:disabled) {
          background: #e2e8f0;
        }
        
        .content-analyzer-action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .content-analyzer-input-group {
          margin-bottom: 1.5rem;
        }
        
        .content-analyzer-textarea {
          width: 100%;
          padding: 1rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 0.9375rem;
          resize: vertical;
          min-height: 150px;
          font-family: inherit;
          transition: border 0.2s ease;
        }
        
        .content-analyzer-textarea:focus {
          outline: none;
          border-color: #3B82F6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .content-analyzer-textarea:disabled {
          background: #f8fafc;
          cursor: not-allowed;
        }
        
        .content-analyzer-character-count {
          text-align: right;
          font-size: 0.75rem;
          color: #94a3b8;
          margin-top: 0.25rem;
        }
        
        /* Stats Grid */
        .content-analyzer-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        
        @media (max-width: 768px) {
          .content-analyzer-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 480px) {
          .content-analyzer-stats-grid {
            grid-template-columns: 1fr;
          }
        }
        
        .content-analyzer-stat-card {
          padding: 1rem;
          background: #f8fafc;
          border-radius: 8px;
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }
        
        .content-analyzer-stat-icon {
          width: 32px;
          height: 32px;
          background: white;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #3B82F6;
        }
        
        .content-analyzer-stat-content {
          flex: 1;
        }
        
        .content-analyzer-stat-value {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1e293b;
        }
        
        .content-analyzer-stat-label {
          font-size: 0.6875rem;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-top: 0.125rem;
        }
        
        .content-analyzer-stat-unit {
          font-size: 0.6875rem;
          color: #94a3b8;
        }
        
        /* Submit Button */
        .content-analyzer-submit-btn {
          width: 100%;
          padding: 1rem;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        
        .content-analyzer-submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          opacity: 0.95;
        }
        
        .content-analyzer-submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .content-analyzer-submit-btn.loading {
          opacity: 0.8;
        }
        
        /* Results Card */
        .content-analyzer-results-card {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }
        
        .content-analyzer-results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
        }
        
        .content-analyzer-results-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1e293b;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .content-analyzer-results-actions {
          display: flex;
          gap: 0.5rem;
        }
        
        .content-analyzer-copy-btn {
          padding: 0.5rem 0.75rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 0.8125rem;
          color: #64748b;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.375rem;
          transition: all 0.2s ease;
        }
        
        .content-analyzer-copy-btn:hover {
          background: #e2e8f0;
        }
        
        .content-analyzer-copy-btn.copied {
          background: #d1fae5;
          color: #059669;
          border-color: #bbf7d0;
        }
        
        .content-analyzer-result-content {
          margin-bottom: 1.25rem;
        }
        
        .content-analyzer-result-text {
          white-space: pre-wrap;
          font-size: 0.875rem;
          line-height: 1.6;
          color: #374151;
          background: #f8fafc;
          padding: 1.25rem;
          border-radius: 8px;
          font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
          overflow-x: auto;
        }
        
        .content-analyzer-results-tips {
          display: flex;
          gap: 1rem;
        }
        
        @media (max-width: 768px) {
          .content-analyzer-results-tips {
            flex-direction: column;
          }
        }
        
        .content-analyzer-tip {
          display: flex;
          gap: 0.5rem;
          align-items: center;
          padding: 0.75rem;
          background: #f0f9ff;
          border: 1px solid #e0f2fe;
          border-radius: 8px;
          flex: 1;
        }
        
        .content-analyzer-tip svg {
          color: #3B82F6;
          flex-shrink: 0;
        }
        
        .content-analyzer-tip span {
          font-size: 0.8125rem;
          color: #0369a1;
        }
        
        /* Sidebar */
        .content-analyzer-sidebar {
          position: sticky;
          top: 1.25rem;
          height: fit-content;
          max-height: calc(100vh - 40px);
  overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        
        @media (max-width: 1024px) {
          .content-analyzer-sidebar {
            position: static;
            margin-top: 2rem;
          }
        }
        
        /* Sidebar Sections */
        .content-analyzer-sidebar-section {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }
        
        .content-analyzer-sidebar-title {
          font-size: 1rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        /* Subscription Panel */
        .subscription-stats {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .subscription-stat {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .subscription-stat:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }
        
        .stat-label {
          font-size: 0.875rem;
          color: #64748b;
        }
        
        .stat-value {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1e293b;
        }
        
        .usage-progress {
          margin-top: 0.5rem;
        }
        
        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.375rem;
        }
        
        .progress-label {
          font-size: 0.75rem;
          color: #64748b;
        }
        
        .progress-percentage {
          font-size: 0.75rem;
          font-weight: 600;
          color: #1e293b;
        }
        
        .progress-bar {
          height: 6px;
          background: #e2e8f0;
          border-radius: 3px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.3s ease;
        }
        
        .subscription-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
          margin-top: 1rem;
        }
        
        .subscription-action-btn {
          padding: 0.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 0.8125rem;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .subscription-action-btn:hover {
          background: #f8fafc;
        }
        
        .subscription-action-btn.primary {
          background: #3B82F6;
          color: white;
          border-color: #3B82F6;
        }
        
        .subscription-action-btn.primary:hover {
          background: #2563eb;
        }
        
        .loading-state {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0;
          color: #64748b;
          font-size: 0.875rem;
        }
        
        /* Platform Tips */
        .content-analyzer-platform-tips {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .content-analyzer-tip-item {
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
        }
        
        .content-analyzer-tip-item svg {
          color: #10b981;
          flex-shrink: 0;
          margin-top: 0.125rem;
        }
        
        .content-analyzer-tip-item span {
          font-size: 0.8125rem;
          color: #64748b;
          line-height: 1.4;
        }
        
        /* Templates */
        .content-analyzer-templates {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .content-analyzer-template {
          padding: 0.75rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #475569;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }
        
        .content-analyzer-template:hover {
          background: #e2e8f0;
          border-color: #cbd5e1;
          color: #3B82F6;
        }
        
        .content-analyzer-template svg {
          color: #3B82F6;
          flex-shrink: 0;
        }
        
        /* Animations */
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}