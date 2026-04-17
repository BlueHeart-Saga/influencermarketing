// import React, { useState } from 'react';
// import { 
//   FaFacebookF, 
//   FaTwitter, 
//   FaLinkedinIn, 
//   FaInstagram, 
//   FaEnvelope, 
//   FaPhone, 
//   FaMapMarkerAlt,
//   FaArrowRight,
//   FaCheck,
//   FaGlobe
// } from 'react-icons/fa';
// import "../style/Footer.css";

// export default function Footer() {
//   const [email, setEmail] = useState('');
//   const [subscribed, setSubscribed] = useState(false);
//   const [language, setLanguage] = useState('English');

//   const handleSubscribe = (e) => {
//     e.preventDefault();
//     if (email) {
//       setSubscribed(true);
//       setTimeout(() => {
//         setSubscribed(false);
//         setEmail('');
//       }, 3000);
//     }
//   };

//   const trustedBrands = [
//     'Netflix', 'Spotify', 'Adobe', 'Microsoft', 'Shopify', 'Stripe'
//   ];

//   return (
//     <footer className="enterprise-footer-wrapper">
//       {/* Curved Wave Top */}
//       <div className="footer-wave-divider">
//   <svg
//     viewBox="0 0 1440 150"
//     xmlns="http://www.w3.org/2000/svg"
//     preserveAspectRatio="none"
//   >
//     <defs>
//       <linearGradient id="footerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
//         <stop offset="0%" stopColor="#63c9f1ff" />
//         <stop offset="100%" stopColor="#0f6eeaff" />
//       </linearGradient>

//     </defs>
//     <path
//       d="M0,60 C360,160 1080,-40 1440,60 L1440,0 L0,0 Z"
//       fill="url(#footerGradient)"
//     />
//   </svg>
// </div>



//       {/* CTA Banner Section */}
//       <div className="footer-hero-banner">
//         <div className="footer-content-container">
//           <div className="banner-content-wrapper">
//             <div className="banner-text-section">
//               <h2>Ready to transform your influencer marketing?</h2>
//               <p>Join 10,000+ brands already growing with Quickbox.io</p>
//             </div>
//             <div className="banner-action-buttons">
//               <button className="primary-action-btn">Get Started Free</button>
//               <button className="secondary-action-btn">Schedule Demo</button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Trusted Brands Section */}
//       {/* <div className="partners-showcase-section">
//         <div className="footer-content-container">
//           <p className="partners-heading">Trusted by leading brands worldwide</p>
//           <div className="partners-logo-grid">
//             {trustedBrands.map((brand, index) => (
//               <div key={index} className="partner-brand-item">
//                 <span>{brand}</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div> */}

//       {/* Main Footer Content */}
//       <div className="footer-main-content">
//         <div className="footer-content-container">
//           <div className="footer-columns-grid">

//             {/* Brand Column */}
//             <div className="brand-info-column">
//               <div className="company-logo-section">
//                 <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
//                   <rect width="40" height="40" rx="10" fill="url(#brandGradient)"/>
//                   <path d="M15 12L26 20L15 28V12Z" fill="white"/>
//                   <defs>
//                     <linearGradient id="brandGradient" x1="0" y1="0" x2="40" y2="40">
//                       <stop offset="0%" stopColor="rgb(161, 180, 242)"/>
//                       <stop offset="100%" stopColor="rgb(194, 217, 251)"/>
//                     </linearGradient>
//                   </defs>
//                 </svg>
//                 <span>QuickBox.io</span>
//               </div>
//               <p className="company-description">
//                 Enterprise-grade AI-powered influencer marketing platform connecting global brands with premium creators. Scale your campaigns with data-driven insights.
//               </p>

//               {/* Social Links */}
//               <div className="social-media-links">
//                 <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
//                   <FaFacebookF />
//                 </a>
//                 <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
//                   <FaTwitter />
//                 </a>
//                 <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
//                   <FaLinkedinIn />
//                 </a>
//                 <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
//                   <FaInstagram />
//                 </a>
//               </div>

