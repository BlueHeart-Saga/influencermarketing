// import React from "react";
// import "../style/About.css";
// import { 
//   FaBullseye,       
//   FaShieldAlt,      
//   FaChartLine,      
//   FaLock,           
//   FaGlobe,          
//   FaLightbulb,
//   FaRocket,
//   FaUsers,
//   FaCogs
// } from "react-icons/fa";

// function About() {
//   return (
//     <>
//       <div className="about-container">
//         {/* Hero Section */}
//         <section className="about-hero">
//           <div className="hero-content">
//             <h1 className="about-title">AI-Powered Influencer Marketing</h1>
//             <p className="about-intro">
//               Quickbox.io automates influencer discovery, campaign management, and performance tracking using advanced AI technology. Streamline your influencer partnerships and maximize ROI.
//             </p>
//             <div className="hero-stats">
//               <div className="stat-item">
//                 <h3>10K+</h3>
//                 <p>Influencers</p>
//               </div>
//               <div className="stat-item">
//                 <h3>92%</h3>
//                 <p>Efficiency Gain</p>
//               </div>
//               <div className="stat-item">
//                 <h3>200M+</h3>
//                 <p>Data Points</p>
//               </div>
//             </div>
//           </div>
//           <div className="hero-image">
//             <img src="/images/about4.png" alt="Quickbox.io Platform Dashboard" />
//           </div>
//         </section>

//         {/* Mission Section */}
//         <section className="about-section mission-section">
          
          
//           <div className="about-card">
//             <div className="about-image">
//               <img src="/images/about1.png" alt="Quickbox.io Mission" />
//             </div>
            
//             <div className="about-text">
//               <div className="section-header">
//             <h2>Our Mission</h2>
//             {/* <p>Simplifying influencer marketing through automation</p> */}
//           </div>
//               <div className="mission-points">
//                 <div className="point">
//                   <div className="point-icon">✓</div>
//                   <div className="point-content">
//                     <h4>Automate Discovery</h4>
//                     <p>AI-driven matching for perfect brand-influencer partnerships</p>
//                   </div>
//                 </div>
//                 <div className="point">
//                   <div className="point-icon">✓</div>
//                   <div className="point-content">
//                     <h4>Streamline Campaigns</h4>
//                     <p>End-to-end automation from outreach to payment</p>
//                   </div>
//                 </div>
//                 <div className="point">
//                   <div className="point-icon">✓</div>
//                   <div className="point-content">
//                     <h4>Measure Impact</h4>
//                     <p>Real-time analytics and ROI tracking</p>
//                   </div>
//                 </div>
//               </div>
//             </div>
            
//           </div>
//         </section>

//         {/* Solutions Section */}
//         <section className="about-section offerings-section">
          
//           <div className="about-card reverse">
            
//             <div className="about-image">
//               <img src="/images/about2.png" alt="Quickbox.io Solutions" />
//             </div>
//             <div className="about-text">
//               <div className="section-header">
//             <h2>Our Solutions</h2>
//             {/* <p>Complete influencer marketing automation</p> */}
//           </div>
//               <div className="offering-item">
//                 <div className="offering-icon"><FaBullseye /></div>
//                 <div className="offering-content">
//                   <h4>Smart Discovery</h4>
//                   <p>AI-powered influencer matching</p>
//                 </div>
//               </div>
//               <div className="offering-item">
//                 <div className="offering-icon"><FaRocket /></div>
//                 <div className="offering-content">
//                   <h4>Campaign Automation</h4>
//                   <p>Automated workflow management</p>
//                 </div>
//               </div>
//               <div className="offering-item">
//                 <div className="offering-icon"><FaChartLine /></div>
//                 <div className="offering-content">
//                   <h4>Performance Analytics</h4>
//                   <p>Real-time campaign tracking</p>
//                 </div>
//               </div>
//               <div className="offering-item">
//                 <div className="offering-icon"><FaCogs /></div>
//                 <div className="offering-content">
//                   <h4>Platform Integration</h4>
//                   <p>Seamless tool connections</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Benefits Section */}
//         <section className="about-section differentiators-section">
//           <div className="section-header">
//             <h2>Why Quickbox.io?</h2>
//             {/* <p>Enterprise-grade influencer marketing automation</p> */}
//           </div>

