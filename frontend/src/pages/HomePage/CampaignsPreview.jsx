import React from "react";
import { Link } from "react-router-dom";
import "../../style/CampaignsPreview.css";
import { FaTrophy, FaUsers } from "react-icons/fa";


/**
 * CampaignMetric Component
 * Displays campaign performance metrics
 */
const CampaignMetric = ({ value, label, trend }) => (
  <div className="cp-metric-item">
    <span className="cp-metric-value">{value}</span>
    <span className="cp-metric-label">{label}</span>
    {trend && <span className={`cp-metric-trend ${trend.type}`}>{trend.value}</span>}
  </div>
);

/**
 * PlatformBadge Component
 * Displays platform-specific badges with unique styling
 */
const PlatformBadge = ({ platform }) => {
  const platformClass = platform.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className={`cp-platform-badge cp-platform-${platformClass}`}>
      <span className="cp-badge-icon"></span>
      {platform}
    </div>
  );
};

/**
 * CampaignCard Component
 * Enhanced with more content and interactive elements
 */
const CampaignCard = ({ campaign, index }) => (
  <div className={`cp-campaign-card cp-card-${index + 1}`} data-aos="fade-up" data-aos-delay={index * 100}>
    <div className="cp-card-inner">
      {/* Image Section */}
      <div className="cp-image-section">
        <div className="cp-image-container">
          <img src={campaign.image} alt={campaign.title} className="cp-campaign-image" />
          <div className="cp-image-overlay">
            <div className="cp-overlay-content">
              <span className="cp-quick-view">Quick View</span>
            </div>
          </div>
        </div>
        <PlatformBadge platform={campaign.platform} />
        
        {/* Campaign Duration */}
        <div className="cp-campaign-duration">
          <span className="cp-duration-icon">⏱</span>
          {campaign.duration}
        </div>
      </div>

      {/* Content Section */}
      <div className="cp-content-section">
        <div className="cp-campaign-header">
          <h3 className="cp-campaign-title">{campaign.title}</h3>
          <div className="cp-industry-tags">
            {campaign.industries.map((industry, idx) => (
              <span key={idx} className="cp-industry-tag">{industry}</span>
            ))}
          </div>
        </div>

        <p className="cp-campaign-stats">{campaign.stats}</p>
        <p className="cp-campaign-description">{campaign.description}</p>

        {/* Key Metrics */}
        <div className="cp-metrics-grid">
          {campaign.metrics.map((metric, idx) => (
            <CampaignMetric 
              key={idx}
              value={metric.value}
              label={metric.label}
              trend={metric.trend}
            />
          ))}
        </div>

        {/* Influencer Details */}
        <div className="cp-influencer-info">
          <div className="cp-influencer-count">
            <span className="cp-count-icon"><FaUsers /></span>
            {campaign.influencers.count} Influencers
          </div>
          <div className="cp-influencer-tier">
            Tier: <span className="cp-tier-value">{campaign.influencers.tier}</span>
          </div>
        </div>

        {/* Campaign Goals */}
        <div className="cp-campaign-goals">
          <h4>Campaign Goals:</h4>
          <ul className="cp-goals-list">
            {campaign.goals.map((goal, idx) => (
              <li key={idx} className="cp-goal-item">
                <span className="cp-goal-check">✓</span>
                {goal}
              </li>
            ))}
          </ul>
        </div>

        {/* ROI Section */}
        <div className="cp-roi-section">
          <div className="cp-roi-main">
            <span className="cp-roi-value">{campaign.result.value}</span>
            <span className="cp-roi-label">{campaign.result.label}</span>
          </div>
          {campaign.result.additional && (
            <div className="cp-roi-additional">
              <span>{campaign.result.additional}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="cp-action-buttons">
          <Link to={campaign.link} className="cp-btn cp-btn-primary">
            View Detailed Case Study
            <span className="cp-btn-arrow">→</span>
          </Link>
          <button className="cp-btn cp-btn-secondary">
            Quick Insights
          </button>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Enhanced CampaignsPreview Component
 */
const CampaignsPreview = () => {
  const campaigns = [
    {
      image: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80",
      platform: "Instagram",
      title: "Summer Collection Launch 2024",
      duration: "4 Weeks",
      stats: "+245% Engagement • 3.2M Reach • 45K Interactions",
      description: "Strategic influencer partnership campaign targeting millennials and Gen Z for summer fashion collection. Leveraged micro and macro influencers for authentic content creation.",
      industries: ["Fashion", "Lifestyle", "E-commerce"],
      metrics: [
        { value: "3.2M", label: "Total Reach", trend: { value: "+45%", type: "positive" } },
        { value: "245%", label: "Engagement Rate", trend: { value: "+89%", type: "positive" } },
        { value: "18.5K", label: "Content Shares", trend: { value: "+120%", type: "positive" } },
        { value: "12.4%", label: "Conversion Rate", trend: { value: "+67%", type: "positive" } }
      ],
      influencers: {
        count: 28,
        tier: "Micro & Macro Mix"
      },
      goals: [
        "Brand Awareness Boost",
        "Product Launch Visibility",
        "Website Traffic Increase",
        "Sales Conversion Growth"
      ],
      result: { 
        value: "$152K", 
        label: "Total Revenue Generated",
        additional: "8.2x ROI on Ad Spend"
      },
      link: "/campaigns/summer-2024"
    },
    {
      image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      platform: "YouTube",
      title: "Fitness Transformation Challenge",
      duration: "8 Weeks",
      stats: "+189% Conversions • 850K Views • 25K Challenge Participants",
      description: "8-week fitness challenge featuring certified trainers and fitness influencers. Daily workout routines, nutrition guides, and community engagement.",
      industries: ["Fitness", "Wellness", "Supplement"],
      metrics: [
        { value: "850K", label: "Video Views", trend: { value: "+92%", type: "positive" } },
        { value: "189%", label: "Conversion Lift", trend: { value: "+110%", type: "positive" } },
        { value: "25K", label: "Participants", trend: { value: "+200%", type: "positive" } },
        { value: "45%", label: "Completion Rate", trend: { value: "+25%", type: "positive" } }
      ],
      influencers: {
        count: 15,
        tier: "Certified Experts"
      },
      goals: [
        "Community Building",
        "Product Education",
        "Long-term Engagement",
        "Supplement Sales"
      ],
      result: { 
        value: "8.5x", 
        label: "Return on Ad Spend",
        additional: "$89K in Direct Sales"
      },
      link: "/campaigns/fitness-challenge"
    },
    {
      image: "https://images.unsplash.com/photo-1550745165-9bc0b252726c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      platform: "TikTok",
      title: "Tech Gadget Giveaway Blitz",
      duration: "2 Weeks",
      stats: "+312% Awareness • 5.1M Views • 125K Entries",
      description: "Viral TikTok campaign featuring tech unboxings, creative challenges, and massive giveaway. Leveraged trending sounds and effects for maximum reach.",
      industries: ["Technology", "Gaming", "Electronics"],
      metrics: [
        { value: "5.1M", label: "Total Views", trend: { value: "+312%", type: "positive" } },
        { value: "125K", label: "Contest Entries", trend: { value: "+450%", type: "positive" } },
        { value: "42K", label: "New Followers", trend: { value: "+280%", type: "positive" } },
        { value: "2.8M", label: "Hashtag Uses", trend: { value: "+190%", type: "positive" } }
      ],
      influencers: {
        count: 35,
        tier: "Trend Creators"
      },
      goals: [
        "Viral Awareness",
        "Follower Growth",
        "Brand Buzz Creation",
        "Product Sampling"
      ],
      result: { 
        value: "42K", 
        label: "New Community Members",
        additional: "15K Email Subscribers"
      },
      link: "/campaigns/tech-giveaway"
    },
    {
      image: "https://images.unsplash.com/photo-1593305981413-5F3b6c365643?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      platform: "Twitch",
      title: "Gaming Launch Spectacular",
      duration: "72 Hours",
      stats: "2.5M Live Views • 35K Concurrents • 120K Wishlist Adds",
      description: "Multi-streamer launch event featuring exclusive gameplay, developer interviews, and live community interaction across major gaming categories.",
      industries: ["Gaming", "Entertainment", "Software"],
      metrics: [
        { value: "2.5M", label: "Live Views", trend: { value: "+180%", type: "positive" } },
        { value: "35K", label: "Peak Concurrent", trend: { value: "+220%", type: "positive" } },
        { value: "120K", label: "Wishlist Adds", trend: { value: "+310%", type: "positive" } },
        { value: "18.2K", label: "Chat Messages", trend: { value: "+150%", type: "positive" } }
      ],
      influencers: {
        count: 12,
        tier: "Top Streamers"
      },
      goals: [
        "Launch Hype Generation",
        "Pre-order Acceleration",
        "Community Building",
        "Press Coverage"
      ],
      result: { 
        value: "120K", 
        label: "Pre-launch Wishlists",
        additional: "$450K Day-1 Sales"
      },
      link: "/campaigns/gaming-launch"
    },
    {
      image: "https://images.unsplash.com/photo-1498837167922-ddd27525d355?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      platform: "Pinterest",
      title: "Artisanal Food Experience",
      duration: "6 Weeks",
      stats: "+4.2K Repins • +19% CTR • 45K Recipe Views",
      description: "Visual storytelling campaign showcasing premium food products through recipe inspiration, cooking tutorials, and seasonal content strategies.",
      industries: ["Food & Beverage", "Lifestyle", "Home"],
      metrics: [
        { value: "4.2K", label: "Content Repins", trend: { value: "+85%", type: "positive" } },
        { value: "19%", label: "Click-through Rate", trend: { value: "+42%", type: "positive" } },
        { value: "45K", label: "Recipe Views", trend: { value: "+65%", type: "positive" } },
        { value: "2.1K", label: "Shopping Clicks", trend: { value: "+78%", type: "positive" } }
      ],
      influencers: {
        count: 8,
        tier: "Food Experts"
      },
      goals: [
        "Visual Brand Building",
        "Recipe Content Creation",
        "Direct Sales Driving",
        "Seasonal Promotion"
      ],
      result: { 
        value: "$98K", 
        label: "Direct E-commerce Sales",
        additional: "3.4x ROAS"
      },
      link: "/campaigns/artisanal-food"
    },
    {
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      platform: "LinkedIn",
      title: "B2B SaaS Thought Leadership",
      duration: "12 Weeks",
      stats: "85K Impressions • 2.4K Leads • 320% MQL Increase",
      description: "Professional content series featuring industry experts, case studies, and data-driven insights targeting enterprise decision-makers and IT professionals.",
      industries: ["SaaS", "B2B", "Technology"],
      metrics: [
        { value: "85K", label: "Targeted Impressions", trend: { value: "+95%", type: "positive" } },
        { value: "2.4K", label: "Qualified Leads", trend: { value: "+320%", type: "positive" } },
        { value: "45%", label: "Engagement Rate", trend: { value: "+120%", type: "positive" } },
        { value: "18", label: "Enterprise Demos", trend: { value: "+250%", type: "positive" } }
      ],
      influencers: {
        count: 6,
        tier: "Industry Leaders"
      },
      goals: [
        "Thought Leadership",
        "Lead Generation",
        "Brand Authority",
        "Enterprise Outreach"
      ],
      result: { 
        value: "$1.2M", 
        label: "Pipeline Generated",
        additional: "28 Enterprise Opportunities"
      },
      link: "/campaigns/b2b-saas"
    }
  ];

  return (
    <section className="cp-preview-section" id="campaigns-preview">
      {/* Background Elements */}
      <div className="cp-background-elements">
        <div className="cp-bg-pattern"></div>
        <div className="cp-bg-gradient"></div>
        <div className="cp-floating-shapes">
          <div className="cp-shape-1"></div>
          <div className="cp-shape-2"></div>
          <div className="cp-shape-3"></div>
        </div>
      </div>

      {/* Main Container */}
      <div className="cp-container">
        {/* Section Header */}
        <div className="cp-section-header" data-aos="fade-up">
          <div className="cp-header-badge">
            <span className="cp-badge-icon"><FaTrophy /></span>
            Proven Success Stories
          </div>
          <h2 className="cp-section-title">Campaigns That Deliver Results</h2>
          <p className="cp-section-subtitle">
            Explore real campaigns that achieved exceptional ROI across different industries and platforms. 
            Each case study demonstrates the power of strategic influencer partnerships.
          </p>
          
          {/* Platform Filter Tabs */}
          <div className="cp-platform-filters">
            <button className="cp-filter-btn cp-filter-active">All Platforms</button>
            <button className="cp-filter-btn">Instagram</button>
            <button className="cp-filter-btn">YouTube</button>
            <button className="cp-filter-btn">TikTok</button>
            <button className="cp-filter-btn">Twitch</button>
            <button className="cp-filter-btn">Pinterest</button>
            <button className="cp-filter-btn">LinkedIn</button>
          </div>
        </div>

        {/* Campaigns Grid */}
        <div className="cp-campaigns-grid">
          {campaigns.map((campaign, index) => (
            <CampaignCard 
              key={campaign.link}
              campaign={campaign}
              index={index}
            />
          ))}
        </div>

        {/* Statistics Banner */}
        <div className="cp-stats-banner" data-aos="fade-up">
          <div className="cp-stats-container">
            <div className="cp-stat-item">
              <span className="cp-stat-number">500+</span>
              <span className="cp-stat-label">Campaigns Managed</span>
            </div>
            <div className="cp-stat-item">
              <span className="cp-stat-number">$15M+</span>
              <span className="cp-stat-label">Revenue Generated</span>
            </div>
            <div className="cp-stat-item">
              <span className="cp-stat-number">98%</span>
              <span className="cp-stat-label">Client Satisfaction</span>
            </div>
            <div className="cp-stat-item">
              <span className="cp-stat-number">8.2x</span>
              <span className="cp-stat-label">Average ROI</span>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="cp-cta-section" data-aos="fade-up">
          <div className="cp-cta-content">
            <h3 className="cp-cta-title">Ready to Create Your Success Story?</h3>
            <p className="cp-cta-description">
              Join thousands of brands that trust our platform to drive real results through 
              data-driven influencer marketing strategies.
            </p>
            <div className="cp-cta-actions">
              <Link to="/campaigns" className="cp-btn cp-btn-primary cp-btn-large">
                Explore All Case Studies
                <span className="cp-btn-arrow">→</span>
              </Link>
              <Link to="/demo" className="cp-btn cp-btn-secondary cp-btn-large">
                Request Custom Proposal
              </Link>
            </div>
            <div className="cp-cta-features">
              <span className="cp-feature-item">✓ Free Strategy Session</span>
              <span className="cp-feature-item">✓ Custom Campaign Planning</span>
              <span className="cp-feature-item">✓ ROI Guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CampaignsPreview;