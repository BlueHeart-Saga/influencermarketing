import React, { useState, useEffect, useCallback, useContext } from "react";
import { useRef } from "react";
import { setPageTitle } from "../components/utils/pageTitle";

import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { GoogleLogin, useGoogleLogin } from '@react-oauth/google';
import jwt_decode from 'jwt-decode';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserShield, faLock, faHome, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import API_BASE_URL from "../config/api";
import TopNav from "../components/TopNav";

function AuthContainer() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleFromUrl = searchParams.get('role');
  const { login } = useContext(AuthContext);
  const [currentMode, setCurrentMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [selectedGoogleRole, setSelectedGoogleRole] = useState("brand");

  // Form states
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    username: "", email: "", password: "", confirmPassword: "", role: "", secretKey: ""
  });
  const [forgotPasswordForm, setForgotPasswordForm] = useState({ email: "" });
  const [verifyOTPForm, setVerifyOTPForm] = useState({ otp: "" });
  const [resetPasswordForm, setResetPasswordForm] = useState({ password: "", confirmPassword: "" });
  const [adminLoginForm, setAdminLoginForm] = useState({ email: "", password: "", secretKey: "" });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [currentStep, setCurrentStep] = useState("roleSelection");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailStatus, setEmailStatus] = useState("");
const [checkingEmail, setCheckingEmail] = useState(false);


const emailCheckTimerRef = useRef(null);




