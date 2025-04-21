import React, { useState, useEffect } from 'react';
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

export default function StepCosturaV2({ data, onNext, onBack }) {
  const [form, setForm] = useState({
    personalizacao: '',
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
  const [malhasCatalog, setMalhasCatalog] = useState([]);
  const [tipoMalhaCatalog, setTipoMalhaCatalog] = useState([]);
  const [coresCatalog, setCoresCatalog] = useState([]);
  const [cortesCatalog, setCortesCatalog] = useState([]);
  const [golasCatalog, setGolasCatalog] = useState([]);
  const [detalhesCatalog, setDetalhesCatalog] = useState([]);

  useEffect(() => {
    async function fetchCatalogs() {
      try {
        const malhas = await getCatalog('tecido'); // grupo tecido
        setMalhasCatalog(malhas || []);
        const tipos = await getCatalog('tipoMalha'); // grupo tipoMalha
        setTipoMalhaCatalog(tipos || []);
        const cores = await getCatalog('cor'); // grupo cor
        setCoresCatalog(cores || []);
        const cortes = await getCatalog('corte');
        setCortesCatalog(cortes || []);
        const golas = await getCatalog('gola');
        setGolasCatalog(golas);
        const detalhes = await getCatalog('detalhe');
        setDetalhesCatalog(detalhes);
      } catch (err) {
        setMalhasCatalog([]);
        setTipoMalhaCatalog([]);
        setCoresCatalog([]);
        setCortesCatalog([]);
        setGolasCatalog([]);
        setDetalhesCatalog([]);
      }
    }
    fetchCatalogs();
  }, []);

  useEffect(() => {
    if (form.corte) {
      setForm(f => ({ ...f, valor: '' }));
    }
  }, [form.corte]);

  // Opções formatadas para react-select
  const coresOptions = React.useMemo(() => 
    coresCatalog
      .filter(cor => 
        // CORRIGIDO: Usa os campos corretos 'tecidos' e 'tipoMalha' do modelo
        (!form.malha || !cor.tecidos || cor.tecidos.length === 0 || cor.tecidos.includes(form.malha)) && 
        (!form.tipoMalha || !cor.tipoMalha || cor.tipoMalha.length === 0 || cor.tipoMalha.includes(form.tipoMalha))
      )
      .map(cor => ({
        value: cor.nome, // Usado para seleção
        label: cor.nome, // Exibido no dropdown e como valor selecionado
        rgb: cor.rgb, // **IMPORTANTE**: Passa o valor RGB
        valorBase: cor.valor // Usado para calcular preço (corrigido de valorBase para valor)
      })),
    [coresCatalog, form.malha, form.tipoMalha]
  );

  const handleChange = (field, value) => {
    let newState = { ...form, [field]: value };
    if (field === 'personalizacao' && value === 'Sublimação Total') {
      newState.personalizacao = value;
      newState.cor = 'Branco';
    }
    if (field === 'personalizacao') {
      newState.malha = '';
      newState.tipoMalha = '';
      newState.cor = '';
      newState.corte = '';
      newState.valor = '';
    }
    if (field === 'malha') {
      newState.tipoMalha = '';
      newState.cor = '';
      newState.corte = '';
      newState.valor = '';
    }
    if (field === 'tipoMalha') {
      newState.cor = '';
      newState.corte = '';
      newState.valor = '';
    }
    if (field === 'cor') {
      const corSelecionada = coresOptions.find(c => c.value === value);
      if (corSelecionada) {
        newState.valorBase = corSelecionada.valorBase || ''; // Mantém valorBase aqui se necessário em outro lugar, mas o cálculo usa 'valor'
        newState.cor = corSelecionada.value; // Salva o nome da cor
        newState.corRgb = corSelecionada.rgb; // Salva o valor RGB
      } else {
        newState.valorBase = '';
        newState.corRgb = null; // Limpa RGB se cor inválida
      }
      newState.corte = ''; // Reseta corte
    }
    setForm(newState);
  };

  const handleTamanho = (t, v) => {
    setForm({ ...form, tamanhos: { ...form.tamanhos, [t]: Number(v) } });
  };

  const handleAddItem = () => {
    if (!form.personalizacao || !form.malha || !form.tipoMalha || !form.cor || !form.corte) {
      alert('Preencha todos os campos obrigatórios do item!');
      return;
    }
    const qtdTotal = Object.values(form.tamanhos).reduce((s, q) => s + Number(q || 0), 0);
    if (qtdTotal <= 0) {
      alert('Adicione pelo menos uma quantidade para algum tamanho.');
      return;
    }

    // Pega os valores necessários do form
    const { corRgb, tipoGola, tipoDetalhe, ...restForm } = form; 
    // Buscar dados de gola/detalhe para calcular valor e pegar URL
    const golaSelecionada = golasCatalog.find(g => g.nome === tipoGola);
    const detalheSelecionado = detalhesCatalog.find(d => d.nome === tipoDetalhe);
    const valorGolaCalculado = form.gola ? (golaSelecionada?.valor || 0) : 0;
    const valorDetalheCalculado = form.detalhe ? (detalheSelecionado?.valor || 0) : 0;
    // Buscar dados do corte para calcular valor
    const corteSelecionado = cortesCatalog.find(c => c.nome === form.corte);
    // CORRIGIDO: Usa parseFloat para garantir que o valor seja numérico, ou 0 se inválido.
    const valorCorteCalculado = parseFloat(corteSelecionado?.valor) || 0;

    const newItem = {
      id: Date.now(),
      ...restForm, // Inclui personalizacao, malha, tipoMalha, cor, corte, tamanhos, gola, detalhe
      corRgb: corRgb, // **ADICIONADO**: Garante que corRgb seja incluído
      valorBase: Number(form.valorBase) || 0, // Mantém valorBase se usado em outro local
      tipoGola: form.gola ? form.tipoGola : '',
      valorGola: valorGolaCalculado,
      imagemGolaUrl: form.gola ? (golaSelecionada?.imagem || '') : '',
      tipoDetalhe: form.detalhe ? form.tipoDetalhe : '',
      valorDetalhe: valorDetalheCalculado,
      imagemDetalheUrl: form.detalhe ? (detalheSelecionado?.imagem || '') : '',
      quantidade: qtdTotal,
      acrescimos: {}, // Inicializa acrescimos como objeto vazio
      // Calcula o valor unitário base (Costura) - CORRIGIDO: Inclui valor do corte
      valorCorte: valorCorteCalculado, // **ADICIONADO**: Armazena o valor do corte
      valorUnitario: (Number(form.valorBase) || 0) + valorCorteCalculado + valorGolaCalculado + valorDetalheCalculado,
      // Monta a descrição para o resumo
      descricao: `${form.personalizacao || 'Item'} - ${form.malha || 'Malha?'} - ${form.tipoMalha || 'Tipo?'} - ${form.cor || 'Cor?'}`
    };
    
    // Valor total do item = (valor unitário * quantidade) + (acréscimos totais, se houver - cálculo movido p/ confirmação)
    // newItem.valorTotal = newItem.valorUnitario * newItem.quantidade; // Simplificado aqui, cálculo completo na confirmação
    newItem.valorTotal = newItem.valorUnitario * newItem.quantidade; // Cálculo básico inicial

    console.log("Adicionando/Editando Item:", newItem);

    setItensTemp([...itensTemp, newItem]);
    setForm({
      personalizacao: '',
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

  const handleNext = () => {
    if (itensTemp.length === 0) return;
    onNext({ ...data, itens: itensTemp });
  };

  return (
    <form autoComplete="off">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Button type="button" style={{ background: '#22a2a2', marginRight: 12 }} onClick={() => {
          // Preenchimento automático para testes de Serigrafia
          setForm({
            personalizacao: 'Serigrafia',
            malha: malhasCatalog[0]?.nome || '',
            tipoMalha: tipoMalhaCatalog[0]?.nome || '',
            cor: coresCatalog[0]?.nome || '',
            corte: cortesCatalog[0]?.nome || '',
            valor: '50',
            gola: false,
            tipoGola: '',
            detalhe: false,
            tipoDetalhe: '',
            tamanhos: TAMANHOS.reduce((acc, t) => ({ ...acc, [t]: 10 }), {}),
          });
        }}>
          Preencher automaticamente
        </Button>
      </div>
      <Card>
        <Row>
          <Label>Tipo de personalização:</Label>
          <StyledSelect value={form.personalizacao} onChange={e => handleChange('personalizacao', e.target.value)}>
            <option value="">Selecione</option>
            {PERSONALIZACOES.map(p => <option key={p}>{p}</option>)}
          </StyledSelect>
        </Row>
        {form.personalizacao && (
          <>
            <Row>
              <Label>Malha/Tecido:</Label>
              <StyledSelect value={form.malha} onChange={e => handleChange('malha', e.target.value)}>
                <option value="">Selecione</option>
                {malhasCatalog.filter(m => !form.personalizacao || !m.personalizacoes || m.personalizacoes.includes(form.personalizacao)).map(m => (
                  <option key={m._id || m.nome} value={m.nome}>{m.nome}</option>
                ))}
              </StyledSelect>
            </Row>
            {form.malha && (
              <Row>
                <Label>Tipo de tecido/malha:</Label>
                <StyledSelect
                  value={form.tipoMalha}
                  onChange={e => handleChange('tipoMalha', e.target.value)}
                >
                  <option value="">Selecione</option>
                  {tipoMalhaCatalog.filter(tm => !form.malha || !tm.tecidos || tm.tecidos.includes(form.malha)).map(tm => (
                    <option key={tm._id || tm.nome} value={tm.nome}>{tm.nome}</option>
                  ))}
                </StyledSelect>
              </Row>
            )}
            {form.tipoMalha && (
              <Row>
                <Label>Cor:</Label>
                <div style={{ minWidth: 220 }}>
                  {form.personalizacao === 'Sublimação Total' ? (
                    <input
                      type="text"
                      value="Branco"
                      disabled
                      style={{ width: '100%', background: '#f9f9f9', color: '#22344a', fontWeight: 600, border: '1px solid #cfd8dc', borderRadius: 6, height: 44, paddingLeft: 12 }}
                    />
                  ) : (
                    <Select
                      options={coresOptions}
                      value={(() => {
                        const corObj = coresOptions.find(c => c.value === form.cor);
                        return corObj ? { value: corObj.value, label: corObj.label, rgb: corObj.rgb } : null;
                      })()}
                      onChange={opt => handleChange('cor', opt && typeof opt.value === 'string' ? opt.value : '')}
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
            )}
            {form.tipoMalha && (
              <Row>
                <Label>Corte:</Label>
                <StyledSelect value={form.corte} onChange={e => handleChange('corte', e.target.value)}>
                  <option value="">Selecione</option>
                  {cortesCatalog
                    .filter(corte => !form.tipoMalha || !corte.tipoMalha || corte.tipoMalha.includes(form.tipoMalha))
                    .map(corte => (
                      <option key={corte._id || corte.nome} value={corte.nome}>{corte.nome}</option>
                    ))}
                </StyledSelect>
              </Row>
            )}
            <Row>
              <Checkbox checked={form.gola} onChange={e => setForm({ ...form, gola: e.target.checked, tipoGola: '' })} />
              <Label>Tem gola?</Label>
            </Row>
            {form.gola && (
              <div style={{ display: 'flex', flexDirection: 'row', gap: 20, margin: '10px 0 18px 0' }}>
                {golasCatalog.map(g => {
                  let imgSrc = null;
                  if (g.imagem) {
                    imgSrc = g.imagem.startsWith('/') ? g.imagem : `/uploads/${g.imagem}`;
                  }
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
                {detalhesCatalog.map(d => (
                  <ImgCard
                    key={d._id || d.nome}
                    $active={form.tipoDetalhe === d.nome}
                    onClick={() => setForm({ ...form, tipoDetalhe: d.nome })}
                    tabIndex={0}
                    role="button"
                    aria-pressed={form.tipoDetalhe === d.nome}
                    style={{ outline: 'none' }}
                  >
                    <Img src={d.imagem ? (d.imagem.startsWith('/') ? d.imagem : `/uploads/${d.imagem}`) : IMAGENS_DETALHE[d.nome]} alt={d.nome} />
                    <div style={{fontWeight:700,fontSize:15,marginBottom:2}}>{d.nome}</div>
                    <span style={{fontSize:13,background:'#fff2',borderRadius:6,padding:'2px 8px',marginTop:2}}>R$ {d.valor ?? VALORES_DETALHE[d.nome]}</span>
                    <Tooltip>{d.nome} <br/> R$ {d.valor ?? VALORES_DETALHE[d.nome]}</Tooltip>
                  </ImgCard>
                ))}
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
      </Card>
      {/* Lista de itens adicionados */}
      {itensTemp.length > 0 && itensTemp.map((item, idx) => (
        <ItemResumo key={idx}>
          <ItemResumoLinha>
            <b style={{fontSize:17}}>Item {idx + 1}</b>
            <span>Personalização: <b>{item.personalizacao}</b></span>
            <span>Malha: <b>{item.malha}</b></span>
            <span>Tipo: <b>{item.tipoMalha}</b></span>
            <span>Cor: <b>{item.cor}</b></span>
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