//               {/* Newsletter */}
//               <div className="newsletter-subscription">
//                 <h4>Stay in the loop</h4>
//                 <p className="newsletter-subtitle">Get industry insights, product updates, and exclusive offers.</p>
//                 <form onSubmit={handleSubscribe} className="email-subscription-form">
//                   <div className="email-input-container">
//                     <FaEnvelope className="email-icon" />
//                     <input 
//                       type="email" 
//                       placeholder="Enter your email" 
//                       value={email}
//                       onChange={(e) => setEmail(e.target.value)}
//                       required
//                     />
//                     <button type="submit" className={subscribed ? 'btn-subscribed' : ''}>
//                       {subscribed ? <FaCheck /> : <FaArrowRight />}
//                     </button>
//                   </div>
//                   <p className="subscription-privacy-text">
//                     By subscribing, you agree to our Privacy Policy and consent to receive updates.
//                   </p>
//                 </form>
//               </div>
//             </div>

//             {/* Platform Links */}
//             <div className="footer-links-column">
//               <h4>Platform</h4>
//               <ul>
//                 <li><a href="/futureai">Features Overview</a></li>
//                 <li><a href="/pricingsection">Pricing Plans</a></li>
//                 <li><a href="/integration">Integrations</a></li>
//                 <li><a href="/analytics">Analytics Dashboard</a></li>
//                 <li><a href="/automation">AI Automation</a></li>
//                 <li><a href="/futureai">API Documentation</a></li>
//                 <li><a href="/futureai">Security & Compliance</a></li>
//               </ul>
//             </div>

//             {/* Solutions Links */}
//             <div className="footer-links-column">
//               <h4>Solutions</h4>
//               <ul>
//                 <li><a href="/payment-automation">Enterprise</a></li>
//                 <li><a href="/budget-planner">Marketing Agencies</a></li>
//                 <li><a href="/payment-automation">E-commerce Brands</a></li>
//                 <li><a href="/engagement-calculator">Startups & SMBs</a></li>
//                 <li><a href="/payment-automation">For Influencers</a></li>
//                 <li><a href="/resources/case-studies">Case Studies</a></li>
//                 <li><a href="/trend-predictor">ROI Calculator</a></li>
//               </ul>
//             </div>

//             {/* Resources Links */}
//             <div className="footer-links-column">
//               <h4>Resources</h4>
//               <ul>
//                 <li><a href="/resources/blog">Blog & Insights</a></li>
//                 <li><a href="/resources/blog">Webinars</a></li>
//                 <li><a href="/resources/blog">Strategy Guides</a></li>
//                 <li><a href="/resources/documentation">Free Templates</a></li>
//                 <li><a href="/resources/documentation">Quickbox Academy</a></li>
//                 <li><a href="/resources/community">Community Forum</a></li>
//                 <li><a href="/resources/support">Events & Workshops</a></li>
//               </ul>
//             </div>

//             {/* Company Links */}
//             <div className="footer-links-column">
//               <h4>Company</h4>
//               <ul>
//                 <li><a href="/about">About Us</a></li>
//                 {/* <li><a href="/careers">Careers <span className="hiring-badge">We're hiring!</span></a></li> */}
//                 <li><a href="/resources/help-center">Press & Media</a></li>
//                 <li><a href="/resources/community">Partner Program</a></li>
//                 <li><a href="/resources/support">Affiliate Program</a></li>
//                 <li><a href="/resources/support">Sustainability</a></li>
//                 <li><a href="/contactUs">Contact Us</a></li>
//               </ul>
//             </div>

//             {/* Support & Contact */}
//             <div className="footer-links-column footer-contact-column">
//               <h4>Support</h4>
//               <ul>
//                 <li><a href="/resources/help-center">Help Center</a></li>
//                 <li><a href="/resources/case-studies">System Status</a></li>
//                 <li><a href="/resources/support">Submit Ticket</a></li>
//                 <li><a href="/resources/support">Live Chat</a></li>
//               </ul>

//               {/* <div className="contact-details-section">
//                 <div className="contact-info-item">
//                   <FaEnvelope />
//                   <div>
//                     <span className="info-label">Email</span>
//                     <a href="mailto:support@quickbox.io">support@quickbox.io</a>
//                   </div>
//                 </div>
//                 <div className="contact-info-item">
//                   <FaPhone />
//                   <div>
//                     <span className="info-label">Phone</span>
//                     <a href="tel:+15551234567">+1 (555) 123-4567</a>
//                   </div>
//                 </div>
//                 <div className="contact-info-item">
//                   <FaMapMarkerAlt />
//                   <div>
//                     <span className="info-label">Headquarters</span>
//                     <span>San Francisco, CA 94103</span>
//                   </div>
//                 </div>
//               </div> */}
//             </div>
//           </div>
//         </div>



