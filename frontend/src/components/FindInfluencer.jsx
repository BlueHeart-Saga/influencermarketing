import React, { useState } from "react";
import axios from "axios";
import "../style/FindInfluencer.css";
import API_BASE_URL from "../config/api";

function FindInfluencer() {
  const [criteria, setCriteria] = useState({
    category: "",
    minFollowers: "",
    engagementRate: "",
    platform: "",
  });

  const [matches, setMatches] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const RESULTS_PER_PAGE = 25;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCriteria({ ...criteria, [name]: value });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setPage(1);
    try {
      const res = await axios.get(`${API_BASE_URL}/find-influencers`, {
        params: {
          category: criteria.category || undefined,
          min_followers: criteria.minFollowers || 0,
          engagement_rate: criteria.engagementRate || 0,
          platform: criteria.platform || undefined,
        },
      });
      const data = res.data.influencers || [];
      setMatches(data.slice(0, RESULTS_PER_PAGE));
      setHasMore(data.length > RESULTS_PER_PAGE);
    } catch (err) {
      console.error(err);
      setMatches([]);
      setHasMore(false);
    }
  };

  const loadMore = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/find-influencers`, {
        params: {
          category: criteria.category || undefined,
          min_followers: criteria.minFollowers || 0,
          engagement_rate: criteria.engagementRate || 0,
          platform: criteria.platform || undefined,
        },
      });
      const data = res.data.influencers || [];
      const nextPage = page + 1;
      const start = page * RESULTS_PER_PAGE;
      const end = nextPage * RESULTS_PER_PAGE;
      setMatches([...matches, ...data.slice(start, end)]);
      setPage(nextPage);
      setHasMore(data.length > end);
    } catch (err) {
      console.error(err);
    }
  };

  const randomColor = () => {
    const colors = ["#FF6B6B", "#6BCB77", "#4D96FF", "#FFD93D", "#FF6ED4", "#9D4EDD"];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div className="ufi-container">
      <h1 className="ufi-title">Find the Best Match Influencer</h1>

      <div className="ufi-main-content">
        {/* Left Form */}
        <form className="ufi-form" onSubmit={handleSearch}>
          <p className="ufi-subtitle">
            Enter your campaign criteria to find the perfect influencer match.
          </p>

          <label>Category</label>
          <select name="category" value={criteria.category} onChange={handleChange} className="ufi-input">
            <option value="">Any</option>
            <option value="Fashion">Fashion</option>
            <option value="Tech">Tech</option>
            <option value="Fitness">Fitness</option>
            <option value="Food">Food</option>
          </select>

          <label>Minimum Followers</label>
          <input
            type="number"
            name="minFollowers"
            placeholder="e.g. 5000"
            value={criteria.minFollowers}
            onChange={handleChange}
            className="ufi-input"
          />

          <label>Minimum Engagement Rate (%)</label>
          <input
            type="number"
            name="engagementRate"
            placeholder="e.g. 3.5"
            step="0.1"
            value={criteria.engagementRate}
            onChange={handleChange}
            className="ufi-input"
          />

          <label>Platform</label>
          <select name="platform" value={criteria.platform} onChange={handleChange} className="ufi-input">
            <option value="">Any</option>
            <option value="Instagram">Instagram</option>
            <option value="YouTube">YouTube</option>
            <option value="TikTok">TikTok</option>
          </select>

          <button type="submit" className="ufi-btn-search">Find Influencers</button>
        </form>

        {/* Right Results */}
        <div className="ufi-results">
          {matches.length > 0 ? (
            <>
              <h2>Matched Influencers</h2>
              <ul className="ufi-results-list">
                {matches.map((inf, index) => (
                  <li key={index} className="ufi-card">
                    <div className="ufi-profile-pic" style={{ backgroundColor: randomColor() }}>
                      {inf.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="ufi-card-info">
                      <h3>{inf.name}</h3>
                      <p>Category: {inf.category}</p>
                      <p>Followers: {inf.followers.toLocaleString()}</p>
                      <p>Engagement Rate: {inf.engagement}%</p>
                      <p>Platform: {inf.platform}</p>
                    </div>
                  </li>
                ))}
              </ul>
              {hasMore && (
                <button className="ufi-btn-load-more" onClick={loadMore}>
                  Load More
                </button>
              )}
            </>
          ) : (
            <p className="ufi-no-results">No matches found. Try adjusting your criteria.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default FindInfluencer;
