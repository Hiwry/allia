import React, { useState } from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';

const SidebarContainerMono = styled.nav`
  position: fixed;
  left: 0;
  top: 0;
  width: ${props => (props.open ? '220px' : '72px')};
  height: 100vh;
  background: #181c22;
  color: #e0e4ea;
  transition: width 0.18s cubic-bezier(.4,0,.2,1);
  box-shadow: 2px 0 10px rgba(0,0,0,0.02);
  display: flex;
  flex-direction: column;
  z-index: 100;
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: #e0e4ea;
  margin: 18px 0 18px 18px;
  font-size: 1.7rem;
  cursor: pointer;
  align-self: flex-start;
  outline: none;
`;

const SidebarContent = styled.div`
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 36px;
  padding: 0 18px;
`;

const Menu = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const SidebarTitle = styled.h3`
  font-size: 1.15rem;
  font-weight: 600;
  color: #e0e4ea;
  margin-bottom: 6px;
  letter-spacing: 0.5px;
`;

const MenuItemMono = styled(NavLink)`
  display: block;
  font-size: 1.05rem;
  padding: 8px 0 8px 10px;
  border-radius: 6px;
  color: #b0bec5;
  text-decoration: none;
  transition: background 0.13s, color 0.13s;
  margin-right: 8px;
  font-weight: 500;
  &.active, &:hover {
    background: #23272f;
    color: #fff;
  }
`;

const InfoBoxMono = styled.div`
  background: #20232a;
  border-radius: 7px;
  padding: 13px 13px 10px 13px;
  font-size: 0.98rem;
  color: #b0bec5;
  margin-top: 18px;
  box-shadow: 0 1px 3px 0 rgba(0,0,0,0.04);
  strong {
    color: #fff;
    font-size: 1.02rem;
    display: block;
    margin-bottom: 4px;
  }
`;

// Badge monocromático minimalista
const Badge = styled.span`
  display: inline-block;
  min-width: 20px;
  padding: 0 6px;
  border-radius: 10px;
  font-size: 0.91em;
  font-weight: 500;
  color: #222;
  background: #e0e4ea;
  margin-left: 6px;
`;

// Ícone monocromático (usando unicode simples)
const Icon = styled.span`
  display: inline-flex;
  align-items: center;
  font-size: 1.22em;
  color: #b0bec5;
  margin-right: ${({ open }) => open ? '10px' : '0'};
  transition: margin 0.2s, color 0.2s;
`;

export default function Sidebar() {
  const [open, setOpen] = useState(true);
  // Ícones unicode minimalistas
  const menuItems = [
    { to: '/dashboard', label: 'Dashboard', icon: '\u25A0' }, // ■
    { to: '/pedidos', label: 'Pedidos', icon: '\u25A1' },    // □
    { to: '/producao', label: 'Produção', icon: '\u2699' },  // ⚙
    { to: '/usuarios', label: 'Usuários', icon: '\u25CF' },  // ●
    { to: '/configuracoes', label: 'Configurações', icon: '\u25CB' }, // ○
    { to: '/catalogo', label: 'Catálogo de Itens', icon: '\u25B2' }, // ▲
  ];
  const pedidosPendentes = 5;
  return (
    <SidebarContainerMono open={open} aria-label="Menu lateral minimalista">
      <ToggleButton onClick={() => setOpen(o => !o)} title={open ? 'Recolher' : 'Expandir'} aria-label={open ? 'Recolher menu' : 'Expandir menu'}>
        {open ? '⟨' : '⟩'}
      </ToggleButton>
      <SidebarContent style={{ alignItems: open ? 'stretch' : 'center', padding: open ? '0 16px' : '0 4px' }}>
        <div>
          {open && <SidebarTitle>Admin</SidebarTitle>}
          <Menu>
            {menuItems.map(item => (
              <li key={item.to} style={{ width: '100%' }}>
                <MenuItemMono to={item.to} aria-label={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: open ? 'flex-start' : 'center', paddingLeft: open ? 10 : 0, fontSize: '1.05rem', position: 'relative' }}>
                  <Icon open={open}>{item.icon}</Icon>
                  {open && item.label}
                  {item.to === '/pedidos' && pedidosPendentes > 0 && (
                    <Badge>{pedidosPendentes}</Badge>
                  )}
                </MenuItemMono>
              </li>
            ))}
          </Menu>
        </div>
        <InfoBoxMono style={{ textAlign: open ? 'left' : 'center', padding: open ? undefined : '10px 2px' }}>
          <strong style={{ fontSize: open ? '1.01rem' : '0.93rem' }}>Informações</strong><br/>
          <span style={{ color: '#b0bec5', fontSize: open ? '1em' : '0.97em' }}>
            Status: <Badge>Online</Badge><br/>
            Pedidos pendentes: <Badge>{pedidosPendentes}</Badge>
          </span>
        </InfoBoxMono>
      </SidebarContent>
    </SidebarContainerMono>
  );
}
