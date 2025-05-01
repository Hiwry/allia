import React from 'react';
import styled from 'styled-components';
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

  const FAIXAS_SUB_TOTAL = [
    { min: 10, max: 29, label: '10-29', valor: 36.00 },
    { min: 30, max: 49, label: '30-49', valor: 34.95 },
    { min: 50, max: 99, label: '50-99', valor: 33.95 },
    { min: 100, max: 299, label: '100-299', valor: 32.30 },
    { min: 300, max: 499, label: '300-499', valor: 30.75 },
    { min: 500, max: 999, label: '500-999', valor: 29.95 },
    { min: 1000, max: 9999, label: '1000-9999', valor: 27.85 },
  ];
  const FAIXAS_SUB_LOCAL_ESCUDO = [
    { min: 1, max: 9, label: '1-9', valor: 10.50 },
    { min: 10, max: 29, label: '10-29', valor: 3.68 },
    { min: 30, max: 49, label: '30-49', valor: 3.44 },
    { min: 50, max: 99, label: '50-99', valor: 3.09 },
    { min: 100, max: 299, label: '100-299', valor: 2.68 },
    { min: 300, max: 499, label: '300-499', valor: 2.48 },
    { min: 500, max: 999, label: '500-999', valor: 2.18 },
    { min: 1000, max: 9999, label: '1000-9999', valor: 1.96 },
  ];
  const FAIXAS_SUB_LOCAL_MEIO = [
    { min: 1, max: 9, label: '1-9', valor: 11.64 },
    { min: 10, max: 29, label: '10-29', valor: 4.10 },
    { min: 30, max: 49, label: '30-49', valor: 3.84 },
    { min: 50, max: 99, label: '50-99', valor: 3.52 },
    { min: 100, max: 299, label: '100-299', valor: 3.19 },
    { min: 300, max: 499, label: '300-499', valor: 2.99 },
    { min: 500, max: 999, label: '500-999', valor: 2.42 },
    { min: 1000, max: 9999, label: '1000-9999', valor: 2.18 },
  ];
  const FAIXAS_SUB_LOCAL_A4 = [
    { min: 1, max: 9, label: '1-9', valor: 14.03 },
    { min: 10, max: 29, label: '10-29', valor: 6.44 },
    { min: 30, max: 49, label: '30-49', valor: 6.09 },
    { min: 50, max: 99, label: '50-99', valor: 5.67 },
    { min: 100, max: 299, label: '100-299', valor: 5.23 },
    { min: 300, max: 499, label: '300-499', valor: 4.98 },
    { min: 500, max: 999, label: '500-999', valor: 4.28 },
    { min: 1000, max: 9999, label: '1000-9999', valor: 3.81 },
  ];
  const FAIXAS_SUB_LOCAL_A3 = [
    { min: 1, max: 9, label: '1-9', valor: 19.84 },
    { min: 10, max: 29, label: '10-29', valor: 6.94 },
    { min: 30, max: 49, label: '30-49', valor: 6.44 },
    { min: 50, max: 99, label: '50-99', valor: 5.94 },
    { min: 100, max: 299, label: '100-299', valor: 5.49 },
    { min: 300, max: 499, label: '300-499', valor: 5.13 },
    { min: 500, max: 999, label: '500-999', valor: 4.63 },
    { min: 1000, max: 9999, label: '1000-9999', valor: 3.89 },
  ];
  const FAIXAS_SERIGRAFIA_ESCUDO = [
    { min: 10, max: 29, label: '10-29', valor: 5.46 },
    { min: 30, max: 49, label: '30-49', valor: 4.62 },
    { min: 50, max: 99, label: '50-99', valor: 3.94 },
    { min: 100, max: 299, label: '100-299', valor: 3.43 },
    { min: 300, max: 499, label: '300-499', valor: 2.93 },
    { min: 500, max: 999, label: '500-999', valor: 2.54 },
    { min: 1000, max: 9999, label: '1000-9999', valor: 2.18 },
  ];
  const FAIXAS_SERIGRAFIA_A4 = [
    { min: 10, max: 29, label: '10-29', valor: 6.46 },
    { min: 30, max: 49, label: '30-49', valor: 5.94 },
    { min: 50, max: 99, label: '50-99', valor: 5.23 },
    { min: 100, max: 299, label: '100-299', valor: 4.73 },
    { min: 300, max: 499, label: '300-499', valor: 4.23 },
    { min: 500, max: 999, label: '500-999', valor: 3.83 },
    { min: 1000, max: 9999, label: '1000-9999', valor: 3.18 },
  ];
  const FAIXAS_SERIGRAFIA_A3 = [
    { min: 10, max: 29, label: '10-29', valor: 7.94 },
    { min: 30, max: 49, label: '30-49', valor: 7.43 },
    { min: 50, max: 99, label: '50-99', valor: 6.73 },
    { min: 100, max: 299, label: '100-299', valor: 6.23 },
    { min: 300, max: 499, label: '300-499', valor: 5.73 },
    { min: 500, max: 999, label: '500-999', valor: 5.33 },
    { min: 1000, max: 9999, label: '1000-9999', valor: 4.68 },
  ];
  const FAIXAS_SERIGRAFIA_COR = [
    { min: 10, max: 29, label: '10-29', valor: 1.71 },
    { min: 30, max: 49, label: '30-49', valor: 1.79 },
    { min: 50, max: 99, label: '50-99', valor: 1.83 },
    { min: 100, max: 299, label: '100-299', valor: 1.89 },
    { min: 300, max: 499, label: '300-499', valor: 1.93 },
    { min: 500, max: 999, label: '500-999', valor: 1.98 },
    { min: 1000, max: 9999, label: '1000-9999', valor: 2.01 },
  ];
  const FAIXAS_DTF_ESCUDO = [
    { min: 1, max: 5, label: '1-5', valor: 7.00 },
    { min: 6, max: 19, label: '6-19', valor: 5.50 },
    { min: 20, max: 49, label: '20-49', valor: 4.00 },
    { min: 50, max: 9999, label: '50+', valor: 2.50 },
  ];
  const FAIXAS_DTF_A4 = [
    { min: 1, max: 5, label: '1-5', valor: 20.00 },
    { min: 6, max: 19, label: '6-19', valor: 15.00 },
    { min: 20, max: 49, label: '20-49', valor: 12.00 },
    { min: 50, max: 9999, label: '50+', valor: 10.00 },
  ];
  const FAIXAS_DTF_A3 = [
    { min: 1, max: 5, label: '1-5', valor: 40.00 },
    { min: 6, max: 19, label: '6-19', valor: 30.00 },
    { min: 20, max: 49, label: '20-49', valor: 25.00 },
    { min: 50, max: 9999, label: '50+', valor: 20.00 },
  ];
  const FAIXAS_EMBORRACHADO_ESCUDO = [
    { min: 10, max: 29, label: '10-29', valor: 10.92 },
    { min: 30, max: 49, label: '30-49', valor: 9.64 },
    { min: 50, max: 99, label: '50-99', valor: 8.92 },
    { min: 100, max: 299, label: '100-299', valor: 8.45 },
    { min: 300, max: 499, label: '300-499', valor: 7.99 },
    { min: 500, max: 999, label: '500-999', valor: 7.54 },
    { min: 1000, max: 9999, label: '1000-9999', valor: 6.92 },
  ];
  const FAIXAS_EMBORRACHADO_A4 = [
    { min: 10, max: 29, label: '10-29', valor: 17.86 },
    { min: 30, max: 49, label: '30-49', valor: 16.43 },
    { min: 50, max: 99, label: '50-99', valor: 15.31 },
    { min: 100, max: 299, label: '100-299', valor: 14.38 },
    { min: 300, max: 499, label: '300-499', valor: 13.81 },
    { min: 500, max: 999, label: '500-999', valor: 13.18 },
    { min: 1000, max: 9999, label: '1000-9999', valor: 12.31 },
  ];
  const FAIXAS_EMBORRACHADO_A3 = [
    { min: 10, max: 29, label: '10-29', valor: 25.40 },
    { min: 30, max: 49, label: '30-49', valor: 23.36 },
    { min: 50, max: 99, label: '50-99', valor: 21.85 },
    { min: 100, max: 299, label: '100-299', valor: 20.77 },
    { min: 300, max: 499, label: '300-499', valor: 19.81 },
    { min: 500, max: 999, label: '500-999', valor: 19.13 },
    { min: 1000, max: 9999, label: '1000-9999', valor: 18.31 },
  ];
  const FAIXAS_EMBORRACHADO_COR = [
    { min: 10, max: 29, label: '10-29', valor: 3.60 },
    { min: 30, max: 49, label: '30-49', valor: 3.42 },
    { min: 50, max: 99, label: '50-99', valor: 3.18 },
    { min: 100, max: 299, label: '100-299', valor: 2.93 },
    { min: 300, max: 499, label: '300-499', valor: 2.81 },
    { min: 500, max: 999, label: '500-999', valor: 2.64 },
    { min: 1000, max: 9999, label: '1000-9999', valor: 2.31 },
  ];

  const TIPOS_PERSONALIZACAO = [
    { tipo: 'sublimacao_total', label: 'Sublimação Total', faixas: FAIXAS_SUB_TOTAL },
    { tipo: 'sublimacao_local_escudo', label: 'Sublimação Local - Escudo', faixas: FAIXAS_SUB_LOCAL_ESCUDO },
    { tipo: 'sublimacao_local_1_2', label: 'Sublimação Local - 1/2 A4', faixas: FAIXAS_SUB_LOCAL_MEIO },
    { tipo: 'sublimacao_local_a4', label: 'Sublimação Local - A4', faixas: FAIXAS_SUB_LOCAL_A4 },
    { tipo: 'sublimacao_local_a3', label: 'Sublimação Local - A3', faixas: FAIXAS_SUB_LOCAL_A3 },
    { tipo: 'serigrafia_escudo', label: 'Serigrafia - Escudo', faixas: FAIXAS_SERIGRAFIA_ESCUDO },
    { tipo: 'serigrafia_a4', label: 'Serigrafia - A4', faixas: FAIXAS_SERIGRAFIA_A4 },
    { tipo: 'serigrafia_a3', label: 'Serigrafia - A3', faixas: FAIXAS_SERIGRAFIA_A3 },
    { tipo: 'serigrafia_cor', label: 'Serigrafia - Cor', faixas: FAIXAS_SERIGRAFIA_COR },
    { tipo: 'dtf_escudo', label: 'DTF - Escudo', faixas: FAIXAS_DTF_ESCUDO },
    { tipo: 'dtf_a4', label: 'DTF - A4', faixas: FAIXAS_DTF_A4 },
    { tipo: 'dtf_a3', label: 'DTF - A3', faixas: FAIXAS_DTF_A3 },
    { tipo: 'emborrachado_escudo', label: 'Emborrachado - Escudo', faixas: FAIXAS_EMBORRACHADO_ESCUDO },
    { tipo: 'emborrachado_a4', label: 'Emborrachado - A4', faixas: FAIXAS_EMBORRACHADO_A4 },
    { tipo: 'emborrachado_a3', label: 'Emborrachado - A3', faixas: FAIXAS_EMBORRACHADO_A3 },
    { tipo: 'emborrachado_cor', label: 'Emborrachado - Cor', faixas: FAIXAS_EMBORRACHADO_COR },
  ];

  const [faixasPersonalizacao, setFaixasPersonalizacao] = React.useState(() => {
    const base = {};
    TIPOS_PERSONALIZACAO.forEach(tp => {
      base[tp.tipo] = (tp.faixas || []).map(faixa => ({ ...faixa }));
    });
    return base;
  });
  const [editFaixas, setEditFaixas] = React.useState(faixasPersonalizacao);
  const [editando, setEditando] = React.useState(false);
  const [showSerigrafia, setShowSerigrafia] = React.useState(false);

  const handleFaixaChange = (tipo, idx, campo, value) => {
    setEditFaixas(f => ({
      ...f,
      [tipo]: f[tipo].map((faixa, i) => i === idx ? { ...faixa, [campo]: campo === 'valor' ? Number(value) : value } : faixa)
    }));
  };

  const handleSalvarFaixas = () => {
    setFaixasPersonalizacao(editFaixas);
    setEditando(false);
    alert('Valores de personalização salvos!');
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
      {/* Card de edição de valores de personalização */}
      {showSerigrafia && (
        <SerigrafiaCard id="serigrafia-card">
          <h2 style={{color:'#15616f',marginBottom:18}}>Valores de Personalização</h2>
          <div style={{marginBottom:16}}>
            {!editando ? (
              <SaveButton type="button" onClick={()=>setEditando(true)}>Editar Valores</SaveButton>
            ) : (
              <SaveButton type="button" onClick={handleSalvarFaixas}>Salvar Valores</SaveButton>
            )}
          </div>
          {TIPOS_PERSONALIZACAO.map(tp => (
            <div key={tp.tipo} style={{marginBottom: 32}}>
              <div style={{fontWeight:700, color:'#15616f', fontSize:'1.13em', marginBottom: 4, textTransform:'capitalize'}}>{tp.label}</div>
              <FaixaTable>
                <thead>
                  <tr>
                    <th>Faixa</th>
                    <th>Qtd. Mín</th>
                    <th>Qtd. Máx</th>
                    <th>Valor (R$)</th>
                  </tr>
                </thead>
                <tbody>
                  {editFaixas[tp.tipo].map((faixa, idx) => (
                    <tr key={tp.tipo+idx}>
                      <td>{faixa.label}</td>
                      <td>{faixa.min}</td>
                      <td>{faixa.max === Infinity ? '∞' : faixa.max}</td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={faixa.valor}
                          onChange={e => handleFaixaChange(tp.tipo, idx, 'valor', e.target.value)}
                          style={{ width: 70, textAlign: 'right' }}
                          disabled={!editando}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </FaixaTable>
            </div>
          ))}
        </SerigrafiaCard>
      )}
    </Container>
  );
}
