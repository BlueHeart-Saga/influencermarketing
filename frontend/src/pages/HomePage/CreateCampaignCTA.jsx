import React, { useState, useEffect } from 'react';
import { 
  FaRocket, 
  FaChartLine, 
  FaUsers, 
  FaCheckCircle,
  FaBolt,
  FaShieldAlt,
  FaCog,
  FaRegLightbulb,
  FaPlay,
  FaArrowRight,
  FaStar, FaHeart, FaBullseye, FaChartBar, FaBullhorn, FaGlobe
} from 'react-icons/fa';
import { Link } from "react-router-dom";
import "../../style/createCampaignCTA.css";

export default function CreateCampaignCTA() {

  const [activeCard, setActiveCard] = useState(0);

  const features = [
      {
        icon: FaUsers,
        title: 'Smart Influencer Discovery',
        description: 'Find perfect creators with AI-powered matching',
        stats: '10M+ Influencers'
      },
      {
        icon: FaRocket,
        title: 'Campaign Management',
        description: 'Launch and manage campaigns effortlessly',
        stats: '85% Faster Setup'
      },
      {
        icon: FaChartLine,
        title: 'Real-Time Analytics',
        description: 'Track performance with live insights',
        stats: '50+ Metrics'
      },
      {
        icon: FaBolt,
        title: 'AI Automation',
        description: 'Automate workflows and save time',
        stats: '70% Time Saved'
      },
      {
        icon: FaShieldAlt,
        title: 'Fraud Detection',
        description: 'Protect your brand with AI verification',
        stats: '99.9% Accuracy'
      },
      {
        icon: FaCog,
        title: 'API Integrations',
        description: 'Connect with your favorite tools seamlessly',
        stats: '100+ Apps'
      },
      {
        icon: FaBullhorn,
        title: 'AI-Powered Content Optimization',
        description: 'Enhance posts with data-driven content insights',
        stats: '3x Higher Engagement'
      },
      {
        icon: FaGlobe,
        title: 'Global Audience Targeting',
        description: 'Reach the right audience across multiple regions',
        stats: '120+ Countries'
      }
    ];
  
     useEffect(() => {
      const handleScroll = () => {
        const section = document.querySelector('.qb-sticky-features');
        if (!section) return;
  
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const scrollPosition = window.scrollY;
        
        // Calculate how far we've scrolled through the section (0 to 1)
        const scrollProgress = (scrollPosition - sectionTop) / sectionHeight;
        
        // Determine which card should be active based on scroll progress
        const cardCount = features.length;
        const newActiveCard = Math.floor(scrollProgress * cardCount);
        
        // Ensure active card stays within bounds
        const clampedActiveCard = Math.max(0, Math.min(newActiveCard, cardCount - 1));
        
        setActiveCard(clampedActiveCard);
      };
  
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }, [features.length]);
  
  return (
    <section className="cta-container card-effect">
      <div className="cta-content">
        <h3 className="cta-title">Ready to Launch Your Next Campaign?</h3>
        <p className="cta-desc">
          Take your brand to the next level by creating targeted influencer campaigns. 
          Reach the right audience, track performance in real-time, and maximize ROI.
          Our AI-powered platform ensures you connect with the best influencers for your niche.
        </p>
        <div className="cta-buttons">
          <Link to="/create-campaign" className="cta-btn-primary">
            Create New Campaign →
          </Link>
          <Link to="/campaigns" className="cta-btn-outline">
            Browse Campaigns →
          </Link>
        </div>
      </div>
      <div className="cta-image">
        <img src="/images/campaign-ad.jpg" alt="Launch Campaign" />
      </div>
      {/* Sticky Features Stack */}
      {/* Sticky Features Stack */}
      <section className="qb-sticky-features">
        <div className="qb-section-container">
          <h2 className="qb-section-heading">Powerful Features Built for Modern Marketers</h2>
          <div className="qb-sticky-cards-wrapper">
            {features.map((feature, index) => (
              <div 
        key={index} 
        className={`qb-sticky-card ${
          index === activeCard 
            ? 'qb-card-active' 
            : index < activeCard 
            ? 'qb-card-passed' 
            : ''
        }`}
        style={{
          top: `${6 + (index * 2)}rem`,
          zIndex: features.length - index,
        }}
        data-index={index}
      >
                {/* Card content */}
                <div className="qb-card-icon">
                  <feature.icon />
                </div>
                <h4 className="qb-card-title">{feature.title}</h4>
                <p className="qb-card-description">{feature.description}</p>
                <div className="qb-card-stat">{feature.stats}</div>
              </div>
            ))}
          </div>
        </div>
      
        <style jsx>{`
          .qb-sticky-features {
            padding: 0 1.5rem;
            background: #ffffffff;
            position: relative;
          }
      
          .qb-sticky-cards-wrapper {
            position: relative;
            min-height: 400vh;
            margin: 0 auto;
            max-width: 500px;
          }
      
          .qb-sticky-card {
            position: sticky;
            background: white;
            padding: 2.5rem;
            margin-bottom: 1rem;
            transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            max-width: 450px;
            width: 100%;
            
            /* Custom border */
            border-top-left-radius: 37px 140px;
            border-top-right-radius: 23px 130px;
            border-bottom-left-radius: 110px 19px;
            border-bottom-right-radius: 120px 24px;
            border: solid 3px #6e7491;
            box-shadow: 3px 15px 8px -10px rgba(0, 0, 0, 0.3);
            
            /* Start with all cards behind */
            opacity: 0.3;
            transform: scale(0.9) translateY(20px);
            filter: blur(2px);
          }
      
          /* First card - always visible and in front */
          .qb-sticky-card[data-index="0"] {
            opacity: 1;
            transform: scale(1) translateY(0);
            filter: blur(0);
            z-index: 100;
          }
      
          /* When scrolling, each card becomes active one by one */
          .qb-sticky-card.qb-card-active {
            opacity: 1 !important;
            transform: scale(1) translateY(0) !important;
            filter: blur(0) !important;
            z-index: 150 !important;
            box-shadow: 
              3px 15px 8px -10px rgba(0, 0, 0, 0.3),
              0 25px 50px rgba(99, 102, 241, 0.2) !important;
          }
      
          /* Card that was active but now passed */
          .qb-sticky-card.qb-card-passed {
            opacity: 0.2;
            transform: scale(0.85) translateY(-10px);
            filter: blur(1px);
            z-index: 50;
          }
      
          /* Hover effects for all cards */
          .qb-sticky-card:hover {
            opacity: 1 !important;
            transform: translateY(-10px) rotate(1deg) scale(1.02) !important;
            filter: blur(0) !important;
            box-shadow: 
              3px 25px 20px -15px rgba(0, 0, 0, 0.3),
              0 30px 60px rgba(99, 102, 241, 0.25) !important;
            z-index: 200 !important;
            border-color: #6366f1;
          }
      
          /* Rest of your existing card styles */
          .qb-card-icon {
            width: 4rem;
            height: 4rem;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            border-radius: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.75rem;
            margin-bottom: 1.5rem;
            transition: transform 0.3s ease;
          }
      
          .qb-sticky-card:hover .qb-card-icon {
            transform: scale(1.1) rotate(5deg);
          }
      
          .qb-card-title {
            font-size: 1.375rem;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 1rem;
            transition: color 0.3s ease;
          }
      
          .qb-sticky-card:hover .qb-card-title {
            color: #6366f1;
          }
      
          .qb-card-description {
            font-size: 1rem;
            color: #64748b;
            line-height: 1.6;
            margin-bottom: 1.5rem;
            font-weight: 600;
          }
      
          .qb-card-stat {
            display: inline-block;
            background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
            color: #6366f1;
            padding: 0.5rem 1rem;
            border-radius: 0.75rem;
            font-size: 0.875rem;
            font-weight: 700;
            transition: all 0.3s ease;
          }
      
          .qb-sticky-card:hover .qb-card-stat {
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white;
            transform: translateY(-2px);
          }
      
          @media (max-width: 768px) {
            .qb-sticky-cards-wrapper {
              min-height: 300vh;
              max-width: 380px;
            }
      
            .qb-sticky-card {
              max-width: 360px;
              padding: 2rem;
              top: 5rem !important;
            }
          }
      
          @media (max-width: 480px) {
            .qb-sticky-cards-wrapper {
              min-height: 250vh;
              max-width: 320px;
            }
      
            .qb-sticky-card {
              max-width: 300px;
              padding: 1.5rem;
              top: 4rem !important;
            }
          }
        `}</style>
      </section>
      
    </section>
    
  );
}
