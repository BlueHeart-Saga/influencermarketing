// // src/pages/FraudDetection.jsx
// import React, { useState } from "react";
// import "../style/FraudDetection.css";
// import HomeTopBar from "../pages/HomePage/HomeTopBar";

// export default function FraudDetection() {
//   const [formData, setFormData] = useState({
//     engagementRate: "",
//     followerGrowth: "",
//     suspiciousPayments: false,
//     accountAge: "",
//     postFrequency: "",
//     followerToFollowing: ""
//   });
  
//   const [result, setResult] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);

//   const handleInputChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value
//     }));
//   };

//   const handleCheck = () => {
//     setIsLoading(true);
    
//     // Simulate API call with timeout
//     setTimeout(() => {
//       // Calculate a mock fraud score based on inputs
//       const engagementRate = parseFloat(formData.engagementRate) || 0;
//       const followerGrowth = parseFloat(formData.followerGrowth) || 0;
//       const accountAge = parseInt(formData.accountAge) || 365;
//       const postFrequency = parseInt(formData.postFrequency) || 1;
//       const followerToFollowing = parseInt(formData.followerToFollowing) || 1;
      
//       // Simple algorithm to determine fraud likelihood
//       let fraudScore = 0;
      
//       if (engagementRate > 15) fraudScore += 10;
//       else if (engagementRate > 10) fraudScore += 5;
//       else if (engagementRate < 2) fraudScore += 25;
//       else if (engagementRate < 5) fraudScore += 15;
      
//       if (followerGrowth > 20) fraudScore += 20;
//       else if (followerGrowth > 10) fraudScore += 10;
//       else if (followerGrowth < 1) fraudScore += 5;
      
//       if (formData.suspiciousPayments) fraudScore += 30;
      
//       if (accountAge < 30) fraudScore += 20;
//       else if (accountAge < 90) fraudScore += 10;
      
//       if (postFrequency > 10) fraudScore += 5;
      
//       if (followerToFollowing > 1000) fraudScore += 15;
      
//       // Cap at 100
//       fraudScore = Math.min(fraudScore, 100);
      
//       let status;
//       if (fraudScore >= 70) status = "High Risk";
//       else if (fraudScore >= 40) status = "Medium Risk";
//       else if (fraudScore >= 20) status = "Low Risk";
//       else status = "Normal";
      
//       setResult({
//         status,
//         fraudScore,
//         details: [
//           { label: "Engagement Pattern", value: engagementRate < 2 ? "Suspicious" : "Normal" },
//           { label: "Growth Pattern", value: followerGrowth > 20 ? "Suspicious" : "Normal" },
//           { label: "Account Age", value: accountAge < 30 ? "New Account" : "Established" }
//         ]
//       });
      
//       setIsLoading(false);
//     }, 800);
//   };

//   const getStatusColor = () => {
//     if (!result) return "";
//     if (result.status === "High Risk") return "#ff4d4f";
//     if (result.status === "Medium Risk") return "#faad14";
//     if (result.status === "Low Risk") return "#52c41a";
//     return "#1890ff";
//   };

//   const getScoreColor = (score) => {
//     if (score >= 70) return "#ff4d4f";
//     if (score >= 40) return "#faad14";
//     if (score >= 20) return "#52c41a";
//     return "#1890ff";
//   };

//   return (
//     <><HomeTopBar />
//     <div className="fraud-detection-container">
//       <div className="fraud-header">
//         <h1>Account Fraud Detection</h1>
//         <p>Analyze accounts for potential fraudulent activities using multiple metrics</p>
//       </div>
      
//       <div className="fraud-content">
//         <div className="input-section">
//           <h2>Account Metrics</h2>
          
//           <div className="input-grid">
//             <div className="input-group">
//               <label htmlFor="engagementRate">Engagement Rate (%)</label>
//               <input
//                 id="engagementRate"
//                 name="engagementRate"
//                 type="number"
//                 min="0"
//                 max="100"
//                 step="0.1"
//                 value={formData.engagementRate}
//                 onChange={handleInputChange}
//                 placeholder="e.g., 4.5"
//               />
//             </div>
            
//             <div className="input-group">
//               <label htmlFor="followerGrowth">Follower Growth Rate (%)</label>
//               <input
//                 id="followerGrowth"
//                 name="followerGrowth"
//                 type="number"
//                 min="0"
//                 max="1000"
//                 step="0.1"
//                 value={formData.followerGrowth}
//                 onChange={handleInputChange}
//                 placeholder="e.g., 12.3"
//               />
//             </div>
            
