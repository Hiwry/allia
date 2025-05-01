import React from 'react';
import { render, screen } from '@testing-library/react';

describe('Hello component', () => {
  it('renderiza corretamente', () => {
    render(<div>Olá, mundo!</div>);
    expect(screen.getByText('Olá, mundo!')).toBeInTheDocument();
  });
});
