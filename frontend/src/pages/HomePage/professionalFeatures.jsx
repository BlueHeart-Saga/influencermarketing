import React from 'react';
import { Target, Zap, Users, Activity, Star, Check } from 'lucide-react';

function ProfessionalFeatures() {
  const features = [
    {
      id: 1,
      icon: Target,
      title: 'AI Matching',
      rating: 4.9,
      reviews: '1.2k',
      description: 'Intelligent algorithm matches ideal influencers based on audience, content style, and goals.',
      benefits: [
        'Audience Analysis',
        'Context Matching',
        'ROI Prediction',
        'Performance Insights'
      ],
      stat1: '95% Match Rate',
      stat2: '2x Faster',
      accentColor: '#3b82f6',
      bgImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=80'
    },
    {
      id: 2,
      icon: Zap,
      title: 'Campaign Tools',
      rating: 4.8,
      reviews: '980',
      description: 'End-to-end campaign management with collaboration tools and real-time tracking.',
      benefits: [
        'Auto Workflows',
        'Team Collaboration',
        'Real-time Tracking',
        'Multi-platform'
      ],
      stat1: '50% Time Saved',
      stat2: '40% Cost Cut',
      accentColor: '#a855f7',
      bgImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80'
    },
    {
      id: 3,
      icon: Users,
      title: 'Creator Network',
      rating: 4.9,
      reviews: '1.5k',
      description: 'Access 50K+ verified creators across all major platforms with performance history.',
      benefits: [
        '50K+ Creators',
        'Global Reach',
        'All Platforms',
        'Vetted Quality'
      ],
      stat1: '95% Satisfaction',
      stat2: '24h Response',
      accentColor: '#f97316',
      bgImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=80'
    },
    {
      id: 4,
      icon: Activity,
      title: 'Analytics',
      rating: 5.0,
      reviews: '2.1k',
      description: 'Track ROI, engagement, and conversions with real-time dashboards and reports.',
      benefits: [
        'Live Dashboards',
        'Custom Reports',
        'ROI Tracking',
        'Competitor Insights'
      ],
      stat1: '100+ Metrics',
      stat2: 'Real-time',
      accentColor: '#10b981',
      bgImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80'
    },
    {
      id: 5,
      icon: Target,
      title: 'Content Studio',
      rating: 4.7,
      reviews: '850',
      description: 'Create stunning content with our built-in editing tools and templates.',
      benefits: [
        'Templates Library',
        'Auto Editing',
        'Brand Kits',
        'Collaboration'
      ],
      stat1: '100+ Templates',
      stat2: 'Fast Editing',
      accentColor: '#ec4899',
      bgImage: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80'
    },
    {
      id: 6,
      icon: Zap,
      title: 'Smart Reports',
      rating: 4.9,
      reviews: '1.1k',
      description: 'Generate detailed performance reports automatically with insights.',
      benefits: [
        'Auto Reports',
        'Custom Metrics',
        'Share Dashboards',
        'Export Options'
      ],
      stat1: 'Auto Generated',
      stat2: 'Real-time',
      accentColor: '#8b5cf6',
      bgImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80'
    }
  ];

  return (
    <section className="features-showcase">
      <div className="header">
        <h2>Why Choose Brio</h2>
        <p>Powerful tools for influencer marketing success</p>
      </div>

      <div className="slider-container">
        <div className="slider-track">
          {[...features, ...features].map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="feature-card">
                <div className="card-inner">
                  {/* Front Side - Detailed Content */}
                  <div className="card-front" style={{ borderColor: feature.accentColor }}>
                    <div className="front-content">
                      <div className="front-header">
                        <div 
                          className="front-icon" 
                          style={{ 
                            backgroundColor: feature.accentColor,
                            backgroundImage: `linear-gradient(135deg, ${feature.accentColor}, ${feature.accentColor}dd)`
                          }}
                        >
                          <Icon size={24} color="white" />
                        </div>
                        <h3>{feature.title}</h3>
                      </div>
                      
                      <div className="rating-badge">
                        <div className="stars">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={14} 
                              fill={i < Math.floor(feature.rating) ? '#fbbf24' : 'rgba(251, 191, 36, 0.2)'}
                              strokeWidth={i < Math.floor(feature.rating) ? 0 : 1}
                              color="#fbbf24"
                            />
                          ))}
                          <span className="rating-value">{feature.rating}</span>
                        </div>
                        <span className="reviews">{feature.reviews} reviews</span>
                      </div>
                      
                      <p className="description">{feature.description}</p>
                      
                      <div className="benefits">
                        <h4>Key Features:</h4>
                        <div className="benefits-grid">
                          {feature.benefits.map((benefit, i) => (
                            <div 
                              key={i} 
                              className="benefit-item" 
                              style={{ 
                                borderColor: `${feature.accentColor}30`,
                                backgroundColor: `${feature.accentColor}10`
                              }}
                            >
                              <Check size={12} color={feature.accentColor} />
                              <span>{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="quick-stats">
                        <span className="stat" style={{ 
                          backgroundColor: `${feature.accentColor}15`,
                          color: feature.accentColor,
                          borderColor: feature.accentColor
                        }}>
                          {feature.stat1}
                        </span>
                        <span className="stat" style={{ 
                          backgroundColor: `${feature.accentColor}15`,
                          color: feature.accentColor,
                          borderColor: feature.accentColor
                        }}>
                          {feature.stat2}
                        </span>
                      </div>
                    </div>
                    
                    <div className="front-footer">
                      <div className="flip-hint">
                        <span>See preview →</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Back Side - Image with Title */}
                  <div 
                    className="card-back" 
                    style={{ 
                      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(${feature.bgImage})`,
                      borderColor: feature.accentColor
                    }}
                  >
                    <div className="back-content">
                      <div className="back-header">
                        <div 
                          className="back-icon-box" 
                          style={{ 
                            backgroundColor: feature.accentColor,
                            borderColor: 'white'
                          }}
                        >
                          <Icon size={32} color="white" />
                        </div>
                        <h3>{feature.title}</h3>
                      </div>
                      
                      <div className="back-stats">
                        <div className="back-stat-item">
                          <div className="back-stat-label">Rating</div>
                          <div className="back-stat-value">{feature.rating}/5</div>
                        </div>
                        <div className="back-stat-divider"></div>
                        <div className="back-stat-item">
                          <div className="back-stat-label">Reviews</div>
                          <div className="back-stat-value">{feature.reviews}</div>
                        </div>
                        <div className="back-stat-divider"></div>
                        <div className="back-stat-item">
                          <div className="back-stat-label">Success</div>
                          <div className="back-stat-value">99%</div>
                        </div>
                      </div>
                      
                      <div className="back-quick-info">
                        <div className="back-quick-stat" style={{ backgroundColor: `${feature.accentColor}40` }}>
                          {feature.stat1}
                        </div>
                        <div className="back-quick-stat" style={{ backgroundColor: `${feature.accentColor}40` }}>
                          {feature.stat2}
                        </div>
                      </div>
                      
                      <div className="back-flip-hint">
                        <span>← Back to details</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .features-showcase {
          padding: 80px 20px;
          background: #ffffff;
          position: relative;
          overflow: hidden;
          min-height: 100vh;
        }
        
        .features-showcase::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }
        
        .header {
          text-align: center;
          margin-bottom: 60px;
          position: relative;
        }
        
        .header h2 {
          font-size: 2.5rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 0.5rem;
          line-height: 1.2;
        }
        
        .header p {
          font-size: 1.125rem;
          color: #64748b;
          max-width: 500px;
          margin: 0 auto;
        }
        
        .slider-container {
          position: relative;
          width: 100%;
          overflow: hidden;
          padding: 20px 0;
          min-height: 400px;
        }
        
        .slider-container::before,
        .slider-container::after {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          width: 100px;
          z-index: 2;
          pointer-events: none;
        }
        
        .slider-container::before {
          left: 0;
          background: linear-gradient(90deg, #ffffff 0%, transparent 100%);
        }
        
        .slider-container::after {
          right: 0;
          background: linear-gradient(270deg, #ffffff 0%, transparent 100%);
        }
        
        .slider-track {
          display: flex;
          gap: 24px;
          animation: scrollSlider 40s linear infinite;
          padding: 0 20px;
          align-items: flex-start;
        }
        
        @keyframes scrollSlider {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        .slider-track:hover {
          animation-play-state: paused;
        }
        
        .feature-card {
          width: 320px;
        //   height: 320px;
          perspective: 1000px;
          flex-shrink: 0;
          position: relative;
        }
        
        .card-inner {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.6s ease;
        }
        
        .feature-card:hover .card-inner {
          transform: rotateY(180deg);
        }
        
        .card-front, .card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          border-radius: 16px;
          border: 2px solid;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          top: 0;
          left: 0;
          overflow: hidden;
        }
        
        .card-front {
          transform: rotateY(0deg);
          background: white;
          z-index: 2;
        }
        
        .card-back {
          transform: rotateY(180deg);
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          color: white;
          border-color: rgba(255, 255, 255, 0.3);
          position: relative;
          z-index: 1;
        }
        
        .card-back::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(to bottom, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.4));
          z-index: 1;
        }
        
        /* Front Side Styles */
        .front-content {
          padding: 24px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        
        .front-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }
        
        .front-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .front-header h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }
        
        .rating-badge {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        
        .stars {
          display: flex;
          align-items: center;
          gap: 2px;
        }
        
        .rating-value {
          font-size: 0.875rem;
          font-weight: 700;
          margin-left: 6px;
          color: #0f172a;
        }
        
        .reviews {
          font-size: 0.75rem;
          color: #64748b;
          font-weight: 500;
        }
        
        .description {
          font-size: 0.875rem;
          color: #475569;
          line-height: 1.5;
          margin-bottom: 20px;
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
        }
        
        .benefits h4 {
          font-size: 0.875rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 12px;
        }
        
        .benefits-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 20px;
        }
        
        .benefit-item {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 8px;
          border: 1px solid;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 500;
          color: #475569;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .quick-stats {
          display: flex;
          gap: 8px;
          margin-top: auto;
        }
        
        .stat {
          font-size: 0.875rem;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 8px;
          text-align: center;
          flex: 1;
          border: 1px solid;
        }
        
        .front-footer {
          padding: 16px 24px;
          border-top: 1px solid #e2e8f0;
          background: #f8fafc;
        }
        
        .flip-hint {
          text-align: center;
        }
        
        .flip-hint span {
          font-size: 0.75rem;
          color: #64748b;
          font-weight: 500;
          display: inline-block;
          padding: 4px 8px;
          background: rgba(0, 0, 0, 0.05);
          border-radius: 20px;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
        
        /* Back Side Styles */
        .back-content {
          padding: 24px;
          flex: 1;
          display: flex;
          flex-direction: column;
          position: relative;
          z-index: 2;
        }
        
        .back-header {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .back-icon-box {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          border: 2px solid;
          backdrop-filter: blur(4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        }
        
        .back-header h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
          margin: 0;
        }
        
        .back-stats {
          display: grid;
          grid-template-columns: 1fr auto 1fr auto 1fr;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          padding: 16px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .back-stat-item {
          text-align: center;
        }
        
        .back-stat-label {
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 4px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .back-stat-value {
          font-size: 1rem;
          font-weight: 700;
          color: white;
        }
        
        .back-stat-divider {
          width: 1px;
          height: 30px;
          background: rgba(255, 255, 255, 0.3);
        }
        
        .back-quick-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: auto;
        }
        
        .back-quick-stat {
          font-size: 0.875rem;
          font-weight: 600;
          padding: 8px 12px;
          border-radius: 8px;
          text-align: center;
          color: white;
          backdrop-filter: blur(4px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .back-flip-hint {
          text-align: center;
          margin-top: 20px;
        }
        
        .back-flip-hint span {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.9);
          font-weight: 500;
          display: inline-block;
          padding: 4px 8px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 20px;
          backdrop-filter: blur(4px);
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .header h2 {
            font-size: 2rem;
          }
          
          .feature-card {
            width: 280px;
            height: 280px;
          }
          
          .slider-track {
            gap: 20px;
          }
          
          .description {
            font-size: 0.8125rem;
            -webkit-line-clamp: 2;
          }
          
          .benefit-item {
            font-size: 0.7rem;
            padding: 5px 6px;
          }
          
          .back-header h3 {
            font-size: 1.25rem;
          }
          
          .back-stat-value {
            font-size: 0.9rem;
          }
        }
        
        @media (max-width: 480px) {
          .header h2 {
            font-size: 1.75rem;
          }
          
          .feature-card {
            width: 260px;
            height: 260px;
          }
          
          .front-content, .back-content {
            padding: 20px;
          }
          
          .front-footer {
            padding: 12px 20px;
          }
          
          .front-header h3 {
            font-size: 1.125rem;
          }
          
          .description {
            font-size: 0.75rem;
            margin-bottom: 16px;
          }
          
          .benefits h4 {
            font-size: 0.8125rem;
            margin-bottom: 8px;
          }
          
          .benefits-grid {
            gap: 6px;
            margin-bottom: 16px;
          }
          
          .back-icon-box {
            width: 56px;
            height: 56px;
          }
          
          .back-header h3 {
            font-size: 1.125rem;
          }
        }
      `}</style>
    </section>
  );
}

export default ProfessionalFeatures;