// import React, { useEffect, useRef, useState, useCallback } from "react";
// import Chart from "chart.js/auto";
// import "../style/BudgetPlanner.css";
// import HomeTopBar from "../pages/HomePage/HomeTopBar";

// export default function BudgetPlanner() {
//   const [totalBudget, setTotalBudget] = useState(100000);
//   const [budget, setBudget] = useState({
//     influencers: 40,
//     ads: 35,
//     tools: 25,
//   });
//   const [savedBudgets, setSavedBudgets] = useState([]);
//   const [activeTab, setActiveTab] = useState("planner");
//   const [currency, setCurrency] = useState("₹");

//   const canvasRef = useRef(null);
//   const chartInstanceRef = useRef(null);

//   // Memoize calculateAmount to prevent unnecessary recreations
//   const calculateAmount = useCallback((percent) => {
//     return Math.round((percent / 100) * totalBudget);
//   }, [totalBudget]);

//   useEffect(() => {
//     const ctx = canvasRef.current.getContext("2d");

//     if (chartInstanceRef.current) {
//       chartInstanceRef.current.destroy();
//     }

//     chartInstanceRef.current = new Chart(ctx, {
//       type: "doughnut",
//       data: {
//         labels: ["Influencers", "Ads", "Tools & Resources"],
//         datasets: [
//           {
//             data: [budget.influencers, budget.ads, budget.tools],
//             backgroundColor: ["#4F46E5", "#10B981", "#F59E0B"],
//             borderWidth: 0,
//             hoverOffset: 15,
//           },
//         ],
//       },
//       options: {
//         responsive: true,
//         cutout: "70%",
//         plugins: {
//           legend: { 
//             position: "bottom", 
//             labels: { 
//               font: { size: 14, family: "'Inter', sans-serif" },
//               padding: 20,
//               usePointStyle: true,
//               pointStyle: "circle"
//             } 
//           },
//           tooltip: { 
//             enabled: true,
//             backgroundColor: "rgba(0, 0, 0, 0.8)",
//             titleFont: { family: "'Inter', sans-serif" },
//             bodyFont: { family: "'Inter', sans-serif" },
//             callbacks: {
//               label: function(context) {
//                 const value = context.raw;
//                 const amount = calculateAmount(value);
//                 return `${context.label}: ${value}% (${currency}${amount.toLocaleString()})`;
//               }
//             }
//           },
//         },
//       },
//     });

//     return () => {
//       chartInstanceRef.current?.destroy();
//     };
//   }, [budget, currency, calculateAmount]); // Added calculateAmount to dependencies

//   const totalPercentage = budget.influencers + budget.ads + budget.tools;

//   const handleSaveBudget = () => {
//     const newSavedBudget = {
//       id: Date.now(),
//       name: `Budget ${savedBudgets.length + 1}`,
//       totalBudget,
//       distribution: {...budget},
//       date: new Date().toLocaleDateString()
//     };
//     setSavedBudgets([...savedBudgets, newSavedBudget]);
//   };

//   const handleLoadBudget = (loadedBudget) => {
//     setTotalBudget(loadedBudget.totalBudget);
//     setBudget({...loadedBudget.distribution});
//   };

//   const handleReset = () => {
//     setBudget({
//       influencers: 40,
//       ads: 35,
//       tools: 25,
//     });
//   };

//   return (
//     <><HomeTopBar />
//     <div className="budget-container">
//       <header className="budget-header">
//         <h1 className="budget-title">Marketing Budget Planner</h1>
//         <p className="budget-subtitle">
//           Strategically allocate your influencer marketing budget for maximum ROI
//         </p>
//       </header>

//       <div className="budget-tabs">
//         <button 
//           className={`tab-button ${activeTab === "planner" ? "active" : ""}`}
//           onClick={() => setActiveTab("planner")}
//         >
//           Budget Planner
//         </button>
//         <button 
//           className={`tab-button ${activeTab === "saved" ? "active" : ""}`}
//           onClick={() => setActiveTab("saved")}
//         >
//           Saved Budgets
//         </button>
//         <button 
//           className={`tab-button ${activeTab === "tips" ? "active" : ""}`}
//           onClick={() => setActiveTab("tips")}
//         >
//           Optimization Tips
//         </button>
//       </div>

