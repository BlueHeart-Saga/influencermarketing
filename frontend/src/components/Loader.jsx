import React, { useState, useEffect, useCallback, useContext } from "react";
import API_BASE_URL from "../config/api";
import { AuthContext } from "../context/AuthContext";

const Loader = () => {
  const context = useContext(AuthContext);
  const user = context?.user;
  const [logoUrl, setLogoUrl] = useState(() => localStorage.getItem("brio-cached-logo") || "");

  const fetchLogo = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/logo/current`, {
        headers: user?.token ? { Authorization: `Bearer ${user.token}` } : {},
      });
      if (res.ok) {
        const blob = await res.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result;
          setLogoUrl(base64data);
          localStorage.setItem("brio-cached-logo", base64data);
        };
        reader.readAsDataURL(blob);
      }
    } catch (err) {
      console.error("Failed to fetch logo:", err);
    }
  }, [user?.token]);

  useEffect(() => {
    fetchLogo();
  }, [fetchLogo]);

  return (
    <div className="minimal-loader-root">
      <div className="loader-central-unit">
        {/* Single Blue Spinner Ring */}
        <div className="spinner-outer"></div>

        {/* Logo Container */}
        <div className="logo-vault">
          {logoUrl ? (
            <img src={logoUrl} alt="Brio" className="loader-logo-img" />
          ) : (
            <div className="loader-logo-placeholder">B</div>
          )}
        </div>
      </div>

      <style>{`
        .minimal-loader-root {
          position: fixed;
          inset: 0;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100000;
        }

        .loader-central-unit {
          position: relative;
          width: 140px;
          height: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Solid Blue Spinner */
        .spinner-outer {
          position: absolute;
          inset: 0;
          border: 4px solid #f3f4f6;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        /* Central Logo Presentation */
        .logo-vault {
          width: 90px;
          height: 90px;
          background: #ffffff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
          overflow: hidden;
        }

        .loader-logo-img {
          width: 70%;
          height: 70%;
          object-fit: contain;
        }

        .loader-logo-placeholder {
          font-family: 'Segoe UI', system-ui, sans-serif;
          font-size: 42px;
          font-weight: 700;
          color: #3b82f6;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Loader;
