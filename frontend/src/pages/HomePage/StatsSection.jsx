import React, { useState, useEffect, useRef } from 'react';
import { 
  FaUsers, 
  FaRocket, 
  FaChartLine, 
  FaGlobe,
  FaStar,
  FaTrophy,
  FaFire,
  FaBolt,
  FaAward,
  FaShieldAlt,
  FaClock,
  FaHeadset, FaMagic, FaSmile, FaLaptop, FaRegHandshake, FaBriefcase, FaLightbulb, FaUsersCog, FaShoppingCart, FaBullhorn, FaDatabase, FaServer,FaCommentDots, FaHeart, FaCertificate, FaChartPie, FaUpload, FaMobileAlt, FaCloudUploadAlt, FaRecycle,
} from 'react-icons/fa';

const ElegantStatsSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [counts, setCounts] = useState({
  influencers: 0,
  campaigns: 0,
  satisfaction: 0,
  reach: 0,
  revenue: 0,
  countries: 0,
  aiTools: 0,
  brands: 0,
  projects: 0,
  aiIdeas: 0,
  timeSaved: 0,
  teamSize: 0,
  orders: 0,
  ads: 0,
  dataset: 0,
  uptime: 0,
  securityScore: 0,
  feedback: 0,
  likes: 0,
  awards: 0,
  analyticsReports: 0,
  aiGenerations: 0,
  uploads: 0,
  mobileUsers: 0,
  cloudSync: 0,
  optimized: 0,
  happyInfluencers: 0
});

  
  const sectionRef = useRef(null);

  const finalValues = {
  influencers: 10000,
  campaigns: 5000,
  satisfaction: 98,
  reach: 15000000,
  revenue: 2.5,
  countries: 125,

  aiTools: 120,
  brands: 3500,
  projects: 18000,
  aiIdeas: 45000,
  timeSaved: 12000,
  teamSize: 85,
  orders: 900000,
  ads: 14000,
  dataset: 5000000,
  uptime: 99.9,
  securityScore: 95,
  feedback: 25000,
  likes: 4800000,
  awards: 18,
  analyticsReports: 32000,
  aiGenerations: 55000,
  uploads: 700000,
  mobileUsers: 150000,
  cloudSync: 1900000,
  optimized: 92,
  happyInfluencers: 8000
};


  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      setCounts({
        influencers: Math.floor(finalValues.influencers * progress),
        campaigns: Math.floor(finalValues.campaigns * progress),
        satisfaction: Math.floor(finalValues.satisfaction * progress),
        reach: Math.floor(finalValues.reach * progress),
        revenue: parseFloat((finalValues.revenue * progress).toFixed(1)),
        countries: Math.floor(finalValues.countries * progress)
      });

      if (currentStep >= steps) {
        clearInterval(interval);
        setCounts(finalValues);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [isVisible]);

  const formatNumber = (num) => {
  if (num === undefined || num === null) return "0";

  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(num >= 10000 ? 0 : 1) + "K";
  
  return num.toString();
};


  const stats = [
  {
    icon: FaUsers,
    value: formatNumber(counts.influencers) + '+',
    label: 'Verified Influencers',
    description: 'Across all major platforms',
    image: '/images/stats1.png'
  },
  {
    icon: FaRocket,
    value: formatNumber(counts.campaigns) + '+',
    label: 'Successful Campaigns',
    description: 'Delivered with excellence',
    image: '/images/stats2.png'
  },
  {
    icon: FaStar,
    value: counts.satisfaction + '%',
    label: 'Client Satisfaction',
    description: 'Based on 2,400+ reviews',
    image: '/images/stats3.png'
  },
  {
    icon: FaGlobe,
    value: formatNumber(counts.reach) + '+',
    label: 'Global Reach',
    description: 'Total audience impressions',
    image: '/images/stats4.png'
  },
  {
    icon: FaChartLine,
    value: '$' + counts.revenue.toFixed(1) + 'B+',
    label: 'Revenue Generated',
    description: 'For our clients worldwide',
    image: '/images/stats5.png'
  },
  {
    icon: FaTrophy,
    value: counts.countries + '+',
    label: 'Countries Served',
    description: 'Global presence & support',
    image: '/images/stats6.png'
  },

  // ⭐ Add more below (NEW 19 ITEMS)
  

  {
    icon: FaLaptop,
    value: formatNumber(counts.aiTools) + '+',
    label: 'AI Tools Powered',
    description: 'Smart automation & insights',
    image: '/images/stats7.png'
  },
  {
    icon: FaRegHandshake,
    value: formatNumber(counts.brands) + '+',
    label: 'Partner Brands',
    description: 'Trusted by global companies',
    image: '/images/stats8.png'
  },
  {
    icon: FaBriefcase,
    value: formatNumber(counts.projects) + '+',
    label: 'Total Projects Delivered',
    description: 'Quality & results guaranteed',
    image: '/images/stats9.png'
  },
  {
    icon: FaLightbulb,
    value: formatNumber(counts.aiIdeas) + '+',
    label: 'AI-Generated Ideas',
    description: 'Campaign titles & strategies',
    image: '/images/stats10.png'
  },
  {
    icon: FaClock,
    value: counts.timeSaved + ' hrs',
    label: 'Time Saved',
    description: 'Efficiency through automation',
    image: '/images/stats11.png'
  },
  {
    icon: FaUsersCog,
    value: counts.teamSize,
    label: 'Expert Team Members',
    description: 'AI, marketing & analytics',
    image: '/images/stats12.png'
  },
  {
    icon: FaShoppingCart,
    value: counts.orders + '+',
    label: 'Orders Influenced',
    description: 'Sales driven by creators',
    image: '/images/stats13.png'
  },
  {
    icon: FaBullhorn,
    value: counts.ads + '+',
    label: 'Ad Campaigns Launched',
    description: 'Across social platforms',
    image: '/images/stats14.png'
  },
  {
    icon: FaDatabase,
    value: formatNumber(counts.dataset) + '+',
    label: 'AI Dataset Size',
    description: 'Creator & audience insights',
    image: '/images/stats15.png'
  },
  {
    icon: FaServer,
    value: counts.uptime + '%',
    label: 'System Uptime',
    description: 'Always available & reliable',
    image: '/images/stats16.png'
  },
  {
    icon: FaShieldAlt,
    value: counts.securityScore + '/100',
    label: 'Security Score',
    description: 'Enterprise-grade protection',
    image: '/images/stats17.png'
  },
  {
    icon: FaCommentDots,
    value: counts.feedback + '+',
    label: 'Feedback Collected',
    description: 'From users & clients',
    image: '/images/stats18.png'
  },
  {
    icon: FaHeart,
    value: formatNumber(counts.likes) + '+',
    label: 'Social Engagements',
    description: 'Likes, shares & saves',
   image: '/images/stats19.png'
  },
  {
    icon: FaCertificate,
    value: counts.awards,
    label: 'Awards Won',
    description: 'For marketing innovation',
    image: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=400&bg=white'
  },
  {
    icon: FaChartPie,
    value: counts.analyticsReports + '+',
    label: 'Analytics Reports',
    description: 'Performance insights delivered',
    image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&bg=white'
  },
  {
    icon: FaMagic,
    value: counts.aiGenerations + '+',
    label: 'AI Generated Assets',
    description: 'Images, captions & scripts',
    image: 'https://images.unsplash.com/photo-1526948128573-703ee1aeb6fa?w=400&bg=white'
  },
  {
    icon: FaUpload,
    value: counts.uploads + '+',
    label: 'Media Uploaded',
    description: 'By brands & influencers',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&bg=white'
  },
  {
    icon: FaMobileAlt,
    value: counts.mobileUsers + '+',
    label: 'Mobile Users',
    description: 'Creators on mobile devices',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&bg=white'
  },
  {
    icon: FaCloudUploadAlt,
    value: counts.cloudSync + '+',
    label: 'Cloud Sync Operations',
    description: 'Fast & seamless storage',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&bg=white'
  },
  {
    icon: FaRecycle,
    value: counts.optimized + '%',
    label: 'AI Optimization Score',
    description: 'Faster, smarter automation',
    image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=400&h=300&fit=crop&bg=white'
  },
  {
    icon: FaSmile,
    value: counts.happyInfluencers + '+',
    label: 'Happy Influencers',
    description: 'Creators who trust us',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&bg=white'
  }
];


