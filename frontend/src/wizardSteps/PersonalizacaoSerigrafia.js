import React, { useState } from 'react';
import styled from 'styled-components';

const LOCAL_APLICACAO = [
  'Manga Direita',
  'Manga Esquerda',
  'Peito',
  'Costas',
  'Frente',
  'Lateral',
];
const CORES_PRESET = {
  brasil: ['#009739', '#FFCC29', '#3E4095', '#FFFFFF', '#002776'],
  alagoas: ['#009739', '#FFCC29', '#3E4095', '#FFFFFF', '#ED1C24', '#00ADEF'],
};

const Card = styled.div`
  background: #f8f9fa;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(21, 97, 111, 0.08);
  padding: 1.5rem 1.5rem 1rem 1.5rem;
  margin-bottom: 2rem;
`;
const Row = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
`;
const Label = styled.label`
  font-weight: 600;
  margin-bottom: 0.3rem;
  display: block;
`;
const Button = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 0.7rem 1.2rem;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  margin-right: 0.7rem;
  margin-bottom: 0.5rem;
  transition: background 0.2s;
  &:hover { background: #104e5e; }
`;
const Select = styled.select`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  font-size: 1rem;
`;
const Input = styled.input`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  font-size: 1rem;
  width: 100px;
`;
const ColorBox = styled.input.attrs({ type: 'color' })`
  width: 32px;
  height: 32px;
  border: none;
  margin-right: 0.4rem;
  cursor: pointer;
`;
const ImgPreview = styled.img`
  width: 70px;
  height: 70px;
  object-fit: cover;
  border-radius: 8px;
  margin-left: 1rem;
  cursor: zoom-in;
  border: 1.5px solid #e0e0e0;
`;

function getMenorValorIdx(aplics) {
  if (aplics.length < 2) return -1;
  let min = aplics[0].valor, idx = 0;
  aplics.forEach((a, i) => { if (a.valor < min) { min = a.valor; idx = i; } });
  return idx;
}

function handleRemoveAplic(idx, setAplicacoes, aplicacoes) {
  setAplicacoes(aplicacoes => aplicacoes.filter((_, i) => i !== idx));
}

function handleEditAplic(idx, aplicacoes, setAplic, setAplicacoes) {
  // Carrega a aplicação para edição
  setAplic(aplicacoes[idx]);
  handleRemoveAplic(idx, setAplicacoes, aplicacoes);
}

