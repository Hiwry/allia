import React from 'react';
import CatalogoItensPage from './CatalogoItensPage';

// Componente wrapper para reutilizar CatalogoItensPage na aba de Costura do admin
export default function CatalogoCosturaAdmin() {
  // Aqui futuramente você pode passar props específicas ou customizar ainda mais
  return <CatalogoItensPage minimalista />;
}