useEffect(() => {
  if (currentMode === "login") {
    setPageTitle(
      "Login – AI Influencer Marketing Platform",
      "Log in to access your AI influencer marketing dashboard, manage campaigns, track performance, and collaborate with creators."
    );
  } 
  else if (currentMode === "register") {
    setPageTitle(
      "Create Account – AI Influencer Marketing Platform",
      "Register to get started with our AI influencer marketing platform for brands and creators. Discover influencers and launch campaigns easily."
    );
  }
}, [currentMode]);



  // Fetch dynamic logo
  const fetchLogo = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/logo/current`, { headers: {} });
      if (res.ok) {
        const blob = await res.blob();
        setLogoUrl(URL.createObjectURL(blob));
      } else {
        setLogoUrl("");
      }
    } catch (err) {
      console.error("Failed to fetch logo:", err);
      setLogoUrl("");
    }
  }, []);

  useEffect(() => {
    fetchLogo();
  }, [fetchLogo]);

   // Add this useEffect to handle the auto-switching
  useEffect(() => {
    if (roleFromUrl && (roleFromUrl === 'influencer' || roleFromUrl === 'brand')) {
      setCurrentMode("register");
      setCurrentStep("roleSelection");
      // Auto-select the role after a small delay to ensure state is ready
      setTimeout(() => {
        handleRoleSelect(roleFromUrl);
      }, 100);
    }
  }, [roleFromUrl]);

  const isValidEmailFormat = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const handleEmailLiveCheck = (email, mode = "login") => {
  // Update correct form
  if (mode === "login") {
    setLoginForm(prev => ({ ...prev, email }));
  } else {
    setRegisterForm(prev => ({ ...prev, email }));
  }

  setEmailStatus("");

  if (emailCheckTimerRef.current) {
    clearTimeout(emailCheckTimerRef.current);
  }

  if (!email) return;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setEmailStatus("Invalid email format");
    return;
  }

  emailCheckTimerRef.current = setTimeout(async () => {
    try {
      setCheckingEmail(true);

      const res = await fetch(
        `${API_BASE_URL}/auth/check-email?email=${encodeURIComponent(email)}`
      );
      const data = await res.json();

      if (mode === "register") {
      setEmailStatus(
        data.exists ? "Email already registered" : "Email available"
      );
    } else {
      setEmailStatus(
        data.exists ? "Email found" : "Email not found"
      );
    }


    } catch {
      setEmailStatus("");
    } finally {
      setCheckingEmail(false);
    }
  }, 500);
};



  const validateEmailLive = (email) => {
  if (!email) {
    setEmailStatus("");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setEmailStatus("Invalid email format");
  } else {
    setEmailStatus("Valid email");
  }
};


  const switchMode = (mode) => {
    setCurrentMode(mode);
    setErrors({});
    setMessage("");
    setShowAdminLogin(false);
    if (mode === "register") {
      setCurrentStep("roleSelection");
    }
  };

  const toggleAdminLogin = () => {
    setShowAdminLogin(!showAdminLogin);
    setErrors({});
    setMessage("");
  };

  // Login handlers
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));


if (emailStatus === "Invalid email format") {
  setErrors({ email: "Please enter a valid email" });
  return;
}

  };

  const validateLoginForm = () => {
    const newErrors = {};
    if (!loginForm.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(loginForm.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!loginForm.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!validateLoginForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Login failed");
      await handleLoginSuccess(data, loginForm.email);
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password handlers
  const handleForgotPasswordChange = (e) => {
    const { name, value } = e.target;
    setForgotPasswordForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await fetch(`${API_BASE_URL}/auth/password-reset-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotPasswordForm.email }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'An error occurred. Please try again.');
      
      setMessage(data.message || "OTP sent successfully!");
      setTimeout(() => switchMode("verifyOTP"), 2000);
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP handlers
  const handleVerifyOTPChange = (e) => {
    const { name, value } = e.target;
    setVerifyOTPForm(prev => ({ ...prev, [name]: value.replace(/\D/g, '').slice(0, 6) }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleVerifyOTPSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotPasswordForm.email, otp: verifyOTPForm.otp }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Invalid OTP. Please try again.');

      localStorage.setItem('resetToken', data.reset_token);
      switchMode("resetPassword");
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setErrors({});

    try {
      const response = await fetch(`${API_BASE_URL}/auth/password-reset-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotPasswordForm.email }),
      });

      if (!response.ok) throw new Error('Failed to resend OTP. Please try again.');
      setMessage("OTP has been resent to your email.");
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Reset Password handlers
  const handleResetPasswordChange = (e) => {
    const { name, value } = e.target;
    setResetPasswordForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    if (resetPasswordForm.password !== resetPasswordForm.confirmPassword) {
      setErrors({ submit: 'Passwords do not match' });
      setLoading(false);
      return;
    }

    if (resetPasswordForm.password.length < 6) {
      setErrors({ submit: 'Password must be at least 6 characters long' });
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
          new_password: resetPasswordForm.password,
          confirm_password: resetPasswordForm.confirmPassword
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Failed to reset password. Please try again.');

      setMessage('Password reset successfully!');
      setTimeout(() => {
        localStorage.removeItem('resetToken');
        switchMode("login");
      }, 2000);
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Register handlers
  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    if (name === "email") {
  validateEmailLive(value);
}

  };

  const validateRegisterForm = () => {
    const newErrors = {};
    if (!registerForm.username.trim()) {
      newErrors.username = "Username is required";
    } else if (registerForm.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }
    if (!registerForm.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(registerForm.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!registerForm.password) {
      newErrors.password = "Password is required";
    } else if (registerForm.password.length < 12) {
  newErrors.password = "Password must be at least 12 characters";
}

    if (registerForm.password !== registerForm.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAdminRegistrationForm = () => {
    const newErrors = {};
    if (!registerForm.username.trim()) {
      newErrors.username = "Username is required";
    } else if (registerForm.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }
    if (!registerForm.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(registerForm.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!registerForm.password) {
      newErrors.password = "Password is required";
    } else if (registerForm.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!registerForm.secretKey) {
      newErrors.secretKey = "Admin secret key is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRoleSelect = (role) => {
    setRegisterForm(prev => ({ ...prev, role }));
    if (role === "admin") {
      setCurrentStep("adminRegistration");
    } else {
      setCurrentStep("registration");
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!validateRegisterForm()) {
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
          username: registerForm.username,
          email: registerForm.email,
          password: registerForm.password,
          role: registerForm.role
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Registration failed");
      await handleLoginSuccess(data, registerForm.email);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!validateAdminRegistrationForm()) {
      setMessage("Please fix the errors below");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_BASE_URL}/auth/admin-register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: registerForm.username,
          email: registerForm.email,
          password: registerForm.password,
          role: "admin",
          secret_key: registerForm.secretKey
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Admin registration failed");
      await handleLoginSuccess(data, registerForm.email);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Admin Login handlers
  const handleAdminLoginChange = (e) => {
    const { name, value } = e.target;
    setAdminLoginForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const validateAdminLoginForm = () => {
    const newErrors = {};
    if (!adminLoginForm.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(adminLoginForm.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!adminLoginForm.password) newErrors.password = "Password is required";
    if (!adminLoginForm.secretKey) newErrors.secretKey = "Secret key is required for admin access";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdminLoginSubmit = async (e) => {
    e.preventDefault();
    if (!validateAdminLoginForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const res = await fetch(`${API_BASE_URL}/auth/admin-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: adminLoginForm.email,
          password: adminLoginForm.password,
          secret_key: adminLoginForm.secretKey
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Admin login failed");
      await handleLoginSuccess(data, adminLoginForm.email);
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

const handleLoginSuccess = async (data, email) => {
  const userRole = data.role;
  const userData = {
    token: data.access_token,
    role: userRole,
    username: data.username || registerForm.username,
    id: data.user_id,
    email: email,
    auth_provider: data.is_new_user ? "google" : "email"
  };
  
  // Store auth data
  localStorage.setItem("quickbox-user", JSON.stringify(userData));
  localStorage.setItem("access_token", data.access_token);
  localStorage.setItem("user", JSON.stringify({
    id: data.user_id,
    role: userRole,
    username: data.username || registerForm.username,
    email: email,
  }));

  // Update AuthContext
  if (login) login(userData);

  setMessage("Authentication successful! Redirecting...");
  
  // Simple redirect based on role - let ProtectedRoute handle profile check
  // This prevents the loop because ProtectedRoute will check profile status
  // and redirect to register if needed, but won't logout
  const redirectPath = `/${userRole}/dashboard`;
  
  setTimeout(() => {
    navigate(redirectPath);
  }, 1000);
};

  // Google Authentication
  const handleGoogleAuth = async (token, email, role) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, role }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Google authentication failed");
    await handleLoginSuccess(data, email);
  } catch (err) {
    console.error("Google auth error:", err);
    setErrors({ submit: err.message });
  } finally {
    setLoading(false);
  }
};

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      setErrors({});

      if (!credentialResponse.credential) {
        throw new Error("Google authentication failed: No credential received");
      }

      const decoded = jwt_decode(credentialResponse.credential);
      const email = decoded.email;
      const role = currentMode === "login" ? "brand" : (registerForm.role || "brand");

      await handleGoogleAuth(credentialResponse.credential, email, role);
    } catch (err) {
      console.error("Google auth error:", err);
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setErrors({ submit: "Google authentication failed. Please try again." });
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        setLoading(true);
        setErrors({});

        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${response.access_token}` }
        });
        const userInfo = await userInfoRes.json();

        if (!userInfo.email) {
          throw new Error("Unable to fetch user details from Google");
        }

        const role = currentMode === "login" ? "brand" : selectedGoogleRole || "brand";
        await handleGoogleAuth(response.access_token, userInfo.email, role);
      } catch (err) {
        console.error("Google login error:", err);
        setErrors({ submit: err.message });
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setErrors({ submit: "Google authentication failed. Please try again." });
    },
    flow: "implicit",
  });

  const handleModalGoogleLogin = () => {
    if (currentMode === "register") {
      setRegisterForm((prev) => ({ ...prev, role: selectedGoogleRole }));
    }
    googleLogin();
  };

  const goBack = () => {
    if (currentStep === "adminRegistration" || currentStep === "registration") {
      setCurrentStep("roleSelection");
      setRegisterForm(prev => ({ 
        ...prev, 
        username: "", 
        email: "", 
        password: "", 
        confirmPassword: "",
        secretKey: "",
        role: ""
      }));
    }
    setMessage("");
    setErrors({});
  };


  const isRegisterDisabled =
  emailStatus === "Email already registered" || checkingEmail;




    // Dynamic Background Video Based on Mode & Role
const getBackgroundVideo = () => {
  if (currentMode === "login") {
    return "/videos/login-bg.mp4";
  }

  if (currentMode === "register") {
    if (registerForm.role === "brand") {
      return "/videos/brand-register-bg.mp4";
    }
    if (registerForm.role === "influencer") {
      return "/videos/influencer-register-bg.mp4";
    }
  }

  return "/videos/login-bg.mp4"; // fallback
};


  const [currentVideo, setCurrentVideo] = useState(getBackgroundVideo());
  const [oldVideo, setOldVideo] = useState(getBackgroundVideo());
  const [bgFade, setBgFade] = useState({ old: 1, new: 0 });

useEffect(() => {
  const newVideo = getBackgroundVideo();

  if (newVideo !== currentVideo) {
    setOldVideo(currentVideo);
    setCurrentVideo(newVideo);

    // Fade transition
    setBgFade({ old: 1, new: 0 });
    setTimeout(() => setBgFade({ old: 0, new: 1 }), 50);
  }
}, [currentMode, registerForm.role]);





  return (
    <div style={styles.container}>

      {/* Background Video */}
<div style={styles.backgroundWrapper}>
  {/* Old background */}
  <video
    autoPlay
    loop
    muted
    playsInline
    style={{ ...styles.videoBackground, opacity: bgFade.old }}
  >
    <source src={oldVideo} type="video/mp4" />
  </video>

  {/* New background */}
  <video
    autoPlay
    loop
    muted
    playsInline
    style={{ ...styles.videoBackground, opacity: bgFade.new }}
    key={currentVideo}
  >
    <source src={currentVideo} type="video/mp4" />
  </video>
</div>



    {/* <div style={styles.rippleBackground}>
  <div style={{ ...styles.circleBase, ...styles.sizes.xxlarge, ...styles.shades.shade1 }} />
  <div style={{ ...styles.circleBase, ...styles.sizes.xlarge, ...styles.shades.shade2 }} />
  <div style={{ ...styles.circleBase, ...styles.sizes.large, ...styles.shades.shade3 }} />
  <div style={{ ...styles.circleBase, ...styles.sizes.medium, ...styles.shades.shade4 }} />
  <div style={{ ...styles.circleBase, ...styles.sizes.small, ...styles.shades.shade5 }} />
</div> */}




      {/* Home Button */}
      {/* Mobile Home Button */}
<div className="mobile-only">
  <button
    onClick={() => navigate("/")}
    style={styles.homeButton}
  >
    <FontAwesomeIcon icon={faHome} style={{ fontSize: "16px" }} />
  </button>
</div>

{/* Desktop Top Navigation */}
<div className="desktop-only">
  <TopNav />
</div>


      {/* Admin Login Button */}
      {/* <button
        onClick={toggleAdminLogin}
        style={styles.adminButton}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
      >
        <FontAwesomeIcon icon={faUserShield} style={{ fontSize: "14px" }} />
      </button> */}

      {/* Main Auth Card */}
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoContainer}>
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" style={styles.logo} />
          ) : (
            <div style={styles.logoFallback}>Brio</div>
          )}
        </div>

        {/* Login Form */}
        {currentMode === "login" && (
          <>
            <h1 style={styles.title}>Welcome back</h1>
            <form onSubmit={handleLoginSubmit} style={styles.form}>
              <div style={styles.inputGroup}>
                
<input
  type="email"
  name="email"
  placeholder="Email address"
  value={loginForm.email}
  onChange={(e) => handleEmailLiveCheck(e.target.value, "login")}
  style={{ ...styles.input, ...(errors.email ? styles.inputError : {}) }}
/>

                {/* {errors.email && <span style={styles.error}>{errors.email}</span>} */}
                {/* {emailStatus && (
  <span
    style={{
      fontSize: "13px",
      color: emailStatus === "Valid email" ? "#059669" : "#dc2626",
    }}
  >
    {emailStatus}
  </span>
)}
 */}
{emailStatus && (
  <small
    style={{
      fontSize: "13px",
      fontWeight: 500,
      color:
        emailStatus === "Email available" || emailStatus === "Email found"
          ? "#16a34a"   // Green
          : emailStatus === "Email already registered"
          ? "#f97316"   // Orange
          : "#dc2626",  // Red
    }}
  >
    {checkingEmail ? "Checking email..." : emailStatus}
  </small>
)}






              </div>

              <div style={styles.inputGroup}>
                <div style={styles.passwordWrapper}>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={loginForm.password}
                    onChange={handleLoginChange}
                    style={{...styles.input, ...(errors.password ? styles.inputError : {})}}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.passwordToggle}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.password && <span style={styles.error}>{errors.password}</span>}
              </div>

              <button type="submit" disabled={loading || isRegisterDisabled} style={styles.submitButton}>
                {loading ? "Signing in..." : "Continue"}
              </button>

              <button 
                type="button" 
                onClick={() => switchMode("forgotPassword")}
                style={styles.forgotPassword}
              >
                Forgot password?
              </button>
            </form>

            <div style={styles.divider}>
              <span style={styles.dividerText}>OR</span>
            </div>

            <div style={styles.googleContainer}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                size="large"
                text="continue_with"
                shape="rectangular"
                width="100%"
              />
            </div>

            <p style={styles.switchText}>
              Don't have an account?{" "}
              <button onClick={() => switchMode("register")} style={styles.switchButton}>
                Sign up
              </button>
            </p>
          </>
        )}

        {/* Register - Role Selection */}
        {currentMode === "register" && currentStep === "roleSelection" && (
          <>
            <h1 style={styles.title}>Create your account</h1>
            <p style={styles.subtitle}>Choose your account type</p>

            <div style={styles.roleGrid}>
              <button
                onClick={() => handleRoleSelect("brand")}
                style={styles.roleCard}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#10b981'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              >
                <div style={styles.roleIcon}>🏢</div>
                <h3 style={styles.roleTitle}>Brand</h3>
                <p style={styles.roleDesc}>For businesses & marketers</p>
              </button>

              <button
                onClick={() => handleRoleSelect("influencer")}
                style={styles.roleCard}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#10b981'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              >
                <div style={styles.roleIcon}>🌟</div>
                <h3 style={styles.roleTitle}>Influencer</h3>
                <p style={styles.roleDesc}>For content creators</p>
              </button>
            </div>

            {/* <button
              onClick={() => handleRoleSelect("admin")}
              style={styles.adminLink}
            >
              Admin registration
            </button> */}

            <p style={styles.switchText}>
              Already have an account?{" "}
              <button onClick={() => switchMode("login")} style={styles.switchButton}>
                Log in
              </button>
            </p>
          </>
        )}

        {/* Register - Form */}
        {currentMode === "register" && (currentStep === "registration" || currentStep === "adminRegistration") && (
          <>
            <button onClick={goBack} style={styles.backButton}>
              <FontAwesomeIcon icon={faArrowLeft} style={{ marginRight: "8px" }} />
              Back
            </button>

            <h1 style={styles.title}>
              {currentStep === "adminRegistration" ? "Admin Registration" : "Create account"}
            </h1>
            <p style={styles.subtitle}>
              {registerForm.role === "brand" && "Brand Account"}
              {registerForm.role === "influencer" && "Influencer Account"}
              {registerForm.role === "admin" && "Admin Account"}
            </p>

            <form onSubmit={currentStep === "adminRegistration" ? handleAdminRegisterSubmit : handleRegisterSubmit} style={styles.form}>
              <div style={styles.inputGroup}>
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={registerForm.username}
                  onChange={handleRegisterChange}
                  style={{...styles.input, ...(errors.username ? styles.inputError : {})}}
                />
                {errors.username && <span style={styles.error}>{errors.username}</span>}
              </div>

              <div style={styles.inputGroup}>
                <input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  value={registerForm.email}
                  // onChange={handleRegisterChange}
                  onChange={(e) => handleEmailLiveCheck(e.target.value, "register")}
                  style={{...styles.input, ...(errors.email ? styles.inputError : {})}}
                />
                {errors.email && <span style={styles.error}>{errors.email}</span>}
{emailStatus && (
  <small
    style={{
      fontSize: "13px",
      fontWeight: 500,
      color:
        emailStatus === "Email available" || emailStatus === "Email found"
          ? "#16a34a"   // Green
          : emailStatus === "Email already registered"
          ? "#f97316"   // Orange
          : "#dc2626",  // Red
    }}
  >
    {checkingEmail ? "Checking email..." : emailStatus}
  </small>
)}



              </div>

              <div style={styles.inputGroup}>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={registerForm.password}
                  onChange={handleRegisterChange}
                  style={{...styles.input, ...(errors.password ? styles.inputError : {})}}
                />
                {errors.password && <span style={styles.error}>{errors.password}</span>}
              </div>

              <div style={styles.inputGroup}>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm password"
                  value={registerForm.confirmPassword}
                  onChange={handleRegisterChange}
                  style={{...styles.input, ...(errors.confirmPassword ? styles.inputError : {})}}
                />
                {errors.confirmPassword && <span style={styles.error}>{errors.confirmPassword}</span>}
              </div>

              {currentStep === "adminRegistration" && (
                <div style={styles.inputGroup}>
                  <input
                    type="password"
                    name="secretKey"
                    placeholder="Admin secret key"
                    value={registerForm.secretKey}
                    onChange={handleRegisterChange}
                    style={{...styles.input, ...(errors.secretKey ? styles.inputError : {})}}
                  />
                  {errors.secretKey && <span style={styles.error}>{errors.secretKey}</span>}
                </div>
              )}

              <button type="submit" disabled={loading} style={styles.submitButton}>
                {loading ? "Creating account..." : "Continue"}
              </button>
            </form>

            {currentStep === "registration" && (
              <>
                <div style={styles.divider}>
                  <span style={styles.dividerText}>OR</span>
                </div>

                <div style={styles.googleContainer}>
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    theme="outline"
                    size="large"
                    text="signup_with"
                    shape="rectangular"
                    width="100%"
                  />
                </div>
              </>
            )}
          </>
        )}

        {/* Forgot Password */}
        {currentMode === "forgotPassword" && (
          <>
            <h1 style={styles.title}>Reset your password</h1>
            <p style={styles.subtitle}>Enter your email to receive a reset code</p>

            <form onSubmit={handleForgotPasswordSubmit} style={styles.form}>
              <div style={styles.inputGroup}>
                <input
  type="email"
  name="email"
  value={forgotPasswordForm.email}
  onChange={(e) => {
    setForgotPasswordForm({ email: e.target.value });
    handleEmailLiveCheck(e.target.value, "login");
  }}
  style={{ ...styles.input, ...(errors.email ? styles.inputError : {}) }}
/>

                {errors.email && <span style={styles.error}>{errors.email}</span>}
              </div>

              <button type="submit" disabled={loading} style={styles.submitButton}>
                {loading ? "Sending..." : "Send reset code"}
              </button>

              <button 
                type="button" 
                onClick={() => switchMode("login")}
                style={styles.backToLogin}
              >
                Back to login
              </button>
            </form>
          </>
        )}

        {/* Verify OTP */}
        {currentMode === "verifyOTP" && (
          <>
            <h1 style={styles.title}>Enter verification code</h1>
            <p style={styles.subtitle}>We sent a code to {forgotPasswordForm.email}</p>

            <form onSubmit={handleVerifyOTPSubmit} style={styles.form}>
              <div style={styles.inputGroup}>
                <input
                  type="text"
                  name="otp"
                  placeholder="6-digit code"
                  value={verifyOTPForm.otp}
                  onChange={handleVerifyOTPChange}
                  maxLength={6}
                  style={{...styles.input, ...(errors.otp ? styles.inputError : {}), textAlign: 'center', fontSize: '20px', letterSpacing: '8px'}}
                />
                {errors.otp && <span style={styles.error}>{errors.otp}</span>}
              </div>

              <button type="submit" disabled={loading || verifyOTPForm.otp.length !== 6} style={styles.submitButton}>
                {loading ? "Verifying..." : "Verify code"}
              </button>

              <button 
                type="button" 
                onClick={handleResendOTP}
                disabled={loading}
                style={styles.resendButton}
              >
                Resend code
              </button>
            </form>
          </>
        )}

        {/* Reset Password */}
        {currentMode === "resetPassword" && (
          <>
            <h1 style={styles.title}>Create new password</h1>
            <p style={styles.subtitle}>Enter your new password below</p>

            <form onSubmit={handleResetPasswordSubmit} style={styles.form}>
              <div style={styles.inputGroup}>
                <div style={styles.passwordWrapper}>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="New password"
                    value={resetPasswordForm.password}
                    onChange={handleResetPasswordChange}
                    style={{...styles.input, ...(errors.password ? styles.inputError : {})}}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.passwordToggle}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.password && <span style={styles.error}>{errors.password}</span>}
              </div>

              <div style={styles.inputGroup}>
                <div style={styles.passwordWrapper}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm password"
                    value={resetPasswordForm.confirmPassword}
                    onChange={handleResetPasswordChange}
                    style={{...styles.input, ...(errors.confirmPassword ? styles.inputError : {})}}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.passwordToggle}
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.confirmPassword && <span style={styles.error}>{errors.confirmPassword}</span>}
              </div>

              <button type="submit" disabled={loading} style={styles.submitButton}>
                {loading ? "Resetting..." : "Reset password"}
              </button>
            </form>
          </>
        )}

        {/* Error/Success Messages */}
        {/* Floating Alert */}
{(message || errors.submit) && (
  <div
    style={{
      position: "fixed",
      top: "24px",
      left: "50%",
      transform: "translateX(-50%)",
      padding: "14px 26px",
      borderRadius: "12px",
      fontSize: "15px",
      fontWeight: "600",
      zIndex: 9999,
      minWidth: "320px",
      maxWidth: "90%",
      textAlign: "center",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
      background: (() => {
        const text = (message || "").toLowerCase();
        const isSuccess =
          text.includes("success") ||
          text.includes("sent") ||
          text.includes("complete") ||
          text.includes("redirecting") ||
          text.includes("verified") ||
          text.includes("created") ||
          text.includes("welcome");

        return isSuccess
          ? "linear-gradient(135deg, #16a34a, #22c55e)"
          : "linear-gradient(135deg, #dc2626, #ef4444)";
      })(),
      color: "white",
      animation: "alertSlideDown 0.4s ease",
    }}
  >
    {message || errors.submit}
  </div>
)}

      </div>

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div style={styles.modalOverlay} onClick={toggleAdminLogin}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button onClick={toggleAdminLogin} style={styles.modalClose}>×</button>
            
            <div style={styles.modalHeader}>
              <FontAwesomeIcon icon={faLock} style={{ fontSize: "24px", color: "#6366f1" }} />
              <h2 style={styles.modalTitle}>Admin Login</h2>
            </div>

            <form onSubmit={handleAdminLoginSubmit} style={styles.form}>
              <div style={styles.inputGroup}>
                <input
                  type="email"
                  name="email"
                  placeholder="Admin email"
                  value={adminLoginForm.email}
                  onChange={handleAdminLoginChange}
                  style={{...styles.input, ...(errors.email ? styles.inputError : {})}}
                />
                {errors.email && <span style={styles.error}>{errors.email}</span>}
              </div>

              <div style={styles.inputGroup}>
                <div style={styles.passwordWrapper}>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={adminLoginForm.password}
                    onChange={handleAdminLoginChange}
                    style={{...styles.input, ...(errors.password ? styles.inputError : {})}}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.passwordToggle}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.password && <span style={styles.error}>{errors.password}</span>}
              </div>

              <div style={styles.inputGroup}>
                <input
                  type="password"
                  name="secretKey"
                  placeholder="Secret key"
                  value={adminLoginForm.secretKey}
                  onChange={handleAdminLoginChange}
                  style={{...styles.input, ...(errors.secretKey ? styles.inputError : {})}}
                />
                {errors.secretKey && <span style={styles.error}>{errors.secretKey}</span>}
              </div>

              <button type="submit" disabled={loading} style={styles.submitButton}>
                {loading ? "Signing in..." : "Admin Login"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

 {/* Responsive CSS */}
      <style>
        {`
          @keyframes alertSlideDown {
            from {
              opacity: 0;
              transform: translate(-50%, -20px);
            }
            to {
              opacity: 1;
              transform: translate(-50%, 0);
            }
          }
          
          @media (max-width: 768px) {
            .desktop-only {
              display: none !important;
            }
            .mobile-only {
              display: block;
            }
          }
          
          @media (min-width: 769px) {
            .mobile-only {
              display: none !important;
            }
            .desktop-only {
              display: block;
            }
          }
        `}
      </style>


const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end', 
    position: 'relative',
    overflow: 'hidden',
    background: 'transparent',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    width: '100%',
    boxSizing: 'border-box',
  },
  
  backgroundWrapper: {
    position: "absolute",
    inset: 0,
    overflow: "hidden",
    zIndex: -1,
    width: '100%',
    height: '100%',
  },
  
  videoBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "opacity 1.2s ease-in-out",
    filter: "blur(1px) brightness(0.85)",
  },
  
  mobileHomeButtonContainer: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 20,
  },
  
  desktopNavContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  
  homeButton: {
    width: '44px',
    height: '44px',
    position: 'fixed',
  top: '20px',
  right: '20px',
    borderRadius: '50%',
    backgroundImage: 'linear-gradient(135deg, #0f6eea, #0f6eea)',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    transition: 'all 0.2s',
    zIndex: 20,
  },
  
  adminButton: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    backgroundColor: '#0f6eeaff',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'all 0.2s',
    zIndex: 20,  
  },
  
  card: {
    position: 'relative',
    zIndex: 10,
    width: '100%',
    maxWidth: '350px',
    padding: '40px 32px',
    backgroundColor: '#e5e7ebae',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.74)',
    border: '1px solid #e5e7eb',
    boxSizing: 'border-box',
    margin: '0', // Changed from '0 auto'
    marginRight: '40px',
    
  },
  
  logoContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '32px',
  },
  
  logo: {
    width: '64px',
    height: '64px',
    objectFit: 'contain',
    maxWidth: '100%',
  },
  
  logoFallback: {
    width: '64px',
    height: '64px',
    borderRadius: '12px',
    backgroundColor: 'rgba(15, 110, 234, 0)',
    color: '#0f6eeaff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: 'bold',
  },
  
  title: {
    fontSize: '28px',
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: '8px',
    lineHeight: '1.2',
  },
  
  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: '28px',
    lineHeight: '1.4',
  },
  
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '100%',
  },
  
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    width: '100%',
  },
  
  input: {
    width: '100%',
    padding: '12px 14px',
    fontSize: '15px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    outline: 'none',
    transition: 'all 0.2s',
    backgroundColor: 'white',
    color: '#111827',
    boxSizing: 'border-box',
  },
  
  inputError: {
    borderColor: '#ef4444',
  },
  
  passwordWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  
  passwordToggle: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    color: '#6b7280',
    fontSize: '13px',
    cursor: 'pointer',
    padding: '4px 8px',
    fontWeight: '500',
  },
  
  error: {
    fontSize: '13px',
    color: '#ef4444',
    lineHeight: '1.2',
  },
  
  submitButton: {
    width: '100%',
    padding: '12px',
    fontSize: '15px',
    fontWeight: '500',
    color: 'white',
    backgroundImage: 'linear-gradient(135deg, #0f6eeaff, #0f6eeaff)',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginTop: '8px',
    boxSizing: 'border-box',
  },
  
  forgotPassword: {
    background: 'none',
    border: 'none',
    color: '#0f6eeaff',
    fontSize: '14px',
    cursor: 'pointer',
    padding: '8px 0',
    textAlign: 'center',
    fontWeight: '500',
    width: '100%',
  },
  
  backToLogin: {
    background: 'none',
    border: 'none',
    color: '#6b7280',
    fontSize: '14px',
    cursor: 'pointer',
    padding: '8px 0',
    textAlign: 'center',
    marginTop: '8px',
    width: '100%',
  },
  
  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '24px 0',
    position: 'relative',
    width: '100%',
  },
  
  dividerText: {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '0 12px',
    fontSize: '13px',
    color: '#6b7280',
    fontWeight: '500',
    backgroundColor: '#e5e7eb00',
  },
  
  googleContainer: {
    marginBottom: '24px',
    width: '100%',
  },
  
  switchText: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#6b7280',
    marginTop: '24px',
    lineHeight: '1.4',
    width: '100%',
  },
  
  switchButton: {
    background: 'none',
    border: 'none',
    color: '#0f6eeaff',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    padding: 0,
  },
  
  roleGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginBottom: '24px',
    width: '100%',
  },
  
  roleCard: {
    padding: '24px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    backgroundColor: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'center',
    width: '100%',
    boxSizing: 'border-box',
  },
  
  roleIcon: {
    fontSize: '32px',
    marginBottom: '12px',
  },
  
  roleTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '6px',
    lineHeight: '1.2',
  },
  
  roleDesc: {
    fontSize: '12px',
    color: '#6b7280',
    lineHeight: '1.4',
  },
  
  adminLink: {
    background: 'none',
    border: 'none',
    color: '#0f6eeaff',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    padding: '8px 0',
    textAlign: 'center',
    marginBottom: '16px',
    width: '100%',
  },
  
  backButton: {
    display: 'flex',
    alignItems: 'center',
    background: 'none',
    border: 'none',
    color: '#3f3f40',
    fontSize: '14px',
    cursor: 'pointer',
    padding: '8px 0',
    marginBottom: '20px',
    fontWeight: '500',
    width: '100%',
  },
  
  resendButton: {
    width: '100%',
    padding: '10px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#1c1c1d',
    backgroundColor: 'transparent',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxSizing: 'border-box',
  },
  
  message: {
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    textAlign: 'center',
    marginTop: '16px',
    fontWeight: '500',
    width: '100%',
    boxSizing: 'border-box',
  },
  
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    padding: '20px',
    boxSizing: 'border-box',
  },
  
  modal: {
    width: '100%',
    maxWidth: '400px',
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '32px',
    position: 'relative',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    boxSizing: 'border-box',
  },
  
  modalClose: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    background: 'none',
    border: 'none',
    fontSize: '28px',
    color: '#6b7280',
    cursor: 'pointer',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    transition: 'all 0.2s',
  },
  
  modalHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '28px',
  },
  
  modalTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
    lineHeight: '1.2',
  },
  
  // Responsive Media Queries
  '@media (max-width: 480px)': {
    card: {
      padding: '30px 20px',
      maxWidth: '100%',
      margin: '0 10px',
    },
    
    title: {
      fontSize: '24px',
    },
    
    roleGrid: {
      gridTemplateColumns: '1fr',
      gap: '10px',
    },
    
    roleCard: {
      padding: '20px 12px',
    },
    
    homeButton: {
      width: '40px',
      height: '40px',
      top: '15px',
      right: '15px',
    },
  },
  
  '@media (max-width: 768px)': {
    container: {
      padding: '10px',
      justifyContent: 'center',
      alignItems: 'center',
    },
    
    card: {
      marginRight: '0',
      marginTop: '60px', // Space for home button
    },
    
    title: {
      fontSize: '26px',
    },
  },
  
  '@media (min-width: 769px) and (max-width: 1024px)': {
    container: {
      padding: '30px',
    },
    
    card: {
      maxWidth: '400px',
    },
  },
  
  '@media (min-width: 1025px)': {
    card: {
      maxWidth: '400px',
    },
  },
};

export default AuthContainer;



// import React, { useState, useEffect, useCallback, useContext } from "react";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import { AuthContext } from "../context/AuthContext";
// import { GoogleLogin, useGoogleLogin } from '@react-oauth/google';
// import jwt_decode from 'jwt-decode';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faUserShield, faLock, faHome, faArrowLeft, faCheck, faCircle } from '@fortawesome/free-solid-svg-icons';
// import API_BASE_URL from "../config/api";

// function AuthContainer() {
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
//   const roleFromUrl = searchParams.get('role');
//   const { login } = useContext(AuthContext);
//   const [currentMode, setCurrentMode] = useState("login");
//   const [loading, setLoading] = useState(false);
//   const [logoUrl, setLogoUrl] = useState("");
//   const [showAdminLogin, setShowAdminLogin] = useState(false);
//   const [selectedGoogleRole, setSelectedGoogleRole] = useState("brand");

//   // Form states
//   const [loginForm, setLoginForm] = useState({ email: "", password: "" });
//   const [registerForm, setRegisterForm] = useState({
//     username: "", email: "", password: "", confirmPassword: "", role: "", secretKey: ""
//   });
//   const [forgotPasswordForm, setForgotPasswordForm] = useState({ email: "" });
//   const [verifyOTPForm, setVerifyOTPForm] = useState({ otp: "" });
//   const [resetPasswordForm, setResetPasswordForm] = useState({ password: "", confirmPassword: "" });
//   const [adminLoginForm, setAdminLoginForm] = useState({ email: "", password: "", secretKey: "" });

//   const [errors, setErrors] = useState({});
//   const [message, setMessage] = useState("");
//   const [currentStep, setCurrentStep] = useState("roleSelection");
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [passwordStrength, setPasswordStrength] = useState({
//     hasMinLength: false,
//     hasUpperCase: false,
//     hasLowerCase: false,
//     hasNumber: false,
//     hasSpecialChar: false
//   });

//   // Fetch dynamic logo
//   const fetchLogo = useCallback(async () => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/api/logo/current`, { headers: {} });
//       if (res.ok) {
//         const blob = await res.blob();
//         setLogoUrl(URL.createObjectURL(blob));
//       } else {
//         setLogoUrl("");
//       }
//     } catch (err) {
//       console.error("Failed to fetch logo:", err);
//       setLogoUrl("");
//     }
//   }, []);

