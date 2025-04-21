import React, { useState } from 'react';
import styled from 'styled-components';

const CARD_VALUES = {
  Escudo: [7.0, 5.5, 4.0, 3.0],
  A4: [20.0, 15.0, 12.5, 10.0],
  A3: [40.0, 30.0, 25.0, 20.0],
};
const QTD_INTERVALS = [5, 19, 49];
const LOCAL_APLICACAO = [
  'Manga Direita',
  'Manga Esquerda',
  'Peito',
  'Costas',
  'Frente',
  'Lateral',
];

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
const ImgPreview = styled.img`
  width: 70px;
  height: 70px;
  object-fit: cover;
  border-radius: 8px;
  margin-left: 1rem;
  cursor: zoom-in;
  border: 1.5px solid #e0e0e0;
`;

function calcValorDTF(tamanho, qtd) {
  const values = CARD_VALUES[tamanho];
  if (!values) return 0;
  if (qtd <= QTD_INTERVALS[0]) return values[0];
  if (qtd <= QTD_INTERVALS[1]) return values[1];
  if (qtd <= QTD_INTERVALS[2]) return values[2];
  return values[3];
}

export default function PersonalizacaoDTF({ aplicacoes, setAplicacoes }) {
  const [aplic, setAplic] = useState({
    tamanho: '',
    local: '',
    qtd: 1,
    imagem: null,
    imagemUrl: '',
  });
  const [showZoom, setShowZoom] = useState(null);

  const handleAddAplic = () => {
    if (!aplic.tamanho || !aplic.local || !aplic.qtd) return;
    setAplicacoes([
      ...aplicacoes,
      {
        ...aplic,
        valorUnit: calcValorDTF(aplic.tamanho, aplic.qtd),
        valorTotal: calcValorDTF(aplic.tamanho, aplic.qtd) * aplic.qtd,
      },
    ]);
    setAplic({ tamanho: '', local: '', qtd: 1, imagem: null, imagemUrl: '' });
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
          {Object.keys(CARD_VALUES).map(tam => (
            <Button key={tam} type="button" onClick={() => setAplic({ ...aplic, tamanho: tam })} style={{ background: aplic.tamanho === tam ? '#15616f' : '#e0e0e0', color: aplic.tamanho === tam ? '#fff' : '#15616f' }}>{tam}</Button>
          ))}
        </Row>
        <Row>
          <Label>Quantidade:</Label>
          <Input type="number" min="1" value={aplic.qtd} onChange={e => setAplic({ ...aplic, qtd: Number(e.target.value) })} />
        </Row>
        <Row>
          <Label>Local da aplicação:</Label>
          <Select value={aplic.local} onChange={e => setAplic({ ...aplic, local: e.target.value })}>
            <option value="">Selecione</option>
            {LOCAL_APLICACAO.map(loc => <option key={loc}>{loc}</option>)}
          </Select>
        </Row>
        <Row>
          <Label>Imagem da aplicação:</Label>
          <Input type="file" accept="image/*" onChange={handleImage} />
          {aplic.imagemUrl && <ImgPreview src={aplic.imagemUrl} alt="Preview" onClick={() => setShowZoom(aplic.imagemUrl)} />}
        </Row>
        <Button type="button" onClick={handleAddAplic}>Adicionar Aplicação</Button>
      </Card>
      {/* Lista de aplicações adicionadas */}
      {aplicacoes.length > 0 && aplicacoes.map((a, idx) => (
        <Card key={idx}>
          <b>Aplicação {idx + 1}</b><br />
          Tamanho: {a.tamanho}<br />
          Quantidade: {a.qtd}<br />
          Valor unitário: R$ {a.valorUnit.toFixed(2)}<br />
          Valor total: R$ {a.valorTotal.toFixed(2)}<br />
          Local: {a.local}<br />
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
