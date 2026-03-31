import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import "../../style/HomeTopBar.css";

const HomeTopBar = ({ isLoggedIn, username }) => {
  const [showBar, setShowBar] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBar(window.scrollY > 50); // show after scrolling 50px
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={`hometopbar-container ${showBar ? "visible" : ""}`}>
      {/* Left - Logo */}
      <div className="hometopbar-logo">
        <Link to="/">
          Brio <span className="small-text">- Free Trial</span>
        </Link>
      </div>

      {/* Hamburger for mobile */}
      <div className="hometopbar-menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? <FaTimes /> : <FaBars />}
      </div>

      {/* Center CTA (hidden on very small screens) */}
      <div className="hometopbar-cta">
        <Link to="/login" className="cta-btn">
          Access Our PLATFORM <span className="small-text">- AI Automation</span>
        </Link>
      </div>

      {/* Right - Nav */}
      <nav className={`hometopbar-nav ${menuOpen ? "open" : ""}`}>
        {isLoggedIn ? (
          <span className="hometopbar-welcome">
            Welcome, {username || "User"}
          </span>
        ) : (
          <>
            <Link to="/login" className="hometopbar-btn">Login</Link>
            <Link to="/login" className="hometopbar-btn-outline">Sign Up</Link>
          </>
        )}
      </nav>
    </div>
  );
};

export default HomeTopBar;
