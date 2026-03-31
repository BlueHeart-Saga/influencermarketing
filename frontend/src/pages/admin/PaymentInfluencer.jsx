// src/pages/InfluencerDetails.jsx
import React, { useState } from "react";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

function InfluencerDetails() {
  const [influencerId, setInfluencerId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [influencerData, setInfluencerData] = useState(null);

  const token = localStorage.getItem("access_token");

  const handleSearch = async () => {
    if (!influencerId.trim()) {
      setError("Please enter an influencer ID");
      setInfluencerData(null);
      return;
    }

    setLoading(true);
    setError(null);
    setInfluencerData(null);

    try {
      // Fetch influencer profile details
      const profileRes = await fetch(`${API_BASE_URL}/profiles/user/${influencerId}`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!profileRes.ok) {
        throw new Error("Influencer profile not found");
      }

      const profileData = await profileRes.json();

      // Fetch influencer bank accounts
      const bankRes = await fetch(`${API_BASE_URL}/account/user/${influencerId}/bank-accounts`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const bankAccounts = bankRes.ok ? await bankRes.json() : [];

      // Fetch user basic info (if needed separately)
      const userRes = await fetch(`${API_BASE_URL}/account/user/${influencerId}`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const userData = userRes.ok ? await userRes.json() : null;

      setInfluencerData({
        profile: profileData,
        bankAccounts,
        user: userData
      });
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to fetch influencer details");
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto" }}>
      <h2>Influencer Details</h2>
      
      {/* Search Section */}
      <div style={{ 
        marginBottom: "2rem", 
        padding: "1.5rem", 
        border: "1px solid #ddd", 
        borderRadius: "8px",
        backgroundColor: "#f9f9f9"
      }}>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
            Influencer ID:
          </label>
          <input
            type="text"
            placeholder="Enter Influencer ID"
            value={influencerId}
            onChange={(e) => setInfluencerId(e.target.value)}
            style={{ 
              padding: "0.75rem", 
              width: "60%", 
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "1rem"
            }}
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            style={{ 
              padding: "0.75rem 1.5rem", 
              marginLeft: "1rem",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "1rem"
            }}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p>Loading influencer data...</p>
        </div>
      )}

      {error && (
        <div style={{ 
          color: "#d32f2f", 
          backgroundColor: "#ffebee", 
          padding: "1rem", 
          borderRadius: "4px",
          marginBottom: "1rem",
          border: "1px solid #f5c6cb"
        }}>
          {error}
        </div>
      )}

      {influencerData && (
        <div>
          {/* Profile Information */}
          <div style={{ 
            marginBottom: "2rem", 
            padding: "1.5rem", 
            border: "1px solid #ddd", 
            borderRadius: "8px",
            backgroundColor: "white"
          }}>
            <h3 style={{ color: "#333", borderBottom: "2px solid #007bff", paddingBottom: "0.5rem" }}>
              Profile Information
            </h3>
            
            {influencerData.profile && influencerData.profile.profile ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <h4>Basic Info</h4>
                  <ul style={{ listStyle: "none", padding: 0 }}>
                    <li style={{ marginBottom: "0.5rem" }}>
                      <strong>Full Name:</strong> {influencerData.profile.profile.full_name || "N/A"}
                    </li>
                    <li style={{ marginBottom: "0.5rem" }}>
                      <strong>Nickname:</strong> {influencerData.profile.profile.nickname || "N/A"}
                    </li>
                    <li style={{ marginBottom: "0.5rem" }}>
                      <strong>Email:</strong> {influencerData.profile.profile.email || "N/A"}
                    </li>
                    <li style={{ marginBottom: "0.5rem" }}>
                      <strong>Phone:</strong> {influencerData.profile.profile.phone_number || "N/A"}
                    </li>
                    <li style={{ marginBottom: "0.5rem" }}>
                      <strong>Location:</strong> {influencerData.profile.profile.location || "N/A"}
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4>Additional Info</h4>
                  <ul style={{ listStyle: "none", padding: 0 }}>
                    <li style={{ marginBottom: "0.5rem" }}>
                      <strong>Bio:</strong> {influencerData.profile.profile.bio || "N/A"}
                    </li>
                    <li style={{ marginBottom: "0.5rem" }}>
                      <strong>Categories:</strong> 
                      {influencerData.profile.profile.categories && influencerData.profile.profile.categories.length > 0 
                        ? influencerData.profile.profile.categories.join(", ")
                        : "N/A"}
                    </li>
                    <li style={{ marginBottom: "0.5rem" }}>
                      <strong>Target Audience:</strong> {influencerData.profile.profile.target_audience || "N/A"}
                    </li>
                    <li style={{ marginBottom: "0.5rem" }}>
                      <strong>Profile Created:</strong> {formatDate(influencerData.profile.profile.created_at) || "N/A"}
                    </li>
                    <li style={{ marginBottom: "0.5rem" }}>
                      <strong>Last Updated:</strong> {formatDate(influencerData.profile.profile.updated_at) || "N/A"}
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <p>No profile data available</p>
            )}

            {/* Social Links */}
            {influencerData.profile?.profile?.social_links && (
              <div style={{ marginTop: "1.5rem" }}>
                <h4>Social Links</h4>
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                  {Object.entries(influencerData.profile.profile.social_links).map(([platform, url]) => (
                    url && (
                      <div key={platform} style={{ 
                        padding: "0.5rem 1rem", 
                        backgroundColor: "#e9ecef", 
                        borderRadius: "4px",
                        fontSize: "0.9rem"
                      }}>
                        <strong>{platform.charAt(0).toUpperCase() + platform.slice(1)}:</strong> 
                        <a 
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ marginLeft: "0.5rem", color: "#007bff" }}
                        >
                          {url}
                        </a>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bank Accounts Section */}
          <div style={{ 
            padding: "1.5rem", 
            border: "1px solid #ddd", 
            borderRadius: "8px",
            backgroundColor: "white"
          }}>
            <h3 style={{ color: "#333", borderBottom: "2px solid #28a745", paddingBottom: "0.5rem" }}>
              Bank Accounts ({influencerData.bankAccounts.length})
            </h3>
            
            {influencerData.bankAccounts.length === 0 ? (
              <p style={{ textAlign: "center", padding: "2rem", color: "#6c757d" }}>
                No bank accounts found for this influencer
              </p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ 
                  width: "100%", 
                  borderCollapse: "collapse",
                  fontSize: "0.9rem"
                }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f8f9fa" }}>
                      <th style={{ padding: "12px", border: "1px solid #dee2e6", textAlign: "left" }}>Account Holder</th>
                      <th style={{ padding: "12px", border: "1px solid #dee2e6", textAlign: "left" }}>Account Number</th>
                      <th style={{ padding: "12px", border: "1px solid #dee2e6", textAlign: "left" }}>IFSC</th>
                      <th style={{ padding: "12px", border: "1px solid #dee2e6", textAlign: "left" }}>Bank</th>
                      <th style={{ padding: "12px", border: "1px solid #dee2e6", textAlign: "left" }}>Branch</th>
                      <th style={{ padding: "12px", border: "1px solid #dee2e6", textAlign: "center" }}>Type</th>
                      <th style={{ padding: "12px", border: "1px solid #dee2e6", textAlign: "center" }}>Primary</th>
                      <th style={{ padding: "12px", border: "1px solid #dee2e6", textAlign: "center" }}>Verified</th>
                      <th style={{ padding: "12px", border: "1px solid #dee2e6", textAlign: "left" }}>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {influencerData.bankAccounts.map((acc, index) => (
                      <tr key={acc._id} style={{ 
                        backgroundColor: index % 2 === 0 ? "#fff" : "#f8f9fa"
                      }}>
                        <td style={{ padding: "12px", border: "1px solid #dee2e6" }}>
                          {acc.account_holder_name}
                        </td>
                        <td style={{ padding: "12px", border: "1px solid #dee2e6", fontFamily: "monospace" }}>
                          {acc.account_number}
                        </td>
                        <td style={{ padding: "12px", border: "1px solid #dee2e6", fontFamily: "monospace" }}>
                          {acc.ifsc_code}
                        </td>
                        <td style={{ padding: "12px", border: "1px solid #dee2e6" }}>
                          {acc.bank_name || "N/A"}
                        </td>
                        <td style={{ padding: "12px", border: "1px solid #dee2e6" }}>
                          {acc.branch_name || "N/A"}
                        </td>
                        <td style={{ padding: "12px", border: "1px solid #dee2e6", textAlign: "center", textTransform: "capitalize" }}>
                          {acc.account_type}
                        </td>
                        <td style={{ padding: "12px", border: "1px solid #dee2e6", textAlign: "center" }}>
                          <span style={{ 
                            color: acc.is_primary ? "#28a745" : "#6c757d",
                            fontWeight: acc.is_primary ? "bold" : "normal"
                          }}>
                            {acc.is_primary ? "✓ Primary" : "No"}
                          </span>
                        </td>
                        <td style={{ padding: "12px", border: "1px solid #dee2e6", textAlign: "center" }}>
                          <span style={{ 
                            color: acc.is_verified ? "#28a745" : "#dc3545",
                            fontWeight: "bold"
                          }}>
                            {acc.is_verified ? "Verified" : "Pending"}
                          </span>
                        </td>
                        <td style={{ padding: "12px", border: "1px solid #dee2e6", fontSize: "0.8rem" }}>
                          {formatDate(acc.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* User Status */}
          {influencerData.user && (
            <div style={{ 
              marginTop: "1.5rem", 
              padding: "1rem", 
              border: "1px solid #ddd", 
              borderRadius: "8px",
              backgroundColor: "#fff3cd"
            }}>
              <h4>Account Status</h4>
              <p>
                <strong>User ID:</strong> {influencerData.user._id} | 
                <strong> Suspended:</strong> {influencerData.user.is_suspended ? "Yes" : "No"} | 
                <strong> Role:</strong> {influencerData.user.role}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default InfluencerDetails;