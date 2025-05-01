import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { AuthProvider } from './context/AuthContext';
import { LayoutProvider } from './context/LayoutContext';
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
import ClientesPage from './pages/ClientesPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <AuthProvider>
          <LayoutProvider>
            <GlobalStyle />
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/confirmacao/:token" element={<OrderConfirmationClient />} />
              
              {/* Rotas apenas para vendedor e admin */}
              <Route 
                path="/pedidos" 
                element={
                  <ProtectedRoute allowedRoles={['admin', 'vendedor']}>
                    <PedidosPage />
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/novo-pedido" 
                element={
                  <ProtectedRoute allowedRoles={['admin', 'vendedor']}>
                    <NewOrderWizard />
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/clientes" 
                element={
                  <ProtectedRoute allowedRoles={['admin', 'vendedor']}>
                    <ClientesPage />
                  </ProtectedRoute>
                }
              />
              
              {/* Rotas só para admin */}
              <Route 
                path="/producao" 
                element={
                  <ProtectedRoute allowedRoles={['admin', 'producao']}>
                    <ProducaoKanban />
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/catalogo" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <CatalogoItensPage />
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/usuarios" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <UsuariosPage />
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/configuracoes" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ConfiguracoesPage />
                  </ProtectedRoute>
                }
              />
              
              {/* Dashboard para todos */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/perfil" 
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </LayoutProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
