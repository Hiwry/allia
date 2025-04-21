import React from 'react';
import Layout from '../components/Layout';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

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

export default function OrderList({ orders = [], onSelect }) {
  const navigate = useNavigate();
  // Exemplo: para a tela de pedidos protegida, o Layout deve envolver tudo
  // Se orders e onSelect não forem passados, pode buscar localmente ou mockar
  const mockOrders = [
    { id: 1, cliente: 'João Silva', total: 250.5, status: 'pendente' },
    { id: 2, cliente: 'Maria Souza', total: 180.0, status: 'confirmado' },
  ];
  const handleSelect = onSelect || (() => {});
  const data = orders.length > 0 ? orders : mockOrders;

  return (
    <Layout>
      <Header>
        <Title>Pedidos</Title>
        <Button onClick={() => navigate('/novo-pedido')}>Novo Pedido</Button>
      </Header>
      <ListContainer>
        <Table>
          <thead>
            <tr>
              <Th>Cliente</Th>
              <Th>Total</Th>
              <Th>Status</Th>
              <Th>Ações</Th>
              <Th>Link</Th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <Row>
                <Td colSpan={5} style={{textAlign: 'center', color: '#8fa1b3', padding: '32px 0'}}>Nenhum pedido cadastrado.</Td>
              </Row>
            )}
            {data.map((order, idx) => (
              <Row key={order.id || idx} onClick={() => handleSelect(order)}>
                <Td>{order.cliente || '-'}</Td>
                <Td>R$ {order.total?.toFixed(2) || '-'}</Td>
                <Td style={{color: order.status === 'pendente' ? '#d32f2f' : '#22a2a2', fontWeight: 600}}>{order.status === 'pendente' ? 'Aguardando Confirmação' : 'Confirmado'}</Td>
                <Td>
                  <button style={{ background: '#22a2a2', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 12px', cursor: 'pointer' }} onClick={e => { e.stopPropagation(); handleSelect(order); }}>Ver Detalhes</button>
                </Td>
                <Td>
                  {order.status === 'pendente' && (
                    <button style={{ background: '#eee', color: '#15616f', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 13 }} onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(`${window.location.origin}/pedido/${order.id}`); alert('Link copiado! Envie ao cliente para confirmação.'); }}>Copiar Link</button>
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
    </Layout>
  );
}
