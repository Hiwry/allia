import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getPersonalizacoes } from '../services/api';

// Valores padrão para fallback
const CARD_VALUES_DEFAULT = { A4: 15, A3: 25, 'A 1/2': 10, Escudo: 8 };
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

function calcValorAplicacao(aplic, quantidade = 1, faixasPreco = {}) {
  // Se não tem o tamanho, retorna 0
  if (!aplic.tamanho) return 0;
  
  console.log(`calcValorAplicacao - Tamanho: ${aplic.tamanho}, Quantidade: ${quantidade}`);
  console.log("Faixas de preço disponíveis:", faixasPreco);
  
  // Definindo quais faixas usar baseado no tamanho
  let faixas = [];
  if (aplic.tamanho === 'A4' && faixasPreco.sublimacao_local_a4) {
    faixas = faixasPreco.sublimacao_local_a4;
    console.log("Usando faixas de A4:", faixas);
  } else if (aplic.tamanho === 'A3' && faixasPreco.sublimacao_local_a3) {
    faixas = faixasPreco.sublimacao_local_a3;
    console.log("Usando faixas de A3:", faixas);
  } else if (aplic.tamanho === 'A 1/2' && faixasPreco.sublimacao_local_1_2) {
    faixas = faixasPreco.sublimacao_local_1_2;
    console.log("Usando faixas de A 1/2:", faixas);
  } else if (aplic.tamanho === 'Escudo' && faixasPreco.sublimacao_local_escudo) {
    faixas = faixasPreco.sublimacao_local_escudo;
    console.log("Usando faixas de Escudo:", faixas);
  } else {
    console.log(`Nenhuma faixa encontrada para o tamanho ${aplic.tamanho}`);
  }

  // Se não houver faixas configuradas, usar valores padrão
  if (!faixas || faixas.length === 0) {
    const valorPadrao = CARD_VALUES_DEFAULT[aplic.tamanho] || 0;
    console.log(`Usando valor padrão: R$ ${valorPadrao}`);
    return valorPadrao;
  }

  // Encontrar a faixa correta para a quantidade
  const faixa = faixas.find(f => quantidade >= f.min && quantidade <= f.max);
  
  // Se encontrou uma faixa, retorna o valor
  if (faixa) {
    console.log(`Faixa encontrada para quantidade ${quantidade}: ${faixa.min}-${faixa.max} = R$ ${faixa.valor}`);
    return faixa.valor;
  }
  
  // Se não encontrou, mas existem faixas, usar lógica de fallback
  if (quantidade < faixas[0].min) {
    console.log(`Quantidade ${quantidade} menor que mínimo ${faixas[0].min}, usando primeira faixa: R$ ${faixas[0].valor}`);
    return faixas[0].valor; // Menor quantidade usa primeira faixa
  }
  
  // Se a quantidade é maior que a maior faixa, usa a última
  const ultimaFaixa = faixas[faixas.length - 1];
  if (quantidade > ultimaFaixa.max) {
    console.log(`Quantidade ${quantidade} maior que máximo ${ultimaFaixa.max}, usando última faixa: R$ ${ultimaFaixa.valor}`);
    return ultimaFaixa.valor;
  }
  
  // Fallback final para valor padrão se nada funcionar
  const valorFallback = CARD_VALUES_DEFAULT[aplic.tamanho] || 0;
  console.log(`Nenhuma condição atendida, usando fallback: R$ ${valorFallback}`);
  return valorFallback;
}

