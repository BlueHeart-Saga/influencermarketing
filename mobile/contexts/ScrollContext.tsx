// C:\Sagadevan\quickbox\mobile\contexts\ScrollContext.tsx
import React, { createContext, useContext, useRef } from "react";
import { Animated } from "react-native";

const ScrollContext = createContext<Animated.Value | null>(null);

export const ScrollProvider = ({ children }: { children: React.ReactNode }) => {
  const scrollY = useRef(new Animated.Value(0)).current;

  return (
    <ScrollContext.Provider value={scrollY}>
      {children}
    </ScrollContext.Provider>
  );
};

// Custom hook for easy access
export const useScroll = () => {
  const context = useContext(ScrollContext);
  if (!context) {
    throw new Error("useScroll must be used within a ScrollProvider");
  }
  return context;
};