//             <div className="input-group">
//               <label htmlFor="accountAge">Account Age (days)</label>
//               <input
//                 id="accountAge"
//                 name="accountAge"
//                 type="number"
//                 min="0"
//                 value={formData.accountAge}
//                 onChange={handleInputChange}
//                 placeholder="e.g., 120"
//               />
//             </div>
            
//             <div className="input-group">
//               <label htmlFor="postFrequency">Avg. Posts Per Day</label>
//               <input
//                 id="postFrequency"
//                 name="postFrequency"
//                 type="number"
//                 min="0"
//                 step="0.1"
//                 value={formData.postFrequency}
//                 onChange={handleInputChange}
//                 placeholder="e.g., 2.5"
//               />
//             </div>
            
//             <div className="input-group">
//               <label htmlFor="followerToFollowing">Follower/Following Ratio</label>
//               <input
//                 id="followerToFollowing"
//                 name="followerToFollowing"
//                 type="number"
//                 min="0"
//                 step="0.1"
//                 value={formData.followerToFollowing}
//                 onChange={handleInputChange}
//                 placeholder="e.g., 3.2"
//               />
//             </div>
            
//             <div className="checkbox-group">
//               <label className="checkbox-label">
//                 <input
//                   type="checkbox"
//                   name="suspiciousPayments"
//                   checked={formData.suspiciousPayments}
//                   onChange={handleInputChange}
//                 />
//                 <span className="checkmark"></span>
//                 Suspicious Payment Activity
//               </label>
//             </div>
//           </div>
          
//           <button 
//             className="analyze-btn"
//             onClick={handleCheck}
//             disabled={isLoading}
//           >
//             {isLoading ? (
//               <>
//                 <span className="spinner"></span>
//                 Analyzing...
//               </>
//             ) : (
//               "Analyze Account"
//             )}
//           </button>
//         </div>
        
//         {result && (
//           <div className="result-section">
//             <h2>Analysis Results</h2>
            
//             <div className="score-card">
//               <div className="score-header">
//                 <h3>Fraud Risk Score</h3>
//                 <span 
//                   className="status-badge"
//                   style={{ backgroundColor: getStatusColor() }}
//                 >
//                   {result.status}
//                 </span>
//               </div>
              
//               <div className="score-display">
//                 <div className="score-circle">
//                   <div 
//                     className="circle-background"
//                     style={{ 
//                       background: `conic-gradient(${getScoreColor(result.fraudScore)} 0% ${result.fraudScore}%, #f0f0f0 ${result.fraudScore}% 100%)`
//                     }}
//                   >
//                     <div className="circle-inner">
//                       <span className="score-value">{result.fraudScore}</span>
//                       <span className="score-label">/100</span>
//                     </div>
//                   </div>
//                 </div>
                
//                 <div className="score-details">
//                   {result.details.map((detail, index) => (
//                     <div key={index} className="detail-item">
//                       <span className="detail-label">{detail.label}:</span>
//                       <span className="detail-value">{detail.value}</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
            
//             <div className="recommendations">
//               <h3>Recommendations</h3>
//               {result.status === "High Risk" ? (
//                 <ul>
//                   <li>Investigate this account immediately</li>
//                   <li>Review recent transactions for anomalies</li>
//                   <li>Consider temporary suspension pending review</li>
//                 </ul>
//               ) : result.status === "Medium Risk" ? (
//                 <ul>
//                   <li>Monitor this account closely</li>
//                   <li>Flag for manual review</li>
//                   <li>Check for similar patterns in related accounts</li>
//                 </ul>
//               ) : result.status === "Low Risk" ? (
//                 <ul>
//                   <li>Continue normal monitoring</li>
//                   <li>No immediate action required</li>
//                 </ul>
//               ) : (
//                 <ul>
//                   <li>Account appears normal</li>
//                   <li>Continue with standard monitoring procedures</li>
//                 </ul>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//     </>
//   );
// }



import React, { useState } from 'react';
import { 
  Shield, AlertTriangle, CheckCircle, Search,
  TrendingUp, Users, Calendar, FileText,
  BarChart3, Target, RefreshCw, Zap,
  ChevronRight, Clock, Eye, XCircle
} from 'lucide-react';
import HomeTopBar from "../pages/HomePage/HomeTopBar";

