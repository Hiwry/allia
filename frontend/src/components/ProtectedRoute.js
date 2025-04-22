import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
<<<<<<< HEAD
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
=======
  const { isAuthenticated, token } = useAuth();
  
  // console.log('ProtectedRoute Check - isAuthenticated:', isAuthenticated, 'Token:', token); // Log de Debug (remover depois)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

>>>>>>> 4b938adcf806d3d2cd967dfc8bb80932662d410a
  return children;
}
