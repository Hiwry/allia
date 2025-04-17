import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import OrderList from './OrderList';
import { getOrders } from '../services/api';

const Container = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  padding: 2rem 1.5rem 1rem 1.5rem;
  background: #fff;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 2.1rem;
  font-weight: 700;
  margin: 0;
`;

const Button = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(21, 97, 111, 0.08);
  transition: background 0.2s;
  &:hover {
    background: #104e5e;
  }
`;

const Cards = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  padding: 2rem 1.5rem;
  justify-content: flex-start;
`;

const Card = styled.div`
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(21, 97, 111, 0.07);
  padding: 2rem 2.5rem;
  min-width: 260px;
  flex: 1 1 260px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const CardTitle = styled.div`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const CardValue = styled.div`
  font-size: 2.2rem;
  font-weight: 700;
  color: #222;
`;

function Dashboard() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getOrders()
      .then(data => Array.isArray(data) ? setOrders(data) : setOrders([]))
      .catch(() => setOrders([]));
  }, []);

  function handleSelect(order) {
    navigate(`/pedido/${order._id}`);
  }

  return (
    <Container>
      <Header>
        <Title>Dashboard</Title>
        <Button onClick={() => navigate('/novo-pedido')}>Novo Pedido</Button>
      </Header>
      <Cards>
        <Card>
          <CardTitle>Pedidos</CardTitle>
          <CardValue>{orders.length}</CardValue>
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