export default function FraudDetection() {
  const [formData, setFormData] = useState({
    engagementRate: "",
    followerGrowth: "",
    suspiciousPayments: false,
    accountAge: "",
    postFrequency: "",
    followerToFollowing: ""
  });
  
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("analyzer");

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCheck = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      const engagementRate = parseFloat(formData.engagementRate) || 0;
      const followerGrowth = parseFloat(formData.followerGrowth) || 0;
      const accountAge = parseInt(formData.accountAge) || 365;
      const postFrequency = parseInt(formData.postFrequency) || 1;
      const followerToFollowing = parseInt(formData.followerToFollowing) || 1;
      
      let fraudScore = 0;
      
      if (engagementRate > 15) fraudScore += 10;
      else if (engagementRate > 10) fraudScore += 5;
      else if (engagementRate < 2) fraudScore += 25;
      else if (engagementRate < 5) fraudScore += 15;
      
      if (followerGrowth > 20) fraudScore += 20;
      else if (followerGrowth > 10) fraudScore += 10;
      else if (followerGrowth < 1) fraudScore += 5;
      
      if (formData.suspiciousPayments) fraudScore += 30;
      
      if (accountAge < 30) fraudScore += 20;
      else if (accountAge < 90) fraudScore += 10;
      
      if (postFrequency > 10) fraudScore += 5;
      
      if (followerToFollowing > 1000) fraudScore += 15;
      
      fraudScore = Math.min(fraudScore, 100);
      
      let status;
      let statusColor;
      let statusIcon;
      
      if (fraudScore >= 70) {
        status = "High Risk";
        statusColor = "#EF4444";
        statusIcon = <AlertTriangle size={20} />;
      } else if (fraudScore >= 40) {
        status = "Medium Risk";
        statusColor = "#F59E0B";
        statusIcon = <AlertTriangle size={20} />;
      } else if (fraudScore >= 20) {
        status = "Low Risk";
        statusColor = "#10B981";
        statusIcon = <Shield size={20} />;
      } else {
        status = "Normal";
        statusColor = "#3B82F6";
        statusIcon = <CheckCircle size={20} />;
      }
      
      setResult({
        status,
        statusColor,
        statusIcon,
        fraudScore,
        details: [
          { 
            label: "Engagement Pattern", 
            value: engagementRate < 2 ? "Suspicious" : "Normal",
            icon: <BarChart3 size={16} />,
            risk: engagementRate < 2 ? "high" : engagementRate < 5 ? "medium" : "low"
          },
          { 
            label: "Growth Pattern", 
            value: followerGrowth > 20 ? "Suspicious" : "Normal",
            icon: <TrendingUp size={16} />,
            risk: followerGrowth > 20 ? "high" : followerGrowth > 10 ? "medium" : "low"
          },
          { 
            label: "Account Age", 
            value: accountAge < 30 ? "New Account" : "Established",
            icon: <Calendar size={16} />,
            risk: accountAge < 30 ? "high" : accountAge < 90 ? "medium" : "low"
          }
        ]
      });
      
      setIsLoading(false);
    }, 800);
  };

  const getScoreColor = (score) => {
    if (score >= 70) return "#EF4444";
    if (score >= 40) return "#F59E0B";
    if (score >= 20) return "#10B981";
    return "#3B82F6";
  };

  const recentChecks = [
    { id: 1, username: "@influencer_pro", score: 85, status: "High Risk", time: "2 min ago" },
    { id: 2, username: "@brand_ambassador", score: 32, status: "Low Risk", time: "15 min ago" },
    { id: 3, username: "@social_media_guru", score: 67, status: "Medium Risk", time: "1 hour ago" },
  ];

  const fraudIndicators = [
    { indicator: "Sudden follower spikes", risk: "High" },
    { indicator: "Low engagement rates", risk: "Medium" },
    { indicator: "Suspicious payment patterns", risk: "High" },
    { indicator: "New accounts with high activity", risk: "Medium" },
  ];

  return (
    <>
      <HomeTopBar />
      <div className="fraud-wrapper">
        {/* Main Content */}
        <div className="fraud-main">
          <div className="fraud-container">
            <div className="fraud-layout">
              {/* Main Content Area */}
              <main className="fraud-content">
                {/* Header */}
                <div className="fraud-header-card">
                  <div className="fraud-header-content">
                    <div className="fraud-header-icon">
                      <Shield size={32} />
                    </div>
                    <div>
                      <h1 className="fraud-header-title">Account Fraud Detection</h1>
                      <p className="fraud-header-subtitle">
                        Analyze accounts for potential fraudulent activities using multiple metrics
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="fraud-tabs">
                  <button 
                    className={`fraud-tab-btn ${activeTab === "analyzer" ? 'active' : ''}`}
                    onClick={() => setActiveTab("analyzer")}
                  >
                    <Search size={18} />
                    <span>Fraud Analyzer</span>
                  </button>
                  <button 
                    className={`fraud-tab-btn ${activeTab === "history" ? 'active' : ''}`}
                    onClick={() => setActiveTab("history")}
                  >
                    <Clock size={18} />
                    <span>Recent Checks</span>
                  </button>
                  <button 
                    className={`fraud-tab-btn ${activeTab === "indicators" ? 'active' : ''}`}
                    onClick={() => setActiveTab("indicators")}
                  >
                    <AlertTriangle size={18} />
                    <span>Fraud Indicators</span>
                  </button>
                </div>

                {/* Analyzer Tab */}
                {activeTab === "analyzer" && (
                  <div className="fraud-analyzer">
                    <div className="fraud-input-card">
                      <div className="fraud-input-header">
                        <h2 className="fraud-input-title">
                          <Search size={20} />
                          <span>Account Metrics Analysis</span>
                        </h2>
                      </div>
                      
                      <div className="fraud-input-grid">
                        <div className="fraud-input-group">
                          <label className="fraud-input-label">
                            <BarChart3 size={16} />
                            <span>Engagement Rate (%)</span>
                          </label>
                          <input
                            type="number"
                            name="engagementRate"
                            value={formData.engagementRate}
                            onChange={handleInputChange}
                            className="fraud-input"
                            min="0"
                            max="100"
                            step="0.1"
                            placeholder="e.g., 4.5"
                          />
                        </div>

                        <div className="fraud-input-group">
                          <label className="fraud-input-label">
                            <TrendingUp size={16} />
                            <span>Follower Growth Rate (%)</span>
                          </label>
                          <input
                            type="number"
                            name="followerGrowth"
                            value={formData.followerGrowth}
                            onChange={handleInputChange}
                            className="fraud-input"
                            min="0"
                            max="1000"
                            step="0.1"
                            placeholder="e.g., 12.3"
                          />
                        </div>

                        <div className="fraud-input-group">
                          <label className="fraud-input-label">
                            <Calendar size={16} />
                            <span>Account Age (days)</span>
                          </label>
                          <input
                            type="number"
                            name="accountAge"
                            value={formData.accountAge}
                            onChange={handleInputChange}
                            className="fraud-input"
                            min="0"
                            placeholder="e.g., 120"
                          />
                        </div>

                        <div className="fraud-input-group">
                          <label className="fraud-input-label">
                            <FileText size={16} />
                            <span>Avg. Posts Per Day</span>
                          </label>
                          <input
                            type="number"
                            name="postFrequency"
                            value={formData.postFrequency}
                            onChange={handleInputChange}
                            className="fraud-input"
                            min="0"
                            step="0.1"
                            placeholder="e.g., 2.5"
                          />
                        </div>

                        <div className="fraud-input-group">
                          <label className="fraud-input-label">
                            <Users size={16} />
                            <span>Follower/Following Ratio</span>
                          </label>
                          <input
                            type="number"
                            name="followerToFollowing"
                            value={formData.followerToFollowing}
                            onChange={handleInputChange}
                            className="fraud-input"
                            min="0"
                            step="0.1"
                            placeholder="e.g., 3.2"
                          />
                        </div>

                        <div className="fraud-checkbox-group">
                          <label className="fraud-checkbox-label">
                            <input
                              type="checkbox"
                              name="suspiciousPayments"
                              checked={formData.suspiciousPayments}
                              onChange={handleInputChange}
                              className="fraud-checkbox"
                            />
                            <span className="fraud-checkmark"></span>
                            <span className="fraud-checkbox-text">Suspicious Payment Activity</span>
                          </label>
                        </div>
                      </div>

                      <button 
                        className={`fraud-analyze-btn ${isLoading ? 'loading' : ''}`}
                        onClick={handleCheck}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <div className="fraud-spinner"></div>
                            <span>Analyzing...</span>
                          </>
                        ) : (
                          <>
                            <Search size={18} />
                            <span>Analyze Account</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Results */}
                    {result && (
                      <div className="fraud-results">
                        <div className="fraud-result-card">
                          <div className="fraud-result-header">
                            <h2 className="fraud-result-title">Analysis Results</h2>
                            <div className="fraud-status-badge" style={{ backgroundColor: result.statusColor }}>
                              {result.statusIcon}
                              <span>{result.status}</span>
                            </div>
                          </div>
                          
                          <div className="fraud-score-display">
                            <div className="fraud-score-circle">
                              <div 
                                className="fraud-score-circle-bg"
                                style={{ 
                                  background: `conic-gradient(${getScoreColor(result.fraudScore)} 0% ${result.fraudScore}%, #e2e8f0 ${result.fraudScore}% 100%)`
                                }}
                              >
                                <div className="fraud-score-circle-inner">
                                  <div className="fraud-score-value">{result.fraudScore}</div>
                                  <div className="fraud-score-label">/100</div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="fraud-details">
                              <h3 className="fraud-details-title">Risk Indicators</h3>
                              <div className="fraud-details-list">
                                {result.details.map((detail, index) => (
                                  <div key={index} className="fraud-detail-item">
                                    <div className="fraud-detail-icon">{detail.icon}</div>
                                    <div className="fraud-detail-content">
                                      <div className="fraud-detail-label">{detail.label}</div>
                                      <div className="fraud-detail-value">{detail.value}</div>
                                    </div>
                                    <div className={`fraud-risk-indicator fraud-risk-${detail.risk}`}>
                                      {detail.risk.toUpperCase()}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="fraud-recommendations">
                          <h3 className="fraud-recommendations-title">Recommendations</h3>
                          <div className="fraud-recommendations-content">
                            {result.status === "High Risk" ? (
                              <>
                                <div className="fraud-recommendation">
                                  <AlertTriangle size={16} />
                                  <span>Investigate this account immediately</span>
                                </div>
                                <div className="fraud-recommendation">
                                  <Eye size={16} />
                                  <span>Review recent transactions for anomalies</span>
                                </div>
                                <div className="fraud-recommendation">
                                  <XCircle size={16} />
                                  <span>Consider temporary suspension pending review</span>
                                </div>
                              </>
                            ) : result.status === "Medium Risk" ? (
                              <>
                                <div className="fraud-recommendation">
                                  <Eye size={16} />
                                  <span>Monitor this account closely</span>
                                </div>
                                <div className="fraud-recommendation">
                                  <Target size={16} />
                                  <span>Flag for manual review</span>
                                </div>
                                <div className="fraud-recommendation">
                                  <Search size={16} />
                                  <span>Check for similar patterns in related accounts</span>
                                </div>
                              </>
                            ) : result.status === "Low Risk" ? (
                              <>
                                <div className="fraud-recommendation">
                                  <CheckCircle size={16} />
                                  <span>Continue normal monitoring</span>
                                </div>
                                <div className="fraud-recommendation">
                                  <CheckCircle size={16} />
                                  <span>No immediate action required</span>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="fraud-recommendation">
                                  <CheckCircle size={16} />
                                  <span>Account appears normal</span>
                                </div>
                                <div className="fraud-recommendation">
                                  <CheckCircle size={16} />
                                  <span>Continue with standard monitoring procedures</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* History Tab */}
                {activeTab === "history" && (
                  <div className="fraud-history">
                    <div className="fraud-history-card">
                      <div className="fraud-history-header">
                        <h2 className="fraud-history-title">Recent Account Checks</h2>
                        <div className="fraud-history-count">{recentChecks.length} checks</div>
                      </div>
                      
                      <div className="fraud-history-list">
                        {recentChecks.map((check) => (
                          <div key={check.id} className="fraud-history-item">
                            <div className="fraud-history-main">
                              <div className="fraud-history-username">{check.username}</div>
                              <div className="fraud-history-time">
                                <Clock size={14} />
                                <span>{check.time}</span>
                              </div>
                            </div>
                            <div className="fraud-history-metrics">
                              <div className="fraud-history-score">
                                <div className="fraud-history-score-value">{check.score}</div>
                                <div className="fraud-history-score-label">/100</div>
                              </div>
                              <div className={`fraud-history-status fraud-status-${check.status.toLowerCase().replace(' ', '-')}`}>
                                {check.status}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Indicators Tab */}
                {activeTab === "indicators" && (
                  <div className="fraud-indicators">
                    <div className="fraud-indicators-card">
                      <div className="fraud-indicators-header">
                        <h2 className="fraud-indicators-title">Common Fraud Indicators</h2>
                        <p className="fraud-indicators-subtitle">Key metrics to watch for suspicious account activity</p>
                      </div>
                      
                      <div className="fraud-indicators-grid">
                        {fraudIndicators.map((indicator, index) => (
                          <div key={index} className="fraud-indicator-card">
                            <div className="fraud-indicator-header">
                              <div className="fraud-indicator-icon">
                                <AlertTriangle size={20} />
                              </div>
                              <div className={`fraud-indicator-risk fraud-risk-${indicator.risk.toLowerCase()}`}>
                                {indicator.risk}
                              </div>
                            </div>
                            <div className="fraud-indicator-content">
                              <h3 className="fraud-indicator-title">{indicator.indicator}</h3>
                              <p className="fraud-indicator-description">
                                {indicator.risk === "High" 
                                  ? "Immediate investigation recommended"
                                  : "Monitor closely and review regularly"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </main>

              {/* Sidebar */}
              <aside className="fraud-sidebar">
                {/* Quick Stats */}
                <div className="fraud-sidebar-section">
                  <h3 className="fraud-sidebar-title">Detection Stats</h3>
                  <div className="fraud-stats">
                    <div className="fraud-stat">
                      <div className="fraud-stat-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                        <Shield size={20} />
                      </div>
                      <div className="fraud-stat-content">
                        <div className="fraud-stat-value">1,248</div>
                        <div className="fraud-stat-label">Accounts Analyzed</div>
                      </div>
                    </div>
                    <div className="fraud-stat">
                      <div className="fraud-stat-icon" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                        <AlertTriangle size={20} />
                      </div>
                      <div className="fraud-stat-content">
                        <div className="fraud-stat-value">42</div>
                        <div className="fraud-stat-label">High Risk Detected</div>
                      </div>
                    </div>
                    <div className="fraud-stat">
                      <div className="fraud-stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                        <CheckCircle size={20} />
                      </div>
                      <div className="fraud-stat-content">
                        <div className="fraud-stat-value">98.3%</div>
                        <div className="fraud-stat-label">Accuracy Rate</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="fraud-sidebar-section">
                  <h3 className="fraud-sidebar-title">Quick Actions</h3>
                  <div className="fraud-actions">
                    <button className="fraud-action" onClick={() => setActiveTab("analyzer")}>
                      <Search size={16} />
                      <span>New Account Check</span>
                    </button>
                    <button className="fraud-action" onClick={() => {
                      setFormData({
                        engagementRate: "1.5",
                        followerGrowth: "25",
                        suspiciousPayments: true,
                        accountAge: "15",
                        postFrequency: "12",
                        followerToFollowing: "1500"
                      });
                    }}>
                      <Target size={16} />
                      <span>Test High Risk Example</span>
                    </button>
                    <button className="fraud-action" onClick={() => {
                      setFormData({
                        engagementRate: "4.2",
                        followerGrowth: "8.5",
                        suspiciousPayments: false,
                        accountAge: "365",
                        postFrequency: "2.1",
                        followerToFollowing: "3.2"
                      });
                    }}>
                      <CheckCircle size={16} />
                      <span>Test Normal Account</span>
                    </button>
                  </div>
                </div>

                {/* Tips */}
                <div className="fraud-sidebar-section">
                  <h3 className="fraud-sidebar-title">Detection Tips</h3>
                  <div className="fraud-tips">
                    <div className="fraud-tip">
                      <Zap size={16} />
                      <span>Check for sudden follower spikes</span>
                    </div>
                    <div className="fraud-tip">
                      <Zap size={16} />
                      <span>Verify payment source authenticity</span>
                    </div>
                    <div className="fraud-tip">
                      <Zap size={16} />
                      <span>Monitor engagement quality, not just quantity</span>
                    </div>
                    <div className="fraud-tip">
                      <Zap size={16} />
                      <span>Review account creation patterns</span>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>

        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          .fraud-wrapper { width: 100%; background: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; min-height: 100vh; }
          
          /* Main Content */
          .fraud-main { padding: 40px 0; }
          .fraud-container { max-width: 1400px; margin: 0 auto; padding: 0 20px; }
          .fraud-layout { display: grid; grid-template-columns: 1fr 350px; gap: 32px; }
          
          /* Content Area */
          .fraud-content { display: flex; flex-direction: column; gap: 24px; }
          
          /* Header Card */
          .fraud-header-card { background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); border-radius: 12px; padding: 32px; color: white; }
          .fraud-header-content { display: flex; align-items: center; gap: 16px; }
          .fraud-header-icon { width: 64px; height: 64px; background: rgba(255,255,255,0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
          .fraud-header-title { font-size: 28px; font-weight: 700; color: white; margin-bottom: 8px; }
          .fraud-header-subtitle { font-size: 16px; color: rgba(255,255,255,0.9); }
          
          /* Tabs */
          .fraud-tabs { display: flex; gap: 8px; background: white; padding: 8px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
          .fraud-tab-btn { flex: 1; padding: 12px 16px; background: transparent; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; color: #64748b; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; }
          .fraud-tab-btn:hover { background: #f1f5f9; color: #3B82F6; }
          .fraud-tab-btn.active { background: #3B82F6; color: white; }
          
          /* Input Card */
          .fraud-input-card { background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
          .fraud-input-header { margin-bottom: 24px; }
          .fraud-input-title { font-size: 20px; font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 8px; }
          
          .fraud-input-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 24px; }
          .fraud-input-group { display: flex; flex-direction: column; gap: 8px; }
          .fraud-input-label { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: #374151; }
          .fraud-input { padding: 12px 16px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 15px; transition: 0.2s; }
          .fraud-input:focus { outline: none; border-color: #3B82F6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
          
          .fraud-checkbox-group { grid-column: span 2; }
          .fraud-checkbox-label { display: flex; align-items: center; gap: 12px; cursor: pointer; }
          .fraud-checkbox { display: none; }
          .fraud-checkmark { width: 20px; height: 20px; border: 2px solid #d1d5db; border-radius: 4px; position: relative; }
          .fraud-checkbox:checked + .fraud-checkmark { background-color: #3B82F6; border-color: #3B82F6; }
          .fraud-checkbox:checked + .fraud-checkmark:after { content: ''; position: absolute; left: 6px; top: 2px; width: 5px; height: 10px; border: solid white; border-width: 0 2px 2px 0; transform: rotate(45deg); }
          .fraud-checkbox-text { font-size: 14px; font-weight: 500; color: #374151; }
          
          /* Analyze Button */
          .fraud-analyze-btn { width: 100%; padding: 16px; background: #3B82F6; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: 0.3s; display: flex; align-items: center; justify-content: center; gap: 8px; }
          .fraud-analyze-btn:hover:not(:disabled) { background: #2563eb; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }
          .fraud-analyze-btn:disabled { opacity: 0.7; cursor: not-allowed; }
          .fraud-analyze-btn.loading { background: #3B82F6; }
          .fraud-spinner { width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
          
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          
          /* Results Card */
          .fraud-result-card { background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
          .fraud-result-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
          .fraud-result-title { font-size: 20px; font-weight: 700; color: #1e293b; }
          .fraud-status-badge { display: flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 20px; color: white; font-size: 14px; font-weight: 600; }
          
          /* Score Display */
          .fraud-score-display { display: grid; grid-template-columns: 1fr 2fr; gap: 32px; align-items: center; }
          .fraud-score-circle { position: relative; width: 150px; height: 150px; }
          .fraud-score-circle-bg { width: 100%; height: 100%; border-radius: 50%; position: relative; }
          .fraud-score-circle-inner { position: absolute; top: 10px; left: 10px; right: 10px; bottom: 10px; background: white; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; }
          .fraud-score-value { font-size: 32px; font-weight: 700; color: #1e293b; }
          .fraud-score-label { font-size: 14px; color: #64748b; }
          
          /* Details */
          .fraud-details-title { font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 16px; }
          .fraud-details-list { display: flex; flex-direction: column; gap: 16px; }
          .fraud-detail-item { display: flex; align-items: center; gap: 16px; padding: 16px; background: #f8fafc; border-radius: 8px; }
          .fraud-detail-icon { width: 40px; height: 40px; background: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #3B82F6; }
          .fraud-detail-content { flex: 1; }
          .fraud-detail-label { font-size: 14px; color: #64748b; margin-bottom: 4px; }
          .fraud-detail-value { font-size: 15px; font-weight: 600; color: #1e293b; }
          
          .fraud-risk-indicator { padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; }
          .fraud-risk-high { background: #fee2e2; color: #dc2626; }
          .fraud-risk-medium { background: #fef3c7; color: #d97706; }
          .fraud-risk-low { background: #d1fae5; color: #059669; }
          
          /* Recommendations */
          .fraud-recommendations { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
          .fraud-recommendations-title { font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 16px; }
          .fraud-recommendations-content { display: flex; flex-direction: column; gap: 12px; }
          .fraud-recommendation { display: flex; align-items: flex-start; gap: 12px; padding: 12px; background: #f8fafc; border-radius: 8px; }
          .fraud-recommendation svg { color: #3B82F6; margin-top: 2px; }
          .fraud-recommendation span { font-size: 14px; color: #475569; }
          
          /* History */
          .fraud-history-card { background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
          .fraud-history-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
          .fraud-history-title { font-size: 20px; font-weight: 700; color: #1e293b; }
          .fraud-history-count { font-size: 14px; color: #64748b; background: #f1f5f9; padding: 4px 12px; border-radius: 6px; }
          
          .fraud-history-list { display: flex; flex-direction: column; gap: 12px; }
          .fraud-history-item { display: flex; justify-content: space-between; align-items: center; padding: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; }
          .fraud-history-main { display: flex; flex-direction: column; gap: 4px; }
          .fraud-history-username { font-size: 15px; font-weight: 600; color: #1e293b; }
          .fraud-history-time { display: flex; align-items: center; gap: 4px; font-size: 12px; color: #94a3b8; }
          
          .fraud-history-metrics { display: flex; align-items: center; gap: 16px; }
          .fraud-history-score { display: flex; align-items: baseline; gap: 2px; }
          .fraud-history-score-value { font-size: 20px; font-weight: 700; color: #1e293b; }
          .fraud-history-score-label { font-size: 12px; color: #64748b; }
          
          .fraud-history-status { padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; }
          .fraud-status-high-risk { background: #fee2e2; color: #dc2626; }
          .fraud-status-medium-risk { background: #fef3c7; color: #d97706; }
          .fraud-status-low-risk { background: #d1fae5; color: #059669; }
          .fraud-status-normal { background: #dbeafe; color: #3B82F6; }
          
          /* Indicators */
          .fraud-indicators-card { background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
          .fraud-indicators-header { margin-bottom: 32px; }
          .fraud-indicators-title { font-size: 20px; font-weight: 700; color: #1e293b; margin-bottom: 8px; }
          .fraud-indicators-subtitle { font-size: 15px; color: #64748b; }
          
          .fraud-indicators-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
          .fraud-indicator-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; }
          .fraud-indicator-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
          .fraud-indicator-icon { width: 40px; height: 40px; background: rgba(239, 68, 68, 0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #EF4444; }
          .fraud-indicator-title { font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 8px; }
          .fraud-indicator-description { font-size: 13px; color: #64748b; }
          
          /* Sidebar */
          .fraud-sidebar { position: sticky; top: 20px; height: fit-content; display: flex; flex-direction: column; gap: 20px; }
          
          /* Sidebar Sections */
          .fraud-sidebar-section { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
          .fraud-sidebar-title { font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 16px; }
          
          /* Stats */
          .fraud-stats { display: flex; flex-direction: column; gap: 16px; }
          .fraud-stat { display: flex; gap: 16px; align-items: center; }
          .fraud-stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
          .fraud-stat-content { flex: 1; }
          .fraud-stat-value { font-size: 18px; font-weight: 700; color: #1e293b; margin-bottom: 2px; }
          .fraud-stat-label { font-size: 13px; color: #64748b; }
          
          /* Actions */
          .fraud-actions { display: flex; flex-direction: column; gap: 8px; }
          .fraud-action { padding: 12px 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; display: flex; align-items: center; gap: 12px; color: #475569; font-size: 14px; cursor: pointer; transition: 0.2s; }
          .fraud-action:hover { background: #e2e8f0; border-color: #cbd5e1; color: #3B82F6; }
          
          /* Tips */
          .fraud-tips { display: flex; flex-direction: column; gap: 12px; }
          .fraud-tip { display: flex; gap: 12px; }
          .fraud-tip svg { color: #F59E0B; flex-shrink: 0; margin-top: 2px; }
          .fraud-tip span { font-size: 13px; color: #64748b; }
          
          /* Responsive Design */
          @media (max-width: 1200px) {
            .fraud-layout { grid-template-columns: 1fr; }
            .fraud-sidebar { position: relative; }
            .fraud-score-display { grid-template-columns: 1fr; }
            .fraud-indicators-grid { grid-template-columns: 1fr; }
            .fraud-input-grid { grid-template-columns: 1fr; }
          }
          
          @media (max-width: 768px) {
            .fraud-main { padding: 20px 0; }
            .fraud-tabs { flex-wrap: wrap; }
            .fraud-tab-btn { flex: 1 0 calc(50% - 8px); }
            .fraud-header-card { padding: 24px; }
            .fraud-header-title { font-size: 24px; }
            .fraud-result-header { flex-direction: column; gap: 12px; align-items: stretch; }
            .fraud-status-badge { align-self: flex-start; }
          }
          
          @media (max-width: 640px) {
            .fraud-header-content { flex-direction: column; text-align: center; gap: 16px; }
            .fraud-header-icon { width: 56px; height: 56px; }
            .fraud-input-card { padding: 24px; }
          }
        `}</style>
      </div>
    </>
  );
}