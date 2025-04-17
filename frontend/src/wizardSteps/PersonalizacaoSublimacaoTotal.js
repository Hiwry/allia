import React, { useState } from 'react';
import styled from 'styled-components';

const adicionaisPadrao = [
  'Etiqueta interna personalizada',
  'Etiqueta externa personalizada',
  'Etiqueta de composição',
  'Embalagem individual',
  'Tag personalizada',
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
const Input = styled.input`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  font-size: 1rem;
`;
const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  margin-right: 0.5rem;
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

export default function PersonalizacaoSublimacaoTotal({ aplicacoes, setAplicacoes }) {
  const [aplic, setAplic] = useState({
    imagem: null,
    imagemUrl: '',
    gola: '',
    punhoSublimado: false,
    marcaDagua: false,
    adicionais: [],
  });
  const [showZoom, setShowZoom] = useState(null);

  const handleImage = e => {
    const file = e.target.files[0];
    if (file) {
      setAplic({ ...aplic, imagem: file, imagemUrl: URL.createObjectURL(file) });
    }
  };

  const handleAdicional = (ad) => {
    setAplic((prev) => ({
      ...prev,
      adicionais: prev.adicionais.includes(ad)
        ? prev.adicionais.filter(a => a !== ad)
        : [...prev.adicionais, ad],
    }));
  };

  const handleAddAplic = () => {
    if (!aplic.imagemUrl) return;
    setAplicacoes([...aplicacoes, { ...aplic }]);
    setAplic({ imagem: null, imagemUrl: '', gola: '', punhoSublimado: false, marcaDagua: false, adicionais: [] });
  };

  return (
    <div>
      <Card>
        <Row>
          <Label>Imagem principal (alta qualidade):</Label>
          <Input type="file" accept="image/*" onChange={handleImage} />
          {aplic.imagemUrl && <ImgPreview src={aplic.imagemUrl} alt="Preview" onClick={() => setShowZoom(aplic.imagemUrl)} />}
        </Row>
        <Row>
          <Label>Gola:</Label>
          <Input type="text" placeholder="Tipo de gola" value={aplic.gola} onChange={e => setAplic({ ...aplic, gola: e.target.value })} />
        </Row>
        <Row>
          <Checkbox checked={aplic.punhoSublimado} onChange={e => setAplic({ ...aplic, punhoSublimado: e.target.checked })} />
          <Label>Punho sublimado</Label>
        </Row>
        <Row>
          <Checkbox checked={aplic.marcaDagua} onChange={e => setAplic({ ...aplic, marcaDagua: e.target.checked })} />
          <Label>Marca d’água</Label>
        </Row>
        <Row>
          <Label>Adicionais:</Label>
          {adicionaisPadrao.map(ad => (
            <label key={ad} style={{ marginRight: 12 }}>
              <Checkbox checked={aplic.adicionais.includes(ad)} onChange={() => handleAdicional(ad)} />
              {ad}
            </label>
          ))}
        </Row>
        <Button type="button" onClick={handleAddAplic}>Adicionar Sublimação Total</Button>
      </Card>
      {/* Lista de aplicações adicionadas */}
      {aplicacoes.length > 0 && aplicacoes.map((a, idx) => (
        <Card key={idx}>
          <b>Sublimação Total {idx + 1}</b><br />
          Gola: {a.gola}<br />
          Punho sublimado: {a.punhoSublimado ? 'Sim' : 'Não'}<br />
          Marca d’água: {a.marcaDagua ? 'Sim' : 'Não'}<br />
          Adicionais: {a.adicionais && a.adicionais.join(', ')}<br />
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
