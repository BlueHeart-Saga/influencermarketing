import React from "react";
import { Link } from "react-router-dom";
import "../../style/recentCampaigns.css";

const campaignsData = [
  {
    title: "Summer Launch",
    platform: "Instagram",
    description:
      "Kickstart your summer with our influencer campaign featuring trending lifestyle content creators. Track engagement and optimize posts for maximum reach.",
    link: "/campaigns/summer-launch"
  },
  {
    title: "Fitness Promo",
    platform: "YouTube",
    description:
      "Collaborate with top fitness influencers to promote your products and engage health-conscious audiences across multiple video campaigns.",
    link: "/campaigns/fitness-promo"
  },
  {
    title: "Tech Giveaway",
    platform: "TikTok",
    description:
      "Boost brand awareness with viral TikTok challenges and giveaways powered by tech-savvy content creators.",
    link: "/campaigns/tech-giveaway"
  },
  {
    title: "Eco-Friendly Initiative",
    platform: "Instagram & YouTube",
    description:
      "Partner with eco-conscious influencers to highlight your sustainability initiatives and eco-friendly products.",
    link: "/campaigns/eco-initiative"
  },
];

export default function RecentCampaigns() {
  return (
    <section className="rc-container card-effect">
      <h3 className="rc-title">Recent Campaigns</h3>
      <div className="rc-grid">
        {campaignsData.map((campaign, index) => (
          <div key={index} className="rc-card">
            <h4 className="rc-card-title">{campaign.title}</h4>
            <p className="rc-card-platform">{campaign.platform}</p>
            <p className="rc-card-desc">{campaign.description}</p>
            <Link to={campaign.link} className="rc-btn">
              Try Now →
            </Link>
          </div>
        ))}
      </div>

      {/* Floating bottom-right CTA */}
      <Link to="/login" className="rc-btn-floating">
        Explore All Campaigns →
      </Link>
    </section>
  );
}