//           <div className="differentiators-grid">
            
//             <div className="differentiator-card">
              
//               <div className="diff-icon"><FaBullseye /></div>
//               <h4>Precision AI Matching</h4>
//               <p>Advanced algorithms for perfect brand-influencer alignment</p>
//             </div>

//             <div className="differentiator-card">
//               <div className="diff-icon"><FaShieldAlt /></div>
//               <h4>Fraud Protection</h4>
//               <p>Detect fake followers and ensure authentic engagement</p>
//             </div>

//             <div className="differentiator-card">
//               <div className="diff-icon"><FaChartLine /></div>
//               <h4>ROI Tracking</h4>
//               <p>Clear attribution from content to conversions</p>
//             </div>

//             <div className="differentiator-card">
//               <div className="diff-icon"><FaLock /></div>
//               <h4>Secure Platform</h4>
//               <p>Enterprise-grade data protection and security</p>
//             </div>

//             <div className="differentiator-card">
//               <div className="diff-icon"><FaGlobe /></div>
//               <h4>Global Network</h4>
//               <p>Access influencers across all platforms and regions</p>
//             </div>

//             <div className="differentiator-card">
//               <div className="diff-icon"><FaUsers /></div>
//               <h4>Expert Support</h4>
//               <p>Dedicated team for strategy and technical guidance</p>
//             </div>
//           </div>
//         </section>

//         {/* Story Section */}
//         <section className="about-section team-section">
//           <div className="section-header">
//             <h2>Our Story</h2>
//             {/* <p>Built by marketers, powered by AI</p> */}
//           </div>
//           <div className="story-content">
            
//             <div className="story-text">
//               <p>
//                 Quickbox.io was founded to solve the complexity of influencer marketing. We saw brands struggling with manual processes, unreliable data, and inefficient campaign management.
//               </p>
//               <p>
//                 Our platform combines marketing expertise with cutting-edge AI to deliver a seamless, automated solution. Today, we help businesses of all sizes scale their influencer partnerships with confidence.
//               </p>
//               <div className="values">
//                 <h4>Our Values</h4>
//                 <div className="values-list">
//                   <span className="value-pill">Innovation</span>
//                   <span className="value-pill">Simplicity</span>
//                   <span className="value-pill">Results</span>
//                   <span className="value-pill">Partnership</span>
//                 </div>
//               </div>
//             </div>
//             <div className="story-image">
//               <img src="/images/gang.png" alt="Quickbox.io Team" />
//             </div>
//           </div>
//         </section>

//         {/* CTA Section */}
//         <section className="about-cta">
//           <h2>Ready to Automate Your Influencer Marketing?</h2>
//           <p>Join brands using Quickbox.io to streamline their influencer partnerships</p>
//           <div className="cta-buttons">
//             <button className="btn btn-primary">Get Started</button>
//             <button className="btn btn-secondary">View Demo</button>
//           </div>
//         </section>
//       </div>
//     </>
//   );
// }

// export default About;



import React, { useState, useEffect, useRef } from "react";
import { CheckCircle, ChevronDown } from "lucide-react";
import AboutUsHero from "./HomePage/about_hero";
import ProfessionalFeatures from "./HomePage/professionalFeatures";
import TestimonialsSection from "./HomePage/TestimonialsSection";
import { setPageTitle } from "../components/utils/pageTitle";
import { useNavigate } from "react-router-dom";


