// import React, { useState } from "react";
// import { Link } from "react-router-dom";
// import {
//   FaSearch,
//   FaCogs,
//   FaBrain,
//   FaRobot,
//   FaBolt,
//   FaChartLine,
//   FaFilter,
//   FaSun,
//   FaMoon,
//   FaArrowRight,
//   FaUserFriends,
//   FaRocket,
// } from "react-icons/fa";
// import "../../style/Tools.css";

// const tools = [
//   {
//     name: "AI Find Influencer",
//     path: "/brand/tools/findinluencers",
//     icon: <FaSearch size={24} />,
//     description: "Discover real-time influencers using YouTube API with analytics.",
//     status: "Popular",
//     color: "blue",
//   },
//   {
//     name: "Integration",
//     path: "/brand/tools/integration",
//     icon: <FaCogs size={24} />,
//     description: "Connect with APIs & third-party platforms seamlessly.",
//     status: "New",
//     color: "green",
//   },
//   {
//     name: "Content Intelligence",
//     path: "/brand/tools/content-intelligence",
//     icon: <FaBrain size={24} />,
//     description: "AI-driven insights to optimize your content strategy.",
//     status: "Featured",
//     color: "purple",
//   },
//   {
//     name: "Future AI",
//     path: "/brand/tools/futureai",
//     icon: <FaRobot size={24} />,
//     description: "Explore experimental AI features and next-gen ideas.",
//     status: "Beta",
//     color: "orange",
//   },
//   {
//     name: "Automation Marketing",
//     path: "/brand/tools/automation-marketing",
//     icon: <FaBolt size={24} />,
//     description: "Automate influencer campaigns and marketing workflows.",
//     status: "Updated",
//     color: "pink",
//   },
//   {
//     name: "Analytics Suite",
//     path: "/brand/tools/analytics",
//     icon: <FaChartLine size={24} />,
//     description: "Deep dive into performance metrics and campaign analytics.",
//     status: "Popular",
//     color: "indigo",
//   },
// ];

// export default function Tools() {
//   const [darkMode, setDarkMode] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");

//   const filteredTools = tools.filter(
//     (tool) =>
//       tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       tool.description.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   return (
//     <div className={`tools-page ${darkMode ? "dark" : ""}`}>
//       {/* Header Section */}
//       <div className="tools-header">
//         <div>
//           <h1 className="title">
//             <FaRocket className="title-icon" />
//             Tools Dashboard
//           </h1>
//           <p className="subtitle">Access all your marketing tools in one place</p>
//         </div>

//         <div className="header-actions">
//           <div className="search-box">
//             <FaSearch className="search-icon" />
//             <input
//               type="text"
//               placeholder="Search tools..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//             />
//           </div>
//           <button className="toggle-dark" onClick={() => setDarkMode(!darkMode)}>
//             {darkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
//           </button>
//         </div>
//       </div>

//       {/* Stats Overview */}
//       <div className="stats-grid">
//         <div className="stat-card">
//           <div className="stat-icon blue">
//             <FaUserFriends size={20} />
//           </div>
//           <div>
//             <h3>Influencers Found</h3>
//             <p className="stat-number">2,458</p>
//           </div>
//         </div>

//         <div className="stat-card">
//           <div className="stat-icon green">
//             <FaChartLine size={20} />
//           </div>
//           <div>
//             <h3>Campaigns Active</h3>
//             <p className="stat-number">24</p>
//           </div>
//         </div>

//         <div className="stat-card">
//           <div className="stat-icon purple">
//             <FaBolt size={20} />
//           </div>
//           <div>
//             <h3>Tasks Completed</h3>
//             <p className="stat-number">1,287</p>
//           </div>
//         </div>
//       </div>

//       {/* Tools Grid */}
//       <div className="tools-section">
//         <div className="tools-section-header">
//           <h2>All Tools</h2>
//           <div className="filter-box">
//             <FaFilter size={14} />
//             <span>Filter by:</span>
//             <select>
//               <option>All</option>
//               <option>Popular</option>
//               <option>New</option>
//               <option>Beta</option>
//             </select>
//           </div>
//         </div>