export default function PersonalizacaoSerigrafia({ aplicacoes, setAplicacoes, faixasSerigrafia = {}, quantidade = 1 }) {
  const [aplic, setAplic] = useState({
    tamanho: '',
    efeito: '',
    local: '',
    cores: [],
    nomesCores: [],
    qtdCores: 1,
    imagem: null,
    imagemUrl: '',
    nomeArte: '',
    obs: '',
    tamanhoPadrao: false,
  });
  const [showZoom, setShowZoom] = useState(null);

  function getValorFaixa(tamanho) {
    if (!faixasSerigrafia || !tamanho) return 0;
    let faixas = [];
    if (tamanho === 'A4' && faixasSerigrafia.a4) faixas = faixasSerigrafia.a4;
    if (tamanho === 'A3' && faixasSerigrafia.a3) faixas = faixasSerigrafia.a3;
    if (tamanho === 'Escudo' && faixasSerigrafia.escudo) faixas = faixasSerigrafia.escudo;
    const faixa = faixas.find(f => quantidade >= f.min && quantidade <= f.max);
    return faixa ? faixa.valor : 0;
  }

  function calcValorAplicacao(aplic) {
    let valor = getValorFaixa(aplic.tamanho);
    if (aplic.efeito === 'neon' || aplic.efeito === 'dourado' || aplic.efeito === 'prata') {
      valor *= 1.5;
    }
    const numCores = aplic.cores?.length || 0;
    if (numCores > 1) {
      valor += (numCores - 1) * 2;
    }
    return valor;
  }

  const handleAddAplic = () => {
    if (!aplic.tamanho || !aplic.local) {
      alert('Preencha o tamanho e o local da aplicação!');
      return;
    }
    const novaAplicacao = { ...aplic, valor: calcValorAplicacao(aplic) };
    console.log('[PersonalizacaoSerigrafia] Adicionando aplicação:', JSON.stringify(novaAplicacao, null, 2));
    setAplicacoes([...aplicacoes, novaAplicacao]);
    setAplic({ tamanho: '', efeito: '', local: '', cores: [], nomesCores: [], qtdCores: 1, imagem: null, imagemUrl: '', nomeArte: '', obs: '', tamanhoPadrao: false });
  };

  const handleCoresPreset = preset => {
    setAplic({ ...aplic, qtdCores: CORES_PRESET[preset].length, cores: CORES_PRESET[preset], nomesCores: Array(CORES_PRESET[preset].length).fill('') });
  };

  const handleCorChange = (idx, color) => {
    const cores = [...aplic.cores];
    cores[idx] = color;
    setAplic({ ...aplic, cores });
  };

  const handleCorNomeChange = (idx, nome) => {
    const nomesCores = [...aplic.nomesCores];
    nomesCores[idx] = nome;
    setAplic({ ...aplic, nomesCores });
  };

  const handleImage = e => {
    const file = e.target.files[0];
    if (file) {
      setAplic({ ...aplic, imagem: file, imagemUrl: URL.createObjectURL(file) });
    }
  };

  return (
    <div>
      <Card>
        <Row>
          <Label>Tamanho:</Label>
          {['A4', 'A3', 'Escudo'].map(tam => (
            <Button
              key={tam}
              type="button"
              onClick={() => setAplic({ ...aplic, tamanho: tam })}
              style={{ background: aplic.tamanho === tam ? '#15616f' : '#e0e0e0', color: aplic.tamanho === tam ? '#fff' : '#15616f', minWidth: 110 }}
            >
              {tam} (R$ {getValorFaixa(tam).toFixed(2)})
            </Button>
          ))}
        </Row>
        <Row>
          <Label>Efeito:</Label>
          {['', 'neon', 'dourado', 'prata'].map(ef => (
            <Button key={ef} type="button" onClick={() => setAplic({ ...aplic, efeito: ef })} style={{ background: aplic.efeito === ef ? '#15616f' : '#e0e0e0', color: aplic.efeito === ef ? '#fff' : '#15616f' }}>{ef || 'Normal'}</Button>
          ))}
        </Row>
        <Row>
          <Label>Local da aplicação:</Label>
          <Select value={aplic.local} onChange={e => setAplic({ ...aplic, local: e.target.value })}>
            <option value="">Selecione</option>
            {LOCAL_APLICACAO.map(loc => <option key={loc}>{loc}</option>)}
          </Select>
        </Row>
        <Row>
          <Label>Quantidade de cores:</Label>
          <Input type="number" min="1" max="10" value={aplic.qtdCores} onChange={e => setAplic({ ...aplic, qtdCores: Number(e.target.value), cores: Array(Number(e.target.value)).fill('#000000'), nomesCores: Array(Number(e.target.value)).fill('') })} />
          <Button type="button" onClick={() => handleCoresPreset('brasil')}>Bandeira do Brasil</Button>
          <Button type="button" onClick={() => handleCoresPreset('alagoas')}>Bandeira de Alagoas</Button>
        </Row>
        <Row>
          <Label>Cores:</Label>
          {Array.from({ length: aplic.qtdCores }).map((_, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', marginRight: 10 }}>
              <ColorBox value={aplic.cores[idx] || '#000000'} onChange={e => handleCorChange(idx, e.target.value)} />
              <Input
                type="text"
                placeholder={`Nome da cor ${idx + 1}`}
                value={aplic.nomesCores?.[idx] || ''}
                onChange={e => {
                  const nomesCores = [...(aplic.nomesCores || Array(aplic.qtdCores).fill(''))];
                  nomesCores[idx] = e.target.value;
                  setAplic({ ...aplic, nomesCores });
                }}
                style={{ width: 120, marginLeft: 5 }}
              />
            </div>
          ))}
        </Row>
        <Row>
          <Label>Nome da Arte:</Label>
          <Input type="text" value={aplic.nomeArte || ''} onChange={e => setAplic({ ...aplic, nomeArte: e.target.value })} placeholder="Nome da arte/desenho" />
        </Row>
        <Row>
          <Label>Observações:</Label>
          <Input type="text" value={aplic.obs || ''} onChange={e => setAplic({ ...aplic, obs: e.target.value })} placeholder="Observações desta aplicação" />
        </Row>
        <Row style={{ alignItems: 'center' }}>
          <input type="checkbox" id="tamanhoPadrao" checked={!!aplic.tamanhoPadrao} onChange={e => setAplic({ ...aplic, tamanhoPadrao: e.target.checked })} style={{ marginRight: 8 }} />
          <label htmlFor="tamanhoPadrao" style={{ fontWeight: 500, cursor: 'pointer' }}>Usar tamanho padrão
            <span style={{ color: '#22a2a2', marginLeft: 8, fontWeight: 400, fontSize: 14 }}>
              (Escudo: 10x10cm, A4: 28x21cm, A3: 36x28cm)
            </span>
          </label>
        </Row>
        <Row>
          <Label>Imagem da aplicação:</Label>
          <Input type="file" accept="image/*" onChange={handleImage} />
          {aplic.imagemUrl && <ImgPreview src={aplic.imagemUrl} alt="Preview" onClick={() => setShowZoom(aplic.imagemUrl)} />}
        </Row>
        <Button type="button" onClick={handleAddAplic}>Adicionar Aplicação</Button>
      </Card>
      {/* Lista de aplicações adicionadas */}
      {aplicacoes.length > 0 && aplicacoes.map((a, idx) => {
        console.log(`[PersonalizacaoSerigrafia] Renderizando card ${idx + 1}:`, JSON.stringify(a, null, 2));
        return (
          <Card key={idx} style={{ background: idx >= 2 ? '#e7f7f7' : '#f8f9fa', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
              <Button type="button" onClick={() => handleRemoveAplic(idx, setAplicacoes, aplicacoes)} style={{ background: '#dc3545', padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>Excluir</Button>
              <Button type="button" onClick={() => handleEditAplic(idx, aplicacoes, setAplic, setAplicacoes)} style={{ background: '#ffc107', color: '#333', padding: '0.4rem 0.8rem', fontSize: '0.9rem', marginLeft: '0.5rem' }}>Editar</Button>
            </div>
            <b>Aplicação {idx + 1}</b><br />
            Tamanho: {a.tamanho} | Valor: R$ {idx === getMenorValorIdx(aplicacoes) && aplicacoes.length > 1 ? (a.valor * 0.5).toFixed(2) : a.valor.toFixed(2)} {idx === getMenorValorIdx(aplicacoes) && aplicacoes.length > 1 ? '(50% desconto)' : ''}<br />
            Efeito: {a.efeito || 'Normal'}<br />
            Local: {a.local}<br />
            Cores: {
              a.cores && a.cores.length > 0 ? (
                a.cores.map((c, i) => (
                  <span key={i} style={{ display: 'inline-flex', alignItems: 'center', marginRight: '8px', marginBottom: '4px' }}>
                    <span 
                      style={{ 
                        background: c, 
                        display: 'inline-block', 
                        width: 18, 
                        height: 18, 
                        borderRadius: 4, 
                        marginRight: '4px', 
                        border: '1px solid #ccc' 
                      }} 
                      title={a.nomesCores?.[i] || c} 
                    />
                    {a.nomesCores?.[i] && <span style={{ fontSize: '0.9em', color: '#444' }}>{a.nomesCores[i]}</span>}
                  </span>
                ))
              ) : (
                ' Nenhuma cor selecionada'
              )
            }<br />
            Nome da Arte: {a.nomeArte || 'N/A'}<br />
            Observações: {a.obs || 'Nenhuma'}<br />
            Tamanho Padrão: {a.tamanhoPadrao ? 'Sim' : 'Não'}<br />
            {a.imagemUrl && <ImgPreview src={a.imagemUrl} alt="Preview" onClick={() => setShowZoom(a.imagemUrl)} />}
          </Card>
        );
      })}
      {/* Zoom da imagem */}
      {showZoom && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowZoom(null)}>
          <img src={showZoom} alt="Zoom" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 16, boxShadow: '0 8px 40px #0008' }} />
        </div>
      )}
    </div>
  );
}
