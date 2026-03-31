import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #95aeeaff, #e8f2ff)",
        color: "white",
        padding: "20px"
      }}
    >
      <div
        style={{
          maxWidth: "650px",
          textAlign: "center",
          background: "rgba(255,255,255,0.05)",
          padding: "40px 45px",
          borderRadius: "18px",
          border: "1px solid rgba(255,255,255,0.15)",
          boxShadow: "0 0 40px rgba(0,0,0,0.35)",
        }}
      >
        <h1 style={{ fontSize: "110px", margin: 0, fontWeight: "800" }}>404</h1>

        <h2 style={{ marginTop: "10px", fontWeight: 700 }}>
          Page Not Found
        </h2>

        <p style={{ opacity: 0.8, marginTop: "8px" }}>
          The page you’re looking for may have been moved, deleted, or the link is incorrect.
        </p>

        <div style={{ marginTop: "25px", display: "flex", gap: "12px", justifyContent: "center" }}>
          <Link
            to="/"
            style={{
              padding: "10px 18px",
              borderRadius: "10px",
              background: "#2563eb",
              color: "white",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Go to Home
          </Link>

          <Link
            to={-1}
            style={{
              padding: "10px 18px",
              borderRadius: "10px",
              background: "transparent",
              border: "1px solid #475569",
              color: "white",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Go Back
          </Link>
        </div>
      </div>
    </div>
  );
}
