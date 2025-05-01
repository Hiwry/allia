import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from './Layout';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, user } = useAuth();
  
  useEffect(() => {
    console.log('[ProtectedRoute] Estado de autenticação:', {
      isAuthenticated,
      user,
      userRole: user?.role,
      allowedRoles
    });
  }, [isAuthenticated, user, allowedRoles]);
  
  // Se não estiver autenticado, redireciona para login
  if (!isAuthenticated) {
    console.log('[ProtectedRoute] Não autenticado, redirecionando para login');
    return <Navigate to="/login" replace />;
  }
  
  // Se não há restrições de role, permite acesso
  if (!allowedRoles || allowedRoles.length === 0) {
    console.log('[ProtectedRoute] Sem restrições de role, permitindo acesso');
    return <Layout>{children}</Layout>;
  }
  
  // Verificar permissões
  if (user && allowedRoles.includes(user.role)) {
    console.log(`[ProtectedRoute] Usuário tem role '${user.role}', acesso permitido`);
    return <Layout>{children}</Layout>;
  }
  
  // Sem permissão
  console.log(`[ProtectedRoute] Usuário com role '${user?.role}' não tem permissão para roles '${allowedRoles.join(', ')}'`);
  return <Navigate to="/" replace />;
}
