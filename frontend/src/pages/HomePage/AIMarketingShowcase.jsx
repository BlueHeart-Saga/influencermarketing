import React, { useState, useEffect } from "react";

export default function AIMarketingPlatform() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  const features = [
    {
      title: "AI Influencer Discovery",
      subtitle: "Smart Creator Matching",
      rating: "4.8",
      image: "/images/a1.png",
    },
    {
      title: "Campaign Analytics",
      subtitle: "Real-Time Performance",
      rating: "5.0",
      image: "/images/a2.png",
    },
    {
      title: "Content Generation",
      subtitle: "AI-Powered Creativity",
      rating: "4.9",
      image: "/images/a3.png",
    },
    {
      title: "Audience Insights",
      subtitle: "Deep Engagement Metrics",
      rating: "4.7",
      image: "/images/a4.png",
    },
    {
      title: "Brand Collaboration",
      subtitle: "Seamless Workflow",
      rating: "4.6",
      image: "/images/a5.png",
    },
    {
      title: "Trend Forecasting",
      subtitle: "Predictive AI Analytics",
      rating: "5.0",
      image: "/images/a6.png",
    },
  ];

  const containerStyle = {
    minHeight: "100vh",
    padding: "3rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  };

  const gridContainerStyle = {
    width: "100%",
    maxWidth: "1400px",
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gridTemplateRows: "repeat(2, 350px)",
    gap: "1.5rem",
  };

  const getCardStyle = (index, isHovered) => {
    const baseStyle = {
      position: "relative",
      borderRadius: "24px",
      overflow: "hidden",
      cursor: "pointer",
      boxShadow: isHovered
        ? "0 25px 50px -12px rgba(0, 0, 0, 0.35)"
        : "0 10px 30px rgba(0, 0, 0, 0.15)",
      transform: isHovered ? "translateY(-12px)" : "translateY(0)",
      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      animation: loaded ? `fadeInUp 0.6s ease-out ${(index + 1) * 0.1}s forwards` : "none",
      opacity: loaded ? 1 : 0,
    };

    const gridAreas = [
      { gridColumn: "1 / 2", gridRow: "1 / 2" },
      { gridColumn: "2 / 3", gridRow: "1 / 3" },
      { gridColumn: "3 / 5", gridRow: "1 / 2" },
      { gridColumn: "1 / 2", gridRow: "2 / 3" },
      { gridColumn: "3 / 4", gridRow: "2 / 3" },
      { gridColumn: "4 / 5", gridRow: "2 / 3" },
    ];

    return { ...baseStyle, ...gridAreas[index] };
  };

  const imageStyle = (isHovered) => ({
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transform: isHovered ? "scale(1.1)" : "scale(1)",
    transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
  });

  const overlayStyle = (isHovered, gradient) => ({
    position: "absolute",
    inset: 0,
    padding: "2rem",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    color: "#fff",
    
    transition: "background 0.4s ease",
  });

  const ratingBadgeStyle = (isHovered) => ({
    position: "absolute",
    top: "20px",
    left: "20px",
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    padding: "8px 16px",
    borderRadius: "50px",
    color: "#ff7b29",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontWeight: "700",
    fontSize: "0.95rem",
    boxShadow: isHovered
      ? "0 8px 25px rgba(255, 123, 41, 0.4)"
      : "0 4px 15px rgba(0, 0, 0, 0.1)",
    transform: isHovered ? "scale(1.1)" : "scale(1)",
    transition: "all 0.3s ease",
  });

  const titleStyle = (isHovered) => ({
    margin: 0,
    fontSize: "1.75rem",
    fontWeight: "800",
    letterSpacing: "-0.5px",
    transform: isHovered ? "translateX(5px)" : "translateX(0)",
    transition: "transform 0.3s ease",
  });

  const subtitleStyle = {
    marginTop: "6px",
    fontSize: "1.05rem",
    fontWeight: "500",
    opacity: 0.95,
  };

  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <div style={containerStyle}>
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div style={gridContainerStyle}>
        {features.map((feature, index) => (
          <div
            key={index}
            style={getCardStyle(index, hoveredIndex === index)}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div style={{ position: "relative", width: "100%", height: "100%" }}>
              <img
                src={feature.image}
                alt={feature.title}
                style={imageStyle(hoveredIndex === index)}
              />

              <span style={ratingBadgeStyle(hoveredIndex === index)}>
                <span style={{ fontSize: "1.1rem" }}>⭐</span>
                <span>{feature.rating}</span>
              </span>

              <div style={overlayStyle(hoveredIndex === index, feature.gradient)}>
                <h2 style={titleStyle(hoveredIndex === index)}>
                  {feature.title}
                </h2>
                <p style={subtitleStyle}>{feature.subtitle}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}