//         {/* App Download Section */}
//         <div className="mobile-app-section">
//           <div className="footer-content-container">
//             <h5>Get the mobile app</h5>
//             <div className="app-store-badges">
//               <a href="/" className="store-badge-link">
//                 <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
//                   <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
//                 </svg>
//                 <div>
//                   <span className="store-badge-small">Download on the</span>
//                   <span className="store-badge-large">App Store</span>
//                 </div>
//               </a>
//               <a href="/" className="store-badge-link">
//                 <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
//                   <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
//                 </svg>
//                 <div>
//                   <span className="store-badge-small">Get it on</span>
//                   <span className="store-badge-large">Google Play</span>
//                 </div>
//               </a>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Footer Bottom */}
//       <div className="footer-bottom-bar">
//         <div className="footer-content-container">
//           <div className="bottom-bar-content">
//             <div className="copyright-text">
//               <p>© {new Date().getFullYear()} QuickBox.io, Inc. All rights reserved.</p>
//             </div>

//             <div className="legal-nav-links">
//               <a href="/privacy">Privacy Policy</a>
//               <a href="/terms">Terms of Service</a>
//               <a href="/cookies">Cookie Policy</a>
//               <a href="/gdpr">GDPR Compliance</a>
//               <a href="/accessibility">Accessibility</a>
//               <a href="/sitemap">Sitemap</a>
//             </div>

//             <div className="footer-meta-section">
//               <div className="achievement-badges">
//                 <span className="achievement-tag">🏆 G2 Leader 2024</span>
//                 <span className="achievement-tag">⭐ Forbes AI 50</span>
//               </div>
//               <div className="language-switcher">
//                 <FaGlobe />
//                 <select value={language} onChange={(e) => setLanguage(e.target.value)}>
//                   <option>English</option>
//                   <option>Español</option>
//                   <option>Français</option>
//                   <option>Deutsch</option>
//                   <option>日本語</option>
//                 </select>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </footer>
//   );
// }

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from "react-router-dom";
import { Facebook, Twitter, Linkedin, Instagram, ArrowRight, Globe } from 'lucide-react';

