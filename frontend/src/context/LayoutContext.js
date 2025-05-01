import React, { createContext, useContext } from 'react';

// Cria um contexto para controlar o layout da aplicação
const LayoutContext = createContext();

export function LayoutProvider({ children }) {
  // Funções simplificadas para manter compatibilidade
  const registerSidebar = () => false;
  const expectSidebar = () => () => {};
  const setLayoutMounted = () => {};

  return (
    <LayoutContext.Provider value={{ 
      registerSidebar, 
      expectSidebar,
      sidebarExpected: false,
      sidebarRendered: false,
      layoutReady: true,
      setLayoutMounted
    }}>
      {children}
    </LayoutContext.Provider>
  );
}

// Hook para acessar o contexto de layout
export function useLayout() {
  return useContext(LayoutContext);
} 