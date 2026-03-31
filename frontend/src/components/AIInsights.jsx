import React, { useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto";
// import HomeTopBar from "../pages/HomePage/HomeTopBar";
import "../style/AIInsights.css";
import { useNavigate } from "react-router-dom";


export default function AIInsights() {
  const metricsChartRef = useRef(null);
  const engagementChartRef = useRef(null);
  const roiChartRef = useRef(null);
  const audienceChartRef = useRef(null);

   const navigate = useNavigate();

  const goToLogin = () => {
    navigate("/login");
  };
  
  const [metrics, setMetrics] = useState({
    engagement: 85.3,
    reach: 245000,
    conversions: 432,
    roi: 325,
    sentiment: 88.4,
    costPerClick: 1.47
  });

  const [activeTab, setActiveTab] = useState("overview");
  const [isConnected, setIsConnected] = useState(true);

  const chartInstances = useRef({
    metrics: null,
    engagement: null,
    roi: null,
    audience: null
  });

  // Initialize charts
  useEffect(() => {
    const initCharts = () => {
      // Destroy existing charts
      Object.values(chartInstances.current).forEach(chart => {
        if (chart) chart.destroy();
      });

      // Performance Overview Radar Chart
      const metricsCtx = metricsChartRef.current.getContext("2d");
      chartInstances.current.metrics = new Chart(metricsCtx, {
        type: "radar",
        data: {
          labels: ["Engagement", "Reach", "Conversions", "ROI", "Sentiment"],
          datasets: [{
            label: "Current Performance",
            data: [85, 92, 78, 95, 88],
            backgroundColor: "rgba(59, 130, 246, 0.2)",
            borderColor: "#3B82F6",
            pointBackgroundColor: "#3B82F6",
            pointBorderColor: "#fff",
            pointBorderWidth: 2
          }, {
            label: "Industry Average",
            data: [65, 70, 60, 75, 68],
            backgroundColor: "rgba(107, 114, 128, 0.1)",
            borderColor: "#6B7280",
            borderDash: [5, 5],
            pointBackgroundColor: "#6B7280"
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
              labels: {
                font: { family: "Inter, sans-serif" }
              }
            },
            title: { 
              display: false 
            }
          },
          scales: {
            r: {
              beginAtZero: true,
              max: 100,
              ticks: {
                font: { family: "Inter, sans-serif" }
              }
            }
          }
        }
      });

      // Engagement Trend Chart
      const engagementCtx = engagementChartRef.current.getContext("2d");
      chartInstances.current.engagement = new Chart(engagementCtx, {
        type: "line",
        data: {
          labels: ["1h", "2h", "3h", "4h", "5h", "6h", "7h", "8h", "9h", "10h", "11h", "12h"],
          datasets: [{
            label: "Engagement Rate",
            data: [65, 59, 80, 81, 56, 55, 40, 45, 60, 75, 80, 85],
            borderColor: "#10B981",
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            tension: 0.4,
            fill: true,
            pointBackgroundColor: "#10B981"
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: {
                font: { family: "Inter, sans-serif" }
              }
            }
          }
        }
      });

      // ROI Comparison Chart
      const roiCtx = roiChartRef.current.getContext("2d");
      chartInstances.current.roi = new Chart(roiCtx, {
        type: "bar",
        data: {
          labels: ["AI-Optimized", "Traditional"],
          datasets: [{
            label: "ROI (%)",
            data: [325, 195],
            backgroundColor: ["#3B82F6", "#9CA3AF"],
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: {
                font: { family: "Inter, sans-serif" }
              }
            }
          }
        }
      });

      // Audience Demographics Chart
      const audienceCtx = audienceChartRef.current.getContext("2d");
      chartInstances.current.audience = new Chart(audienceCtx, {
        type: "doughnut",
        data: {
          labels: ["18-24", "25-34", "35-44", "45-54", "55+"],
          datasets: [{
            data: [25, 35, 20, 12, 8],
            backgroundColor: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"],
            borderWidth: 2,
            borderColor: "#ffffff"
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "right",
              labels: {
                font: { family: "Inter, sans-serif" }
              }
            }
          }
        }
      });
    };

    initCharts();

    // Simulate real-time updates
    const updateInterval = setInterval(() => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      
      document.getElementById('last-update').textContent = `Last update: ${hours}:${minutes}`;
      
      // Simulate metric changes
      setMetrics(prev => ({
        engagement: Math.min(100, Math.max(0, prev.engagement + (Math.random() * 2 - 1))),
        reach: Math.max(0, prev.reach + (Math.random() * 10000 - 5000)),
        conversions: Math.max(0, prev.conversions + (Math.random() * 10 - 5)),
        roi: Math.min(500, Math.max(0, prev.roi + (Math.random() * 5 - 2.5))),
        sentiment: Math.min(100, Math.max(0, prev.sentiment + (Math.random() * 2 - 1))),
        costPerClick: Math.min(5, Math.max(0, prev.costPerClick + (Math.random() * 0.2 - 0.1)))
      }));

      // Update charts with slight variations
      if (chartInstances.current.engagement) {
        const newData = chartInstances.current.engagement.data.datasets[0].data.map(value => 
          Math.min(100, Math.max(0, value + (Math.random() * 3 - 1.5)))
        );
        chartInstances.current.engagement.data.datasets[0].data = newData;
        chartInstances.current.engagement.update('none');
      }
    }, 5000);

    return () => {
      clearInterval(updateInterval);
      Object.values(chartInstances.current).forEach(chart => {
        if (chart) chart.destroy();
      });
    };
  }, []);

  const metricsCards = [
    {
      title: "Engagement Rate",
      value: `${metrics.engagement.toFixed(1)}%`,
      change: "+12.5%",
      trend: "up",
      icon: (
        <svg className="metric-icon" viewBox="0 0 24 24">
          <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
        </svg>
      )
    },
    {
      title: "Total Reach",
      value: `${(metrics.reach / 1000).toFixed(1)}K`,
      change: "+8.3%",
      trend: "up",
      icon: (
        <svg className="metric-icon" viewBox="0 0 24 24">
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
        </svg>
      )
    },
    {
      title: "Conversions",
      value: metrics.conversions.toFixed(0),
      change: "+5.2%",
      trend: "up",
      icon: (
        <svg className="metric-icon" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      )
    },
    {
      title: "ROI",
      value: `${metrics.roi.toFixed(1)}%`,
      change: "+15.7%",
      trend: "up",
      icon: (
        <svg className="metric-icon" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
        </svg>
      )
    },
    {
      title: "Sentiment Score",
      value: `${metrics.sentiment.toFixed(1)}%`,
      change: "+3.4%",
      trend: "up",
      icon: (
        <svg className="metric-icon" viewBox="0 0 24 24">
          <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
        </svg>
      )
    },
    {
      title: "Cost Per Click",
      value: `$${metrics.costPerClick.toFixed(2)}`,
      change: "-2.1%",
      trend: "down",
      icon: (
        <svg className="metric-icon" viewBox="0 0 24 24">
          <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
        </svg>
      )
    }
  ];

  const aiRecommendations = [
    {
      title: "Optimize Posting Times",
      description: "Schedule content for 2:00 PM EST when engagement is 37% higher",
      impact: "High",
      icon: (
        <svg className="rec-icon" viewBox="0 0 24 24">
          <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
        </svg>
      )
    },
    {
      title: "Content Strategy Adjustment",
      description: "Increase video content by 25% based on performance data",
      impact: "Medium",
      icon: (
        <svg className="rec-icon" viewBox="0 0 24 24">
          <path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/>
        </svg>
      )
    },
    {
      title: "Audience Targeting",
      description: "Expand targeting to 25-34 age group showing high intent",
      impact: "High",
      icon: (
        <svg className="rec-icon" viewBox="0 0 24 24">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      )
    }
  ];

  const liveFeedItems = [
    {
      id: 1,
      icon: (
        <svg className="feed-icon" viewBox="0 0 24 24">
          <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
        </svg>
      ),
      message: "Campaign 'Summer Collection' engagement increased by 24%",
      time: "2 minutes ago"
    },
    {
      id: 2,
      icon: (
        <svg className="feed-icon" viewBox="0 0 24 24">
          <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
        </svg>
      ),
      message: "New peak ROI detected: 327% from influencer @fashionista",
      time: "5 minutes ago"
    },
    {
      id: 3,
      icon: (
        <svg className="feed-icon" viewBox="0 0 24 24">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      ),
      message: "Audience segment 25-34 showing 45% higher conversion rate",
      time: "12 minutes ago"
    }
  ];

  const performanceSummary = [
    {
      title: "Top Performing Influencer",
      name: "@TechGuru",
      details: "325% ROI • 45K Engagement",
      metric: "325% ROI"
    },
    {
      title: "Best Performing Content",
      name: "Product Tutorial Video",
      details: "2.4M Views • 12% Conversion",
      metric: "12% Conversion"
    },
    {
      title: "Optimal Posting Time",
      name: "2:00 PM EST",
      details: "37% Higher Engagement",
      metric: "37% Higher"
    }
  ];

  return (
    <>
      {/* <HomeTopBar /> */}
      <div className="ai-insights-container">
        {/* Header */}
        <div className="insights-header">
          <div className="header-content">
            <h1>AI-Powered Insights Dashboard</h1>
            {/* <p>Real-time analytics and intelligent recommendations for your influencer campaigns</p> */}
            <div className="connection-status">
              <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
                {isConnected ? 'Live' : 'Disconnected'}
              </span>
              <span className="last-update" id="last-update">Last update: Just now</span>
              <button className="refresh-btn"  onClick={goToLogin}>
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="insights-content">
          {/* Navigation Tabs */}
          <nav className="insights-tabs">
            <button 
              className={`tab-button ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              <svg className="tab-icon" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
              </svg>
              Overview
            </button>
            <button 
              className={`tab-button ${activeTab === "audience" ? "active" : ""}`}
              onClick={() => setActiveTab("audience")}
            >
              <svg className="tab-icon" viewBox="0 0 24 24">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
              </svg>
              Audience
            </button>
            <button 
              className={`tab-button ${activeTab === "content" ? "active" : ""}`}
              onClick={() => setActiveTab("content")}
            >
              <svg className="tab-icon" viewBox="0 0 24 24">
                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
              </svg>
              Content
            </button>
            <button 
              className={`tab-button ${activeTab === "reports" ? "active" : ""}`}
              onClick={() => setActiveTab("reports")}
            >
              <svg className="tab-icon" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
              </svg>
              Reports
            </button>
          </nav>

          {/* Metrics Grid */}
          <section className="metrics-grid">
            {metricsCards.map((card, index) => (
              <div key={index} className="metric-card">
                <div className="metric-header">
                  <div className="metric-icon-wrapper">
                    {card.icon}
                  </div>
                  <span className={`trend-indicator ${card.trend}`}>
                    {card.trend === "up" ? (
                      <svg width="12" height="12" viewBox="0 0 24 24">
                        <path d="M7 14l5-5 5 5z"/>
                      </svg>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 24 24">
                        <path d="M7 10l5 5 5-5z"/>
                      </svg>
                    )}
                    {card.change}
                  </span>
                </div>
                <div className="metric-value">{card.value}</div>
                <div className="metric-title">{card.title}</div>
              </div>
            ))}
          </section>

          {/* Charts Grid */}
          <section className="charts-grid">
            <div className="chart-card wide">
              <div className="chart-header">
                <h3>Performance Overview</h3>
              </div>
              <div className="chart-container">
                <canvas ref={metricsChartRef} />
              </div>
            </div>
            <div className="chart-card wide">
              <div className="chart-header">
                <h3>Engagement Trend (Last 12h)</h3>
              </div>
              <div className="chart-container">
                <canvas ref={engagementChartRef} />
              </div>
            </div>
            <div className="chart-card">
              <div className="chart-header">
                <h3>ROI Comparison</h3>
              </div>
              <div className="chart-container">
                <canvas ref={roiChartRef} />
              </div>
            </div>
            <div className="chart-card">
              <div className="chart-header">
                <h3>Audience Age Distribution</h3>
              </div>
              <div className="chart-container">
                <canvas ref={audienceChartRef} />
              </div>
            </div>
          </section>

          {/* AI Recommendations */}
          <section className="recommendations-section">
            <div className="section-header">
              <h2>AI Recommendations</h2>
              <span className="badge">3 New</span>
            </div>
            <div className="recommendations-grid">
              {aiRecommendations.map((rec, index) => (
                <div key={index} className="recommendation-card">
                  <div className="rec-icon-wrapper">
                    {rec.icon}
                  </div>
                  <div className="rec-content">
                    <h3>{rec.title}</h3>
                    <p>{rec.description}</p>
                    <span className={`impact-tag impact-${rec.impact.toLowerCase()}`}>
                      {rec.impact} Impact
                    </span>
                  </div>
                  <button className="apply-button"  onClick={goToLogin}>Apply</button>
                </div>
              ))}
            </div>
          </section>

          {/* Bottom Section */}
          <div className="bottom-section">
            {/* Live Activity Feed */}
            <section className="live-feed">
              <div className="section-header">
                <h2>Live Activity Feed</h2>
                <span className="live-badge">Live</span>
              </div>
              <div className="feed-container">
                {liveFeedItems.map((item) => (
                  <div key={item.id} className="feed-item">
                    <div className="feed-icon-wrapper">
                      {item.icon}
                    </div>
                    <div className="feed-content">
                      <p>{item.message}</p>
                      <span className="feed-time">{item.time}</span>
                    </div>
                    <button className="feed-more">
                      <svg width="16" height="16" viewBox="0 0 24 24">
                        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Performance Summary */}
            <section className="performance-summary">
              <div className="section-header">
                <h2>Performance Summary</h2>
              </div>
              <div className="summary-grid">
                {performanceSummary.map((item, index) => (
                  <div key={index} className="summary-card">
                    <h3>{item.title}</h3>
                    <div className="summary-content">
                      <div className="summary-details">
                        <h4>{item.name}</h4>
                        <p>{item.details}</p>
                      </div>
                      <span className="summary-metric">{item.metric}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="view-report-btn"  onClick={goToLogin}>
                View Detailed Report
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                </svg>
              </button>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}