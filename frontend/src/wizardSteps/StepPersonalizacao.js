import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import PersonalizacaoSerigrafia from './PersonalizacaoSerigrafia';
import PersonalizacaoSublimacaoLocal from './PersonalizacaoSublimacaoLocal';
import PersonalizacaoDTF from './PersonalizacaoDTF';
import PersonalizacaoBordado from './PersonalizacaoBordado';
import PersonalizacaoEmborrachado from './PersonalizacaoEmborrachado';
import PersonalizacaoSublimacaoTotal from './PersonalizacaoSublimacaoTotal';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

const Row = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
`;

const Button = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
`;

export default function StepPersonalizacao({ onNext, onBack, data }) {
  // Exemplo: só mostra Serigrafia se foi o tipo selecionado na costura
  const itens = data.itens || [];
  const [aplicacoesPorItem, setAplicacoesPorItem] = useState(() => data.aplicacoesPorItem || {});
  // Use sempre o id real do item como chave
  const [itemSelecionado, setItemSelecionado] = useState(
    data.itemPersonalizacao ?? (itens.length > 0 ? String(itens[0].id) : null)
  );
  const [aplicacoes, setAplicacoes] = useState(
    aplicacoesPorItem[itemSelecionado] || []
  );
  const [corelFilePorItem, setCorelFilePorItem] = useState(() => data.corelFilePorItem || {});
  const [corelFile, setCorelFile] = useState(corelFilePorItem[itemSelecionado] || null);
  const [corelError, setCorelError] = useState('');

  // Salva aplicações de cada item ao mudar
  useEffect(() => {
    setAplicacoesPorItem(prev => ({ ...prev, [String(itemSelecionado)]: aplicacoes }));
  }, [aplicacoes, itemSelecionado]);
  useEffect(() => {
    setCorelFilePorItem(prev => ({ ...prev, [String(itemSelecionado)]: corelFile }));
  }, [corelFile, itemSelecionado]);

  // Atualiza aplicações e corel ao trocar item selecionado
  useEffect(() => {
    if (itemSelecionado !== null && itemSelecionado !== undefined) {
      setAplicacoes(aplicacoesPorItem[String(itemSelecionado)] || []);
      setCorelFile(corelFilePorItem[String(itemSelecionado)] || null);
    }
    // NÃO salve o estado do item anterior aqui! Só carrega o novo.
    // O salvamento ocorre nos outros useEffect já presentes.
  }, [itemSelecionado]);

  // Troca tipo de personalização automaticamente
  const tipo = itens.find(i => String(i.id) === String(itemSelecionado))?.personalizacao || 'Serigrafia';

  // Quantidade do item selecionado
  const quantidadeSelecionada = itens.find(i => String(i.id) === String(itemSelecionado))?.quantidade || 1;

  // --- INÍCIO: Buscar valores das personalizações do backend ---
  const [valoresPersonalizacoes, setValoresPersonalizacoes] = useState({});
  useEffect(() => {
    fetch('/api/personalizacoes')
      .then(res => res.json())
      .then(data => setValoresPersonalizacoes(data?.serigrafia || {}))
      .catch(() => setValoresPersonalizacoes({}));
  }, []);
  // --- FIM: Buscar valores das personalizações do backend ---

  const handleCorelChange = e => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        setCorelError('O arquivo deve ter no máximo 15MB');
        setCorelFile(null);
      } else {
        setCorelFile(file);
        setCorelError('');
      }
    } else {
      setCorelFile(null);
      setCorelError('');
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    // Salva o último estado antes de avançar
    const novoAplicacoesPorItem = { ...aplicacoesPorItem, [String(itemSelecionado)]: aplicacoes };
    const novoCorelFilePorItem = { ...corelFilePorItem, [String(itemSelecionado)]: corelFile };
    onNext({
      ...data,
      aplicacoesPorItem: novoAplicacoesPorItem,
      corelFilePorItem: novoCorelFilePorItem,
      itemPersonalizacao: itemSelecionado,
      aplicacoes,
      corelFile,
    });
  };

  return (
    <Form onSubmit={handleSubmit} autoComplete="off">
      <h3>Personalização</h3>
      {itens.length > 0 && (
        <Row>
          <label style={{ fontWeight: 600, color: '#15616f' }}>Selecione o item para personalizar:</label>
          <select value={itemSelecionado} onChange={e => setItemSelecionado(e.target.value)} style={{ padding: '0.6rem 1rem', borderRadius: 8, border: '1.5px solid #c2e3e3', fontSize: '1.07rem' }}>
            {itens.map((item) => (
              <option value={item.id} key={item.id}>
                {item.personalizacao} - {item.malha} - {item.tipoMalha} - {item.cor} - {item.corte} (Qtd: {item.quantidade})
              </option>
            ))}
          </select>
        </Row>
      )}
      <div style={{ marginBottom: 18, marginTop: 6, fontWeight: 600, color: '#15616f', fontSize: 17 }}>
        Tipo de Personalização: <span style={{ color: '#22a2a2', fontWeight: 800 }}>{tipo}</span>
      </div>
      {tipo === 'Serigrafia' && (
        <PersonalizacaoSerigrafia aplicacoes={aplicacoes} setAplicacoes={setAplicacoes} faixasSerigrafia={valoresPersonalizacoes} quantidade={quantidadeSelecionada} />
      )}
      {tipo === 'Sublimação Local' && (
        <PersonalizacaoSublimacaoLocal aplicacoes={aplicacoes} setAplicacoes={setAplicacoes} />
      )}
      {tipo === 'DTF' && (
        <PersonalizacaoDTF aplicacoes={aplicacoes} setAplicacoes={setAplicacoes} />
      )}
      {tipo === 'Bordado' && (
        <PersonalizacaoBordado aplicacoes={aplicacoes} setAplicacoes={setAplicacoes} />
      )}
      {tipo === 'Emborrachado' && (
        <PersonalizacaoEmborrachado aplicacoes={aplicacoes} setAplicacoes={setAplicacoes} />
      )}
      {tipo === 'Sublimação Total' && (
        <PersonalizacaoSublimacaoTotal aplicacoes={aplicacoes} setAplicacoes={setAplicacoes} />
      )}
      {/* Campo para upload de arquivo Corel */}
      <Row style={{ marginTop: 24, alignItems: 'center' }}>
        <label style={{ fontWeight: 600, color: '#15616f', minWidth: 180 }}>Arquivo em Corel (.cdr, máx 15MB):</label>
        <input
          type="file"
          accept=".cdr"
          onChange={handleCorelChange}
          style={{ padding: '0.5rem 0' }}
        />
        {corelFile && <span style={{ marginLeft: 10, color: '#22a2a2' }}>{corelFile.name}</span>}
        {corelError && <span style={{ marginLeft: 10, color: '#d32f2f', fontWeight: 500 }}>{corelError}</span>}
      </Row>
      <ButtonRow>
        <Button type="button" onClick={onBack} style={{ background: '#eee', color: '#15616f' }}>Voltar</Button>
        <Button type="submit">Próximo</Button>
      </ButtonRow>
    </Form>
  );
}
