// src/hooks/useNotifications.js
import { useEffect } from "react";

export default function useNotifications() {
  useEffect(() => {
    let wsProto = window.location.protocol === "https:" ? "wss" : "ws";
    const wsUrl = `${wsProto}://${window.location.hostname}:7000/ws/notifications/`;
    let socket;

    try {
      socket = new WebSocket(wsUrl);
    } catch (e) {
      console.warn("WebSocket unavailable:", e);
      return;
    }

    socket.onopen = () => console.log("WS connected:", wsUrl);

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const message = payload.message || "Notification";

        alert(message); // Replace with toast later
      } catch (err) {
        console.error("Bad WS message", err);
      }
    };

    socket.onclose = () => console.log("WS closed");

    return () => socket && socket.close();
  }, []);
}