//   useEffect(() => {
//     fetchLogo();
//   }, [fetchLogo]);

//   useEffect(() => {
//     if (roleFromUrl && (roleFromUrl === 'influencer' || roleFromUrl === 'brand')) {
//       setCurrentMode("register");
//       setCurrentStep("roleSelection");
//       setTimeout(() => {
//         handleRoleSelect(roleFromUrl);
//       }, 100);
//     }
//   }, [roleFromUrl]);

//   const switchMode = (mode) => {
//     setCurrentMode(mode);
//     setErrors({});
//     setMessage("");
//     setShowAdminLogin(false);
//     setPasswordStrength({
//       hasMinLength: false,
//       hasUpperCase: false,
//       hasLowerCase: false,
//       hasNumber: false,
//       hasSpecialChar: false
//     });
//     if (mode === "register") {
//       setCurrentStep("roleSelection");
//     }
//   };

//   const toggleAdminLogin = () => {
//     setShowAdminLogin(!showAdminLogin);
//     setErrors({});
//     setMessage("");
//   };

//   // Login handlers
//   const handleLoginChange = (e) => {
//     const { name, value } = e.target;
//     setLoginForm(prev => ({ ...prev, [name]: value }));
//     if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
//   };

//   const validateLoginForm = () => {
//     const newErrors = {};
//     if (!loginForm.email.trim()) {
//       newErrors.email = "Email is required";
//     } else if (!/\S+@\S+\.\S+/.test(loginForm.email)) {
//       newErrors.email = "Please enter a valid email address";
//     }
//     if (!loginForm.password) newErrors.password = "Password is required";
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleLoginSubmit = async (e) => {
//     e.preventDefault();
//     if (!validateLoginForm()) return;

//     setLoading(true);
//     setErrors({});

//     try {
//       const res = await fetch(`${API_BASE_URL}/auth/login`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(loginForm),
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.detail || "Login failed");
//       await handleLoginSuccess(data, loginForm.email);
//     } catch (err) {
//       setErrors({ submit: err.message });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Forgot Password handlers
//   const handleForgotPasswordChange = (e) => {
//     const { name, value } = e.target;
//     setForgotPasswordForm(prev => ({ ...prev, [name]: value }));
//     if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
//   };

