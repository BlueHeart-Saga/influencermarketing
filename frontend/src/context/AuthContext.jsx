import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from "react";
import axios from "axios";
import API_BASE_URL from "../config/api";
import profileAPI from "../services/profileAPI";
import Loader from "../components/Loader";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // 1. Initial State - Load from storage immediately
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("quickbox-user");
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.warn("Failed to parse stored user during init");
      return null;
    }
  });

  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);
  const initializationRef = useRef(false);

  const [profileStatus, setProfileStatus] = useState({
    isComplete: false,
    profile: null,
    progress: 0,
    completionDetails: {},
    isLoaded: false
  });

  const [subscription, setSubscription] = useState(null);
  const [trialExpired, setTrialExpired] = useState(false);
  const [profileImageVersion, setProfileImageVersion] = useState(0);

  // Helper for robust JWT decoding (handles URL-safe base64)
  const decodeJWT = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(decodeURIComponent(escape(window.atob(base64))));
    } catch (e) {
      return null;
    }
  };

  // -----------------------------------------
  // Logout (CLEANER - ONLY SOURCE OF REMOVAL)
  // -----------------------------------------
  const logout = useCallback(async (redirect = true) => {
    try {
      // Clear React State
      setUser(null);
      setSubscription(null);
      setTrialExpired(false);
      setProfileStatus({
        isComplete: false, profile: null, progress: 0, completionDetails: {}, isLoaded: false
      });

      // Clear Storage explicitly but KEEP 'recent-user' for Easy Login
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      localStorage.removeItem("quickbox-user");

      if (redirect && window.location.pathname !== '/login') {
        window.location.replace("/login");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, []);

  // -----------------------------------------
  // Auth Functions
  // -----------------------------------------
  const login = useCallback((data) => {
    const userData = {
      ...data,
      id: data.id || data.user_id,
      token: data.access_token || data.token,
    };

    // Save tokens FIRST to prevent race conditions
    if (userData.token) {
      localStorage.setItem("access_token", userData.token);
      localStorage.setItem("quickbox-user", JSON.stringify(userData));
      localStorage.setItem("user", JSON.stringify({
        id: userData.id,
        role: userData.role,
        username: userData.username,
        email: userData.email,
      }));

      // SAVE TO RECENT USER (PERSISTENT LOGOUT)
      localStorage.setItem("recent-user", JSON.stringify({
        username: userData.username,
        email: userData.email,
        profile_picture: userData.profile_picture || userData.picture || null,
        auth_provider: userData.auth_provider || "email",
        role: userData.role,
        token: userData.token // Added token for seamless re-entry
      }));
    }

    setUser(userData);
    setProfileStatus(prev => ({ ...prev, isLoaded: false }));
  }, []);

  const refreshProfileStatus = useCallback(async () => {
    const currentToken = localStorage.getItem("access_token") || user?.token;
    if (!currentToken || !user) {
      setProfileStatus(prev => ({ ...prev, isLoaded: true }));
      return null;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/profiles/completion/status`, {
        headers: { Authorization: `Bearer ${currentToken}` }
      });

      const data = response.data;
      const isComplete = data.isComplete === true || data.progress >= 70;

      setProfileStatus({
        isComplete,
        progress: data.progress || 0,
        completionDetails: data.completionDetails || {},
        profile: data.profile || null,
        isLoaded: true
      });
      return data;
    } catch (error) {
      console.error("Profile check failed:", error);
      setProfileStatus(prev => ({ ...prev, isLoaded: true }));
      return null;
    }
  }, [user]);

  const refreshSubscription = useCallback(async () => {
    const currentToken = localStorage.getItem("access_token") || user?.token;
    if (!currentToken || !user) return null;

    try {
      const response = await axios.get(`${API_BASE_URL}/subscriptions/me`, {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      setSubscription(response.data);
      if (response.data.type === 'trial' && new Date(response.data.current_period_end) < new Date()) {
        setTrialExpired(true);
      } else {
        setTrialExpired(false);
      }
      return response.data;
    } catch (error) {
      console.error("Subscription fetch failed:", error);
      return null;
    }
  }, [user]);

  // -----------------------------------------
  // Side Effects
  // -----------------------------------------

  // 1. Keep storage in sync with user state
  useEffect(() => {
    if (user?.token) {
      localStorage.setItem("access_token", user.token);
      localStorage.setItem("quickbox-user", JSON.stringify(user));
    }
    // CRITICAL: No 'else' block here. Logout is handled explicitly by the logout function.
  }, [user]);

  // 2. Initial token validation on mount
  useEffect(() => {
    if (initializationRef.current) return;
    initializationRef.current = true;

    const initAuth = async () => {
      const storedToken = localStorage.getItem("access_token");
      if (!storedToken) {
        setLoading(false);
        setAuthInitialized(true);
        return;
      }

      try {
        // Expiry check before API call
        const payload = decodeJWT(storedToken);
        if (payload && payload.exp * 1000 < Date.now()) {
          console.warn("Token expired, logging out...");
          await logout(false);
          setLoading(false);
          setAuthInitialized(true);
          return;
        }

        const res = await axios.get(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        });

        setUser({ ...res.data, token: storedToken, id: res.data.id || res.data.user_id });
      } catch (err) {
        console.error("Fetch profile failed:", err.message);
        if (err.response?.status === 401) {
          await logout(false); // Only logout if token is definitely invalid
        }
        // If server is down, we keep the user state initialized from constructor
      } finally {
        // Ensure loader shows for at least 5s for a smooth transition
        setTimeout(() => {
          setLoading(false);
          setAuthInitialized(true);
        }, 5000);
      }
    };

    initAuth();
  }, [logout]);

  // 3. Load other dependencies once auth is ready
  useEffect(() => {
    if (authInitialized && user) {
      refreshProfileStatus();
      refreshSubscription();
    }
  }, [authInitialized, user, refreshProfileStatus, refreshSubscription]);

  // 4. Final Render
  if (!authInitialized || loading) {
    return <Loader />;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token: user?.token || localStorage.getItem("access_token"),
        login,
        logout,
        loading,
        subscription,
        trialExpired,
        profileStatus,
        refreshProfileStatus,
        authInitialized,
        setSubscription,
        refreshSubscription,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
