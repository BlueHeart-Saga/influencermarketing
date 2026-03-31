// import React, { useState, useEffect } from "react";
// import "../style/EngagementCalculator.css";
// import HomeTopBar from "../pages/HomePage/HomeTopBar";

// export default function EngagementCalculator() {
//   const [inputs, setInputs] = useState({
//     likes: "",
//     comments: "",
//     followers: "",
//     views: "",
//   });
//   const [result, setResult] = useState(null);
//   const [category, setCategory] = useState("");
//   const [history, setHistory] = useState([]);
//   const [activeTab, setActiveTab] = useState("calculator");

//   useEffect(() => {
//     // Load history from localStorage if available
//     const savedHistory = localStorage.getItem("engagementHistory");
//     if (savedHistory) {
//       setHistory(JSON.parse(savedHistory));
//     }
//   }, []);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setInputs((prev) => ({ ...prev, [name]: value }));
//   };

//   const calculateEngagement = () => {
//     const likesNum = Number(inputs.likes) || 0;
//     const commentsNum = Number(inputs.comments) || 0;
//     const followersNum = Number(inputs.followers);
//     const viewsNum = Number(inputs.views) || 0;

//     if (followersNum <= 0 || isNaN(followersNum)) {
//       alert("Please enter a valid number of followers (greater than 0)");
//       return;
//     }

//     // Different calculation methods
//     const standardER = ((likesNum + commentsNum) / followersNum) * 100;
//     const viewsER = viewsNum ? ((likesNum + commentsNum) / viewsNum) * 100 : null;
//     const totalInteractions = likesNum + commentsNum;

//     let engagementCategory = "";
//     if (standardER >= 8) engagementCategory = "Exceptional";
//     else if (standardER >= 5) engagementCategory = "Excellent";
//     else if (standardER >= 3) engagementCategory = "Good";
//     else if (standardER >= 1) engagementCategory = "Average";
//     else engagementCategory = "Low";

//     const newResult = {
//       standardER: standardER.toFixed(2),
//       viewsER: viewsER ? viewsER.toFixed(2) : null,
//       totalInteractions,
//       followers: followersNum,
//       category: engagementCategory,
//       timestamp: new Date().toLocaleString(),
//     };

//     setResult(newResult);
//     setCategory(engagementCategory);

//     // Save to history
//     const newHistory = [newResult, ...history.slice(0, 9)]; // Keep last 10 calculations
//     setHistory(newHistory);
//     localStorage.setItem("engagementHistory", JSON.stringify(newHistory));
//   };

//   const clearHistory = () => {
//     setHistory([]);
//     localStorage.removeItem("engagementHistory");
//   };

//   const formatNumber = (num) => {
//     if (num >= 1000000) {
//       return (num / 1000000).toFixed(1) + 'M';
//     } else if (num >= 1000) {
//       return (num / 1000).toFixed(1) + 'K';
//     }
//     return num;
//   };

//   return (
//     <><HomeTopBar />
//     <div className="engagement-container">
//       <header className="engagement-header">
//         <h1 className="engagement-title">Engagement Rate Calculator</h1>
//         <p className="engagement-subtitle">
//           Measure and analyze influencer engagement performance accurately
//         </p>
//       </header>

//       <div className="engagement-tabs">
//         <button 
//           className={`tab-button ${activeTab === "calculator" ? "active" : ""}`}
//           onClick={() => setActiveTab("calculator")}
//         >
//           Calculator
//         </button>
//         <button 
//           className={`tab-button ${activeTab === "history" ? "active" : ""}`}
//           onClick={() => setActiveTab("history")}
//         >
//           History {history.length > 0 && <span className="badge">{history.length}</span>}
//         </button>
//         <button 
//           className={`tab-button ${activeTab === "guide" ? "active" : ""}`}
//           onClick={() => setActiveTab("guide")}
//         >
//           Guide
//         </button>
//       </div>