//         <div className="tools-grid">
//           {filteredTools.map((tool) => (
//             <Link key={tool.path} to={tool.path} className="tool-card">
//               <div className={`status-badge ${tool.color}`}>{tool.status}</div>
//               <div className="tool-content">
//                 <div className="tool-icon">{tool.icon}</div>
//                 <h3>{tool.name}</h3>
//                 <p>{tool.description}</p>
//                 <div className="explore">
//                   <span>Explore tool</span>
//                   <FaArrowRight size={14} />
//                 </div>
//               </div>
//             </Link>
//           ))}
//         </div>
//       </div>

//       {/* Bottom CTA */}
//       <div className="cta-box">
//         <div>
//           <h2>Need something customized?</h2>
//           <p>Contact our team to build custom solutions for your brand</p>
//         </div>
//         <button className="cta-button">Request Custom Tool</button>
//       </div>
//     </div>
//   );
// }



import React, { useState } from "react";
import {
  Search,
  Settings,
  Brain,
  Bot,
  Zap,
  TrendingUp,
  Filter,
  Sun,
  Moon,
  ArrowRight,
  Users,
  Rocket,
  Activity,
  Target,
  BarChart3,
  PieChart
} from "lucide-react";

const tools = [
  {
    name: "AI Find Influencer",
    path: "/brand/tools/findinluencers",
    icon: Search,
    description: "Discover real-time influencers using YouTube API with analytics.",
    status: "Popular",
    statusColor: "#3b82f6",
  },
  {
    name: "Integration",
    path: "/brand/tools/integration",
    icon: Settings,
    description: "Connect with APIs & third-party platforms seamlessly.",
    status: "New",
    statusColor: "#10b981",
  },
  {
    name: "Content Intelligence",
    path: "/brand/tools/content-intelligence",
    icon: Brain,
    description: "AI-driven insights to optimize your content strategy.",
    status: "Featured",
    statusColor: "#8b5cf6",
  },
  {
    name: "Future AI",
    path: "/brand/tools/futureai",
    icon: Bot,
    description: "Explore experimental AI features and next-gen ideas.",
    status: "Beta",
    statusColor: "#f97316",
  },
  {
    name: "Automation Marketing",
    path: "/brand/tools/automation-marketing",
    icon: Zap,
    description: "Automate influencer campaigns and marketing workflows.",
    status: "Updated",
    statusColor: "#ec4899",
  },
  {
    name: "Analytics Suite",
    path: "/brand/tools/analytics",
    icon: BarChart3,
    description: "Deep dive into performance metrics and campaign analytics.",
    status: "Popular",
    statusColor: "#3b82f6",
  },
];

const quickActions = [
  {
    title: "Create Campaign",
    description: "Launch a new influencer campaign",
    icon: Target,
    color: "#3b82f6",
  },
  {
    title: "View Applications",
    description: "Review pending applications",
    icon: Activity,
    color: "#10b981",
  },
  {
    title: "Analytics Dashboard",
    description: "Campaign performance insights",
    icon: PieChart,
    color: "#8b5cf6",
  },
  {
    title: "AI Tools",
    description: "AI-powered marketing tools",
    icon: Brain,
    color: "#f59e0b",
  },
];

