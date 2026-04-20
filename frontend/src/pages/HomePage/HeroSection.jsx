// import React from 'react';
// import { 
//   FaRocket, 
//   FaPlay, 
//   FaCheckCircle,
//   FaStar,
//   FaArrowRight,
//   FaShieldAlt,
//   FaBolt,
//   FaUsers
// } from 'react-icons/fa';

// const HeroSection = () => {
//   const features = [
//     'AI-Powered Matching',
//     'Real-Time Analytics',
//     'Automated Workflows',
//     'ROI Optimization'
//   ];

//   return (
//     <section className="quickbox-hero-section">
//       <div className="hero-main-container">
//         <div className="hero-content-wrapper">

//           {/* Announcement Badge */}
//           <div className="hero-announcement-badge">
//             <FaBolt className="announcement-icon" />
//             <span className="announcement-text">New: AI Campaign Builder 2.0 Now Live</span>
//             <FaArrowRight className="announcement-arrow" />
//           </div>

//           {/* Main Headline */}
//           <h1 className="hero-main-heading">
//             Transform
//             <h2 className="hero-main-heading"> Your Brand with{' '} </h2>
//             <span className="hero-gradient-text">
//               AI-Powered Influencer Marketing
//             </span>
//           </h1>

//           {/* Subheadline */}
//           {/* <p className="hero-subheading">
//             Connect with 10M+ verified influencers, launch campaigns in minutes, and track performance with AI-powered insights. The all-in-one platform trusted by leading brands worldwide.
//           </p> */}

//           {/* Key Features List */}
//           {/* <div className="hero-features-list">
//             {features.map((feature, index) => (
//               <div key={index} className="hero-feature-item">
//                 <FaCheckCircle className="feature-check-icon" />
//                 <span>{feature}</span>
//               </div>
//             ))}
//           </div> */}

//           {/* CTA Buttons */}
//           <div className="hero-cta-group">
//             <button className="hero-btn hero-btn-primary">
//               <FaRocket />
//               <span>Start Free Trial</span>
//             </button>
//             <button className="hero-btn hero-btn-secondary">
//               <FaPlay />
//               <span>Watch Demo</span>
//             </button>
//           </div>

//           {/* Trust Indicators */}
//           <div className="hero-trust-section">
//             {/* <div className="trust-stats-row">
//               <div className="trust-stat-item">
//                 <FaStar className="trust-icon" />
//                 <div className="trust-stat-content">
//                   <strong>4.9/5</strong>
//                   <span>2,400+ Reviews</span>
//                 </div>
//               </div>
//               <div className="trust-stat-divider"></div>
//               <div className="trust-stat-item">
//                 <FaUsers className="trust-icon" />
//                 <div className="trust-stat-content">
//                   <strong>500+</strong>
//                   <span>Brands Trust Us</span>
//                 </div>
//               </div>
//               <div className="trust-stat-divider"></div>
//               <div className="trust-stat-item">
//                 <FaShieldAlt className="trust-icon" />
//                 <div className="trust-stat-content">
//                   <strong>SOC 2</strong>
//                   <span>Certified</span>
//                 </div>
//               </div>
//             </div> */}

//             {/* Trusted Brands */}
//             {/* <div className="hero-trusted-brands">
//               <p className="trusted-label">Trusted by industry leaders</p>
//               <div className="trusted-brands-grid">
//   {[
//     'Meta',
//     'Google',
//     'Instagram',
//     'YouTube',
//     'Canva',
//     // 'Shopify',
//     // 'Hootsuite',
//     // 'HubSpot',
//     'Stripe'
//   ].map((brand, index) => (
//     <div key={index} className="trusted-brand-logo">
//       <span>{brand}</span>
//     </div>
//   ))}
// </div>

//             </div> */}
//           </div>
//         </div>

//         {/* Dashboard Preview */}
//         <div className="hero-visual-wrapper">

//         <img 
//                   src="/images/herocard.png"
//                   alt="Quickbox.io Analytics Dashboard"
//                   className="dashboard-screenshot"
//                 />

//           <div className="hero-dashboard-container">
//             {/* Main Dashboard Image */}
//             {/* <div className="hero-dashboard-preview">
//               <div className="dashboard-browser-chrome">
//                 <div className="browser-dots">
//                   <span className="dot dot-red"></span>
//                   <span className="dot dot-yellow"></span>
//                   <span className="dot dot-green"></span>
//                 </div>
//                 <div className="browser-address-bar">
//                   <FaShieldAlt className="secure-icon" />
//                   <span>app.quickbox.io/dashboard</span>
//                 </div>
//               </div>

