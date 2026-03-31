import React, { useState, useEffect } from "react";
import { FiUsers, FiAward } from "react-icons/fi";
import PaymentInfluencer from "./PaymentInfluencer";
import CampaignDetails from "./CampaignDetails";
import "../../style/Finder.css";
import { campaignAPI, userAPI } from "../../services/api";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import API_BASE_URL from "../../config/api";


const Finder = () => {
  const [activeTab, setActiveTab] = useState("influencer");
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalInfluencers: 0,
    activeCampaigns: 0,
  });

useEffect(() => {
  if (!user?.token) return;

  const loadStats = async () => {
    try {
      // 1) get influencer users
      const resUsers = await fetch(
        `${API_BASE_URL}/admin/users?role=influencer`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      const usersData = await resUsers.json();
      const influencerUsers = usersData?.users || [];

      // 2) get all campaigns
      const campaignRes = await campaignAPI.getAllCampaigns();
      const campaigns = campaignRes?.data || [];

      // Count active campaigns
      const activeCampaignCount = campaigns.filter(
        (c) => c.status === "active"
      ).length;

      setStats({
        totalInfluencers: influencerUsers.length,
        activeCampaigns: activeCampaignCount,
      });
    } catch (err) {
      console.error("Error loading finder stats", err);
    }
  };

  loadStats();
}, [user?.token]);



  return (
    <main className="finder-container">
      {/* ====== HEADER ====== */}
      <header className="finder-header">
        <div className="finder-header-text">
          <h1 className="finder-title">Finder</h1>
          <p className="finder-subtitle">
            Discover Influencers and Campaigns with ease — all in one place.
          </p>
        </div>

        <div className="finder-stats">
          <div className="finder-stat-card">
            <div className="finder-stat-icon">
              <FiUsers size={20} />
            </div>
            <div>
              <div className="finder-stat-value">{stats.totalInfluencers}</div>
              <div className="finder-stat-label">Influencers</div>
            </div>
          </div>

          <div className="finder-stat-card">
            <div className="finder-stat-icon">
              <FiAward size={20} />
            </div>
            <div>
              <div className="finder-stat-value">{stats.activeCampaigns}</div>
              <div className="finder-stat-label">Active Campaigns</div>
            </div>
          </div>
        </div>
      </header>

      {/* ====== TABS ====== */}
      <nav className="finder-tabs">
        <button
          className={`finder-tab-button ${
            activeTab === "influencer" ? "is-active" : ""
          }`}
          onClick={() => setActiveTab("influencer")}
        >
          <FiUsers size={18} />
          <span>Influencer Finder</span>

          {stats.totalInfluencers > 0 && (
            <span className="finder-tab-badge">{stats.totalInfluencers}</span>
          )}
        </button>

        <button
          className={`finder-tab-button ${
            activeTab === "campaign" ? "is-active" : ""
          }`}
          onClick={() => setActiveTab("campaign")}
        >
          <FiAward size={18} />
          <span>Campaign Finder</span>

          {stats.activeCampaigns > 0 && (
            <span className="finder-tab-badge">{stats.activeCampaigns}</span>
          )}
        </button>
      </nav>

      {/* ====== CONTENT ====== */}
      <section className="finder-content">
        {activeTab === "influencer" && <PaymentInfluencer />}

        {activeTab === "campaign" && <CampaignDetails />}
      </section>
    </main>
  );
};

export default Finder;
