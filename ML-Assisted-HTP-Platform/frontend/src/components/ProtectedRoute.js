import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Show a loading indicator while the user session is being verified.
    // This prevents a flicker to the login page on a page refresh.
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    // If auth has loaded and there's no user, redirect to the login page.
    // We pass the current location in `state` so we can redirect back after login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // CRASH FIX: Ensure allowedRoles is a valid array before checking.
  if (!allowedRoles || !allowedRoles.includes(user.role)) {
    // If user is logged in but has the wrong role, redirect to an "unauthorized" page.
    // This provides better feedback than redirecting to the homepage.
    return <Navigate to="/unauthorized" replace />;
  }

  // If all checks pass, render the child component.
  return children;
};

export default ProtectedRoute;