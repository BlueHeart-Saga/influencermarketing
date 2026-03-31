import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_BASE_URL from "../config/api";
import "../style/Register.css";

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [logoUrl, setLogoUrl] = useState("");

  // Add background animation class to body
  useEffect(() => {
    document.body.classList.add('register-page');
    return () => {
      document.body.classList.remove('register-page');
    };
  }, []);

  // Fetch dynamic logo
  const fetchLogo = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/logo/current`, {
        headers: {}, // No token needed for public access
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setLogoUrl(url);
      } else {
        setLogoUrl(""); // fallback if no logo
      }
    } catch (err) {
      console.error("Failed to fetch logo:", err);
      setLogoUrl(""); // fallback if no logo
    }
  }, []);

  useEffect(() => {
    fetchLogo();
  }, [fetchLogo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/password-reset-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || "OTP sent successfully!");
        // Navigate to OTP verification page
        setTimeout(() => {
          navigate('/verify-otp', { state: { email } });
        }, 2000);
      } else {
        throw new Error(data.detail || 'An error occurred. Please try again.');
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      {/* Animated Background */}
      <div className="animated-background">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
      </div>

      <div className="register-card">
        <div className="register-header">
          <div className="logo-container">
            <div className="logo">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt="Company Logo" 
                  className="dynamic-logo"
                  onError={(e) => {
                    // Fallback to emoji if logo fails to load
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              {/* <div className="logo-fallback">
                🔐
              </div> */}
            </div>
          </div>
          
          <h1 className="register-title">Forgot Password</h1>
          <p className="register-subtitle">
            Enter your email address and we'll send you an OTP to reset your password.
          </p>
        </div>

        {/* Success/Error Messages */}
        {message && (
          <div className="message success">
            ✅ {message}
          </div>
        )}
        {error && (
          <div className="message error">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="registration-form">
          <div className="form-group">
            <div className="input-container">
              <input
                type="email"
                name="email"
                placeholder=" "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`form-input ${error ? 'error' : ''}`}
                disabled={loading}
              />
              <label className="floating-label">Email Address</label>
              <div className="input-icon">✉️</div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary login-btn"
          >
            {loading && <span className="loading-spinner"></span>}
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>

          <div className="register-link">
            <p>
              Remember your password?{" "}
              <Link 
                to="/login" 
                className="register-link-text"
                style={{ 
                  pointerEvents: loading ? "none" : "auto",
                  opacity: loading ? 0.5 : 1
                }}
              >
                Back to Login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;