//               <div className="dashboard-content-area">
//                 <img 
//                   src="/images/herocard.jpg"
//                   alt="Quickbox.io Analytics Dashboard"
//                   className="dashboard-screenshot"
//                 />
//               </div>
//             </div> */}
//           </div>
//         </div>
//       </div>

//       <style>{`
//         .quickbox-hero-section {
//           position: relative;

//           display: flex;
//           max-width: 100%;
//           overflow: hidden;

//   margin: 0 auto;

//           align-items: center;
//           background: rgb(255, 255, 255);
//           align-items: center;
//   justify-content: center;
//         }

//         .hero-main-container {
//           position: relative;
//           max-width: 1400px;
//           height: 90vh;
//           background: rgb(255, 255, 255);
//           display: grid;
//           grid-template-columns: 1fr 1fr;
//           gap: 80px;
//           align-items: center;
//         }

//         .hero-content-wrapper {
//           display: flex;
//           padding: 0 60px;
//           flex-direction: column;
//           gap: 32px;
//           background: rgba(255, 255, 255, 0);
//           z-index: 10;
//         }

//         .hero-announcement-badge {
//           display: inline-flex;
//           align-items: center;
//           gap: 10px;
//           background: #0f6eeaff;
//           color: white;
//           padding: 10px 20px;
//           border-radius: 50px;
//           font-size: 14px;
//           font-weight: 600;
//           box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
//           width: fit-content;
//           cursor: pointer;
//           transition: all 0.3s ease;
//         }

//         .hero-announcement-badge:hover {
//           transform: translateY(-2px);
//           box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
//         }

//         .announcement-icon {
//           font-size: 16px;
//         }

//         .announcement-text {
//           flex: 1;
//         }

//         .announcement-arrow {
//           font-size: 12px;
//         }

//         .hero-main-heading {
//           font-size: 38px;
//           font-weight: 700;
//           line-height: 1.1;
//           color: #000000;
//           letter-spacing: -2px;
//           margin: 0;
//         }

//         .hero-gradient-text {
//           color: #000000;
//           font-size: 48px;
//           font-weight: 700;

//           background-clip: text;
//           display: inline-block;
//           padding-bottom: 10px ;
//         }

//         .hero-subheading {
//           font-size: 20px;
//           line-height: 1.7;
//           color: #64748b;
//           max-width: 600px;
//           margin: 0;
//         }

//         .hero-features-list {
//           display: grid;
//           grid-template-columns: repeat(2, 1fr);
//           gap: 16px;
//         }

//         .hero-feature-item {
//           display: flex;
//           align-items: center;
//           gap: 12px;
//           font-size: 16px;
//           color: #000000;
//           font-weight: 600;
//         }

//         .feature-check-icon {
//           color: #10b981;
//           font-size: 18px;
//           flex-shrink: 0;
//         }

//         .hero-cta-group {
//           display: flex;
//           gap: 16px;
//           flex-wrap: wrap;
//         }

//         .hero-btn {
//           display: inline-flex;
//           align-items: center;
//           gap: 10px;
//           padding: 16px 32px;
//           border-radius: 12px;
//           font-size: 17px;
//           font-weight: 700;
//           border: none;
//           cursor: pointer;
//           transition: all 0.3s ease;
//         }

//         .hero-btn-primary {
//           background: #0f6eeaff;
//           color: white;
//           box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
//         }

//         .hero-btn-primary:hover {
//           transform: translateY(-3px);
//           box-shadow: 0 12px 28px rgba(99, 102, 241, 0.4);
//         }

//         .hero-btn-secondary {
//           background: white;
//           color: rgb(58, 134, 255);
//           border: 2px solid #e2e8f0;
//         }

//         .hero-btn-secondary:hover {
//           border-color: #6366f1;
//           background: #ffffffff;
//           transform: translateY(-3px);
//         }

//         .hero-trust-section {
//           display: flex;
//           flex-direction: column;
//           gap: 24px;
//         }

//         .trust-stats-row {
//           display: flex;
//           align-items: center;
//           gap: 24px;
//           flex-wrap: wrap;
//         }

