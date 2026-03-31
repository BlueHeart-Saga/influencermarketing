import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Explore, People } from "@mui/icons-material";
import { FaCrown } from "react-icons/fa";
import "../style/TopNav.css";

const TopNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="top-nav">
      <button
        className={`nav-item ${isActive("/") ? "active" : ""}`}
        onClick={() => navigate("/")}
      >
        <Home fontSize="small" />
        <span>Home</span>
      </button>

      <button
        className={`nav-item ${isActive("/about") ? "active" : ""}`}
        onClick={() => navigate("/about")}
      >
        <Explore fontSize="small" />
        <span>Explore</span>
      </button>

      <button
        className={`nav-item ${isActive("/contactus") ? "active" : ""}`}
        onClick={() => navigate("/contactus")}
      >
        <People fontSize="small" />
        <span>Let’s Talk</span>
      </button>

      <button
        className={`nav-item upgrade ${isActive("/pricingsection") ? "active" : ""}`}
        onClick={() => navigate("/pricingsection")}
      >
        <FaCrown size={14} />
        <span>Upgrade</span>
      </button>
    </div>
  );
};

export default TopNav;
