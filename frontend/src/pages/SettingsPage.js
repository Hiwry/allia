import React from 'react';
import Layout from '../components/Layout';
import styled from 'styled-components';

const Container = styled.main`
  margin: 0 auto;
  max-width: 900px;
  padding: 48px 32px 32px 32px;
  min-height: 100vh;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #172a3a;
  margin-bottom: 32px;
`;

const Placeholder = styled.div`
  color: #8fa1b3;
  font-size: 1.1rem;
  padding: 20px 0;
`;

export default function SettingsPage() {
  return (
    <Layout>
      <Container>
        <Title>Configurações</Title>
        <Placeholder>Em breve: configurações do sistema.</Placeholder>
      </Container>
    </Layout>
  );
}
