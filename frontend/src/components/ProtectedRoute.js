import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  // Prefer using context if available, fallback to token in localStorage
  let isAuthenticated = false;
  let token = null;
  try {
    const auth = useAuth();
    if (auth) {
      isAuthenticated = auth.isAuthenticated;
      token = auth.token;
    } else {
      token = localStorage.getItem('token');
      isAuthenticated = !!token;
    }
  } catch {
    token = localStorage.getItem('token');
    isAuthenticated = !!token;
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}
