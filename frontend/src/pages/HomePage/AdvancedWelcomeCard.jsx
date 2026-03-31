import React from "react";
import "../../style/AdvancedWelcomeCard.css";
import { Link } from "react-router-dom";

const AdvancedWelcomeCard = ({ username }) => {
  return (
    <section className="awc-container">
      {/* Text Section */}
      <div className="awc-text">
        <h1 className="awc-title">
          {username ? `Welcome, ${username}!` : "Welcome to QuickFindAI"}
        </h1>
        <p className="awc-subtitle">
          Your AI-powered influencer marketing platform to discover, connect, 
          and grow your campaigns efficiently.
        </p>

        <ul className="awc-features">
          <li>✅ Discover influencers in any niche instantly</li>
          <li>✅ Predict campaign ROI with AI insights</li>
          <li>✅ Automate influencer payments and follow-ups</li>
          <li>✅ Analyze content engagement like a pro</li>
        </ul>

        <Link to="/brandsignup" className="awc-access-btn">
          Access AI Automation
        </Link>
      </div>

      {/* Image Section */}
      <div className="awc-image">
        <img
          src="/images/e.png"
          alt="AI Marketing Illustration"
        />
      </div>
    </section>
  );
};

export default AdvancedWelcomeCard;
