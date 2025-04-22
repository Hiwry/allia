import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const Section = styled.section`
  background: #fff;
  border-radius: 13px;
  box-shadow: 0 2px 12px rgba(23,42,58,0.07);
  padding: 32px 28px;
  margin-bottom: 28px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  border: 1px solid #e4e9ef;
  max-width: 600px;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
`;

const Label = styled.label`
  min-width: 180px;
  font-weight: 500;
  color: #22344a;
`;

const Input = styled.input`
  width: 120px;
  padding: 7px 10px;
  border-radius: 6px;
  border: 1px solid #cfd8dc;
  font-size: 1.05rem;
  background: #f9f9f9;
`;

const Button = styled.button`
  background: #22a2a2;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 9px 24px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
`;

const tiposPadrao = [
  'Serigrafia',
  'Sublimação Local',
  'Sublimação Total',
  'DTF',
  'Bordado',
  'Emborrachado',
  'Lisas',
];

// Componente reutilizável para faixas de valor por quantidade
function FaixasValor({ titulo, faixas, onAdd }) {
  const [nova, setNova] = React.useState({ min: '', max: '', valor: '' });
  return (
    <Section style={{marginTop:24, maxWidth:500}}>
      <h3 style={{marginBottom:12, color:'#15616f', fontSize:'1.1rem'}}>{titulo}</h3>
      <div style={{display:'flex',gap:10,alignItems:'center',marginBottom:12}}>
        <input
          type="number"
          min={1}
          placeholder="Qtd. mín."
          value={nova.min}
          onChange={e => setNova(n => ({...n, min: e.target.value}))}
          style={{width:80,padding:'6px 8px',borderRadius:6,border:'1px solid #cfd8dc'}}
        />
        <span>a</span>
        <input
          type="number"
          min={1}
          placeholder="Qtd. máx."
          value={nova.max}
          onChange={e => setNova(n => ({...n, max: e.target.value}))}
          style={{width:80,padding:'6px 8px',borderRadius:6,border:'1px solid #cfd8dc'}}
        />
        <input
          type="number"
          min={0}
          step={0.01}
          placeholder="Valor R$"
          value={nova.valor}
          onChange={e => setNova(n => ({...n, valor: e.target.value}))}
          style={{width:100,padding:'6px 8px',borderRadius:6,border:'1px solid #cfd8dc'}}
        />
        <button type="button" onClick={()=>{
          if(nova.min && nova.max && nova.valor) {
            onAdd({min: Number(nova.min), max: Number(nova.max), valor: Number(nova.valor)});
            setNova({min:'',max:'',valor:''});
          }
        }} style={{background:'#22a2a2',color:'#fff',border:'none',borderRadius:6,padding:'7px 16px',fontWeight:600,cursor:'pointer'}}>Adicionar</button>
      </div>
    </Section>
  );
}

