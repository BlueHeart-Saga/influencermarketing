// frontend/src/pages/ContentGenerator.jsx
import React, { useState, useEffect, useContext } from "react";
import { 
  generateContent, 
  getContentLimits, 
  getUserContentStats 
} from "../../services/contentAPI";
import { AuthContext } from "../../context/AuthContext"; // Add this import
import { 
  LightBulbIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ChartBarIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";
import "../../style/ContentGenerator.css";

export default function ContentGenerator() {
  const { user, subscription } = useContext(AuthContext); // Get subscription from context
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("command-a-03-2025");
  const [maxTokens, setMaxTokens] = useState(500);
  const [usageStats, setUsageStats] = useState(null);
  const [planLimits, setPlanLimits] = useState(null);
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [generationHistory, setGenerationHistory] = useState([]);
  const [showPlanDropdown, setShowPlanDropdown] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");

  // Determine current plan from subscription context
  const getCurrentPlan = () => {
    if (!subscription) {
      return {
        type: "trial",
        plan: "trial",
        plan_name: "Free Trial",
        is_active: true,
        is_trial: true,
        remaining_days: 15,
        trial_remaining_days: 15
      };
    }

    // Use subscription data from context (Navbar is using this)
    return {
      type: subscription.type || "trial",
      plan: subscription.plan || "trial",
      plan_name: subscription.plan_name || "Free Trial",
      is_active: subscription.is_active !== false,
      is_trial: subscription.is_trial || subscription.type === "trial",
      remaining_days: subscription.remaining_days || 0,
      trial_remaining_days: subscription.trial_remaining_days || subscription.remaining_days || 15,
      current_period_end: subscription.current_period_end
    };
  };

  const currentSubscription = getCurrentPlan();

  // Fetch usage stats and plan limits on component mount
  useEffect(() => {
    fetchContentLimits();
    fetchUserStats();
    // Load generation history from localStorage
    const savedHistory = localStorage.getItem("contentGenerationHistory");
    if (savedHistory) {
      setGenerationHistory(JSON.parse(savedHistory));
    }
  }, []);


const fetchContentLimits = async () => {
  try {
    const response = await getContentLimits();
    if (response.success) {
      setPlanLimits(response.limits);
      setSubscriptionInfo({
        plan: response.plan,
        planKey: response.plan_key,
        planType: response.plan_type,
        canGenerate: response.can_generate,
        upgradeRequired: response.upgrade_required,
        subscriptionData: response.subscription_data
      });
    } else {
      // Use fallback data
      setPlanLimits({
        max_generations_per_day: 10,
        max_tokens: 500,
        allowed_models: ["command-a-03-2025"],
        can_generate_content: true
      });
      setSubscriptionInfo({
        plan: "Free Trial",
        planKey: "trial",
        planType: "trial",
        canGenerate: true,
        upgradeRequired: false,
        subscriptionData: {
          is_active: true,
          is_trial: true,
          remaining_days: 15,
          trial_remaining_days: 15
        }
      });
    }
  } catch (err) {
    console.error("Error fetching limits:", err);
    // Fallback data
    setPlanLimits({
      max_generations_per_day: 10,
      max_tokens: 500,
      allowed_models: ["command-a-03-2025"],
      can_generate_content: true
    });
    setSubscriptionInfo({
      plan: "Free Trial",
      planKey: "trial",
      planType: "trial",
      canGenerate: true,
      upgradeRequired: false,
      subscriptionData: {
        is_active: true,
        is_trial: true,
        remaining_days: 15,
        trial_remaining_days: 15
      }
    });
  }
};

const fetchUserStats = async () => {
  try {
    const response = await getUserContentStats();
    if (response.success) {
      setUsageStats(response.stats);
    } else {
      // Fallback data
      setUsageStats({
        today_usage: 0,
        daily_limit: 10,
        remaining_today: 10,
        total_generations: 0,
        max_tokens: 500,
        allowed_models: ["command-a-03-2025"],
        plan_name: "Free Trial"
      });
    }
  } catch (err) {
    console.error("Error fetching stats:", err);
    // Fallback data
    setUsageStats({
      today_usage: 0,
      daily_limit: 10,
      remaining_today: 10,
      total_generations: 0,
      max_tokens: 500,
      allowed_models: ["command-a-03-2025"],
      plan_name: "Free Trial"
    });
  }
};




  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    // Check if subscription is active
    if (!currentSubscription.is_active) {
      setError("Your subscription is not active. Please upgrade to continue.");
      return;
    }

    // Check trial expiration
    if (currentSubscription.type === "trial" && currentSubscription.trial_remaining_days <= 0) {
      setError("Your free trial has ended. Please upgrade to continue.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess("");

    try {
      const token = localStorage.getItem("access_token");
      const response = await generateContent(token, {
        prompt,
        model: selectedModel,
        max_tokens: maxTokens
      });

      if (response.success) {
        setResult(response.generated_text);
        
        // Save to history
        const newEntry = {
          id: Date.now(),
          prompt,
          result: response.generated_text,
          model: selectedModel,
          tokens: maxTokens,
          timestamp: new Date().toISOString(),
          usage: response.usage
        };
        
        const updatedHistory = [newEntry, ...generationHistory.slice(0, 9)];
        setGenerationHistory(updatedHistory);
        localStorage.setItem("contentGenerationHistory", JSON.stringify(updatedHistory));
        
        // Update stats
        setUsageStats(prev => ({
          ...prev,
          today_usage: response.usage.tokens_used + (prev?.today_usage || 0),
          remaining_today: response.usage.remaining_today
        }));
        
        setSuccess("Content generated successfully!");
        
        // Clear prompt after successful generation
        setPrompt("");
        
        // Refresh stats
        fetchUserStats();
      }
    } catch (err) {
      if (err.response?.data) {
        const errorData = err.response.data;
        if (errorData.upgrade_required) {
          setError(`${errorData.message}. Please upgrade your plan to continue.`);
        } else {
          setError(errorData.message || "Failed to generate content");
        }
      } else {
        setError("An unexpected error occurred");
      }
      console.error("Generation error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = (historyItem) => {
    setPrompt(historyItem.prompt);
    setSelectedModel(historyItem.model);
    setMaxTokens(historyItem.tokens);
  };

  const handleClearHistory = () => {
    setGenerationHistory([]);
    localStorage.removeItem("contentGenerationHistory");
  };

  const handleQuickPrompt = (quickPrompt) => {
    setPrompt(quickPrompt);
  };

  const quickPrompts = [
    "Write a catchy Instagram caption about coffee",
    "Create a professional email subject line",
    "Generate a blog post introduction about AI",
    "Write a product description for a smartwatch",
    "Create a social media post for a fitness app",
    "Write a YouTube video title about productivity"
  ];

  const models = [
    { id: "command-a-03-2025", name: "Command (Standard)", maxTokens: 500 },
    { id: "command-r-plus", name: "Command R+ (Enhanced)", maxTokens: 1000 },
    { id: "command-light", name: "Command Light (Fast)", maxTokens: 2000 },
    { id: "command-xlarge", name: "Command XLarge (Premium)", maxTokens: 5000 }
  ];

  // Enhanced plan details with proper mapping from subscription
  const plans = {
    trial: {
      name: "Free Trial",
      dailyLimit: 10,
      cssClass: "content-plan-trial",
      features: ["10 generations/day", "Basic models", "500 tokens max"],
      upgradeRequired: currentSubscription.trial_remaining_days <= 0,
      remainingDays: currentSubscription.trial_remaining_days
    },
    starter: {
      name: "Starter",
      dailyLimit: 50,
      cssClass: "content-plan-starter",
      features: ["50 generations/day", "Enhanced models", "1000 tokens max"],
      upgradeRequired: false,
      remainingDays: currentSubscription.remaining_days
    },
    pro: {
      name: "Pro",
      dailyLimit: 200,
      cssClass: "content-plan-pro",
      features: ["200 generations/day", "All models", "2000 tokens max"],
      upgradeRequired: false,
      remainingDays: currentSubscription.remaining_days
    },
    enterprise: {
      name: "Enterprise",
      dailyLimit: 1000,
      cssClass: "content-plan-enterprise",
      features: ["1000 generations/day", "Premium models", "5000 tokens max"],
      upgradeRequired: false,
      remainingDays: currentSubscription.remaining_days
    }
  };

  // Determine current plan from subscription context
  const getPlanKey = () => {
    if (!subscription) return "trial";
    
    const planName = subscription.plan_name?.toLowerCase() || "";
    const planType = subscription.plan?.toLowerCase() || "";
    
    if (planName.includes("trial") || planType.includes("trial")) return "trial";
    if (planName.includes("starter") || planType.includes("starter")) return "starter";
    if (planName.includes("pro") || planType.includes("pro")) return "pro";
    if (planName.includes("enterprise") || planType.includes("enterprise")) return "enterprise";
    
    return "trial"; // Default to trial
  };

  const planKey = getPlanKey();
  const planData = plans[planKey];

  // Calculate if upgrade is needed
  const isUpgradeRequired = () => {
    if (!currentSubscription.is_active) return true;
    if (currentSubscription.type === "trial" && currentSubscription.trial_remaining_days <= 0) return true;
    if (subscriptionInfo?.upgradeRequired) return true;
    return false;
  };

  const upgradeRequired = isUpgradeRequired();

  return (
    <div className="content-generator-page">
      <div className="content-generator-container">
        {/* Header */}
        <div className="content-header-section">
          <div className="content-header-row">
            <div className="content-title-section">
              <h1 className="content-main-title">
                <SparklesIcon className="content-sparkle-icon" />
                AI Content Generator
              </h1>
              <p className="content-subtitle">
                Generate high-quality content instantly using advanced AI models
              </p>
            </div>
            
            {/* Plan Indicator & Upgrade Button */}
            <div className="content-plan-indicator">
              <button
                onClick={() => setShowPlanDropdown(!showPlanDropdown)}
                className={`content-plan-button ${planData.cssClass}`}
              >
                <ChartBarIcon className="content-plan-icon" />
                {planData.name}
                {upgradeRequired && (
                  <ExclamationTriangleIcon className="content-warning-icon" />
                )}
              </button>
              
              {/* {showPlanDropdown && (
                <div className="content-plan-dropdown">
                  <div className="content-plan-dropdown-content">
                    <h3 className="content-plan-dropdown-title">Plan Details</h3> */}
                    
                    {/* Current Plan Card */}
                    {/* <div className={`content-plan-card ${planData.cssClass}-card`}>
                      <div className="content-plan-card-header">
                        <div>
                          <h4 className="content-plan-name">{planData.name}</h4>
                          <p className="content-plan-details">
                            {planData.remainingDays > 0 ? (
                              <>
                                {planKey === "trial" 
                                  ? `${planData.remainingDays} days remaining in trial`
                                  : `${planData.remainingDays} days until renewal`
                                }
                              </>
                            ) : (
                              planKey === "trial" 
                                ? "Trial expired - Upgrade required"
                                : "Active subscription"
                            )}
                          </p>
                          <p className="content-plan-usage">
                            {usageStats?.remaining_today !== undefined 
                              ? `${usageStats.remaining_today}/${planData.dailyLimit} generations remaining today`
                              : `${planData.dailyLimit} generations per day`}
                          </p>
                        </div>
                        <span className="content-plan-badge">
                          {planKey === "trial" ? "TRIAL" : "ACTIVE"}
                        </span>
                      </div>
                      
                      <ul className="content-plan-features">
                        {planData.features.map((feature, idx) => (
                          <li key={idx} className="content-plan-feature">
                            <CheckCircleIcon className="content-feature-icon" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div> */}
                    
                    {/* Upgrade Section */}
                    {/* {upgradeRequired && (
                      <div className="content-upgrade-alert">
                        <div className="content-upgrade-content">
                          <ExclamationTriangleIcon className="content-alert-icon" />
                          <div>
                            <h4 className="content-upgrade-title">
                              {planKey === "trial" && planData.remainingDays <= 0 
                                ? "Trial Expired" 
                                : "Upgrade Required"}
                            </h4>
                            <p className="content-upgrade-text">
                              {planKey === "trial" && planData.remainingDays <= 0
                                ? "Your free trial has ended. Upgrade to continue using AI content generation."
                                : "Your current plan limits have been reached. Upgrade for more generations."}
                            </p>
                            <button 
                              onClick={() => window.location.href = "/plans"}
                              className="content-upgrade-button"
                            >
                              View Upgrade Options
                            </button>
                          </div>
                        </div>
                      </div>
                    )} */}
                    
                    {/* Usage Stats */}
                    {/* {usageStats && (
                      <div className="content-plan-stats">
                        <h4 className="content-stats-title">Usage Statistics</h4>
                        <div className="content-stats-grid">
                          <div className="content-stat-card">
                            <p className="content-stat-label">Today's Usage</p>
                            <p className="content-stat-value">
                              {usageStats.today_usage || 0}
                            </p>
                          </div>
                          <div className="content-stat-card">
                            <p className="content-stat-label">Remaining Today</p>
                            <p className={`content-stat-value ${
                              (usageStats.remaining_today || 0) <= 3 
                                ? 'content-stat-critical' 
                                : 'content-stat-highlight'
                            }`}>
                              {usageStats.remaining_today || planData.dailyLimit}
                            </p>
                          </div>
                        </div>
                        {currentSubscription.current_period_end && (
                          <div className="content-renewal-info">
                            <p className="content-renewal-text">
                              {planKey === "trial" ? "Trial ends" : "Renews"} on{" "}
                              {new Date(currentSubscription.current_period_end).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )} */}
            </div>
          </div>

          {/* Usage Progress Bar */}
          {usageStats && (
            <div className="content-usage-container">
              <div className="content-usage-header">
                <span className="content-usage-text">
                  Daily Usage: {usageStats.today_usage || 0} / {planData.dailyLimit}
                  {planKey === "trial" && planData.remainingDays > 0 && (
                    <span className="content-trial-days">
                      ({planData.remainingDays} {planData.remainingDays === 1 ? 'day' : 'days'} left in trial)
                    </span>
                  )}
                </span>
                <span className="content-usage-percent">
                  {Math.round(((usageStats.today_usage || 0) / planData.dailyLimit) * 100)}%
                </span>
              </div>
              <div className="content-progress-bar">
                <div 
                  className={`content-progress-fill ${
                    (usageStats.today_usage || 0) >= planData.dailyLimit 
                      ? 'content-progress-full' 
                      : upgradeRequired
                        ? 'content-progress-warning'
                        : 'content-progress-normal'
                  }`}
                  style={{ 
                    width: `${Math.min(((usageStats.today_usage || 0) / planData.dailyLimit) * 100, 100)}%` 
                  }}
                />
              </div>
              <div className="content-progress-footer">
                <span className="content-progress-remaining">
                  {usageStats.remaining_today || planData.dailyLimit} generations remaining today
                </span>
                <span className="content-progress-reset">Resets at midnight UTC</span>
              </div>
            </div>
          )}
        </div>

        <div className="content-main-grid">
          {/* Left Column: Input & Controls */}
          <div className="content-input-column">
            {/* Quick Prompts */}
            <div className="content-quick-prompts-card">
              <h3 className="content-quick-prompts-title">
                <LightBulbIcon className="content-lightbulb-icon" />
                Quick Prompts
              </h3>
              <div className="content-quick-prompts-grid">
                {quickPrompts.map((qp, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickPrompt(qp)}
                    className="content-quick-prompt-button"
                    disabled={upgradeRequired}
                  >
                    {qp}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Area */}
            <div className="content-input-card">
              <div className="content-input-section">
                <label className="content-input-label">
                  Your Prompt {upgradeRequired && <span className="content-upgrade-badge">Upgrade Required</span>}
                </label>
                <textarea
                  className="content-textarea"
                  rows="6"
                  placeholder={
                    upgradeRequired 
                      ? "Upgrade your plan to generate content..." 
                      : "Describe what you want to generate. Be specific for better results..."
                  }
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={upgradeRequired}
                />
                <div className="content-textarea-footer">
                  <span className="content-char-count">
                    {prompt.length} characters
                  </span>
                  <button
                    onClick={() => setPrompt("")}
                    className="content-clear-button"
                    disabled={upgradeRequired}
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Settings */}
              {/* <div className="content-settings-grid">
                <div className="content-setting-group">
                  <label className="content-setting-label">
                    AI Model
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="content-model-select"
                    disabled={upgradeRequired}
                  >
                    {models.map(model => (
                      <option 
                        key={model.id} 
                        value={model.id}
                        disabled={!planLimits?.allowed_models?.includes(model.id) || upgradeRequired}
                        className="content-model-option"
                      >
                        {model.name} 
                        {(!planLimits?.allowed_models?.includes(model.id) || upgradeRequired) && "(Upgrade Required)"}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="content-setting-group">
                  <label className="content-setting-label">
                    Max Tokens: {maxTokens}
                  </label>
                  <input
                    type="range"
                    min="100"
                    max={planLimits?.max_tokens || 500}
                    step="100"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                    className="content-token-slider"
                    disabled={upgradeRequired}
                  />
                  <div className="content-slider-labels">
                    <span>100</span>
                    <span>{planLimits?.max_tokens || 500} (Plan Max)</span>
                  </div>
                </div>
              </div> */}

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={loading || !prompt.trim() || upgradeRequired}
                className={`content-generate-button ${
                  loading || !prompt.trim() || upgradeRequired
                    ? 'content-generate-disabled'
                    : 'content-generate-active'
                }`}
              >
                {loading ? (
                  <>
                    <ArrowPathIcon className="content-spin-icon" />
                    Generating...
                  </>
                ) : upgradeRequired ? (
                  <>
                    <ExclamationTriangleIcon className="content-upgrade-icon" />
                    Upgrade to Generate
                  </>
                ) : (
                  <>
                    <SparklesIcon className="content-sparkles-icon" />
                    Generate Content
                  </>
                )}
              </button>

              {/* Error/Success Messages */}
              {error && (
                <div className="content-error-alert">
                  <div className="content-alert-content">
                    <ExclamationTriangleIcon className="content-error-icon" />
                    <p className="content-error-text">{error}</p>
                  </div>
                </div>
              )}

              {success && (
                <div className="content-success-alert">
                  <div className="content-alert-content">
                    <CheckCircleIcon className="content-success-icon" />
                    <p className="content-success-text">{success}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Generated Result */}
            {result && (
              <div className="content-result-card">
                <div className="content-result-header">
                  <h3 className="content-result-title">
                    Generated Content
                  </h3>
                  <button
                    onClick={() => navigator.clipboard.writeText(result)}
                    className="content-copy-button"
                  >
                    Copy to Clipboard
                  </button>
                </div>
                <div className="content-result-box">
                  <p className="content-result-text">{result}</p>
                </div>
                <div className="content-result-actions">
                  <button
                    onClick={() => navigator.clipboard.writeText(result)}
                    className="content-action-button"
                  >
                    Copy
                  </button>
                  <button
                    onClick={() => setResult("")}
                    className="content-action-button"
                  >
                    Clear Result
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: History & Stats */}
          <div className="content-sidebar-column">
            {/* Generation History */}
            <div className="content-history-card">
              <div className="content-history-header">
                <h3 className="content-history-title">
                  Recent Generations
                </h3>
                {generationHistory.length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    className="content-clear-history"
                  >
                    Clear All
                  </button>
                )}
              </div>
              
              {generationHistory.length > 0 ? (
                <div className="content-history-list">
                  {generationHistory.map((item) => (
                    <div 
                      key={item.id} 
                      className="content-history-item"
                    >
                      <div className="content-history-item-header">
                        <span className="content-history-time">
                          {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                        <button
                          onClick={() => handleRetry(item)}
                          className="content-retry-button"
                          disabled={upgradeRequired}
                        >
                          Retry
                        </button>
                      </div>
                      <p className="content-history-prompt">
                        {item.prompt}
                      </p>
                      <div className="content-history-meta">
                        <span>{item.model}</span>
                        <span>{item.tokens} tokens</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="content-history-empty">
                  <SparklesIcon className="content-empty-icon" />
                  <p className="content-empty-text">
                    {upgradeRequired ? "Upgrade to start generating content" : "No generation history yet"}
                  </p>
                  <p className="content-empty-subtext">
                    {upgradeRequired 
                      ? "Upgrade your plan to unlock AI content generation" 
                      : "Your generated content will appear here"}
                  </p>
                </div>
              )}
            </div>

            {/* Stats Overview */}
            <div className="content-stats-card">
              <h3 className="content-stats-title-main">
                Usage Overview
              </h3>
              {usageStats ? (
                <div className="content-stats-details">
                  <div className="content-stat-row">
                    <span className="content-stat-label-small">Today's Generations</span>
                    <span className="content-stat-value-small">
                      {usageStats.today_usage || 0}
                    </span>
                  </div>
                  <div className="content-stat-row">
                    <span className="content-stat-label-small">Remaining Today</span>
                    <span className={`content-stat-value-small ${
                      (usageStats.remaining_today || 0) <= 3 
                        ? 'content-stat-critical' 
                        : 'content-stat-good'
                    }`}>
                      {usageStats.remaining_today || planData.dailyLimit}
                    </span>
                  </div>
                  <div className="content-stat-row">
                    <span className="content-stat-label-small">Total Generations</span>
                    <span className="content-stat-value-small">
                      {usageStats.total_generations || 0}
                    </span>
                  </div>
                  <div className="content-plan-limits-section">
                    <h4 className="content-limits-title">Plan Limits</h4>
                    <div className="content-limits-grid">
                      <div className="content-limit-item">
                        <div className="content-limit-label">Daily Limit</div>
                        <div className="content-limit-value">{planData.dailyLimit}</div>
                      </div>
                      <div className="content-limit-item">
                        <div className="content-limit-label">Max Tokens</div>
                        <div className="content-limit-value">{planLimits?.max_tokens || 500}</div>
                      </div>
                    </div>
                  </div>
                  {planKey === "trial" && planData.remainingDays > 0 && (
                    <div className="content-trial-info">
                      <div className="content-trial-progress">
                        <div className="content-trial-progress-bar">
                          <div 
                            className="content-trial-progress-fill"
                            style={{ width: `${((15 - planData.remainingDays) / 15) * 100}%` }}
                          />
                        </div>
                        <div className="content-trial-text">
                          {planData.remainingDays} {planData.remainingDays === 1 ? 'day' : 'days'} left in trial
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="content-stats-loading">
                  <p className="content-loading-text">Loading stats...</p>
                </div>
              )}
            </div>

            {/* Tips */}
            <div className="content-tips-card">
              <h4 className="content-tips-title">
                <LightBulbIcon className="content-tips-icon" />
                Tips for Better Results
              </h4>
              <ul className="content-tips-list">
                <li className="content-tip-item">
                  <span className="content-tip-bullet">•</span>
                  <span>Be specific about tone, style, and length</span>
                </li>
                <li className="content-tip-item">
                  <span className="content-tip-bullet">•</span>
                  <span>Include target audience in your prompt</span>
                </li>
                <li className="content-tip-item">
                  <span className="content-tip-bullet">•</span>
                  <span>Use bullet points for structured content</span>
                </li>
                <li className="content-tip-item">
                  <span className="content-tip-bullet">•</span>
                  <span>Mention if you want SEO-optimized content</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}