function Footer() {
  const [email, setEmail] = useState('');
  const [brandName, setBrandName] = useState('Brio');
  const [logoUrl, setLogoUrl] = useState('');
  const [loading, setLoading] = useState({ name: true, logo: true });
  const navigate = useNavigate();

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

  // Fetch brand name dynamically
  const fetchBrandName = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, name: true }));
      const res = await fetch(`${API_BASE_URL}/api/platform/name`);
      if (res.ok) {
        const data = await res.json();
        setBrandName(data.platform_name || 'Brio');
      }
    } catch (err) {
      console.error('Failed to fetch brand name:', err);
    } finally {
      setLoading(prev => ({ ...prev, name: false }));
    }
  }, [API_BASE_URL]);

  // Fetch logo dynamically
  const fetchLogo = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, logo: true }));
      const res = await fetch(`${API_BASE_URL}/api/logo/current`);
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setLogoUrl(url);
      }
    } catch (err) {
      console.error('Failed to fetch logo:', err);
    } finally {
      setLoading(prev => ({ ...prev, logo: false }));
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchBrandName();
    fetchLogo();
  }, [fetchBrandName, fetchLogo]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email) return;

    // Store email temporarily
    sessionStorage.setItem("contact_prefill_email", email);

    // Clear input
    setEmail("");

    // Redirect to Contact page
    navigate("/contactUs");
  };

  // Navigation handler for internal links
  const handleNavigation = (path, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    navigate(path);
  };

  // Social media links (replace with actual URLs)
  const socialLinks = {
    facebook: "https://www.facebook.com/profile.php?id=61579126233218",
    website: "https://devopstrio.co.uk/",
    linkedin: "https://www.linkedin.com/company/devopstrioglobal/posts/?feedView=all",
    instagram: "https://www.instagram.com/devopstrio_offcl/"
  };

  // Handle external social links
  const handleSocialLink = (url, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <footer className="qb-footer-wrapper">
      <div className="qb-footer-main">
        <div className="qb-footer-container">
          <div className="qb-footer-grid">
            {/* Platform Column */}
            <div className="qb-footer-column">
              <h3 className="qb-footer-heading">PLATFORM</h3>
              <ul className="qb-footer-links">
                <li>
                  <span
                    className="qb-footer-link"
                    onClick={(e) => handleNavigation('/platform-overview', e)}
                  >
                    Features Overview
                  </span>
                </li>
                <li>
                  <span
                    className="qb-footer-link"
                    onClick={(e) => handleNavigation('/pricingsection', e)}
                  >
                    Pricing Plans
                  </span>
                </li>
                <li>
                  <span
                    className="qb-footer-link"
                    onClick={(e) => handleNavigation('/trend-predictor', e)}
                  >
                    Strategy Guides
                  </span>
                </li>
                {/* <li>
                  <span 
                    className="qb-footer-link"
                    onClick={(e) => handleNavigation('/ai-insights', e)}
                  >
                    Analytics Dashboard
                  </span>
                </li> */}
                <li>
                  <span
                    className="qb-footer-link"
                    onClick={(e) => handleNavigation('/faq', e)}
                  >
                    FAQ
                  </span>
                </li>

              </ul>
            </div>

            {/* Solutions Column */}
            <div className="qb-footer-column">
              <h3 className="qb-footer-heading">SOLUTIONS</h3>
              <ul className="qb-footer-links">

                {/* <li>
                  <span 
                    className="qb-footer-link"
                    onClick={(e) => handleNavigation('/ai-insights', e)}
                  >
                    Marketing Agencies
                  </span>
                </li> */}
                <li>
                  <span
                    className="qb-footer-link"
                    onClick={(e) => handleNavigation('/automation-marketing', e)}
                  >
                    AI Automation
                  </span>
                </li>
                <li>
                  <span
                    className="qb-footer-link"
                    onClick={(e) => handleNavigation('/futureai', e)}
                  >
                    Startups & SMBs
                  </span>
                </li>
                {/* <li>
                  <span 
                    className="qb-footer-link"
                    onClick={(e) => handleNavigation('/resources/help-center', e)}
                  >
                    For Influencers
                  </span>
                </li> */}
                <li>
                  <span
                    className="qb-footer-link"
                    onClick={(e) => handleNavigation('/predictive-roi', e)}
                  >
                    ROI Calculator
                  </span>
                </li>
                <li>
                  <span
                    className="qb-footer-link"
                    onClick={(e) => handleNavigation('/payment-automation', e)}
                  >
                    Enterprise
                  </span>
                </li>
              </ul>
            </div>

            {/* Resources Column */}
            <div className="qb-footer-column">
              <h3 className="qb-footer-heading">RESOURCES</h3>
              <ul className="qb-footer-links">
                <li>
                  <span
                    className="qb-footer-link"
                    onClick={(e) => handleNavigation('/resources/blog', e)}
                  >
                    Blog & Insights
                  </span>
                </li>
                <li>
                  <span
                    className="qb-footer-link"
                    onClick={(e) => handleNavigation('/resources/case-studies', e)}
                  >
                    Case Studies
                  </span>
                </li>
                <li>
                  <span
                    className="qb-footer-link"
                    onClick={(e) => handleNavigation('/resources/documentation', e)}
                  >
                    API Documentation
                  </span>
                </li>

                <li>
                  <span
                    className="qb-footer-link"
                    onClick={(e) => handleNavigation('/resources/community', e)}
                  >
                    Community
                  </span>
                </li>
              </ul>
            </div>

            {/* Company Column */}
            {/* <div className="qb-footer-column">
              <h3 className="qb-footer-heading">COMPANY</h3>
              <ul className="qb-footer-links">
                <li>
                  <span 
                    className="qb-footer-link"
                    onClick={() => navigate("/about")}
                  >
                    About Us
                  </span>
                </li>
                <li>
                  <span 
                    className="qb-footer-link"
                    onClick={(e) => handleNavigation('/resources/case-studies', e)}
                  >
                    Press & Media
                  </span>
                </li>
                <li>
                  <span 
                    className="qb-footer-link"
                    onClick={(e) => handleNavigation('/resources/case-studies', e)}
                  >
                    Partner Program
                  </span>
                </li>
                <li>
                  <span 
                    className="qb-footer-link"
                    onClick={(e) => handleNavigation('/resources/case-studies', e)}
                  >
                    Affiliate Program
                  </span>
                </li>
                <li>
                  <span 
                    className="qb-footer-link"
                    onClick={(e) => handleNavigation('/resources/case-studies', e)}
                  >
                    Sustainability
                  </span>
                </li>
              </ul>
            </div> */}

            {/* Support Column */}
            <div className="qb-footer-column">
              <h3 className="qb-footer-heading">SUPPORT</h3>
              <ul className="qb-footer-links">
                <li>
                  <span
                    className="qb-footer-link"
                    onClick={() => navigate("/about")}
                  >
                    About Us
                  </span>
                </li>
                <li>
                  <span
                    className="qb-footer-link"
                    onClick={(e) => handleNavigation('/contactUs', e)}
                  >
                    Contact US
                  </span>
                </li>
                <li>
                  <span
                    className="qb-footer-link"
                    onClick={(e) => handleNavigation('/resources/help-center', e)}
                  >
                    Help Center
                  </span>
                </li>
                <li>
                  <span
                    className="qb-footer-link"
                    onClick={(e) => handleNavigation('/integration', e)}
                  >
                    Integrations
                  </span>
                </li>
                {/* <li>
                  <span 
                    className="qb-footer-link"
                    onClick={(e) => handleNavigation('/resources/support', e)}
                  >
                    System Status
                  </span>
                </li> */}
                {/* <li>
                  <span 
                    className="qb-footer-link"
                    onClick={(e) => handleNavigation('/resources/help-center', e)}
                  >
                    Live Chat
                  </span>
                </li> */}
              </ul>
            </div>

            {/* Newsletter Column */}
            <div className="qb-footer-column qb-footer-newsletter">
              {/* Dynamic Brand Name with Logo */}
              <div className="qb-footer-brand-section">
                {logoUrl && (
                  <img
                    src={logoUrl}
                    alt={`${brandName} Logo`}
                    className="qb-footer-logo"
                    onError={(e) => {
                      console.error("Footer logo failed to load");
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                <h3 className="qb-footer-brand">
                  {loading.name ? (
                    <span className="qb-footer-skeleton">Loading...</span>
                  ) : (
                    brandName
                  )}
                </h3>
              </div>

              <p className="qb-footer-description">
                AI-powered influencer marketing for global brands.
                Connect with top creators and scale with data-driven insights.
              </p>

              <div className="qb-footer-form">
                <div className="qb-footer-input-wrapper">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="qb-footer-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <button
                    onClick={handleSubmit}
                    className="qb-footer-submit-btn"
                    aria-label="Submit email"
                  >
                    <ArrowRight size={20} />
                  </button>
                </div>
              </div>

              <div className="qb-footer-newsletter-text">
                {/* <h4 className="qb-footer-newsletter-title">Stay in the loop</h4> */}
                <p className="qb-footer-newsletter-desc">
                  Get industry insights, product updates, and exclusive offers.
                </p>
                <p className="qb-footer-privacy-text">
                  By subscribing, you agree to our Privacy Policy and consent to receive updates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="qb-footer-bottom">
        <div className="qb-footer-container qb-footer-bottom-content">
          <p className="qb-footer-copyright">
            © 2026 {loading.name ? 'Loading...' : brandName}, Inc. All rights reserved.
          </p>

          <div className="qb-footer-legal-links">
            <div className="qb-footer-social">
              <button
                onClick={(e) => handleSocialLink(socialLinks.facebook, e)}
                className="qb-footer-social-link"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </button>



              <button
                onClick={(e) => handleSocialLink(socialLinks.linkedin, e)}
                className="qb-footer-social-link"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </button>

              <button
                onClick={(e) => handleSocialLink(socialLinks.instagram, e)}
                className="qb-footer-social-link"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </button>

              <button
                onClick={(e) => handleSocialLink(socialLinks.website, e)}
                className="qb-footer-social-link"
                aria-label="Website"
              >
                <Globe size={20} />
              </button>
            </div>


            <Link
              to="/terms"
              className="qb-footer-legal-link"
            >
              Terms of Service
            </Link>
            <span className="qb-footer-separator">|</span>
            <Link
              to="/privacy"
              className="qb-footer-legal-link"
            >
              Privacy Policy
            </Link>
            <span className="qb-footer-separator">|</span>
            <Link
              to="/payment-policy"
              className="qb-footer-legal-link"
            >
              Payment Policy
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .qb-footer-wrapper {
          width: 100%;
          background: #43494d;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }

        .qb-footer-main {
          padding: 60px 0 40px;
        }

        .qb-footer-container {
          max-width: 95%;
          margin: 0 auto;
          padding: 0 40px;
        }

        .qb-footer-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 40px;
        }

        .qb-footer-column {
          display: flex;
          flex-direction: column;
        }

        .qb-footer-newsletter {
          grid-column: span 2;
        }

        /* Brand section with logo */
        .qb-footer-brand-section {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .qb-footer-logo {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          object-fit: contain;
        }

        .qb-footer-heading {
          font-size: 20px;
          font-weight: 700;
          color: #ffffffe6;
          letter-spacing: 1px;
          margin-bottom: 20px;
          opacity: 0.95;
        }

        .qb-footer-brand {
          font-size: 20px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 0;
        }

        .qb-footer-description {
          font-size: 14px;
          color: #ffffff;
          line-height: 1.6;
          margin-bottom: 24px;
          opacity: 0.9;
        }

        .qb-footer-links {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .qb-footer-links li {
          cursor: pointer;
        }

        .qb-footer-link {
          font-size: 14px;
          color: #ffffff;
          text-decoration: none;
          transition: all 0.2s ease;
          opacity: 0.85;
          display: inline-block;
          cursor: pointer;
          border: none;
          background: none;
          font-family: inherit;
          padding: 0;
        }

        .qb-footer-link:hover {
          opacity: 1;
          transform: translateX(4px);
        }

        /* Loading skeleton */
        .qb-footer-skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 4px;
          display: inline-block;
          width: 120px;
          height: 24px;
        }

        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* Newsletter Form */
        .qb-footer-form {
          margin-bottom: 24px;
        }

        .qb-footer-input-wrapper {
          display: flex;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .qb-footer-input {
          flex: 1;
          padding: 14px 16px;
          border: none;
          outline: none;
          font-size: 14px;
          color: #1e293b;
          background: transparent;
        }

        .qb-footer-input::placeholder {
          color: #94a3b8;
        }

        .qb-footer-submit-btn {
          padding: 14px 16px;
          background: #4c6ef5;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          color: #ffffff;
        }

        .qb-footer-submit-btn:hover {
          background: #3b5bdb;
        }

        .qb-footer-newsletter-title {
          font-size: 16px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 8px;
        }

        .qb-footer-newsletter-desc {
          font-size: 14px;
          color: #ffffff;
          line-height: 1.6;
          margin-bottom: 12px;
          opacity: 0.9;
        }

        .qb-footer-privacy-text {
          font-size: 11px;
          color: #ffffff;
          line-height: 1.5;
          opacity: 0.75;
        }

        /* Social Icons */
        .qb-footer-social {
          display: flex;
          gap: 12px;
        }

        .qb-footer-social-link {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          text-decoration: none;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          border: none;
          cursor: pointer;
          padding: 0;
        }

        .qb-footer-social-link:hover {
          background: rgba(255, 255, 255, 0);
          transform: translateY(-2px);
        }

        /* Footer Bottom */
        .qb-footer-bottom {
          background: rgba(0, 0, 0, 0.15);
          padding: 20px 0;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .qb-footer-copyright {
          text-align: center;
          font-size: 14px;
          color: #ffffff;
          opacity: 0.85;
        }

        .qb-footer-bottom-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }

        .qb-footer-legal-links {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .qb-footer-legal-link {
          font-size: 13px;
          color: #ffffff;
          text-decoration: none;
          opacity: 0.85;
          transition: opacity 0.2s ease;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
          font-family: inherit;
        }

        .qb-footer-legal-link:hover {
          opacity: 1;
        }

        .qb-footer-separator {
          color: rgba(255, 255, 255, 0.4);
        }

        /* Mobile */
        @media (max-width: 600px) {
          .qb-footer-bottom-content {
            flex-direction: column;
            text-align: center;
          }

          .qb-footer-legal-links {
            flex-wrap: wrap;
            justify-content: center;
          }

          .qb-footer-brand-section {
            justify-content: center;
            flex-direction: column;
            text-align: center;
          }

          .qb-footer-logo {
            margin-bottom: 8px;
          }
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .qb-footer-grid {
            grid-template-columns: repeat(3, 1fr);
          }

          .qb-footer-newsletter {
            grid-column: span 3;
            margin-top: 20px;
          }
        }

        @media (max-width: 768px) {
          .qb-footer-container {
            padding: 0 20px;
          }

          .qb-footer-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 30px;
          }

          .qb-footer-newsletter {
            grid-column: span 2;
          }

          .qb-footer-main {
            padding: 40px 0 30px;
          }
        }

        @media (max-width: 480px) {
          .qb-footer-grid {
            grid-template-columns: 1fr;
            gap: 30px;
          }

          .qb-footer-newsletter {
            grid-column: span 1;
          }

          .qb-footer-heading {
            font-size: 11px;
          }

          .qb-footer-link {
            font-size: 13px;
          }

          .qb-footer-brand {
            font-size: 18px;
          }

          .qb-footer-description {
            font-size: 13px;
          }
        }
      `}</style>
    </footer>
  );
}

export default Footer;