//       {activeTab === "planner" && (
//         <>
//           <div className="budget-controls">
//             <div className="total-budget-input">
//               <label>Total Budget</label>
//               <div className="input-with-currency">
//                 <select 
//                   value={currency} 
//                   onChange={(e) => setCurrency(e.target.value)}
//                   className="currency-selector"
//                 >
//                   <option value="₹">₹</option>
//                   <option value="$">$</option>
//                   <option value="€">€</option>
//                   <option value="£">£</option>
//                 </select>
//                 <input
//                   type="number"
//                   value={totalBudget}
//                   onChange={(e) => setTotalBudget(Number(e.target.value))}
//                   className="budget-amount-input"
//                 />
//               </div>
//             </div>

//             <div className="action-buttons">
//               <button className="btn-secondary" onClick={handleReset}>
//                 Reset
//               </button>
//               <button className="btn-primary" onClick={handleSaveBudget}>
//                 Save Budget
//               </button>
//             </div>
//           </div>

//           <div className="budget-main">
//             <div className="chart-container">
//               <div className="chart-wrapper">
//                 <canvas ref={canvasRef} className="budget-chart"></canvas>
//                 <div className="chart-center-text">
//                   <span>Total</span>
//                   <span>{currency}{totalBudget.toLocaleString()}</span>
//                 </div>
//               </div>
//             </div>

//             <div className="budget-inputs">
//               {Object.entries(budget).map(([key, value]) => {
//                 const percentage = ((value / totalPercentage) * 100).toFixed(1);
//                 const amount = calculateAmount(value);
//                 const categoryNames = {
//                   influencers: "Influencer Collaborations",
//                   ads: "Advertising Spend",
//                   tools: "Tools & Resources"
//                 };

//                 return (
//                   <div className="input-group" key={key}>
//                     <div className="input-header">
//                       <label className="input-name">{categoryNames[key]}</label>
//                       <span className="input-value">
//                         {value}% • {currency}{amount.toLocaleString()}
//                       </span>
//                     </div>
//                     <input
//                       type="range"
//                       min="0"
//                       max="100"
//                       value={value}
//                       onChange={(e) =>
//                         setBudget({ ...budget, [key]: Number(e.target.value) })
//                       }
//                       className="range-slider"
//                     />
//                     <div className="progress-bar">
//                       <div
//                         className="progress-fill"
//                         style={{ width: `${percentage}%` }}
//                       ></div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>

//           <div className="budget-summary">
//             <div className="summary-card">
//               <h3>Budget Summary</h3>
//               <div className="summary-details">
//                 <div className="summary-item">
//                   <span>Total Allocation</span>
//                   <span>{totalPercentage}%</span>
//                 </div>
//                 <div className="summary-item total">
//                   <span>Total Budget</span>
//                   <span>{currency}{totalBudget.toLocaleString()}</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </>
//       )}

//       {activeTab === "saved" && (
//         <div className="saved-budgets">
//           <h2>Your Saved Budgets</h2>
//           {savedBudgets.length === 0 ? (
//             <p className="no-budgets">You haven't saved any budgets yet.</p>
//           ) : (
//             <div className="budget-cards">
//               {savedBudgets.map((saved) => (
//                 <div key={saved.id} className="budget-card">
//                   <div className="card-header">
//                     <h3>{saved.name}</h3>
//                     <span>{saved.date}</span>
//                   </div>
//                   <div className="card-details">
//                     <div className="card-total">
//                       {currency}{saved.totalBudget.toLocaleString()}
//                     </div>
//                     <div className="card-breakdown">
//                       <div className="breakdown-item">
//                         <span className="dot influencers"></span>
//                         <span>Influencers: {saved.distribution.influencers}%</span>
//                       </div>
//                       <div className="breakdown-item">
//                         <span className="dot ads"></span>
//                         <span>Ads: {saved.distribution.ads}%</span>
//                       </div>
//                       <div className="breakdown-item">
//                         <span className="dot tools"></span>
//                         <span>Tools: {saved.distribution.tools}%</span>
//                       </div>
//                     </div>
//                   </div>
//                   <button 
//                     className="card-button"
//                     onClick={() => handleLoadBudget(saved)}
//                   >
//                     Load Budget
//                   </button>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       )}

