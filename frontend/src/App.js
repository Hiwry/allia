import React from 'react';
<<<<<<< HEAD
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
=======
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
>>>>>>> 4b938adcf806d3d2cd967dfc8bb80932662d410a
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
<<<<<<< HEAD
import Dashboard from './pages/Dashboard';
import OrderList from './pages/OrderList';
import UsuariosPage from './pages/UsuariosPage';
import CatalogoItensPage from './pages/CatalogoItensPage';
import ConfiguracoesPage from './pages/ConfiguracoesPage';
=======
>>>>>>> 4b938adcf806d3d2cd967dfc8bb80932662d410a

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
<<<<<<< HEAD
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
=======
>>>>>>> 4b938adcf806d3d2cd967dfc8bb80932662d410a
              path="/" 
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
<<<<<<< HEAD
            <Route path="*" element={<Navigate to="/login" replace />} />
=======
>>>>>>> 4b938adcf806d3d2cd967dfc8bb80932662d410a
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
