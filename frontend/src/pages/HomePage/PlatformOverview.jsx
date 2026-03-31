import React, { useState } from 'react';
import { 
  FaRocket, 
  FaChartLine, 
  FaUsers, 
  FaCheckCircle,
  FaBolt,
  FaRegLightbulb,
  FaPlay,
  FaArrowRight,
  FaHeart, FaBullseye, FaChartBar
} from 'react-icons/fa';
import { useNavigate } from "react-router-dom";


const QuickboxPlatform = () => {
  const [activeTab, setActiveTab] = useState('discover');

  const navigate = useNavigate();

  const goToLogin = () => {
    navigate("/login");
  };
  
  const tabs = [
    { id: 'discover', label: 'Discover', icon: FaUsers },
    { id: 'campaign', label: 'Campaign', icon: FaRocket },
    { id: 'analytics', label: 'Analytics', icon: FaChartLine },
    { id: 'automation', label: 'Automation', icon: FaBolt }
  ];

  const useCases = [
    {
      title: 'E-commerce Brands',
      description: 'Drive sales with product-focused campaigns and affiliate tracking',
      metric: '+245% ROI',
      category: 'education',
      icon: (
        <svg width="46" height="46" viewBox="0 0 46 46" fill="none">
          <path d="M23 3L3 13L23 23L43 13L23 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 33L23 43L43 33" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M23 23V43" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      title: 'Enterprise Companies',
      description: 'Scale campaigns globally with advanced team collaboration',
      metric: '500K+ Reach',
      category: 'credentialing',
      icon: (
        <svg width="46" height="46" viewBox="0 0 46 46" fill="none">
          <path d="M13 23L19 29L33 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="23" cy="23" r="20" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    },
    {
      title: 'Marketing Agencies',
      description: 'Manage multiple clients with white-label solutions',
      metric: '10x Efficiency',
      category: 'wallet',
      icon: (
        <svg width="46" height="46" viewBox="0 0 46 46" fill="none">
          <rect x="3" y="11" width="40" height="24" rx="3" stroke="currentColor" strokeWidth="2"/>
          <path d="M3 17H43" stroke="currentColor" strokeWidth="2"/>
          <circle cx="33" cy="23" r="2" fill="currentColor"/>
        </svg>
      )
    },
    {
      title: 'Content Creators',
      description: 'Monetize your influence with brand partnerships',
      metric: '3x Earnings',
      category: 'human-resources',
      icon: (
        <svg width="46" height="46" viewBox="0 0 46 46" fill="none">
          <path d="M23 25C28.5228 25 33 20.5228 33 15C33 9.47715 28.5228 5 23 5C17.4772 5 13 9.47715 13 15C13 20.5228 17.4772 25 23 25Z" stroke="currentColor" strokeWidth="2"/>
          <path d="M5 41C5 33.8203 10.8203 28 18 28H28C35.1797 28 41 33.8203 41 41" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      )
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Marketing Director at TechCorp',
      content: 'Brio transformed how we approach influencer marketing. The AI recommendations are incredibly accurate.',
      rating: 5,
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    {
      name: 'Michael Chen',
      role: 'Founder of GrowthLabs',
      content: 'We reduced our campaign setup time by 80%. The automation features are game-changing.',
      rating: 5,
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Social Media Manager',
      content: 'The analytics dashboard gives us insights we never had before. Absolutely essential tool.',
      rating: 5,
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg'
    }
  ];

  return (
    <div className="qb-platform-wrapper">
      {/* Hero Section */}
      <section className="qb-hero-section">
        <div className="qb-hero-container">
          {/* <div className="qb-ai-badge">
            <FaBolt /> Powered by Advanced AI
          </div> */}
          <div className="qb-hero-content">
            <h1 className="qb-hero-title">Everything You Need for Influencer Marketing Success</h1>
            <p className="qb-hero-description">
              Our enterprise-grade platform combines AI automation, real-time analytics, and intelligent workflows to help you run high-performing influencer campaigns at scale.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="qb-stats-grid">
            <div className="qb-stat-item">
              <h3 className="qb-stat-number">10M+</h3>
              <p className="qb-stat-label">Verified Influencers</p>
            </div>
            <div className="qb-stat-item">
              <h3 className="qb-stat-number">50K+</h3>
              <p className="qb-stat-label">Active Campaigns</p>
            </div>
            <div className="qb-stat-item">
              <h3 className="qb-stat-number">$2.5B+</h3>
              <p className="qb-stat-label">Campaign Budget Managed</p>
            </div>
            <div className="qb-stat-item">
              <h3 className="qb-stat-number">98%</h3>
              <p className="qb-stat-label">Customer Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* Campaign Management Feature */}
      <section className="qb-feature-showcase">
        <div className="qb-showcase-container">
          <div className="qb-showcase-content">
            <div className="qb-feature-tag qb-gradient-blue">
              <FaRocket /> AI-Powered Campaign Builder
            </div>
            <h3 className="qb-showcase-title">Launch Campaigns in Minutes, Not Days</h3>
            
            <div className="qb-feature-list">
              <div className="qb-list-item">
                <FaCheckCircle className="qb-check-icon" />
                <div className="qb-list-content">
                  <strong className="qb-list-title">AI Influencer Matching</strong>
                  <span className="qb-list-desc">Find perfect creators based on audience alignment</span>
                </div>
              </div>
              <div className="qb-list-item">
                <FaCheckCircle className="qb-check-icon" />
                <div className="qb-list-content">
                  <strong className="qb-list-title">Automated Workflows</strong>
                  <span className="qb-list-desc">Streamline outreach, contracts, and approvals</span>
                </div>
              </div>
              <div className="qb-list-item">
                <FaCheckCircle className="qb-check-icon" />
                <div className="qb-list-content">
                  <strong className="qb-list-title">Real-Time Tracking</strong>
                  <span className="qb-list-desc">Monitor performance across all channels</span>
                </div>
              </div>
              <div className="qb-list-item">
                <FaCheckCircle className="qb-check-icon" />
                <div className="qb-list-content">
                  <strong className="qb-list-title">Smart Budget Optimization</strong>
                  <span className="qb-list-desc">Maximize ROI with AI-driven allocation</span>
                </div>
              </div>
            </div>

            <div className="qb-action-buttons">
              <button className="qb-primary-btn" onClick={goToLogin}>
                Create Campaign <FaArrowRight />
              </button>
              <button className="qb-secondary-btn" onClick={() => navigate("/demo")}>
                <FaPlay /> Watch Demo
              </button>
            </div>
          </div>
          <div className="qb-showcase-visual">
            <div className="qb-dashboard-preview">
              <img 
                src="/images/Launch Campaigns in Minutes.png"
                alt="Campaign Management Dashboard"
                className="qb-dashboard-image"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Feature */}
      <section className="qb-feature-showcase">
        <div className="qb-showcase-container">
          <div className="qb-showcase-visual">
            <div className="qb-analytics-preview">
              <img 
                src="/images/analyticsreport.png"
                alt="Analytics Dashboard"
                className="qb-analytics-image"
              />
            </div>
          </div>
          <div className="qb-showcase-content">
            <div className="qb-feature-tag qb-gradient-purple">
              <FaChartLine /> Advanced Analytics Engine
            </div>
            <h3 className="qb-showcase-title">Data-Driven Insights That Drive Results</h3>
            
            <div className="qb-metrics-grid">
              <div className="qb-metric-card">
                <span className="qb-metric-icon">
                  <FaChartLine />
                </span>
                <div className="qb-metric-info">
                  <span className="qb-metric-value">2.4M</span>
                  <span className="qb-metric-name">Total Impressions</span>
                </div>
              </div>
              <div className="qb-metric-card">
                <span className="qb-metric-icon">
                  <FaHeart />
                </span>
                <div className="qb-metric-info">
                  <span className="qb-metric-value">45K</span>
                  <span className="qb-metric-name">Engagements</span>
                </div>
              </div>
              <div className="qb-metric-card">
                <span className="qb-metric-icon">
                  <FaBullseye />
                </span>
                <div className="qb-metric-info">
                  <span className="qb-metric-value">12.8%</span>
                  <span className="qb-metric-name">Conversion Rate</span>
                </div>
              </div>
              <div className="qb-metric-card">
                <span className="qb-metric-icon">
                  <FaChartBar />
                </span>
                <div className="qb-metric-info">
                  <span className="qb-metric-value">$48K</span>
                  <span className="qb-metric-name">Revenue Generated</span>
                </div>
              </div>
            </div>

            <div className="qb-analytics-features">
              <div className="qb-analytics-item">
                <FaRegLightbulb className="qb-analytics-icon" />
                <span>AI-Powered Insights & Recommendations</span>
              </div>
              <div className="qb-analytics-item">
                <FaRegLightbulb className="qb-analytics-icon" />
                <span>Custom Reporting & White-Label Export</span>
              </div>
              <div className="qb-analytics-item">
                <FaRegLightbulb className="qb-analytics-icon" />
                <span>Competitive Benchmarking Analysis</span>
              </div>
            </div>

            <div className="qb-action-buttons">
              <button className="qb-primary-btn" onClick={goToLogin}>
                View Analytics <FaArrowRight />
              </button>
              <button className="qb-secondary-btn" onClick={() => navigate("/demo")}>
                View Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Tabs Section */}
      <section className="qb-tabs-section">
        <div className="qb-section-container">
          <h2 className="qb-section-heading">Explore Platform Capabilities</h2>
          <div className="qb-tabs-navigation">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`qb-tab-button ${activeTab === tab.id ? 'qb-tab-active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon className="qb-tab-icon" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
          <div className="qb-tab-panel-container">
            {activeTab === 'discover' && (
              <div className="qb-tab-content">
                <h4 className="qb-tab-title">AI-Powered Influencer Discovery</h4>
                <p className="qb-tab-description">
                  Find the perfect creators for your brand with advanced filters, audience insights, and AI recommendations.
                </p>
                <ul className="qb-feature-bullets">
                  <li>Search across 10M+ verified influencers</li>
                  <li>Filter by niche, engagement, audience demographics</li>
                  <li>View detailed audience analytics and authenticity scores</li>
                  <li>Get AI-powered match recommendations</li>
                </ul>
              </div>
            )}
            {activeTab === 'campaign' && (
              <div className="qb-tab-content">
                <h4 className="qb-tab-title">End-to-End Campaign Management</h4>
                <p className="qb-tab-description">
                  Manage everything from planning to execution in one unified dashboard.
                </p>
                <ul className="qb-feature-bullets">
                  <li>Create campaigns with customizable workflows</li>
                  <li>Automate outreach and contract management</li>
                  <li>Collaborate with team members and clients</li>
                  <li>Track deliverables and approvals in real-time</li>
                </ul>
              </div>
            )}
            {activeTab === 'analytics' && (
              <div className="qb-tab-content">
                <h4 className="qb-tab-title">Comprehensive Analytics & Reporting</h4>
                <p className="qb-tab-description">
                  Make data-driven decisions with powerful analytics tools and custom reports.
                </p>
                <ul className="qb-feature-bullets">
                  <li>Track 50+ performance metrics in real-time</li>
                  <li>Generate white-label reports for clients</li>
                  <li>Compare campaigns and benchmark performance</li>
                  <li>Get AI-powered optimization recommendations</li>
                </ul>
              </div>
            )}
            {activeTab === 'automation' && (
              <div className="qb-tab-content">
                <h4 className="qb-tab-title">Intelligent Workflow Automation</h4>
                <p className="qb-tab-description">
                  Save hours every week with smart automation that handles repetitive tasks.
                </p>
                <ul className="qb-feature-bullets">
                  <li>Automated influencer outreach sequences</li>
                  <li>Smart content approval workflows</li>
                  <li>Automatic payment processing</li>
                  <li>AI-powered performance optimization</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Use Cases Section with New Design */}
      {/* <section className="qb-use-cases-section">
        <div className="qb-section-container">
          <div className="qb-use-cases-header">
            <h2 className="qb-use-cases-title">Built for Every Marketing Team</h2>
            <p className="qb-use-cases-subtitle">
              Discover how different teams leverage Quickbox to achieve remarkable results
            </p>
          </div>
          
          <div className="qb-use-cases-grid">
            {useCases.map((useCase, index) => (
              <a 
                key={index}
                href="/" 
                className={`qb-use-case-card ${useCase.category}`}
              >
                <div className="qb-card-circle">
                  {useCase.icon}
                </div>
                <div className="qb-card-overlay"></div>
                <p className="qb-card-title">{useCase.title}</p>
                <p className="qb-card-metric">{useCase.metric}</p>
                <p className="qb-card-description">{useCase.description}</p>
              </a>
            ))}
          </div>
        </div>
      </section> */}

      {/* Social Proof */}
      <section className="qb-testimonials-section">
        <div className="qb-testimonials-scroller">
          {[...testimonials, ...testimonials].map((t, i) => (
            <div key={i} className="qb-testimonial-card">
              <div className="qb-testimonial-rating">
                {'★'.repeat(t.rating)}
              </div>
              <p className="qb-testimonial-text">"{t.content}"</p>
              <div className="qb-testimonial-author">
                <div className="qb-author-avatar">
                  <img src={t.avatar} alt={t.name} />
                </div>
                <div className="qb-author-info">
                  <strong className="qb-author-name">{t.name}</strong>
                  <span className="qb-author-role">{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="qb-cta-section">
        <div className="qb-cta-container">
          <h3 className="qb-cta-title">Ready to Scale Your Influencer Marketing?</h3>
          <p className="qb-cta-description">
            Join thousands of brands using Brio to run successful campaigns
          </p>
          <div className="qb-cta-buttons">
            <button className="qb-primary-btn qb-large-btn" onClick={goToLogin}>
              Start Free Trial <FaArrowRight />
            </button>
            <button className="qb-secondary-btn qb-large-btn" onClick={() => navigate("/demo")}>
              View Demo
            </button>
          </div>
          <p className="qb-cta-footer">No credit card required • 14-day free trial • Cancel anytime</p>
        </div>
      </section>

      <style jsx>{`
        .qb-platform-wrapper {
          max-width: 100%;
          overflow: hidden;
          margin: 0 auto;
          padding: 0 auto;
          margin-top: 2rem;
          font-family: system-ui, -apple-system, sans-serif;
          background: white;
        }

        /* Hero Section */
        .qb-hero-section {
          background: white;
          text-align: center;
          padding: 0 auto;
        }

        .qb-hero-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .qb-ai-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #0f6eeaff;
          color: white;
          padding: 0.5rem 1.25rem;
          border-radius: 50px;
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 2rem;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
        }

        .qb-hero-content {
          max-width: 800px;
          margin: 0 auto 3rem;
        }

        .qb-hero-title {
          font-size: 3rem;
          font-weight: 700;
          color:  #000000;
          margin-bottom: 1.25rem;
          line-height: 1.2;
        }

        .qb-hero-description {
          font-size: 1.25rem;
          color:  #000000;
          line-height: 1.6;
          font-weight: 500;
        }

        .qb-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          max-width: 1000px;
          margin: 0 auto;
        }

        .qb-stat-item {
          background: white;
          padding: 2rem 1.5rem;
          border-radius: 1rem;
          border: 2px solid #e2e8f0;
          transition: all 0.3s ease;
        }

        .qb-stat-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
          border-color: #6366f1;
        }

        .qb-stat-number {
          font-size: 2.5rem;
          font-weight: 800;
          background:  #0f6eeaff;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 0.5rem;
        }

        .qb-stat-label {
          font-size: 1rem;
          color:  #000000;
          font-weight: 600;
        }

        /* Feature Showcase */
        .qb-feature-showcase {
          padding: 6rem 1.5rem;
        
          z-index: 10;
        }

        .qb-showcase-container {
            max-width: 1300px;
            padding: 0 1rem;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        .qb-feature-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #f1f5f9;
          color: #6366f1;
          padding: 0.75rem 1.25rem;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
        }

        .qb-gradient-blue {
          background:  #0f6eeaff;
          color: white;
        }

        .qb-gradient-purple {
          background: #0f6eeaff;
          color: white;
        }

        .qb-showcase-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #000000;
          margin-bottom: 1.5rem;
          line-height: 1.2;
        }

        .qb-feature-list {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          margin-bottom: 2.5rem;
        }

        .qb-list-item {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }

        .qb-check-icon {
          color: #10b981;
          font-size: 1.25rem;
          margin-top: 0.125rem;
        }

        .qb-list-content {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }

        .qb-list-title {
          font-size: 1rem;
          color: #000000;
          font-weight: 600;
        }

        .qb-list-desc {
          font-size: 0.875rem;
          color: #64748b;
        }

        .qb-action-buttons {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .qb-primary-btn {
          padding: 1rem 2rem;
          border-radius: 0.75rem;
          font-size: 1rem;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          background: #0f6eeaff;
          color: white;
        }

        .qb-primary-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
        }

        .qb-secondary-btn {
          padding: 1rem 2rem;
          border-radius: 0.75rem;
          font-size: 1rem;
          font-weight: 600;
          border: 2px solid #e2e8f0;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          background: white;
          color: #0f6eeaff;
        }

        .qb-secondary-btn:hover {
          border-color: #0f6eeaff;
        }

        .qb-large-btn {
          padding: 1.25rem 2.5rem;
          font-size: 1.125rem;
        }

        .qb-dashboard-preview,
        .qb-analytics-preview {
            width: 100%;
            z-index: 1;
          
          
  transform-origin: center;
        }

        .qb-dashboard-image
         {
          width: 100%;
          height: auto;
          z-index: -1;
          transform: scale(1.6); /* enlarge 30% */
        transform-origin: center;
        }
        .qb-analytics-image {
          width: 100%;
          height: auto;
          z-index: -1;
          transform: scale(1.4); /* enlarge 30% */
        transform-origin: center;
        }

        .qb-metrics-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .qb-metric-card {
          background: #f8fafc;
          padding: 1.5rem;
          border-radius: 0.75rem;
          border: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .qb-metric-icon {
          font-size: 1.5rem;
          color: #0f6eeaff;
        }

        .qb-metric-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .qb-metric-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #0f6eeaff;
        }

        .qb-metric-name {
          font-size: 0.875rem;
          color: #000000;
        }

        .qb-analytics-features {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2.5rem;
        }

        .qb-analytics-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          color: #000000;
          font-size: 1rem;
        }

        .qb-analytics-icon {
          color: #6366f1;
        }

        /* Tabs Section */
        .qb-tabs-section {
          padding: 6rem 1.5rem;
          
        }

        .qb-section-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .qb-section-heading {
          text-align: center;
          font-size: 2.5rem;
          font-weight: 700;
          color: #000000;
          margin-bottom: 3rem;
        }

        .qb-tabs-navigation {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-bottom: 3rem;
          flex-wrap: wrap;
        }

        .qb-tab-button {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 2rem;
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 1rem;
          font-size: 1rem;
          font-weight: 600;
          color: #64748b;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .qb-tab-button:hover {
          border-color: #6366f1;
          color: #000000;
        }

        qb-tab-icon: hover {
          color: #ffffff;}

        .qb-tab-active {
          background: #0f6eeaff;
          color: white;
          border-color: transparent;
        }

        .qb-tab-panel-container {
          background: white;
          padding: 3rem;
          border-radius: 1rem;
          border: 2px solid #e2e8f0;
        }

        .qb-tab-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #000000;
          margin-bottom: 1rem;
        }

        .qb-tab-description {
          font-size: 1.125rem;
          color: #000000;
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .qb-feature-bullets {
          list-style: none;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .qb-feature-bullets li {
          font-size: 1rem;
          color: #475569;
          padding-left: 2rem;
          position: relative;
        }

        .qb-feature-bullets li::before {
          content: '✓';
          position: absolute;
          left: 0;
          color: #10b981;
          font-weight: 700;
        }

        /* Use Cases Section */
        .qb-use-cases-section {
          padding: 6rem 1.5rem;
          background: white;
          font-family: "Open Sans", sans-serif;
        }

        .qb-use-cases-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .qb-use-cases-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #0f6eeaff;
          margin-bottom: 1rem;
          
        }

        .qb-use-cases-subtitle {
          font-size: 1.125rem;
          color: #000000;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .qb-use-cases-grid {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        /* Card Styles */
        .qb-use-case-card {
          width: 280px;
          height: 380px;
          background: #fff;
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          position: relative;
          box-shadow: 0 14px 26px rgba(0,0,0,0.04);
          transition: all 0.3s ease-out;
          text-decoration: none;
          padding: 2rem;
          text-align: center;
          border: 1px solid #f1f5f9;
          overflow: hidden;
        }

        .qb-use-case-card:hover {
          transform: translateY(-5px) scale(1.005);
          box-shadow: 0 24px 36px rgba(0,0,0,0.11), 0 24px 46px var(--box-shadow-color);
        }

        .qb-use-case-card:hover .qb-card-overlay {
          transform: scale(4);
        }

        .qb-use-case-card:hover .qb-card-circle {
          border-color: var(--bg-color-light);
          background: var(--bg-color);
        }

        .qb-use-case-card:hover .qb-card-circle:after {
          background: var(--bg-color-light);
        }

        .qb-use-case-card:hover .qb-card-title,
        .qb-use-case-card:hover .qb-card-description {
          color: var(--text-color-hover);
        }

        .qb-card-circle {
          width: 131px;
          height: 131px;
          border-radius: 50%;
          background: #fff;
          border: 2px solid var(--bg-color);
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          z-index: 1;
          transition: all 0.3s ease-out;
          margin-bottom: 1.5rem;
          color: #4C5656;
        }

        .qb-card-circle:after {
          content: "";
          width: 118px;
          height: 118px;
          display: block;
          position: absolute;
          background: var(--bg-color);
          border-radius: 50%;
          top: 7px;
          left: 7px;
          transition: opacity 0.3s ease-out;
          opacity: 0.1;
        }

        .qb-card-overlay {
          width: 118px;
          position: absolute; 
          height: 118px;
          border-radius: 50%;
          background: var(--bg-color);
          top: 70px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 0;
          transition: transform 0.3s ease-out;
          opacity: 0.1;
        }

        .qb-card-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #000000;
          margin: 1rem 0 0.5rem 0;
          z-index: 1000;
          transition: color 0.3s ease-out;
        }

        .qb-card-metric {
          font-size: 1.1rem;
          font-weight: 800;
          color: #000000;
          margin: 0.5rem 0;
          z-index: 1000;
        }

        .qb-card-description {
          font-size: 1rem;
          color: #64748b;
          line-height: 1.6;
          margin-top: 1rem;
          z-index: 1000;
          transition: color 0.3s ease-out;
        }

        /* Category Colors */
        .education {
          --bg-color: #ffd861;
          --bg-color-light: #ffeeba;
          --text-color-hover: #4C5656;
          --box-shadow-color: rgba(255, 215, 97, 0.48);
        }

        .credentialing {
          --bg-color: #B8F9D3;
          --bg-color-light: #e2fced;
          --text-color-hover: #4C5656;
          --box-shadow-color: rgba(184, 249, 211, 0.48);
        }

        .wallet {
          --bg-color: #CEB2FC;
          --bg-color-light: #F0E7FF;
          --text-color-hover: #fff;
          --box-shadow-color: rgba(206, 178, 252, 0.48);
        }

        .human-resources {
          --bg-color: #DCE9FF;
          --bg-color-light: #f1f7ff;
          --text-color-hover: #4C5656;
          --box-shadow-color: rgba(220, 233, 255, 0.48);
        }

        /* Testimonials */
        .qb-testimonials-section {
          padding: 6rem 0;
          overflow: hidden;
          
        }

        .qb-testimonials-scroller {
          display: flex;
          gap: 2rem;
          animation: qbTestimonialScroll 30s linear infinite;
          width: max-content;
        }

        .qb-testimonial-card {
          background: white;
          padding: 2rem;
          border-radius: 1rem;
          border: 2px solid #e2e8f0;
          flex: 0 0 350px;
          transition: all 0.3s ease;
        }

        .qb-testimonial-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
        }

        .qb-testimonial-rating {
          color: #fbbf24;
          margin-bottom: 1rem;
          font-size: 1.125rem;
        }

        .qb-testimonial-text {
          font-size: 1rem;
          color: #334155;
          line-height: 1.6;
          margin-bottom: 1.5rem;
          font-style: italic;
        }

        .qb-testimonial-author {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .qb-author-avatar {
          width: 3rem;
          height: 3rem;
          border-radius: 50%;
          overflow: hidden;
        }

        .qb-author-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .qb-author-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .qb-author-name {
          font-size: 1rem;
          color: #0f172a;
          font-weight: 600;
        }

        .qb-author-role {
          font-size: 0.875rem;
          color: #64748b;
        }

        @keyframes qbTestimonialScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        /* Final CTA */
        .qb-cta-section {
          padding: 6rem 1.5rem;
          
          text-align: center;
        }

        .qb-cta-container {
          max-width: 800px;
          margin: 0 auto;
        }

        .qb-cta-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #000000;
          margin-bottom: 1.5rem;
        }

        .qb-cta-description {
          font-size: 1.25rem;
          color: #000000;
          margin-bottom: 3rem;
        }

        .qb-cta-buttons {
          display: flex;
          gap: 1.5rem;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 2rem;
        }

        .qb-cta-footer {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.8);
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .qb-showcase-container {
            grid-template-columns: 1fr;
            gap: 3rem;
          }
          
          .qb-use-cases-grid {
            gap: 1.5rem;
          }
        }

        @media (max-width: 768px) {
          .qb-hero-title {
            font-size: 2.25rem;
          }

          .qb-hero-description {
            font-size: 1.125rem;
          }

          .qb-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .qb-showcase-title {
            font-size: 2rem;
          }

          .qb-section-heading {
            font-size: 2rem;
          }

          .qb-tabs-navigation {
            flex-direction: column;
          }

          .qb-tab-button {
            width: 100%;
            justify-content: center;
          }

          .qb-use-cases-title {
            font-size: 2rem;
          }

          .qb-cta-title {
            font-size: 2rem;
          }

          .qb-cta-buttons {
            flex-direction: column;
            align-items: center;
          }
        }

        @media (max-width: 480px) {
          .qb-hero-section {
            padding: 3rem 1rem;
          }

          .qb-hero-title {
            font-size: 1.75rem;
          }

          .qb-stats-grid {
            grid-template-columns: 1fr;
          }

          .qb-use-case-card {
            width: 100%;
            max-width: 280px;
          }

          .qb-feature-showcase {
            padding: 4rem 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default QuickboxPlatform;