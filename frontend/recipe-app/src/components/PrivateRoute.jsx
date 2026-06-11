import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * PrivateRoute renders the given element if the user is authenticated.
 * Otherwise it redirects to the home page and optionally opens the login modal.
 */
const PrivateRoute = ({ isAuthenticated, children, onUnauthenticated }) => {
  const location = useLocation();
  if (isAuthenticated) {
    return children;
  }
  // Trigger login modal if callback provided
  if (onUnauthenticated) {
    onUnauthenticated();
  }
  // Redirect to home (or you could keep the location state for later navigation)
  return <Navigate to="/" state={{ from: location }} replace />;
};

export default PrivateRoute;
