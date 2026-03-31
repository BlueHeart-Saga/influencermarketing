import React from "react";
import { Link } from "react-router-dom";
import "../../style/recommendedInfluencers.css";

const influencersData = [
  {
    username: "@fitnessguru",
    niche: "Fitness & Wellness",
    followers: "120k",
    description:
      "Engages audiences with fitness routines, healthy lifestyle tips, and product reviews for active living.",
    link: "/influencers/fitnessguru"
  },
  {
    username: "@techsavvy",
    niche: "Technology & Gadgets",
    followers: "85k",
    description:
      "Shares in-depth reviews, tutorials, and tech news to help brands reach tech enthusiasts effectively.",
    link: "/influencers/techsavvy"
  },
  {
    username: "@lifestylequeen",
    niche: "Lifestyle & Fashion",
    followers: "95k",
    description:
      "Curates trendy lifestyle content and fashion inspiration for a highly engaged audience.",
    link: "/influencers/lifestylequeen"
  },
  {
    username: "@foodieadventurer",
    niche: "Food & Travel",
    followers: "70k",
    description:
      "Creates visually engaging food and travel experiences, perfect for culinary and travel campaigns.",
    link: "/influencers/foodieadventurer"
  },
  {
    username: "@eco_warrior",
    niche: "Sustainability & Eco-living",
    followers: "60k",
    description:
      "Promotes eco-friendly products and sustainable living, ideal for green campaigns.",
    link: "/influencers/eco_warrior"
  },
];

export default function RecommendedInfluencers() {
  return (
    <section className="ri-container card-effect">
      <h3 className="ri-title">Recommended Influencers</h3>
      <div className="ri-grid">
        {influencersData.map((inf, index) => (
          <div key={index} className="ri-card">
            <h4 className="ri-card-username">{inf.username}</h4>
            <p className="ri-card-niche">{inf.niche}</p>
            <p className="ri-card-followers">Followers: {inf.followers}</p>
            <p className="ri-card-desc">{inf.description}</p>
            <Link to={inf.link} className="ri-btn">
              Try Now →
            </Link>
          </div>
        ))}
      </div>

      {/* Floating CTA for all influencers */}
      <Link to="/login" className="ri-btn-floating">
        Explore All Influencers →
      </Link>
    </section>
  );
}