export default function PersonalizacoesAdmin() {
  const [personalizacoes, setPersonalizacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState('');
  const [faixasSerigrafia, setFaixasSerigrafia] = useState([]);
  const [faixasA4, setFaixasA4] = useState([]);
  const [faixasA3, setFaixasA3] = useState([]);
  const [faixasEscudo, setFaixasEscudo] = useState([]);
  // Estados separados para nova faixa de cada tipo
  const [novaFaixaEscudo, setNovaFaixaEscudo] = useState({min:'', max:'', valor:''});
  const [novaFaixaA4, setNovaFaixaA4] = useState({min:'', max:'', valor:''});
  const [novaFaixaA3, setNovaFaixaA3] = useState({min:'', max:'', valor:''});

  useEffect(() => {
    // Buscar valores das personalizações do backend
    axios.get('/api/personalizacoes')
      .then(res => {
        const data = res.data;
        console.log('GET /api/personalizacoes:', data); // LOG FRONTEND
        if (data?.serigrafia) {
          setFaixasEscudo(data.serigrafia.escudo || []);
          setFaixasA4(data.serigrafia.a4 || []);
          setFaixasA3(data.serigrafia.a3 || []);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleValorChange = (idx, valor) => {
    setPersonalizacoes(list => list.map((p, i) => i === idx ? { ...p, valor } : p));
  };

  const handleSalvar = async () => {
    setSaving(true);
    setErro('');
    try {
      const payload = {
        serigrafia: {
          escudo: faixasEscudo,
          a4: faixasA4,
          a3: faixasA3,
        }
      };
      console.log('POST /api/personalizacoes payload:', payload); // LOG FRONTEND
      await axios.post('/api/personalizacoes', payload);
      // Após salvar, busca os dados atualizados e atualiza os estados
      const res = await axios.get('/api/personalizacoes');
      const data = res.data;
      console.log('GET /api/personalizacoes após salvar:', data);
      if (data?.serigrafia) {
        setFaixasEscudo(data.serigrafia.escudo || []);
        setFaixasA4(data.serigrafia.a4 || []);
        setFaixasA3(data.serigrafia.a3 || []);
      }
      setSaving(false);
    } catch (err) {
      setErro('Erro ao salvar personalizacoes.');
      setSaving(false);
    }
  };

  const addFaixaSerigrafia = faixa => setFaixasSerigrafia(faixas => [...faixas, faixa]);
  const addFaixaA4 = faixa => setFaixasA4(faixas => [...faixas, faixa]);
  const addFaixaA3 = faixa => setFaixasA3(faixas => [...faixas, faixa]);
  const addFaixaEscudo = faixa => setFaixasEscudo(faixas => [...faixas, faixa]);

  // Adiciona proteção para não salvar se houver campos de nova faixa preenchidos, mas não adicionados
  const hasPendingFaixa =
    novaFaixaEscudo.min || novaFaixaEscudo.max || novaFaixaEscudo.valor ||
    novaFaixaA4.min || novaFaixaA4.max || novaFaixaA4.valor ||
    novaFaixaA3.min || novaFaixaA3.max || novaFaixaA3.valor;

  if (loading) return <Section>Carregando...</Section>;

  return (
    <Section>
      <h2 style={{marginBottom:18}}>Valores das Personalizações</h2>
      {personalizacoes.map((p, idx) => (
        <Row key={p.tipo}>
          <Label>{p.tipo}</Label>
          <Input
            type="number"
            value={p.valor}
            min={0}
            step={0.01}
            onChange={e => handleValorChange(idx, e.target.value)}
            placeholder="Valor em R$"
          />
        </Row>
      ))}
      <Section>
        <h3 style={{marginBottom:12, color:'#15616f', fontSize:'1.1rem'}}>Serigrafia</h3>
        {[
          ['Escudo', faixasEscudo, setFaixasEscudo, novaFaixaEscudo, setNovaFaixaEscudo],
          ['A4', faixasA4, setFaixasA4, novaFaixaA4, setNovaFaixaA4],
          ['A3', faixasA3, setFaixasA3, novaFaixaA3, setNovaFaixaA3],
        ].map(([label, faixas, setFaixas, novaFaixa, setNovaFaixa]) => (
          <div key={label} style={{marginBottom:18}}>
            <div style={{fontWeight:600, marginBottom:6, color:'#22344a'}}>{label}</div>
            {faixas.length > 0 && faixas.map((faixa, idx) => (
              <Row key={idx}>
                <Input type="number" min={1} placeholder="Qtd. mín." value={faixa.min !== undefined ? Number(faixa.min) : ''} onChange={e => {
                  const copy = [...faixas]; copy[idx].min = e.target.value; setFaixas(copy);
                }} style={{width:80}} />
                <span>a</span>
                <Input type="number" min={1} placeholder="Qtd. máx." value={faixa.max !== undefined ? Number(faixa.max) : ''} onChange={e => {
                  const copy = [...faixas]; copy[idx].max = e.target.value; setFaixas(copy);
                }} style={{width:80}} />
                <Input type="number" min={0} step={0.01} placeholder="Valor R$" value={faixa.valor !== undefined ? Number(faixa.valor) : ''} onChange={e => {
                  const copy = [...faixas]; copy[idx].valor = e.target.value; setFaixas(copy);
                }} style={{width:100}} />
                <Button type="button" style={{background:'#d32f2f',padding:'5px 12px',marginLeft:8}} onClick={()=>{
                  setFaixas(faixas.filter((_,i)=>i!==idx));
                }}>Remover</Button>
              </Row>
            ))}
            <Row>
              <Input type="number" min={1} placeholder="Qtd. mín." value={novaFaixa.min} onChange={e => setNovaFaixa({...novaFaixa, min: e.target.value})} style={{width:80}} />
              <span>a</span>
              <Input type="number" min={1} placeholder="Qtd. máx." value={novaFaixa.max} onChange={e => setNovaFaixa({...novaFaixa, max: e.target.value})} style={{width:80}} />
              <Input type="number" min={0} step={0.01} placeholder="Valor R$" value={novaFaixa.valor} onChange={e => setNovaFaixa({...novaFaixa, valor: e.target.value})} style={{width:100}} />
              <Button type="button" style={{marginLeft:8}} onClick={()=>{
                if(novaFaixa.min && novaFaixa.max && novaFaixa.valor) {
                  setFaixas(faixas=>[...faixas, {min:Number(novaFaixa.min), max:Number(novaFaixa.max), valor:Number(novaFaixa.valor)}]);
                  setNovaFaixa({min:'', max:'', valor:''});
                }
              }}>Adicionar faixa</Button>
            </Row>
          </div>
        ))}
      </Section>
      <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12 }}>
        {erro && <span style={{ color: 'red', fontSize: '0.9rem' }}>{erro}</span>}
        {hasPendingFaixa && <span style={{ color: 'orange', fontSize: '0.9rem' }}>Você tem faixas não adicionadas. Clique em "Adicionar faixa" antes de salvar.</span>}
        <Button
          type="button"
          onClick={handleSalvar}
          disabled={saving || hasPendingFaixa}
          style={{ background: saving ? '#aaa' : '#15616f' }}
        >
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>
    </Section>
  );
}
