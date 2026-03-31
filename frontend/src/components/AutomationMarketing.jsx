import React from "react";
import { FaBullhorn, FaChartLine, FaUsers, FaEnvelope, FaShoppingCart, FaWhatsapp, FaCogs, FaProjectDiagram, FaTasks, FaNetworkWired } from "react-icons/fa";
import "../style/AutomationMarketing.css";

const features = [
  { name: "Lead Generation", icon: <FaBullhorn />, link: "/lead-generation" },
  { name: "Lead Nurturing", icon: <FaTasks />, link: "/lead-nurturing" },
  { name: "Behavior Marketing", icon: <FaNetworkWired />, link: "/behavior-marketing" },
  { name: "Lead Qualification", icon: <FaCogs />, link: "/lead-qualification" },
  { name: "Customer Journeys", icon: <FaProjectDiagram />, link: "/customer-journeys" },
  { name: "Web Analytics", icon: <FaChartLine />, link: "/web-analytics" },
  { name: "Multichannel Marketing", icon: <FaEnvelope />, link: "/multichannel-marketing" },
  { name: "WhatsApp Marketing", icon: <FaWhatsapp />, link: "/whatsapp-marketing" },
  { name: "Marketing Planner", icon: <FaTasks />, link: "/marketing-planner" },
  { name: "Ecommerce", icon: <FaShoppingCart />, link: "/ecommerce" },
  { name: "SMS Marketing", icon: <FaEnvelope />, link: "/sms-marketing" },
  { name: "Influencers", icon: <FaUsers />, link: "/influencers" }

];

function AutomationMarketing() {
  return (
    <div className="autoMkt-container">
      <h2 className="autoMkt-title">Automation Marketing Features</h2>
      <div className="autoMkt-cards">
        {features.map((feat, idx) => (
          <a key={idx} href={feat.link} className="autoMkt-card">
            <div className="autoMkt-icon">{feat.icon}</div>
            <h3 className="autoMkt-name">{feat.name}</h3>
          </a>
        ))}
      </div>
    </div>
  );
}

export default AutomationMarketing;
