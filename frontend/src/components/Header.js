import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';

const StyledHeader = styled.header`
  background: #fff;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  height: 64px;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  color: #1a3c40;
`;

const Navigation = styled.nav`
  display: flex;
  align-items: center;
  flex: 1;
  margin: 0 20px;
`;

const NavLinks = styled.div`
  display: flex;
  margin-left: 40px;
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  color: #22344a;
  text-decoration: none;
  font-weight: 500;
  border-radius: 4px;
  transition: background 0.2s;
  
  &.active {
    background: #e6f7ff;
    color: #1a3c40;
    font-weight: 600;
  }
  
  &:hover {
    background: #f0f5ff;
  }
`;

const UserButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  font-weight: 500;
  &:hover {
    background: #f0f0f0;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  right: 24px;
  top: 60px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border-radius: 4px;
  padding: 4px 0;
  display: ${props => (props.$visible ? 'block' : 'none')};
  z-index: 1000;
`;

const MenuItem = styled.div`
  padding: 8px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  &:hover {
    background: #f0f0f0;
  }
`;

const Divider = styled.div`
  height: 1px;
  background: #f0f0f0;
  margin: 4px 0;
`;

// Função para determinar as chaves selecionadas no menu
const getSelectedKey = (pathname) => {
  if (pathname === '/') return 'home';
  if (pathname.startsWith('/pedidos')) return 'pedidos';
  if (pathname.startsWith('/producao')) return 'producao';
  if (pathname.startsWith('/catalogo')) return 'catalogo';
  if (pathname.startsWith('/clientes')) return 'clientes';
  if (pathname.startsWith('/config') || pathname.startsWith('/configuracoes')) return 'config';
  if (pathname.startsWith('/informacoes')) return 'informacoes';
  return '';
};

// Array de itens do menu com configuração de roles permitidas
const menuItems = [
  { key: 'home', icon: '🏠', text: 'Dashboard', to: '/', roles: ['admin', 'vendedor', 'producao'] },
  { key: 'pedidos', icon: '🛒', text: 'Pedidos', to: '/pedidos', roles: ['admin', 'vendedor'] },
  { key: 'producao', icon: '🔄', text: 'Produção', to: '/producao', roles: ['admin', 'producao'] },
  { key: 'clientes', icon: '👤', text: 'Clientes', to: '/clientes', roles: ['admin', 'vendedor'] }
];

export default function Header() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [menuVisible, setMenuVisible] = useState(false);
  const location = useLocation();
  const selectedKey = getSelectedKey(location.pathname);
  
  // Verificar a role no console
  console.log('Papel do usuário no Header:', user?.role);

  // Garantir que user.role é sempre string
  const userRole = user?.role || '';
  // Garantir nome correto
  const userName = user?.name || user?.nome || 'Usuário';

  // Filtrar itens do menu
  const filteredMenuItems = menuItems.filter(item => {
    if (!item.roles || item.roles.length === 0) return true;
    // Regra especial para Produção
    if (item.key === 'producao') {
      // Mostrar para admin OU usuário com funcoes_producao
      return userRole === 'admin' || (!!user && user.funcoes_producao);
    }
    return item.roles.includes(userRole);
  });
  
  const handleLogout = () => {
    logoutUser();
    setMenuVisible(false);
  };
  
  const handleSettings = () => {
    navigate('/configuracoes');
    setMenuVisible(false);
  };
  
  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };
  
  return (
    <StyledHeader>
      <Logo>Allia Admin</Logo>
      
      <Navigation>
        <NavLinks>
          {filteredMenuItems.map(item => (
            <NavLink 
              key={item.key}
              to={item.to}
              className={selectedKey === item.key ? 'active' : ''}
            >
              <span>{item.icon}</span>
              {item.text}
            </NavLink>
          ))}
        </NavLinks>
      </Navigation>
      
      <UserButton onClick={toggleMenu}>
        <span role="img" aria-label="user">👤</span>
        {userName}
      </UserButton>
      
      <DropdownMenu $visible={menuVisible}>
        <MenuItem onClick={() => { navigate('/perfil'); setMenuVisible(false); }}>
          <span role="img" aria-label="profile">👤</span>
          Meu Perfil
        </MenuItem>
        
        {userRole === 'admin' && (
          <MenuItem onClick={handleSettings}>
            <span role="img" aria-label="settings">⚙️</span>
            Configurações
          </MenuItem>
        )}
        
        <Divider />
        
        <MenuItem onClick={handleLogout}>
          <span role="img" aria-label="logout">🚪</span>
          Sair
        </MenuItem>
      </DropdownMenu>
    </StyledHeader>
  );
} 