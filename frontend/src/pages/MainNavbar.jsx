import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import "../style/MainNavbar.css";
import {
  Home,
  Info,
  Mail,
  LogIn,
  User,
  Menu
} from "lucide-react";
import { 
  FaCrown,
} from 'react-icons/fa';


const ModernNavbar = () => {
  const [logoUrl, setLogoUrl] = useState("");
  const [brandName, setBrandName] = useState("Brio"); // Default fallback
  const [mobileMenuActive, setMobileMenuActive] = useState(false);
  const [loading, setLoading] = useState({ logo: true, name: true });
const [scrolled, setScrolled] = useState(false);



  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

  // Fetch logo dynamically
  const fetchLogo = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, logo: true }));
      const res = await fetch(`${API_BASE_URL}/api/logo/current`);
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setLogoUrl(url);
      } else {
        setLogoUrl("");
      }
    } catch (err) {
      console.error("Failed to fetch logo:", err);
      setLogoUrl("");
    } finally {
      setLoading(prev => ({ ...prev, logo: false }));
    }
  }, [API_BASE_URL]);

  // Fetch brand name dynamically
  const fetchBrandName = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, name: true }));
      const res = await fetch(`${API_BASE_URL}/api/platform/name`);
      if (res.ok) {
        const data = await res.json();
        setBrandName(data.platform_name || "Brio");
      } else {
        setBrandName("Brio");
      }
    } catch (err) {
      console.error("Failed to fetch brand name:", err);
      setBrandName("Brio");
    } finally {
      setLoading(prev => ({ ...prev, name: false }));
    }
  }, [API_BASE_URL]);

  // Poll for brand name updates every 30 seconds
  // const pollBrandName = useCallback(() => {
  //   const interval = setInterval(() => {
  //     fetchBrandName();
  //   }, 30000); // 30 seconds

  //   return () => clearInterval(interval);
  // }, [fetchBrandName]);

  useEffect(() => {
    fetchLogo();
    fetchBrandName();
    // const cleanup = pollBrandName();
    return;
  }, [fetchLogo, fetchBrandName]);

 useEffect(() => {
  const handleScroll = () => {
    const hero = document.querySelector(".hero-section");
    const heroHeight = hero ? hero.offsetHeight : 0;

    setScrolled(window.scrollY > heroHeight - 80);
  };

  window.addEventListener("scroll", handleScroll);
  handleScroll(); // initial check

  return () => window.removeEventListener("scroll", handleScroll);
}, []);



  const handleDropdown = (e) => {
    const menu = e.currentTarget.nextElementSibling;
    const rect = menu.getBoundingClientRect();

    // If menu is going outside the right edge → apply right alignment
    if (rect.right > window.innerWidth) {
      menu.classList.add("align-right");
    } else {
      menu.classList.remove("align-right");
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuActive(!mobileMenuActive);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuActive && !event.target.closest('.modern-navbar')) {
        setMobileMenuActive(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [mobileMenuActive]);

  // Add CSS for loading skeleton
  const dynamicStyles = `
    .brand-name-skeleton {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
      border-radius: 4px;
      display: inline-block;
      width: 120px;
      height: 24px;
    }

    .logo-skeleton {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
      border-radius: 4px;
      width: 40px;
      height: 40px;
    }

    @keyframes loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    .modern-brand-name {
      transition: opacity 0.3s ease;
    }

    .modern-brand-name.loading {
      opacity: 0.7;
    }
  `;

  return (
    <>
      <style>{dynamicStyles}</style>
      <nav className={`modern-navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="modern-navbar-container">
          {/* Logo Section */}
          <div className="modern-navbar-brand">
            <Link to="/" className="modern-brand-link">
              {loading.logo ? (
                <div className="logo-skeletons"></div>
              ) : logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={`${brandName} Logo`} 
                  className="modern-brand-logo" 
                  onError={(e) => {
                    console.error("Logo failed to load");
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="modern-brand-logo-placeholder">
                  <span className="modern-logo-placeholder-text">Brio</span>
                </div>
              )}
              
              </Link>
           <Link
  to="/"
  className="modern-brand-link"
  style={{ textDecoration: "none" }}
>

            {/* <span className={`modern-brand-name ${loading.name ? 'loading' : ''}`}>
                {loading.name ? (
                  <div className="brand-name-skeleton"></div>
                ) : (
                  brandName
                )}
              </span> */}
              <span className="modern-brand-name">
  {loading.name ? "Brio" : (brandName || "Brio")}
</span>

              </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className={`modern-mobile-toggle ${mobileMenuActive ? 'active' : ''}`}
            onClick={toggleMobileMenu}
            aria-label="Toggle navigation menu"
          >
            <span className="modern-toggle-line"></span>
            <span className="modern-toggle-line"></span>
            <span className="modern-toggle-line"></span>
          </button>

          {/* Navigation Links */}
          <div className={`modern-navbar-menu ${mobileMenuActive ? 'active' : ''}`}>
            <div className="modern-menu-links">
  <Link to="/" className="modern-nav-link">
    <Home size={20} className="nav-icon" />
    Let's Begin
  </Link>

  <Link to="/about" className="modern-nav-link">
    <Info size={20} className="nav-icon" />
    Know Us
  </Link>

  <Link to="/contactUs" className="modern-nav-link">
    <Mail size={20} className="nav-icon" />
    Drop a Message
  </Link>

  <Link to="/pricingsection" className="modern-nav-link">
    <FaCrown size={20} className="nav-icon" />
    Pricing
  </Link>

              {/* Optional dropdowns - commented out for now */}
              {/* <div className="modern-dropdown">
                <button className="modern-dropdown-trigger">
                  Resources
                  <svg className="modern-dropdown-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
                <div className="modern-dropdown-menu">
                  <Link to="/resources/blog" className="modern-dropdown-item">Blog</Link>
                  <Link to="/resources/help-center" className="modern-dropdown-item">Help Center</Link>
                  <Link to="/resources/case-studies" className="modern-dropdown-item">Case Studies</Link>
                  <Link to="/resources/documentation" className="modern-dropdown-item">Documentation</Link>
                  <Link to="/resources/community" className="modern-dropdown-item">Community</Link>
                  <Link to="/resources/support" className="modern-dropdown-item">Support</Link>
                </div>
              </div> */}

              {/* Optional dropdowns - commented out for now */}
              {/* <div className="modern-dropdown">
                <button className="modern-dropdown-trigger">
                  Features
                  <svg className="modern-dropdown-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
                <div className="modern-dropdown-menu">
                  <Link to="/trend-predictor" className="modern-dropdown-item">Trend Predictor</Link>
                  <Link to="/budget-planner" className="modern-dropdown-item">Budget Planner</Link>
                  <Link to="/engagement-calculator" className="modern-dropdown-item">Engagement Calculator</Link>
                  <Link to="/predictive-roi" className="modern-dropdown-item">Predictive ROI</Link>
                  <Link to="/fraud-detection" className="modern-dropdown-item">Fraud Detection</Link>
                  <Link to="/payment-automation" className="modern-dropdown-item">Payment Automation</Link>
                  <Link to="/content-analyzer" className="modern-dropdown-item">Content Analyzer</Link>
                  <Link to="/find-influencer" className="modern-dropdown-item">AI Find Influencer</Link>
                  <Link to="/integration" className="modern-dropdown-item">Integration</Link>
                  <Link to="/content-intelligence" className="modern-dropdown-item">Content Intelligence</Link>
                  <Link to="/futureai" className="modern-dropdown-item">Future AI</Link>
                  <Link to="/automation-marketing" className="modern-dropdown-item">Automation Marketing</Link>
                </div>
              </div> */}
            </div>

            {/* Action Buttons */}
            <div className="modern-navbar-actions">
              <Link 
                to="/auth?role=influencer" 
                className="modern-btn modern-btn-primary"
              >
                Are You Influencer
              </Link>

              <Link to="/login" className="modern-btn modern-btn-secondary">
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default ModernNavbar;