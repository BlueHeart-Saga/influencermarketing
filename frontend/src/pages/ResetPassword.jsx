import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import API_BASE_URL from "../config/api";
import "../style/Register.css";

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
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

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const resetToken = localStorage.getItem('resetToken');
      
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resetToken}`
        },
        body: JSON.stringify({
          new_password: password,
          confirm_password: confirmPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Password reset successfully!');
        
        // Clear reset token and redirect to login
        setTimeout(() => {
          localStorage.removeItem('resetToken');
          navigate('/login');
        }, 2000);
      } else {
        throw new Error(data.detail || 'Failed to reset password. Please try again.');
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
                🔒
              </div> */}
            </div>
          </div>
          <h1 className="register-title">Reset Password</h1>
          <p className="register-subtitle">
            Create a new password for your account.
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
            <div className="input-container password-input">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder=" "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input"
                disabled={loading}
              />
              <label className="floating-label">New Password</label>
              <div className="input-icon">🔑</div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
                disabled={loading}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div className="form-group">
            <div className="input-container password-input">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder=" "
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="form-input"
                disabled={loading}
              />
              <label className="floating-label">Confirm New Password</label>
              <div className="input-icon">✅</div>
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="password-toggle"
                disabled={loading}
              >
                {showConfirmPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading || !password || !confirmPassword}
            className="btn btn-primary register-btn"
          >
            {loading && <span className="loading-spinner"></span>}
            {loading ? "Resetting..." : "Reset Password"}
          </button>

          <div className="login-link">
            <p>
              Back to{" "}
              <Link 
                to="/login" 
                className="register-link-text"
                style={{ 
                  pointerEvents: loading ? "none" : "auto",
                  opacity: loading ? 0.5 : 1
                }}
              >
                Login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;