// import React, { useEffect, useRef, useState, useCallback } from "react";
// import Chart from "chart.js/auto";
// import "../style/TrendPredictor.css";
// import HomeTopBar from "../pages/HomePage/HomeTopBar";

// export default function TrendPredictor() {
//   const lineChartRef = useRef(null);
//   const barChartRef = useRef(null);
//   const radarChartRef = useRef(null);
//   const doughnutChartRef = useRef(null);
  
//   const [activeTab, setActiveTab] = useState("overview");
//   const [isConnected, setIsConnected] = useState(false);
//   const [animatedTrends, setAnimatedTrends] = useState({});

//   // Chart instances refs
//   const lineChartInstance = useRef(null);
//   const barChartInstance = useRef(null);
//   const radarChartInstance = useRef(null);
//   const doughnutChartInstance = useRef(null);

//   // Animate count-up effect
//   const animateCountUp = useCallback((influencer, target) => {
//     const duration = 800;
//     const start = animatedTrends[influencer] || 0;
//     const startTime = performance.now();

//     const step = (currentTime) => {
//       const progress = Math.min((currentTime - startTime) / duration, 1);
//       const value = Math.floor(progress * (target - start) + start);

//       setAnimatedTrends((prev) => ({ ...prev, [influencer]: value }));

//       if (progress < 1) requestAnimationFrame(step);
//     };

//     requestAnimationFrame(step);
//   }, [animatedTrends]);

//   // Initialize charts
//   useEffect(() => {
//     const initCharts = () => {
//       // Destroy existing charts if they exist
//       if (lineChartInstance.current) lineChartInstance.current.destroy();
//       if (barChartInstance.current) barChartInstance.current.destroy();
//       if (radarChartInstance.current) radarChartInstance.current.destroy();
//       if (doughnutChartInstance.current) doughnutChartInstance.current.destroy();

//       // Line Chart - Trend Tracking
//       const lineCtx = lineChartRef.current.getContext("2d");
//       lineChartInstance.current = new Chart(lineCtx, {
//         type: "line",
//         data: {
//           labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
//           datasets: [{
//             label: "Engagement Trend",
//             data: [65, 59, 80, 81, 56, 72],
//             borderColor: "#3B82F6",
//             backgroundColor: "rgba(59, 130, 246, 0.1)",
//             tension: 0.4,
//             fill: true
//           }]
//         },
//         options: {
//           responsive: true,
//           plugins: {
//             title: { display: true, text: "Engagement Trend Over Time" }
//           }
//         }
//       });

//       // Bar Chart - Performance Comparison
//       const barCtx = barChartRef.current.getContext("2d");
//       barChartInstance.current = new Chart(barCtx, {
//         type: "bar",
//         data: {
//           labels: ["@TechGuru", "@Fashionista", "@Foodie", "@Traveler"],
//           datasets: [{
//             label: "Engagement Rate (%)",
//             data: [72, 68, 85, 61],
//             backgroundColor: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"]
//           }]
//         },
//         options: {
//           responsive: true,
//           plugins: {
//             title: { display: true, text: "Influencer Performance Comparison" }
//           }
//         }
//       });

//       // Radar Chart - Multi-dimensional Analysis
//       const radarCtx = radarChartRef.current.getContext("2d");
//       radarChartInstance.current = new Chart(radarCtx, {
//         type: "radar",
//         data: {
//           labels: ["Engagement", "Reach", "Consistency", "Content Quality", "Audience Growth"],
//           datasets: [{
//             label: "Current Performance",
//             data: [85, 72, 68, 90, 78],
//             backgroundColor: "rgba(59, 130, 246, 0.2)",
//             borderColor: "#3B82F6",
//             pointBackgroundColor: "#3B82F6"
//           }]
//         },
//         options: {
//           responsive: true,
//           plugins: {
//             title: { display: true, text: "Multi-dimensional Performance Analysis" }
//           }
//         }
//       });

//       // Doughnut Chart - Audience Distribution
//       const doughnutCtx = doughnutChartRef.current.getContext("2d");
//       doughnutChartInstance.current = new Chart(doughnutCtx, {
//         type: "doughnut",
//         data: {
//           labels: ["18-24", "25-34", "35-44", "45-54", "55+"],
//           datasets: [{
//             data: [30, 25, 20, 15, 10],
//             backgroundColor: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"]
//           }]
//         },
//         options: {
//           responsive: true,
//           plugins: {
//             title: { display: true, text: "Audience Age Distribution" }
//           }
//         }
//       });
//     };

//     initCharts();

//     // Simulate WebSocket connection for real-time data
//     const simulateWebSocket = () => {
//       setIsConnected(true);
      
//       const interval = setInterval(() => {
//         const influencers = ["@TechGuru", "@Fashionista", "@Foodie", "@Traveler"];
//         const randomInfluencer = influencers[Math.floor(Math.random() * influencers.length)];
//         const newValue = Math.floor(Math.random() * 100);
        
//         animateCountUp(randomInfluencer, newValue);

//         // Update charts with new data
//         if (lineChartInstance.current) {
//           const newData = lineChartInstance.current.data.datasets[0].data.map(
//             value => Math.max(10, Math.min(95, value + (Math.random() * 10 - 5)))
//           );
//           lineChartInstance.current.data.datasets[0].data = newData;
//           lineChartInstance.current.update('none');
//         }

//         if (barChartInstance.current) {
//           const newData = barChartInstance.current.data.datasets[0].data.map(
//             value => Math.max(10, Math.min(95, value + (Math.random() * 5 - 2.5)))
//           );
//           barChartInstance.current.data.datasets[0].data = newData;
//           barChartInstance.current.update('none');
//         }
//       }, 3000);

//       return () => clearInterval(interval);
//     };

//     const cleanup = simulateWebSocket();
    
//     // Cleanup function
//     return () => {
//       cleanup();
//       if (lineChartInstance.current) lineChartInstance.current.destroy();
//       if (barChartInstance.current) barChartInstance.current.destroy();
//       if (radarChartInstance.current) radarChartInstance.current.destroy();
//       if (doughnutChartInstance.current) doughnutChartInstance.current.destroy();
//     };
//   }, [animateCountUp]);

//   const metricsCards = [
//     {
//       title: "Total Influencers Tracked",
//       value: "247",
//       change: "+12",
//       trend: "up",
//       icon: "👥"
//     },
//     {
//       title: "Average Engagement Rate",
//       value: "68.2%",
//       change: "+3.5%",
//       trend: "up",
//       icon: "📈"
//     },
//     {
//       title: "Prediction Accuracy",
//       value: "92.7%",
//       change: "+1.2%",
//       trend: "up",
//       icon: "🎯"
//     },
//     {
//       title: "Trending Topics",
//       value: "14",
//       change: "+3",
//       trend: "up",
//       icon: "🔥"
//     }
//   ];

//   const aiRecommendations = [
//     {
//       title: "Content Strategy Update",
//       description: "Shift focus to video content - 37% higher engagement predicted",
//       impact: "High",
//       icon: "🎬"
//     },
//     {
//       title: "Optimal Posting Schedule",
//       description: "Post between 2-4 PM for maximum reach based on current trends",
//       impact: "Medium",
//       icon: "⏰"
//     },
//     {
//       title: "Emerging Trend Alert",
//       description: "Sustainable fashion topics growing 42% faster than average",
//       impact: "High",
//       icon: "🚀"
//     }
//   ];