//         .trust-stat-item {
//           display: flex;
//           align-items: center;
//           gap: 12px;
//         }

//         .trust-icon {
//           color: #fbbf24;
//           font-size: 24px;
//         }

//         .trust-stat-content {
//           display: flex;
//           flex-direction: column;
//           gap: 2px;
//         }

//         .trust-stat-content strong {
//           font-size: 18px;
//           color: #0f172a;
//           font-weight: 800;
//         }

//         .trust-stat-content span {
//           font-size: 13px;
//           color: #64748b;
//           font-weight: 500;
//         }

//         .trust-stat-divider {
//           width: 1px;
//           height: 32px;
//           background: #ffffffff;
//         }

//         .hero-trusted-brands {
//           display: flex;
//           flex-direction: column;
//           gap: 16px;
//         }

//         .trusted-label {
//           font-size: 13px;
//           color: #94a3b8;
//           font-weight: 600;
//           text-transform: uppercase;
//           letter-spacing: 1px;
//         }

//         .trusted-brands-grid {
//           display: flex;
//           gap: 32px;
//           flex-wrap: wrap;
//           align-items: center;
//         }

//         .trusted-brand-logo {
//           opacity: 0.5;
//           transition: all 0.3s ease;
//           cursor: pointer;
//         }

//         .trusted-brand-logo:hover {
//           opacity: 1;
//           transform: translateY(-2px);
//         }

//         .trusted-brand-logo span {
//           font-size: 18px;
//           font-weight: 700;
//           color: #334155;
//         }

//         .hero-visual-wrapper {
//           position: relative;
//           background: #ffffffff;

//         z-index: 1;
//         }

//         .hero-dashboard-container {
//           position: relative;
//           background: #ffffffff;
//         }

//         .dashboard-screenshot {
//   position: relative;
//   z-index: 1;
//     width: 100%;
//     transform: scale(2); /* enlarge 30% */
//         transform-origin: center;
// }

//         .hero-dashboard-preview {
//           background: white;
//           border-radius: 20px;
//           overflow: hidden;
//           border: 1px solid #e2e8f0;
//           transition: all 0.5s ease;
//           background: #ffffffff;
//         }

//         .hero-dashboard-preview:hover {
//           transform: translateY(-10px);
//         }

//         .dashboard-browser-chrome {
//           background: #ffffffff;
//           padding: 12px 16px;
//           border-bottom: 1px solid #e2e8f0;
//           display: flex;
//           align-items: center;
//           gap: 12px;
//         }

//         .browser-dots {
//           display: flex;
//           gap: 6px;
//         }

//         .dot {
//           width: 12px;
//           height: 12px;
//           border-radius: 50%;
//           transition: transform 0.3s ease;
//         }

//         .dot-red { background: #ef4444; }
//         .dot-yellow { background: #f59e0b; }
//         .dot-green { background: #10b981; }

//         .browser-dots:hover .dot {
//           transform: scale(1.2);
//         }

//         .browser-address-bar {
//           flex: 1;
//           background: white;
//           padding: 8px 12px;
//           border-radius: 8px;
//           display: flex;
//           align-items: center;
//           gap: 8px;
//           font-size: 13px;
//           color: #64748b;
//           border: 1px solid #e2e8f0;
//         }

//         .secure-icon {
//           color: #10b981;
//           font-size: 14px;
//         }

//         .dashboard-content-area {
//           background: #ffffffff;
//         }




//         /* Responsive Design */
//         @media (max-width: 1200px) {
//           .hero-main-container {
//             gap: 60px;
//           }

//           .hero-main-heading {
//             font-size: 48px;
//           }

//           .hero-subheading {
//             font-size: 18px;
//           }
//         }

//         @media (max-width: 968px) {
//           .quickbox-hero-section {
//             padding: 80px 0 60px;
//           }

//           .hero-main-container {
//             grid-template-columns: 1fr;
//             gap: 60px;
//           }

//           .hero-content-wrapper {
//             text-align: center;
//             align-items: center;
//             z-index: 15;
//             background: rgba(255, 255, 255, 0);
//           }

//           .hero-announcement-badge {
//             width: fit-content;
//           }

//           .hero-main-heading {
//             font-size: 42px;
//           }

//           .hero-subheading {
//             max-width: 100%;
//           }

