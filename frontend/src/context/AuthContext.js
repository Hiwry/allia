import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate
import * as api from '../services/api'; // Importa as funções da API

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Inicializar o estado corretamente do localStorage
  const [token, setToken] = useState(() => {
    const storedToken = localStorage.getItem('token');
    return storedToken || null;
  });
  
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        let parsedUser = JSON.parse(storedUser);
        // Garantir que sempre existe o campo role
        if (!parsedUser.role && typeof parsedUser.is_admin !== 'undefined') {
          parsedUser.role = parsedUser.is_admin ? 'admin' : 'vendedor';
        }
        // Garantir compatibilidade nome
        if (!parsedUser.name && parsedUser.nome) {
          parsedUser.name = parsedUser.nome;
        }
        console.log('Usuário recuperado do localStorage:', parsedUser);
        return parsedUser;
      }
      return null;
    } catch (error) {
      console.error('Erro ao recuperar usuário do localStorage:', error);
      return null;
    }
  });
  
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Efeito para verificar o estado da autenticação ao montar o componente
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    console.log('Verificando estado de autenticação:', { 
      hasToken: !!token, 
      hasUser: !!userStr 
    });
    
    if (token && userStr) {
      try {
        let parsedUser = JSON.parse(userStr);
        // Garantir que sempre existe o campo role
        if (!parsedUser.role && typeof parsedUser.is_admin !== 'undefined') {
          parsedUser.role = parsedUser.is_admin ? 'admin' : 'vendedor';
        }
        // Garantir compatibilidade nome
        if (!parsedUser.name && parsedUser.nome) {
          parsedUser.name = parsedUser.nome;
        }
        setToken(token);
        setUser(parsedUser);
        console.log('Autenticação restaurada: Role =', parsedUser.role);
      } catch (e) {
        console.error('Erro ao restaurar autenticação:', e);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Função de login ajustada
  const loginUser = async (credentials) => {
    setLoading(true);
    try {
      const data = await api.login(credentials.email, credentials.password);
      console.log('Resposta completa do login:', data);
      
      if (data.token && data.user) {
        // Garantir que sempre existe o campo role
        let userObj = { ...data.user };
        if (!userObj.role && typeof userObj.is_admin !== 'undefined') {
          userObj.role = userObj.is_admin ? 'admin' : 'vendedor';
        }
        if (!userObj.name && userObj.nome) {
          userObj.name = userObj.nome;
        }
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(userObj));
        setToken(data.token);
        setUser(userObj);
        console.log('Usuário logado com role:', userObj.role);
        
        // Forçar recarregamento da página para Dashboard
        window.location.href = '/';
        return { success: true };
      } else {
        setLoading(false);
        return { success: false, message: data.message || 'Erro ao fazer login.' };
      }
    } catch (error) {
      setLoading(false);
      console.error('Erro no login:', error);
      return { success: false, message: error.message || 'Erro ao fazer login.' };
    }
  };

  // Função de logout
  const logoutUser = () => {
    console.log('[AuthContext] Logging out...'); // Adiciona log para confirmação
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // Remover também dados do usuário, se houver
    setToken(null);
    setUser(null);
    navigate('/login'); // Adiciona o redirecionamento para /login
  };

  // Funções auxiliares para verificar roles
  const isVendedor = () => user?.role === 'vendedor';
  const isAdmin = () => user?.role === 'admin';
  const isProducao = () => user?.role === 'producao';

  // Adicionar esta função no AuthContext
  const updateUserInfo = (updatedUserInfo) => {
    // Atualizar o estado do usuário
    setUser(currentUser => {
      const newUserData = { ...currentUser, ...updatedUserInfo };
      
      // Atualizar no localStorage
      localStorage.setItem('user', JSON.stringify(newUserData));
      
      return newUserData;
    });
  };

  const value = {
    token,
    user,
    isAuthenticated: !!token && !!user,
    loading,
    loginUser,
    logoutUser,
    updateUserInfo,
    isVendedor,
    isAdmin,
    isProducao,
    hasAccess: (roles) => !roles?.length || roles.includes(user?.role)
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