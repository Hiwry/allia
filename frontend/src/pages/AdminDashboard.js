import React, { useState } from 'react';
import styled from 'styled-components';
import PersonalizacoesAdmin from './PersonalizacoesAdmin';
import CatalogoCosturaAdmin from './CatalogoCosturaAdmin';

const Container = styled.main`
  margin: 0 auto;
  max-width: 1100px;
  padding: 48px 32px 32px 32px;
  min-height: 100vh;
`;

const Title = styled.h1`
  font-size: 2.3rem;
  font-weight: 700;
  color: #172a3a;
  margin-bottom: 32px;
`;

const Section = styled.section`
  background: #fff;
  border-radius: 13px;
  box-shadow: 0 2px 12px rgba(23,42,58,0.07);
  padding: 32px 28px;
  margin-bottom: 28px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border: 1px solid #e4e9ef;
`;

const SectionTitle = styled.h2`
  font-size: 1.2rem;
  font-weight: 600;
  color: #22344a;
  margin-bottom: 16px;
`;

const Placeholder = styled.div`
  color: #8fa1b3;
  font-size: 1.05rem;
  padding: 12px 0 0 0;
`;

const CardSelector = styled.div`
  display: flex;
  gap: 32px;
  margin-bottom: 32px;
`;

const CardButton = styled.div`
  flex: 1;
  background: ${({ $active }) => $active ? '#22a2a2' : '#fff'};
  color: ${({ $active }) => $active ? '#fff' : '#22344a'};
  border-radius: 15px;
  box-shadow: 0 2px 16px rgba(23,42,58,0.07);
  padding: 38px 0 32px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  border: 2px solid ${({ $active }) => $active ? '#22a2a2' : '#e4e9ef'};
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border 0.15s;
  min-width: 220px;
  min-height: 120px;
  user-select: none;
`;

export default function AdminDashboard() {
  const [aba, setAba] = useState('costura');
  return (
    <Container>
      <Title>Painel do Admin</Title>
      <CardSelector>
        <CardButton $active={aba==='costura'} onClick={()=>setAba('costura')}>
          <span style={{fontSize:36,marginBottom:10}}>🧵</span>
          Costura
        </CardButton>
        <CardButton $active={aba==='personalizacoes'} onClick={()=>setAba('personalizacoes')}>
          <span style={{fontSize:36,marginBottom:10}}>🎨</span>
          Personalização
        </CardButton>
      </CardSelector>
      {aba === 'costura' && (
        <Section>
          <SectionTitle>Catálogo de Itens da Costura</SectionTitle>
          <CatalogoCosturaAdmin />
        </Section>
      )}
      {aba === 'personalizacoes' && (
        <PersonalizacoesAdmin />
      )}
    </Container>
  );
}
