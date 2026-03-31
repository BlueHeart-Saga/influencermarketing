import React from "react";
import { FaShopify, FaGoogle, FaYoutube, FaInstagram, FaTiktok, FaTwitter, FaFacebookF, FaWordpress } from "react-icons/fa";
import "../../style/Integration.css"; // external CSS file

function Integration() {
  const integrations = [
  { name: "Shopify", icon: <FaShopify />, status: "Connected" },
  { name: "WooCommerce", icon: <FaWordpress />, status: "Not Connected" },
  { name: "Google Analytics", icon: <FaGoogle />, status: "Connected" },
  { name: "Instagram API", icon: <FaInstagram />, status: "Not Connected" },
  { name: "YouTube API", icon: <FaYoutube />, status: "Connected" },
  { name: "TikTok API", icon: <FaTiktok />, status: "Not Connected" },
  { name: "Facebook Ads", icon: <FaFacebookF />, status: "Connected" },
  { name: "Twitter (X) API", icon: <FaTwitter />, status: "Not Connected" }
];


  return (
    <div className="id-container">
      <h1 className="id-title">Integration Dashboard</h1>
      <p className="id-subtitle">
        Simulate connecting your influencer marketing platform with third-party services.
      </p>

      <div className="id-integration-grid">
        {integrations.map((intg, index) => (
          <div key={index} className="id-card">
            <div className="id-icon">{intg.icon}</div>
            <h3 className="id-card-title">{intg.name}</h3>
            <p className="id-card-status">
              Status:{" "}
              <span
                className={`id-status ${
                  intg.status === "Connected" ? "id-connected" : "id-disconnected"
                }`}
              >
                {intg.status}
              </span>
            </p>
            <button
              className={`id-btn ${
                intg.status === "Connected" ? "id-btn-manage" : "id-btn-connect"
              }`}
            >
              {intg.status === "Connected" ? "Manage" : "Connect"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Integration;
