import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { AuthContext } from '../context/AuthContext';

// Componentes mock para simular as rotas
const Home = () => <div>Home Page</div>;
const Login = () => <div>Login Page</div>;
const Protected = () => <div>Protected Content</div>;

function renderWithAuth({ isAuthenticated, user, allowedRoles }) {
  return render(
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      token: isAuthenticated ? 'token' : null
    }}>
      <MemoryRouter initialEntries={['/protegido']}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
          <Route
            path="/protegido"
            element={
              <ProtectedRoute allowedRoles={allowedRoles}>
                <Protected />
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe('ProtectedRoute', () => {
  it('redireciona para o login se não estiver autenticado', () => {
    renderWithAuth({ isAuthenticated: false, user: null, allowedRoles: ['admin'] });
    expect(screen.getByText(/Login Page/i)).toBeInTheDocument();
  });

  it('permite acesso se autenticado e com papel correto', () => {
    renderWithAuth({ isAuthenticated: true, user: { role: 'admin' }, allowedRoles: ['admin'] });
    expect(screen.getByText(/Protected Content/i)).toBeInTheDocument();
  });

  it('redireciona para home se autenticado mas sem papel permitido', () => {
    renderWithAuth({ isAuthenticated: true, user: { role: 'user' }, allowedRoles: ['admin'] });
    expect(screen.getByText(/Home Page/i)).toBeInTheDocument();
  });
});
