import React, { useState } from 'react';
import styled from 'styled-components';

// Valores dobrados da serigrafia
const CARD_VALUES = { A4: 20, A3: 36, Escudo: 14 };
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

function calcValorAplicacao(aplic) {
  let valor = CARD_VALUES[aplic.tamanho] || 0;
  valor += aplic.cores?.length ? aplic.cores.length * 4 : 0; // Exemplo: R$4 por cor (dobrado)
  return valor;
}

// Função para garantir que o array de cores sempre tenha o tamanho correto
function corrigirCores(aplic) {
  let cores = Array.from({ length: aplic.qtdCores }).map((_, i) => aplic.cores?.[i] || '#000000');
  return { ...aplic, cores };
}

export default function PersonalizacaoEmborrachado({ aplicacoes, setAplicacoes }) {
  const [aplic, setAplic] = useState({
    tamanho: '',
    local: '',
    cores: [],
    qtdCores: 1,
    nomesCores: [],
    imagem: null,
    imagemUrl: '',
  });
  const [showZoom, setShowZoom] = useState(null);

  const handleAddAplic = () => {
    if (!aplic.tamanho || !aplic.local) return;
    // Corrige o array de cores antes de salvar
    const aplicCorrigida = corrigirCores(aplic);
    setAplicacoes([...aplicacoes, { ...aplicCorrigida, valor: calcValorAplicacao(aplicCorrigida) }]);
    setAplic({ tamanho: '', local: '', cores: [], qtdCores: 1, nomesCores: [], imagem: null, imagemUrl: '' });
  };

  const handleCoresPreset = preset => {
    setAplic({ ...aplic, qtdCores: CORES_PRESET[preset].length, cores: CORES_PRESET[preset], nomesCores: Array(CORES_PRESET[preset].length).fill('') });
  };

  const handleCorChange = (idx, color) => {
    const cores = [...aplic.cores];
    cores[idx] = color;
    setAplic({ ...aplic, cores });
  };

  const handleCorNameChange = (idx, name) => {
    const nomesCores = [...aplic.nomesCores];
    nomesCores[idx] = name;
    setAplic({ ...aplic, nomesCores });
  };

  const handleImage = async e => {
    const file = e.target.files[0];
    if (file) {
      // Upload para o backend
      const { uploadImage } = await import('../services/api');
      const resp = await uploadImage(file);
      if (resp.url) {
        setAplic({ ...aplic, imagem: file, imagemUrl: resp.url });
      } else {
        setAplic({ ...aplic, imagem: file, imagemUrl: '' });
      }
    }
  };

  // Desconto: da 3ª aplicação em diante, apenas nas de menor valor
  const sortedAplics = [...aplicacoes]
    .map((a, idx) => ({ ...a, originalIdx: idx }))
    .sort((a, b) => b.valor - a.valor);
  let descontoAplics = sortedAplics.map((a, idx) => ({ ...a, valorFinal: a.valor, desconto: false }));
  if (descontoAplics.length > 2) {
    // As duas de maior valor NÃO recebem desconto
    // Da terceira em diante, só as de menor valor recebem desconto
    // Identificar o menor valor entre as aplicações a partir da terceira
    const aplicsParaDesconto = descontoAplics.slice(2);
    const menorValor = Math.min(...aplicsParaDesconto.map(a => a.valor));
    descontoAplics = descontoAplics.map((a, idx) => {
      if (idx >= 2 && a.valor === menorValor) {
        return { ...a, valorFinal: a.valor * 0.5, desconto: true };
      }
      return a;
    });
  }
  // Restaurar a ordem original para exibição
  const descontoAplicsExibicao = [...descontoAplics].sort((a, b) => a.originalIdx - b.originalIdx);

  return (
    <div>
      <Card>
        <Row>
          <Label>Tamanho:</Label>
          {Object.keys(CARD_VALUES).map(tam => (
            <Button key={tam} type="button" onClick={() => setAplic({ ...aplic, tamanho: tam })} style={{ background: aplic.tamanho === tam ? '#15616f' : '#e0e0e0', color: aplic.tamanho === tam ? '#fff' : '#15616f' }}>{tam} (R$ {CARD_VALUES[tam]})</Button>
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
          <Label>Imagem da aplicação:</Label>
          <Input type="file" accept="image/*" onChange={handleImage} />
          {aplic.imagemUrl && <ImgPreview src={aplic.imagemUrl} alt="Preview" onClick={() => setShowZoom(aplic.imagemUrl)} />}
        </Row>
        <Button type="button" onClick={handleAddAplic}>Adicionar Aplicação</Button>
      </Card>
      {/* Lista de aplicações adicionadas */}
      {descontoAplicsExibicao.length > 0 && descontoAplicsExibicao.map((a, idx) => (
        <Card key={idx} style={{ background: a.desconto ? '#e7f7f7' : '#f8f9fa' }}>
          <b>Aplicação {idx + 1}</b><br />
          Tamanho: {a.tamanho} | Valor: R$ {a.valorFinal.toFixed(2)} {a.desconto ? '(50% desconto)' : ''}<br />
          Local: {a.local}<br />
          Cores: {a.cores && a.cores.map((c, i) => <span key={i} style={{ background: c, display: 'inline-block', width: 18, height: 18, borderRadius: 4, marginRight: 3, border: '1px solid #ccc' }} />)}<br />
          Nomes das Cores: {a.nomesCores && a.nomesCores.map((n, i) => <span key={i}>{n}</span>)}<br />
          {a.imagemUrl && <ImgPreview src={a.imagemUrl} alt="Preview" onClick={() => setShowZoom(a.imagemUrl)} style={{ width: 40, height: 40 }} />}
        </Card>
      ))}
      {/* Zoom da imagem */}
      {showZoom && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowZoom(null)}>
          <img src={showZoom} alt="Zoom" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 16, boxShadow: '0 8px 40px #0008' }} />
        </div>
      )}
    </div>
  );
}
