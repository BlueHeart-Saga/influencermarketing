import React, { useState, useContext, useEffect, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { GoogleLogin } from '@react-oauth/google';
import jwt_decode from 'jwt-decode';
import API_BASE_URL from "../config/api";
import "../style/Register.css";
import TopNav from "../components/TopNav";

// Admin Icon Component for Login
const AdminLoginIcon = ({ onClick, isAdminMode }) => (
  <div 
    className="admin-login-icon"
    onClick={onClick}
    title={isAdminMode ? "Switch to normal login" : "Login as admin"}
  >
    <span>A</span>
  </div>
);

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);

  const [form, setForm] = useState({ 
    email: "", 
    password: "" 
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");
  const [forgotPasswordHover, setForgotPasswordHover] = useState(false);

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

  // Get success message from registration redirect
  const successMessage = location.state?.message;

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!form.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const toggleAdminLogin = () => {
    setIsAdminLogin(!isAdminLogin);
    setErrors({});
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Login failed. Please check your credentials.");
      }

      // If in admin login mode, verify the user is actually an admin
      if (isAdminLogin && data.role !== "admin") {
        throw new Error("Access denied. Admin privileges required.");
      }

      console.log("Login successful:", data);

      // Store user data and redirect
      await handleLoginSuccess(data, form.email);

    } catch (err) {
      setErrors({ submit: err.message });
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setGoogleLoading(true);
      setErrors({});

      const decoded = jwt_decode(credentialResponse.credential);
      console.log("Google User Info:", decoded);

      // Send to backend for verification
      const res = await fetch(`${API_BASE_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          token: credentialResponse.credential,
          role: isAdminLogin ? "admin" : "brand" // Pass role based on login mode
        }),
      });

      const data = await res.json();
      console.log("Backend Google auth response:", data);

      if (!res.ok) {
        throw new Error(data.detail || "Google authentication failed");
      }

      // If in admin login mode, verify the user is actually an admin
      if (isAdminLogin && data.role !== "admin") {
        throw new Error("Access denied. Admin privileges required for Google login.");
      }

      // Store user data and redirect
      await handleLoginSuccess(data, data.email);

    } catch (err) {
      setErrors({ submit: err.message });
      console.error("Google login error:", err);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    setErrors({ submit: "Google login failed. Please try again." });
  };

  const handleLoginSuccess = async (data, email) => {
    // CRITICAL: Store token in BOTH locations for compatibility
    // 1. For your AuthContext (quickbox-user)
    const userData = {
      token: data.access_token,
      role: data.role,
      username: data.username,
      user_id: data.user_id,
      email: email,
      auth_provider: data.is_new_user ? "google" : "email"
    };
    
    localStorage.setItem("quickbox-user", JSON.stringify(userData));
    
    // 2. For your API service (access_token and user)
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("user", JSON.stringify({
      id: data.user_id,
      role: data.role,
      username: data.username,
      email: email,
      auth_provider: data.is_new_user ? "google" : "email"
    }));

    // Verify all storage locations
    console.log("Storage verification:", {
      quickboxUser: localStorage.getItem("quickbox-user"),
      accessToken: localStorage.getItem("access_token"),
      userData: localStorage.getItem("user")
    });

    // Update AuthContext
    if (login) {
      login(userData);
    }

    // Show success message for new Google users
    if (data.is_new_user) {
      setErrors({ 
        submit: "Welcome! Google registration successful. Redirecting..." 
      });
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // Redirect based on role
    switch (data.role) {
      case "admin":
        navigate("/admin");
        break;
      case "brand":
        navigate("/brand");
        break;
      case "influencer":
        navigate("/influencer");
        break;
      default:
        navigate("/");
    }
  };

  const isLoading = loading || googleLoading;

  return (
    <div className="register-container">

      <TopNav />
      {/* Animated Background */}
      <div className="animated-background">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
      </div>
      
      {/* Admin Login Icon */}
      <AdminLoginIcon onClick={toggleAdminLogin} isAdminMode={isAdminLogin} />

      <div className="register-card">
        <div className="register-header">
          <div className="logo-container">
            <div className={`logo ${isAdminLogin ? 'admin' : ''}`}>
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
              <div className="logo-fallback">
                {isAdminLogin ? "🔐" : ""}
              </div>
            </div>
          </div>
          
          {isAdminLogin && (
            <div className="role-badge admin">
              Admin Login
            </div>
          )}
          
          <h1 className="register-title">
            {isAdminLogin ? "Admin Login" : "Welcome Back"}
          </h1>
          <p className="register-subtitle">
            {isAdminLogin 
              ? "Enter your credentials to access the admin dashboard" 
              : "Sign in to your account to continue"
            }
          </p>
        </div>

        {/* Success Message from Registration */}
        {successMessage && (
          <div className="message success">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="registration-form">
          <div className="form-group">
            <div className="input-container">
              <input
                type="email"
                name="email"
                placeholder=" "
                value={form.email}
                onChange={handleChange}
                required
                className={`form-input ${errors.email ? 'error' : ''}`}
                disabled={isLoading}
              />
              <label className="floating-label">Email Address</label>
              <div className="input-icon">✉️</div>
            </div>
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <div className="input-container password-input">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder=" "
                value={form.password}
                onChange={handleChange}
                required
                className={`form-input ${errors.password ? 'error' : ''}`}
                disabled={isLoading}
              />
              <label className="floating-label">Password</label>
              <div className="input-icon">🔑</div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
                disabled={isLoading}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          {/* Forgot Password Button */}
          <div className="forgot-password-container">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="forgot-password-btn"
              disabled={isLoading}
              onMouseEnter={() => setForgotPasswordHover(true)}
              onMouseLeave={() => setForgotPasswordHover(false)}
            >
              <span className={`forgot-password-text ${forgotPasswordHover ? 'hover' : ''}`}>
                Forgot Password?
              </span>
              <div className="forgot-password-underline"></div>
            </button>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className={`btn btn-primary login-btn ${isAdminLogin ? 'admin' : ''}`}
          >
            {isLoading && <span className="loading-spinner"></span>}
            {isLoading ? "Signing In..." : (isAdminLogin ? "Admin Sign In" : "Sign In")}
          </button>
        </form>

        <div className="divider">
          <span>Or continue with</span>
        </div>

        <div className="google-auth-container">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme={isAdminLogin ? "filled_black" : "filled_blue"}
            size="large"
            text="signin_with"
            shape="rectangular"
            width="100%"
            disabled={isLoading}
          />
        </div>

        {/* Error/Success Message */}
        {errors.submit && (
          <div className={`message ${errors.submit.includes("Welcome") || errors.submit.includes("successful") ? "success" : "error"}`}>
            {errors.submit.includes("Welcome") || errors.submit.includes("successful") ? "✅ " : "⚠️ "}
            {errors.submit}
          </div>
        )}

        {/* Register Link - Hide for admin login */}
        {!isAdminLogin && (
          <div className="register-link">
            <p>
              Don't have an account?{" "}
              <Link 
                to="/register" 
                className="register-link-text"
                style={{ 
                  pointerEvents: isLoading ? "none" : "auto",
                  opacity: isLoading ? 0.5 : 1
                }}
              >
                Register here
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;