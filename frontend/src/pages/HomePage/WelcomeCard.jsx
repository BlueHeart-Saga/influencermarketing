import React from "react";
import "../../style/WelcomeCard.css";
import { Link } from "react-router-dom";

const WelcomeCard = ({ username }) => {
  return (
    <div className="welcome-card">
      <div className="welcome-content">
        <h1>
          {username ? `Welcome, ${username}!` : "Welcome to QuickFindAI"}
        </h1>
        <p>
          Use our AI platform to discover influencers, analyze campaigns, and automate your marketing—fast and easy.
        </p>
        <Link to="/login" className="btn access-btn">
          Access AI Automation
        </Link>
      </div>
      <div className="welcome-image">
        <img
          src="/images/e.png"
          alt="AI Marketing"
        />
      </div>
    </div>
  );
};

export default WelcomeCard;
