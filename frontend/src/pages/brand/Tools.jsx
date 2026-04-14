import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Settings,
  Brain,
  Bot,
  Zap,
  TrendingUp,
  Filter,
  ArrowRight,
  Users,
  Rocket,
  Activity,
  Image as ImageIcon,
  FileSearch,
  Globe,
  Plus,
  Layout
} from "lucide-react";
import "../../style/Tools.css";

const toolsList = [
  {
    id: "find-influencer",
    name: "AI Find Influencer",
    path: "/brand/tools/findinluencers",
    icon: Search,
    description: "Discover real-time influencers using YouTube API with advanced engagement analytics.",
    status: "Popular",
    category: "Discovery",
    color: "#3b82f6",
    bgColor: "rgba(59, 130, 246, 0.1)"
  },
  {
    id: "image-gen",
    name: "AI Image Generator",
    path: "/brand/tools/imagegenarate",
    icon: ImageIcon,
    description: "Generate high-quality campaign assets and storytelling visuals with advanced AI.",
    status: "New",
    category: "Creative",
    color: "#ec4899",
    bgColor: "rgba(236, 72, 153, 0.1)"
  },
  {
    id: "content-analyzer",
    name: "Content Analyzer",
    path: "/brand/tools/content-analyzer",
    icon: FileSearch,
    description: "Deep dive into content performance and sentiment analysis for your campaigns.",
    status: "Popular",
    category: "Analytics",
    color: "#10b981",
    bgColor: "rgba(16, 185, 129, 0.1)"
  },
  {
    id: "integration",
    name: "Market Integration",
    path: "/brand/tools/integration",
    icon: Settings,
    description: "Seamlessly connect with APIs and third-party platforms to synchronize your data.",
    status: "Updated",
    category: "System",
    color: "#64748b",
    bgColor: "rgba(100, 116, 139, 0.1)"
  },
  {
    id: "content-intelligence",
    name: "Content Intelligence",
    path: "/brand/tools/content-intelligence",
    icon: Brain,
    description: "AI-driven insights to optimize your content strategy and increase ROI.",
    status: "Featured",
    category: "Intelligence",
    color: "#8b5cf6",
    bgColor: "rgba(139, 92, 246, 0.1)"
  },
  {
    id: "future-ai",
    name: "Future AI Exploration",
    path: "/brand/tools/futureai",
    icon: Bot,
    description: "Explore experimental AI features and next-gen influencer marketing concepts.",
    status: "Beta",
    category: "Innovation",
    color: "#f97316",
    bgColor: "rgba(249, 115, 22, 0.1)"
  },
  {
    id: "automation-mkt",
    name: "Automation Marketing",
    path: "/brand/tools/automation-marketing",
    icon: Zap,
    description: "Automate complex influencer workflows and multi-channel marketing campaigns.",
    status: "Professional",
    category: "Automation",
    color: "#06b6d4",
    bgColor: "rgba(6, 182, 212, 0.1)"
  },
  {
    id: "global-analytics",
    name: "Analytics Suite",
    path: "/brand/analytics",
    icon: TrendingUp,
    description: "Comprehensive reporting and predictive modeling for all brand activities.",
    status: "Core",
    category: "Analytics",
    color: "#6366f1",
    bgColor: "rgba(99, 102, 241, 0.1)"
  }
];

const quickActions = [
  { icon: Plus, label: "New Campaign", path: "/brand/campaigns/create-campaign" },
  { icon: Users, label: "Find Talent", path: "/brand/tools/findinluencers" },
  { icon: Globe, label: "Explore Market", path: "/brand/profiles/public" },
  { icon: Layout, label: "Workflows", path: "/brand/workflow" }
];

export default function Tools() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  const categories = ["All", ...new Set(toolsList.map(t => t.category))];

  const filteredTools = toolsList.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "All" || tool.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="tools-page">
      <div className="tools-container">
        {/* Header section moved to parent Layout but we can have a local sub-header */}
        <header className="tools-header">
          <div className="title-section">
            <h1 className="title">
              <Rocket className="title-icon" /> AI Tools Ecosystem
            </h1>
            <p className="subtitle">Power your brand with state-of-the-art marketing intelligence</p>
          </div>

          <div className="header-actions">
            <div className="search-box">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </header>

        {/* Quick Actions Bar */}
        <div className="quick-actions-bar">
          {quickActions.map((action, idx) => (
            <button key={idx} onClick={() => navigate(action.path)} className="quick-action-btn">
              <action.icon size={18} />
              <span>{action.label}</span>
            </button>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrap blue">
              <Activity size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Active Modules</span>
              <span className="stat-value">{toolsList.length}</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrap green">
              <Zap size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Automation Runs</span>
              <span className="stat-value">12.4k</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrap purple">
              <Brain size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">AI Predictions</span>
              <span className="stat-value">98.2%</span>
            </div>
          </div>
        </div>

        {/* Main Section */}
        <section className="tools-main">
          <div className="section-header">
            <h2 className="section-title">Digital toolkit</h2>
            <div className="filter-controls">
              <Filter size={16} />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="filter-select"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="tools-grid-layout">
            {filteredTools.map((tool) => (
              <div
                key={tool.id}
                className="professional-tool-card"
                onClick={() => navigate(tool.path)}
              >
                <div className="card-status" style={{ backgroundColor: tool.color }}>
                  {tool.status}
                </div>

                <div className="card-top">
                  <div className="icon-box" style={{ backgroundColor: tool.bgColor }}>
                    <tool.icon size={28} style={{ color: tool.color }} />
                  </div>
                  <span className="category-tag">{tool.category}</span>
                </div>

                <div className="card-body">
                  <h3 className="tool-title">{tool.name}</h3>
                  <p className="tool-desc">{tool.description}</p>
                </div>

                <div className="card-footer">
                  <span className="action-text">Launch Module</span>
                  <ArrowRight size={16} className="arrow-icon" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Custom Solution CTA */}
        <section className="custom-solution-section">
          <div className="cta-gradient-box">
            <div className="cta-content">
              <h3>Custom AI Solutions?</h3>
              <p>Our engineering team can build bespoke AI models tailored to your brand's unique needs.</p>
            </div>
            <button className="white-cta-btn" onClick={() => navigate("/contactUs")}>
              Contact Enterprise
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}