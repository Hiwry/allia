import React from 'react';
import styled from 'styled-components';
import Header from './Header';

// Componente estilizado para o layout
const LayoutWrapper = styled.div`
  min-height: 100vh;
`;

const MainContent = styled.main`
  margin: 24px 16px;
  padding: 24px;
  background: #fff;
  min-height: 280px;
  border-radius: 4px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
`;

const MainLayout = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

export default function Layout({ children }) {
  return (
    <MainLayout data-testid="main-layout">
      <LayoutWrapper>
        <Header />
        <MainContent>
          {children}
        </MainContent>
      </LayoutWrapper>
    </MainLayout>
  );
}
