import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import API_BASE_URL from "../config/api";
import "../style/Register.css";

function VerifyOTP() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const [logoUrl, setLogoUrl] = useState("");
  
  const email = location.state?.email;

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

  // Redirect if no email provided
  React.useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          otp: otp
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store reset token and navigate to reset password page
        localStorage.setItem('resetToken', data.reset_token);
        navigate('/reset-password', { state: { email } });
      } else {
        throw new Error(data.detail || 'Invalid OTP. Please try again.');
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError('');

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

      if (response.ok) {
        setError(''); // Clear any previous errors
        setMessage('OTP has been resent to your email.');
      } else {
        throw new Error('Failed to resend OTP. Please try again.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const [message, setMessage] = useState('');

  return (
    <div className="register-container">
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
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              {/* <div className="logo-fallback">
                🔢
              </div> */}
            </div>
          </div>
          <h1 className="register-title">Verify OTP</h1>
          <p className="register-subtitle">
            We've sent a 6-digit OTP to <strong>{email}</strong>. Please enter it below.
          </p>
        </div>

        {message && (
          <div className="message success">
            {message}
          </div>
        )}
        {error && (
          <div className="message error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="registration-form">
          <div className="form-group">
            <div className="input-container">
              <input
                type="text"
                name="otp"
                placeholder=" "
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                className="form-input"
                disabled={loading}
                maxLength={6}
              />
              <label className="floating-label">Enter 6-digit OTP</label>
              <div className="input-icon">📱</div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading || otp.length !== 6}
            className="btn btn-primary register-btn"
          >
            {loading && <span className="loading-spinner"></span>}
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          <div className="resend-otp-section">
            <p className="resend-text">Didn't receive the OTP?</p>
            <button 
              type="button"
              onClick={handleResendOTP}
              disabled={loading}
              className="btn btn-secondary resend-btn"
            >
              Resend OTP
            </button>
          </div>

          <div className="login-link">
            <p>
              Use different email?{" "}
              <Link 
                to="/forgot-password" 
                className="register-link-text"
                style={{ 
                  pointerEvents: loading ? "none" : "auto",
                  opacity: loading ? 0.5 : 1
                }}
              >
                Click here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default VerifyOTP;