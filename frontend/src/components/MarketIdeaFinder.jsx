import React, { useState, useEffect, useRef } from "react";
import {
  FaLightbulb,
  FaChartLine,
  FaCopy,
  FaMagic,
  FaExclamationTriangle,
  FaCheck,
} from "react-icons/fa";
import "../style/MarketIdeaFinder.css";
import API_BASE_URL from "../config/api";

export default function MarketIdeaFinder() {
  const [prompt, setPrompt] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const outputRef = useRef(null);

  // Example prompts
  const examplePrompts = [
    {
      text: "🌱 Eco-friendly packaging market in food delivery",
      value:
        "Analyze the market potential for eco-friendly packaging solutions in the food delivery industry",
    },
    {
      text: "💼 Remote work tools for small businesses",
      value:
        "What are the emerging opportunities in remote work productivity tools for small businesses?",
    },
    {
      text: "🧠 Mental health apps for Gen Z market",
      value:
        "Identify market gaps in the wellness and mental health app space for Gen Z consumers",
    },
    {
      text: "👗 Sustainable fashion rental platforms",
      value:
        "Research the market opportunity for sustainable fashion rental platforms in urban areas",
    },
  ];

  // Floating particles effect
  useEffect(() => {
    const container = document.querySelector(".particles");
    if (!container) return;

    const particleCount = 50;
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      particle.className = "particle";
      particle.style.left = Math.random() * 100 + "%";
      particle.style.top = Math.random() * 100 + "%";
      particle.style.animationDelay = Math.random() * 6 + "s";
      particle.style.animationDuration = Math.random() * 3 + 3 + "s";
      container.appendChild(particle);
    }
  }, []);

  // Handle textarea change
  const handleChange = (e) => {
    const value = e.target.value;
    setPrompt(value);
    setCharCount(value.length);
  };

  // Select example prompt
  const handleExampleClick = (value) => {
    setPrompt(value);
    setCharCount(value.length);
  };

  // Generate market insights
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("⚠️ Please enter a prompt to generate market insights.");
      setTimeout(() => setError(""), 4000);
      return;
    }

    setLoading(true);
    setError("");
    setResult("");

    try {
      const response = await fetch(`${API_BASE_URL}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult(data.response); // ✅ backend sends {response: "..."} not result

      // Smooth scroll to output
      setTimeout(() => {
        if (outputRef.current) {
          outputRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 300);
    } catch (err) {
      console.error("Error:", err);
      setError("❌ Failed to generate insights. Please try again.");
      setTimeout(() => setError(""), 4000);
    } finally {
      setLoading(false);
    }
  };

  // Copy output to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  return (
    <div className="market-idea-container">
      <div className="particles"></div>

      <div className="container">
        {/* Header */}
        <div className="header">
          <div className="logo">
            <FaLightbulb />
          </div>
          <h1>Market Idea Finder</h1>
          <p className="subtitle">AI-Powered Business Intelligence</p>
          <p className="tagline">
            Discover innovative market opportunities with advanced AI analysis
          </p>
        </div>

        {/* Input Section */}
        <div className="input-section">
          <div className="input-container">
            <textarea
              placeholder="Describe your market research query..."
              value={prompt}
              onChange={handleChange}
              maxLength={2000}
            />
            <div className="char-counter">{charCount}/2000</div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="button-container">
          <button
            className="generate-btn"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
              </div>
            ) : (
              <span className="btn-text">Generate Market Insights</span>
            )}
          </button>
        </div>

        {/* Output Section */}
        {result && (
          <div className="output-section show" ref={outputRef}>
            <div className="output-container">
              <div className="output-header">
                <div className="output-title">
                  <FaChartLine /> Market Analysis Results
                </div>
                <button className="copy-btn" onClick={handleCopy}>
                  <FaCopy /> Copy
                </button>
              </div>
              <div className="output-content">{result}</div>
              <div className={`success-message ${showSuccess ? "show" : ""}`}>
                <FaCheck /> Copied to clipboard!
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <FaExclamationTriangle />
            <span>{error}</span>
          </div>
        )}

        {/* Example Prompts */}
        <div className="example-prompts">
          <div className="example-title">
            <FaMagic /> Try these example prompts:
          </div>
          {examplePrompts.map((item, index) => (
            <div
              key={index}
              className="example-item"
              onClick={() => handleExampleClick(item.value)}
            >
              {item.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
