import React from 'react';
import styled from 'styled-components';

// Mapeamento de status para cores e textos legíveis
const STATUS_CONFIG = {
  // Status de fluxo normal
  pendente_confirmacao_cliente: { bg: '#e74c3c', color: '#fff', text: 'Aguardando Confirmação' },
  confirmado: { bg: '#27ae60', color: '#fff', text: 'Confirmado' },
  producao: { bg: '#f39c12', color: '#fff', text: 'Em Produção' },
  concluido: { bg: '#2980b9', color: '#fff', text: 'Concluído' },
  entregue: { bg: '#8e44ad', color: '#fff', text: 'Entregue' },
  
  // Status de etapas de produção
  conferencia: { bg: '#34495e', color: '#fff', text: 'Conferência' },
  corte: { bg: '#3498db', color: '#fff', text: 'Corte' },
  costura: { bg: '#1abc9c', color: '#fff', text: 'Costura' },
  personalizacao: { bg: '#9b59b6', color: '#fff', text: 'Personalização' },
  limpeza: { bg: '#16a085', color: '#fff', text: 'Limpeza' },
  
  // Status alternativos
  cancelado: { bg: '#7f8c8d', color: '#fff', text: 'Cancelado' },
  
  // Status padrão para qualquer valor não mapeado
  default: { bg: '#95a5a6', color: '#fff', text: 'Status Desconhecido' }
};

const Tag = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
  background-color: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
  text-align: center;
  white-space: nowrap;
`;

/**
 * Componente para exibir o status de um pedido de forma padronizada
 * @param {Object} props - Propriedades do componente
 * @param {string} props.status - O status do pedido a ser exibido
 * @returns {React.ReactElement} Um componente de tag de status estilizado
 */
const StatusTag = ({ status }) => {
  // Se não houver status ou for string vazia, retorna um traço
  if (!status) {
    return <span>-</span>;
  }
  
  // Obtém a configuração para o status, ou usa o padrão caso não esteja mapeado
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.default;
  
  // Se o status não estiver mapeado, usa o próprio valor como texto
  const displayText = (STATUS_CONFIG[status] ? config.text : status);
  
  return (
    <Tag $bg={config.bg} $color={config.color}>
      {displayText}
    </Tag>
  );
};

export default StatusTag; 