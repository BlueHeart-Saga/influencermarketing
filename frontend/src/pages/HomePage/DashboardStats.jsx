import React from "react";
import { Link } from "react-router-dom";
import "../../style/dashboardStats.css";

const statsData = [
  {
    title: "Total Campaigns",
    value: 12,
    description: "All active and completed campaigns tracked in your account."
  },
  {
    title: "Total Influencers",
    value: 45,
    description: "Number of influencers you are currently collaborating with."
  },
  {
    title: "Total Reach",
    value: "120k",
    description: "Combined audience reach across all campaigns."
  },
  {
    title: "Total ROI",
    value: "$8,500",
    description: "Overall return on investment from your influencer marketing."
  },
  {
    title: "Average Engagement",
    value: "6.8%",
    description: "Average engagement rate of your campaigns across all platforms."
  },
  {
    title: "Pending Approvals",
    value: 3,
    description: "Campaigns waiting for influencer or client approval."
  }
];

export default function DashboardStats() {
  return (
    <section className="ds-container card-effect">
      <h3 className="ds-title">Dashboard Overview</h3>
      <div className="ds-grid">
        {statsData.map((stat, index) => (
          <div key={index} className="ds-card">
            <h4 className="ds-card-title">{stat.title}</h4>
            <p className="ds-card-value">{stat.value}</p>
            <p className="ds-card-desc">{stat.description}</p>
            <Link to="/campaigns" className="ds-btn-card">
              Try Now →
            </Link>
          </div>
        ))}
      </div>

      {/* Floating bottom-right CTA */}
      <Link to="/login" className="ds-btn-floating">
        ARE YOU TRY MORE →
      </Link>
    </section>
  );
}
