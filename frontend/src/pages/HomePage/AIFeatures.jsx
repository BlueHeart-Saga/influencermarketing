import React from "react";
import { Sparkles, TrendingUp, Zap, Target, BarChart3, Users } from "lucide-react";
import { 
  FaBrain, 
  FaChartBar, 
  FaRobot, 
  FaMagic, 
  FaBolt 
} from "react-icons/fa";

const FeatureCard = ({ feature, index }) => (
  <div className="feature-card-container">
    <div className="feature-card-inner">
      <div className="feature-icon-wrapper">
        <div className="icon-glow-effect"></div>
        <div className="icon-circle">
          {feature.icon}
        </div>
      </div>
      
      <div className="feature-content-wrapper">
        <h3 className="feature-title">{feature.title}</h3>
        <p className="feature-description">{feature.description}</p>
        
        <div className="feature-benefits-list">
          {feature.benefits.map((benefit, idx) => (
            <div key={idx} className="benefit-item">
              <div className="benefit-checkmark">✓</div>
              <span className="benefit-text">{benefit}</span>
            </div>
          ))}
        </div>
        
        <div className="feature-metrics">
          <div className="metric-badge">
            <span className="metric-value">{feature.stat}</span>
            <span className="metric-label">{feature.statLabel}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const TechnologyBadge = ({ tech }) => (
  <div className="tech-badge">
    <div className="tech-badge-icon">{tech.icon}</div>
    <span className="tech-badge-label">{tech.label}</span>
  </div>
);

const AIFeatures = () => {
  const features = [
    {
      icon: <Target className="w-8 h-8 text-blue-300" />,
      title: "Smart Influencer Matching",
      description: "Our AI analyzes 200+ data points to find perfect influencer matches based on audience demographics, engagement patterns, brand alignment, and content quality metrics.",
      benefits: [
        "Real-time audience analysis",
        "Authenticity scoring",
        "Engagement rate prediction"
      ],
      stat: "95%",
      statLabel: "Match Accuracy"
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-blue-300" />,
      title: "Predictive Analytics",
      description: "Forecast campaign performance and ROI before launch using our machine learning models trained on thousands of successful campaigns across multiple industries.",
      benefits: [
        "ROI forecasting",
        "Reach estimation",
        "Performance benchmarking"
      ],
      stat: "89%",
      statLabel: "Prediction Accuracy"
    },
    {
      icon: <Zap className="w-8 h-8 text-blue-300" />,
      title: "Automated Workflows",
      description: "Streamline influencer outreach, contract management, content approval, and payments with intelligent automation workflows that adapt to your campaign needs.",
      benefits: [
        "Auto-outreach campaigns",
        "Smart contract generation",
        "Instant payment processing"
      ],
      stat: "70%",
      statLabel: "Time Saved"
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-blue-300" />,
      title: "Real-Time Campaign Analytics",
      description: "Monitor campaign performance with live dashboards, sentiment analysis, and engagement tracking. Get instant alerts on trending content and audience reactions.",
      benefits: [
        "Live performance tracking",
        "Sentiment analysis",
        "Competitive benchmarking"
      ],
      stat: "24/7",
      statLabel: "Monitoring"
    },
    {
      icon: <Users className="w-8 h-8 text-blue-300" />,
      title: "Audience Intelligence",
      description: "Deep-dive into audience demographics, interests, and behaviors. Understand who's engaging with your content and optimize targeting strategies accordingly.",
      benefits: [
        "Demographic profiling",
        "Interest mapping",
        "Behavior prediction"
      ],
      stat: "50M+",
      statLabel: "Profiles Analyzed"
    },
    {
      icon: <Sparkles className="w-8 h-8 text-blue-300" />,
      title: "Content Optimization",
      description: "AI-powered content recommendations help create high-performing posts. Get suggestions on optimal posting times, hashtags, and content formats.",
      benefits: [
        "Best time recommendations",
        "Hashtag optimization",
        "Format suggestions"
      ],
      stat: "3x",
      statLabel: "Engagement Boost"
    }
  ];

  const technologies = [
  { icon: FaBrain, label: "Machine Learning" },
  { icon: FaChartBar, label: "Big Data Analytics" },
  { icon: FaRobot, label: "Natural Language Processing" },
  { icon: FaMagic, label: "Predictive Modeling" },
  { icon: FaBolt, label: "Real-Time Processing" }
];

const TechnologyBadge = ({ tech }) => {
  const Icon = tech.icon;
  return (
    <div className="technology-badge">
      <Icon className="tech-icon" />
      <span>{tech.label}</span>
    </div>
  );
};

  return (
    <section className="ai-features-section" id="features">
      <div className="features-container">
        <div className="features-header-wrapper">
          <div className="header-badge">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Platform</span>
          </div>
          <h2 className="features-main-title">
            Powered by Advanced AI Technology
          </h2>
          <p className="features-subtitle">
            Experience the future of influencer marketing with our cutting-edge AI capabilities that transform how brands connect with creators
          </p>
          
          <div className="technology-badges-container">
  {technologies.map((tech, index) => (
    <TechnologyBadge key={index} tech={tech} />
  ))}
</div>
        </div>
        
        <div className="features-grid-layout">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index}
              feature={feature}
              index={index}
            />
          ))}
        </div>

        <div className="features-footer-cta">
          <div className="cta-content">
            <h3 className="cta-title">Ready to Transform Your Campaigns?</h3>
            <p className="cta-description">Join thousands of brands leveraging AI for influencer marketing success</p>
            <button className="cta-button">
              Get Started Free
              <span className="button-arrow">→</span>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .ai-features-section {
          padding: 6rem 1.5rem;
          background: rgb(255, 255, 255);
          position: relative;
          overflow: hidden;
        }

        .ai-features-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 20% 50%, rgba(161, 180, 241, 0.15) 0%, transparent 50%),
                      radial-gradient(circle at 80% 50%, rgba(195, 217, 251, 0.15) 0%, transparent 50%);
          pointer-events: none;
        }

        .features-container {
          max-width: 1280px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .features-header-wrapper {
          text-align: center;
          margin-bottom: 4rem;
        }

        .header-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(161, 180, 241, 0.15);
          border: 1px solid rgba(161, 180, 241, 0.4);
          border-radius: 50px;
          color: rgb(80, 110, 200);
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 1.5rem;
        }

        .features-main-title {
          font-size: 3rem;
          font-weight: 700;
          color: #1e3a8a;
          margin-bottom: 1rem;
          line-height: 1.2;
          background: linear-gradient(135deg, rgb(80, 110, 200) 0%, rgb(161, 180, 241) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .features-subtitle {
          font-size: 1.25rem;
          color: #475569;
          max-width: 700px;
          margin: 0 auto 2rem;
          line-height: 1.6;
        }

        .technology-badges-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  margin: 40px auto;
  max-width: 1000px;
}

.technology-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 1.5px solid #e5e7eb;
  border-radius: 30px;
  padding: 10px 18px;
  font-weight: 500;
  color: #374151;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(99, 102, 241, 0.05);
}

