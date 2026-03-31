import React, { useState } from "react";
import "../../style/BrandAI.css";

export default function BrandAI() {
  const [activeTab, setActiveTab] = useState("research");
  const [simulationRunning, setSimulationRunning] = useState(false);

  const features = [
    {
      title: "Neural Architecture Search",
      description: "Automatically discover optimal neural network structures",
      icon: "🧠",
      color: "#8B5CF6",
    },
    {
      title: "Explainable AI",
      description: "Understand how our models make decisions",
      icon: "🔍",
      color: "#06B6D4",
    },
    {
      title: "Federated Learning",
      description: "Train models across decentralized devices",
      icon: "🌐",
      color: "#10B981",
    },
    {
      title: "Neuro-Symbolic AI",
      description: "Combine neural networks with symbolic reasoning",
      icon: "🧩",
      color: "#F59E0B",
    },
  ];

  const researchAreas = [
    {
      title: "Quantum Machine Learning",
      description: "Leveraging quantum computing for AI acceleration",
      icon: "⚛️",
    },
    {
      title: "Artificial General Intelligence",
      description: "Developing AI with human-like cognitive abilities",
      icon: "🌟",
    },
    {
      title: "Ethical AI Frameworks",
      description: "Ensuring responsible and fair AI development",
      icon: "⚖️",
    },
    {
      title: "Neural-Symbolic Integration",
      description: "Bridging statistical learning with symbolic reasoning",
      icon: "🔗",
    },
    {
      title: "Self-Supervised Learning",
      description: "Reducing dependency on labeled training data",
      icon: "🔄",
    },
  ];

  const startSimulation = () => {
    setSimulationRunning(true);
    setTimeout(() => setSimulationRunning(false), 3000);
  };

  return (
    <div className="brandai-container">
      <div className="brandai-content">
        {/* Header */}
        <header className="brandai-header">
          <div className="header-branding">
            <div className="brand-logo">
              <span className="logo-icon">🤖</span>
              <span className="logo-text">NeuraLink Labs</span>
            </div>
            <h1 className="header-title">Future AI Research Division</h1>
            <p className="header-subtitle">
              Pioneering the next generation of artificial intelligence through
              cutting-edge research and ethical innovation.
            </p>
          </div>
        </header>

        {/* Stats Bar */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-value">24</div>
            <div className="stat-label">Active Projects</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📝</div>
            <div className="stat-value">137</div>
            <div className="stat-label">Research Papers</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-value">48</div>
            <div className="stat-label">Team Members</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🧠</div>
            <div className="stat-value">76</div>
            <div className="stat-label">AI Models</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs-container">
          <div className="tabs">
            <button
              className={`tab-btn ${activeTab === "research" ? "active" : ""}`}
              onClick={() => setActiveTab("research")}
            >
              <span className="tab-icon">🔬</span>
              Research Areas
            </button>
            <button
              className={`tab-btn ${activeTab === "features" ? "active" : ""}`}
              onClick={() => setActiveTab("features")}
            >
              <span className="tab-icon">⚡</span>
              Experimental Features
            </button>
            <button
              className={`tab-btn ${activeTab === "simulations" ? "active" : ""}`}
              onClick={() => setActiveTab("simulations")}
            >
              <span className="tab-icon">🤖</span>
              AI Simulations
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === "research" && (
            <div className="tab-panel">
              <h2 className="tab-heading">Frontier Research Areas</h2>
              <div className="research-grid">
                {researchAreas.map((area, index) => (
                  <div key={index} className="research-card">
                    <div className="research-icon">{area.icon}</div>
                    <div className="research-content">
                      <h3 className="research-title">{area.title}</h3>
                      <p className="research-desc">{area.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "features" && (
            <div className="tab-panel">
              <h2 className="tab-heading">Experimental AI Features</h2>
              <div className="features-grid">
                {features.map((feature, index) => (
                  <div key={index} className="feature-card" style={{ "--accent-color": feature.color }}>
                    <div className="feature-icon" style={{ backgroundColor: feature.color + "20", color: feature.color }}>
                      {feature.icon}
                    </div>
                    <div className="feature-content">
                      <h3 className="feature-title">{feature.title}</h3>
                      <p className="feature-desc">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "simulations" && (
            <div className="tab-panel">
              <h2 className="tab-heading">AI Model Simulations</h2>
              <div className="simulation-container">
                <div className="simulation-box">
                  <div className="simulation-content">
                    <div className={`simulation-visual ${simulationRunning ? "running" : "idle"}`}>
                      <div className="neural-network">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="neuron"></div>
                        ))}
                        {simulationRunning && (
                          <>
                            <div className="pulse pulse-1"></div>
                            <div className="pulse pulse-2"></div>
                            <div className="pulse pulse-3"></div>
                          </>
                        )}
                      </div>
                    </div>
                    <p className="simulation-text">
                      {simulationRunning
                        ? "Running neural network simulation..."
                        : "Run a simulation of our latest AI model to see it in action."}
                    </p>
                    <button
                      onClick={startSimulation}
                      disabled={simulationRunning}
                      className={`sim-btn ${simulationRunning ? "disabled" : ""}`}
                    >
                      {simulationRunning ? (
                        <>
                          <span className="spinner"></span>
                          Simulation in Progress...
                        </>
                      ) : (
                        "Start AI Simulation"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="cta-section">
          <div className="cta-content">
            <h2 className="cta-heading">Join Our Research Community</h2>
            <p className="cta-text">
              Collaborate with leading AI researchers and contribute to shaping
              the future of artificial intelligence.
            </p>
            <div className="cta-buttons">
              <button className="cta-btn primary">
                Explore Research Opportunities
              </button>
              <button className="cta-btn secondary">View Publications</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}