//   const handleForgotPasswordSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setErrors({});

//     try {
//       const response = await fetch(`${API_BASE_URL}/auth/password-reset-request`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email: forgotPasswordForm.email }),
//       });

//       const data = await response.json();
//       if (!response.ok) throw new Error(data.detail || 'An error occurred. Please try again.');
      
//       setMessage(data.message || "OTP sent successfully!");
//       setTimeout(() => switchMode("verifyOTP"), 2000);
//     } catch (err) {
//       setErrors({ submit: err.message });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Verify OTP handlers
//   const handleVerifyOTPChange = (e) => {
//     const { name, value } = e.target;
//     setVerifyOTPForm(prev => ({ ...prev, [name]: value.replace(/\D/g, '').slice(0, 6) }));
//     if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
//   };

//   const handleVerifyOTPSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setErrors({});

//     try {
//       const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email: forgotPasswordForm.email, otp: verifyOTPForm.otp }),
//       });

//       const data = await response.json();
//       if (!response.ok) throw new Error(data.detail || 'Invalid OTP. Please try again.');

//       localStorage.setItem('resetToken', data.reset_token);
//       switchMode("resetPassword");
//     } catch (err) {
//       setErrors({ submit: err.message });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleResendOTP = async () => {
//     setLoading(true);
//     setErrors({});

//     try {
//       const response = await fetch(`${API_BASE_URL}/auth/password-reset-request`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email: forgotPasswordForm.email }),
//       });

//       if (!response.ok) throw new Error('Failed to resend OTP. Please try again.');
//       setMessage("OTP has been resent to your email.");
//     } catch (err) {
//       setErrors({ submit: err.message });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Reset Password handlers
//   const handleResetPasswordChange = (e) => {
//     const { name, value } = e.target;
//     setResetPasswordForm(prev => ({ ...prev, [name]: value }));
//     if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    
//     if (name === "password") {
//       setPasswordStrength({
//         hasMinLength: value.length >= 8,
//         hasUpperCase: /[A-Z]/.test(value),
//         hasLowerCase: /[a-z]/.test(value),
//         hasNumber: /[0-9]/.test(value),
//         hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(value)
//       });
//     }
//   };