.technology-badge:hover {
  transform: translateY(-3px);
  background: linear-gradient(90deg, #6366f1, #3b82f6);
  color: white;
}

.tech-icon {
  font-size: 1.3rem;
  color: #6366f1;
  transition: color 0.3s ease;
}

.technology-badge:hover .tech-icon {
  color: white;
}


        .features-grid-layout {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
          gap: 2rem;
          margin-bottom: 4rem;
        }

        .feature-card-container {
          perspective: 1000px;
        }

        .feature-card-inner {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 250, 255, 0.95) 100%);
          
          border-radius: 20px;
          padding: 2rem;
          transition: all 0.4s ease;
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(10px);
          height: 100%;
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 20px rgba(161, 180, 241, 0.15);
        }

        .feature-card-inner::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(195, 217, 251, 0.2) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .feature-card-inner:hover {
          transform: translateY(-8px);
          border-color: rgba(161, 180, 241, 0.6);
          box-shadow: 0 20px 60px rgba(161, 180, 241, 0.3);
        }

        .feature-card-inner:hover::before {
          opacity: 1;
        }

        .feature-icon-wrapper {
          position: relative;
          width: 80px;
          height: 80px;
          margin-bottom: 1.5rem;
        }

        .icon-glow-effect {
          position: absolute;
          inset: -10px;
          background: radial-gradient(circle, rgba(161, 180, 241, 0.4) 0%, transparent 70%);
          border-radius: 50%;
          filter: blur(20px);
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .feature-card-inner:hover .icon-glow-effect {
          opacity: 1;
        }

        .icon-circle {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(161, 180, 241, 0.2) 0%, rgba(195, 217, 251, 0.3) 100%);
          border: 2px solid rgba(161, 180, 241, 0.4);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 1;
        }

        .feature-content-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .feature-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1e3a8a;
          margin-bottom: 1rem;
          line-height: 1.3;
        }

        .feature-description {
          color: #475569;
          line-height: 1.6;
          margin-bottom: 1.5rem;
          font-size: 0.95rem;
        }

        .feature-benefits-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .benefit-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .benefit-checkmark {
          width: 20px;
          height: 20px;
          background: rgba(34, 197, 94, 0.15);
          border: 1px solid rgba(34, 197, 94, 0.4);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #16a34a;
          font-size: 0.75rem;
          flex-shrink: 0;
        }

        .benefit-text {
          color: #334155;
          font-size: 0.875rem;
        }

        .feature-metrics {
          margin-top: auto;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(161, 180, 241, 0.3);
        }

        .metric-badge {
          display: inline-flex;
          flex-direction: column;
          padding: 1rem 1.5rem;
          background: rgba(161, 180, 241, 0.15);
          border: 1px solid rgba(161, 180, 241, 0.4);
          border-radius: 12px;
        }

        .metric-value {
          font-size: 2rem;
          font-weight: 700;
          color: rgb(80, 110, 200);
          line-height: 1;
        }

        .metric-label {
          font-size: 0.75rem;
          color: #475569;
          margin-top: 0.25rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .features-footer-cta {
          background: linear-gradient(135deg, rgba(161, 180, 241, 0.25) 0%, rgba(195, 217, 251, 0.25) 100%);
          border: 1px solid rgba(161, 180, 241, 0.4);
          border-radius: 24px;
          padding: 3rem 2rem;
          text-align: center;
          backdrop-filter: blur(10px);
          box-shadow: 0 10px 40px rgba(161, 180, 241, 0.2);
        }

        .cta-content {
          max-width: 600px;
          margin: 0 auto;
        }

        .cta-title {
          font-size: 2rem;
          font-weight: 700;
          color: #255aedff;
          margin-bottom: 1rem;
        }

        .cta-description {
          color: #242b36ff;
          font-size: 1.125rem;
          font-weight:500px;
          margin-bottom: 2rem;
        }

        .cta-button {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 2.5rem;
          background: linear-gradient(135deg, rgb(161, 180, 241) 0%, rgb(195, 217, 251) 100%);
          color: #1e3a8a;
          font-weight: 600;
          font-size: 1.125rem;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 10px 30px rgba(161, 180, 241, 0.4);
        }

        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 40px rgba(161, 180, 241, 0.6);
        }

        .button-arrow {
          font-size: 1.5rem;
          transition: transform 0.3s ease;
        }

        .cta-button:hover .button-arrow {
          transform: translateX(5px);
        }

        @media (max-width: 768px) {
          .ai-features-section {
            padding: 4rem 1rem;
          }

          .features-main-title {
            font-size: 2rem;
          }

          .features-subtitle {
            font-size: 1rem;
          }

          .features-grid-layout {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .cta-title {
            font-size: 1.5rem;
          }

          .cta-description {
            font-size: 1rem;
          }
        }
      `}</style>
    </section>
  );
};

export default AIFeatures;