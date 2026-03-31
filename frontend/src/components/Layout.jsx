// src/components/Layout.jsx
import React, { useContext, useState, useEffect, useMemo } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { AuthContext } from "../context/AuthContext";
import Chatbot from "./Chatbot";
import FeedbackWidget from "../components/FeedbackWidget";
import "../style/Layout.css";

export default function Layout({ children }) {
  const { user } = useContext(AuthContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle window resize for responsiveness
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Auto-close sidebar on mobile by default
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Role-based message
  const welcomeMessage = useMemo(() => {
    if (!user) return "Welcome to Brio – Please Login";
    switch (user.role) {
      case "admin":
        return "Welcome Admin – Manage the Platform Efficiently";
      case "brand":
        return "Welcome Brand Partner – Create and Track Campaigns Seamlessly";
      case "influencer":
        return "Welcome Influencer – Collaborate and Grow Your Reach";
      default:
        return `Welcome ${user.username || "User"} – Empower Your Marketing Journey`;
    }
  }, [user]);

  const renderFeedbackWidget = () => {
    if (!user) return null;

    switch (user.role) {
      case "brand":
        return <FeedbackWidget />;
      case "influencer":
        return <FeedbackWidget />;
      default:
        return null; // admin/others won't see feedback widget
    }
  };

  // Check if children exist
  const hasChildren = React.Children.count(children) > 0;

  return (
    <div className="layout-container">
      {/* Top Navbar - Fixed */}
      <header className="layout-header">
        <Navbar 
          toggleSidebar={toggleSidebar} 
          isSidebarOpen={isSidebarOpen}
          isMobile={isMobile}
        />
      </header>

      {/* Main Container */}
      <div className="layout-content">
        {/* Sidebar (only if logged in) - Fixed */}
        {user && (
          <aside className={`sidebar-container ${isSidebarOpen ? 'open' : 'closed'}`}>
            <Sidebar 
              isSidebarOpen={isSidebarOpen}
              isMobile={isMobile}
              toggleSidebar={toggleSidebar}
            />
          </aside>
        )}

        {/* Page Content - Scrollable */}
        <main className={`main-content ${user ? 'with-sidebar' : 'without-sidebar'} ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          {/* Only show welcome message when there are no children */}
          {!hasChildren && (
            <div className="welcome-container">
              <h1 className="welcome-message">
                {welcomeMessage}
              </h1>
            </div>
          )}

          <div className="content-wrapper">
            {children}
          </div>
        </main>
      </div>

      <Chatbot />
      {renderFeedbackWidget()}
    </div>
  );
}