//   const handleResetPasswordSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setErrors({});

//     if (resetPasswordForm.password !== resetPasswordForm.confirmPassword) {
//       setErrors({ submit: 'Passwords do not match' });
//       setLoading(false);
//       return;
//     }

//     if (resetPasswordForm.password.length < 8) {
//       setErrors({ submit: 'Password must be at least 8 characters long' });
//       setLoading(false);
//       return;
//     }

//     try {
//       const resetToken = localStorage.getItem('resetToken');
//       const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${resetToken}`
//         },
//         body: JSON.stringify({
//           new_password: resetPasswordForm.password,
//           confirm_password: resetPasswordForm.confirmPassword
//         }),
//       });

//       const data = await response.json();
//       if (!response.ok) throw new Error(data.detail || 'Failed to reset password. Please try again.');

//       setMessage('Password reset successfully!');
//       setTimeout(() => {
//         localStorage.removeItem('resetToken');
//         switchMode("login");
//       }, 2000);
//     } catch (err) {
//       setErrors({ submit: err.message });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Register handlers
//   const handleRegisterChange = (e) => {
//     const { name, value } = e.target;
//     setRegisterForm(prev => ({ ...prev, [name]: value }));
//     if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    
//     if (name === "password") {
//       setPasswordStrength({
//         hasMinLength: value.length >= 8,
//         hasUpperCase: /[A-Z]/.test(value),
//         hasLowerCase: /[a-z]/.test(value),
//         hasNumber: /[0-9]/.test(value),
//         hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(value)
//       });
//     }
//   };

//   const validateRegisterForm = () => {
//     const newErrors = {};
//     if (!registerForm.username.trim()) {
//       newErrors.username = "Username is required";
//     } else if (registerForm.username.length < 3) {
//       newErrors.username = "Username must be at least 3 characters";
//     }
//     if (!registerForm.email.trim()) {
//       newErrors.email = "Email is required";
//     } else if (!/\S+@\S+\.\S+/.test(registerForm.email)) {
//       newErrors.email = "Email is invalid";
//     }
//     if (!registerForm.password) {
//       newErrors.password = "Password is required";
//     } else if (registerForm.password.length < 8) {
//       newErrors.password = "Password must be at least 8 characters";
//     }
//     if (registerForm.password !== registerForm.confirmPassword) {
//       newErrors.confirmPassword = "Passwords do not match";
//     }
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const validateAdminRegistrationForm = () => {
//     const newErrors = {};
//     if (!registerForm.username.trim()) {
//       newErrors.username = "Username is required";
//     } else if (registerForm.username.length < 3) {
//       newErrors.username = "Username must be at least 3 characters";
//     }
//     if (!registerForm.email.trim()) {
//       newErrors.email = "Email is required";
//     } else if (!/\S+@\S+\.\S+/.test(registerForm.email)) {
//       newErrors.email = "Email is invalid";
//     }
//     if (!registerForm.password) {
//       newErrors.password = "Password is required";
//     } else if (registerForm.password.length < 8) {
//       newErrors.password = "Password must be at least 8 characters";
//     }
//     if (registerForm.password !== registerForm.confirmPassword) {
//       newErrors.confirmPassword = "Passwords do not match";
//     }
//     if (!registerForm.secretKey) {
//       newErrors.secretKey = "Admin secret key is required";
//     }
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleRoleSelect = (role) => {
//     setRegisterForm(prev => ({ ...prev, role }));
//     if (role === "admin") {
//       setCurrentStep("adminRegistration");
//     } else {
//       setCurrentStep("registration");
//     }
//   };

//   const handleRegisterSubmit = async (e) => {
//     e.preventDefault();
//     if (!validateRegisterForm()) {
//       setMessage("Please fix the errors below");
//       return;
//     }

//     setLoading(true);
//     setMessage("");

//     try {
//       const res = await fetch(`${API_BASE_URL}/auth/register`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           username: registerForm.username,
//           email: registerForm.email,
//           password: registerForm.password,
//           role: registerForm.role
//         }),
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.detail || "Registration failed");
//       await handleLoginSuccess(data, registerForm.email);
//     } catch (err) {
//       setMessage(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAdminRegisterSubmit = async (e) => {
//     e.preventDefault();
//     if (!validateAdminRegistrationForm()) {
//       setMessage("Please fix the errors below");
//       return;
//     }

//     setLoading(true);
//     setMessage("");

//     try {
//       const res = await fetch(`${API_BASE_URL}/auth/admin-register`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           username: registerForm.username,
//           email: registerForm.email,
//           password: registerForm.password,
//           role: "admin",
//           secret_key: registerForm.secretKey
//         }),
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.detail || "Admin registration failed");
//       await handleLoginSuccess(data, registerForm.email);
//     } catch (err) {
//       setMessage(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Admin Login handlers
//   const handleAdminLoginChange = (e) => {
//     const { name, value } = e.target;
//     setAdminLoginForm(prev => ({ ...prev, [name]: value }));
//     if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
//   };

//   const validateAdminLoginForm = () => {
//     const newErrors = {};
//     if (!adminLoginForm.email.trim()) {
//       newErrors.email = "Email is required";
//     } else if (!/\S+@\S+\.\S+/.test(adminLoginForm.email)) {
//       newErrors.email = "Please enter a valid email address";
//     }
//     if (!adminLoginForm.password) newErrors.password = "Password is required";
//     if (!adminLoginForm.secretKey) newErrors.secretKey = "Secret key is required for admin access";
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleAdminLoginSubmit = async (e) => {
//     e.preventDefault();
//     if (!validateAdminLoginForm()) return;

//     setLoading(true);
//     setErrors({});

//     try {
//       const res = await fetch(`${API_BASE_URL}/auth/admin-login`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           email: adminLoginForm.email,
//           password: adminLoginForm.password,
//           secret_key: adminLoginForm.secretKey
//         }),
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.detail || "Admin login failed");
//       await handleLoginSuccess(data, adminLoginForm.email);
//     } catch (err) {
//       setErrors({ submit: err.message });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLoginSuccess = async (data, email) => {
//     const userRole = data.role || registerForm.role;
//     const userData = {
//       token: data.access_token,
//       role: userRole,
//       username: data.username || registerForm.username,
//       user_id: data.user_id,
//       email: email,
//       auth_provider: data.is_new_user ? "google" : "email"
//     };
    
//     localStorage.setItem("quickbox-user", JSON.stringify(userData));
//     localStorage.setItem("access_token", data.access_token);
//     localStorage.setItem("user", JSON.stringify({
//       id: data.user_id,
//       role: userRole,
//       username: data.username || registerForm.username,
//       email: email,
//       auth_provider: data.is_new_user ? "google" : "email"
//     }));

//     if (login) login(userData);

//     setMessage("Authentication successful! Redirecting...");
//     setTimeout(() => {
//       switch (userRole.toLowerCase()) {
//         case "admin": 
//           navigate("/admin"); 
//           window.location.reload();
//           break;
//         case "brand": 
//           navigate("/brand"); 
//           window.location.reload();
//           break;
//         case "influencer": 
//           navigate("/influencer"); 
//           window.location.reload();
//           break;
//         default: 
//           navigate("/");
//       }
//     }, 1500);
//   };

//   // Google Authentication
//   const handleGoogleAuth = async (token, email, role) => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/auth/google`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ token, role }),
//       });

//       const data = await response.json();
//       if (!response.ok) throw new Error(data.detail || "Google authentication failed");
//       await handleLoginSuccess(data, email);
//     } catch (err) {
//       console.error("Google auth error:", err);
//       setErrors({ submit: err.message });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleGoogleSuccess = async (credentialResponse) => {
//     try {
//       setLoading(true);
//       setErrors({});

//       if (!credentialResponse.credential) {
//         throw new Error("Google authentication failed: No credential received");
//       }

//       const decoded = jwt_decode(credentialResponse.credential);
//       const email = decoded.email;
//       const role = currentMode === "login" ? "brand" : (registerForm.role || "brand");

//       await handleGoogleAuth(credentialResponse.credential, email, role);
//     } catch (err) {
//       console.error("Google auth error:", err);
//       setErrors({ submit: err.message });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleGoogleError = () => {
//     setErrors({ submit: "Google authentication failed. Please try again." });
//   };

//   const googleLogin = useGoogleLogin({
//     onSuccess: async (response) => {
//       try {
//         setLoading(true);
//         setErrors({});

//         const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
//           headers: { Authorization: `Bearer ${response.access_token}` }
//         });
//         const userInfo = await userInfoRes.json();

//         if (!userInfo.email) {
//           throw new Error("Unable to fetch user details from Google");
//         }

//         const role = currentMode === "login" ? "brand" : selectedGoogleRole || "brand";
//         await handleGoogleAuth(response.access_token, userInfo.email, role);
//       } catch (err) {
//         console.error("Google login error:", err);
//         setErrors({ submit: err.message });
//       } finally {
//         setLoading(false);
//       }
//     },
//     onError: () => {
//       setErrors({ submit: "Google authentication failed. Please try again." });
//     },
//     flow: "implicit",
//   });

//   const handleModalGoogleLogin = () => {
//     if (currentMode === "register") {
//       setRegisterForm((prev) => ({ ...prev, role: selectedGoogleRole }));
//     }
//     googleLogin();
//   };

//   const goBack = () => {
//     if (currentStep === "adminRegistration" || currentStep === "registration") {
//       setCurrentStep("roleSelection");
//       setRegisterForm(prev => ({ 
//         ...prev, 
//         username: "", 
//         email: "", 
//         password: "", 
//         confirmPassword: "",
//         secretKey: "",
//         role: ""
//       }));
//       setPasswordStrength({
//         hasMinLength: false,
//         hasUpperCase: false,
//         hasLowerCase: false,
//         hasNumber: false,
//         hasSpecialChar: false
//       });
//     }
//     setMessage("");
//     setErrors({});
//   };

//   // Password Requirements Component
//   const PasswordRequirements = ({ password, strength }) => {
//     if (!password) return null;

//     const allRequirementsMet = Object.values(strength).every(val => val === true);

