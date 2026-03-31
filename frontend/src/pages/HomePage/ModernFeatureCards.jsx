import React, { useState } from 'react';
import { 
  FaUsers, 
  FaRocket, 
  FaChartLine, 
  FaBolt,
  FaShieldAlt,
  FaCog,
  FaBullhorn,
  FaGlobe
} from 'react-icons/fa';

const ModernFeatureCards = () => {
  const [hoveredCard, setHoveredCard] = useState(null);

  const features = [
    {
      icon: FaUsers,
      title: 'Smart Influencer Discovery',
      description: 'Find perfect creators with AI-powered matching algorithms that analyze audience demographics, engagement rates, and brand alignment.',
      stats: '10M+ Influencers',
      image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=300&fit=crop',
      color: '#6366f1',
      details: ['AI-powered matching', 'Real-time analytics', 'Audience insights', 'Authenticity scores']
    },
    {
      icon: FaRocket,
      title: 'Campaign Management',
      description: 'Launch and manage campaigns effortlessly with automated workflows, contract management, and team collaboration tools.',
      stats: '85% Faster Setup',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
      color: '#8b5cf6',
      details: ['Quick campaign setup', 'Workflow automation', 'Team collaboration', 'Contract management']
    },
    {
      icon: FaChartLine,
      title: 'Real-Time Analytics',
      description: 'Track performance with live insights, custom reports, and AI-driven recommendations to optimize your campaigns.',
      stats: '50+ Metrics',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
      color: '#ec4899',
      details: ['Live performance tracking', 'Custom dashboards', 'Export reports', 'Predictive analytics']
    },
    {
      icon: FaBolt,
      title: 'AI Automation',
      description: 'Automate workflows and save time with intelligent task management, auto-responses, and smart scheduling.',
      stats: '70% Time Saved',
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop',
      color: '#f59e0b',
      details: ['Smart scheduling', 'Auto-responses', 'Task automation', 'Intelligent routing']
    },
    {
      icon: FaShieldAlt,
      title: 'Fraud Detection',
      description: 'Protect your brand with AI verification, fake follower detection, and engagement authenticity analysis.',
      stats: '99.9% Accuracy',
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&h=300&fit=crop',
      color: '#10b981',
      details: ['Fake follower detection', 'Bot identification', 'Engagement verification', 'Risk assessment']
    },
    {
      icon: FaCog,
      title: 'API Integrations',
      description: 'Connect with your favorite tools seamlessly through our robust API and pre-built integrations.',
      stats: '100+ Apps',
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop',
      color: '#3b82f6',
      details: ['RESTful API', 'Webhooks support', 'OAuth integration', 'Real-time sync']
    },
    {
      icon: FaBullhorn,
      title: 'Content Optimization',
      description: 'Enhance posts with data-driven content insights, A/B testing, and performance predictions.',
      stats: '3x Higher Engagement',
      image: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=400&h=300&fit=crop',
      color: '#ef4444',
      details: ['A/B testing', 'Content analysis', 'Best time to post', 'Hashtag optimization']
    },
    {
      icon: FaGlobe,
      title: 'Global Targeting',
      description: 'Reach the right audience across multiple regions with geo-targeting and multi-language support.',
      stats: '120+ Countries',
      image: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=400&h=300&fit=crop',
      color: '#06b6d4',
      details: ['Geo-targeting', 'Multi-language', 'Currency conversion', 'Local compliance']
    }
  ];

  return (
    <div className="modern-features-container">
      <div className="features-header">
        <div className="badge-pill">
          <FaBolt /> Powered by Advanced AI
        </div>
        <h2>Powerful Features Built for Modern Marketers</h2>
        <p>Everything you need to run successful influencer marketing campaigns at scale</p>
      </div>

      <div className="features-scroll-container">
        <div className="features-scroll">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isHovered = hoveredCard === index;
            
            return (
              <div
                key={index}
                className={`feature-card ${isHovered ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{ '--accent-color': feature.color }}
              >
                <div className="card-inner">
                  {/* Front side - compact view */}
                  <div className="card-front">
                    <div className="card-image-container">
                      <img src={feature.image} alt={feature.title} />
                      <div className="image-overlay" style={{ background: `linear-gradient(135deg, ${feature.color}ee, ${feature.color}88)` }}>
                        <div className="icon-3d" style={{ color: feature.color }}>
                          <Icon />
                        </div>
                      </div>
                    </div>
                    
                    <div className="card-content">
                      <h3>{feature.title}</h3>
                      <p className="description">{feature.description}</p>
                      <div className="stats-badge" style={{ background: `${feature.color}15`, color: feature.color }}>
                        {feature.stats}
                      </div>
                    </div>
                  </div>

                  {/* Expanded details on hover */}
                  <div className="card-details">
                    <h4>Key Features:</h4>
                    <ul>
                      {feature.details.map((detail, i) => (
                        <li key={i}>
                          <span className="checkmark">✓</span>
                          {detail}
                        </li>
                      ))}
                    </ul>
                    <button className="learn-more-btn" style={{ background: feature.color }}>
                      Learn More →
                    </button>
                  </div>
                </div>

                {/* 3D accent elements */}
                <div className="card-glow" style={{ background: `radial-gradient(circle at 50% 50%, ${feature.color}30, transparent 70%)` }}></div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="scroll-indicator">
        <span>Scroll to explore</span>
        <div className="scroll-line"></div>
      </div>

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .modern-features-container {
          min-height: 100vh;
          background: #ffffff;
          padding: 80px 24px;
          position: relative;
          overflow: hidden;
        }

        .modern-features-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 400px;
          background: radial-gradient(ellipse at top, #f0f4ff 0%, transparent 70%);
          pointer-events: none;
        }

        .features-header {
          text-align: center;
          max-width: 800px;
          margin: 0 auto 60px;
          position: relative;
          z-index: 1;
        }

        .badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          padding: 10px 24px;
          border-radius: 50px;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 24px;
          box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);
        }

        .features-header h2 {
          font-size: 48px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 16px;
          line-height: 1.2;
          letter-spacing: -1px;
        }

        .features-header p {
          font-size: 20px;
          color: #64748b;
          font-weight: 500;
        }

        .features-scroll-container {
          position: relative;
          margin: 0 auto;
          max-width: 100%;
          overflow-x: auto;
          overflow-y: hidden;
          padding: 40px 0 60px;
          
          /* Custom scrollbar */
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 #f1f5f9;
        }

        .features-scroll-container::-webkit-scrollbar {
          height: 8px;
        }

        .features-scroll-container::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }

        .features-scroll-container::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
          transition: background 0.3s;
        }

        .features-scroll-container::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        .features-scroll {
          display: flex;
          gap: 32px;
          padding: 0 24px;
          width: max-content;
        }

        .feature-card {
          position: relative;
          width: 340px;
          height: 480px;
          flex-shrink: 0;
          perspective: 1500px;
          cursor: pointer;
        }

        .card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          transform-style: preserve-3d;
        }

        .feature-card.hovered .card-inner {
          transform: rotateY(-8deg) rotateX(4deg) scale(1.05);
        }

        .card-front {
          position: absolute;
          width: 100%;
          height: 100%;
          background: white;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 
            0 4px 6px rgba(0, 0, 0, 0.07),
            0 10px 30px rgba(0, 0, 0, 0.08);
          border: 1px solid #e2e8f0;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          backface-visibility: hidden;
        }

        .feature-card.hovered .card-front {
          box-shadow: 
            0 20px 40px rgba(0, 0, 0, 0.12),
            0 0 0 1px var(--accent-color);
        }

        .card-image-container {
          position: relative;
          width: 100%;
          height: 200px;
          overflow: hidden;
        }

        .card-image-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
        }

        .feature-card.hovered .card-image-container img {
          transform: scale(1.1);
        }

        .image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .feature-card.hovered .image-overlay {
          opacity: 1;
        }

        .icon-3d {
          font-size: 64px;
          color: white;
          filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3));
          animation: iconFloat 3s ease-in-out infinite;
        }

        @keyframes iconFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .card-content {
          padding: 28px;
        }

        .card-content h3 {
          font-size: 22px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 12px;
          line-height: 1.3;
        }

        .description {
          font-size: 14px;
          color: #64748b;
          line-height: 1.6;
          margin-bottom: 20px;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .stats-badge {
          display: inline-block;
          padding: 8px 16px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          transition: transform 0.3s ease;
        }

        .feature-card.hovered .stats-badge {
          transform: scale(1.05);
        }

        .card-details {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: white;
          padding: 24px 28px;
          border-radius: 0 0 24px 24px;
          transform: translateY(100%);
          opacity: 0;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.08);
        }

        .feature-card.hovered .card-details {
          transform: translateY(0);
          opacity: 1;
        }

        .card-details h4 {
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 12px;
        }

        .card-details ul {
          list-style: none;
          margin-bottom: 16px;
        }

        .card-details li {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #475569;
          margin-bottom: 8px;
          font-weight: 500;
        }

        .checkmark {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          background: #10b981;
          color: white;
          border-radius: 50%;
          font-size: 11px;
          flex-shrink: 0;
        }

        .learn-more-btn {
          width: 100%;
          padding: 12px;
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .learn-more-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        }

        .card-glow {
          position: absolute;
          top: -50%;
          left: -50%;
          right: -50%;
          bottom: -50%;
          opacity: 0;
          transition: opacity 0.4s ease;
          pointer-events: none;
          z-index: -1;
        }

        .feature-card.hovered .card-glow {
          opacity: 1;
          animation: glowPulse 2s ease-in-out infinite;
        }

        @keyframes glowPulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.8; }
        }

        .scroll-indicator {
          text-align: center;
          margin-top: 40px;
          color: #94a3b8;
          font-size: 14px;
          font-weight: 600;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .scroll-line {
          width: 2px;
          height: 40px;
          background: linear-gradient(to bottom, #cbd5e1, transparent);
          animation: scrollBounce 2s ease-in-out infinite;
        }

        @keyframes scrollBounce {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(10px); opacity: 0.5; }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .modern-features-container {
            padding: 60px 16px;
          }

          .features-header h2 {
            font-size: 36px;
          }

          .features-header p {
            font-size: 18px;
          }

          .feature-card {
            width: 300px;
            height: 440px;
          }

          .card-image-container {
            height: 160px;
          }

          .card-content {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default ModernFeatureCards;