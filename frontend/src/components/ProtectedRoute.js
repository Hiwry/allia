import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, token } = useAuth();
  
  // console.log('ProtectedRoute Check - isAuthenticated:', isAuthenticated, 'Token:', token); // Log de Debug (remover depois)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