//     return (
//       <div style={styles.passwordStrengthContainer}>
//         <div style={styles.passwordStrengthHeader}>
//           <span style={{
//             ...styles.passwordStrengthTitle,
//             color: allRequirementsMet ? '#059669' : '#6b7280'
//           }}>
//             Password Requirements
//           </span>
//           {allRequirementsMet && (
//             <FontAwesomeIcon icon={faCheck} style={{ color: '#10b981', fontSize: '14px' }} />
//           )}
//         </div>
//         <div style={styles.passwordRequirements}>
//           <div style={styles.requirementItem}>
//             <FontAwesomeIcon 
//               icon={strength.hasMinLength ? faCheck : faCircle} 
//               style={{
//                 ...styles.requirementIcon,
//                 color: strength.hasMinLength ? '#10b981' : '#d1d5db',
//                 fontSize: strength.hasMinLength ? '12px' : '6px'
//               }} 
//             />
//             <span style={{
//               ...styles.requirementText,
//               color: strength.hasMinLength ? '#059669' : '#6b7280',
//               fontWeight: strength.hasMinLength ? '500' : '400'
//             }}>
//               At least 8 characters
//             </span>
//           </div>
//           <div style={styles.requirementItem}>
//             <FontAwesomeIcon 
//               icon={strength.hasUpperCase ? faCheck : faCircle} 
//               style={{
//                 ...styles.requirementIcon,
//                 color: strength.hasUpperCase ? '#10b981' : '#d1d5db',
//                 fontSize: strength.hasUpperCase ? '12px' : '6px'
//               }} 
//             />
//             <span style={{
//               ...styles.requirementText,
//               color: strength.hasUpperCase ? '#059669' : '#6b7280',
//               fontWeight: strength.hasUpperCase ? '500' : '400'
//             }}>
//               One uppercase letter (A-Z)
//             </span>
//           </div>
//           <div style={styles.requirementItem}>
//             <FontAwesomeIcon 
//               icon={strength.hasLowerCase ? faCheck : faCircle} 
//               style={{
//                 ...styles.requirementIcon,
//                 color: strength.hasLowerCase ? '#10b981' : '#d1d5db',
//                 fontSize: strength.hasLowerCase ? '12px' : '6px'
//               }} 
//             />
//             <span style={{
//               ...styles.requirementText,
//               color: strength.hasLowerCase ? '#059669' : '#6b7280',
//               fontWeight: strength.hasLowerCase ? '500' : '400'
//             }}>
//               One lowercase letter (a-z)
//             </span>
//           </div>
//           <div style={styles.requirementItem}>
//             <FontAwesomeIcon 
//               icon={strength.hasNumber ? faCheck : faCircle} 
//               style={{
//                 ...styles.requirementIcon,
//                 color: strength.hasNumber ? '#10b981' : '#d1d5db',
//                 fontSize: strength.hasNumber ? '12px' : '6px'
//               }} 
//             />
//             <span style={{
//               ...styles.requirementText,
//               color: strength.hasNumber ? '#059669' : '#6b7280',
//               fontWeight: strength.hasNumber ? '500' : '400'
//             }}>
//               One number (0-9)
//             </span>
//           </div>
//           <div style={styles.requirementItem}>
//             <FontAwesomeIcon 
//               icon={strength.hasSpecialChar ? faCheck : faCircle} 
//               style={{
//                 ...styles.requirementIcon,
//                 color: strength.hasSpecialChar ? '#10b981' : '#d1d5db',
//                 fontSize: strength.hasSpecialChar ? '12px' : '6px'
//               }} 
//             />
//             <span style={{
//               ...styles.requirementText,
//               color: strength.hasSpecialChar ? '#059669' : '#6b7280',
//               fontWeight: strength.hasSpecialChar ? '500' : '400'
//             }}>
//               One special character (!@#$%^&*)
//             </span>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div style={styles.container}>
//       <div style={styles.rippleBackground}>
//         <div style={{ ...styles.circleBase, ...styles.sizes.xxlarge, ...styles.shades.shade1 }} />
//         <div style={{ ...styles.circleBase, ...styles.sizes.xlarge, ...styles.shades.shade2 }} />
//         <div style={{ ...styles.circleBase, ...styles.sizes.large, ...styles.shades.shade3 }} />
//         <div style={{ ...styles.circleBase, ...styles.sizes.medium, ...styles.shades.shade4 }} />
//         <div style={{ ...styles.circleBase, ...styles.sizes.small, ...styles.shades.shade5 }} />
//       </div>

//       {/* Home Button */}
//       <button
//         onClick={() => navigate("/")}
//         style={styles.homeButton}
//         onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
//         onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
//       >
//         <FontAwesomeIcon icon={faHome} style={{ fontSize: "16px" }} />
//       </button>

//       {/* Admin Login Button */}
//       <button
//         onClick={toggleAdminLogin}
//         style={styles.adminButton}
//         onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
//         onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
//       >
//         <FontAwesomeIcon icon={faUserShield} style={{ fontSize: "14px" }} />
//       </button>

//       {/* Main Auth Card */}
//       <div style={styles.card}>
//         {/* Logo */}
//         <div style={styles.logoContainer}>
//           {logoUrl ? (
//             <img src={logoUrl} alt="Logo" style={styles.logo} />
//           ) : (
//             <div style={styles.logoFallback}>QB</div>
//           )}
//         </div>

//         {/* Login Form */}
//         {currentMode === "login" && (
//           <>
//             <h1 style={styles.title}>Welcome back</h1>
//             <p style={styles.subtitle}>Sign in to your account</p>
//             <form onSubmit={handleLoginSubmit} style={styles.form}>
//               <div style={styles.inputGroup}>
//                 <label style={styles.label}>Email Address</label>
//                 <input
//                   type="email"
//                   name="email"
//                   placeholder="Enter your email"
//                   value={loginForm.email}
//                   onChange={handleLoginChange}
//                   style={{...styles.input, ...(errors.email ? styles.inputError : {})}}
//                 />
//                 {errors.email && <span style={styles.error}>{errors.email}</span>}
//               </div>

//               <div style={styles.inputGroup}>
//                 <label style={styles.label}>Password</label>
//                 <div style={styles.passwordWrapper}>
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     name="password"
//                     placeholder="Enter your password"
//                     value={loginForm.password}
//                     onChange={handleLoginChange}
//                     style={{...styles.input, ...(errors.password ? styles.inputError : {})}}
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     style={styles.passwordToggle}
//                   >
//                     {showPassword ? "Hide" : "Show"}
//                   </button>
//                 </div>
//                 {errors.password && <span style={styles.error}>{errors.password}</span>}
//               </div>

//               <button type="submit" disabled={loading} style={styles.submitButton}>
//                 {loading ? "Signing in..." : "Sign In"}
//               </button>

//               <button 
//                 type="button" 
//                 onClick={() => switchMode("forgotPassword")}
//                 style={styles.forgotPassword}
//               >
//                 Forgot password?
//               </button>
//             </form>

//             <div style={styles.divider}>
//               <div style={styles.dividerLine}></div>
//               <span style={styles.dividerText}>OR</span>
//               <div style={styles.dividerLine}></div>
//             </div>

//             <div style={styles.googleContainer}>
//               <GoogleLogin
//                 onSuccess={handleGoogleSuccess}
//                 onError={handleGoogleError}
//                 theme="outline"
//                 size="large"
//                 text="continue_with"
//                 shape="rectangular"
//                 width="100%"
//               />
//             </div>

//             <p style={styles.switchText}>
//               Don't have an account?{" "}
//               <button onClick={() => switchMode("register")} style={styles.switchButton}>
//                 Sign up
//               </button>
//             </p>
//           </>
//         )}

//         {/* Register - Role Selection */}
//         {currentMode === "register" && currentStep === "roleSelection" && (
//           <>
//             <h1 style={styles.title}>Create your account</h1>
//             <p style={styles.subtitle}>Choose your account type</p>

//             <div style={styles.roleGrid}>
//               <button
//                 onClick={() => handleRoleSelect("brand")}
//                 style={styles.roleCard}
//                 onMouseEnter={(e) => {
//                   e.currentTarget.style.borderColor = '#0f6eea';
//                   e.currentTarget.style.backgroundColor = '#f0f9ff';
//                 }}
//                 onMouseLeave={(e) => {
//                   e.currentTarget.style.borderColor = '#e5e7eb';
//                   e.currentTarget.style.backgroundColor = 'white';
//                 }}
//               >
//                 <div style={styles.roleIcon}>🏢</div>
//                 <h3 style={styles.roleTitle}>Brand</h3>
//                 <p style={styles.roleDesc}>For businesses & marketers</p>
//               </button>

//               <button
//                 onClick={() => handleRoleSelect("influencer")}
//                 style={styles.roleCard}
//                 onMouseEnter={(e) => {
//                   e.currentTarget.style.borderColor = '#0f6eea';
//                   e.currentTarget.style.backgroundColor = '#f0f9ff';
//                 }}
//                 onMouseLeave={(e) => {
//                   e.currentTarget.style.borderColor = '#e5e7eb';
//                   e.currentTarget.style.backgroundColor = 'white';
//                 }}
//               >
//                 <div style={styles.roleIcon}>🌟</div>
//                 <h3 style={styles.roleTitle}>Influencer</h3>
//                 <p style={styles.roleDesc}>For content creators</p>
//               </button>
//             </div>

//             <button
//               onClick={() => handleRoleSelect("admin")}
//               style={styles.adminLink}
//             >
//               Admin registration
//             </button>

//             <p style={styles.switchText}>
//               Already have an account?{" "}
//               <button onClick={() => switchMode("login")} style={styles.switchButton}>
//                 Log in
//               </button>
//             </p>
//           </>
//         )}

//         {/* Register - Form */}
//         {currentMode === "register" && (currentStep === "registration" || currentStep === "adminRegistration") && (
//           <>
//             <button onClick={goBack} style={styles.backButton}>
//               <FontAwesomeIcon icon={faArrowLeft} style={{ marginRight: "8px" }} />
//               Back
//             </button>

//             <h1 style={styles.title}>
//               {currentStep === "adminRegistration" ? "Admin Registration" : "Create account"}
//             </h1>
//             <p style={styles.subtitle}>
//               {registerForm.role === "brand" && "Brand Account"}
//               {registerForm.role === "influencer" && "Influencer Account"}
//               {registerForm.role === "admin" && "Admin Account"}
//             </p>

//             <form onSubmit={currentStep === "adminRegistration" ? handleAdminRegisterSubmit : handleRegisterSubmit} style={styles.form}>
//               <div style={styles.inputGroup}>
//                 <label style={styles.label}>Username</label>
//                 <input
//                   type="text"
//                   name="username"
//                   placeholder="Enter username"
//                   value={registerForm.username}
//                   onChange={handleRegisterChange}
//                   style={{...styles.input, ...(errors.username ? styles.inputError : {})}}
//                 />
//                 {errors.username && <span style={styles.error}>{errors.username}</span>}
//               </div>

