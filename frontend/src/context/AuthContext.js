import React, { createContext, useState, useContext, useEffect } from 'react';
import * as api from '../services/api'; // Importa as funções da API

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token')); // Inicializa com token do localStorage
  const [loading, setLoading] = useState(false); // Estado de carregamento

  // Função de login que atualiza o estado e localStorage
  const loginUser = async (credentials) => {
    setLoading(true);
    try {
      const data = await api.login(credentials); // Chama a API real
      if (data.token) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setLoading(false);
        return { success: true };
      } else {
        setLoading(false);
        return { success: false, message: data.message || 'Erro ao fazer login.' };
      }
    } catch (error) {
      setLoading(false);
      const message = error.response?.data?.message || 'Erro de conexão ao fazer login.';
      console.error('AuthContext Login Error:', error.response || error);
      return { success: false, message: message };
    }
  };

  // Função de logout
  const logoutUser = () => {
    localStorage.removeItem('token');
    setToken(null);
    // Opcional: redirecionar para /login aqui ou deixar o ProtectedRoute cuidar disso
  };

  // O valor fornecido pelo contexto
  const value = {
    token,
    isAuthenticated: !!token,
    loading,
    loginUser,
    logoutUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook customizado para usar o contexto
export const useAuth = () => {
  return useContext(AuthContext);
}; 