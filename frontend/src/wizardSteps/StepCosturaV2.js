import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { getCatalog } from '../services/catalogApi';
import Select from 'react-select';

const PERSONALIZACOES = [
  'Serigrafia',
  'Sublimação Local',
  'Sublimação Total',
  'DTF',
  'Bordado',
  'Emborrachado',
  'Lisas',
];

const VALORES_GOLA = { 'Gola Careca': 5, 'Gola Polo': 8, 'Gola V': 6 };
const DETALHES = ['Vivo contrastante', 'Punho especial', 'Recorte lateral'];
const TAMANHOS = ['pp', 'p', 'm', 'g', 'gg', 'exg', 'g1', 'g2', 'g3'];

const Card = styled.div`
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 4px 32px rgba(21, 97, 111, 0.09);
  padding: 2.2rem 2.2rem 1.5rem 2.2rem;
  margin-bottom: 2.2rem;
  transition: box-shadow 0.2s;
`;
const Row = styled.div`
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.3rem;
  align-items: center;
`;
const Label = styled.label`
  font-weight: 700;
  margin-bottom: 0.3rem;
  display: block;
  color: #15616f;
  font-size: 1.08rem;
`;
const StyledSelect = styled.select`
  padding: 0.9rem 1.2rem;
  border-radius: 14px;
  border: 1.5px solid #c2e3e3;
  font-size: 1.05rem;
  background: #f8f9fa;
  transition: border 0.2s;
  &:focus {
    border-color: #15616f;
    outline: none;
    background: #e7f7f7;
  }
`;
const Input = styled.input`
  padding: 0.8rem 1.2rem;
  border-radius: 14px;
  border: 1.5px solid #c2e3e3;
  font-size: 1.05rem;
  background: #f8f9fa;
  width: 100px;
  transition: border 0.2s;
  &:focus {
    border-color: #15616f;
    outline: none;
    background: #e7f7f7;
  }
`;
const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  margin-right: 0.8rem;
  accent-color: #15616f;
  width: 20px;
  height: 20px;
`;
const ImgCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: ${({ $active }) => $active ? '#15616f' : '#f8f9fa'};
  color: ${({ $active }) => $active ? '#fff' : '#15616f'};
  border: ${({ $active }) => $active ? '2.5px solid #15616f' : '2px solid #c2e3e3'};
  border-radius: 16px;
  padding: 1.1rem 1.2rem 0.7rem 1.2rem;
  margin-right: 1.1rem;
  margin-bottom: 1.1rem;
  cursor: pointer;
  font-weight: 700;
  min-width: 110px;
  min-height: 150px;
  box-shadow: ${({ $active }) => $active ? '0 6px 28px #15616f22' : '0 2px 8px #c2e3e366'};
  transition: background 0.18s, box-shadow 0.18s;
  position: relative;
  &:hover {
    background: ${({ $active }) => $active ? '#15616f' : '#e7f7f7'};
    box-shadow: 0 8px 36px #15616f22;
  }
`;
const Img = styled.img`
  width: 56px;
  height: 56px;
  object-fit: contain;
  margin-bottom: 0.6rem;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 1px 6px #c2e3e366;
`;
const Tooltip = styled.div`
  visibility: hidden;
  opacity: 0;
  background: #15616f;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 6px 12px;
  position: absolute;
  z-index: 2;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(-8px);
  font-size: 0.95rem;
  font-weight: 400;
  pointer-events: none;
  transition: opacity 0.17s;
  box-shadow: 0 2px 12px #15616f44;
  white-space: nowrap;
  margin-bottom: 6px;
  ${ImgCard}:hover & {
    visibility: visible;
    opacity: 1;
  }
`;
const Button = styled.button`
  background: #15616f;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1.4rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 12px #15616f33;
  transition: background 0.18s, box-shadow 0.18s;
  &:hover {
    background: #104e5e;
    box-shadow: 0 6px 24px #15616f33;
  }
`;
const ItemResumo = styled.div`
  background: #f8f9fa;
  border-radius: 14px;
  box-shadow: 0 2px 8px #c2e3e333;
  padding: 1.3rem 2rem;
  margin-bottom: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  font-size: 1.07rem;
  color: #15616f;
`;
const ItemResumoLinha = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.3rem;
  align-items: center;
  font-size: 1.02rem;