//       {activeTab === "calculator" && (
//         <>
//           <div className="calc-card">
//             <div className="calc-form">
//               <div className="input-group">
//                 <label>Followers</label>
//                 <input
//                   type="number"
//                   min="1"
//                   name="followers"
//                   placeholder="Enter follower count"
//                   value={inputs.followers}
//                   onChange={handleChange}
//                   className="calc-input"
//                 />
//               </div>

//               <div className="input-group">
//                 <label>Likes</label>
//                 <input
//                   type="number"
//                   min="0"
//                   name="likes"
//                   placeholder="Enter like count"
//                   value={inputs.likes}
//                   onChange={handleChange}
//                   className="calc-input"
//                 />
//               </div>

//               <div className="input-group">
//                 <label>Comments</label>
//                 <input
//                   type="number"
//                   min="0"
//                   name="comments"
//                   placeholder="Enter comment count"
//                   value={inputs.comments}
//                   onChange={handleChange}
//                   className="calc-input"
//                 />
//               </div>

//               <div className="input-group">
//                 <label>Views (Optional)</label>
//                 <input
//                   type="number"
//                   min="0"
//                   name="views"
//                   placeholder="Enter view count (for videos)"
//                   value={inputs.views}
//                   onChange={handleChange}
//                   className="calc-input"
//                 />
//               </div>

//               <button 
//                 onClick={calculateEngagement}
//                 className="calculate-btn"
//                 disabled={!inputs.followers}
//               >
//                 Calculate Engagement Rate
//               </button>
//             </div>

//             {result !== null && (
//               <div className="result-container">
//                 <h3 className="result-title">Engagement Analysis</h3>
                
//                 <div className="metrics-grid">
//                   <div className="metric-card">
//                     <span className="metric-value">{result.standardER}%</span>
//                     <span className="metric-label">Engagement Rate</span>
//                   </div>
                  
//                   {result.viewsER && (
//                     <div className="metric-card">
//                       <span className="metric-value">{result.viewsER}%</span>
//                       <span className="metric-label">Based on Views</span>
//                     </div>
//                   )}
                  
//                   <div className="metric-card">
//                     <span className="metric-value">{formatNumber(result.totalInteractions)}</span>
//                     <span className="metric-label">Total Interactions</span>
//                   </div>
//                 </div>
                
//                 <div className="category-result">
//                   <span className="category-label">Engagement Quality:</span>
//                   <span className={`category-value ${category.toLowerCase()}`}>
//                     {category}
//                   </span>
//                 </div>
                
//                 <div className="engagement-scale">
//                   <div className="scale-labels">
//                     <span>Low (&lt;1%)</span>
//                     <span>Average (1-3%)</span>
//                     <span>Good (3-5%)</span>
//                     <span>Excellent (5-8%)</span>
//                     <span>Exceptional (&gt;8%)</span>
//                   </div>
//                   <div className="scale-bar">
//                     <div 
//                       className="scale-indicator" 
//                       style={{ left: `${Math.min(result.standardER, 10)}0%` }}
//                     ></div>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </>
//       )}

//       {activeTab === "history" && (
//         <div className="history-container">
//           <div className="history-header">
//             <h2>Calculation History</h2>
//             {history.length > 0 && (
//               <button onClick={clearHistory} className="clear-history-btn">
//                 Clear History
//               </button>
//             )}
//           </div>
          
//           {history.length === 0 ? (
//             <p className="no-history">No calculations yet. Your history will appear here.</p>
//           ) : (
//             <div className="history-list">
//               {history.map((item, index) => (
//                 <div key={index} className="history-item">
//                   <div className="history-main">
//                     <span className="history-er">{item.standardER}%</span>
//                     <span className={`history-category ${item.category.toLowerCase()}`}>
//                       {item.category}
//                     </span>
//                   </div>
//                   <div className="history-details">
//                     <span>{item.timestamp}</span>
//                     <span>{formatNumber(item.followers)} followers</span>
//                     <span>{formatNumber(item.totalInteractions)} interactions</span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       )}

