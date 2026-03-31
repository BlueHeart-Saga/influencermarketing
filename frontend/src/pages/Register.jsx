import React, { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { GoogleLogin } from '@react-oauth/google';
import jwt_decode from 'jwt-decode';
import API_BASE_URL from "../config/api";
import "../style/Register.css";

function Register() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    secretKey: ""
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState("roleSelection");
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

  const validateForm = () => {
    const newErrors = {};

    if (!form.username.trim()) {
      newErrors.username = "Username is required";
    } else if (form.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAdminAuth = () => {
    const newErrors = {};
    
    if (!form.secretKey.trim()) {
      newErrors.secretKey = "Secret key is required";
    } else if (form.secretKey.length < 8) {
      newErrors.secretKey = "Secret key must be at least 8 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleRoleSelect = (role) => {
    setForm({ ...form, role });
    
    if (role === "admin") {
      setCurrentStep("adminAuth");
    } else {
      setCurrentStep("registration");
    }
  };

  const handleAdminAuth = (e) => {
    e.preventDefault();
    
    if (!validateAdminAuth()) {
      setMessage("Please enter a valid secret key");
      return;
    }

    // Demo secret key - replace with environment variable in production
    if (form.secretKey === "admin12345") {
      setCurrentStep("registration");
      setMessage("");
    } else {
      setErrors({ secretKey: "Invalid secret key" });
      setMessage("Authentication failed. Please check your secret key.");
    }
  };

  const handleGetKeyFromSupport = () => {
    navigate("/support-team");
  };

  const handleLoginSuccess = async (data, email) => {
    // Use the role from the backend response, fallback to form role
    const userRole = data.role || form.role;
    
    console.log("Registration successful - User data:", {
      userRole,
      dataRole: data.role,
      formRole: form.role,
      username: data.username || form.username
    });

    // Store user data in the same format as your login page
    const userData = {
      token: data.access_token,
      role: userRole,
      username: data.username || form.username,
      user_id: data.user_id,
      email: email,
      auth_provider: data.is_new_user ? "google" : "email"
    };
    
    // Store in all locations for compatibility (same as login)
    localStorage.setItem("quickbox-user", JSON.stringify(userData));
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("user", JSON.stringify({
      id: data.user_id,
      role: userRole,
      username: data.username || form.username,
      email: email,
      auth_provider: data.is_new_user ? "google" : "email"
    }));

    // Update AuthContext
    if (login) {
      login(userData);
    }

    // Show success message
    setMessage("Registration successful! Redirecting...");

    // Wait a moment then redirect based on role (same logic as login)
    setTimeout(() => {
      switch (userRole.toLowerCase()) {
        case "admin":
          navigate("/admin/dashboard", { replace: true });
          break;
        case "brand":
          navigate("/brand/dashboard", { replace: true });
          break;
        case "influencer":
          navigate("/influencer/dashboard", { replace: true });
          break;
        default:
          console.warn("Unknown role, redirecting to home:", userRole);
          navigate("/", { replace: true });
      }
    }, 1500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setMessage("Please fix the errors below");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
          role: form.role
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Registration failed");
      }

      // Use the same success handler as Google login
      await handleLoginSuccess(data, form.email);

    } catch (err) {
      setMessage(err.message);
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      setMessage("");

      const decoded = jwt_decode(credentialResponse.credential);
      const email = decoded.email;

      const res = await fetch(`${API_BASE_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          token: credentialResponse.credential,
          role: form.role
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Use the same success handler as regular registration
        await handleLoginSuccess(data, email);
      } else {
        throw new Error(data.detail || "Google authentication failed");
      }
    } catch (err) {
      setMessage(err.message);
      console.error("Google registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setMessage("Google registration failed. Please try again.");
  };

  const goBack = () => {
    if (currentStep === "adminAuth") {
      setCurrentStep("roleSelection");
      setForm({ ...form, role: "", secretKey: "" });
    } else if (currentStep === "registration") {
      setCurrentStep("roleSelection");
      setForm({ ...form, username: "", email: "", password: "", confirmPassword: "" });
    }
    setMessage("");
    setErrors({});
  };

  // Role Selection Step
  if (currentStep === "roleSelection") {
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
                      // Fallback to emoji if logo fails to load
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                
              </div>
            </div>
            <h1 className="register-title">Join Brio</h1>
            <p className="register-subtitle">Choose your account type to get started</p>
          </div>

          <div className="role-selection-grid">
            <div 
              className="role-card brand"
              onClick={() => handleRoleSelect("brand")}
            >
              <div className="role-icon">🏢</div>
              <h3>Brand Account</h3>
              <p>For businesses looking to collaborate with influencers and manage campaigns</p>
              <div className="role-features">
                <span>• Campaign Management</span>
                <span>• Analytics Dashboard</span>
                <span>• Influencer Discovery</span>
              </div>
              <div className="role-cta">Select Brand Account →</div>
            </div>

            <div 
              className="role-card influencer"
              onClick={() => handleRoleSelect("influencer")}
            >
              <div className="role-icon">🌟</div>
              <h3>Influencer Account</h3>
              <p>For content creators wanting to collaborate with brands and grow their presence</p>
              <div className="role-features">
                <span>• Brand Collaborations</span>
                <span>• Portfolio Showcase</span>
                <span>• Earnings Tracking</span>
              </div>
              <div className="role-cta">Select Influencer Account →</div>
            </div>
          </div>

          <div className="admin-access">
            <p>
              Admin access?{" "}
              <span className="admin-link" onClick={() => handleRoleSelect("admin")}>
                Click here for admin registration
              </span>
            </p>
          </div>

          <div className="login-link">
            <p>
              Already have an account?{" "}
              <a 
                href="/login" 
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/login");
                }}
              >
                Sign in here
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Admin Authentication Step
  if (currentStep === "adminAuth") {
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
        
        <div className="register-card admin-auth-container">
          <div className="register-header">
            <div className="logo-container">
              <div className="logo admin">
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
                  🔐
                </div>
              </div>
            </div>
            <h2 className="register-title">Admin Authentication</h2>
            <p className="register-subtitle">Enter your secret key to continue with admin registration</p>
          </div>

          <form onSubmit={handleAdminAuth} className="auth-form">
            <div className="form-group">
              <div className="input-container">
                <input
                  type="password"
                  name="secretKey"
                  placeholder="Enter secret key"
                  value={form.secretKey}
                  onChange={handleChange}
                  required
                  className={`form-input ${errors.secretKey ? 'error' : ''}`}
                />
                <div className="input-icon">🔒</div>
              </div>
              {errors.secretKey && (
                <span className="error-message">{errors.secretKey}</span>
              )}
            </div>

            <button type="submit" className="btn btn-primary auth-btn">
              Verify & Continue
            </button>

            <button 
              type="button"
              onClick={handleGetKeyFromSupport}
              className="btn btn-support"
            >
              Get Key from Support Team
            </button>

            <button 
              type="button"
              onClick={goBack}
              className="btn btn-secondary back-btn"
            >
              ← Back to Role Selection
            </button>
          </form>

          {message && (
            <div className={`message ${message.includes("failed") ? "error" : "success"}`}>
              {message}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Registration Form Step
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
            <div className={`logo ${form.role}`}>
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
                {form.role === "brand" && "🏢"}
                {form.role === "influencer" && "🌟"}
                {form.role === "admin" && "🔐"}
              </div>
            </div>
          </div>
          <div className={`role-badge ${form.role}`}>
            {form.role === "brand" && "Brand Account"}
            {form.role === "influencer" && "Influencer Account"}
            {form.role === "admin" && "Admin Account"}
          </div>
          <h2 className="register-title">Create Your Account</h2>
          <p className="register-subtitle">Fill in your details to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="registration-form">
          <div className="form-group">
            <div className="input-container">
              <input
                type="text"
                name="username"
                placeholder=" "
                value={form.username}
                onChange={handleChange}
                required
                className={`form-input ${errors.username ? 'error' : ''}`}
              />
              <label className="floating-label">Username</label>
              <div className="input-icon">👤</div>
            </div>
            {errors.username && (
              <span className="error-message">{errors.username}</span>
            )}
          </div>

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
              />
              <label className="floating-label">Email Address</label>
              <div className="input-icon">✉️</div>
            </div>
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <div className="input-container">
                <input
                  type="password"
                  name="password"
                  placeholder=" "
                  value={form.password}
                  onChange={handleChange}
                  required
                  className={`form-input ${errors.password ? 'error' : ''}`}
                />
                <label className="floating-label">Password</label>
                <div className="input-icon">🔑</div>
              </div>
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
            </div>

            <div className="form-group">
              <div className="input-container">
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder=" "
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                />
                <label className="floating-label">Confirm Password</label>
                <div className="input-icon">✅</div>
              </div>
              {errors.confirmPassword && (
                <span className="error-message">{errors.confirmPassword}</span>
              )}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary register-btn"
          >
            {loading && <span className="loading-spinner"></span>}
            {loading ? "Creating Account..." : `Create ${form.role.charAt(0).toUpperCase() + form.role.slice(1)} Account`}
          </button>

          <button 
            type="button"
            onClick={goBack}
            className="btn btn-secondary back-btn"
          >
            ← Back to Role Selection
          </button>
        </form>

        <div className="divider">
          <span>Or register with</span>
        </div>

        <div className="google-auth-container">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme={form.role === "brand" ? "filled_blue" : "filled_black"}
            size="large"
            text="signup_with"
            shape="rectangular"
            width="100%"
          />
        </div>

        {message && (
          <div className={`message ${message.includes("successful") ? "success" : "error"}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default Register;