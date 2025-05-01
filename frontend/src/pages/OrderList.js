import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import StatusTag from '../components/StatusTag';

const ListContainer = styled.section`
  background: #fff;
  border-radius: 13px;
  box-shadow: 0 2px 12px rgba(23,42,58,0.07);
  padding: 32px 28px;
  margin-top: 32px;
  border: 1px solid #e4e9ef;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 10px 8px;
  color: #22344a;
  font-size: 1.08rem;
  font-weight: 600;
  border-bottom: 2px solid #e4e9ef;
`;

const Td = styled.td`
  padding: 12px 8px;
  color: #22344a;
  font-size: 1.03rem;
  border-bottom: 1px solid #f1f3f7;
`;

const Row = styled.tr`
  &:hover {
    background: #f7fafc;
    cursor: pointer;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
`;

const Title = styled.h2`
  color: #172a3a;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
`;

const Button = styled.button`
  background: #172a3a;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1.4rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(23,42,58,0.08);
  transition: background 0.2s;
  &:hover {
    background: #22344a;
  }
`;

const ActionButton = styled.button`
  background: #22a2a2;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 4px 12px;
  font-size: 0.9rem;
  cursor: pointer;
  
  &:hover {
    background: #1b8a8a;
  }
`;

export default function OrderList({ orders = [], onSelect }) {
  const navigate = useNavigate();
  
  // Se não houver pedidos passados, usamos uma lista vazia (não mais mockamos dados)
  const data = Array.isArray(orders) ? orders : [];
  const handleSelect = onSelect || ((order) => navigate(`/pedido/${order._id}`));

  // Função para formatar o ID do pedido para ser mais legível
  const formatOrderId = (id) => {
    if (!id) return '-';
    // Exibir apenas os últimos 6 caracteres do ID como código de pedido
    return id.slice(-6);
  };

  // Função para formatar o valor total do pedido
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return '-';
    return `R$ ${Number(value).toFixed(2)}`;
  };

  // Função para copiar o link de confirmação
  const handleCopyLink = (e, pedido) => {
    e.stopPropagation();
    
    if (!pedido.confirmacaoClienteToken) {
      alert('Token de confirmação não encontrado para este pedido.');
      return;
    }
    
    const confirmationLink = `${window.location.origin}/confirmacao/${pedido.confirmacaoClienteToken}`;
    navigator.clipboard.writeText(confirmationLink)
      .then(() => alert('Link copiado para a área de transferência!'))
      .catch(() => alert('Erro ao copiar o link.'));
  };

  return (
    <ListContainer>
      <Header>
        <Title>Pedidos</Title>
        <Button onClick={() => navigate('/novo-pedido')}>Novo Pedido</Button>
      </Header>
      <Table>
        <thead>
          <tr>
            <Th>ID</Th>
            <Th>Cliente</Th>
            <Th>Total</Th>
            <Th>Status</Th>
            <Th>Vendedor</Th>
            <Th>Loja</Th>
            <Th>Ações</Th>
            <Th>Link</Th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 && (
            <Row>
              <Td colSpan={8} style={{textAlign: 'center', color: '#8fa1b3', padding: '32px 0'}}>Nenhum pedido cadastrado.</Td>
            </Row>
          )}
          {data.map((order) => (
            <Row key={order._id} onClick={() => handleSelect(order)}>
              <Td>{formatOrderId(order._id)}</Td>
              <Td>{order.cliente?.nome || (order.cliente?.nomeCompleto) || 'Cliente não informado'}</Td>
              <Td>{formatCurrency(order.valorTotal)}</Td>
              <Td>{order.status ? <StatusTag status={order.status} /> : '-'}</Td>
              <Td>{order.nomeVendedor || order.vendedorNome || (order.vendedor && typeof order.vendedor === 'object' ? (order.vendedor.nome || order.vendedor.name || 'Não informado') : (order.vendedor || 'Não informado'))}</Td>
              <Td>{order.nomeLoja || (order.vendedor && typeof order.vendedor === 'object' ? (order.vendedor.loja || '-') : (order.loja || '-'))}</Td>
              <Td>
                <ActionButton onClick={(e) => { e.stopPropagation(); handleSelect(order); }}>
                  Ver Detalhes
                </ActionButton>
              </Td>
              <Td>
                {/* Mostra o botão apenas para pedidos pendentes de confirmação */}
                {order.status === 'pendente_confirmacao_cliente' && (
                  <button 
                    style={{ 
                      background: '#eee', 
                      color: '#15616f', 
                      border: 'none', 
                      borderRadius: 6, 
                      padding: '4px 10px', 
                      cursor: 'pointer', 
                      fontSize: 13 
                    }} 
                    onClick={(e) => handleCopyLink(e, order)}
                  >
                    Copiar Link
                  </button>
                )}
                {order.status === 'confirmado' && (
                  <span style={{ color: '#22a2a2', fontWeight: 600 }}>Confirmado</span>
                )}
              </Td>
            </Row>
          ))}
        </tbody>
      </Table>
    </ListContainer>
  );
}
