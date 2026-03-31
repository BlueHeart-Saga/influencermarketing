// src/components/HomeSidebar.jsx
import React from "react";
import { Link } from "react-router-dom";
import { FaUsers, FaBullhorn, FaChartLine, FaSignOutAlt } from "react-icons/fa";
import "../../style/HomeSidebar.css";


const HomeSidebar = () => {
  




const handleGlobalLogout = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userData"); // optional, clear user info

  };  

  return (
    <aside className="hsb-container">
      <div className="hsb-logo">
        {/* <Link to="/">QuickFindAI</Link> */}
      </div>
      <ul className="hsb-menu">
        <li>
          <Link to="/dashboard" className="hsb-link">
            <FaChartLine className="hsb-icon" /> Dashboard
          </Link>
        </li>
        <li>
          <Link to="/campaigns" className="hsb-link">
            <FaBullhorn className="hsb-icon" /> Campaigns
          </Link>
        </li>
        <li>
          <Link to="influencer-explorer" className="hsb-link">
            <FaUsers className="hsb-icon" /> Influencers
          </Link>
        </li>
        <li>
          <Link
    to="/"
    className="hsb-link"
    onClick={(e) => {
      e.preventDefault();         // prevent immediate navigation
      handleGlobalLogout();       // clear auth token
      window.location.href = "/"; // redirect to home/login page
    }}
  >
    <FaSignOutAlt className="hsb-icon" /> Logout
  </Link>
        </li>
      </ul>
    </aside>
  );
};

export default HomeSidebar;
