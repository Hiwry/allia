import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import OrderList from './OrderList';
import { getOrders } from '../services/api';

const Container = styled.main`
  margin: 0 auto;
  max-width: 1100px;
  padding: 48px 32px 32px 32px;
  min-height: 100vh;
`;

const Header = styled.header`
  padding: 2rem 1.5rem 1rem 1.5rem;
  background: #fff;
  border-bottom: 1px solid #e4e9ef;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 13px 13px 0 0;
  box-shadow: 0 2px 12px rgba(23,42,58,0.07);
`;

const Title = styled.h2`
  color: #172a3a;
  font-size: 2.1rem;
  font-weight: 700;
  margin: 0;
`;

const Button = styled.button`
  background: #172a3a;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(23,42,58,0.08);
  transition: background 0.2s;
  &:hover {
    background: #22344a;
  }
`;

const Cards = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  padding: 2rem 0 0 0;
  justify-content: flex-start;
`;

const Card = styled.div`
  background: #fff;
  border-radius: 13px;
  box-shadow: 0 2px 12px rgba(23,42,58,0.07);
  padding: 2rem 2.5rem;
  min-width: 260px;
  flex: 1 1 260px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  border: 1px solid #e4e9ef;
`;

const CardTitle = styled.div`
  color: #22344a;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const CardValue = styled.div`
  font-size: 2.2rem;
  font-weight: 700;
  color: #222;
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: ${({ isVisible }) => (isVisible ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
  z-index: 1000;
  
  &::after {
    content: '';
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #172a3a;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const RefreshButton = styled.button`
  background: transparent;
  color: #172a3a;
  border: 1px solid #172a3a;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  margin-left: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: #f5f7fa;
  }
`;

function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const navigate = useNavigate();

  // Função para buscar os pedidos
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getOrders();
      if (Array.isArray(data)) {
        console.log('Pedidos atualizados:', data.length);
        setOrders(data);
        setLastUpdate(new Date());
        setError(null);
      } else {
        console.error('Resposta da API não é um array:', data);
        setError('Formato de resposta inválido');
      }
    } catch (err) {
      console.error('Erro ao buscar pedidos:', err);
      setError('Falha ao carregar pedidos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Efeito para buscar os pedidos ao montar o componente e a cada 5 minutos
  useEffect(() => {
    fetchOrders();

    // Configura atualização automática a cada 5 minutos
    const interval = setInterval(() => {
      fetchOrders();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchOrders]);

  function handleSelect(order) {
    navigate(`/pedido/${order._id}`);
  }

  function handleRefresh() {
    fetchOrders();
  }

  // Formato de hora
  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Container>
      <LoadingOverlay isVisible={loading} />
      
      <Header>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Title>Dashboard</Title>
          {lastUpdate && (
            <RefreshButton onClick={handleRefresh}>
              <span role="img" aria-label="Refresh">🔄</span>
              Atualizar
            </RefreshButton>
          )}
        </div>
        <Button onClick={() => navigate('/novo-pedido')}>Novo Pedido</Button>
      </Header>
      
      {error && (
        <div style={{ padding: '1rem', background: '#ffebee', color: '#d32f2f', borderRadius: '8px', margin: '1rem 0' }}>
          {error}
        </div>
      )}
      
      <Cards>
        <Card>
          <CardTitle>Pedidos</CardTitle>
          <CardValue>{orders.length}</CardValue>
          {lastUpdate && <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.5rem' }}>Atualizado: {formatTime(lastUpdate)}</div>}
        </Card>
        <Card>
          <CardTitle>Vendas</CardTitle>
          <CardValue>{Array.isArray(orders) ? orders.filter(o => o.status === 'confirmado').length : 0}</CardValue>
        </Card>
      </Cards>
      <OrderList orders={orders} onSelect={handleSelect} />
    </Container>
  );
}

export default Dashboard;
