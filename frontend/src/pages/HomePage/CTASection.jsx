import React from "react";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="qb-cta-section" id="cta">
      <div className="qb-cta-background">
        <div className="qb-cta-orbit"></div>
        <div className="qb-cta-particles"></div>
      </div>
      <div className="qb-cta-container">
        <h2>Ready to Transform Your Influencer Marketing?</h2>
        <p>Join thousands of brands that trust Brio for their AI-powered influencer campaigns</p>
        <div className="qb-cta-features">
          <span>✓ AI-Powered Matching</span>
          <span>✓ Real-Time Analytics</span>
          <span>✓ Automated Workflows</span>
        </div>
        <Link to="/login" className="qb-btn primary large with-pulse">
          Start Your Free Trial
        </Link>
        <span className="qb-cta-note">No credit card required • 14-day free trial • Setup in 5 minutes</span>
      </div>
    </section>
  );
};

export default CTASection;