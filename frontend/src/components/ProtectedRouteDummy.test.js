import React from 'react';
import { render, screen } from '@testing-library/react';
import ProtectedRoute from './ProtectedRoute';

describe('ProtectedRoute Dummy', () => {
  it('renderiza um children básico', () => {
    render(<ProtectedRoute allowedRoles={[]}><div>Teste Dummy</div></ProtectedRoute>);
    // Não testamos lógica de autenticação aqui, só renderização
  });
});
