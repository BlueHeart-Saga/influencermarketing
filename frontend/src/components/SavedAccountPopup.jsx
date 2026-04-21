import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config/api";
import { useAuth } from "../context/AuthContext";

const SavedAccountPopup = ({ logoUrl }) => {
    const { user: currentUser, login } = useAuth();
    const [savedUser, setSavedUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // If user is already logged in, don't show the prompt
        if (currentUser) {
            setSavedUser(null);
            return;
        }

        const session = localStorage.getItem("quickbox-user");
        const recent = localStorage.getItem("recent-user");

        if (session) {
            try {
                const parsed = JSON.parse(session);
                if (parsed.email && parsed.username) {
                    setSavedUser(parsed);
                }
            } catch (e) {
                localStorage.removeItem("quickbox-user");
            }
        } else if (recent) {
            try {
                const parsed = JSON.parse(recent);
                if (parsed.email && parsed.username) {
                    setSavedUser({ ...parsed, isLoggedOut: true });
                }
            } catch (e) {
                localStorage.removeItem("recent-user");
            }
        }
    }, [currentUser]);

    const handleSavedAccountLogin = async () => {
        if (!savedUser) return;

        // For Google accounts, redirect to auth page to trigger GSI flow
        // (Or we could try to trigger it here, but AuthPage is already set up for it)
        if (savedUser.auth_provider === 'google') {
            navigate("/login");
            return;
        }

        // Try auto-login with stored token
        if (savedUser.token) {
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE_URL}/auth/me`, {
                    headers: { Authorization: `Bearer ${savedUser.token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    const userData = {
                        ...data,
                        token: savedUser.token,
                        auth_provider: savedUser.auth_provider,
                        role: data.role
                    };

                    // Use standard storage logic
                    localStorage.setItem("quickbox-user", JSON.stringify(userData));
                    localStorage.setItem("access_token", savedUser.token);

                    if (login) login(userData);
                    navigate(`/${data.role || 'brand'}/dashboard`);
                    return;
                }
            } catch (err) {
                console.error("Auto-login failed:", err);
            } finally {
                setLoading(false);
            }
        }

        // Fallback: take them to login page with email filled
        navigate(`/login?email=${encodeURIComponent(savedUser.email)}`);
    };

    const clearSavedAccount = () => {
        localStorage.removeItem("quickbox-user");
        localStorage.removeItem("recent-user");
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        setSavedUser(null);
    };

    if (!savedUser) return null;

    return (
        <div style={styles.floatingUserPopup}>
            <div style={styles.popupHeader}>
                <div style={styles.popupHeaderLeft}>
                    <img
                        src={savedUser.auth_provider === 'google' ? "https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_Logo.svg" : (logoUrl || "https://quickbox-backend-docker-b9cbaye9a3bvhad5.southindia-01.azurewebsites.net/api/logo/current")}
                        alt="Logo"
                        style={styles.googleMiniLogo}
                    />
                    <span style={styles.popupHeaderText}>
                        {savedUser.auth_provider === 'google' ? 'Sign in to Brio with Google' : 'Welcome back to Brio'}
                    </span>
                </div>
                <button onClick={clearSavedAccount} style={styles.popupCloseBtn}>×</button>
            </div>

            <div style={styles.popupContent}>
                <div style={styles.userDisplay}>
                    <div style={styles.userAvatarLarge}>
                        {savedUser.profile_picture ? (
                            <img src={savedUser.profile_picture} alt={savedUser.username} style={styles.savedUserImage} />
                        ) : (
                            <span>{savedUser.username?.charAt(0).toUpperCase()}</span>
                        )}
                    </div>
                    <div style={styles.userMeta}>
                        <p style={styles.popupUserName}>{savedUser.username}</p>
                        <p style={styles.popupUserEmail}>{savedUser.email}</p>
                    </div>
                </div>

                <button onClick={handleSavedAccountLogin} style={styles.popupConfirmBtn} disabled={loading}>
                    {loading ? "Logging in..." : `Continue as ${savedUser.username}`}
                </button>
            </div>
        </div>
    );
};

const styles = {
    floatingUserPopup: {
        position: 'fixed',
        top: '80px', // Lower to avoid overlapping fixed headers
        right: '24px',
        width: '320px',
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
        zIndex: 9999,
        padding: '0',
        overflow: 'hidden',
        animation: 'slideFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    },
    popupHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        borderBottom: '1px solid #f3f4f6',
    },
    popupHeaderLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    googleMiniLogo: {
        width: '18px',
        height: '18px',
    },
    popupHeaderText: {
        fontSize: '13px',
        color: '#374151',
        fontWeight: '500',
    },
    popupCloseBtn: {
        background: 'none',
        border: 'none',
        fontSize: '20px',
        color: '#9ca3af',
        cursor: 'pointer',
        padding: '4px',
        lineHeight: '1',
    },
    popupContent: {
        padding: '20px 16px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    userDisplay: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    userAvatarLarge: {
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        backgroundColor: '#0f6eea',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        fontWeight: 'bold',
        overflow: 'hidden',
    },
    savedUserImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    userMeta: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1px',
    },
    popupUserName: {
        fontSize: '15px',
        fontWeight: '700',
        color: '#111827',
        margin: 0,
    },
    popupUserEmail: {
        fontSize: '12px',
        color: '#6b7280',
        margin: 0,
    },
    popupConfirmBtn: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#1a73e8',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
};

// Add global styles for animation if not present
const styleTag = document.createElement("style");
styleTag.innerHTML = `
  @keyframes slideFadeIn {
    from { opacity: 0; transform: translateY(-15px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(styleTag);

export default SavedAccountPopup;
