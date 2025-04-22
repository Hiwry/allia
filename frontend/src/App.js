import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { AuthProvider } from './context/AuthContext';
import { GlobalStyle } from './globalStyles';
import { theme } from './theme';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import NewOrderWizard from './pages/NewOrderWizard';
import PedidosPage from './pages/PedidosPage';
import OrderConfirmationClient from './pages/OrderConfirmationClient';
import ProducaoPage from './pages/ProducaoPage';
import ProducaoKanban from './pages/ProducaoKanban';
import Dashboard from './pages/Dashboard';
import OrderList from './pages/OrderList';
import UsuariosPage from './pages/UsuariosPage';
import CatalogoItensPage from './pages/CatalogoItensPage';
import ConfiguracoesPage from './pages/ConfiguracoesPage';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <GlobalStyle />
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/pedido" element={<NewOrderWizard />} />
            <Route path="/confirmacao/:token" element={<OrderConfirmationClient />} />
            <Route 
              path="/dashboard/*" 
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/pedidos" 
              element={
                <ProtectedRoute>
                  <PedidosPage />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/producao" 
              element={
                <ProtectedRoute>
                  <ProducaoKanban />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/novo-pedido" 
              element={
                <ProtectedRoute>
                  <NewOrderWizard />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/pedido/:id" 
              element={<OrderConfirmationClient />} 
            />
            <Route 
              path="/order-list" 
              element={
                <ProtectedRoute>
                  <OrderList />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/usuarios" 
              element={
                <ProtectedRoute>
                  <UsuariosPage />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/catalogo" 
              element={
                <ProtectedRoute>
                  <CatalogoItensPage />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/configuracoes" 
              element={
                <ProtectedRoute>
                  <ConfiguracoesPage />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
