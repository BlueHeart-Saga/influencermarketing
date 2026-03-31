import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import "../App.css";

export default function AIHelpIcon() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown if click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="ai-help-icon-container" ref={dropdownRef}>
      <button
        className="ai-help-button"
        onClick={() => setOpen(!open)}
        aria-label="AI Help"
        title="AI Help"
      >
        {/* Simple AI icon SVG */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="#2563eb"
          viewBox="0 0 24 24"
          width="32"
          height="32"
        >
          <circle cx="12" cy="12" r="10" />
          <text
            x="12"
            y="16"
            fontSize="12"
            fontWeight="bold"
            fill="white"
            textAnchor="middle"
          >
            AI
          </text>
        </svg>
      </button>

      {open && (
        <div className="ai-help-dropdown">

          <Link to="/ai-chatbot" className="ai-help-link" onClick={() => setOpen(false)}>
            Chat with AI
          </Link>
          <Link to="/ai-insights" className="ai-help-link" onClick={( ) => setOpen(false)}>
            AI Insights
          </Link>
          <Link to="/trend-predictor" className="ai-help-link" onClick={() => setOpen(false)}>
            Trend Predictor
          </Link>
          <Link to="/budget-planner" className="ai-help-link" onClick={() => setOpen(false)}>
            Budget Planner
          </Link>
          <Link to="/engagement-calculator" className="ai-help-link" onClick={() => setOpen(false)}>
            Engagement Calculator
          </Link>
          
  {/* Second dropdown block for similar features */}
  <div className="ai-help-dropdown-separator" />

  <Link to="/fraud-detection" className="ai-help-link" onClick={() => setOpen(false)}>
    Fraud Detection
  </Link>
  <Link to="/predictive-roi" className="ai-help-link" onClick={() => setOpen(false)}>
    Predictive ROI Estimation
  </Link>
  <Link to="/payment-automation" className="ai-help-link" onClick={() => setOpen(false)}>
    Payment Automation
  </Link>
  <Link to="/content-analyzer" className="ai-help-link" onClick={() => setOpen(false)}>
    Content Analyzer
  </Link>
        </div>
      )}
    </div>
  );
}