//               <div style={styles.inputGroup}>
//                 <label style={styles.label}>Email Address</label>
//                 <input
//                   type="email"
//                   name="email"
//                   placeholder="Enter your email"
//                   value={registerForm.email}
//                   onChange={handleRegisterChange}
//                   style={{...styles.input, ...(errors.email ? styles.inputError : {})}}
//                 />
//                 {errors.email && <span style={styles.error}>{errors.email}</span>}
//               </div>

//               <div style={styles.inputGroup}>
//                 <label style={styles.label}>Password</label>
//                 <div style={styles.passwordWrapper}>
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     name="password"
//                     placeholder="Create password"
//                     value={registerForm.password}
//                     onChange={handleRegisterChange}
//                     style={{...styles.input, ...(errors.password ? styles.inputError : {})}}
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     style={styles.passwordToggle}
//                   >
//                     {showPassword ? "Hide" : "Show"}
//                   </button>
//                 </div>
//                 {errors.password && <span style={styles.error}>{errors.password}</span>}
//                 <PasswordRequirements password={registerForm.password} strength={passwordStrength} />
//               </div>

//               <div style={styles.inputGroup}>
//                 <label style={styles.label}>Confirm Password</label>
//                 <div style={styles.passwordWrapper}>
//                   <input
//                     type={showConfirmPassword ? "text" : "password"}
//                     name="confirmPassword"
//                     placeholder="Re-enter password"
//                     value={registerForm.confirmPassword}
//                     onChange={handleRegisterChange}
//                     style={{...styles.input, ...(errors.confirmPassword ? styles.inputError : {})}}
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                     style={styles.passwordToggle}
//                   >
//                     {showConfirmPassword ? "Hide" : "Show"}
//                   </button>
//                 </div>
//                 {errors.confirmPassword && <span style={styles.error}>{errors.confirmPassword}</span>}
//               </div>

//               {currentStep === "adminRegistration" && (
//                 <div style={styles.inputGroup}>
//                   <label style={styles.label}>Admin Secret Key</label>
//                   <input
//                     type="password"
//                     name="secretKey"
//                     placeholder="Enter admin secret key"
//                     value={registerForm.secretKey}
//                     onChange={handleRegisterChange}
//                     style={{...styles.input, ...(errors.secretKey ? styles.inputError : {})}}
//                   />
//                   {errors.secretKey && <span style={styles.error}>{errors.secretKey}</span>}
//                 </div>
//               )}

//               <button type="submit" disabled={loading} style={styles.submitButton}>
//                 {loading ? "Creating account..." : "Create Account"}
//               </button>
//             </form>

//             {currentStep === "registration" && (
//               <>
//                 <div style={styles.divider}>
//                   <div style={styles.dividerLine}></div>
//                   <span style={styles.dividerText}>OR</span>
//                   <div style={styles.dividerLine}></div>
//                 </div>

//                 <div style={styles.googleContainer}>
//                   <GoogleLogin
//                     onSuccess={handleGoogleSuccess}
//                     onError={handleGoogleError}
//                     theme="outline"
//                     size="large"
//                     text="signup_with"
//                     shape="rectangular"
//                     width="100%"
//                   />
//                 </div>
//               </>
//             )}
//           </>
//         )}

//         {/* Forgot Password */}
//         {currentMode === "forgotPassword" && (
//           <>
//             <h1 style={styles.title}>Reset your password</h1>
//             <p style={styles.subtitle}>Enter your email to receive a reset code</p>

//             <form onSubmit={handleForgotPasswordSubmit} style={styles.form}>
//               <div style={styles.inputGroup}>
//                 <label style={styles.label}>Email Address</label>
//                 <input
//                   type="email"
//                   name="email"
//                   placeholder="Enter your email"
//                   value={forgotPasswordForm.email}
//                   onChange={handleForgotPasswordChange}
//                   style={{...styles.input, ...(errors.email ? styles.inputError : {})}}
//                 />
//                 {errors.email && <span style={styles.error}>{errors.email}</span>}
//               </div>

//               <button type="submit" disabled={loading} style={styles.submitButton}>
//                 {loading ? "Sending..." : "Send Reset Code"}
//               </button>

//               <button 
//                 type="button" 
//                 onClick={() => switchMode("login")}
//                 style={styles.backToLogin}
//               >
//                 Back to login
//               </button>
//             </form>
//           </>
//         )}

//         {/* Verify OTP */}
//         {currentMode === "verifyOTP" && (
//           <>
//             <h1 style={styles.title}>Enter verification code</h1>
//             <p style={styles.subtitle}>We sent a code to {forgotPasswordForm.email}</p>

//             <form onSubmit={handleVerifyOTPSubmit} style={styles.form}>
//               <div style={styles.inputGroup}>
//                 <label style={styles.label}>Verification Code</label>
//                 <input
//                   type="text"
//                   name="otp"
//                   placeholder="000000"
//                   value={verifyOTPForm.otp}
//                   onChange={handleVerifyOTPChange}
//                   maxLength={6}
//                   style={{...styles.input, ...(errors.otp ? styles.inputError : {}), textAlign: 'center', fontSize: '24px', letterSpacing: '12px', fontWeight: '600'}}
//                 />
//                 {errors.otp && <span style={styles.error}>{errors.otp}</span>}
//               </div>

//               <button type="submit" disabled={loading || verifyOTPForm.otp.length !== 6} style={styles.submitButton}>
//                 {loading ? "Verifying..." : "Verify Code"}
//               </button>

//               <button 
//                 type="button" 
//                 onClick={handleResendOTP}
//                 disabled={loading}
//                 style={styles.resendButton}
//               >
//                 Resend code
//               </button>
//             </form>
//           </>
//         )}

//         {/* Reset Password */}
//         {currentMode === "resetPassword" && (
//           <>
//             <h1 style={styles.title}>Create new password</h1>
//             <p style={styles.subtitle}>Enter your new password below</p>

//             <form onSubmit={handleResetPasswordSubmit} style={styles.form}>
//               <div style={styles.inputGroup}>
//                 <label style={styles.label}>New Password</label>
//                 <div style={styles.passwordWrapper}>
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     name="password"
//                     placeholder="Create new password"
//                     value={resetPasswordForm.password}
//                     onChange={handleResetPasswordChange}
//                     style={{...styles.input, ...(errors.password ? styles.inputError : {})}}
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     style={styles.passwordToggle}
//                   >
//                     {showPassword ? "Hide" : "Show"}
//                   </button>
//                 </div>
//                 {errors.password && <span style={styles.error}>{errors.password}</span>}
//                 <PasswordRequirements password={resetPasswordForm.password} strength={passwordStrength} />
//               </div>

//               <div style={styles.inputGroup}>
//                 <label style={styles.label}>Confirm Password</label>
//                 <div style={styles.passwordWrapper}>
//                   <input
//                     type={showConfirmPassword ? "text" : "password"}
//                     name="confirmPassword"
//                     placeholder="Re-enter password"
//                     value={resetPasswordForm.confirmPassword}
//                     onChange={handleResetPasswordChange}
//                     style={{...styles.input, ...(errors.confirmPassword ? styles.inputError : {})}}
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                     style={styles.passwordToggle}
//                   >
//                     {showConfirmPassword ? "Hide" : "Show"}
//                   </button>
//                 </div>
//                 {errors.confirmPassword && <span style={styles.error}>{errors.confirmPassword}</span>}
//               </div>

//               <button type="submit" disabled={loading} style={styles.submitButton}>
//                 {loading ? "Resetting..." : "Reset Password"}
//               </button>
//             </form>
//           </>
//         )}

//         {/* Error/Success Messages */}
//         {(message || errors.submit) && (
//           <div style={{
//             ...styles.message,
//             backgroundColor: message.includes("success") || message.includes("sent") || message.includes("resent") ? '#d1fae5' : '#fee2e2',
//             color: message.includes("success") || message.includes("sent") || message.includes("resent") ? '#065f46' : '#991b1b',
//             border: `1px solid ${message.includes("success") || message.includes("sent") || message.includes("resent") ? '#a7f3d0' : '#fecaca'}`
//           }}>
//             {message || errors.submit}
//           </div>
//         )}
//       </div>

//       {/* Admin Login Modal */}
//       {showAdminLogin && (
//         <div style={styles.modalOverlay} onClick={toggleAdminLogin}>
//           <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
//             <button onClick={toggleAdminLogin} style={styles.modalClose}>×</button>
            
//             <div style={styles.modalHeader}>
//               <FontAwesomeIcon icon={faLock} style={{ fontSize: "28px", color: "#6366f1" }} />
//               <h2 style={styles.modalTitle}>Admin Access</h2>
//               <p style={styles.modalSubtitle}>Secure login for administrators</p>
//             </div>

//             <form onSubmit={handleAdminLoginSubmit} style={styles.form}>
//               <div style={styles.inputGroup}>
//                 <label style={styles.label}>Admin Email</label>
//                 <input
//                   type="email"
//                   name="email"
//                   placeholder="Enter admin email"
//                   value={adminLoginForm.email}
//                   onChange={handleAdminLoginChange}
//                   style={{...styles.input, ...(errors.email ? styles.inputError : {})}}
//                 />
//                 {errors.email && <span style={styles.error}>{errors.email}</span>}
//               </div>

//               <div style={styles.inputGroup}>
//                 <label style={styles.label}>Password</label>
//                 <div style={styles.passwordWrapper}>
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     name="password"
//                     placeholder="Enter password"
//                     value={adminLoginForm.password}
//                     onChange={handleAdminLoginChange}
//                     style={{...styles.input, ...(errors.password ? styles.inputError : {})}}
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     style={styles.passwordToggle}
//                   >
//                     {showPassword ? "Hide" : "Show"}
//                   </button>
//                 </div>
//                 {errors.password && <span style={styles.error}>{errors.password}</span>}
//               </div>

//               <div style={styles.inputGroup}>
//                 <label style={styles.label}>Secret Key</label>
//                 <input
//                   type="password"
//                   name="secretKey"
//                   placeholder="Enter secret key"
//                   value={adminLoginForm.secretKey}
//                   onChange={handleAdminLoginChange}
//                   style={{...styles.input, ...(errors.secretKey ? styles.inputError : {})}}
//                 />
//                 {errors.secretKey && <span style={styles.error}>{errors.secretKey}</span>}
//               </div>

