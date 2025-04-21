import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
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
              path="/" 
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