//       {activeTab === "tips" && (
//         <div className="tips-container">
//           <h2>Budget Optimization Tips</h2>
//           <div className="tips-grid">
//             <div className="tip-card">
//               <div className="tip-icon">💡</div>
//               <h3>Influencer Collaborations</h3>
//               <ul>
//                 <li>Micro-influencers often provide better engagement rates</li>
//                 <li>Consider performance-based compensation models</li>
//                 <li>Allocate budget for long-term partnerships</li>
//               </ul>
//             </div>
//             <div className="tip-card">
//               <div className="tip-icon">📊</div>
//               <h3>Advertising Spend</h3>
//               <ul>
//                 <li>A/B test ad creatives with small budgets first</li>
//                 <li>Focus on platforms where your audience is most active</li>
//                 <li>Retarget engaged users for higher conversion rates</li>
//               </ul>
//             </div>
//             <div className="tip-card">
//               <div className="tip-icon">🛠️</div>
//               <h3>Tools & Resources</h3>
//               <ul>
//                 <li>Invest in analytics tools to measure campaign performance</li>
//                 <li>Use management platforms to streamline influencer outreach</li>
//                 <li>Allocate budget for content creation assets</li>
//               </ul>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//     </>
//   );
// }


import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { 
  PieChart, Save, RefreshCw, Download,
  TrendingUp, Target, Settings, BookOpen,
  Users, DollarSign, AlertCircle,
  ChevronRight, Clock, Sparkles
} from 'lucide-react';
import { Wrench } from "lucide-react";

// import HomeTopBar from "../pages/HomePage/HomeTopBar";

