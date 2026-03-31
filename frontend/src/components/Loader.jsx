// import React, { useState, useEffect, useCallback, useContext } from "react";
// import { AuthContext } from "../context/AuthContext";
// import "../style/Loader.css";
// import API_BASE_URL from "../config/api";

// const Loader = () => {
//   const { user } = useContext(AuthContext);
//   const [logoUrl, setLogoUrl] = useState("");
//   const [loadingText, setLoadingText] = useState("Loading");

//   const fetchLogo = useCallback(async () => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/api/logo/current`, {
//         headers: user?.token ? { Authorization: `Bearer ${user.token}` } : {},
//       });
//       if (res.ok) {
//         const blob = await res.blob();
//         const url = URL.createObjectURL(blob);
//         setLogoUrl(url);
//       } else {
//         setLogoUrl("");
//       }
//     } catch (err) {
//       console.error("Failed to fetch logo:", err);
//       setLogoUrl("");
//     }
//   }, [user?.token]);

//   useEffect(() => {
//     fetchLogo();
//   }, [fetchLogo]);

//   // Animated loading text
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setLoadingText(prev => {
//         if (prev === "Loading...") return "Loading";
//         return prev + ".";
//       });
//     }, 500);

//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <div className="loader-container">
//       {/* Premium Background Elements */}
//       <div className="premium-background">
//         <div className="geometric-shape shape-1"></div>
//         <div className="geometric-shape shape-2"></div>
//         <div className="geometric-shape shape-3"></div>
//         <div className="floating-orb orb-1"></div>
//         <div className="floating-orb orb-2"></div>
//         <div className="grid-overlay"></div>
//       </div>

//       {/* Main centered content */}
//       <div className="loader-content">
//         {/* Premium Logo Container */}
//         <div className="premium-logo-container">
//           <div className="logo-wrapper">
//             {logoUrl ? (
//               <img src={logoUrl} alt="Logo" className="premium-logo spinning-logo" />
//             ) : (
//               <div className="premium-default-logo spinning-logo">
//                 <div className="logo-inner-glow"></div>
//                 <div className="logo-center-dot"></div>
//               </div>
//             )}
            
//             {/* Animated rings */}
//             <div className="premium-ring premium-ring-1"></div>
//             <div className="premium-ring premium-ring-2"></div>
//             <div className="premium-ring premium-ring-3"></div>
//           </div>
//         </div>

//         {/* Loading text section */}
//         <div className="premium-loading-text">
//           <h1 className="premium-title">QuickBox</h1>
//           <p className="premium-subtitle">{loadingText}</p>
          
//           {/* Premium progress indicator */}
//           <div className="premium-progress">
//             <div className="progress-track">
//               <div className="progress-fill"></div>
//             </div>
//             <div className="progress-steps">
//               <div className="step active"></div>
//               <div className="step"></div>
//               <div className="step"></div>
//               <div className="step"></div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Bottom status bar */}
//       <div className="premium-status-bar">
//         <div className="status-item">
//           <span className="status-dot"></span>
//           <span className="status-text">Initializing System</span>
//         </div>
//         <div className="status-divider"></div>
//         <div className="status-item">
//           <span className="status-dot"></span>
//           <span className="status-text">Ready</span>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Loader;








import React, { useState, useEffect, useCallback, useContext } from "react";
import API_BASE_URL from "../config/api";
import { AuthContext } from "../context/AuthContext";

const Loader = () => {
  const { user } = useContext(AuthContext);
  const [logoUrl, setLogoUrl] = useState("");

  const fetchLogo = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/logo/current`, {
        headers: user?.token ? { Authorization: `Bearer ${user.token}` } : {},
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setLogoUrl(url);
      } else {
        setLogoUrl("");
      }
    } catch (err) {
      console.error("Failed to fetch logo:", err);
      setLogoUrl("");
    }
  }, [user?.token]);

  useEffect(() => {
    fetchLogo();
  }, [fetchLogo]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
        zIndex: 9999,
      }}
    >
      {/* Spinner wrapper */}
      <div
        style={{
          width: 120,
          height: 120,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Spinner */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            border: "4px solid #e5e7eb",
            borderTopColor: "#005a9e",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />

        {/* Logo */}
        {logoUrl ? (
          <img
            src={logoUrl}
            alt="logo"
            style={{
              width: 70,
              height: 70,
              objectFit: "contain",
            }}
          />
        ) : (
          <div
            style={{
              width: 70,
              height: 70,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 700,
              color: "#005a9e",
            }}
          >
            QB
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Loader;