//       {activeTab === "guide" && (
//         <div className="guide-container">
//           <h2>Understanding Engagement Rates</h2>
          
//           <div className="guide-content">
//             <div className="guide-section">
//               <h3>What is Engagement Rate?</h3>
//               <p>
//                 Engagement rate is a metric that measures the level of interaction your content receives 
//                 relative to your audience size. It's calculated as the sum of likes and comments divided 
//                 by your number of followers, expressed as a percentage.
//               </p>
//             </div>
            
//             <div className="guide-section">
//               <h3>Industry Benchmarks</h3>
//               <div className="benchmarks">
//                 <div className="benchmark-item">
//                   <span className="benchmark-dot low"></span>
//                   <span className="benchmark-range">Below 1%</span>
//                   <span className="benchmark-label">Low Engagement</span>
//                 </div>
//                 <div className="benchmark-item">
//                   <span className="benchmark-dot average"></span>
//                   <span className="benchmark-range">1% - 3%</span>
//                   <span className="benchmark-label">Average Engagement</span>
//                 </div>
//                 <div className="benchmark-item">
//                   <span className="benchmark-dot good"></span>
//                   <span className="benchmark-range">3% - 5%</span>
//                   <span className="benchmark-label">Good Engagement</span>
//                 </div>
//                 <div className="benchmark-item">
//                   <span className="benchmark-dot excellent"></span>
//                   <span className="benchmark-range">5% - 8%</span>
//                   <span className="benchmark-label">Excellent Engagement</span>
//                 </div>
//                 <div className="benchmark-item">
//                   <span className="benchmark-dot exceptional"></span>
//                   <span className="benchmark-range">Above 8%</span>
//                   <span className="benchmark-label">Exceptional Engagement</span>
//                 </div>
//               </div>
//             </div>
            
//             <div className="guide-section">
//               <h3>Tips to Improve Engagement</h3>
//               <ul>
//                 <li>Post consistently but focus on quality over quantity</li>
//                 <li>Use high-quality visuals and videos</li>
//                 <li>Ask questions in your captions to encourage comments</li>
//                 <li>Respond to comments to foster community</li>
//                 <li>Use relevant hashtags to reach a wider audience</li>
//                 <li>Post at optimal times when your audience is most active</li>
//               </ul>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//     </>
//   );
// }


import React, { useState, useEffect } from 'react';
import { 
  Calculator, History, BookOpen, TrendingUp,
  Users, Heart, MessageSquare, Eye,
  Zap, Target, BarChart3, Clock,
  ChevronRight, CheckCircle, AlertCircle
} from 'lucide-react';
import HomeTopBar from "../pages/HomePage/HomeTopBar";