export default function Tools() {
  // const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterValue, setFilterValue] = useState("All");

  const filteredTools = tools.filter(
    (tool) =>
      (tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (filterValue === "All" || tool.status === filterValue)
  );

  const handleToolClick = (path) => {
    console.log('Navigate to:', path);
    // Add navigation logic here
  };

  return (
   <div className="tdb-wrapper">

      <div className="tdb-container">
        {/* Header Section */}
        <header className="tdb-header">
          <div className="tdb-header-left">
            <div className="tdb-title-wrapper">
              <Rocket className="tdb-title-icon" size={28} />
              <h1 className="tdb-title">Tools Dashboard</h1>
            </div>
            <p className="tdb-subtitle">Access all your marketing tools in one place</p>
          </div>

          <div className="tdb-header-actions">
            <div className="tdb-search-box">
              <Search className="tdb-search-icon" size={18} />
              <input
                type="text"
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="tdb-search-input"
              />
            </div>
            {/* <button 
              className="tdb-toggle-dark" 
              onClick={() => setDarkMode(!darkMode)}
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button> */}
          </div>
        </header>

        {/* Stats Overview */}
        <section className="tdb-stats-section">
          <div className="tdb-stats-grid">
            <div className="tdb-stat-card">
              <div className="tdb-stat-icon tdb-stat-blue">
                <Users size={24} />
              </div>
              <div className="tdb-stat-content">
                <h3 className="tdb-stat-label">Influencers Found</h3>
                <p className="tdb-stat-number">2,458</p>
              </div>
            </div>

            <div className="tdb-stat-card">
              <div className="tdb-stat-icon tdb-stat-green">
                <TrendingUp size={24} />
              </div>
              <div className="tdb-stat-content">
                <h3 className="tdb-stat-label">Campaigns Active</h3>
                <p className="tdb-stat-number">24</p>
              </div>
            </div>

            <div className="tdb-stat-card">
              <div className="tdb-stat-icon tdb-stat-purple">
                <Zap size={24} />
              </div>
              <div className="tdb-stat-content">
                <h3 className="tdb-stat-label">Tasks Completed</h3>
                <p className="tdb-stat-number">1,287</p>
              </div>
            </div>
          </div>
        </section>

        {/* Tools Section */}
        <section className="tdb-tools-section">
          <div className="tdb-section-header">
            <h2 className="tdb-section-title">All Tools</h2>
            <div className="tdb-filter-box">
              <Filter size={16} />
              <span className="tdb-filter-label">Filter by:</span>
              <select 
                className="tdb-filter-select"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
              >
                <option>All</option>
                <option>Popular</option>
                <option>New</option>
                <option>Beta</option>
                <option>Featured</option>
                <option>Updated</option>
              </select>
            </div>
          </div>

          <div className="tdb-tools-grid">
            {filteredTools.map((tool) => {
              const IconComponent = tool.icon;
              return (
                <div 
                  key={tool.path} 
                  className="tdb-tool-card"
                  onClick={() => handleToolClick(tool.path)}
                >
                  <div 
                    className="tdb-status-badge" 
                    style={{ backgroundColor: tool.statusColor }}
                  >
                    {tool.status}
                  </div>
                  <div className="tdb-tool-content">
                    <div 
                      className="tdb-tool-icon"
                      style={{ backgroundColor: `${tool.statusColor}15` }}
                    >
                      <IconComponent size={28} style={{ color: tool.statusColor }} />
                    </div>
                    <h3 className="tdb-tool-title">{tool.name}</h3>
                    <p className="tdb-tool-description">{tool.description}</p>
                    <div className="tdb-explore-link">
                      <span>Explore tool</span>
                      <ArrowRight size={16} />
                    </div>
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
              <h2 className="tdb-cta-title">Need something customized?</h2>
              <p className="tdb-cta-text">Contact our team to build custom solutions for your brand</p>
            </div>
            <button className="tdb-cta-button">Request Custom Tool</button>
          </div>
        </section>

        {/* Quick Actions Footer */}
        {/* <section className="tdb-quick-actions">
          <div className="tdb-quick-actions-grid">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <div key={index} className="tdb-quick-action-card">
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
              );
            })}
          </div>
        </section> */}
      </div>

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .tdb-wrapper {
          min-height: 100vh;
          background: #f8fafc;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #1e293b;
          transition: all 0.3s ease;
        }


        .tdb-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 40px 32px;
        }

        .tdb-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          gap: 32px;
        }

        .tdb-header-left {
          flex: 1;
        }

        .tdb-title-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .tdb-title-icon {
          color: #3b82f6;
        }

        .tdb-title {
          font-size: 32px;
          font-weight: 700;
          color: #1e293b;
        }



        .tdb-subtitle {
          font-size: 15px;
          color: #64748b;
        }

        .tdb-header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .tdb-search-box {
          position: relative;
          display: flex;
          align-items: center;
        }

        .tdb-search-icon {
          position: absolute;
          left: 16px;
          color: #94a3b8;
        }

        .tdb-search-input {
          padding: 12px 16px 12px 48px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 14px;
          width: 300px;
          background: white;
          color: #1e293b;
          transition: all 0.3s ease;
        }



        .tdb-search-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .tdb-toggle-dark {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #64748b;
        }

 

        .tdb-toggle-dark:hover {
          border-color: #3b82f6;
          color: #3b82f6;
        }

        .tdb-stats-section {
          margin-bottom: 40px;
        }

        .tdb-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .tdb-stat-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 28px;
          display: flex;
          align-items: center;
          gap: 20px;
          transition: all 0.3s ease;
        }



        .tdb-stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
        }

        .tdb-stat-icon {
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          flex-shrink: 0;
        }

        .tdb-stat-blue {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }

        .tdb-stat-green {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .tdb-stat-purple {
          background: rgba(139, 92, 246, 0.1);
          color: #8b5cf6;
        }

        .tdb-stat-content {
          flex: 1;
        }

        .tdb-stat-label {
          font-size: 14px;
          color: #64748b;
          font-weight: 500;
          margin-bottom: 6px;
        }

        .tdb-stat-number {
          font-size: 32px;
          font-weight: 700;
          color: #1e293b;
        }



        .tdb-tools-section {
          margin-bottom: 40px;
        }

        .tdb-section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .tdb-section-title {
          font-size: 24px;
          font-weight: 700;
          color: #1e293b;
        }



        .tdb-filter-box {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 16px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
        }



        .tdb-filter-label {
          font-size: 14px;
          color: #64748b;
          font-weight: 500;
        }

        .tdb-filter-select {
          padding: 4px 8px;
          border: none;
          background: transparent;
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
          cursor: pointer;
        }



        .tdb-filter-select:focus {
          outline: none;
        }

        .tdb-tools-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .tdb-tool-card {
          position: relative;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 28px;
          cursor: pointer;
          transition: all 0.3s ease;
          overflow: hidden;
        }



        .tdb-tool-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 32px rgba(0, 0, 0, 0.12);
          border-color: #3b82f6;
        }

        .tdb-status-badge {
          position: absolute;
          top: 16px;
          right: 16px;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          color: white;
        }

        .tdb-tool-content {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .tdb-tool-icon {
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
        }

        .tdb-tool-title {
          font-size: 20px;
          font-weight: 700;
          color: #1e293b;
        }



        .tdb-tool-description {
          font-size: 14px;
          color: #64748b;
          line-height: 1.6;
        }

        .tdb-explore-link {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #3b82f6;
          margin-top: auto;
        }

        .tdb-cta-section {
          margin-bottom: 40px;
        }

        .tdb-cta-box {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          border-radius: 20px;
          padding: 48px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 32px;
        }

        .tdb-cta-content {
          flex: 1;
        }

        .tdb-cta-title {
          font-size: 28px;
          font-weight: 700;
          color: white;
          margin-bottom: 8px;
        }

        .tdb-cta-text {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.9);
        }

        .tdb-cta-button {
          padding: 16px 32px;
          background: white;
          color: #3b82f6;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .tdb-cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        }

        .tdb-quick-actions {
          margin-top: 48px;
        }

        .tdb-quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        .tdb-quick-action-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: all 0.3s ease;
          cursor: pointer;
        }


        .tdb-quick-action-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        }

        .tdb-quick-action-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          flex-shrink: 0;
        }

        .tdb-quick-action-content {
          flex: 1;
        }

        .tdb-quick-action-title {
          font-size: 14px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 4px;
        }



        .tdb-quick-action-desc {
          font-size: 12px;
          color: #64748b;
        }

        @media (max-width: 1200px) {
          .tdb-tools-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .tdb-quick-actions-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .tdb-container {
            padding: 24px 20px;
          }
          .tdb-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .tdb-header-actions {
            width: 100%;
            flex-direction: column;
          }
          .tdb-search-input {
            width: 100%;
          }
          .tdb-stats-grid,
          .tdb-tools-grid,
          .tdb-quick-actions-grid {
            grid-template-columns: 1fr;
          }
          .tdb-cta-box {
            flex-direction: column;
            padding: 32px 24px;
            text-align: center;
          }
          .tdb-section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
        }
      `}</style>
    </div>
  );
}