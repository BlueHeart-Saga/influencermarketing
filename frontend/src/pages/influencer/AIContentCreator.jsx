import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../style/AIContentCreator.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

function AIContentCreator() {
  const [text, setText] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [suggestion, setSuggestion] = useState("");
  const [mode, setMode] = useState("caption");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  
  // New state for subscription management
  const [usageStats, setUsageStats] = useState(null);
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [planLimits, setPlanLimits] = useState([]);

  // ====== TOKEN FROM LOCAL STORAGE ======
  const token = localStorage.getItem("access_token");

  // ===============================
  // FETCH USAGE STATISTICS
  // ===============================
  const fetchUsageStats = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/ai/usage`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsageStats(res.data);
    } catch (err) {
      console.error("Failed to fetch usage stats:", err);
      // Set default usage stats if API fails
      setUsageStats({
        usage_today: 0,
        daily_limit: 10,
        remaining_today: 10,
        historical: []
      });
    }
  };

  // ===============================
  // FETCH PLAN INFORMATION
  // ===============================
  const fetchPlanInfo = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/ai/plans`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlanLimits(res.data.plans);
      
      // Get current plan info
      const currentPlanName = res.data.current_plan || "Free Trial";
      const currentPlan = res.data.plans.find(p => p.name === currentPlanName) || res.data.plans[0];
      setSubscriptionInfo({
        planName: currentPlan.name,
        dailyLimit: currentPlan.daily_limit,
        type: currentPlan.type,
        upgradeRequired: currentPlan.upgrade_required || false
      });
    } catch (err) {
      console.error("Failed to fetch plan info:", err);
      // Set default plan info
      setPlanLimits([
        {
          name: "Free Trial",
          daily_limit: 10,
          type: "trial",
          upgrade_required: true,
          price: 0,
          features: ["Basic features"]
        }
      ]);
      setSubscriptionInfo({
        planName: "Free Trial",
        dailyLimit: 10,
        type: "trial",
        upgradeRequired: true
      });
    }
  };

  // ===============================
  // INITIAL LOAD
  // ===============================
  useEffect(() => {
    if (token) {
      fetchUsageStats();
      fetchPlanInfo();
    }
  }, [token]);

  // ===============================
  // DIRECT BACKEND: ANALYZE TEXT
  // ===============================
  const analyzeTextDirect = async (textValue) => {
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/ai/analyze-text`,
        { text: textValue },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return res.data;
    } catch (err) {
      console.error("Analyze text error:", err);
      // Return default analysis on error
      return {
        language: "Unknown",
        sentiment: "Neutral",
        keywords: []
      };
    }
  };

  // ===============================
  // DIRECT BACKEND: GENERATE TEXT
  // ===============================
  const generateTextDirect = async (prompt, mode = "caption") => {
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/ai/generate-content`,
        { 
          text: prompt,
          mode: mode
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return res.data;
    } catch (err) {
      console.error("Generate text error:", err);
      throw err;
    }
  };

  // ===============================
  // LIVE TEXT ANALYSIS
  // ===============================
  useEffect(() => {
    if (text.trim().length < 3) {
      setAnalysis(null);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const result = await analyzeTextDirect(text);
        setAnalysis({
          language: result.language || "Unknown",
          sentiment: result.sentiment || "Neutral",
          keywords: result.keywords || [],
        });
      } catch (err) {
        console.error("Analysis failed:", err);
        setAnalysis({
          language: "Unknown",
          sentiment: "Neutral",
          keywords: [],
        });
      }
    }, 600);

    return () => clearTimeout(timeout);
  }, [text]);

  // ===============================
  // GENERATE CONTENT BUTTON
  // ===============================
  const handleGenerate = async () => {
    if (!text.trim()) return;
    
    // Check if we have usage info and if limits are reached
    if (usageStats && usageStats.remaining_today <= 0) {
      setError({
        message: "Daily limit reached!",
        detail: "You've used all your AI generations for today.",
        upgradeRequired: true
      });
      setShowUpgradeModal(true);
      return;
    }

    setLoading(true);
    setError(null);
    setSuggestion("");

    try {
      const result = await generateTextDirect(text, mode);
      
      if (result?.response) {
        setSuggestion(result.response);
        
        // Update usage stats
        if (result.usage_info) {
          setUsageStats({
            ...usageStats,
            used_today: result.usage_info.used_today,
            remaining_today: result.usage_info.remaining_today
          });
        }
      } else {
        setSuggestion("⚠️ No suggestion generated");
      }

    } catch (err) {
      console.error("Error generating content:", err);
      
      // FIXED: Handle error object properly
      const errorData = err?.response?.data;
      
      if (errorData?.detail) {
        // Check if detail is an object or string
        if (typeof errorData.detail === 'object') {
          setError({
            message: errorData.detail.message || "Generation Failed",
            detail: typeof errorData.detail.detail === 'string' 
              ? errorData.detail.detail 
              : "An error occurred while generating content",
            upgradeRequired: errorData.detail.upgrade_required || false
          });
          
          if (errorData.detail.upgrade_required) {
            setShowUpgradeModal(true);
          }
        } else {
          // If detail is a string
          setError({
            message: "Generation Failed",
            detail: errorData.detail,
            upgradeRequired: false
          });
        }
      } else {
        // Generic error
        setError({
          message: "Generation Failed",
          detail: "❌ Error generating content. Try again later.",
          upgradeRequired: false
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // COPY TO CLIPBOARD
  // ===============================
  const copyToClipboard = () => {
    navigator.clipboard.writeText(suggestion);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ===============================
  // RESET USAGE (for demo/testing)
  // ===============================
  const resetUsage = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/ai/reset-usage-demo`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Refresh usage stats
      fetchUsageStats();
      
      // Reset local state
      setUsageStats({
        ...usageStats,
        used_today: 0,
        remaining_today: subscriptionInfo?.dailyLimit || 10
      });
      
      alert("Usage reset successfully!");
    } catch (err) {
      console.error("Failed to reset usage:", err);
      alert("Failed to reset usage");
    }
  };

  return (
    <div className="ai-content-creator">
      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="ai-upgrade-modal-overlay">
          <div className="ai-upgrade-modal">
            <div className="ai-upgrade-modal-header">
              <h3>✨ Upgrade Your Plan</h3>
              <button onClick={() => setShowUpgradeModal(false)} className="ai-modal-close">
                ×
              </button>
            </div>
            <div className="ai-upgrade-modal-content">
              <div className="ai-upgrade-icon">🚀</div>
              <h4>Unlock More AI Generations</h4>
              <p>You've reached your daily limit. Upgrade to generate more content!</p>
              
              <div className="ai-plan-comparison">
                {planLimits.map((plan, index) => (
                  <div key={index} className={`ai-plan-card ${plan.name === subscriptionInfo?.planName ? 'current-plan' : ''}`}>
                    <div className="ai-plan-name">{plan.name}</div>
                    <div className="ai-plan-limit">{plan.daily_limit} per day</div>
                    {plan.price > 0 ? (
                      <div className="ai-plan-price">${plan.price}/month</div>
                    ) : (
                      <div className="ai-plan-price">Free</div>
                    )}
                    <ul className="ai-plan-features">
                      {Array.isArray(plan.features) && plan.features.slice(0, 3).map((feature, i) => (
                        <li key={i}>{feature}</li>
                      ))}
                    </ul>
                    <button className="ai-plan-select-btn">
                      {plan.name === subscriptionInfo?.planName ? 'Current Plan' : 'Select Plan'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="ai-upgrade-modal-footer">
              <button onClick={() => setShowUpgradeModal(false)} className="ai-modal-cancel">
                Maybe Later
              </button>
              <button onClick={() => window.location.href = '/pricing'} className="ai-modal-upgrade">
                View All Plans
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="ai-container">
        {/* Header with Usage Stats */}
        <div className="ai-header">
          <div className="ai-header-content">
            <div className="ai-header-top">
              <h1>✨ AI Content Creator</h1>
              {usageStats && (
                <div className="ai-usage-badge">
                  <span className="ai-usage-count">{usageStats.used_today || 0}</span>
                  <span className="ai-usage-separator">/</span>
                  <span className="ai-usage-total">{usageStats.daily_limit || 10}</span>
                  <span className="ai-usage-label">used today</span>
                </div>
              )}
            </div>
            <p>Enhance your content with AI-powered suggestions</p>
            
            {subscriptionInfo && (
              <div className="ai-plan-info">
                <span className="ai-plan-tag">
                  {subscriptionInfo.planName} • {subscriptionInfo.dailyLimit} generations/day
                </span>
                {subscriptionInfo.upgradeRequired && (
                  <span className="ai-upgrade-hint">Upgrade for more!</span>
                )}
              </div>
            )}
          </div>
          <div className="ai-header-gradient"></div>
        </div>

        <div className="ai-content">
          {/* Usage Progress Bar */}
          {usageStats && (
            <div className="ai-usage-progress">
              <div className="ai-progress-label">
                <span>Daily Usage</span>
                <span>{usageStats.remaining_today || 0} remaining</span>
              </div>
              <div className="ai-progress-bar">
                <div 
                  className="ai-progress-fill"
                  style={{ 
                    width: `${Math.min(100, ((usageStats.used_today || 0) / usageStats.daily_limit) * 100)}%` 
                  }}
                ></div>
              </div>
              <div className="ai-progress-stats">
                <span>Used: {usageStats.used_today || 0}</span>
                <span>Limit: {usageStats.daily_limit || 10}</span>
              </div>
            </div>
          )}

          {/* Input Section */}
          <div className="ai-input-section">
            <label htmlFor="content-input" className="ai-input-label">
              Your Content
            </label>
            <textarea
              id="content-input"
              className="ai-textarea"
              rows={5}
              placeholder="Write your draft caption, ad copy, or idea..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={usageStats?.remaining_today <= 0}
            />
            <div className="ai-char-count">
              {text.length} characters • Analysis appears after 3+ characters
              {usageStats?.remaining_today <= 0 && (
                <span className="ai-limit-warning"> • Daily limit reached!</span>
              )}
            </div>
          </div>

          {/* Mode Selector */}
          <div className="ai-mode-section">
            <p className="ai-mode-label">Content Type</p>
            <div className="ai-mode-selector">
              {[
                { id: "caption", label: "Social Caption", icon: "📱" },
                { id: "adcopy", label: "Ad Copy", icon: "📢" },
                { id: "hashtag", label: "Hashtags", icon: "#️⃣" },
                { id: "blog", label: "Blog Idea", icon: "✍️" },
                { id: "email", label: "Email", icon: "✉️" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setMode(item.id)}
                  className={`ai-mode-btn ${mode === item.id ? "active" : ""}`}
                  disabled={usageStats?.remaining_today <= 0}
                >
                  <span className="ai-mode-icon">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button with Usage Warning */}
          <div className="ai-generate-section">
            <button
              onClick={handleGenerate}
              disabled={loading || text.trim().length === 0 || usageStats?.remaining_today <= 0}
              className={`ai-generate-btn ${usageStats?.remaining_today <= 0 ? 'disabled-limit' : ''}`}
            >
              {loading ? (
                <>
                  <span className="ai-spinner"></span>
                  Generating...
                </>
              ) : (
                <>
                  <span className="ai-generate-icon">✨</span>
                  Generate Suggestion
                  {usageStats?.remaining_today > 0 && (
                    <span className="ai-remaining-count">({usageStats.remaining_today} left)</span>
                  )}
                </>
              )}
            </button>
            
            {usageStats?.remaining_today <= 0 && (
              <div className="ai-limit-reached">
                <span className="ai-limit-icon">⚠️</span>
                Daily limit reached. 
                <button 
                  onClick={() => setShowUpgradeModal(true)}
                  className="ai-upgrade-link"
                >
                  Upgrade for more generations
                </button>
              </div>
            )}
          </div>

          {/* Error Message - FIXED: Render error object properly */}
          {error && (
            <div className="ai-error">
              <span className="ai-error-icon">⚠️</span>
              <div>
                <strong>{error.message || "Error"}</strong>
                <p>{error.detail || "An error occurred"}</p>
              </div>
            </div>
          )}

          {/* Suggestion Output */}
          {suggestion && !error && (
            <div className="ai-suggestion">
              <div className="ai-suggestion-header">
                <h2>AI Suggestion</h2>
                <div className="ai-suggestion-actions">
                  <button onClick={copyToClipboard} className="ai-copy-btn">
                    {copied ? (
                      <>
                        <span className="ai-copy-icon">✓</span>
                        Copied!
                      </>
                    ) : (
                      <>
                        <span className="ai-copy-icon">📋</span>
                        Copy
                      </>
                    )}
                  </button>
                  <button 
                    onClick={() => setText(suggestion)}
                    className="ai-use-btn"
                  >
                    <span className="ai-use-icon">↻</span>
                    Use as Input
                  </button>
                </div>
              </div>
              <div className="ai-suggestion-content">
                <p>{suggestion}</p>
              </div>
            </div>
          )}

          {/* Live Text Analysis */}
          {analysis && (
            <div className="ai-analysis">
              <div className="ai-analysis-header">
                <h2>Live Analysis</h2>
                <span className="ai-analysis-badge">Real-time</span>
              </div>
              <div className="ai-analysis-content">
                <div className="ai-analysis-card">
                  <div className="ai-analysis-title">
                    <span className="ai-analysis-icon">🌐</span>
                    Language
                  </div>
                  <div className="ai-analysis-value">{analysis.language}</div>
                </div>
                <div className="ai-analysis-card">
                  <div className="ai-analysis-title">
                    <span className="ai-analysis-icon">😊</span>
                    Sentiment
                  </div>
                  <div className="ai-analysis-value capitalize">
                    {analysis.sentiment.toLowerCase()}
                  </div>
                </div>
                <div className="ai-analysis-card">
                  <div className="ai-analysis-title">
                    <span className="ai-analysis-icon">🔑</span>
                    Keywords
                  </div>
                  <div className="ai-analysis-keywords">
                    {Array.isArray(analysis.keywords) && analysis.keywords.slice(0, 4).map((keyword, index) => (
                      <span key={index} className="ai-keyword">
                        {keyword}
                      </span>
                    ))}
                    {Array.isArray(analysis.keywords) && analysis.keywords.length > 4 && (
                      <span className="ai-keyword-more">
                        +{analysis.keywords.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subscription Info Panel */}
          {subscriptionInfo && subscriptionInfo.upgradeRequired && (
            <div className="ai-upgrade-panel">
              <div className="ai-upgrade-content">
                <h3>🚀 Get More AI Generations</h3>
                <p>Upgrade to unlock {subscriptionInfo.dailyLimit * 2} daily generations and more features!</p>
                <div className="ai-upgrade-features">
                  <span>✓ More daily generations</span>
                  <span>✓ Advanced content types</span>
                  <span>✓ Priority processing</span>
                </div>
                <button 
                  onClick={() => setShowUpgradeModal(true)}
                  className="ai-upgrade-cta"
                >
                  View Upgrade Options
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Quick Stats */}
        <div className="ai-footer">
          <div className="ai-footer-stats">
            <div className="ai-footer-stat">
              <div className="ai-footer-stat-value">
                {usageStats?.historical?.reduce((sum, day) => sum + (day.count || 0), 0) || 0}
              </div>
              <div className="ai-footer-stat-label">Total Generations</div>
            </div>
            <div className="ai-footer-stat">
              <div className="ai-footer-stat-value">
                {subscriptionInfo?.dailyLimit || 10}
              </div>
              <div className="ai-footer-stat-label">Daily Limit</div>
            </div>
            <div className="ai-footer-stat">
              <div className="ai-footer-stat-value">
                {planLimits.length || 4}
              </div>
              <div className="ai-footer-stat-label">Available Plans</div>
            </div>
          </div>
          <div className="ai-footer-note">
            Usage resets daily at midnight UTC. 
            <button onClick={resetUsage} className="ai-reset-link">
              (Reset Demo)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIContentCreator;