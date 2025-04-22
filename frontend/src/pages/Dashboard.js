import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
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
    <Layout>
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
    </Layout>
  );
}

export default Dashboard;