export default function BudgetPlanner() {
  const [totalBudget, setTotalBudget] = useState(100000);
  const [budget, setBudget] = useState({
    influencers: 40,
    ads: 35,
    tools: 25,
  });
  const [savedBudgets, setSavedBudgets] = useState([]);
  const [activeTab, setActiveTab] = useState("planner");
  const [currency, setCurrency] = useState("₹");

  const canvasRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    chartInstanceRef.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Influencers", "Ads", "Tools & Resources"],
        datasets: [
          {
            data: [budget.influencers, budget.ads, budget],
            backgroundColor: ["#3B82F6", "#10B981", "#F59E0B"],
            borderWidth: 0,
            hoverOffset: 15,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "70%",
        plugins: {
          legend: { 
            display: false
          }
        }
      },
    });

    return () => {
      chartInstanceRef.current?.destroy();
    };
  }, [budget]);

  const calculateAmount = (percent) => {
    return Math.round((percent / 100) * totalBudget);
  };

  const totalPercentage = budget.influencers + budget.ads + budget;

  const handleSaveBudget = () => {
    const newSavedBudget = {
      id: Date.now(),
      name: `Budget ${savedBudgets.length + 1}`,
      totalBudget,
      distribution: {...budget},
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setSavedBudgets([...savedBudgets, newSavedBudget]);
  };

  const handleLoadBudget = (loadedBudget) => {
    setTotalBudget(loadedBudget.totalBudget);
    setBudget({...loadedBudget.distribution});
  };

  const handleReset = () => {
    setBudget({
      influencers: 40,
      ads: 35,
      tools: 25,
    });
  };

  const categoryNames = {
    influencers: "Influencer Collaborations",
    ads: "Advertising Spend",
    tools: "Tools & Resources"
  };

  const categoryIcons = {
    influencers: <Users size={20} />,
    ads: <TrendingUp size={20} />,
    tools: <Wrench size={20} />
  };

  const categoryColors = {
    influencers: "#3B82F6",
    ads: "#10B981",
    tools: "#F59E0B"
  };

  return (
    <>
      {/* <HomeTopBar /> */}
      <div className="budget-wrapper">
        {/* Main Content */}
        <div className="budget-main">
          <div className="budget-container">
            <div className="budget-layout">
              {/* Main Content Area */}
              <main className="budget-content">
                {/* Tabs Navigation */}
                <div className="budget-tabs">
                  <button 
                    className={`budget-tab-btn ${activeTab === "planner" ? 'active' : ''}`}
                    onClick={() => setActiveTab("planner")}
                  >
                    <PieChart size={18} />
                    <span>Budget Planner</span>
                  </button>
                  <button 
                    className={`budget-tab-btn ${activeTab === "saved" ? 'active' : ''}`}
                    onClick={() => setActiveTab("saved")}
                  >
                    <Save size={18} />
                    <span>Saved Budgets {savedBudgets.length > 0 && <span className="budget-badge">{savedBudgets.length}</span>}</span>
                  </button>
                  <button 
                    className={`budget-tab-btn ${activeTab === "tips" ? 'active' : ''}`}
                    onClick={() => setActiveTab("tips")}
                  >
                    <BookOpen size={18} />
                    <span>Optimization Tips</span>
                  </button>
                </div>

                {/* Planner Tab */}
                {activeTab === "planner" && (
                  <div className="budget-planner">
                    {/* Budget Controls */}
                    <div className="budget-controls-card">
                      <div className="budget-header">
                        <h2 className="budget-title">Marketing Budget Planner</h2>
                        <p className="budget-subtitle">Strategically allocate your influencer marketing budget for maximum ROI</p>
                      </div>
                      
                      <div className="budget-total-section">
                        <div className="budget-total-input">
                          <label className="budget-total-label">
                            <DollarSign size={16} />
                            <span>Total Budget</span>
                          </label>
                          <div className="budget-amount-wrapper">
                            <select 
                              value={currency} 
                              onChange={(e) => setCurrency(e.target.value)}
                              className="budget-currency"
                            >
                              <option value="₹">₹ INR</option>
                              <option value="$">$ USD</option>
                              <option value="€">€ EUR</option>
                              <option value="£">£ GBP</option>
                            </select>
                            <input
                              type="number"
                              value={totalBudget}
                              onChange={(e) => setTotalBudget(Number(e.target.value))}
                              className="budget-amount-input"
                              min="0"
                            />
                          </div>
                        </div>
                        
                        <div className="budget-actions">
                          <button className="budget-btn budget-btn-secondary" onClick={handleReset}>
                            <RefreshCw size={16} />
                            <span>Reset</span>
                          </button>
                          <button className="budget-btn budget-btn-primary" onClick={handleSaveBudget}>
                            <Save size={16} />
                            <span>Save Budget</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Main Planner Content */}
                    <div className="budget-planner-content">
                      {/* Chart Section */}
                      <div className="budget-chart-section">
                        <div className="budget-chart-card">
                          <div className="budget-chart-wrapper">
                            <canvas ref={canvasRef} height="300"></canvas>
                            <div className="budget-chart-center">
                              <div className="budget-chart-total">
                                {currency}{totalBudget.toLocaleString()}
                              </div>
                              <div className="budget-chart-label">Total Budget</div>
                            </div>
                          </div>
                          
                          <div className="budget-legend">
                            {Object.entries(budget).map(([key, value]) => (
                              <div key={key} className="budget-legend-item">
                                <div className="budget-legend-dot" style={{ backgroundColor: categoryColors[key] }}></div>
                                <div className="budget-legend-text">
                                  <span className="budget-legend-name">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                                  <span className="budget-legend-value">{value}%</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Sliders Section */}
                      <div className="budget-sliders-section">
                        <div className="budget-sliders-card">
                          <h3 className="budget-sliders-title">Budget Allocation</h3>
                          
                          {Object.entries(budget).map(([key, value]) => {
                            const amount = calculateAmount(value);
                            return (
                              <div className="budget-slider-group" key={key}>
                                <div className="budget-slider-header">
                                  <div className="budget-slider-info">
                                    <div className="budget-slider-icon" style={{ color: categoryColors[key] }}>
                                      {categoryIcons[key]}
                                    </div>
                                    <div>
                                      <div className="budget-slider-name">{categoryNames[key]}</div>
                                      <div className="budget-slider-amount">
                                        {currency}{amount.toLocaleString()}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="budget-slider-percentage">{value}%</div>
                                </div>
                                
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={value}
                                  onChange={(e) =>
                                    setBudget({ ...budget, [key]: Number(e.target.value) })
                                  }
                                  className="budget-range-slider"
                                  style={{ background: categoryColors[key] }}
                                />
                                
                                <div className="budget-progress-track">
                                  <div 
                                    className="budget-progress-fill"
                                    style={{ 
                                      width: `${value}%`,
                                      backgroundColor: categoryColors[key]
                                    }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                          
                          <div className="budget-total-percentage">
                            <div className="budget-total-label">Total Allocation</div>
                            <div className="budget-total-value">{totalPercentage}%</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Saved Budgets Tab */}
                {activeTab === "saved" && (
                  <div className="budget-saved">
                    <div className="budget-saved-card">
                      <div className="budget-saved-header">
                        <h2 className="budget-saved-title">Your Saved Budgets</h2>
                        <div className="budget-saved-count">{savedBudgets.length} budgets saved</div>
                      </div>
                      
                      {savedBudgets.length === 0 ? (
                        <div className="budget-empty">
                          <Save size={48} />
                          <p>You haven't saved any budgets yet.</p>
                          <button 
                            className="budget-btn budget-btn-primary"
                            onClick={() => setActiveTab("planner")}
                          >
                            Create Your First Budget
                          </button>
                        </div>
                      ) : (
                        <div className="budget-saved-grid">
                          {savedBudgets.map((saved) => (
                            <div key={saved.id} className="budget-saved-item">
                              <div className="budget-saved-item-header">
                                <h3>{saved.name}</h3>
                                <div className="budget-saved-date">
                                  <Clock size={14} />
                                  <span>{saved.date} • {saved.time}</span>
                                </div>
                              </div>
                              
                              <div className="budget-saved-amount">
                                {currency}{saved.totalBudget.toLocaleString()}
                              </div>
                              
                              <div className="budget-saved-breakdown">
                                {Object.entries(saved.distribution).map(([key, value]) => (
                                  <div key={key} className="budget-saved-breakdown-item">
                                    <div className="budget-saved-breakdown-dot" style={{ backgroundColor: categoryColors[key] }}></div>
                                    <div className="budget-saved-breakdown-text">
                                      <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                                      <span>{value}%</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              
                              <button 
                                className="budget-btn budget-btn-secondary"
                                onClick={() => handleLoadBudget(saved)}
                              >
                                <RefreshCw size={16} />
                                <span>Load Budget</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tips Tab */}
                {activeTab === "tips" && (
                  <div className="budget-tips">
                    <div className="budget-tips-card">
                      <div className="budget-tips-header">
                        <h2 className="budget-tips-title">Budget Optimization Tips</h2>
                        <p className="budget-tips-subtitle">Maximize your marketing ROI with these expert recommendations</p>
                      </div>
                      
                      <div className="budget-tips-grid">
                        {[
                          {
                            icon: <Users size={24} />,
                            title: "Influencer Collaborations",
                            color: "#3B82F6",
                            tips: [
                              "Micro-influencers often provide better engagement rates",
                              "Consider performance-based compensation models",
                              "Allocate budget for long-term partnerships"
                            ]
                          },
                          {
                            icon: <TrendingUp size={24} />,
                            title: "Advertising Spend",
                            color: "#10B981",
                            tips: [
                              "A/B test ad creatives with small budgets first",
                              "Focus on platforms where your audience is most active",
                              "Retarget engaged users for higher conversion rates"
                            ]
                          },
                          {
                            icon: <Wrench size={24} />,
                            title: "Tools & Resources",
                            color: "#F59E0B",
                            tips: [
                              "Invest in analytics tools to measure campaign performance",
                              "Use management platforms to streamline influencer outreach",
                              "Allocate budget for content creation assets"
                            ]
                          }
                        ].map((tip, index) => (
                          <div key={index} className="budget-tip-card">
                            <div className="budget-tip-icon" style={{ backgroundColor: `${tip.color}15`, borderColor: tip.color }}>
                              {tip.icon}
                            </div>
                            <h3 className="budget-tip-title">{tip.title}</h3>
                            <ul className="budget-tip-list">
                              {tip.tips.map((item, idx) => (
                                <li key={idx} className="budget-tip-item">
                                  <div className="budget-tip-marker" style={{ backgroundColor: tip.color }}></div>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </main>

              {/* Sidebar */}
              <aside className="budget-sidebar">
                {/* Quick Stats */}
                <div className="budget-sidebar-section">
                  <h3 className="budget-sidebar-title">Budget Overview</h3>
                  <div className="budget-stats">
                    <div className="budget-stat">
                      <div className="budget-stat-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                        <DollarSign size={20} />
                      </div>
                      <div className="budget-stat-content">
                        <div className="budget-stat-value">{currency}{totalBudget.toLocaleString()}</div>
                        <div className="budget-stat-label">Total Budget</div>
                      </div>
                    </div>
                    <div className="budget-stat">
                      <div className="budget-stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                        <Target size={20} />
                      </div>
                      <div className="budget-stat-content">
                        <div className="budget-stat-value">{totalPercentage}%</div>
                        <div className="budget-stat-label">Allocated</div>
                      </div>
                    </div>
                    <div className="budget-stat">
                      <div className="budget-stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
                        <Sparkles size={20} />
                      </div>
                      <div className="budget-stat-content">
                        <div className="budget-stat-value">{savedBudgets.length}</div>
                        <div className="budget-stat-label">Saved Plans</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="budget-sidebar-section">
                  <h3 className="budget-sidebar-title">Quick Actions</h3>
                  <div className="budget-actions-sidebar">
                    <button className="budget-action-btn" onClick={handleSaveBudget}>
                      <Save size={16} />
                      <span>Save Current Budget</span>
                    </button>
                    <button className="budget-action-btn" onClick={handleReset}>
                      <RefreshCw size={16} />
                      <span>Reset to Default</span>
                    </button>
                    <button className="budget-action-btn" onClick={() => setTotalBudget(50000)}>
                      <DollarSign size={16} />
                      <span>Set Budget to 50K</span>
                    </button>
                    <button className="budget-action-btn" onClick={() => setActiveTab("tips")}>
                      <BookOpen size={16} />
                      <span>View Tips</span>
                    </button>
                  </div>
                </div>

                {/* Quick Tips */}
                <div className="budget-sidebar-section">
                  <h3 className="budget-sidebar-title">Quick Tips</h3>
                  <div className="budget-quick-tips">
                    <div className="budget-quick-tip">
                      <AlertCircle size={16} />
                      <span>Allocate 40-60% of budget to influencers</span>
                    </div>
                    <div className="budget-quick-tip">
                      <AlertCircle size={16} />
                      <span>Reserve 15-25% for testing new strategies</span>
                    </div>
                    <div className="budget-quick-tip">
                      <AlertCircle size={16} />
                      <span>Review and adjust allocations quarterly</span>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>

        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          .budget-wrapper { width: 100%; background: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; min-height: 100vh; }
          
          /* Main Content */
          .budget-main { padding: 40px 0; }
          .budget-container { max-width: 1400px; margin: 0 auto; padding: 0 20px; }
          .budget-layout { display: grid; grid-template-columns: 1fr 350px; gap: 32px; }
          
          /* Content Area */
          .budget-content { display: flex; flex-direction: column; gap: 24px; }
          
          /* Tabs */
          .budget-tabs { display: flex; gap: 8px; background: white; padding: 8px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
          .budget-tab-btn { flex: 1; padding: 12px 16px; background: transparent; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; color: #64748b; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; }
          .budget-tab-btn:hover { background: #f1f5f9; color: #3B82F6; }
          .budget-tab-btn.active { background: #3B82F6; color: white; }
          .budget-badge { background: #EF4444; color: white; padding: 2px 8px; border-radius: 10px; font-size: 12px; margin-left: 4px; }
          
          /* Controls Card */
          .budget-controls-card { background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
          .budget-header { margin-bottom: 24px; }
          .budget-title { font-size: 24px; font-weight: 700; color: #1e293b; margin-bottom: 8px; }
          .budget-subtitle { font-size: 15px; color: #64748b; }
          
          .budget-total-section { display: flex; gap: 24px; align-items: flex-end; }
          .budget-total-input { flex: 1; }
          .budget-total-label { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px; }
          
          .budget-amount-wrapper { display: flex; gap: 8px; }
          .budget-currency { padding: 12px 16px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; font-weight: 600; color: #374151; background: white; }
          .budget-amount-input { flex: 1; padding: 12px 16px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 16px; font-weight: 600; color: #1e293b; }
          
          .budget-actions { display: flex; gap: 12px; }
          .budget-btn { padding: 12px 20px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: 0.3s; display: flex; align-items: center; gap: 8px; border: none; }
          .budget-btn-primary { background: #3B82F6; color: white; }
          .budget-btn-primary:hover { background: #2563eb; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }
          .budget-btn-secondary { background: white; color: #3B82F6; border: 2px solid #3B82F6; }
          .budget-btn-secondary:hover { background: #f0f9ff; transform: translateY(-2px); }
          
          /* Planner Content */
          .budget-planner-content { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
          
          /* Chart Section */
          .budget-chart-card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
          .budget-chart-wrapper { position: relative; height: 300px; }
          .budget-chart-center { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; }
          .budget-chart-total { font-size: 24px; font-weight: 700; color: #1e293b; margin-bottom: 4px; }
          .budget-chart-label { font-size: 14px; color: #64748b; }
          
          .budget-legend { display: flex; flex-direction: column; gap: 12px; margin-top: 24px; }
          .budget-legend-item { display: flex; align-items: center; gap: 12px; }
          .budget-legend-dot { width: 12px; height: 12px; border-radius: 50%; }
          .budget-legend-text { flex: 1; display: flex; justify-content: space-between; align-items: center; }
          .budget-legend-name { font-size: 14px; color: #475569; }
          .budget-legend-value { font-size: 14px; font-weight: 600; color: #1e293b; }
          
          /* Sliders Section */
          .budget-sliders-card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
          .budget-sliders-title { font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 24px; }
          
          .budget-slider-group { margin-bottom: 24px; }
          .budget-slider-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
          .budget-slider-info { display: flex; align-items: center; gap: 12px; }
          .budget-slider-icon { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: rgba(59, 130, 246, 0.1); border-radius: 8px; }
          .budget-slider-name { font-size: 14px; font-weight: 600; color: #1e293b; }
          .budget-slider-amount { font-size: 12px; color: #64748b; }
          .budget-slider-percentage { font-size: 16px; font-weight: 700; color: #1e293b; }
          
          .budget-range-slider { width: 100%; height: 6px; border-radius: 3px; background: #e2e8f0; outline: none; }
          .budget-range-slider::-webkit-slider-thumb { appearance: none; width: 20px; height: 20px; border-radius: 50%; background: #3B82F6; cursor: pointer; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
          
          .budget-progress-track { height: 4px; background: #e2e8f0; border-radius: 2px; margin-top: 8px; overflow: hidden; }
          .budget-progress-fill { height: 100%; border-radius: 2px; }
          
          .budget-total-percentage { display: flex; justify-content: space-between; align-items: center; padding-top: 16px; border-top: 1px solid #e2e8f0; }
          .budget-total-label { font-size: 14px; font-weight: 600; color: #475569; }
          .budget-total-value { font-size: 18px; font-weight: 700; color: #3B82F6; }
          
          /* Saved Budgets */
          .budget-saved-card { background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
          .budget-saved-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
          .budget-saved-title { font-size: 20px; font-weight: 700; color: #1e293b; }
          .budget-saved-count { font-size: 14px; color: #64748b; background: #f1f5f9; padding: 4px 12px; border-radius: 6px; }
          
          .budget-empty { text-align: center; padding: 48px 24px; color: #94a3b8; }
          .budget-empty svg { color: #cbd5e1; margin-bottom: 16px; }
          
          .budget-saved-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
          .budget-saved-item { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; }
          .budget-saved-item-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
          .budget-saved-item-header h3 { font-size: 16px; font-weight: 600; color: #1e293b; }
          .budget-saved-date { display: flex; align-items: center; gap: 4px; font-size: 12px; color: #94a3b8; }
          
          .budget-saved-amount { font-size: 24px; font-weight: 700; color: #3B82F6; margin-bottom: 16px; }
          
          .budget-saved-breakdown { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
          .budget-saved-breakdown-item { display: flex; align-items: center; gap: 8px; }
          .budget-saved-breakdown-dot { width: 8px; height: 8px; border-radius: 50%; }
          .budget-saved-breakdown-text { flex: 1; display: flex; justify-content: space-between; font-size: 13px; color: #475569; }
          
          /* Tips Section */
          .budget-tips-card { background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
          .budget-tips-header { margin-bottom: 32px; }
          .budget-tips-title { font-size: 24px; font-weight: 700; color: #1e293b; margin-bottom: 8px; }
          .budget-tips-subtitle { font-size: 15px; color: #64748b; }
          
          .budget-tips-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
          .budget-tip-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; }
          .budget-tip-icon { width: 56px; height: 56px; border: 2px solid; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
          .budget-tip-title { font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 16px; }
          .budget-tip-list { list-style: none; padding: 0; }
          .budget-tip-item { display: flex; gap: 12px; margin-bottom: 12px; }
          .budget-tip-marker { width: 6px; height: 6px; border-radius: 50%; margin-top: 6px; flex-shrink: 0; }
          .budget-tip-item span { font-size: 14px; color: #64748b; line-height: 1.5; }
          
          /* Sidebar */
          .budget-sidebar { position: sticky; top: 20px; height: fit-content; display: flex; flex-direction: column; gap: 20px; }
          
          /* Sidebar Sections */
          .budget-sidebar-section { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
          .budget-sidebar-title { font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 16px; }
          
          /* Stats */
          .budget-stats { display: flex; flex-direction: column; gap: 16px; }
          .budget-stat { display: flex; gap: 16px; align-items: center; }
          .budget-stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
          .budget-stat-content { flex: 1; }
          .budget-stat-value { font-size: 18px; font-weight: 700; color: #1e293b; margin-bottom: 2px; }
          .budget-stat-label { font-size: 13px; color: #64748b; }
          
          /* Actions Sidebar */
          .budget-actions-sidebar { display: flex; flex-direction: column; gap: 8px; }
          .budget-action-btn { padding: 12px 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; display: flex; align-items: center; gap: 12px; color: #475569; font-size: 14px; cursor: pointer; transition: 0.2s; }
          .budget-action-btn:hover { background: #e2e8f0; border-color: #cbd5e1; color: #3B82F6; }
          
          /* Quick Tips */
          .budget-quick-tips { display: flex; flex-direction: column; gap: 12px; }
          .budget-quick-tip { display: flex; gap: 12px; }
          .budget-quick-tip svg { color: #F59E0B; flex-shrink: 0; margin-top: 2px; }
          .budget-quick-tip span { font-size: 13px; color: #64748b; }
          
          /* Responsive Design */
          @media (max-width: 1200px) {
            .budget-layout { grid-template-columns: 1fr; }
            .budget-sidebar { position: relative; }
            .budget-planner-content { grid-template-columns: 1fr; }
            .budget-saved-grid { grid-template-columns: 1fr; }
            .budget-tips-grid { grid-template-columns: 1fr; }
          }
          
          @media (max-width: 768px) {
            .budget-main { padding: 20px 0; }
            .budget-tabs { flex-wrap: wrap; }
            .budget-tab-btn { flex: 1 0 calc(50% - 8px); }
            .budget-total-section { flex-direction: column; align-items: stretch; }
            .budget-amount-wrapper { flex-direction: column; }
            .budget-actions { flex-direction: column; }
            .budget-btn { justify-content: center; }
            .budget-saved-header { flex-direction: column; gap: 12px; align-items: stretch; }
            .budget-saved-count { align-self: flex-start; }
          }
          
          @media (max-width: 640px) {
            .budget-controls-card { padding: 24px; }
            .budget-chart-wrapper { height: 250px; }
          }
        `}</style>
      </div>
    </>
  );
}