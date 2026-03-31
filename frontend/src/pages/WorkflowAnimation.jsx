// WorkflowAnimation.jsx
import React from "react";
import { motion } from "framer-motion";

const steps = [
  "Brand signs up / logs in",
  "Create Campaign",
  "Define Goals & Budget",
  "AI suggests Influencers",
  "Brand selects Influencers",
  "Influencers create content",
  "AI tracks performance",
  "Brand reviews analytics",
  "Adjust Campaign?",
  "Campaign Completed",
  "Payment & Reports Generated"
];

const WorkflowAnimation = () => {
  return (
    <div style={{ padding: "2rem" }}>
      {steps.map((step, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.5, duration: 0.6 }}
          style={{
            background: "#f0f4f8",
            margin: "1rem 0",
            padding: "1rem 2rem",
            borderRadius: "10px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
          }}
        >
          {step}
        </motion.div>
      ))}
    </div>
  );
};

export default WorkflowAnimation;
