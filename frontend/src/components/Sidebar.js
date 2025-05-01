import React, { useState, useLayoutEffect, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { useLayout, LAYOUT_SIDEBAR_MARKER } from '../context/LayoutContext';
import { useAuth } from '../context/AuthContext';

// Componente estilizado para a Sidebar
const StyledSidebar = styled.aside`
  height: 100vh;
  position: fixed;
  left: 0;
  z-index: 999;
  box-shadow: 2px 0 8px 0 rgba(29, 35, 41, 0.05);
  background: #ffffff;
  width: ${props => props.$collapsed ? '80px' : '250px'};
  transition: width 0.3s;
`;

const Logo = styled.div`
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: #1a3c40;
  
  h1 {
    color: white;
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
  }
`;

const MenuList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 12px 0;
`;

const MenuItem = styled.div`
  padding: 15px 20px;
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: ${({ $active }) => ($active ? 'bold' : 'normal')};
  background-color: ${({ $active }) => ($active ? '#f5f5f5' : 'transparent')};
  border-left: ${({ $active }) => ($active ? '3px solid #1890ff' : 'none')};
  transition: all 0.2s;
  
  &:hover {
    background-color: ${({ $active }) => ($active ? '#f5f5f5' : '#f9f9f9')};
  }
  
  svg {
    margin-right: 10px;
  }
`;

const MenuLink = styled(Link)`
  display: flex;
  align-items: center;
  padding: 12px 20px;
  text-decoration: none;
  color: #22344a;
  font-weight: 500;
  gap: 12px;
  transition: background 0.2s;
  
  &:hover {
    background: #f0f5ff;
  }
  
  &.active {
    background: #e6f7ff;
    color: #1a3c40;
    font-weight: 600;
    border-right: 3px solid #1a3c40;
  }
  
  .menu-icon {
    font-size: 18px;
    min-width: ${props => props.$collapsed ? '100%' : '24px'};
    text-align: ${props => props.$collapsed ? 'center' : 'left'};
  }
  
  .menu-text {
    display: ${props => props.$collapsed ? 'none' : 'inline'};
  }
`;

const CollapseButton = styled.button`
  position: absolute;
  bottom: 12px;
  left: ${props => props.$collapsed ? '20px' : '200px'};
  background: #f0f2f5;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  padding: 8px;
  transition: left 0.3s;
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
  { key: 'clientes', icon: '👤', text: 'Clientes', to: '/clientes', roles: ['admin', 'vendedor'] },
  { key: 'config', icon: '⚙️', text: 'Configurações', to: '/configuracoes', roles: ['admin'] }
];

// Verificar se já existe uma sidebar no DOM
const hasSidebarInDOM = () => {
  return !!document.querySelector('.allia-sidebar-container');
};

export default function Sidebar({ onCollapse }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const [shouldRender, setShouldRender] = useState(false);
  const { registerSidebar, sidebarExpected, layoutReady } = useLayout();
  const renderAttemptRef = useRef(false);
  const sidebarRef = useRef(null);
  const { hasAccess } = useAuth();
  
  // Manipulador de colapso
  const handleCollapse = () => {
    const newCollapsedState = !collapsed;
    setCollapsed(newCollapsedState);
    if (onCollapse) {
      onCollapse(newCollapsedState);
    }
  };
  
  // Verificar se já existe uma sidebar e não renderizar outra
  useLayoutEffect(() => {
    if (hasSidebarInDOM() && !sidebarRef.current) {
      setShouldRender(false);
      return;
    }
    
    // Se já tentou renderizar nesta sessão, não tentar novamente
    if (renderAttemptRef.current) {
      return;
    }
    
    // Verifica se o Layout está esperando uma sidebar
    const shouldRenderSidebar = () => {
      // Usando o contexto para verificar
      if (sidebarExpected && layoutReady) {
        return true;
      }
      
      // Como fallback, verificamos o DOM
      return !!document.getElementById(LAYOUT_SIDEBAR_MARKER);
    };
    
    if (shouldRenderSidebar() && !hasSidebarInDOM()) {
      const canRender = registerSidebar();
      setShouldRender(canRender);
      renderAttemptRef.current = true;
    }
  }, [registerSidebar, sidebarExpected, layoutReady]);
  
  // Cleanup ao desmontar o componente
  useEffect(() => {
    return () => {
      renderAttemptRef.current = false;
    };
  }, []);
  
  // Evitar recarregar ao mudar de rota
  useEffect(() => {
    // Não fazemos nada aqui, apenas garantimos que não se atualize
  }, [location.pathname]);
  
  // Se não deve renderizar, não retorna nada
  if (!shouldRender) {
    return null;
  }
  
  const selectedKey = getSelectedKey(location.pathname);
  
  return (
    <StyledSidebar
      ref={sidebarRef}
      $collapsed={collapsed}
      className="allia-sidebar-container"
      data-sidebar-rendered="true"
      id="allia-sidebar-element"
    >
      <Logo>
        <h1>{collapsed ? 'A' : 'Allia Admin'}</h1>
      </Logo>
      
      <MenuList>
        {menuItems.filter(item => hasAccess(item.roles)).map(item => (
          <MenuLink 
            key={item.key}
            to={item.to}
            className={selectedKey === item.key ? 'active' : ''}
            $collapsed={collapsed}
          >
            <span className="menu-icon">{item.icon}</span>
            <span className="menu-text">{item.text}</span>
          </MenuLink>
        ))}
      </MenuList>
      
      <CollapseButton 
        onClick={handleCollapse} 
        $collapsed={collapsed}
        title={collapsed ? 'Expandir' : 'Recolher'}
      >
        {collapsed ? '→' : '←'}
      </CollapseButton>
    </StyledSidebar>
  );
}