export default function EngagementCalculator() {
  const [inputs, setInputs] = useState({
    likes: "",
    comments: "",
    followers: "",
    views: "",
  });
  const [result, setResult] = useState(null);
  const [category, setCategory] = useState("");
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("calculator");

  useEffect(() => {
    const savedHistory = localStorage.getItem("engagementHistory");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const calculateEngagement = () => {
    const likesNum = Number(inputs.likes) || 0;
    const commentsNum = Number(inputs.comments) || 0;
    const followersNum = Number(inputs.followers);
    const viewsNum = Number(inputs.views) || 0;

    if (followersNum <= 0 || isNaN(followersNum)) {
      alert("Please enter a valid number of followers (greater than 0)");
      return;
    }

    const standardER = ((likesNum + commentsNum) / followersNum) * 100;
    const viewsER = viewsNum ? ((likesNum + commentsNum) / viewsNum) * 100 : null;
    const totalInteractions = likesNum + commentsNum;

    let engagementCategory = "";
    if (standardER >= 8) engagementCategory = "Exceptional";
    else if (standardER >= 5) engagementCategory = "Excellent";
    else if (standardER >= 3) engagementCategory = "Good";
    else if (standardER >= 1) engagementCategory = "Average";
    else engagementCategory = "Low";

    const newResult = {
      standardER: standardER.toFixed(2),
      viewsER: viewsER ? viewsER.toFixed(2) : null,
      totalInteractions,
      followers: followersNum,
      category: engagementCategory,
      timestamp: new Date().toLocaleString(),
    };

    setResult(newResult);
    setCategory(engagementCategory);

    const newHistory = [newResult, ...history.slice(0, 9)];
    setHistory(newHistory);
    localStorage.setItem("engagementHistory", JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("engagementHistory");
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num;
  };

  return (
    <>
      <HomeTopBar />
      <div className="engage-wrapper">
        {/* Main Content */}
        <div className="engage-main">
          <div className="engage-container">
            <div className="engage-layout">
              {/* Main Content Area */}
              <main className="engage-content">
                {/* Tabs Navigation */}
                <div className="engage-tabs">
                  <button 
                    className={`engage-tab-btn ${activeTab === "calculator" ? 'active' : ''}`}
                    onClick={() => setActiveTab("calculator")}
                  >
                    <Calculator size={18} />
                    <span>Calculator</span>
                  </button>
                  <button 
                    className={`engage-tab-btn ${activeTab === "history" ? 'active' : ''}`}
                    onClick={() => setActiveTab("history")}
                  >
                    <History size={18} />
                    <span>History {history.length > 0 && <span className="engage-badge">{history.length}</span>}</span>
                  </button>
                  <button 
                    className={`engage-tab-btn ${activeTab === "guide" ? 'active' : ''}`}
                    onClick={() => setActiveTab("guide")}
                  >
                    <BookOpen size={18} />
                    <span>Guide</span>
                  </button>
                </div>

                {/* Calculator Tab */}
                {activeTab === "calculator" && (
                  <div className="engage-calculator">
                    <div className="engage-calc-card">
                      <div className="engage-calc-header">
                        <h2 className="engage-calc-title">Engagement Rate Calculator</h2>
                        <p className="engage-calc-subtitle">Measure and analyze influencer engagement performance accurately</p>
                      </div>

                      <div className="engage-calc-grid">
                        <div className="engage-input-group">
                          <label className="engage-label">
                            <Users size={16} />
                            <span>Followers</span>
                          </label>
                          <input
                            type="number"
                            min="1"
                            name="followers"
                            placeholder="Enter follower count"
                            value={inputs.followers}
                            onChange={handleChange}
                            className="engage-input"
                          />
                        </div>

                        <div className="engage-input-group">
                          <label className="engage-label">
                            <Heart size={16} />
                            <span>Likes</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            name="likes"
                            placeholder="Enter like count"
                            value={inputs.likes}
                            onChange={handleChange}
                            className="engage-input"
                          />
                        </div>

                        <div className="engage-input-group">
                          <label className="engage-label">
                            <MessageSquare size={16} />
                            <span>Comments</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            name="comments"
                            placeholder="Enter comment count"
                            value={inputs.comments}
                            onChange={handleChange}
                            className="engage-input"
                          />
                        </div>

                        <div className="engage-input-group">
                          <label className="engage-label">
                            <Eye size={16} />
                            <span>Views (Optional)</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            name="views"
                            placeholder="Enter view count (for videos)"
                            value={inputs.views}
                            onChange={handleChange}
                            className="engage-input"
                          />
                        </div>
                      </div>

                      <button 
                        onClick={calculateEngagement}
                        className="engage-calc-btn"
                        disabled={!inputs.followers}
                      >
                        <Calculator size={18} />
                        <span>Calculate Engagement Rate</span>
                      </button>

                      {result !== null && (
                        <div className="engage-result">
                          <h3 className="engage-result-title">Engagement Analysis</h3>
                          
                          <div className="engage-metrics">
                            <div className="engage-metric-card">
                              <div className="engage-metric-value">{result.standardER}%</div>
                              <div className="engage-metric-label">Engagement Rate</div>
                            </div>
                            
                            {result.viewsER && (
                              <div className="engage-metric-card">
                                <div className="engage-metric-value">{result.viewsER}%</div>
                                <div className="engage-metric-label">Based on Views</div>
                              </div>
                            )}
                            
                            <div className="engage-metric-card">
                              <div className="engage-metric-value">{formatNumber(result.totalInteractions)}</div>
                              <div className="engage-metric-label">Total Interactions</div>
                            </div>
                          </div>
                          
                          <div className="engage-category">
                            <span className="engage-category-label">Engagement Quality:</span>
                            <span className={`engage-category-value ${category.toLowerCase()}`}>
                              {category}
                            </span>
                          </div>
                          
                          <div className="engage-scale">
                            <div className="engage-scale-labels">
                              <span>Low (&lt;1%)</span>
                              <span>Average (1-3%)</span>
                              <span>Good (3-5%)</span>
                              <span>Excellent (5-8%)</span>
                              <span>Exceptional (&gt;8%)</span>
                            </div>
                            <div className="engage-scale-bar">
                              <div 
                                className="engage-scale-indicator" 
                                style={{ left: `${Math.min(result.standardER, 10)}0%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* History Tab */}
                {activeTab === "history" && (
                  <div className="engage-history">
                    <div className="engage-history-card">
                      <div className="engage-history-header">
                        <h2 className="engage-history-title">Calculation History</h2>
                        {history.length > 0 && (
                          <button onClick={clearHistory} className="engage-clear-btn">
                            Clear History
                          </button>
                        )}
                      </div>
                      
                      {history.length === 0 ? (
                        <div className="engage-empty">
                          <History size={48} />
                          <p>No calculations yet. Your history will appear here.</p>
                        </div>
                      ) : (
                        <div className="engage-history-list">
                          {history.map((item, index) => (
                            <div key={index} className="engage-history-item">
                              <div className="engage-history-main">
                                <div className="engage-history-metric">
                                  <div className="engage-history-value">{item.standardER}%</div>
                                  <div className={`engage-history-category ${item.category.toLowerCase()}`}>
                                    {item.category}
                                  </div>
                                </div>
                                <div className="engage-history-time">
                                  <Clock size={14} />
                                  <span>{item.timestamp}</span>
                                </div>
                              </div>
                              <div className="engage-history-details">
                                <div className="engage-history-detail">
                                  <Users size={14} />
                                  <span>{formatNumber(item.followers)} followers</span>
                                </div>
                                <div className="engage-history-detail">
                                  <Zap size={14} />
                                  <span>{formatNumber(item.totalInteractions)} interactions</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Guide Tab */}
                {activeTab === "guide" && (
                  <div className="engage-guide">
                    <div className="engage-guide-card">
                      <h2 className="engage-guide-title">Understanding Engagement Rates</h2>
                      
                      <div className="engage-guide-content">
                        <div className="engage-guide-section">
                          <h3>What is Engagement Rate?</h3>
                          <p>
                            Engagement rate is a metric that measures the level of interaction your content receives 
                            relative to your audience size. It's calculated as the sum of likes and comments divided 
                            by your number of followers, expressed as a percentage.
                          </p>
                        </div>
                        
                        <div className="engage-guide-section">
                          <h3>Industry Benchmarks</h3>
                          <div className="engage-benchmarks">
                            {[
                              { range: "Below 1%", label: "Low Engagement", color: "low" },
                              { range: "1% - 3%", label: "Average Engagement", color: "average" },
                              { range: "3% - 5%", label: "Good Engagement", color: "good" },
                              { range: "5% - 8%", label: "Excellent Engagement", color: "excellent" },
                              { range: "Above 8%", label: "Exceptional Engagement", color: "exceptional" }
                            ].map((benchmark, index) => (
                              <div key={index} className="engage-benchmark">
                                <div className={`engage-benchmark-dot ${benchmark.color}`}></div>
                                <div className="engage-benchmark-content">
                                  <div className="engage-benchmark-range">{benchmark.range}</div>
                                  <div className="engage-benchmark-label">{benchmark.label}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="engage-guide-section">
                          <h3>Tips to Improve Engagement</h3>
                          <div className="engage-tips">
                            {[
                              "Post consistently but focus on quality over quantity",
                              "Use high-quality visuals and videos",
                              "Ask questions in your captions to encourage comments",
                              "Respond to comments to foster community",
                              "Use relevant hashtags to reach a wider audience",
                              "Post at optimal times when your audience is most active"
                            ].map((tip, index) => (
                              <div key={index} className="engage-tip">
                                <CheckCircle size={16} />
                                <span>{tip}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </main>

              {/* Sidebar */}
              <aside className="engage-sidebar">
                {/* Quick Stats */}
                <div className="engage-sidebar-section">
                  <h3 className="engage-sidebar-title">Engagement Insights</h3>
                  <div className="engage-insights">
                    <div className="engage-insight">
                      <Target size={16} />
                      <div>
                        <div className="engage-insight-value">3-5%</div>
                        <div className="engage-insight-label">Good Engagement Rate</div>
                      </div>
                    </div>
                    <div className="engage-insight">
                      <TrendingUp size={16} />
                      <div>
                        <div className="engage-insight-value">8%+</div>
                        <div className="engage-insight-label">Exceptional Rate</div>
                      </div>
                    </div>
                    <div className="engage-insight">
                      <BarChart3 size={16} />
                      <div>
                        <div className="engage-insight-value">2.5%</div>
                        <div className="engage-insight-label">Industry Average</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="engage-sidebar-section">
                  <h3 className="engage-sidebar-title">Quick Actions</h3>
                  <div className="engage-actions">
                    <button className="engage-action" onClick={() => setActiveTab("calculator")}>
                      <Calculator size={16} />
                      <span>New Calculation</span>
                    </button>
                    <button className="engage-action" onClick={() => {
                      setInputs({ likes: "1200", comments: "45", followers: "50000", views: "15000" });
                      setTimeout(calculateEngagement, 100);
                    }}>
                      <Zap size={16} />
                      <span>Try Example</span>
                    </button>
                    <button className="engage-action" onClick={() => setActiveTab("guide")}>
                      <BookOpen size={16} />
                      <span>View Guide</span>
                    </button>
                    <button className="engage-action" onClick={() => setActiveTab("history")}>
                      <History size={16} />
                      <span>View History</span>
                    </button>
                  </div>
                </div>

                {/* Tips */}
                <div className="engage-sidebar-section">
                  <h3 className="engage-sidebar-title">Quick Tips</h3>
                  <div className="engage-tips-sidebar">
                    <div className="engage-tip-sidebar">
                      <AlertCircle size={16} />
                      <span>Higher engagement rates increase content visibility</span>
                    </div>
                    <div className="engage-tip-sidebar">
                      <AlertCircle size={16} />
                      <span>Video content typically has higher engagement</span>
                    </div>
                    <div className="engage-tip-sidebar">
                      <AlertCircle size={16} />
                      <span>Consistency is key for long-term engagement</span>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>

        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          .engage-wrapper { width: 100%; background: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; min-height: 100vh; }
          
          /* Main Content */
          .engage-main { padding: 40px 0; }
          .engage-container { max-width: 1400px; margin: 0 auto; padding: 0 20px; }
          .engage-layout { display: grid; grid-template-columns: 1fr 350px; gap: 32px; }
          
          /* Content Area */
          .engage-content { display: flex; flex-direction: column; gap: 24px; }
          
          /* Tabs */
          .engage-tabs { display: flex; gap: 8px; background: white; padding: 8px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
          .engage-tab-btn { flex: 1; padding: 12px 16px; background: transparent; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; color: #64748b; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; }
          .engage-tab-btn:hover { background: #f1f5f9; color: #3B82F6; }
          .engage-tab-btn.active { background: #3B82F6; color: white; }
          .engage-badge { background: #EF4444; color: white; padding: 2px 8px; border-radius: 10px; font-size: 12px; margin-left: 4px; }
          
          /* Calculator Card */
          .engage-calc-card { background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
          .engage-calc-header { margin-bottom: 32px; text-align: center; }
          .engage-calc-title { font-size: 24px; font-weight: 700; color: #1e293b; margin-bottom: 8px; }
          .engage-calc-subtitle { font-size: 15px; color: #64748b; }
          
          /* Input Grid */
          .engage-calc-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 24px; }
          .engage-input-group { display: flex; flex-direction: column; gap: 8px; }
          .engage-label { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: #374151; }
          .engage-input { padding: 12px 16px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 15px; transition: 0.2s; }
          .engage-input:focus { outline: none; border-color: #3B82F6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
          
          /* Calculate Button */
          .engage-calc-btn { width: 100%; padding: 16px; background: #3B82F6; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: 0.3s; display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 32px; }
          .engage-calc-btn:hover:not(:disabled) { background: #2563eb; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }
          .engage-calc-btn:disabled { opacity: 0.5; cursor: not-allowed; }
          
          /* Results */
          .engage-result { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; }
          .engage-result-title { font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 20px; }
          
          /* Metrics */
          .engage-metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 20px; }
          .engage-metric-card { background: white; border-radius: 8px; padding: 16px; text-align: center; }
          .engage-metric-value { font-size: 24px; font-weight: 700; color: #3B82F6; margin-bottom: 4px; }
          .engage-metric-label { font-size: 12px; color: #64748b; font-weight: 600; }
          
          /* Category */
          .engage-category { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; padding: 12px; background: white; border-radius: 8px; }
          .engage-category-label { font-size: 14px; color: #64748b; }
          .engage-category-value { padding: 4px 12px; border-radius: 6px; font-size: 14px; font-weight: 600; }
          .engage-category-value.low { background: #fee2e2; color: #dc2626; }
          .engage-category-value.average { background: #fef3c7; color: #d97706; }
          .engage-category-value.good { background: #d1fae5; color: #059669; }
          .engage-category-value.excellent { background: #dbeafe; color: #3B82F6; }
          .engage-category-value.exceptional { background: #ede9fe; color: #7c3aed; }
          
          /* Scale */
          .engage-scale { margin-top: 20px; }
          .engage-scale-labels { display: flex; justify-content: space-between; font-size: 11px; color: #64748b; margin-bottom: 8px; }
          .engage-scale-bar { height: 6px; background: #e2e8f0; border-radius: 3px; position: relative; }
          .engage-scale-indicator { position: absolute; top: -4px; width: 14px; height: 14px; background: #3B82F6; border-radius: 50%; transform: translateX(-50%); }
          
          /* History */
          .engage-history-card { background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
          .engage-history-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
          .engage-history-title { font-size: 20px; font-weight: 700; color: #1e293b; }
          .engage-clear-btn { padding: 8px 16px; background: #fee2e2; color: #dc2626; border: none; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; }
          
          .engage-empty { text-align: center; padding: 48px 24px; color: #94a3b8; }
          .engage-empty svg { color: #cbd5e1; margin-bottom: 16px; }
          
          .engage-history-list { display: flex; flex-direction: column; gap: 12px; }
          .engage-history-item { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; }
          .engage-history-main { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
          .engage-history-metric { display: flex; align-items: center; gap: 12px; }
          .engage-history-value { font-size: 20px; font-weight: 700; color: #3B82F6; }
          .engage-history-category { padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }
          .engage-history-category.low { background: #fee2e2; color: #dc2626; }
          .engage-history-category.average { background: #fef3c7; color: #d97706; }
          .engage-history-category.good { background: #d1fae5; color: #059669; }
          .engage-history-category.excellent { background: #dbeafe; color: #3B82F6; }
          .engage-history-category.exceptional { background: #ede9fe; color: #7c3aed; }
          
          .engage-history-time { display: flex; align-items: center; gap: 4px; font-size: 12px; color: #94a3b8; }
          
          .engage-history-details { display: flex; gap: 16px; }
          .engage-history-detail { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #64748b; }
          
          /* Guide */
          .engage-guide-card { background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
          .engage-guide-title { font-size: 24px; font-weight: 700; color: #1e293b; margin-bottom: 24px; }
          
          .engage-guide-content { display: flex; flex-direction: column; gap: 32px; }
          .engage-guide-section h3 { font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 12px; }
          .engage-guide-section p { font-size: 15px; color: #64748b; line-height: 1.6; }
          
          .engage-benchmarks { display: flex; flex-direction: column; gap: 12px; }
          .engage-benchmark { display: flex; align-items: center; gap: 12px; padding: 12px; background: #f8fafc; border-radius: 8px; }
          .engage-benchmark-dot { width: 8px; height: 8px; border-radius: 50%; }
          .engage-benchmark-dot.low { background: #dc2626; }
          .engage-benchmark-dot.average { background: #d97706; }
          .engage-benchmark-dot.good { background: #059669; }
          .engage-benchmark-dot.excellent { background: #3B82F6; }
          .engage-benchmark-dot.exceptional { background: #7c3aed; }
          
          .engage-benchmark-content { flex: 1; }
          .engage-benchmark-range { font-size: 14px; font-weight: 600; color: #1e293b; }
          .engage-benchmark-label { font-size: 13px; color: #64748b; }
          
          .engage-tips { display: flex; flex-direction: column; gap: 8px; }
          .engage-tip { display: flex; align-items: flex-start; gap: 12px; padding: 8px; background: #f8fafc; border-radius: 8px; }
          .engage-tip svg { color: #10B981; margin-top: 2px; }
          .engage-tip span { font-size: 14px; color: #475569; }
          
          /* Sidebar */
          .engage-sidebar { position: sticky; top: 20px; height: fit-content; display: flex; flex-direction: column; gap: 20px; }
          
          /* Sidebar Sections */
          .engage-sidebar-section { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
          .engage-sidebar-title { font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 16px; }
          
          /* Insights */
          .engage-insights { display: flex; flex-direction: column; gap: 16px; }
          .engage-insight { display: flex; gap: 12px; }
          .engage-insight svg { color: #3B82F6; margin-top: 4px; }
          .engage-insight-value { font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 2px; }
          .engage-insight-label { font-size: 13px; color: #64748b; }
          
          /* Actions */
          .engage-actions { display: flex; flex-direction: column; gap: 8px; }
          .engage-action { padding: 12px 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; display: flex; align-items: center; gap: 12px; color: #475569; font-size: 14px; cursor: pointer; transition: 0.2s; }
          .engage-action:hover { background: #e2e8f0; border-color: #cbd5e1; color: #3B82F6; }
          
          /* Tips Sidebar */
          .engage-tips-sidebar { display: flex; flex-direction: column; gap: 12px; }
          .engage-tip-sidebar { display: flex; gap: 12px; }
          .engage-tip-sidebar svg { color: #F59E0B; flex-shrink: 0; margin-top: 2px; }
          .engage-tip-sidebar span { font-size: 13px; color: #64748b; }
          
          /* Responsive Design */
          @media (max-width: 1200px) {
            .engage-layout { grid-template-columns: 1fr; }
            .engage-sidebar { position: relative; }
            .engage-calc-grid { grid-template-columns: 1fr; }
            .engage-metrics { grid-template-columns: repeat(2, 1fr); }
          }
          
          @media (max-width: 768px) {
            .engage-main { padding: 20px 0; }
            .engage-tabs { flex-wrap: wrap; }
            .engage-tab-btn { flex: 1 0 calc(50% - 8px); }
            .engage-metrics { grid-template-columns: 1fr; }
            .engage-scale-labels { flex-wrap: wrap; gap: 4px; }
            .engage-scale-labels span { font-size: 10px; }
            .engage-history-header { flex-direction: column; gap: 12px; align-items: stretch; }
            .engage-clear-btn { align-self: flex-end; }
          }
        `}</style>
      </div>
    </>
  );
}