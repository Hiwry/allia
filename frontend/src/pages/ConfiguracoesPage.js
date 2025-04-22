import React from 'react';
import styled from 'styled-components';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  max-width: 1100px;
  margin: 2.5rem auto;
  padding: 2.5rem 1.5rem;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 28px rgba(21, 97, 111, 0.10);
`;

const Title = styled.h1`
  color: #15616f;
  font-size: 2.1rem;
  font-weight: 700;
  margin-bottom: 2.5rem;
  text-align: left;
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 2rem;
`;

const Card = styled.button`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background: #f7fafc;
  border: none;
  border-radius: 14px;
  box-shadow: 0 2px 12px rgba(23,42,58,0.07);
  padding: 2.2rem 1.5rem 1.6rem 1.5rem;
  cursor: pointer;
  transition: box-shadow 0.18s, background 0.18s;
  &:hover {
    background: #e2f2f7;
    box-shadow: 0 4px 18px rgba(21, 97, 111, 0.14);
  }
`;

const CardTitle = styled.div`
  font-size: 1.18rem;
  font-weight: 700;
  color: #15616f;
  margin-bottom: 0.6rem;
  display: flex;
  align-items: center;
`;

const CardDesc = styled.div`
  font-size: 1rem;
  color: #22344a;
  opacity: 0.85;
`;

const Icon = styled.span`
  font-size: 1.6rem;
  margin-right: 0.75rem;
  color: #15616f;
`;

const SerigrafiaCard = styled.div`
  background: #f7fafc;
  border-radius: 14px;
  box-shadow: 0 2px 12px rgba(23,42,58,0.07);
  padding: 2.2rem 1.5rem 1.6rem 1.5rem;
  margin-top: 2rem;
`;

const FaixaTable = styled.table`
  width: 100%;
  margin-top: 1.2rem;
  border-collapse: collapse;
  th, td { padding: 0.6rem 0.8rem; border: 1px solid #e0e0e0; }
  th { background: #e2f2f7; color: #15616f; font-weight: bold; }
`;

const SaveButton = styled.button`
  background: #15616f;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  margin-top: 1.2rem;
  cursor: pointer;
  transition: background 0.18s;
  &:hover { background: #104e5e; }
`;

export default function ConfiguracoesPage() {
  const navigate = useNavigate();

  // Faixas padrão conforme solicitado
  const FAIXAS_PADRAO = [
    { min: 10, max: 29, label: '10-29' },
    { min: 30, max: 49, label: '30-49' },
    { min: 50, max: 99, label: '50-99' },
    { min: 100, max: 299, label: '100-299' },
    { min: 300, max: 499, label: '300-499' },
    { min: 500, max: 999, label: '500-999' },
    { min: 1000, max: Infinity, label: '1000+' }
  ];
  const TIPOS_SERIGRAFIA = ['escudo', 'a3', 'a4', 'cor'];

  // Estado inicial dos valores
  const [faixas, setFaixas] = React.useState(
    Object.fromEntries(TIPOS_SERIGRAFIA.map(tipo => [
      tipo,
      FAIXAS_PADRAO.map(faixa => ({ ...faixa, valor: 0 }))
    ]))
  );
  const [editFaixas, setEditFaixas] = React.useState(faixas);
  const [editando, setEditando] = React.useState(false);
  const [showSerigrafia, setShowSerigrafia] = React.useState(false);

  const handleFaixaChange = (tipo, idx, campo, value) => {
    setEditFaixas(f => ({
      ...f,
      [tipo]: f[tipo].map((faixa, i) => i === idx ? { ...faixa, [campo]: campo === 'valor' ? Number(value) : Number(value) } : faixa)
    }));
  };

  const handleSalvarFaixas = () => {
    setFaixas(editFaixas);
    setEditando(false);
    alert('Valores de serigrafia salvos!');
  };

  const cards = [
    {
      title: 'Usuários',
      desc: 'Gerencie os usuários do sistema, permissões e funções.',
      icon: '👤',
      to: '/usuarios',
    },
    {
      title: 'Costura',
      desc: 'Configure opções de costura, tecidos, detalhes e cortes.',
      icon: '🧵',
      to: '/catalogo',
    },
    {
      title: 'Personalização',
      desc: 'Gerencie tipos de personalização disponíveis e valores da serigrafia.',
      icon: '🎨',
      to: '/configuracoes#serigrafia',
    },
    {
      title: 'Gestão de Pedidos',
      desc: 'Acesse e configure fluxos de pedidos e produção.',
      icon: '📦',
      to: '/pedidos',
    },
  ];
  return (
    <Layout>
      <Container>
        <Title>Configurações</Title>
        <CardsGrid>
          {cards.map(card => (
            <Card key={card.title} onClick={() => {
              if(card.to.startsWith('/configuracoes#serigrafia')) {
                setShowSerigrafia(s => !s);
                setTimeout(() => {
                  if (!showSerigrafia) document.getElementById('serigrafia-card')?.scrollIntoView({behavior:'smooth'});
                }, 100);
              } else {
                navigate(card.to);
              }
            }}>
              <CardTitle><Icon>{card.icon}</Icon>{card.title}</CardTitle>
              <CardDesc>{card.desc}</CardDesc>
            </Card>
          ))}
        </CardsGrid>
        {/* Card de edição de valores da serigrafia */}
        {showSerigrafia && (
          <SerigrafiaCard id="serigrafia-card">
            <h2 style={{color:'#15616f',marginBottom:18}}>Valores Serigrafia</h2>
            <FaixaTable>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Faixa</th>
                  <th>Qtd. Mín</th>
                  <th>Qtd. Máx</th>
                  <th>Valor (R$)</th>
                </tr>
              </thead>
              <tbody>
                {TIPOS_SERIGRAFIA.map(tipo => (
                  editFaixas[tipo].map((faixa, idx) => (
                    <tr key={tipo+idx}>
                      <td style={{fontWeight:600}}>{tipo.toUpperCase()}</td>
                      <td>{faixa.label}</td>
                      <td><input type="number" value={faixa.min} min={1} style={{width:60}} disabled /></td>
                      <td><input type="number" value={faixa.max === Infinity ? '' : faixa.max} min={faixa.min} style={{width:60}} disabled /></td>
                      <td><input type="number" value={faixa.valor} min={0} step={0.01} style={{width:80}} onChange={e=>handleFaixaChange(tipo,idx,'valor',e.target.value)} disabled={!editando}/></td>
                    </tr>
                  ))
                ))}
              </tbody>
            </FaixaTable>
            {!editando ? (
              <SaveButton type="button" onClick={()=>setEditando(true)}>Editar Valores</SaveButton>
            ) : (
              <SaveButton type="button" onClick={handleSalvarFaixas}>Salvar</SaveButton>
            )}
          </SerigrafiaCard>
        )}
      </Container>
    </Layout>
  );
}