export default function PersonalizacaoSublimacaoLocal({ aplicacoes, setAplicacoes, quantidade = 1 }) {
  const [aplic, setAplic] = useState({
    tamanho: '',
    local: '',
    imagem: null,
    imagemUrl: '',
  });
  const [showZoom, setShowZoom] = useState(null);
  const [faixasPreco, setFaixasPreco] = useState({});
  const [valores, setValores] = useState(CARD_VALUES_DEFAULT);
  const [loading, setLoading] = useState(true);

  // Buscar faixas de preço do backend
  useEffect(() => {
    async function fetchPrecos() {
      try {
        setLoading(true);
        console.log("Iniciando busca de preços de sublimação local, quantidade atual:", quantidade);
        const data = await getPersonalizacoes();
        console.log("Dados recebidos da API:", data);
        setFaixasPreco(data || {});
        
        // Calcular preços para exibição nos botões baseado na quantidade atual
        const precosMostrados = {};
        for (const tamanho of Object.keys(CARD_VALUES_DEFAULT)) {
          const aplicTemp = { tamanho };
          const valorCalculado = calcValorAplicacao(aplicTemp, quantidade, data);
          console.log(`Calculando preço para ${tamanho} com quantidade ${quantidade}: R$ ${valorCalculado}`);
          precosMostrados[tamanho] = valorCalculado;
        }
        console.log("Preços calculados para exibição:", precosMostrados);
        setValores(precosMostrados);
      } catch (error) {
        console.error("Erro ao buscar preços de personalização:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchPrecos();
  }, [quantidade]);

  const handleAddAplic = () => {
    if (!aplic.tamanho || !aplic.local) return;
    const valorCalculado = calcValorAplicacao(aplic, quantidade, faixasPreco);
    console.log(`Adicionando aplicação ${aplic.tamanho}, valor calculado: R$ ${valorCalculado}`);
    setAplicacoes([...aplicacoes, { 
      ...aplic, 
      valor: valorCalculado
    }]);
    setAplic({ tamanho: '', local: '', imagem: null, imagemUrl: '' });
  };

  const handleImage = e => {
    const file = e.target.files[0];
    if (file) {
      setAplic({ ...aplic, imagem: file, imagemUrl: URL.createObjectURL(file) });
    }
  };

  // Função para editar aplicação
  const handleEditAplic = idx => {
    setAplic(aplicacoes[idx]);
    setAplicacoes(aplicacoes.filter((_, i) => i !== idx));
  };

  // Função para remover aplicação
  const handleRemoveAplic = idx => {
    setAplicacoes(aplicacoes.filter((_, i) => i !== idx));
  };

  // Calcular descontos: só 1 aplicação valor cheio, demais 50%
  const sortedAplics = [...aplicacoes].sort((a, b) => b.valor - a.valor);
  let descontoAplics = sortedAplics.map((a, idx) => ({ ...a, valorFinal: idx === 0 ? a.valor : a.valor * 0.5 }));

  return (
    <div>
      <Card>
        <Row>
          <Label>Tamanho:</Label>
          {Object.keys(valores).map(tam => (
            <Button 
              key={tam} 
              type="button" 
              onClick={() => setAplic({ ...aplic, tamanho: tam })} 
              style={{ background: aplic.tamanho === tam ? '#15616f' : '#e0e0e0', color: aplic.tamanho === tam ? '#fff' : '#15616f' }}
              disabled={loading}
            >
              {tam} (R$ {valores[tam].toFixed(2)})
            </Button>
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
          <Label>Imagem da aplicação:</Label>
          <Input type="file" accept="image/*" onChange={handleImage} />
          {aplic.imagemUrl && <ImgPreview src={aplic.imagemUrl} alt="Preview" onClick={() => setShowZoom(aplic.imagemUrl)} />}
        </Row>
        <Button type="button" onClick={handleAddAplic}>Adicionar Aplicação</Button>
      </Card>
      {/* Lista de aplicações adicionadas */}
      {descontoAplics.length > 0 && descontoAplics.map((a, idx) => (
        <Card key={idx} style={{ background: idx === 0 ? '#f8f9fa' : '#e7f7f7' }}>
          <b>Aplicação {idx + 1}</b><br />
          Tamanho: {a.tamanho} | Valor: R$ {a.valorFinal.toFixed(2)} {idx === 0 ? '(valor cheio)' : '(50% desconto)'}<br />
          Local: {a.local}<br />
          {a.imagemUrl && <ImgPreview src={a.imagemUrl} alt="Preview" onClick={() => setShowZoom(a.imagemUrl)} style={{ width: 40, height: 40 }} />}
          <div style={{ marginTop: 8 }}>
            <Button type="button" style={{ background: '#22a2a2', color: '#fff', marginRight: 8 }} onClick={() => handleEditAplic(idx)}>Editar</Button>
            <Button type="button" style={{ background: '#d32f2f', color: '#fff' }} onClick={() => handleRemoveAplic(idx)}>Excluir</Button>
          </div>
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