//           .hero-features-list {
//             justify-content: center;
//           }

//           .hero-cta-group {
//             justify-content: center;
//           }

//           .trust-stats-row {
//             justify-content: center;
//           }

//           .trusted-brands-grid {
//             justify-content: center;
//           }
//         }

//         @media (max-width: 640px) {
//           .hero-main-heading {
//             font-size: 36px;
//             letter-spacing: -1px;
//           }

//           .hero-subheading {
//             font-size: 16px;
//           }

//           .hero-features-list {
//             grid-template-columns: 1fr;
//             gap: 12px;
//           }

//           .hero-feature-item {
//             justify-content: center;
//           }

//           .hero-cta-group {
//             flex-direction: column;
//             width: 100%;
//           }

//           .hero-btn {
//             width: 100%;
//             justify-content: center;
//           }

//           .trust-stats-row {
//             flex-direction: column;
//             align-items: center;
//             gap: 16px;
//           }

//           .trust-stat-divider {
//             display: none;
//           }

//           .trusted-brands-grid {
//             grid-template-columns: repeat(2, 1fr);
//             gap: 20px;
//             width: 100%;
//           }

//           .trusted-brand-logo {
//             text-align: center;
//           }

//           .hero-dashboard-preview {
//             transform: none;
//           }

//           .hero-dashboard-preview:hover {
//             transform: translateY(-5px);
//           }
//         }

//         @media (max-width: 480px) {
//           .quickbox-hero-section {
//             padding: 60px 0 40px;
//           }

//           .hero-main-container {
//             padding: 0 20px;
//           }

//           .hero-announcement-badge {
//             font-size: 12px;
//             padding: 8px 16px;
//             flex-wrap: wrap;
//             justify-content: center;
//           }

//           .hero-main-heading {
//             font-size: 28px;
//           }

//           .hero-subheading {
//             font-size: 15px;
//           }

//           .hero-btn {
//             padding: 14px 24px;
//             font-size: 15px;
//           }
//         }
//       `}</style>
//     </section>
//   );
// };

// export default HeroSection;


