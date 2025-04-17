import React from 'react';
import { ThemeProvider } from 'styled-components';
import { theme } from './theme';
import { GlobalStyle } from './globalStyles';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import NewOrderWizard from './pages/NewOrderWizard';
import StepCostura from './wizardSteps/StepCostura';
import OrderConfirmationClient from './pages/OrderConfirmationClient';
import OrderList from './pages/OrderList';

// Esqueleto para expansão futura (Dashboard, Pedido, etc)
function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/novo-pedido" element={
            <ProtectedRoute>
              <NewOrderWizard />
            </ProtectedRoute>
          } />
          <Route path="/pedido/:id" element={<OrderConfirmationClient />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