const achievements = [
  { 
    img: "/images/achievements1.png",
    label: "G2 Leader 2024",
    color: "#ffffffff"
    
  },
  { 
    img: "/images/achievements2.png",
    label: "4.9/5 Rating",
    color: "#ffffffff"
  },
  { 
    img: "/images/achievements3.png",
    label: "Fastest Growing",
    color: "#ffffffff"
  },
  { 
    img: "/images/achievements4.png",
    label: "Forbes AI 50",
    color: "#ffffffff"
  }
];




  const trustBadges = [
    { icon: FaShieldAlt, label: 'SOC 2 Type II Certified' },
    { icon: FaAward, label: 'GDPR Compliant' },
    { icon: FaClock, label: '99.9% Uptime SLA' },
    { icon: FaHeadset, label: '24/7 Support' }
  ];

  return (
    <section className="elegant-stats-section" ref={sectionRef}>
      <div className="stats-elegant-container">
        {/* Premium Header */}
        <div className="stats-elegant-header">
          <div className="header-elegant-badge">
            <FaBolt className="badge-elegant-icon" />
            <span>Trusted by Industry Leaders Worldwide</span>
          </div>
          <h2 className="header-elegant-title">
            Driving Excellence Through
            <span className="title-elegant-gradient"> Innovation</span>
          </h2>
          <p className="header-elegant-description">
            Join thousands of forward-thinking brands achieving extraordinary results through 
            our AI-powered platform. Every metric represents real impact, innovation, and success.
          </p>
        </div>
        {/* Trust & Security Badges */}
        <div className="trust-elegant-section">
          {trustBadges.map((badge, index) => (
            <React.Fragment key={index}>
              <div className="trust-elegant-item">
                <div className="trust-elegant-icon">
                  <badge.icon />
                </div>
                <span className="trust-elegant-label">{badge.label}</span>
              </div>
              {index < trustBadges.length - 1 && (
                <div className="trust-elegant-divider"></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

        {/* Scrolling Stats Section */}
        <div className="stats-scroll-wrapper">
          {/* First Row - Scroll Left */}
          <div className="stats-scroll-track track-left">
            {[...stats, ...stats].map((stat, index) => (
              <div 
                key={`left-${index}`} 
                className="stat-elegant-item"
                onMouseEnter={() => setHoveredIndex(`left-${index}`)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="stat-image-wrapper">
                  <img 
                    src={stat.image} 
                    alt={stat.label}
                    className="stat-elegant-image"
                  />
                  <div 
                    className={`stat-details-overlay ${hoveredIndex === `left-${index}` ? 'visible' : ''}`}
                    style={{ background: stat.gradient }}
                  >
                    <div className="stat-overlay-content">
                      <div className="stat-icon-display">
                        <stat.icon />
                      </div>
                      <div className="stat-value-display">
                        {stat.value}
                      </div>
                      <h3 className="stat-label-display">{stat.label}</h3>
                      <p className="stat-description-display">{stat.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Second Row - Scroll Right */}
          <div className="stats-scroll-track track-right">
            {[...stats.slice().reverse(), ...stats.slice().reverse()].map((stat, index) => (
              <div 
                key={`right-${index}`} 
                className="stat-elegant-item"
                onMouseEnter={() => setHoveredIndex(`right-${index}`)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="stat-image-wrapper">
                  <img 
                    src={stat.image} 
                    alt={stat.label}
                    className="stat-elegant-image"
                  />
                  <div 
                    className={`stat-details-overlay ${hoveredIndex === `right-${index}` ? 'visible' : ''}`}
                    style={{ background: stat.gradient }}
                  >
                    <div className="stat-overlay-content">
                      <div className="stat-icon-display">
                        <stat.icon />
                      </div>
                      <div className="stat-value-display">
                        {stat.value}
                      </div>
                      <h3 className="stat-label-display">{stat.label}</h3>
                      <p className="stat-description-display">{stat.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Premium Achievements Section */}
<div className="achievements-elegant-section">
  <div className="achievements-elegant-grid">
    {achievements.map((achievement, index) => (
      <div key={index} className="achievement-elegant-item">
        <div 
          className="achievement-elegant-icon"
          style={{ background: `linear-gradient(135deg, ${achievement.color}, ${achievement.color}dd)` }}
        >
          <img 
            src={achievement.img} 
            alt={achievement.label} 
            className="achievement-elegant-img" 
          />
        </div>
        <span className="achievement-elegant-label">{achievement.label}</span>
      </div>
    ))}
  </div>
</div>


        

      <style>{`
        .elegant-stats-section {
          position: relative;
          width: 100%;
          margin: 0 auto;
          padding: 0 auto;
          background: #ffffff;
          overflow: hidden;
        }

        .stats-elegant-container {
          position: relative;
          max-width: 100%;
          margin: 0 auto;
         
        }

        .stats-elegant-header {
          text-align: center;
          margin-bottom: 80px;
        }

        .header-elegant-badge {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          background: #0f6eeaff;
          color: white;
          padding: 12px 28px;
          border-radius: 50px;
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 28px;
          box-shadow: 0 8px 24px rgba(99, 102, 241, 0.25);
        }

        .badge-elegant-icon {
          font-size: 18px;
          animation: pulse-icon 2s ease-in-out infinite;
        }

        @keyframes pulse-icon {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.2);
          }
        }

        .header-elegant-title {
          font-size: 56px;
          font-weight: 700;
          color:  #000000;
          margin-bottom: 24px;
          line-height: 1.15;
          letter-spacing: -2px;
        }

        .title-elegant-gradient {
          color:  #000000;
          
          display: inline-block;
        }

        .header-elegant-description {
          font-size: 19px;
          line-height: 1.8;
          color:  #000000;
          max-width: 850px;
          margin: 0 auto;
          font-weight: 400;
        }

        /* Scrolling Stats */
        .stats-scroll-wrapper {
          display: flex;
          flex-direction: column;
          gap: 32px;
          margin-bottom: 80px;
          position: relative;
          width: 100%;
        }

        /* Fade edges */
        .stats-scroll-wrapper::before,
        .stats-scroll-wrapper::after {
          
          position: absolute;
          top: 0;
          bottom: 0;
          
          z-index: 2;
          pointer-events: none;
        }

        .stats-scroll-wrapper::before {
          left: 0;
          background: linear-gradient(to right, #ffffff, transparent);
        }

        .stats-scroll-wrapper::after {
          right: 0;
          background: linear-gradient(to left, #ffffff, transparent);
        }

        .stats-scroll-track {
          display: flex;
          gap: 32px;
          width: max-content;
        }

        .track-left {
          animation: scrollLeft 60s linear infinite;
        }

        .track-right {
          animation: scrollRight 60s linear infinite;
        }

        @keyframes scrollLeft {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @keyframes scrollRight {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }

        /* Pause on hover */
        .stats-scroll-wrapper:hover .stats-scroll-track {
          animation-play-state: paused;
        }

        .stat-elegant-item {
          flex-shrink: 0;
        }

        .stat-image-wrapper {
          position: relative;
          width: 380px;
          height: 280px;
          border-radius: 24px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .stat-image-wrapper:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
        }

        .stat-elegant-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .stat-image-wrapper:hover .stat-elegant-image {
          transform: scale(1.1);
        }

        .stat-details-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 1;
          transition: opacity 0.4s ease;
          backdrop-filter: blur(8px);
        }

        .stat-details-overlay.visible {
          opacity: 1;
        }

        .stat-overlay-content {
          text-align: center;
          color: white;
          padding: 32px;
          transform: translateY(20px);
          transition: transform 0.4s ease;
        }

        .stat-details-overlay.visible .stat-overlay-content {
          transform: translateY(0);
        }

        .stat-icon-display {
          font-size: 48px;
          margin-bottom: 20px;
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .stat-value-display {
          font-size: 56px;
          font-weight: 900;
          margin-bottom: 12px;
          line-height: 1;
          letter-spacing: -2px;
        }

        .stat-label-display {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .stat-description-display {
          font-size: 14px;
          opacity: 0.9;
        }

        /* Achievements Section */
        .achievements-elegant-section {
          background: #ffffff;
          padding: 60px;
          border-radius: 32px;
          margin-bottom: 60px;
        }

        .achievements-elegant-grid {
          display: flex;
          justify-content: space-around;
          align-items: center;
          gap: 48px;
          flex-wrap: wrap;
        }

        .achievement-elegant-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .achievement-elegant-item:hover {
          transform: translateY(-6px);
        }

        .achievement-elegant-icon {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
}

          .achievement-elegant-img {
  width: 60%;
  height: 60%;
  object-fit: contain;   /* Keep ratio */
}


        .achievement-elegant-item:hover .achievement-elegant-icon {
          transform: scale(1.1) rotate(-5deg);
        }

        .achievement-elegant-label {
          font-size: 16px;
          font-weight: 700;
          color:  #000000;
          text-align: center;
        }

        /* Trust Badges */
        .trust-elegant-section {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 40px;
          flex-wrap: wrap;
          padding: 48px;
          background: white;
          border-radius: 28px;
          
        }

        .trust-elegant-item {
          display: flex;
          align-items: center;
          gap: 14px;
          font-size: 16px;
          color:  #000000;
          font-weight: 600;
          transition: transform 0.3s ease;
        }

        .trust-elegant-item:hover {
          transform: translateX(4px);
        }

        .trust-elegant-icon {
          width: 36px;
          height: 36px;
          background: #0f6eeaff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 18px;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
        }

        .trust-elegant-label {
          white-space: nowrap;
        }

        .trust-elegant-divider {
          width: 2px;
          height: 36px;
          background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.1), transparent);
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

        /* Responsive Design */
        @media (max-width: 1024px) {
          .header-elegant-title {
            font-size: 48px;
          }

          .stat-image-wrapper {
            width: 340px;
            height: 250px;
          }

          .stat-value-display {
            font-size: 48px;
          }
        }

        @media (max-width: 768px) {
          .elegant-stats-section {
            padding: 80px 0;
          }

          .stats-elegant-container {
            padding: 0 20px;
          }

          .stats-elegant-header {
            margin-bottom: 60px;
          }

          .header-elegant-title {
            font-size: 38px;
            letter-spacing: -1.5px;
          }

          .header-elegant-description {
            font-size: 17px;
          }

          .stats-scroll-wrapper {
            gap: 24px;
            margin-bottom: 60px;
            width: 100%;
          }

          .stat-image-wrapper {
            width: 300px;
            height: 220px;
          }

          .stat-icon-display {
            font-size: 40px;
          }

          .stat-value-display {
            font-size: 42px;
          }

          .achievements-elegant-section {
            padding: 40px 24px;
          }

          .achievements-elegant-grid {
            gap: 32px;
          }

          .achievement-elegant-icon {
            width: 64px;
            height: 64px;
            font-size: 28px;
          }

          .trust-elegant-section {
            flex-direction: column;
            gap: 24px;
            padding: 36px 24px;
          }

          .trust-elegant-divider {
            display: none;
          }
        }

        @media (max-width: 640px) {
          .elegant-stats-section {
            padding: 60px 0;
          }

          .header-elegant-badge {
            font-size: 12px;
            padding: 10px 20px;
          }

          .header-elegant-title {
            font-size: 32px;
            letter-spacing: -1px;
          }

          .header-elegant-description {
            font-size: 16px;
          }

          .stats-scroll-track {
            gap: 20px;
          }

          .stat-image-wrapper {
            width: 280px;
            height: 200px;
            border-radius: 20px;
          }

          .stat-overlay-content {
            padding: 24px;
          }

          .stat-icon-display {
            font-size: 36px;
            margin-bottom: 16px;
          }

          .stat-value-display {
            font-size: 38px;
          }

          .stat-label-display {
            font-size: 18px;
          }

          .stat-description-display {
            font-size: 13px;
          }

          .achievement-elegant-icon {
            width: 56px;
            height: 56px;
            font-size: 24px;
          }

          .achievement-elegant-label {
            font-size: 14px;
          }
        }

        @media (max-width: 480px) {
          .header-elegant-title {
            font-size: 28px;
          }

          .stat-image-wrapper {
            width: 260px;
            height: 180px;
          }

          .stat-value-display {
            font-size: 34px;
          }

          .achievements-elegant-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 24px;
          }
        }
      `}</style>
    </section>
  );
};

export default ElegantStatsSection;