import React, { useState, useEffect } from "react";
import { Play, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

function HeroCard() {
  const [isVisible, setIsVisible] = useState(false);
  const [iconErrors, setIconErrors] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  const navigate = useNavigate();

  const goToLogin = () => {
    navigate("/login");
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1124);
    };

    checkMobile(); // initial check
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleImageError = (iconName) => {
    setIconErrors(prev => ({ ...prev, [iconName]: true }));
  };

  const getIconContent = (iconName, emoji) => {
    if (iconErrors[iconName]) {
      return <span style={{ fontSize: '32px' }}>{emoji}</span>;
    }
    return <img src={`/images/${iconName}.png`} alt={emoji} style={styles.floatingImage} />;
  };

  return (
    <div className="hero-section" style={styles.heroSection}>
      <div style={styles.container}>
        {/* Floating Icons */}

        {!isMobile && (
          <div style={styles.floatingLayer}>

            {/* Megaphone — Top Left */}
            <img
              src="/images/megaphone.png"
              alt="Brio Campaign Announcement Megaphone"
              style={{ ...styles.floatImg, ...styles.posMegaphone }}
              onError={(e) => e.target.src = ""}
            />

            {/* Heart — Top Right */}
            <img
              src="/images/love.png"
              alt="Influencer Audience Engagement Heart"
              style={{ ...styles.floatImg, ...styles.posHeartTop }}
            />

            {/* Love Face — Left Middle */}
            <img
              src="/images/love.png"
              alt="Authentic Content Creator Reaction"
              style={{ ...styles.floatImg, ...styles.posLove }}
            />

            {/* Thumbs Up — Right Middle */}
            <img
              src="/images/like.png"
              alt="Successful Brand Collaboration Like"
              style={{ ...styles.floatImg, ...styles.posThumbs }}
            />

            {/* Target — Bottom Left */}
            <img
              src="/images/chat.png"
              alt="AI Targeted Influencer Discovery Chat"
              style={{ ...styles.floatImg, ...styles.posTarget }}
            />

            {/* Heart Bubble — Bottom Right */}
            <img
              src="/images/chat.png"
              alt="Brio Real-time Support Chat"
              style={{ ...styles.floatImg, ...styles.posHeartBubble }}
            />

          </div>
        )}


        {/* Main Content */}
        <div style={{
          ...styles.contentWrapper,
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        }}>
          {/* Header */}
          <div style={styles.header}>
            <h1 style={styles.mainTitle}>
              Transform Your Brand with{" "}
              <Heart
                size={32}
                color="#FF6B6B"
                fill="#FF6B6B"
                style={styles.heartIcon}
              />
            </h1>
            <h2 style={styles.subTitle}>AI-Powered Influencer Marketing</h2>
          </div>

          {/* Description */}
          <p style={styles.description}>
            Brio connects you with the perfect influencers,
            <br />
            measures campaign performance, and maximizes your
            <br />
            ROI all in one platform.
          </p>

          {/* CTA Buttons */}
          <div style={styles.ctaContainer}>
            <button style={styles.primaryButton} onClick={goToLogin}>
              Get Started Free
            </button>
            <button style={styles.secondaryButton} onClick={() => navigate("/demo")}>
              <Play size={18} color="black" style={{ marginRight: '8px' }} />
              View Demo
            </button>
          </div>
        </div>

        {/* Image Collage */}
        <div style={{
          ...styles.imageCollage,
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(50px) scale(0.95)',
        }}>
          <div style={styles.imageGrid}>
            {/* Image 1 */}
            <div style={{ ...styles.imageCard, ...styles.image1 }}>
              <div style={styles.imagePlaceholder}>
                <img
                  src="/images/hero1.png"
                  alt="Brio Platform Team Collaborating on Influencer Marketing"
                  style={styles.collageImage}
                />
              </div>
            </div>

            {/* Image 2 */}
            <div style={{ ...styles.imageCard, ...styles.image2 }}>
              <div style={styles.imagePlaceholder}>
                <img
                  src="/images/hero2.png"
                  alt="Brio AI Campaign Dashboard Preview"
                  style={styles.collageImage}
                />
              </div>
            </div>

            {/* Image 3 - Center */}
            <div style={{ ...styles.imageCard, ...styles.image3 }}>
              <div style={styles.imagePlaceholder}>
                <img
                  src="/images/hero3.png"
                  alt="Influencer Growth Tracking and Analytics"
                  style={styles.collageImage}
                />
              </div>
            </div>

            {/* Image 4 */}
            <div style={{ ...styles.imageCard, ...styles.image4 }}>
              <div style={styles.imagePlaceholder}>
                <img
                  src="/images/hero5.png"
                  alt="Brio Team"
                  style={styles.collageImage}
                />
              </div>
            </div>

            {/* Image 5 */}
            <div style={{ ...styles.imageCard, ...styles.image5 }}>
              <div style={styles.imagePlaceholder}>
                <img
                  src="/images/hero4.png"
                  alt="Brio Team"
                  style={styles.collageImage}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  heroSection: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #F0F9FF 0%, #E0F2FE 50%, #BAE6FD 100%)',
    padding: '60px 20px 80px',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 2,
  },
  floatingIconsContainer: {
    position: 'relative',
    width: '100%'
    // minHeight: '200px',
    // marginBottom: '40px',
    // '@media (max-width: 768px)': {
    //   minHeight: '150px',
    //   marginBottom: '20px',
    // },
  },
  floatingIcon: {
    position: 'absolute',
    width: '60px',
    height: '60px',
    // borderRadius: '50%',
    // backgroundColor: 'rgba(255, 255, 255, 0.85)',
    // backdropFilter: 'blur(4px)',
    // boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    '@media (max-width: 1024px)': {
      width: '50px',
      height: '50px',
    },
    '@media (max-width: 768px)': {
      width: '40px',
      height: '40px',
      display: 'none', // Hide on mobile for cleaner look
    },
  },
  iconTopLeft: {
    top: '0',
    left: '0',
    '@media (min-width: 769px)': {
      top: '10%',
      left: '5%',
    },
  },
  iconTopRight: {
    top: '0',
    right: '0',
    '@media (min-width: 769px)': {
      top: '15%',
      right: '5%',
    },
  },
  iconLeft: {
    top: '50%',
    left: '0',
    transform: 'translateY(-50%)',
    '@media (min-width: 769px)': {
      left: '3%',
    },
  },
  iconRight: {
    top: '50%',
    right: '0',
    transform: 'translateY(-50%)',
    '@media (min-width: 769px)': {
      right: '3%',
    },
  },
  iconBottomLeft: {
    bottom: '0',
    left: '0',
    '@media (min-width: 769px)': {
      bottom: '15%',
      left: '5%',
    },
  },
  iconBottomRight: {
    bottom: '0',
    right: '0',
    '@media (min-width: 769px)': {
      bottom: '10%',
      right: '3%',
    },
  },

  floatingLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: 1
  },

  floatImg: {
    width: "90px",
    height: "90px",
    objectFit: "contain",
    position: "absolute",
    opacity: 1,
  },

  /* EXACT SCREENSHOT POSITIONS */
  posMegaphone: {
    top: "10px",
    left: "120px",
  },

  posHeartTop: {
    top: "5px",
    right: "80px",
  },

  posLove: {
    top: "120px",
    left: "80px",
  },

  posThumbs: {
    top: "280px",
    right: "180px",
  },

  posTarget: {
    top: "280px",
    left: "200px",
  },

  posHeartBubble: {
    top: "120px",
    right: "80px",
  },

  floatingImage: {
    width: '32px',
    height: '32px',
    objectFit: 'contain',
    '@media (max-width: 1024px)': {
      width: '28px',
      height: '28px',
    },
    '@media (max-width: 768px)': {
      width: '24px',
      height: '24px',
    },
  },
  contentWrapper: {
    textAlign: 'center',
    marginBottom: '60px',
    padding: '0 20px',
    position: 'relative',
    zIndex: 2,
    transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
    '@media (max-width: 768px)': {
      marginBottom: '40px',
      padding: '0 10px',
    },
  },
  header: {
    marginBottom: '24px',
    '@media (max-width: 768px)': {
      marginBottom: '16px',
    },
  },
  mainTitle: {
    fontSize: '48px',
    fontWeight: '800',
    color: '#1e293b',
    margin: '0 0 8px 0',
    lineHeight: '1.2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    '@media (max-width: 1024px)': {
      fontSize: '40px',
    },
    '@media (max-width: 768px)': {
      fontSize: '32px',
      flexDirection: 'column',
      gap: '8px',
    },
    '@media (max-width: 480px)': {
      fontSize: '28px',
    },
  },
  heartIcon: {
    display: 'inline-block',
    verticalAlign: 'middle',
    marginLeft: '8px',
    '@media (max-width: 768px)': {
      marginLeft: '0',
      marginTop: '4px',
    },
  },
  subTitle: {
    fontSize: '52px',
    fontWeight: '800',
    background: '#3B82F6',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    margin: '0',
    lineHeight: '1.2',
    '@media (max-width: 1024px)': {
      fontSize: '44px',
    },
    '@media (max-width: 768px)': {
      fontSize: '36px',
    },
    '@media (max-width: 480px)': {
      fontSize: '28px',
    },
  },
  description: {
    fontSize: '17px',
    color: '#000000ff',
    lineHeight: '1.7',
    marginBottom: '40px',
    fontWeight: '500',
    '@media (max-width: 1024px)': {
      fontSize: '16px',
    },
    '@media (max-width: 768px)': {
      fontSize: '15px',
      marginBottom: '32px',
      br: {
        display: 'none',
      },
    },
    '@media (max-width: 480px)': {
      fontSize: '14px',
      lineHeight: '1.6',
    },
  },
  ctaContainer: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    '@media (max-width: 480px)': {
      flexDirection: 'column',
      gap: '12px',
    },
  },
  primaryButton: {
    padding: '16px 36px',
    fontSize: '17px',
    fontWeight: '600',
    color: 'white',
    backgroundColor: '#3B82F6',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 16px rgba(59, 130, 246, 0.4)',
    '&:hover': {
      backgroundColor: '#2563EB',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(59, 130, 246, 0.5)',
    },
    '@media (max-width: 768px)': {
      padding: '14px 32px',
      fontSize: '16px',
    },
    '@media (max-width: 480px)': {
      width: '100%',
      maxWidth: '300px',
    },
  },
  secondaryButton: {
    padding: '16px 32px',
    fontSize: '17px',
    fontWeight: '600',
    color: '#3B82F6',
    backgroundColor: 'white',
    border: '2px solid #3B82F6',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
    '&:hover': {
      backgroundColor: '#F8FAFC',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(59, 130, 246, 0.2)',
    },
    '@media (max-width: 768px)': {
      padding: '14px 28px',
      fontSize: '16px',
    },
    '@media (max-width: 480px)': {
      width: '100%',
      maxWidth: '300px',
      justifyContent: 'center',
    },
  },
  imageCollage: {
    marginTop: '60px',
    transition: 'all 1s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s',
    '@media (max-width: 768px)': {
      marginTop: '40px',
    },
  },
  imageGrid: {
    position: 'relative',
    height: '380px',
    maxWidth: '100%',
    margin: '0 auto',
    '@media (max-width: 1024px)': {
      height: '320px',
    },
    '@media (max-width: 768px)': {
      height: '250px',
    },
    '@media (max-width: 640px)': {
      height: '200px',
    },
  },
  imageCard: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: '24px',
    overflow: 'hidden',
    boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
    transition: 'all 0.4s ease',
    '&:hover': {
      transform: 'translateY(-8px)',
      boxShadow: '0 16px 40px rgba(0,0,0,0.2)',
      zIndex: 10,
    },
    '@media (max-width: 768px)': {
      borderRadius: '16px',
    },
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, #667eea00 0%, #764ba21d 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  collageImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  // Responsive image positioning
  image1: {
    width: '260px',
    height: '300px',
    left: '0',
    top: '40px',
    transform: 'rotate(-3deg)',
    zIndex: 2,
    '@media (max-width: 1024px)': {
      width: '220px',
      height: '260px',
      left: '5%',
    },
    '@media (max-width: 768px)': {
      width: '160px',
      height: '190px',
      left: '2%',
      top: '30px',
    },
    '@media (max-width: 640px)': {
      width: '130px',
      height: '150px',
      left: '1%',
      top: '25px',
    },
  },
  image2: {
    width: '240px',
    height: '300px',
    left: '240px',
    top: '60px',
    transform: 'rotate(2deg)',
    zIndex: 3,
    '@media (max-width: 1024px)': {
      width: '200px',
      height: '260px',
      left: '25%',
    },
    '@media (max-width: 768px)': {
      width: '150px',
      height: '190px',
      left: '22%',
      top: '40px',
    },
    '@media (max-width: 640px)': {
      width: '120px',
      height: '150px',
      left: '20%',
      top: '35px',
    },
  },
  image3: {
    width: '280px',
    height: '320px',
    left: '50%',
    top: '30px',
    transform: 'translateX(-50%) rotate(-1deg)',
    zIndex: 5,
    '@media (max-width: 1024px)': {
      width: '240px',
      height: '280px',
    },
    '@media (max-width: 768px)': {
      width: '180px',
      height: '210px',
      top: '20px',
    },
    '@media (max-width: 640px)': {
      width: '140px',
      height: '170px',
      top: '15px',
    },
  },
  image4: {
    width: '240px',
    height: '300px',
    right: '240px',
    top: '60px',
    transform: 'rotate(-2deg)',
    zIndex: 3,
    '@media (max-width: 1024px)': {
      width: '200px',
      height: '260px',
      right: '25%',
    },
    '@media (max-width: 768px)': {
      width: '150px',
      height: '190px',
      right: '22%',
      top: '40px',
    },
    '@media (max-width: 640px)': {
      width: '120px',
      height: '150px',
      right: '20%',
      top: '35px',
    },
  },
  image5: {
    width: '260px',
    height: '300px',
    right: '0',
    top: '40px',
    transform: 'rotate(3deg)',
    zIndex: 2,
    '@media (max-width: 1024px)': {
      width: '220px',
      height: '260px',
      right: '5%',
    },
    '@media (max-width: 768px)': {
      width: '160px',
      height: '190px',
      right: '2%',
      top: '30px',
    },
    '@media (max-width: 640px)': {
      width: '130px',
      height: '150px',
      right: '1%',
      top: '25px',
    },
  },
};

// Convert media queries for React inline styles
const responsiveStyles = (styles) => {
  const newStyles = { ...styles };

  // Process media queries
  Object.keys(newStyles).forEach(key => {
    if (newStyles[key] && typeof newStyles[key] === 'object') {
      if ('@media' in newStyles[key]) {
        // Handle nested media queries
        const baseStyle = { ...newStyles[key] };
        delete baseStyle['@media'];
        newStyles[key] = baseStyle;
      }
    }
  });

  return newStyles;
};

export default HeroCard;