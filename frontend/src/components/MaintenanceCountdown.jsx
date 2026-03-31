import React, { useEffect, useState } from "react";

export default function MaintenanceCountdown({ endTime }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!endTime) return;

    const end = new Date(endTime).getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft("Maintenance ending...");
        clearInterval(timer);
        return;
      }

      const minutes = Math.floor(diff / 1000 / 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft(`${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  if (!timeLeft) return null;

  return (
    <div style={{
      background: "red",
      color: "white",
      padding: "10px",
      textAlign: "center",
      fontWeight: "bold",
      position: "fixed",
      top: 0,
      width: "100%",
      zIndex: 9999
    }}>
      🚧 Maintenance Active — Ending in {timeLeft}
    </div>
  );
}
