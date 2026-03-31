import React, { useState, useEffect } from "react";
import { FaShopify, FaGoogle, FaYoutube, FaInstagram, FaTiktok, FaWordpress } from "react-icons/fa";
import "../../style/BrandIntegration.css";

function BrandIntegration() {
  const [integrations, setIntegrations] = useState([
    { 
      id: "shopify", 
      name: "Shopify", 
      icon: <FaShopify />, 
      status: "disconnected", 
      description: "Sync your Shopify store with product data and analytics",
      authUrl: "#shopify-auth",
      color: "#95BF47"
    },
    { 
      id: "woocommerce", 
      name: "WooCommerce", 
      icon: <FaWordpress />, 
      status: "disconnected", 
      description: "Connect your WooCommerce store for seamless integration",
      authUrl: "#woocommerce-auth",
      color: "#96588A"
    },
    { 
      id: "google-analytics", 
      name: "Google Analytics", 
      icon: <FaGoogle />, 
      status: "disconnected", 
      description: "Track campaign performance with Google Analytics data",
      authUrl: "#google-analytics-auth",
      color: "#4285F4"
    },
    { 
      id: "instagram", 
      name: "Instagram API", 
      icon: <FaInstagram />, 
      status: "disconnected", 
      description: "Access Instagram insights and post performance metrics",
      authUrl: "#instagram-auth",
      color: "#E1306C"
    },
    { 
      id: "youtube", 
      name: "YouTube API", 
      icon: <FaYoutube />, 
      status: "disconnected", 
      description: "Analyze YouTube video performance and audience engagement",
      authUrl: "#youtube-auth",
      color: "#FF0000"
    },
    { 
      id: "tiktok", 
      name: "TikTok API", 
      icon: <FaTiktok />, 
      status: "disconnected", 
      description: "Connect with TikTok for campaign analytics and insights",
      authUrl: "#tiktok-auth",
      color: "#000000"
    },
  ]);

  // Simulate checking connection status on component mount
  useEffect(() => {
    // In a real app, this would be an API call to check connection status
    const checkConnectionStatus = () => {
      const connectedIntegrations = ["shopify", "google-analytics", "youtube"];
      
      setIntegrations(prev => prev.map(intg => ({
        ...intg,
        status: connectedIntegrations.includes(intg.id) ? "connected" : "disconnected"
      })));
    };

    checkConnectionStatus();
  }, []);

  const handleConnect = (integrationId) => {
    // In a real app, this would redirect to the OAuth flow for the specific service
    console.log(`Initiating connection to ${integrationId}`);
    
    // For demo purposes, we'll simulate a connection after a short delay
    setIntegrations(prev => 
      prev.map(intg => 
        intg.id === integrationId 
          ? { ...intg, status: "connecting" } 
          : intg
      )
    );

    setTimeout(() => {
      setIntegrations(prev => 
        prev.map(intg => 
          intg.id === integrationId 
            ? { ...intg, status: "connected" } 
            : intg
        )
      );
    }, 1500);
  };

  const handleDisconnect = (integrationId) => {
    // In a real app, this would call an API to revoke access
    console.log(`Disconnecting from ${integrationId}`);
    
    setIntegrations(prev => 
      prev.map(intg => 
        intg.id === integrationId 
          ? { ...intg, status: "disconnected" } 
          : intg
      )
    );
  };

  return (
    <div className="bi-container">
      <div className="bi-header">
        <h1 className="bi-title">Brand Integration Dashboard</h1>
        <p className="bi-subtitle">
          Connect your influencer marketing platform with third-party services to streamline campaigns and track performance.
        </p>
      </div>

      <div className="bi-integration-grid">
        {integrations.map((intg) => (
          <div key={intg.id} className="bi-card">
            <div className="bi-card-header">
              <div className="bi-icon" style={{ color: intg.color }}>
                {intg.icon}
              </div>
              <h3 className="bi-card-title">{intg.name}</h3>
            </div>
            
            <p className="bi-card-description">{intg.description}</p>
            
            <div className="bi-card-status">
              Status:{" "}
              <span className={`bi-status bi-status-${intg.status}`}>
                {intg.status.charAt(0).toUpperCase() + intg.status.slice(1)}
              </span>
            </div>
            
            <div className="bi-card-actions">
              {intg.status === "connected" ? (
                <>
                  <button 
                    className="bi-btn bi-btn-manage"
                    onClick={() => console.log(`Managing ${intg.name}`)}
                  >
                    Manage
                  </button>
                  <button 
                    className="bi-btn bi-btn-disconnect"
                    onClick={() => handleDisconnect(intg.id)}
                  >
                    Disconnect
                  </button>
                </>
              ) : intg.status === "connecting" ? (
                <button className="bi-btn bi-btn-connecting" disabled>
                  Connecting...
                </button>
              ) : (
                <button 
                  className="bi-btn bi-btn-connect"
                  onClick={() => handleConnect(intg.id)}
                >
                  Connect
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BrandIntegration;