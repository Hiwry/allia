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

function getMenorValorAplics(aplics) {
  if (aplics.length < 3) return [];
  const aplicsParaDesconto = aplics.slice(2);
  const menorValor = Math.min(...aplicsParaDesconto.map(a => a.valor));
  return aplics.map((a, idx) => idx >= 2 && a.valor === menorValor);
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
    
    // Se não há faixas configuradas, retornar 0
    if (!faixas || faixas.length === 0) return 0;
    
    // Verificar se a quantidade está dentro de alguma faixa
    const faixa = faixas.find(f => quantidade >= f.min && quantidade <= f.max);
    
    // Se encontrou uma faixa, retorna o valor
    if (faixa) return faixa.valor;
    
    // Se não encontrou nenhuma faixa, mas existem faixas configuradas,
    // buscar a faixa adequada por aproximação
    
    // Para quantidades menores que a menor faixa, usar a primeira faixa
    if (quantidade < faixas[0].min) {
      return faixas[0].valor;
    }
    
    // Para quantidades maiores que a maior faixa, usar a última faixa
    const ultimaFaixa = faixas[faixas.length - 1];
    if (quantidade > ultimaFaixa.max) {
      return ultimaFaixa.valor;
    }
    
    // Caso não tenha encontrado (este caso não deve ocorrer se a lógica acima estiver correta)
    return 0;
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

  // Corrige array de cores e nomesCores antes de salvar
  function corrigirCores(aplic) {
    let cores = Array.from({ length: aplic.qtdCores }).map((_, i) => aplic.cores?.[i] || '#000000');
    let nomesCores = Array.from({ length: aplic.qtdCores }).map((_, i) => aplic.nomesCores?.[i] || '');
    return { ...aplic, cores, nomesCores };
  }

  const handleAddAplic = () => {
    if (!aplic.tamanho || !aplic.local) {
      alert('Preencha o tamanho e o local da aplicação!');
      return;
    }
    const aplicCorrigida = corrigirCores(aplic);
    const novaAplicacao = { ...aplicCorrigida, valor: calcValorAplicacao(aplicCorrigida) };
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

  // Componente para exibir as faixas de valores
  function FaixasValores({ tamanho, faixasSerigrafia, quantidade }) {
    let faixas = [];
    if (tamanho === 'A4' && faixasSerigrafia?.a4) faixas = faixasSerigrafia.a4;
    if (tamanho === 'A3' && faixasSerigrafia?.a3) faixas = faixasSerigrafia.a3;
    if (tamanho === 'Escudo' && faixasSerigrafia?.escudo) faixas = faixasSerigrafia.escudo;

    if (!faixas || faixas.length === 0) {
      return (
        <div style={{ fontSize: '0.9rem', marginTop: '0.5rem', color: '#856404' }}>
          Nenhuma faixa de valor configurada para {tamanho}.
        </div>
      );
    }

    return (
      <div style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.25rem', color: '#15616f' }}>
          Faixas de Valores - {tamanho}:
        </div>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '0.5rem',
          fontSize: '0.8rem'
        }}>
          {faixas.map((faixa, idx) => (
            <div key={idx} style={{ 
              padding: '0.25rem 0.5rem', 
              background: quantidade >= faixa.min && quantidade <= faixa.max ? '#e7f7f7' : '#f8f8f8',
              border: quantidade >= faixa.min && quantidade <= faixa.max ? '1px solid #22a2a2' : '1px solid #ddd',
              borderRadius: '4px',
              display: 'inline-block'
            }}>
              {faixa.min} a {faixa.max} un: <strong style={{ color: '#15616f' }}>R$ {faixa.valor.toFixed(2)}</strong>
              {quantidade >= faixa.min && quantidade <= faixa.max && (
                <span style={{ marginLeft: '0.25rem', color: '#22a2a2', fontSize: '0.7rem' }}>✓ atual</span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <Card>
        <Row>
          <Label>Tamanho:</Label>
          {['A4', 'A3', 'Escudo'].map(tam => {
            const valor = getValorFaixa(tam);
            const temFaixa = 
              tam === 'A4' && faixasSerigrafia.a4 && faixasSerigrafia.a4.length > 0 ||
              tam === 'A3' && faixasSerigrafia.a3 && faixasSerigrafia.a3.length > 0 ||
              tam === 'Escudo' && faixasSerigrafia.escudo && faixasSerigrafia.escudo.length > 0;
              
            return (
              <Button
                key={tam}
                type="button"
                onClick={() => setAplic({ ...aplic, tamanho: tam })}
                style={{ 
                  background: aplic.tamanho === tam ? '#15616f' : '#e0e0e0', 
                  color: aplic.tamanho === tam ? '#fff' : '#15616f', 
                  minWidth: 110,
                  position: 'relative',
                  opacity: temFaixa ? 1 : 0.7,
                }}
                title={!temFaixa ? 'Sem faixas de valores configuradas para este tamanho' : ''}
              >
                {tam} {valor > 0 ? `(R$ ${valor.toFixed(2)})` : '(valor indisponível)'}
                {!temFaixa && <span style={{
                  position: 'absolute',
                  right: 5,
                  top: 5,
                  fontSize: '10px',
                  color: '#ff5252',
                  fontWeight: 'bold'
                }}>!</span>}
              </Button>
            );
          })}
        </Row>
        
        {/* Se não existirem faixas configuradas, mostrar alerta */}
        {(!faixasSerigrafia?.a4?.length && !faixasSerigrafia?.a3?.length && !faixasSerigrafia?.escudo?.length) && (
          <div style={{
            background: '#fff3cd',
            color: '#856404',
            padding: '0.75rem',
            marginBottom: '1rem',
            borderRadius: '0.5rem',
            fontSize: '0.9rem'
          }}>
            Não foram encontradas faixas de valores configuradas para Serigrafia. Os valores podem não estar corretos.
          </div>
        )}
        
        {/* Se o tamanho atual não tem faixas, mostrar alerta */}
        {aplic.tamanho && 
          ((aplic.tamanho === 'A4' && (!faixasSerigrafia?.a4 || !faixasSerigrafia.a4.length)) ||
           (aplic.tamanho === 'A3' && (!faixasSerigrafia?.a3 || !faixasSerigrafia.a3.length)) ||
           (aplic.tamanho === 'Escudo' && (!faixasSerigrafia?.escudo || !faixasSerigrafia.escudo.length))
          ) && (
          <div style={{
            background: '#fff3cd',
            color: '#856404',
            padding: '0.75rem',
            marginBottom: '1rem',
            borderRadius: '0.5rem',
            fontSize: '0.9rem'
          }}>
            Não foram encontradas faixas de valores para o tamanho {aplic.tamanho}.
          </div>
        )}

        {/* Mostrar tabela de faixas se um tamanho estiver selecionado */}
        {aplic.tamanho && (
          <FaixasValores 
            tamanho={aplic.tamanho} 
            faixasSerigrafia={faixasSerigrafia} 
            quantidade={quantidade} 
          />
        )}

        <Row>
          <Label>Efeito:</Label>
          {['', 'neon', 'dourado', 'prata'].map(ef => (
            <Button key={ef} type="button" onClick={() => setAplic({ ...aplic, efeito: ef })} style={{ background: aplic.efeito === ef ? '#15616f' : '#e0e0e0', color: aplic.efeito === ef ? '#fff' : '#15616f' }}>{ef || 'Normal'}</Button>
          ))}
        </Row>
        <Row>
          <Label>Local:</Label>
          <Select value={aplic.local} onChange={e => setAplic({ ...aplic, local: e.target.value })}>
            <option value="">Selecione</option>
            {LOCAL_APLICACAO.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </Select>
        </Row>
        <Row>
          <Label>Qtd. de Cores:</Label>
          <Input type="number" min={1} max={8} value={aplic.qtdCores} onChange={e => setAplic({ ...aplic, qtdCores: Number(e.target.value) })} />
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
        const descontoFlags = getMenorValorAplics(aplicacoes);
        const temDesconto = descontoFlags[idx];
        return (
          <Card key={idx} style={{ background: temDesconto ? '#e7f7f7' : '#f8f9fa', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
              <Button type="button" onClick={() => handleRemoveAplic(idx, setAplicacoes, aplicacoes)} style={{ background: '#dc3545', padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>Excluir</Button>
              <Button type="button" onClick={() => handleEditAplic(idx, aplicacoes, setAplic, setAplicacoes)} style={{ background: '#ffc107', color: '#333', padding: '0.4rem 0.8rem', fontSize: '0.9rem', marginLeft: '0.5rem' }}>Editar</Button>
            </div>
            <b>Aplicação {idx + 1}</b><br />
            Tamanho: {a.tamanho} | Valor: R$ {temDesconto ? (a.valor * 0.5).toFixed(2) : a.valor.toFixed(2)} {temDesconto ? '(50% desconto)' : ''}<br />
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
                    {a.nomesCores?.[i] && <span style={{ fontSize: '0.9em', color: '#444', marginLeft: 2 }}>{a.nomesCores[i]}</span>}
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