`;

const CorOption = ({ color, name }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
    <span style={{
      display: 'inline-block',
      width: 18,
      height: 18,
      borderRadius: '50%',
      background: color,
      border: '1px solid #bbb',
      marginRight: 8
    }} />
    <span>{name}</span>
  </span>
);

// Componente para opção de cor customizada
const ColorOption = (props) => {
  const { data, innerProps, innerRef } = props;
  return (
    <div ref={innerRef} {...innerProps} style={{ display: 'flex', alignItems: 'center', padding: 8 }}>
      <span style={{
        display: 'inline-block',
        width: 18,
        height: 18,
        borderRadius: '50%',
        background: data.rgb,
        border: '1px solid #bbb',
        marginRight: 8
      }} />
      <span>{data.label}</span>
    </div>
  );
};

const ColorSingleValue = (props) => {
  const { data } = props;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
      <span style={{
        display: 'inline-block',
        width: 18,
        height: 18,
        borderRadius: '50%',
        background: data.rgb,
        border: '1px solid #bbb',
        marginRight: 8
      }} />
      {data.label}
    </span>
  );
};

function isLightColor(rgb) {
  if (!rgb) return false;
  // Aceita formatos: #RRGGBB, #RGB, rgb(r,g,b)
  let r, g, b;
  if (rgb.startsWith('#')) {
    if (rgb.length === 7) {
      r = parseInt(rgb.slice(1, 3), 16);
      g = parseInt(rgb.slice(3, 5), 16);
      b = parseInt(rgb.slice(5, 7), 16);
    } else if (rgb.length === 4) {
      r = parseInt(rgb[1] + rgb[1], 16);
      g = parseInt(rgb[2] + rgb[2], 16);
      b = parseInt(rgb[3] + rgb[3], 16);
    }
  } else if (rgb.startsWith('rgb')) {
    const parts = rgb.match(/\d+/g);
    if (parts && parts.length >= 3) {
      r = parseInt(parts[0], 10);
      g = parseInt(parts[1], 10);
      b = parseInt(parts[2], 10);
    }
  } else {
    return false;
  }
  if ([r, g, b].some(x => isNaN(x))) return false;
  // Calcula luminância relativa
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b);
  return luminance > 180; // limiar para "claro"
}

export default function StepCosturaV2({ data, onNext, onBack }) {
  const [form, setForm] = useState({
    personalizacao: [],
    malha: '',
    tipoMalha: '',
    cor: '',
    corte: '',
    valor: '',
    gola: false,
    tipoGola: '',
    detalhe: false,
    tipoDetalhe: '',
    tamanhos: TAMANHOS.reduce((acc, t) => ({ ...acc, [t]: 0 }), {}),
  });
  const [itensTemp, setItensTemp] = useState(data?.itens || []);
  const [editIndex, setEditIndex] = useState(null);

  // NOVOS STATES para guardar dados do catálogo
  const [tiposMalhaCatalog, setTiposMalhaCatalog] = useState([]);
  const [tecidosCatalog, setTecidosCatalog] = useState([]);
  const [coresCatalog, setCoresCatalog] = useState([]);
  const [cortesCatalog, setCortesCatalog] = useState([]);
  const [golasCatalog, setGolasCatalog] = useState([]);
  const [detalhesCatalog, setDetalhesCatalog] = useState([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [catalogError, setCatalogError] = useState('');

  // NOVO: useEffect para buscar dados do catálogo
  useEffect(() => {
    const fetchCatalogData = async () => {
      setLoadingCatalog(true);
      setCatalogError('');
      try {
        const [tiposMalhaData, tecidosData, coresData, cortesData, golasData, detalhesData] = await Promise.all([
          getCatalog('tipoMalha'),
          getCatalog('tecido'),
          getCatalog('cor'),
          getCatalog('corte'),
          getCatalog('gola'),
          getCatalog('detalhe')
        ]);
        setTiposMalhaCatalog(tiposMalhaData || []);
        setTecidosCatalog(tecidosData || []);
        setCoresCatalog(coresData || []);
        setCortesCatalog(cortesData || []);
        setGolasCatalog(golasData || []);
        setDetalhesCatalog(detalhesData || []);
      } catch (err) {
        console.error("Erro ao buscar catálogo para StepCostura:", err);
        setCatalogError('Falha ao carregar opções do catálogo.');
        // Definir como arrays vazios em caso de erro
        setTiposMalhaCatalog([]);
        setTecidosCatalog([]);
        setCoresCatalog([]);
        setCortesCatalog([]);
        setGolasCatalog([]);
        setDetalhesCatalog([]);
      } finally {
        setLoadingCatalog(false);
      }
    };
    fetchCatalogData();
  }, []); // Executa apenas na montagem

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
    if (field === 'personalizacao') setForm(f => ({ ...f, malha: '', tipoMalha: '', cor: '', corte: '', valor: '' }));
    if (field === 'malha') setForm(f => ({ ...f, tipoMalha: '', cor: '', corte: '', valor: '' }));
    if (field === 'tipoMalha') setForm(f => ({ ...f, cor: '', corte: '', valor: '' }));
    if (field === 'cor') setForm(f => ({ ...f, corte: '', valor: '' }));
  };

  const handleTamanho = (t, v) => {
    setForm({ ...form, tamanhos: { ...form.tamanhos, [t]: Number(v) } });
  };

  const handleAddItem = () => {
    if (!form.personalizacao.length || !form.malha || !form.tipoMalha || !form.cor || !form.corte) {
      alert('Preencha todos os campos obrigatórios do item!');
      return;
    }
    const qtdTotal = Object.values(form.tamanhos).reduce((s, q) => s + Number(q || 0), 0);
    if (qtdTotal <= 0) {
      alert('Adicione pelo menos uma quantidade para algum tamanho.');
      return;
    }

    const { corRgb, tipoGola, tipoDetalhe, ...restForm } = form; 
    const golaSelecionada = golasCatalog.find(g => g.nome === form.tipoGola);
    const detalheSelecionado = detalhesCatalog.find(d => d.nome === form.tipoDetalhe);
    const valorGolaCalculado = form.gola ? (golaSelecionada?.valor || 0) : 0;
    const valorDetalheCalculado = form.detalhe ? (detalheSelecionado?.valor || 0) : 0;
    const corteSelecionado = cortesCatalog.find(c => c.nome === form.corte);
    const valorCorteCalculado = parseFloat(corteSelecionado?.valor) || 0;

    const newItem = {
      id: editIndex !== null ? itensTemp[editIndex].id : Date.now(),
      ...restForm,
      corRgb: corRgb,
      valorBase: Number(form.valorBase) || 0,
      tipoGola: form.gola ? form.tipoGola : '',
      valorGola: valorGolaCalculado,
      imagemGolaUrl: form.gola ? (golaSelecionada?.imagem || '') : '',
      tipoDetalhe: form.detalhe ? form.tipoDetalhe : '',
      valorDetalhe: valorDetalheCalculado,
      imagemDetalheUrl: form.detalhe ? (detalheSelecionado?.imagem || '') : '',
      quantidade: qtdTotal,
      acrescimos: {},
      valorCorte: valorCorteCalculado,
      valorUnitario: (Number(form.valorBase) || 0) + valorCorteCalculado + valorGolaCalculado + valorDetalheCalculado,
      descricao: `${form.personalizacao.join(', ') || 'Item'} - ${form.malha || 'Malha?'} - ${form.tipoMalha || 'Tipo?'} - ${form.cor || 'Cor?'}`,
      personalizacao: Array.isArray(form.personalizacao) ? (form.personalizacao[0] || '') : (form.personalizacao || ''),
    };
    newItem.valorTotal = newItem.valorUnitario * newItem.quantidade;

    if (editIndex !== null) {
      // Atualiza o item existente
      const novosItens = [...itensTemp];
      novosItens[editIndex] = newItem;
      setItensTemp(novosItens);
      setEditIndex(null);
    } else {
      setItensTemp([...itensTemp, newItem]);
    }
    setForm({
      personalizacao: [],
      malha: '',
      tipoMalha: '',
      cor: '',
      corte: '',
      valor: '',
      gola: false,
      tipoGola: '',
      detalhe: false,
      tipoDetalhe: '',
      tamanhos: TAMANHOS.reduce((acc, t) => ({ ...acc, [t]: 0 }), {}),
    });
  };

  const handleEditItem = idx => {
    const item = itensTemp[idx];
    setForm({
      ...item,
      tamanhos: { ...item.tamanhos },
      personalizacao: item.personalizacao ? [item.personalizacao] : [],
    });
    setEditIndex(idx);
  };

  const handleNext = () => {
    if (itensTemp.length === 0) return;
    onNext({ ...data, itens: itensTemp });
  };

  // Utilitário para garantir URL absoluta da imagem
  function getImagemUrl(imagem) {
    if (!imagem) return '';
    if (imagem.startsWith('http')) return imagem;
    if (imagem.startsWith('/uploads/')) return `https://allia.onrender.com${imagem}`;
    return `https://allia.onrender.com/uploads/${imagem}`;
  }

  // -- Lógica para Filtrar Opções com Base nas Seleções Anteriores --

  // Filtra TIPO DE MALHA baseado na personalização e na malha (se necessário - PODE SER COMPLEXO)
  // Por enquanto, mantém simples, mas idealmente filtraria pelos tipos de malha associados à malha selecionada E personalização
  const tiposMalhaOptions = useMemo(() => {
    // TODO: Adicionar filtro mais complexo se necessário
    return tiposMalhaCatalog;
  }, [tiposMalhaCatalog]);

  // CORRIGIDO: Filtra MALHA/TECIDO baseado na PERSONALIZAÇÃO selecionada
  const malhasOptions = useMemo(() => {
      if (!form.personalizacao.length) return []; // Depende da personalização
      // Filtra tecidosCatalog para incluir apenas aqueles cuja lista 'personalizacoes' contém a selecionada
      return (Array.isArray(tecidosCatalog) ? tecidosCatalog : []).filter(tecido => 
          Array.isArray(tecido.personalizacoes) && 
          tecido.personalizacoes.some(p => form.personalizacao.includes(p))
      );
  }, [form.personalizacao, tecidosCatalog]); // Depende de personalizacao e tecidosCatalog

  // Filtro de cores depende do tipo de personalização
  const coresOptions = useMemo(() => {
    if (!form.tipoMalha) return [];
    let cores = (Array.isArray(coresCatalog) ? coresCatalog : [])
      .filter(c => Array.isArray(c.tipoMalha) && c.tipoMalha.includes(form.tipoMalha))
      .map(cor => ({
        value: cor.nome,
        label: cor.nome,
        rgb: cor.rgb,
        corClara: cor.corClara,
      }));
    if (Array.isArray(form.personalizacao) && form.personalizacao.includes('Sublimação Local')) {
      // Só mostra cores claras
      return cores.filter(opt => !!opt.corClara);
    }
    // Para outras personalizações, mostra todas as cores disponíveis
    return cores;
  }, [form.tipoMalha, form.personalizacao, coresCatalog]);

  // Filtra CORTE baseado no TIPO DE MALHA selecionado
  const cortesOptions = useMemo(() => {
    if (!form.tipoMalha) return [];
    return (Array.isArray(cortesCatalog) ? cortesCatalog : []).filter(c => Array.isArray(c.tipoMalha) && c.tipoMalha.includes(form.tipoMalha));
  }, [form.tipoMalha, cortesCatalog]);

  return (
    <form autoComplete="off">
      <Card>
        <Row>
          <Label>Tipo de personalização:</Label>
          <Select
            isMulti
            options={PERSONALIZACOES.map(p => ({ value: p, label: p }))}
            value={form.personalizacao.map(p => ({ value: p, label: p }))}
            onChange={opts => handleChange('personalizacao', opts ? opts.map(o => o.value) : [])}
            placeholder="Selecione"
            styles={{ control: (base) => ({ ...base, minHeight: 44 }), menu: (base) => ({ ...base, zIndex: 9999 }) }}
          />
        </Row>
        {form.personalizacao.length > 0 && (
          <>
            <Row>
              <Label>Malha/Tecido:</Label>
              {/* CORRIGIDO: Habilitar/desabilitar baseado na personalização e no loading */}
              <StyledSelect 
                 value={form.malha} 
                 onChange={e => handleChange('malha', e.target.value)} 
                 disabled={!form.personalizacao.length || loadingCatalog} 
              >
                <option value="">{loadingCatalog ? 'Carregando...' : 'Selecione o tecido'}</option>
                {malhasOptions.map(m => ( // Usar malhasOptions filtradas por personalização
                  <option key={m._id} value={m.nome}>{m.nome}</option>
                ))}
              </StyledSelect>
            </Row>
            {form.malha && (
              <>
                <Row>
                  <Label>Tipo de tecido/malha:</Label>
                   {/* CORRIGIDO: Desabilitar se malha não selecionada ou carregando */}
                  <StyledSelect 
                     value={form.tipoMalha} 
                     onChange={e => handleChange('tipoMalha', e.target.value)} 
                     disabled={!form.malha || loadingCatalog} 
                   >
                    <option value="">{loadingCatalog ? 'Carregando...' : 'Selecione o tipo'}</option>
                    {tiposMalhaOptions.map(tm => ( // Usar tiposMalhaOptions (atualmente não filtrado)
                      <option key={tm._id || tm.nome} value={tm.nome}>{tm.nome}</option>
                    ))}
                  </StyledSelect>
                </Row>
                {form.tipoMalha && (
                  <>
                    <Row>
                      <Label>Cor:</Label>
                      <div style={{ minWidth: 220 }}>
                        {form.personalizacao.includes('Sublimação Total') ? (
                          <input
                            type="text"
                            value="Branco"
                            disabled
                            style={{ width: '100%', background: '#f9f9f9', color: '#22344a', fontWeight: 600, border: '1px solid #cfd8dc', borderRadius: 6, height: 44, paddingLeft: 12 }}
                          />
                        ) : (
                          <Select
                            options={coresOptions}
                            value={coresOptions.find(opt => opt.value === form.cor) || null}
                            onChange={opt => handleChange('cor', opt ? opt.value : '')}
                            placeholder="Selecione"
                            components={{ Option: ColorOption, SingleValue: ColorSingleValue }}
                            isClearable
                            styles={{
                              control: (base) => ({ ...base, minHeight: 44 }),
                              menu: (base) => ({ ...base, zIndex: 9999 }),
                            }}
                          />
                        )}
                      </div>
                    </Row>
                    <Row>
                      <Label>Corte:</Label>
                      <StyledSelect value={form.corte} onChange={e => handleChange('corte', e.target.value)}>
                        <option value="">Selecione</option>
                        {cortesOptions.map(c => (
                          <option key={c._id || c.nome} value={c.nome}>{c.nome}</option>
                        ))}
                      </StyledSelect>
                    </Row>
                    <Row>
                      <Checkbox checked={form.gola} onChange={e => setForm({ ...form, gola: e.target.checked, tipoGola: '' })} />
                      <Label>Tem gola?</Label>
                    </Row>
                    {form.gola && (
                      <div style={{ display: 'flex', flexDirection: 'row', gap: 20, margin: '10px 0 18px 0' }}>
                        {golasCatalog.map(g => {
                          let imgSrc = getImagemUrl(g.imagem);
                          return (
                            <ImgCard
                              key={g._id || g.nome}
                              $active={form.tipoGola === g.nome}
                              onClick={() => setForm({ ...form, tipoGola: g.nome })}
                              tabIndex={0}
                              role="button"
                              aria-pressed={form.tipoGola === g.nome}
                              style={{ outline: 'none' }}
                            >
                              <Img src={imgSrc} alt={g.nome} onError={(e) => { e.target.style.display='none'; }} />
                              <div style={{fontWeight:700,fontSize:15,marginBottom:2}}>{g.nome}</div>
                              <span style={{fontSize:13,background:'#fff2',borderRadius:6,padding:'2px 8px',marginTop:2}}>R$ {g.valor ?? 0}</span>
                              <Tooltip>{g.nome} <br/> R$ {g.valor ?? 0}</Tooltip>
                            </ImgCard>
                          );
                        })}
                      </div>
                    )}
                    <Row>
                      <Checkbox checked={form.detalhe} onChange={e => setForm({ ...form, detalhe: e.target.checked, tipoDetalhe: '' })} />
                      <Label>Tem detalhe diferente?</Label>
                    </Row>
                    {form.detalhe && (
                      <div style={{ display: 'flex', flexDirection: 'row', gap: 20, margin: '10px 0 18px 0' }}>
                        {detalhesCatalog.map(d => {
                          let imgSrc = getImagemUrl(d.imagem);
                          return (
                            <ImgCard
                              key={d._id || d.nome}
                              $active={form.tipoDetalhe === d.nome}
                              onClick={() => setForm({ ...form, tipoDetalhe: d.nome })}
                              tabIndex={0}
                              role="button"
                              aria-pressed={form.tipoDetalhe === d.nome}
                              style={{ outline: 'none' }}
                            >
                              <Img src={imgSrc} alt={d.nome} />
                              <div style={{fontWeight:700,fontSize:15,marginBottom:2}}>{d.nome}</div>
                              <span style={{fontSize:13,background:'#fff2',borderRadius:6,padding:'2px 8px',marginTop:2}}>R$ {d.valor ?? VALORES_DETALHE[d.nome]}</span>
                              <Tooltip>{d.nome} <br/> R$ {d.valor ?? VALORES_DETALHE[d.nome]}</Tooltip>
                            </ImgCard>
                          );
                        })}
                      </div>
                    )}
                    <Row>
                      <Label>Tamanhos:</Label>
                      {TAMANHOS.map(t => (
                        <span key={t} style={{ marginRight: 8 }}>
                          {t.toUpperCase()}: <Input type="number" min="0" value={form.tamanhos[t]} onChange={e => handleTamanho(t, e.target.value)} />
                        </span>
                      ))}
                    </Row>
                    <Button type="button" onClick={handleAddItem}>Adicionar Item</Button>
                  </>
                )}
              </>
            )}
          </>
        )}
      </Card>
      {/* Lista de itens adicionados */}
      {itensTemp.length > 0 && itensTemp.map((item, idx) => (
        <ItemResumo key={idx}>
          <ItemResumoLinha>
            <b style={{fontSize:17}}>Item {idx + 1}</b>
            <span>Personalização: <b>{Array.isArray(item.personalizacao) ? item.personalizacao.join(', ') : item.personalizacao}</b></span>
            <span>Malha: <b>{item.malha}</b></span>
            <span>Tipo: <b>{item.tipoMalha}</b></span>
            <span>Cor: <b>{item.cor}</b></span>
            <button type="button" onClick={() => handleEditItem(idx)} style={{marginLeft:8,background:'#e7f7f7',color:'#15616f',border:'1.5px solid #c2e3e3',borderRadius:6,padding:'2px 10px',cursor:'pointer'}}>Editar</button>
          </ItemResumoLinha>
          <ItemResumoLinha>
            <span>Corte: <b>{item.corte}</b> <span style={{color:'#3bb6b6'}}>R$ {Number(item.valorCorte).toFixed(2)}</span></span>
            {item.gola && <span>Gola: <b>{item.tipoGola}</b> <span style={{color:'#3bb6b6'}}>R$ {Number(item.valorGola).toFixed(2)}</span></span>}
            {item.detalhe && <span>Detalhe: <b>{item.tipoDetalhe}</b> <span style={{color:'#3bb6b6'}}>R$ {Number(item.valorDetalhe).toFixed(2)}</span></span>}
          </ItemResumoLinha>
          <ItemResumoLinha>
            <span>Valor unitário: <b style={{color:'#15616f'}}>R$ {Number(item.valorUnitario).toFixed(2)}</b></span>
            <span>Quantidade: <b>{item.quantidade}</b></span>
            <span>Valor total: <b style={{ color: '#22a2a2',fontSize:17 }}>R$ {Number(item.valorTotal).toFixed(2)}</b></span>
          </ItemResumoLinha>
          <ItemResumoLinha>
            <span>Tamanhos: {TAMANHOS.map(t => item.tamanhos[t] > 0 ? `${t.toUpperCase()}: ${item.tamanhos[t]}` : null).filter(Boolean).join(', ')}</span>
          </ItemResumoLinha>
          <ItemResumoLinha>
            <span>Acréscimos por tamanho:</span>
            {Object.keys(item.acrescimos).map(tam => (
              <span key={tam}>{tam}: R$ {Number(item.acrescimos[tam]).toFixed(2)}</span>
            ))}
          </ItemResumoLinha>
        </ItemResumo>
      ))}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
        <Button type="button" onClick={onBack} style={{ background: '#eee', color: '#15616f' }}>Voltar</Button>
        <Button type="button" onClick={handleNext}>Próximo</Button>
      </div>
    </form>
  );
}