//               <button type="submit" disabled={loading} style={styles.submitButton}>
//                 {loading ? "Signing in..." : "Admin Sign In"}
//               </button>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// const styles = {
//   container: {
//     minHeight: '100vh',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     position: 'relative',
//     overflow: 'hidden',
//     background: 'transparent',
//     padding: '20px',
//     fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
//   },
//   rippleBackground: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     width: '100%',
//     height: '100%',
//     overflow: 'hidden',
//     zIndex: 0,
//     background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//   },
//   circleBase: {
//     position: 'absolute',
//     borderRadius: '50%',
//     background: 'white',
//     animation: 'ripple 15s infinite',
//     boxShadow: '0px 0px 1px 0px rgba(255,255,255,0.3)',
//   },
//   sizes: {
//     small: { width: 200, height: 200, left: -100, bottom: -100 },
//     medium: { width: 400, height: 400, left: -200, bottom: -200 },
//     large: { width: 600, height: 600, left: -300, bottom: -300 },
//     xlarge: { width: 800, height: 800, left: -400, bottom: -400 },
//     xxlarge: { width: 1000, height: 1000, left: -500, bottom: -500 },
//   },
//   shades: {
//     shade1: { opacity: 0.15 },
//     shade2: { opacity: 0.25 },
//     shade3: { opacity: 0.35 },
//     shade4: { opacity: 0.45 },
//     shade5: { opacity: 0.55 },
//   },
//   homeButton: {
//     position: 'fixed',
//     top: '20px',
//     right: '20px',
//     width: '48px',
//     height: '48px',
//     borderRadius: '50%',
//     backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//     color: 'white',
//     border: 'none',
//     cursor: 'pointer',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
//     transition: 'all 0.3s',
//     zIndex: 20,
//   },
//   adminButton: {
//     position: 'fixed',
//     bottom: '20px',
//     right: '20px',
//     width: '48px',
//     height: '48px',
//     borderRadius: '50%',
//     backgroundColor: '#6366f1',
//     color: 'white',
//     border: 'none',
//     cursor: 'pointer',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
//     transition: 'all 0.3s',
//     zIndex: 20,
//   },
//   card: {
//     position: 'relative',
//     zIndex: 10,
//     width: '100%',
//     maxWidth: '440px',
//     padding: '48px 40px',
//     backgroundColor: 'white',
//     borderRadius: '16px',
//     boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
//     border: '1px solid rgba(0,0,0,0.05)',
//   },
//   logoContainer: {
//     display: 'flex',
//     justifyContent: 'center',
//     marginBottom: '32px',
//   },
//   logo: {
//     width: '72px',
//     height: '72px',
//     objectFit: 'contain',
//   },
//   logoFallback: {
//     width: '72px',
//     height: '72px',
//     borderRadius: '16px',
//     background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//     color: 'white',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     fontSize: '28px',
//     fontWeight: 'bold',
//     boxShadow: '0 4px 12px rgba(102,126,234,0.3)',
//   },
//   title: {
//     fontSize: '32px',
//     fontWeight: '700',
//     color: '#1a202c',
//     textAlign: 'center',
//     marginBottom: '8px',
//     letterSpacing: '-0.5px',
//   },
//   subtitle: {
//     fontSize: '15px',
//     color: '#718096',
//     textAlign: 'center',
//     marginBottom: '32px',
//     fontWeight: '400',
//   },
//   form: {
//     display: 'flex',
//     flexDirection: 'column',
//     gap: '20px',
//   },
//   inputGroup: {
//     display: 'flex',
//     flexDirection: 'column',
//     gap: '8px',
//   },
//   label: {
//     fontSize: '14px',
//     fontWeight: '600',
//     color: '#2d3748',
//     marginBottom: '4px',
//   },
//   input: {
//     width: '100%',
//     padding: '14px 16px',
//     fontSize: '15px',
//     border: '1.5px solid #e2e8f0',
//     borderRadius: '10px',
//     outline: 'none',
//     transition: 'all 0.2s',
//     backgroundColor: 'white',
//     color: '#2d3748',
//     boxSizing: 'border-box',
//     fontWeight: '400',
//   },
//   inputError: {
//     borderColor: '#fc8181',
//     backgroundColor: '#fff5f5',
//   },
//   passwordWrapper: {
//     position: 'relative',
//     display: 'flex',
//     alignItems: 'center',
//   },
//   passwordToggle: {
//     position: 'absolute',
//     right: '16px',
//     background: 'none',
//     border: 'none',
//     color: '#667eea',
//     fontSize: '13px',
//     cursor: 'pointer',
//     padding: '6px 10px',
//     fontWeight: '600',
//     transition: 'color 0.2s',
//   },
//   error: {
//     fontSize: '13px',
//     color: '#e53e3e',
//     fontWeight: '500',
//   },
//   submitButton: {
//     width: '100%',
//     padding: '14px',
//     fontSize: '16px',
//     fontWeight: '600',
//     color: 'white',
//     background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//     border: 'none',
//     borderRadius: '10px',
//     cursor: 'pointer',
//     transition: 'all 0.3s',
//     marginTop: '12px',
//     boxShadow: '0 4px 12px rgba(102,126,234,0.3)',
//   },
//   forgotPassword: {
//     background: 'none',
//     border: 'none',
//     color: '#667eea',
//     fontSize: '14px',
//     cursor: 'pointer',
//     padding: '8px 0',
//     textAlign: 'center',
//     fontWeight: '600',
//     transition: 'color 0.2s',
//   },
//   backToLogin: {
//     background: 'none',
//     border: 'none',
//     color: '#718096',
//     fontSize: '14px',
//     cursor: 'pointer',
//     padding: '8px 0',
//     textAlign: 'center',
//     marginTop: '4px',
//     fontWeight: '500',
//   },
//   divider: {
//     display: 'flex',
//     alignItems: 'center',
//     margin: '28px 0',
//     gap: '16px',
//   },
//   dividerLine: {
//     flex: 1,
//     height: '1px',
//     backgroundColor: '#e2e8f0',
//   },
//   dividerText: {
//     fontSize: '13px',
//     color: '#a0aec0',
//     fontWeight: '600',
//     padding: '0 4px',
//   },
//   googleContainer: {
//     marginBottom: '24px',
//   },
//   switchText: {
//     textAlign: 'center',
//     fontSize: '14px',
//     color: '#718096',
//     marginTop: '24px',
//     fontWeight: '400',
//   },
//   switchButton: {
//     background: 'none',
//     border: 'none',
//     color: '#667eea',
//     fontSize: '14px',
//     fontWeight: '600',
//     cursor: 'pointer',
//     padding: 0,
//     transition: 'color 0.2s',
//   },
//   roleGrid: {
//     display: 'grid',
//     gridTemplateColumns: '1fr 1fr',
//     gap: '16px',
//     marginBottom: '28px',
//   },
//   roleCard: {
//     padding: '28px 20px',
//     border: '2px solid #e2e8f0',
//     borderRadius: '14px',
//     backgroundColor: 'white',
//     cursor: 'pointer',
//     transition: 'all 0.3s',
//     textAlign: 'center',
//   },
//   roleIcon: {
//     fontSize: '36px',
//     marginBottom: '16px',
//   },
//   roleTitle: {
//     fontSize: '18px',
//     fontWeight: '700',
//     color: '#2d3748',
//     marginBottom: '8px',
//   },
//   roleDesc: {
//     fontSize: '13px',
//     color: '#718096',
//     lineHeight: '1.5',
//     fontWeight: '400',
//   },
//   adminLink: {
//     background: 'none',
//     border: 'none',
//     color: '#6366f1',
//     fontSize: '14px',
//     fontWeight: '600',
//     cursor: 'pointer',
//     padding: '8px 0',
//     textAlign: 'center',
//     marginBottom: '20px',
//     transition: 'color 0.2s',
//   },
//   backButton: {
//     display: 'flex',
//     alignItems: 'center',
//     background: 'none',
//     border: 'none',
//     color: '#718096',
//     fontSize: '14px',
//     cursor: 'pointer',
//     padding: '8px 0',
//     marginBottom: '24px',
//     fontWeight: '600',
//     transition: 'color 0.2s',
//   },
//   resendButton: {
//     width: '100%',
//     padding: '12px',
//     fontSize: '14px',
//     fontWeight: '600',
//     color: '#667eea',
//     backgroundColor: 'transparent',
//     border: '1.5px solid #e2e8f0',
//     borderRadius: '10px',
//     cursor: 'pointer',
//     transition: 'all 0.2s',
//   },
//   message: {
//     padding: '14px 18px',
//     borderRadius: '10px',
//     fontSize: '14px',
//     textAlign: 'center',
//     marginTop: '20px',
//     fontWeight: '500',
//   },
//   modalOverlay: {
//     position: 'fixed',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(0, 0, 0, 0.6)',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     zIndex: 2000,
//     padding: '20px',
//     backdropFilter: 'blur(4px)',
//   },
//   modal: {
//     width: '100%',
//     maxWidth: '440px',
//     backgroundColor: 'white',
//     borderRadius: '16px',
//     padding: '40px',
//     position: 'relative',
//     boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
//   },
//   modalClose: {
//     position: 'absolute',
//     top: '20px',
//     right: '20px',
//     background: 'none',
//     border: 'none',
//     fontSize: '32px',
//     color: '#a0aec0',
//     cursor: 'pointer',
//     width: '36px',
//     height: '36px',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderRadius: '8px',
//     transition: 'all 0.2s',
//     lineHeight: 1,
//   },
//   modalHeader: {
//     display: 'flex',
//     flexDirection: 'column',
//     alignItems: 'center',
//     gap: '12px',
//     marginBottom: '32px',
//   },
//   modalTitle: {
//     fontSize: '24px',
//     fontWeight: '700',
//     color: '#2d3748',
//     margin: 0,
//   },
//   modalSubtitle: {
//     fontSize: '14px',
//     color: '#718096',
//     margin: 0,
//     fontWeight: '400',
//   },
//   passwordStrengthContainer: {
//     marginTop: '12px',
//     padding: '16px',
//     backgroundColor: '#f7fafc',
//     borderRadius: '10px',
//     border: '1px solid #e2e8f0',
//   },
//   passwordStrengthHeader: {
//     display: 'flex',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: '12px',
//   },
//   passwordStrengthTitle: {
//     fontSize: '13px',
//     fontWeight: '600',
//   },
//   passwordRequirements: {
//     display: 'flex',
//     flexDirection: 'column',
//     gap: '10px',
//   },
//   requirementItem: {
//     display: 'flex',
//     alignItems: 'center',
//     gap: '10px',
//   },
//   requirementIcon: {
//     flexShrink: 0,
//     transition: 'all 0.2s',
//   },
//   requirementText: {
//     fontSize: '13px',
//     transition: 'all 0.2s',
//     lineHeight: '1.5',
//   },
// };

// export default AuthContainer;