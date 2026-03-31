import React, { useContext, useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function ProtectedRoute({ children, role }) {
  const { user, profileStatus, loading, authInitialized } = useContext(AuthContext);
  const location = useLocation();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Wait for auth to initialize AND profile status to fully load
    if (authInitialized && !loading && profileStatus.isLoaded) {
      setChecking(false);
    }
  }, [authInitialized, loading, profileStatus.isLoaded]);

  // Show loading while checking
  if (!authInitialized || loading || checking) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        Loading...
      </div>
    );
  }

  // 1. USER NOT LOGGED IN
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. ROLE DOES NOT MATCH
  if (role) {
    const allowedRoles = Array.isArray(role) ? role : [role];
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/login" replace />;
    }
  }

  // 3. ADMIN ALWAYS BYPASSES PROFILE CHECK
  const isAdminRoute = location.pathname.startsWith("/admin");
  if (user.role === "admin" || isAdminRoute) {
    return children ? children : <Outlet />;
  }

  // 4. PREVENT REDIRECT LOOP FOR REGISTRATION PAGES
  const isRegisterPage =
    location.pathname.startsWith("/brand/register") ||
    location.pathname.startsWith("/influencer/register");

  // 5. PROFILE INCOMPLETE CHECK
  if (!isRegisterPage && profileStatus.isLoaded === true && !profileStatus.isComplete) {
    const registerPage =
      user.role === "brand"
        ? "/brand/register"
        : user.role === "influencer"
          ? "/influencer/register"
          : "/login";

    return <Navigate to={registerPage} replace />;
  }

  // 6. ALLOW ACCESS
  return children ? children : <Outlet />;
}

export default ProtectedRoute;