//   const trendingInfluencers = [
//     {
//       name: "@TechGuru",
//       growth: "+27%",
//       category: "Technology",
//       avatar: "👨‍💻"
//     },
//     {
//       name: "@Fashionista",
//       growth: "+19%",
//       category: "Fashion",
//       avatar: "👗"
//     },
//     {
//       name: "@FoodieBlog",
//       growth: "+33%",
//       category: "Food",
//       avatar: "🍔"
//     },
//     {
//       name: "@TravelDiaries",
//       growth: "+15%",
//       category: "Travel",
//       avatar: "✈️"
//     }
//   ];

//   return (
//     <><HomeTopBar />
//     <div className="trend-predictor-container">
//       {/* Header */}
//       <header className="predictor-header">
//         <div className="header-content">
//           <h1>AI Trend Predictor</h1>
//           <p>Real-time influencer trend tracking and predictive analytics powered by AI</p>
//           <div className="connection-status">
//             <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
//               {isConnected ? '● Live Tracking' : '○ Disconnected'}
//             </span>
//             <span className="last-update">Last update: Just now</span>
//           </div>
//         </div>
//       </header>

//       <div className="predictor-content">
//         {/* Navigation Tabs */}
//         <nav className="predictor-tabs">
//           <button 
//             className={`tab-button ${activeTab === "overview" ? "active" : ""}`}
//             onClick={() => setActiveTab("overview")}
//           >
//             📊 Overview
//           </button>
//           <button 
//             className={`tab-button ${activeTab === "analysis" ? "active" : ""}`}
//             onClick={() => setActiveTab("analysis")}
//           >
//             🔍 Deep Analysis
//           </button>
//           <button 
//             className={`tab-button ${activeTab === "predictions" ? "active" : ""}`}
//             onClick={() => setActiveTab("predictions")}
//           >
//             🔮 Predictions
//           </button>
//           <button 
//             className={`tab-button ${activeTab === "reports" ? "active" : ""}`}
//             onClick={() => setActiveTab("reports")}
//           >
//             📋 Reports
//           </button>
//         </nav>

//         {/* Metrics Grid */}
//         <section className="metrics-grid">
//           {metricsCards.map((card, index) => (
//             <div key={index} className="metric-card">
//               <div className="metric-header">
//                 <span className="metric-icon">{card.icon}</span>
//                 <span className={`trend-indicator ${card.trend}`}>
//                   {card.change}
//                 </span>
//               </div>
//               <div className="metric-value">{card.value}</div>
//               <div className="metric-title">{card.title}</div>
//             </div>
//           ))}
//         </section>

//         {/* Current Trends */}
//         <section className="current-trends-section">
//           <h2>Live Trend Tracking</h2>
//           <div className="trends-grid">
//             {Object.entries(animatedTrends).map(([name, value]) => (
//               <div key={name} className="trend-card">
//                 <div className="trend-header">
//                   <span className="influencer-name">{name}</span>
//                   <span className="trend-badge">Live</span>
//                 </div>
//                 <div className="trend-value">{value}%</div>
//                 <div className="trend-progress">
//                   <div 
//                     className="progress-bar" 
//                     style={{ width: `${value}%` }}
//                   ></div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </section>

//         {/* Charts Grid */}
//         <section className="charts-grid">
//           <div className="chart-card">
//             <canvas ref={lineChartRef} />
//           </div>
//           <div className="chart-card">
//             <canvas ref={barChartRef} />
//           </div>
//           <div className="chart-card">
//             <canvas ref={radarChartRef} />
//           </div>
//           <div className="chart-card">
//             <canvas ref={doughnutChartRef} />
//           </div>
//         </section>

//         {/* AI Recommendations */}
//         <section className="recommendations-section">
//           <h2>AI-Powered Recommendations</h2>
//           <div className="recommendations-grid">
//             {aiRecommendations.map((rec, index) => (
//               <div key={index} className="recommendation-card">
//                 <div className="rec-icon">{rec.icon}</div>
//                 <div className="rec-content">
//                   <h3>{rec.title}</h3>
//                   <p>{rec.description}</p>
//                   <span className={`impact-tag impact-${rec.impact.toLowerCase()}`}>
//                     {rec.impact} Impact
//                   </span>
//                 </div>
//                 <button className="apply-button">Apply</button>
//               </div>
//             ))}
//           </div>
//         </section>

//         {/* Trending Influencers */}
//         <section className="trending-influencers">
//           <h2>Top Trending Influencers</h2>
//           <div className="influencers-grid">
//             {trendingInfluencers.map((influencer, index) => (
//               <div key={index} className="influencer-card">
//                 <div className="influencer-header">
//                   <span className="influencer-avatar">{influencer.avatar}</span>
//                   <div className="influencer-info">
//                     <h3>{influencer.name}</h3>
//                     <span className="influencer-category">{influencer.category}</span>
//                   </div>
//                   <span className="growth-badge">{influencer.growth}</span>
//                 </div>
//                 <div className="influencer-stats">
//                   <div className="stat">
//                     <span className="stat-value">72%</span>
//                     <span className="stat-label">Engagement</span>
//                   </div>
//                   <div className="stat">
//                     <span className="stat-value">245K</span>
//                     <span className="stat-label">Followers</span>
//                   </div>
//                   <div className="stat">
//                     <span className="stat-value">92%</span>
//                     <span className="stat-label">Match Score</span>
//                   </div>
//                 </div>
//                 <button className="view-profile-btn">View Profile</button>
//               </div>
//             ))}
//           </div>
//         </section>

//         {/* Real-time Feed */}
//         <section className="live-feed">
//           <h2>Live Trend Alerts</h2>
//           <div className="feed-container">
//             <div className="feed-item">
//               <span className="feed-icon">🚀</span>
//               <div className="feed-content">
//                 <p>Tech reviews trending up 27% among 25-34 age group</p>
//                 <span className="feed-time">2 minutes ago</span>
//               </div>
//             </div>
//             <div className="feed-item">
//               <span className="feed-icon">📈</span>
//               <div className="feed-content">
//                 <p>Video content engagement increased by 42% this week</p>
//                 <span className="feed-time">5 minutes ago</span>
//               </div>
//             </div>
//             <div className="feed-item">
//               <span className="feed-icon">🎯</span>
//               <div className="feed-content">
//                 <p>Sustainable fashion topics growing 38% faster than average</p>
//                 <span className="feed-time">12 minutes ago</span>
//               </div>
//             </div>
//           </div>
//         </section>
//       </div>
//     </div>
//     </>
//   );
// }

import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { 
  Users, TrendingUp, Target, Flame, 
  Zap, Clock, Rocket, BarChart3,
  LineChart, PieChart, Radar, Cpu,
  Sparkles, AlertCircle, ChevronRight,
  Activity, Eye, Heart, Share2,
  Calendar, TrendingUp as TrendingUpIcon,
  Globe, DollarSign, MessageSquare,
  Video, Hash, Tag, Users as UsersIcon,
  Map, BarChart, TrendingDown,
  Bell, Filter, Download, RefreshCw
} from 'lucide-react';
import HomeTopBar from "../pages/HomePage/HomeTopBar";
import { useNavigate } from "react-router-dom";
import { FileText } from "lucide-react";

