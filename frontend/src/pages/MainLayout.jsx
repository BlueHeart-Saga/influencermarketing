import React from "react";
import { Outlet } from "react-router-dom";

import FeedbackWidget from "../components/FeedbackWidget";
import Footer from "./Footer";
import MainNavbar from "./MainNavbar";
import DynamicFooter from "./DynamicFooter";

const MainLayout = () => {
  return (
    <div className="main-layout" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      
      {/* Navigation bar */}
     <MainNavbar />

      {/* Main content area */}
      <main style={{ flex: 1 }}>
        <Outlet /> {/* Nested routes render here */}
      </main>

      {/* Footer */}
      <Footer />
      {/* <DynamicFooter /> */}
      <FeedbackWidget />
    </div>
  );
};

export default MainLayout;