function AboutUs() {
  const [activeSection, setActiveSection] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const sectionsRef = useRef([]);
  const observerRef = useRef(null);

  useEffect(() => {
  setPageTitle(
    "About Our AI-Driven Influencer Marketing Platform",
    "Learn how our AI-driven influencer marketing platform uses data, automation, and insights to connect brands with the right creators."
  );
}, []);

const navigate = useNavigate();

  const goToLogin = () => {
    navigate("/login");
  };


  const sections = [
    { id: 'hero', title: 'Home' },
    { id: 'services', title: 'What We Do' },
    { id: 'features', title: 'AI Features' },
    { id: 'mission', title: 'Our Mission' },
    { id: 'story', title: 'Our Story' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.pageYOffset / totalHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = sectionsRef.current.indexOf(entry.target);
            if (index !== -1) {
              setActiveSection(index);
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    sectionsRef.current.forEach((section) => {
      if (section) observerRef.current.observe(section);
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const scrollToSection = (index) => {
    sectionsRef.current[index]?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="aboutus-wrapper">
      {/* Progress Bar */}
      {/* <div className="scroll-progress-bar" style={{ width: `${scrollProgress}%` }} /> */}

      {/* Navigation Dots */}
      {/* <div className="nav-dots">
        {sections.map((section, index) => (
          <div
            key={section.id}
            className={`nav-dot ${activeSection === index ? 'active' : ''}`}
            onClick={() => scrollToSection(index)}
            title={section.title}
          />
        ))}
      </div> */}

      <AboutUsHero />

      {/* Hero Section */}
      {/* <section 
        className="aboutus-section aboutus-hero-section"
        ref={(el) => (sectionsRef.current[0] = el)}
      >
        <div className="aboutus-container">
          <div className="aboutus-hero-grid animate-fade-in">
            <div className="aboutus-hero-content animate-slide-in-left">
              <h1 className="aboutus-hero-title">
                Unlock smarter, faster, and more effective influencer marketing with AI.
              </h1>
              <p className="aboutus-hero-description">
                Quickbox.io revolutionizes influencer partnerships through intelligent automation, 
                data-driven insights, and seamless campaign management. Discover, connect, and 
                collaborate with creators who amplify your brand's impact.
              </p>
              <div className="aboutus-hero-stats">
                <div className="aboutus-stat-item animate-scale">
                  <h3 className="aboutus-stat-number">10K+</h3>
                  <p className="aboutus-stat-label">Verified Influencers</p>
                </div>
                <div className="aboutus-stat-item animate-scale">
                  <h3 className="aboutus-stat-number">92%</h3>
                  <p className="aboutus-stat-label">Efficiency Boost</p>
                </div>
                <div className="aboutus-stat-item animate-scale">
                  <h3 className="aboutus-stat-number">200M+</h3>
                  <p className="aboutus-stat-label">Analyzed Data Points</p>
                </div>
              </div>
            </div>
            <div className="aboutus-hero-image-wrapper animate-slide-in-right">
              <div className="aboutus-hero-image-container">
                <img 
                  src="/images/about4.png" 
                  alt="Quickbox.io Platform Dashboard" 
                  className="aboutus-hero-image"
                />
              </div>
            </div>
          </div>
          <div className="scroll-indicator" onClick={() => scrollToSection(1)}>
            <ChevronDown size={32} />
          </div>
        </div>
      </section> */}

      {/* What We Do Section */}
      <section 
        className="aboutus-section aboutus-services-section"
        ref={(el) => (sectionsRef.current[0] = el)}
      >
        <div className="aboutus-container">
          <div className="aboutus-services-grid">
            <div className="aboutus-services-content animate-slide-in-left">
              <h2 className="aboutus-section-title">What We Do</h2>
              <p className="aboutus-section-description">
                We empower brands with cutting-edge AI technology that transforms how you discover, 
                engage, and measure influencer partnerships. Our platform eliminates guesswork and 
                delivers measurable results through intelligent automation and comprehensive analytics.
              </p>
              <div className="aboutus-services-list">
                <div className="aboutus-service-item">
                  <CheckCircle size={20} color="#3b82f6" />
                  <span>AI-Powered Influencer Discovery & Matching</span>
                </div>
                <div className="aboutus-service-item">
                  <CheckCircle size={20} color="#3b82f6" />
                  <span>Intelligent Campaign Management & Automation</span>
                </div>
                <div className="aboutus-service-item">
                  <CheckCircle size={20} color="#3b82f6" />
                  <span>Real-Time Performance Tracking & Analytics</span>
                </div>
                <div className="aboutus-service-item">
                  <CheckCircle size={20} color="#3b82f6" />
                  <span>Advanced Fraud Detection & Authenticity Verification</span>
                </div>
                <div className="aboutus-service-item">
                  <CheckCircle size={20} color="#3b82f6" />
                  <span>End-to-End Workflow Automation & Optimization</span>
                </div>
                <div className="aboutus-service-item">
                  <CheckCircle size={20} color="#3b82f6" />
                  <span>Strategic Creator Relationship Management</span>
                </div>
              </div>
            </div>
            <div className="aboutus-services-image-wrapper animate-slide-in-right">
              <div className="aboutus-services-image-container">
                <img 
                  src="/images/about3.png" 
                  alt="Brio Solutions" 
                  className="aboutus-services-image"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section 
        className="aboutus-section aboutus-features-section"
        ref={(el) => (sectionsRef.current[1] = el)}
      >
        <div className="aboutus-container">
          <div className="aboutus-features-grid">
            <div className="aboutus-features-image-wrapper animate-slide-in-left">
              <div className="aboutus-features-image-container">
                <img 
                  src="/images/about2.png" 
                  alt="Brio AI Features" 
                  className="aboutus-features-image"
                />
              </div>
            </div>
            <div className="aboutus-features-content animate-slide-in-right">
              <h2 className="aboutus-section-title">
                Intelligent Technology for Modern Marketing
              </h2>
              <p className="aboutus-features-description">
                Leverage sophisticated AI algorithms to identify perfect brand-creator matches, 
                optimize campaign performance, and track meaningful metrics that drive business growth.
              </p>
              <div className="aboutus-features-grid-columns">
                <div className="aboutus-features-column">
                  <div className="aboutus-feature-item">
                    <CheckCircle size={18} color="#3b82f6" />
                    <span>Strategic Platform Positioning & Brand Identity</span>
                  </div>
                  <div className="aboutus-feature-item">
                    <CheckCircle size={18} color="#3b82f6" />
                    <span>Machine Learning-Powered Recommendations</span>
                  </div>
                  <div className="aboutus-feature-item">
                    <CheckCircle size={18} color="#3b82f6" />
                    <span>Enhanced User Engagement & Long-Term Retention</span>
                  </div>
                  <div className="aboutus-feature-item">
                    <CheckCircle size={18} color="#3b82f6" />
                    <span>Strategic Partnerships & Industry Collaboration</span>
                  </div>
                </div>
                <div className="aboutus-features-column">
                  <div className="aboutus-feature-item">
                    <CheckCircle size={18} color="#3b82f6" />
                    <span>Extensive Influencer & Brand Ecosystem</span>
                  </div>
                  <div className="aboutus-feature-item">
                    <CheckCircle size={18} color="#3b82f6" />
                    <span>Data-Driven Marketing & Growth Strategies</span>
                  </div>
                  <div className="aboutus-feature-item">
                    <CheckCircle size={18} color="#3b82f6" />
                    <span>Flexible Monetization & Revenue Models</span>
                  </div>
                  <div className="aboutus-feature-item">
                    <CheckCircle size={18} color="#3b82f6" />
                    <span>Comprehensive Analytics & Actionable Insights</span>
                  </div>
                </div>
              </div>
              <button className="aboutus-cta-button" onClick={goToLogin}>Get Started Today</button>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section 
        className="aboutus-section aboutus-mission-section"
        ref={(el) => (sectionsRef.current[2] = el)}
      >
        <div className="aboutus-container">
          <div className="aboutus-mission-grid">
            <div className="aboutus-mission-image-wrapper animate-slide-in-left">
              <div className="aboutus-mission-image-container">
                <img 
                  src="/images/about1.png" 
                  alt="Brio Mission" 
                  className="aboutus-mission-image"
                />
              </div>
            </div>
            <div className="aboutus-mission-content animate-slide-in-right">
              <h2 className="aboutus-section-title">Our Mission</h2>
              <p className="aboutus-section-description">
                We exist to democratize influencer marketing, making sophisticated partnership strategies 
                accessible to organizations of every size. By harnessing the power of artificial intelligence 
                and machine learning, we help marketers navigate the complex creator landscape, forge 
                authentic connections, and achieve exceptional ROI through transparent, data-driven workflows.
              </p>
              <div className="aboutus-mission-features">
                <div className="aboutus-mission-feature">
                  <CheckCircle size={20} color="#3b82f6" />
                  <span>Democratize Access to Premium Partnerships<br/><small>Enabling businesses of all sizes to leverage world-class influencer marketing strategies and tools</small></span>
                </div>
                <div className="aboutus-mission-feature">
                  <CheckCircle size={20} color="#3b82f6" />
                  <span>Champion Transparency & Trust<br/><small>Delivering crystal-clear insights into campaign performance, influencer authenticity, and engagement metrics</small></span>
                </div>
                <div className="aboutus-mission-feature">
                  <CheckCircle size={20} color="#3b82f6" />
                  <span>Maximize Operational Efficiency<br/><small>Automating repetitive workflows so teams can focus on strategic thinking and creative innovation</small></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      {/* <section 
        className="aboutus-section aboutus-story-section"
        ref={(el) => (sectionsRef.current[4] = el)}
      >
        <div className="aboutus-container">
          <div className="aboutus-story-grid">
            <div className="aboutus-story-content animate-slide-in-left">
              <h2 className="aboutus-section-title">Our Story</h2>
              <p className="aboutus-section-description">
                Born from the frustration of manual influencer outreach and opaque campaign metrics, 
                Quickbox.io emerged as the solution modern marketers deserve. We've built a comprehensive 
                platform that streamlines every phase of influencer marketing—from initial discovery through 
                final reporting—using advanced machine learning algorithms. Our intelligent automation 
                eliminates tedious manual tasks, while real-time insights empower you to make confident, 
                data-backed decisions that consistently deliver superior performance.
              </p>
              <div className="aboutus-story-values">
                <div className="aboutus-story-value-item">Innovation Excellence</div>
                <div className="aboutus-story-value-item">Radical Transparency</div>
                <div className="aboutus-story-value-item">Operational Excellence</div>
                <div className="aboutus-story-value-item">Strategic Collaboration</div>
                <div className="aboutus-story-value-item">Measurable Impact</div>
              </div>
            </div>
            <div className="aboutus-story-image-wrapper animate-slide-in-right">
              <div className="aboutus-story-image-container">
                <img 
                  src="/images/gang.png" 
                  alt="Quickbox.io Team" 
                  className="aboutus-story-image"
                />
              </div>
            </div>
          </div>
        </div>
      </section> */}

      < TestimonialsSection />

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .aboutus-wrapper {
          width: 100%;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          overflow-x: hidden;
          background: #ffffff;
        }

        /* Progress Bar */
        .scroll-progress-bar {
          position: fixed;
          top: 0;
          left: 0;
          height: 4px;
          background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
          z-index: 1000;
          transition: width 0.1s ease;
        }

        /* Navigation Dots */
        .nav-dots {
          position: fixed;
          right: 30px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          flex-direction: column;
          gap: 16px;
          z-index: 999;
        }

        .nav-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #cbd5e1;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .nav-dot:hover {
          background: #94a3b8;
          transform: scale(1.2);
        }

        .nav-dot.active {
          background: #3b82f6;
          transform: scale(1.3);
        }

        /* Scroll Indicator */
        .scroll-indicator {
          position: absolute;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          color: #3b82f6;
          cursor: pointer;
          animation: bounce 2s infinite;
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateX(-50%) translateY(0);
          }
          40% {
            transform: translateX(-50%) translateY(-10px);
          }
          60% {
            transform: translateX(-50%) translateY(-5px);
          }
        }

        /* Animations */
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fadeIn 1s ease-out;
        }

        .animate-slide-in-left {
          animation: slideInLeft 0.8s ease-out;
        }

        .animate-slide-in-right {
          animation: slideInRight 0.8s ease-out;
        }

        .animate-scale {
          animation: scaleIn 0.6s ease-out;
        }

        .animate-scale:nth-child(2) {
          animation-delay: 0.1s;
        }

        .animate-scale:nth-child(3) {
          animation-delay: 0.2s;
        }

        .aboutus-container {
          max-width: 90%;
          margin: 0 auto;
          padding: 0 20px;
        }

        .aboutus-section {
          min-height: 80vh;
          display: flex;
          align-items: center;
          // padding: 80px 0;
          scroll-snap-align: start;
        }

        /* Hero Section */
        .aboutus-hero-section {
          position: relative;
          background: #ffffff;
        }

        .aboutus-hero-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }

        .aboutus-hero-content {
          padding-right: 20px;
        }

        .aboutus-hero-title {
          font-size: 34px;
          font-weight: 700;
          color: #0f6eeaff;
          margin-bottom: 20px;
          line-height: 1.2;
        }

        .aboutus-hero-description {
          font-size: 16px;
          color: #1e293b;
          line-height: 1.7;
          margin-bottom: 40px;
          max-width: 500px;
        }

        .aboutus-hero-stats {
          display: flex;
          gap: 40px;
        }

        .aboutus-stat-item {
          text-align: center;
        }

        .aboutus-stat-number {
          font-size: 32px;
          font-weight: 700;
          color: #0f6eeaff;
          margin-bottom: 4px;
        }

        .aboutus-stat-label {
          font-size: 14px;
          color: #64748b;
        }

        .aboutus-hero-image-wrapper {
          position: relative;
        }

        // .aboutus-hero-image-container {
        //   position: relative;
        //   border-radius: 20px;
        //   overflow: hidden;
        // }

        // .aboutus-hero-image {
        //   width: 100%;
        //   display: block;
        //   object-fit: contain;
        // }

        /* Services Section */
        .aboutus-services-section {
          background: #ffffff;
        }

        .aboutus-services-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }

        .aboutus-services-content {
          padding-right: 20px;
        }

        .aboutus-section-title {
          font-size: 36px;
          font-weight: 700;
          color: #0f6eeaff;
          margin-bottom: 20px;
        }

        .aboutus-section-description {
          font-size: 16px;
          color: #64748b;
          line-height: 1.7;
          margin-bottom: 30px;
        }

        .aboutus-services-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .aboutus-service-item {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 15px;
          color: #1e293b;
          font-weight: 500;
        }

        .aboutus-services-image-wrapper {
          position: relative;
        }

        // .aboutus-services-image-container {
        //   position: relative;
        //   border-radius: 20px;
        //   overflow: hidden;
        // }

        // .aboutus-services-image {
        //   width: 100%;
        //   object-fit: contain;
        //   display: block;
        // }

        /* Features Section */
        .aboutus-features-section {
          background: #ffffff;
        }

        .aboutus-features-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }

        .aboutus-features-image-wrapper {
          position: relative;
        }

        // .aboutus-features-image-container {
        //   position: relative;
        //   border-radius: 20px;
        //   overflow: hidden;
        // }

        // .aboutus-features-image {
        //   width: 100%;
        //   height: 450px;
        //   object-fit: contain;
        //   display: block;
        // }

        .aboutus-features-content {
          padding-left: 20px;
        }

        .aboutus-features-description {
          font-size: 16px;
          color: #64748b;
          line-height: 1.7;
          margin-bottom: 30px;
        }

        .aboutus-features-grid-columns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
        }

        .aboutus-features-column {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .aboutus-feature-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          color: #1e293b;
          font-weight: 500;
        }

        .aboutus-cta-button {
          padding: 14px 32px;
          font-size: 16px;
          font-weight: 600;
          color: white;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 14px rgba(59, 130, 246, 0.3);
        }

        .aboutus-cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
        }

        /* Mission Section */
        .aboutus-mission-section {
          background: #ffffff;
        }

        .aboutus-mission-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }

        .aboutus-mission-image-wrapper {
          position: relative;
        }

        // .aboutus-mission-image-container {
        //   position: relative;
        //   border-radius: 20px;
        //   overflow: hidden;
        // }

        // .aboutus-mission-image {
        //   width: 100%;
        //   height: 450px;
        //   object-fit: contain;
        //   display: block;
        // }

        .aboutus-mission-content {
          padding-left: 20px;
        }

        .aboutus-mission-features {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .aboutus-mission-feature {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .aboutus-mission-feature span {
          font-size: 15px;
          color: #1e293b;
          line-height: 1.5;
          font-weight: 500;
        }

        .aboutus-mission-feature small {
          display: block;
          font-size: 13px;
          color: #64748b;
          font-weight: 400;
          margin-top: 4px;
        }

        /* Story Section */
        .aboutus-story-section {
          background: #ffffff;
        }

        .aboutus-story-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }

        .aboutus-story-content {
          padding-right: 20px;
        }

        .aboutus-story-values {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 30px;
        }

        .aboutus-story-value-item {
          padding: 10px 20px;
          background: #f1f5f9;
          border-radius: 8px;
          font-size: 14px;
          color: #1e293b;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .aboutus-story-value-item:hover {
          background: #e2e8f0;
          transform: translateY(-2px);
        }

        .aboutus-story-image-wrapper {
          position: relative;
        }

        // .aboutus-story-image-container {
        //   border-radius: 20px;
        //   overflow: hidden;
        //   background: #f8fafc;
        // }

        // .aboutus-story-image {
        //   width: 100%;
        //   height: 450px;
        //   object-fit: cover;
        //   display: block;
        // }



        /* EXTRA LARGE IMAGES */
.aboutus-hero-image,
.aboutus-services-image,
.aboutus-features-image,
.aboutus-mission-image,
.aboutus-story-image {
  width: 100%;
  height: 600px; /* Increased height */
  object-fit: cover; /* Fill the container fully */
  display: block;
  border-radius: 20px;
}

/* Make the parent container bigger */
.aboutus-hero-image-container,
.aboutus-services-image-container,
.aboutus-features-image-container,
.aboutus-mission-image-container,
.aboutus-story-image-container {
  width: 100%;
  max-width: 100%; /* full width */
  height: auto;
  border-radius: 20px;
  overflow: hidden;
}

        /* Responsive Design */
        @media (max-width: 1024px) {
          .nav-dots {
            display: none;
          }

          .aboutus-hero-grid,
          .aboutus-mission-grid,
          .aboutus-services-grid,
          .aboutus-features-grid,
          .aboutus-story-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .aboutus-mission-grid {
            direction: ltr;
          }

          .aboutus-mission-image-wrapper {
            order: -1;
          }

          .aboutus-hero-title {
            font-size: 36px;
          }

          .aboutus-section-title {
            font-size: 32px;
          }

          .aboutus-hero-content,
          .aboutus-mission-content,
          .aboutus-services-content,
          .aboutus-features-content,
          .aboutus-story-content {
            padding-right: 0;
            padding-left: 0;
          }

          .aboutus-features-grid-columns {
            grid-template-columns: 1fr;
          }

          .aboutus-section {
            min-height: auto;
          }
        }

        @media (max-width: 640px) {
          .aboutus-hero-section,
          .aboutus-mission-section,
          .aboutus-services-section,
          .aboutus-features-section,
          .aboutus-story-section {
            padding: 50px 0;
          }

          .aboutus-hero-title {
            font-size: 24px;
          }

          .aboutus-section-title {
            font-size: 26px;
          }

          .aboutus-hero-stats {
            flex-direction: column;
            gap: 24px;
          }

          .aboutus-hero-image,
          .aboutus-mission-image,
          .aboutus-services-image,
          .aboutus-features-image,
          .aboutus-story-image {
            height: 300px;
          }

          .scroll-indicator {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

export default AboutUs;