export default function TrendPredictor() {
  const lineChartRef = useRef(null);
  const barChartRef = useRef(null);
  const radarChartRef = useRef(null);
  const doughnutChartRef = useRef(null);
  const bubbleChartRef = useRef(null);
  const scatterChartRef = useRef(null);
  const areaChartRef = useRef(null);
  const polarChartRef = useRef(null);
  
  const [activeTab, setActiveTab] = useState("overview");
  const [isConnected, setIsConnected] = useState(true);
  const [liveMetrics, setLiveMetrics] = useState({
    influencers: 247,
    engagement: 68.2,
    accuracy: 92.7,
    topics: 14,
    reach: 1250000,
    roi: 4.2
  });

  // Chart instances refs
  const lineChartInstance = useRef(null);
  const barChartInstance = useRef(null);
  const radarChartInstance = useRef(null);
  const doughnutChartInstance = useRef(null);
  const bubbleChartInstance = useRef(null);
  const scatterChartInstance = useRef(null);
  const areaChartInstance = useRef(null);
  const polarChartInstance = useRef(null);

  const navigate = useNavigate();

  const goToLogin = () => {
    navigate("/login");
  };

    const FileText = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );

  // Initialize charts
  useEffect(() => {
    const initOverviewCharts = () => {
      // Overview Charts
      const lineCtx = lineChartRef.current.getContext("2d");
      lineChartInstance.current = new Chart(lineCtx, {
        type: "line",
        data: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
          datasets: [{
            label: "Engagement Trend",
            data: [65, 59, 80, 81, 56, 72, 85],
            borderColor: "#3B82F6",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            tension: 0.4,
            fill: true,
            borderWidth: 3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            title: { display: true, text: "Weekly Engagement Trend", font: { size: 14 } }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(0,0,0,0.05)' }
            },
            x: {
              grid: { display: false }
            }
          }
        }
      });

      const barCtx = barChartRef.current.getContext("2d");
      barChartInstance.current = new Chart(barCtx, {
        type: "bar",
        data: {
          labels: ["@TechGuru", "@Fashionista", "@Foodie", "@Traveler"],
          datasets: [{
            label: "Engagement Rate (%)",
            data: [72, 68, 85, 61],
            backgroundColor: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"],
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { 
            legend: { display: false },
            title: { display: true, text: "Top Performing Influencers", font: { size: 14 } }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(0,0,0,0.05)' }
            },
            x: {
              grid: { display: false }
            }
          }
        }
      });

      const radarCtx = radarChartRef.current.getContext("2d");
      radarChartInstance.current = new Chart(radarCtx, {
        type: "radar",
        data: {
          labels: ["Engagement", "Reach", "Consistency", "Content Quality", "Audience Growth"],
          datasets: [{
            label: "Current Performance",
            data: [85, 72, 68, 90, 78],
            backgroundColor: "rgba(59, 130, 246, 0.2)",
            borderColor: "#3B82F6",
            pointBackgroundColor: "#3B82F6",
            pointBorderColor: "#fff",
            pointBorderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { 
            legend: { display: false },
            title: { display: true, text: "Performance Analysis", font: { size: 14 } }
          },
          scales: {
            r: {
              beginAtZero: true,
              ticks: { display: false }
            }
          }
        }
      });

      const doughnutCtx = doughnutChartRef.current.getContext("2d");
      doughnutChartInstance.current = new Chart(doughnutCtx, {
        type: "doughnut",
        data: {
          labels: ["18-24", "25-34", "35-44", "45-54", "55+"],
          datasets: [{
            data: [30, 25, 20, 15, 10],
            backgroundColor: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' },
            title: { display: true, text: "Audience Age Distribution", font: { size: 14 } }
          }
        }
      });
    };

    const initAnalysisCharts = () => {
      // Analysis Charts
      const bubbleCtx = bubbleChartRef.current?.getContext("2d");
      if (bubbleCtx && !bubbleChartInstance.current) {
        bubbleChartInstance.current = new Chart(bubbleCtx, {
          type: "bubble",
          data: {
            datasets: [{
              label: 'Influencer Performance',
              data: [
                {x: 20, y: 30, r: 15},
                {x: 40, y: 10, r: 10},
                {x: 30, y: 20, r: 20},
                {x: 50, y: 40, r: 25},
                {x: 60, y: 35, r: 18},
                {x: 70, y: 50, r: 30},
                {x: 80, y: 60, r: 22},
                {x: 90, y: 70, r: 28}
              ],
              backgroundColor: "#3B82F6",
              borderColor: "#2563eb"
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: { display: true, text: "Influencer Performance Clusters", font: { size: 14 } }
            },
            scales: {
              x: {
                title: { display: true, text: 'Engagement Rate (%)' }
              },
              y: {
                title: { display: true, text: 'Follower Growth (%)' }
              }
            }
          }
        });
      }

      const scatterCtx = scatterChartRef.current?.getContext("2d");
      if (scatterCtx && !scatterChartInstance.current) {
        scatterChartInstance.current = new Chart(scatterCtx, {
          type: "scatter",
          data: {
            datasets: [{
              label: 'Content Performance',
              data: [
                {x: 10, y: 20},
                {x: 15, y: 25},
                {x: 20, y: 35},
                {x: 25, y: 40},
                {x: 30, y: 45},
                {x: 35, y: 50},
                {x: 40, y: 55},
                {x: 45, y: 60},
                {x: 50, y: 65},
                {x: 55, y: 70}
              ],
              backgroundColor: "#10B981",
              borderColor: "#059669"
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: { display: true, text: "Content Performance Scatter Analysis", font: { size: 14 } }
            },
            scales: {
              x: {
                title: { display: true, text: 'Video Length (min)' }
              },
              y: {
                title: { display: true, text: 'Engagement Score' }
              }
            }
          }
        });
      }
    };

    const initPredictionCharts = () => {
      // Prediction Charts
      const areaCtx = areaChartRef.current?.getContext("2d");
      if (areaCtx && !areaChartInstance.current) {
        areaChartInstance.current = new Chart(areaCtx, {
          type: "line",
          data: {
            labels: ["Now", "+1 Week", "+2 Weeks", "+3 Weeks", "+4 Weeks"],
            datasets: [{
              label: "Predicted Trend",
              data: [65, 72, 78, 85, 92],
              borderColor: "#8B5CF6",
              backgroundColor: "rgba(139, 92, 246, 0.3)",
              fill: true,
              tension: 0.4,
              borderWidth: 3
            },
            {
              label: "Current Trend",
              data: [65, 68, 72, 70, 75],
              borderColor: "#3B82F6",
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              fill: true,
              tension: 0.4,
              borderWidth: 2,
              borderDash: [5, 5]
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: { display: true, text: "4-Week Trend Prediction", font: { size: 14 } }
            },
            scales: {
              y: {
                beginAtZero: true,
                title: { display: true, text: 'Engagement Score' }
              }
            }
          }
        });
      }
    };

    const initReportCharts = () => {
      // Report Charts
      const polarCtx = polarChartRef.current?.getContext("2d");
      if (polarCtx && !polarChartInstance.current) {
        polarChartInstance.current = new Chart(polarCtx, {
          type: "polarArea",
          data: {
            labels: ["Brand Safety", "Audience Quality", "Engagement", "Growth Rate", "Content Value"],
            datasets: [{
              data: [85, 90, 78, 82, 88],
              backgroundColor: [
                "rgba(59, 130, 246, 0.7)",
                "rgba(16, 185, 129, 0.7)",
                "rgba(245, 158, 11, 0.7)",
                "rgba(239, 68, 68, 0.7)",
                "rgba(139, 92, 246, 0.7)"
              ],
              borderWidth: 2
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: { display: true, text: "Influencer Quality Score", font: { size: 14 } }
            }
          }
        });
      }
    };

    // Initialize based on active tab
    switch(activeTab) {
      case "overview":
        initOverviewCharts();
        break;
      case "analysis":
        initAnalysisCharts();
        break;
      case "predictions":
        initPredictionCharts();
        break;
      case "reports":
        initReportCharts();
        break;
    }

    // Simulate live data updates
    const interval = setInterval(() => {
      setLiveMetrics(prev => ({
        ...prev,
        influencers: prev.influencers + Math.floor(Math.random() * 3),
        engagement: Math.min(95, prev.engagement + (Math.random() * 2 - 1)),
        accuracy: Math.min(99, prev.accuracy + (Math.random() * 1 - 0.5)),
        topics: prev.topics + Math.floor(Math.random() * 2),
        reach: prev.reach + Math.floor(Math.random() * 10000),
        roi: Math.max(1, Math.min(8, prev.roi + (Math.random() * 0.5 - 0.25)))
      }));

      // Update charts based on active tab
      updateCharts();
    }, 5000);

    const updateCharts = () => {
      if (activeTab === "overview" && lineChartInstance.current) {
        const newData = lineChartInstance.current.data.datasets[0].data.map(
          value => Math.max(10, Math.min(95, value + (Math.random() * 10 - 5)))
        );
        lineChartInstance.current.data.datasets[0].data = newData;
        lineChartInstance.current.update('none');
      }

      if (activeTab === "overview" && barChartInstance.current) {
        const newData = barChartInstance.current.data.datasets[0].data.map(
          value => Math.max(10, Math.min(95, value + (Math.random() * 5 - 2.5)))
        );
        barChartInstance.current.data.datasets[0].data = newData;
        barChartInstance.current.update('none');
      }

      if (activeTab === "predictions" && areaChartInstance.current) {
        const newData = areaChartInstance.current.data.datasets[0].data.map(
          value => Math.max(50, Math.min(95, value + (Math.random() * 3 - 1.5)))
        );
        areaChartInstance.current.data.datasets[0].data = newData;
        areaChartInstance.current.update('none');
      }
    };

    return () => {
      clearInterval(interval);
      // Only destroy charts if they exist
      [lineChartInstance, barChartInstance, radarChartInstance, doughnutChartInstance, 
       bubbleChartInstance, scatterChartInstance, areaChartInstance, polarChartInstance]
        .forEach(instance => {
          if (instance.current) instance.current.destroy();
        });
    };
  }, [activeTab]);

  const metricsCards = [
    {
      title: "Total Influencers Tracked",
      value: liveMetrics.influencers,
      change: "+12",
      trend: "up",
      icon: <Users size={24} />,
      color: "#3B82F6"
    },
    {
      title: "Avg Engagement Rate",
      value: `${liveMetrics.engagement.toFixed(1)}%`,
      change: "+3.5%",
      trend: "up",
      icon: <TrendingUp size={24} />,
      color: "#10B981"
    },
    {
      title: "Prediction Accuracy",
      value: `${liveMetrics.accuracy.toFixed(1)}%`,
      change: "+1.2%",
      trend: "up",
      icon: <Target size={24} />,
      color: "#8B5CF6"
    },
    {
      title: "Trending Topics",
      value: liveMetrics.topics,
      change: "+3",
      trend: "up",
      icon: <Flame size={24} />,
      color: "#EF4444"
    },
    {
      title: "Total Reach",
      value: `${(liveMetrics.reach / 1000).toFixed(1)}K`,
      change: "+15K",
      trend: "up",
      icon: <Globe size={24} />,
      color: "#F59E0B"
    },
    {
      title: "Avg ROI",
      value: `${liveMetrics.roi.toFixed(1)}x`,
      change: "+0.3x",
      trend: "up",
      icon: <DollarSign size={24} />,
      color: "#10B981"
    }
  ];

  const overviewMetrics = metricsCards.slice(0, 4);
  const analysisMetrics = metricsCards.slice(2, 6);
  const predictionMetrics = [metricsCards[1], metricsCards[2], metricsCards[4], metricsCards[5]];
  const reportMetrics = [metricsCards[0], metricsCards[3], metricsCards[4], metricsCards[5]];

  const aiRecommendations = {
    overview: [
      {
        title: "Content Strategy Update",
        description: "Shift focus to video content - 37% higher engagement predicted",
        impact: "high",
        icon: <Zap size={24} />
      },
      {
        title: "Optimal Posting Schedule",
        description: "Post between 2-4 PM for maximum reach based on current trends",
        impact: "medium",
        icon: <Clock size={24} />
      },
      {
        title: "Emerging Trend Alert",
        description: "Sustainable fashion topics growing 42% faster than average",
        impact: "high",
        icon: <Rocket size={24} />
      }
    ],
    analysis: [
      {
        title: "Deep Audience Analysis",
        description: "Your audience responds 3x better to educational content",
        impact: "high",
        icon: <UsersIcon size={24} />
      },
      {
        title: "Competitor Insight",
        description: "@Competitor is seeing 28% higher engagement with short-form video",
        impact: "medium",
        icon: <BarChart size={24} />
      },
      {
        title: "Content Gap Identified",
        description: "Missing opportunity in tutorial-style content for beginners",
        impact: "high",
        icon: <AlertCircle size={24} />
      }
    ],
    predictions: [
      {
        title: "Next Week's Top Trend",
        description: "AI predicts 'Sustainable Tech' will grow 45% in engagement",
        impact: "high",
        icon: <Sparkles size={24} />
      },
      {
        title: "Optimal Investment Time",
        description: "Best ROI expected if you invest within next 72 hours",
        impact: "medium",
        icon: <DollarSign size={24} />
      },
      {
        title: "Risk Alert",
        description: "Possible saturation in beauty influencer market detected",
        impact: "medium",
        icon: <TrendingDown size={24} />
      }
    ],
    reports: [
      {
        title: "Monthly Performance Report",
        description: "Your campaigns performed 32% better than industry average",
        impact: "high",
        icon: <FileText size={24} />
      },
      {
        title: "Audience Growth Analysis",
        description: "22% audience growth with highest retention in 25-34 age group",
        impact: "high",
        icon: <TrendingUp size={24} />
      },
      {
        title: "Competitive Benchmark",
        description: "You're outperforming 87% of competitors in engagement rate",
        impact: "medium",
        icon: <BarChart3 size={24} />
      }
    ]
  };

  const trendingInfluencers = {
    overview: [
      {
        name: "@TechGuru",
        growth: "+27%",
        category: "Technology",
        engagement: 72,
        followers: "245K",
        match: 92
      },
      {
        name: "@Fashionista",
        growth: "+19%",
        category: "Fashion",
        engagement: 68,
        followers: "189K",
        match: 88
      },
      {
        name: "@FoodieBlog",
        growth: "+33%",
        category: "Food",
        engagement: 85,
        followers: "312K",
        match: 95
      },
      {
        name: "@TravelDiaries",
        growth: "+15%",
        category: "Travel",
        engagement: 61,
        followers: "156K",
        match: 82
      }
    ],
    analysis: [
      {
        name: "@DataAnalyst",
        growth: "+42%",
        category: "Analytics",
        engagement: 78,
        followers: "98K",
        match: 96
      },
      {
        name: "@MarketingPro",
        growth: "+31%",
        category: "Marketing",
        engagement: 82,
        followers: "210K",
        match: 89
      },
      {
        name: "@AIEnthusiast",
        growth: "+55%",
        category: "AI",
        engagement: 91,
        followers: "145K",
        match: 98
      },
      {
        name: "@StartupGuru",
        growth: "+28%",
        category: "Business",
        engagement: 74,
        followers: "320K",
        match: 85
      }
    ],
    predictions: [
      {
        name: "@FutureTech",
        growth: "+38%",
        category: "Future Tech",
        engagement: 88,
        followers: "85K",
        match: 94
      },
      {
        name: "@GreenLiving",
        growth: "+47%",
        category: "Sustainability",
        engagement: 79,
        followers: "120K",
        match: 91
      },
      {
        name: "@MetaverseGuide",
        growth: "+62%",
        category: "Web3",
        engagement: 83,
        followers: "95K",
        match: 96
      },
      {
        name: "@HealthInnovator",
        growth: "+34%",
        category: "Health Tech",
        engagement: 76,
        followers: "180K",
        match: 87
      }
    ],
    reports: [
      {
        name: "@ReportMaster",
        growth: "+22%",
        category: "Analytics",
        engagement: 81,
        followers: "150K",
        match: 93
      },
      {
        name: "@InsightGuru",
        growth: "+29%",
        category: "Insights",
        engagement: 85,
        followers: "220K",
        match: 90
      },
      {
        name: "@DataViz",
        growth: "+36%",
        category: "Data Visualization",
        engagement: 79,
        followers: "110K",
        match: 92
      },
      {
        name: "@MetricsPro",
        growth: "+25%",
        category: "Performance",
        engagement: 83,
        followers: "190K",
        match: 88
      }
    ]
  };

  const liveAlerts = {
    overview: [
      {
        icon: <Rocket size={20} />,
        text: "Tech reviews trending up 27% among 25-34 age group",
        time: "2 min ago"
      },
      {
        icon: <TrendingUpIcon size={20} />,
        text: "Video content engagement increased by 42% this week",
        time: "5 min ago"
      },
      {
        icon: <Target size={20} />,
        text: "Sustainable fashion topics growing 38% faster than average",
        time: "12 min ago"
      }
    ],
    analysis: [
      {
        icon: <AlertCircle size={20} />,
        text: "New audience segment identified: Tech professionals aged 30-40",
        time: "3 min ago"
      },
      {
        icon: <UsersIcon size={20} />,
        text: "Competitor analysis complete - 3 new opportunities found",
        time: "8 min ago"
      },
      {
        icon: <BarChart size={20} />,
        text: "Deep analysis shows 89% correlation between video length and shares",
        time: "15 min ago"
      }
    ],
    predictions: [
      {
        icon: <Sparkles size={20} />,
        text: "AI predicts 'Quantum Computing' will trend next month (+45%)",
        time: "1 min ago"
      },
      {
        icon: <TrendingUp size={20} />,
        text: "Forecast: Influencer marketing spend to increase 32% in Q4",
        time: "7 min ago"
      },
      {
        icon: <Bell size={20} />,
        text: "Alert: Rising interest in AR fashion content predicted",
        time: "14 min ago"
      }
    ],
    reports: [
      {
        icon: <FileText size={20} />,
        text: "Monthly report generated - 28% performance improvement",
        time: "4 min ago"
      },
      {
        icon: <Download size={20} />,
        text: "Export complete: Q3 performance analytics available",
        time: "10 min ago"
      },
      {
        icon: <Filter size={20} />,
        text: "Custom report filters applied successfully",
        time: "18 min ago"
      }
    ]
  };

  const quickActions = {
    overview: [
      { icon: <Zap size={18} />, label: "Quick Analysis", action: goToLogin },
      { icon: <Sparkles size={18} />, label: "Trend Insights", action: goToLogin },
      { icon: <TrendingUp size={18} />, label: "Compare Metrics", action: goToLogin },
      { icon: <Share2 size={18} />, label: "Share Dashboard", action: goToLogin }
    ],
    analysis: [
      { icon: <Filter size={18} />, label: "Advanced Filters", action: goToLogin },
      { icon: <Download size={18} />, label: "Export Data", action: goToLogin },
      { icon: <RefreshCw size={18} />, label: "Refresh Analysis", action: goToLogin },
      { icon: <Bell size={18} />, label: "Set Alerts", action: goToLogin }
    ],
    predictions: [
      { icon: <Sparkles size={18} />, label: "Run Forecast", action: goToLogin },
      { icon: <Target size={18} />, label: "Set Predictions", action: goToLogin },
      { icon: <AlertCircle size={18} />, label: "Risk Assessment", action: goToLogin },
      { icon: <TrendingUp size={18} />, label: "Trend Simulation", action: goToLogin }
    ],
    reports: [
      { icon: <FileText size={18} />, label: "Generate Report", action: goToLogin },
      { icon: <Download size={18} />, label: "Download PDF", action: goToLogin },
      { icon: <Share2 size={18} />, label: "Share Report", action: goToLogin },
      { icon: <Filter size={18} />, label: "Customize Report", action: goToLogin }
    ]
  };

  const renderMetrics = () => {
    switch(activeTab) {
      case "overview": return overviewMetrics;
      case "analysis": return analysisMetrics;
      case "predictions": return predictionMetrics;
      case "reports": return reportMetrics;
      default: return overviewMetrics;
    }
  };

  const renderCharts = () => {
    switch(activeTab) {
      case "overview":
        return (
          <>
            <div className="trend-chart-card">
              <div className="trend-chart-header">
                <h3>Engagement Trend Over Time</h3>
                <button className="trend-chart-option">⋯</button>
              </div>
              <div className="trend-chart-canvas">
                <canvas ref={lineChartRef} height="250" />
              </div>
            </div>

            <div className="trend-chart-card">
              <div className="trend-chart-header">
                <h3>Influencer Performance Comparison</h3>
                <button className="trend-chart-option">⋯</button>
              </div>
              <div className="trend-chart-canvas">
                <canvas ref={barChartRef} height="250" />
              </div>
            </div>

            <div className="trend-chart-card">
              <div className="trend-chart-header">
                <h3>Multi-dimensional Analysis</h3>
                <button className="trend-chart-option">⋯</button>
              </div>
              <div className="trend-chart-canvas">
                <canvas ref={radarChartRef} height="250" />
              </div>
            </div>

            <div className="trend-chart-card">
              <div className="trend-chart-header">
                <h3>Audience Age Distribution</h3>
                <button className="trend-chart-option">⋯</button>
              </div>
              <div className="trend-chart-canvas">
                <canvas ref={doughnutChartRef} height="250" />
              </div>
            </div>
          </>
        );
      
      case "analysis":
        return (
          <>
            <div className="trend-chart-card">
              <div className="trend-chart-header">
                <h3>Influencer Performance Clusters</h3>
                <button className="trend-chart-option">⋯</button>
              </div>
              <div className="trend-chart-canvas">
                <canvas ref={bubbleChartRef} height="250" />
              </div>
            </div>

            <div className="trend-chart-card">
              <div className="trend-chart-header">
                <h3>Content Performance Scatter Analysis</h3>
                <button className="trend-chart-option">⋯</button>
              </div>
              <div className="trend-chart-canvas">
                <canvas ref={scatterChartRef} height="250" />
              </div>
            </div>

            <div className="trend-chart-card">
              <div className="trend-chart-header">
                <h3>Engagement Trend Over Time</h3>
                <button className="trend-chart-option">⋯</button>
              </div>
              <div className="trend-chart-canvas">
                <canvas ref={lineChartRef} height="250" />
              </div>
            </div>

            <div className="trend-chart-card">
              <div className="trend-chart-header">
                <h3>Multi-dimensional Analysis</h3>
                <button className="trend-chart-option">⋯</button>
              </div>
              <div className="trend-chart-canvas">
                <canvas ref={radarChartRef} height="250" />
              </div>
            </div>
          </>
        );
      
      case "predictions":
        return (
          <>
            <div className="trend-chart-card">
              <div className="trend-chart-header">
                <h3>4-Week Trend Prediction</h3>
                <button className="trend-chart-option">⋯</button>
              </div>
              <div className="trend-chart-canvas">
                <canvas ref={areaChartRef} height="250" />
              </div>
            </div>

            <div className="trend-chart-card">
              <div className="trend-chart-header">
                <h3>Influencer Performance Comparison</h3>
                <button className="trend-chart-option">⋯</button>
              </div>
              <div className="trend-chart-canvas">
                <canvas ref={barChartRef} height="250" />
              </div>
            </div>

            <div className="trend-chart-card">
              <div className="trend-chart-header">
                <h3>Multi-dimensional Analysis</h3>
                <button className="trend-chart-option">⋯</button>
              </div>
              <div className="trend-chart-canvas">
                <canvas ref={radarChartRef} height="250" />
              </div>
            </div>

            <div className="trend-chart-card">
              <div className="trend-chart-header">
                <h3>Audience Age Distribution</h3>
                <button className="trend-chart-option">⋯</button>
              </div>
              <div className="trend-chart-canvas">
                <canvas ref={doughnutChartRef} height="250" />
              </div>
            </div>
          </>
        );
      
      case "reports":
        return (
          <>
            <div className="trend-chart-card">
              <div className="trend-chart-header">
                <h3>Engagement Trend Over Time</h3>
                <button className="trend-chart-option">⋯</button>
              </div>
              <div className="trend-chart-canvas">
                <canvas ref={lineChartRef} height="250" />
              </div>
            </div>

            <div className="trend-chart-card">
              <div className="trend-chart-header">
                <h3>Influencer Performance Comparison</h3>
                <button className="trend-chart-option">⋯</button>
              </div>
              <div className="trend-chart-canvas">
                <canvas ref={barChartRef} height="250" />
              </div>
            </div>

            <div className="trend-chart-card">
              <div className="trend-chart-header">
                <h3>Influencer Quality Score</h3>
                <button className="trend-chart-option">⋯</button>
              </div>
              <div className="trend-chart-canvas">
                <canvas ref={polarChartRef} height="250" />
              </div>
            </div>

            <div className="trend-chart-card">
              <div className="trend-chart-header">
                <h3>Audience Age Distribution</h3>
                <button className="trend-chart-option">⋯</button>
              </div>
              <div className="trend-chart-canvas">
                <canvas ref={doughnutChartRef} height="250" />
              </div>
            </div>
          </>
        );
      
      default:
        return null;
    }
  };



  return (
    <>
      {/* <HomeTopBar /> */}
      <div className="trend-wrapper">
        {/* Hero Section */}
        <section className="trend-hero">
          <div className="trend-hero-content">
            <h1 className="trend-hero-title">
              {activeTab === "overview" && "AI Trend Predictor"}
              {activeTab === "analysis" && "Deep Trend Analysis"}
              {activeTab === "predictions" && "Future Predictions"}
              {activeTab === "reports" && "Analytics Reports"}
            </h1>
            <p className="trend-hero-subtitle">
              {activeTab === "overview" && "Real-time influencer trend tracking and predictive analytics powered by AI"}
              {activeTab === "analysis" && "Deep dive into audience behavior, content performance, and competitive analysis"}
              {activeTab === "predictions" && "AI-powered forecasting of future trends and market movements"}
              {activeTab === "reports" && "Comprehensive analytics reports and performance insights"}
            </p>
            <div className="trend-hero-stats">
              <div className="trend-stat-item">
                <Activity size={24} />
                <div>
                  <h3>Live Tracking</h3>
                  <p>Real-time updates</p>
                </div>
              </div>
              <div className="trend-stat-item">
                <Cpu size={24} />
                <div>
                  <h3>AI-Powered</h3>
                  <p>Smart predictions</p>
                </div>
              </div>
              <div className="trend-stat-item">
                <Calendar size={24} />
                <div>
                  <h3>24/7</h3>
                  <p>Monitoring</p>
                </div>
              </div>
            </div>
            <div className="trend-status">
              <span className={`trend-status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
                <span className="status-dot"></span>
                {isConnected ? 'Live Connected' : 'Disconnected'}
              </span>
              <span className="trend-update-time">Last update: Just now</span>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="trend-main">
          <div className="trend-container">
            <div className="trend-layout">
              {/* Main Content Area */}
              <main className="trend-content">
                {/* Navigation Tabs */}
                <div className="trend-tabs">
                  <button 
                    className={`trend-tab-btn ${activeTab === "overview" ? 'active' : ''}`}
                    onClick={() => setActiveTab("overview")}
                  >
                    <BarChart3 size={18} />
                    <span>Overview</span>
                  </button>
                  <button 
                    className={`trend-tab-btn ${activeTab === "analysis" ? 'active' : ''}`}
                    onClick={() => setActiveTab("analysis")}
                  >
                    <LineChart size={18} />
                    <span>Deep Analysis</span>
                  </button>
                  <button 
                    className={`trend-tab-btn ${activeTab === "predictions" ? 'active' : ''}`}
                    onClick={() => setActiveTab("predictions")}
                  >
                    <Sparkles size={18} />
                    <span>Predictions</span>
                  </button>
                  <button 
                    className={`trend-tab-btn ${activeTab === "reports" ? 'active' : ''}`}
                    onClick={() => setActiveTab("reports")}
                  >
                    <PieChart size={18} />
                    <span>Reports</span>
                  </button>
                </div>

                {/* Metrics Grid */}
                <div className="trend-metrics-grid">
                  {renderMetrics().map((card, index) => (
                    <div key={index} className="trend-metric-card">
                      <div className="trend-metric-header">
                        <div className="trend-metric-icon" style={{ color: card.color }}>
                          {card.icon}
                        </div>
                        <span className={`trend-metric-change trend-${card.trend}`}>
                          {card.change}
                        </span>
                      </div>
                      <div className="trend-metric-value">{card.value}</div>
                      <div className="trend-metric-title">{card.title}</div>
                    </div>
                  ))}
                </div>

                {/* Charts Grid */}
                <div className="trend-charts-grid">
                  {renderCharts()}
                </div>

                {/* AI Recommendations */}
                <div className="trend-recommendations-section">
                  <div className="trend-section-header">
                    <h2 className="trend-section-title">
                      {activeTab === "overview" && "AI-Powered Recommendations"}
                      {activeTab === "analysis" && "Analysis Insights"}
                      {activeTab === "predictions" && "Future Opportunities"}
                      {activeTab === "reports" && "Key Findings"}
                    </h2>
                    <button className="trend-section-btn" onClick={goToLogin}>
                      View All
                      <ChevronRight size={16} />
                    </button>
                  </div>
                  <div className="trend-recommendations-grid">
                    {aiRecommendations[activeTab]?.map((rec, index) => (
                      <div key={index} className="trend-recommendation-card">
                        <div className="trend-rec-icon">
                          {rec.icon}
                        </div>
                        <div className="trend-rec-content">
                          <h3>{rec.title}</h3>
                          <p>{rec.description}</p>
                          <span className={`trend-impact-tag impact-${rec.impact}`}>
                            {rec.impact.charAt(0).toUpperCase() + rec.impact.slice(1)} Impact
                          </span>
                        </div>
                        <button className="trend-rec-btn" onClick={goToLogin}>
                          {activeTab === "reports" ? "View" : "Apply"}
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trending Influencers */}
                <div className="trend-influencers-section">
                  <div className="trend-section-header">
                    <h2 className="trend-section-title">
                      {activeTab === "overview" && "Top Trending Influencers"}
                      {activeTab === "analysis" && "Analytical Leaders"}
                      {activeTab === "predictions" && "Future Stars"}
                      {activeTab === "reports" && "Report Highlights"}
                    </h2>
                    <button className="trend-section-btn" onClick={goToLogin}>
                      See All
                      <ChevronRight size={16} />
                    </button>
                  </div>
                  <div className="trend-influencers-grid">
                    {trendingInfluencers[activeTab]?.map((influencer, index) => (
                      <div key={index} className="trend-influencer-card">
                        <div className="trend-influencer-header">
                          <div className="trend-influencer-info">
                            <div className="trend-influencer-avatar">
                              {influencer.name.charAt(1)}
                            </div>
                            <div>
                              <h3>{influencer.name}</h3>
                              <span className="trend-influencer-category">{influencer.category}</span>
                            </div>
                          </div>
                          <span className="trend-growth-badge">
                            {influencer.growth}
                          </span>
                        </div>
                        <div className="trend-influencer-stats">
                          <div className="trend-stat">
                            <Eye size={16} />
                            <div>
                              <span className="trend-stat-value">{influencer.engagement}%</span>
                              <span className="trend-stat-label">Engagement</span>
                            </div>
                          </div>
                          <div className="trend-stat">
                            <Users size={16} />
                            <div>
                              <span className="trend-stat-value">{influencer.followers}</span>
                              <span className="trend-stat-label">Followers</span>
                            </div>
                          </div>
                          <div className="trend-stat">
                            <Target size={16} />
                            <div>
                              <span className="trend-stat-value">{influencer.match}%</span>
                              <span className="trend-stat-label">Match Score</span>
                            </div>
                          </div>
                        </div>
                        <button className="trend-influencer-btn" onClick={goToLogin}>
                          View {activeTab === "reports" ? "Report" : "Profile"}
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </main>

              {/* Sidebar */}
              <aside className="trend-sidebar">
                {/* Live Alerts */}
                <div className="trend-sidebar-section">
                  <div className="trend-sidebar-header">
                    <h3 className="trend-sidebar-title">
                      {activeTab === "overview" && "Live Trend Alerts"}
                      {activeTab === "analysis" && "Analysis Updates"}
                      {activeTab === "predictions" && "Prediction Alerts"}
                      {activeTab === "reports" && "Report Notifications"}
                    </h3>
                    <AlertCircle size={20} className="trend-alert-icon" />
                  </div>
                  <div className="trend-alerts-list">
                    {liveAlerts[activeTab]?.map((alert, index) => (
                      <div key={index} className="trend-alert-item">
                        <div className="trend-alert-icon-wrapper">
                          {alert.icon}
                        </div>
                        <div className="trend-alert-content">
                          <p>{alert.text}</p>
                          <span className="trend-alert-time">{alert.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live Tracking */}
                <div className="trend-sidebar-section">
                  <div className="trend-sidebar-header">
                    <h3 className="trend-sidebar-title">
                      {activeTab === "overview" && "Live Trend Tracking"}
                      {activeTab === "analysis" && "Analysis Progress"}
                      {activeTab === "predictions" && "Prediction Tracking"}
                      {activeTab === "reports" && "Report Generation"}
                    </h3>
                    <div className="trend-live-indicator">
                      <span className="trend-live-dot"></span>
                      Live
                    </div>
                  </div>
                  <div className="trend-tracking-list">
                    {trendingInfluencers[activeTab]?.map((influencer, index) => (
                      <div key={index} className="trend-tracking-item">
                        <div className="trend-tracking-info">
                          <span className="trend-tracking-name">{influencer.name}</span>
                          <span className="trend-tracking-category">{influencer.category}</span>
                        </div>
                        <div className="trend-tracking-metrics">
                          <div className="trend-tracking-metric">
                            <span className="trend-tracking-value">{influencer.engagement}%</span>
                            <div className="trend-tracking-progress">
                              <div 
                                className="trend-tracking-progress-bar" 
                                style={{ width: `${influencer.engagement}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="trend-sidebar-section">
                  <h3 className="trend-sidebar-title">Quick Actions</h3>
                  <div className="trend-quick-actions">
                    {quickActions[activeTab]?.map((action, index) => (
                      <button key={index} className="trend-quick-action" onClick={action.action}>
                        {action.icon}
                        <span>{action.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* System Status */}
                <div className="trend-sidebar-section">
                  <div className="trend-status-card">
                    <div className="trend-status-header">
                      <h3>System Status</h3>
                      <span className="trend-status-indicator operational">
                        <span className="trend-status-dot"></span>
                        All Systems Operational
                      </span>
                    </div>
                    <div className="trend-status-details">
                      <div className="trend-status-item">
                        <span className="trend-service-name">
                          {activeTab === "overview" && "AI Prediction Engine"}
                          {activeTab === "analysis" && "Analytics Engine"}
                          {activeTab === "predictions" && "Forecasting Engine"}
                          {activeTab === "reports" && "Report Generator"}
                        </span>
                        <span className="trend-service-status operational">Operational</span>
                      </div>
                      <div className="trend-status-item">
                        <span className="trend-service-name">Data Collection</span>
                        <span className="trend-service-status operational">Operational</span>
                      </div>
                      <div className="trend-status-item">
                        <span className="trend-service-name">Real-time Processing</span>
                        <span className="trend-service-status operational">Operational</span>
                      </div>
                      <div className="trend-status-item">
                        <span className="trend-service-name">API Services</span>
                        <span className="trend-service-status operational">Operational</span>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>

        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          .trend-wrapper { width: 100%; background: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; min-height: 100vh; }
          
          /* Hero Section */
          .trend-hero { 
            background: linear-gradient(135deg, #5DADE2 0%, #3b82f6 100%);
            padding: 80px 20px 60px; 
            text-align: center; 
          }
          .trend-hero-content { max-width: 900px; margin: 0 auto; }
          .trend-hero-title { font-size: 48px; font-weight: 700; color: white; margin-bottom: 16px; }
          .trend-hero-subtitle { font-size: 18px; color: rgba(255,255,255,0.95); line-height: 1.7; margin-bottom: 40px; }
          .trend-hero-stats { display: flex; gap: 48px; justify-content: center; margin-bottom: 30px; }
          .trend-stat-item { display: flex; align-items: center; gap: 12px; color: white; }
          .trend-stat-item svg { opacity: 0.9; }
          .trend-stat-item h3 { font-size: 20px; font-weight: 600; margin-bottom: 2px; }
          .trend-stat-item p { font-size: 14px; opacity: 0.9; }
          .trend-status { display: flex; gap: 20px; justify-content: center; align-items: center; }
          .trend-status-indicator { padding: 8px 16px; background: rgba(255,255,255,0.1); border-radius: 20px; color: white; font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
          .trend-status-indicator.connected .status-dot { background: #10B981; }
          .trend-status-indicator.disconnected .status-dot { background: #EF4444; }
          .status-dot { width: 8px; height: 8px; border-radius: 50%; }
          .trend-update-time { font-size: 14px; color: rgba(255,255,255,0.8); }
          
          /* Main Content */
          .trend-main { padding: 40px 0; }
          .trend-container { max-width: 1400px; margin: 0 auto; padding: 0 20px; }
          .trend-layout { display: grid; grid-template-columns: 1fr 350px; gap: 32px; }
          
          /* Content Area */
          .trend-content { display: flex; flex-direction: column; gap: 24px; }
          
          /* Tabs */
          .trend-tabs { display: flex; gap: 8px; background: white; padding: 8px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
          .trend-tab-btn { flex: 1; padding: 12px 16px; background: transparent; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; color: #64748b; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; }
          .trend-tab-btn:hover { background: #f1f5f9; color: #3b82f6; }
          .trend-tab-btn.active { background: linear-gradient(135deg, #5DADE2 0%, #3b82f6 100%);; color: white; }
          
          /* Metrics Grid */
          .trend-metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
          .trend-metric-card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
          .trend-metric-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
          .trend-metric-icon { width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; background: #f1f5f9; border-radius: 12px; }
          .trend-metric-change { padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 600; }
          .trend-metric-change.trend-up { background: #dcfce7; color: #059669; }
          .trend-metric-change.trend-down { background: #fee2e2; color: #dc2626; }
          .trend-metric-value { font-size: 32px; font-weight: 700; color: #1e293b; margin-bottom: 8px; }
          .trend-metric-title { font-size: 14px; color: #64748b; }
          
          /* Charts Grid */
          .trend-charts-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
          .trend-chart-card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
          .trend-chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
          .trend-chart-header h3 { font-size: 16px; font-weight: 600; color: #1e293b; }
          .trend-chart-option { background: transparent; border: none; color: #94a3b8; cursor: pointer; font-size: 18px; padding: 4px; }
          .trend-chart-canvas { height: 250px; position: relative; }
          
          /* Section Headers */
          .trend-section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
          .trend-section-title { font-size: 20px; font-weight: 700; color: #1e293b; }
          .trend-section-btn { display: flex; align-items: center; gap: 4px; background: transparent; border: none; color: #3b82f6; font-size: 14px; font-weight: 600; cursor: pointer; }
          
          /* Recommendations */
          .trend-recommendations-grid { display: flex; flex-direction: column; gap: 16px; }
          .trend-recommendation-card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 16px; transition: 0.2s; }
          .trend-recommendation-card:hover { border-color: #3b82f6; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
          .trend-rec-icon { width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; background: #f5f3ff; color: #3b82f6; border-radius: 12px; }
          .trend-rec-content { flex: 1; }
          .trend-rec-content h3 { font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 4px; }
          .trend-rec-content p { font-size: 14px; color: #64748b; margin-bottom: 8px; }
          .trend-impact-tag { padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; }
          .trend-impact-tag.impact-high { background: #fef3c7; color: #d97706; }
          .trend-impact-tag.impact-medium { background: #dbeafe; color: #3B82F6; }
          .trend-rec-btn { padding: 8px 16px; background: linear-gradient(135deg, #5DADE2 0%, #3b82f6 100%); color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 4px; cursor: pointer; transition: 0.2s; }
          .trend-rec-btn:hover { background:linear-gradient(135deg, #5DADE2 0%, #3b82f6 100%); }
          
          /* Influencers Grid */
          .trend-influencers-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
          .trend-influencer-card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; transition: 0.2s; }
          .trend-influencer-card:hover { border-color: #3b82f6; }
          .trend-influencer-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
          .trend-influencer-info { display: flex; align-items: center; gap: 12px; }
          .trend-influencer-avatar { width: 40px; height: 40px; background: linear-gradient(135deg, #5DADE2 0%, #3b82f6 100%); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; }
          .trend-influencer-info h3 { font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 2px; }
          .trend-influencer-category { font-size: 12px; color: #64748b; background: #f1f5f9; padding: 2px 8px; border-radius: 6px; }
          .trend-growth-badge { padding: 4px 10px; background: #dcfce7; color: #059669; font-size: 12px; font-weight: 600; border-radius: 6px; }
          .trend-influencer-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 20px; }
          .trend-stat { display: flex; align-items: center; gap: 8px; }
          .trend-stat svg { color: #94a3b8; }
          .trend-stat-value { display: block; font-size: 14px; font-weight: 600; color: #1e293b; }
          .trend-stat-label { display: block; font-size: 12px; color: #64748b; }
          .trend-influencer-btn { width: 100%; padding: 10px; background: transparent; border: 1px solid #e2e8f0; border-radius: 8px; color: #3b82f6; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px; transition: 0.2s; }
          .trend-influencer-btn:hover { background: #f5f3ff; border-color: #3b82f6; }
          
          /* Sidebar */
          .trend-sidebar { position: sticky; top: 20px; height: fit-content; display: flex; flex-direction: column; gap: 20px; }
          
          /* Sidebar Sections */
          .trend-sidebar-section { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
          .trend-sidebar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
          .trend-sidebar-title { font-size: 16px; font-weight: 700; color: #1e293b; }
          .trend-alert-icon { color: #3b82f6; }
          
          /* Alerts */
          .trend-alerts-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }
          .trend-alert-item { display: flex; gap: 12px; padding: 12px; background: #f8fafc; border-radius: 8px; }
          .trend-alert-icon-wrapper { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: #f5f3ff; color: #3b82f6; border-radius: 8px; }
          .trend-alert-content { flex: 1; }
          .trend-alert-content p { font-size: 14px; color: #1e293b; margin-bottom: 4px; }
          .trend-alert-time { font-size: 12px; color: #94a3b8; }
          
          /* Live Tracking */
          .trend-live-indicator { display: flex; align-items: center; gap: 4px; padding: 4px 8px; background: #fef3c7; color: #d97706; font-size: 12px; font-weight: 600; border-radius: 6px; }
          .trend-live-dot { width: 6px; height: 6px; background: #f59e0b; border-radius: 50%; animation: pulse 2s infinite; }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          
          .trend-tracking-list { display: flex; flex-direction: column; gap: 12px; }
          .trend-tracking-item { padding: 12px; background: #f8fafc; border-radius: 8px; }
          .trend-tracking-info { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
          .trend-tracking-name { font-size: 14px; font-weight: 600; color: #1e293b; }
          .trend-tracking-category { font-size: 12px; color: #64748b; background: #f1f5f9; padding: 2px 8px; border-radius: 6px; }
          .trend-tracking-metrics { display: flex; align-items: center; gap: 12px; }
          .trend-tracking-metric { flex: 1; }
          .trend-tracking-value { display: block; font-size: 14px; font-weight: 600; color: #3b82f6; margin-bottom: 4px; }
          .trend-tracking-progress { height: 4px; background: #e2e8f0; border-radius: 2px; overflow: hidden; }
          .trend-tracking-progress-bar { height: 100%; background: linear-gradient(135deg, #5DADE2 0%, #3b82f6 100%); border-radius: 2px; }
          
          /* Quick Actions */
          .trend-quick-actions { display: flex; flex-direction: column; gap: 8px; }
          .trend-quick-action { padding: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; display: flex; align-items: center; gap: 12px; color: #4b5563; font-size: 14px; cursor: pointer; transition: 0.2s; }
          .trend-quick-action:hover { background: #f5f3ff; border-color: #3b82f6; color: #3b82f6; }
          
          /* Status Card */
          .trend-status-card { background: #f8fafc; border-radius: 8px; padding: 16px; }
          .trend-status-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
          .trend-status-header h3 { font-size: 16px; font-weight: 600; color: #1e293b; }
          .trend-status-indicator { display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 600; padding: 4px 8px; border-radius: 6px; }
          .trend-status-indicator.operational { background: #dcfce7; color: #059669; }
          .trend-status-dot { width: 6px; height: 6px; border-radius: 50%; }
          .trend-status-indicator.operational .trend-status-dot { background: #10B981; }
          .trend-status-details { display: flex; flex-direction: column; gap: 8px; }
          .trend-status-item { display: flex; justify-content: space-between; align-items: center; padding-bottom: 8px; border-bottom: 1px solid #e2e8f0; }
          .trend-service-name { font-size: 14px; color: #4b5563; }
          .trend-service-status { font-size: 12px; font-weight: 600; padding: 2px 8px; border-radius: 4px; }
          .trend-service-status.operational { background: #f0fdf4; color: #059669; }
          
          /* Responsive Design */
          @media (max-width: 1200px) {
            .trend-layout { grid-template-columns: 1fr; }
            .trend-sidebar { position: relative; }
            .trend-metrics-grid { grid-template-columns: repeat(2, 1fr); }
            .trend-charts-grid { grid-template-columns: 1fr; }
            .trend-influencers-grid { grid-template-columns: 1fr; }
          }
          
          @media (max-width: 768px) {
            .trend-hero-title { font-size: 32px; }
            .trend-hero-subtitle { font-size: 16px; }
            .trend-hero-stats { flex-wrap: wrap; gap: 24px; }
            .trend-metrics-grid { grid-template-columns: 1fr; }
            .trend-tabs { flex-wrap: wrap; }
            .trend-tab-btn { flex: 1 0 calc(50% - 8px); }
          }
        `}</style>
      </div>
    </>
  );
}