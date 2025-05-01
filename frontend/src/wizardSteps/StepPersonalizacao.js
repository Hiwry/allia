import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import PersonalizacaoSerigrafia from './PersonalizacaoSerigrafia';
import PersonalizacaoSublimacaoLocal from './PersonalizacaoSublimacaoLocal';
import PersonalizacaoDTF from './PersonalizacaoDTF';
import PersonalizacaoBordado from './PersonalizacaoBordado';
import PersonalizacaoEmborrachado from './PersonalizacaoEmborrachado';
import PersonalizacaoSublimacaoTotal from './PersonalizacaoSublimacaoTotal';
import { getPersonalizacoes } from '../services/api';

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

const LoadingMessage = styled.div`
  padding: 1rem;
  border-radius: 8px;
  background-color: #e7f7f7;
  color: #15616f;
  margin-bottom: 1rem;
`;

const ErrorMessage = styled.div`
  padding: 1rem;
  border-radius: 8px;
  background-color: #ffebee;
  color: #d32f2f;
  margin-bottom: 1rem;
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

  // Estado para controlar carregamento e erros da API
  const [valoresPersonalizacoes, setValoresPersonalizacoes] = useState({});
  const [loadingValores, setLoadingValores] = useState(false);
  const [valorError, setValorError] = useState('');

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

  // --- NOVO: Permitir múltiplas personalizações por item ---
  // Separa tipos de personalização caso o campo seja array
  function getTiposPersonalizacao(item) {
    if (Array.isArray(item.personalizacao)) {
      return item.personalizacao;
    }
    if (typeof item.personalizacao === 'string') {
      return [item.personalizacao];
    }
    return [];
  }

  // Renderiza apenas UM bloco de personalização por tipo, sem duplicar para cada chamada do map
  function renderPersonalizacoesDoItem(item, aplicacoes, setAplicacoes, quantidadeSelecionada) {
    // Se o item tiver múltiplos tipos, mostra apenas UM bloco de cada tipo (não chama map fora do return principal)
    const tipos = getTiposPersonalizacao(item);
    return tipos.map((tipo, idx) => {
      if (tipo === 'Serigrafia') {
        return <PersonalizacaoSerigrafia key={tipo+idx} aplicacoes={aplicacoes} setAplicacoes={setAplicacoes} faixasSerigrafia={valoresPersonalizacoes} quantidade={quantidadeSelecionada} />;
      }
      if (tipo === 'Sublimação Local') {
        return <PersonalizacaoSublimacaoLocal key={tipo+idx} aplicacoes={aplicacoes} setAplicacoes={setAplicacoes} quantidade={quantidadeSelecionada} />;
      }
      if (tipo === 'DTF') {
        return <PersonalizacaoDTF key={tipo+idx} aplicacoes={aplicacoes} setAplicacoes={setAplicacoes} />;
      }
      if (tipo === 'Bordado') {
        return <PersonalizacaoBordado key={tipo+idx} aplicacoes={aplicacoes} setAplicacoes={setAplicacoes} />;
      }
      if (tipo === 'Emborrachado') {
        return <PersonalizacaoEmborrachado key={tipo+idx} aplicacoes={aplicacoes} setAplicacoes={setAplicacoes} />;
      }
      if (tipo === 'Sublimação Total') {
        return <PersonalizacaoSublimacaoTotal key={tipo+idx} aplicacoes={aplicacoes} setAplicacoes={setAplicacoes} />;
      }
      return null;
    });
  }

  // Troca tipo de personalização automaticamente
  const itemAtual = itens.find(i => String(i.id) === String(itemSelecionado));
  const tiposPersonalizacao = getTiposPersonalizacao(itemAtual || {});

  // Quantidade do item selecionado
  const quantidadeSelecionada = itens.find(i => String(i.id) === String(itemSelecionado))?.quantidade || 1;
  
  // Função para recalcular valores das aplicações quando a quantidade muda
  const recalcularValoresAplicacoes = (aplicacoes, quantidade, valorPersonalizacoesSerigrafia) => {
    if (!aplicacoes || aplicacoes.length === 0) return [];
    
    return aplicacoes.map(aplicacao => {
      // Se não for uma aplicação de Serigrafia, retorna sem alterações
      if (!aplicacao.tamanho) return aplicacao;
      
      // Funções para cálculo de valor da serigrafia (replicadas para manter consistência)
      const getValorFaixa = (tamanho) => {
        if (!valorPersonalizacoesSerigrafia || !tamanho) return 0;
        let faixas = [];
        if (tamanho === 'A4' && valorPersonalizacoesSerigrafia.a4) faixas = valorPersonalizacoesSerigrafia.a4;
        if (tamanho === 'A3' && valorPersonalizacoesSerigrafia.a3) faixas = valorPersonalizacoesSerigrafia.a3;
        if (tamanho === 'Escudo' && valorPersonalizacoesSerigrafia.escudo) faixas = valorPersonalizacoesSerigrafia.escudo;
        
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
        
        return 0;
      };
      
      const calcValorAplicacao = (aplicacao) => {
        let valor = getValorFaixa(aplicacao.tamanho);
        if (aplicacao.efeito === 'neon' || aplicacao.efeito === 'dourado' || aplicacao.efeito === 'prata') {
          valor *= 1.5;
        }
        const numCores = aplicacao.cores?.length || 0;
        if (numCores > 1) {
          valor += (numCores - 1) * 2;
        }
        return valor;
      };
      
      // Calcula o novo valor
      const novoValor = calcValorAplicacao(aplicacao);
      
      // Retorna a aplicação com o valor atualizado
      return { ...aplicacao, valor: novoValor };
    });
  };
  
  // Atualiza aplicações quando valoresPersonalizacoes ou quantidade do item mudam
  useEffect(() => {
    if (itemSelecionado && valoresPersonalizacoes && Object.keys(valoresPersonalizacoes).length > 0) {
      const aplicacoesRecalculadas = recalcularValoresAplicacoes(
        aplicacoesPorItem[itemSelecionado] || [], 
        quantidadeSelecionada, 
        valoresPersonalizacoes
      );
      
      if (aplicacoesRecalculadas.length > 0) {
        setAplicacoes(aplicacoesRecalculadas);
      }
    }
  }, [valoresPersonalizacoes, quantidadeSelecionada]);

  // --- INÍCIO: Buscar valores das personalizações do backend ---
  useEffect(() => {
    // Adiciona valores fixos para Bordado
    const bordadoValores = {
      escudo: 15,
      a4: 30,
    };
    
    const fetchPersonalizacoes = async () => {
      try {
        setLoadingValores(true);
        setValorError('');
        
        const data = await getPersonalizacoes();
        console.log('Valores de personalização carregados:', data);
        
        setValoresPersonalizacoes({
          ...(data?.serigrafia || {}),
          bordado: bordadoValores
        });
      } catch (error) {
        console.error('Erro ao carregar valores de personalização:', error);
        setValorError(error.message || 'Falha ao carregar valores de personalização');
        
        // Em caso de erro, usar valores padrão para continuar funcionando
        setValoresPersonalizacoes({ 
          bordado: bordadoValores,
          escudo: [],
          a4: [],
          a3: []
        });
      } finally {
        setLoadingValores(false);
      }
    };
    
    fetchPersonalizacoes();
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
      aplicacoes, // Mantido para compatibilidade talvez?
      corelFile, // Mantido para compatibilidade talvez?
    });
  };

  return (
    <Form onSubmit={handleSubmit} autoComplete="off">
      <h3>Personalização</h3>
      
      {loadingValores && (
        <LoadingMessage>Carregando valores de personalização...</LoadingMessage>
      )}
      
      {valorError && (
        <ErrorMessage>
          {valorError}
          <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Alguns valores podem não estar corretos. Prossiga com cuidado.
          </div>
        </ErrorMessage>
      )}
      
      {itens.length > 0 && (
        <Row>
          <label style={{ fontWeight: 600, color: '#15616f' }}>Selecione o item para personalizar:</label>
          <select value={itemSelecionado} onChange={e => setItemSelecionado(e.target.value)} style={{ padding: '0.6rem 1rem', borderRadius: 8, border: '1.5px solid #c2e3e3', fontSize: '1.07rem' }}>
            {itens.map((item) => (
              <option value={item.id} key={item.id}>
                {Array.isArray(item.personalizacao) ? item.personalizacao.join(', ') : item.personalizacao} - {item.malha} - {item.tipoMalha} - {item.cor} - {item.corte} (Qtd: {item.quantidade})
              </option>
            ))}
          </select>
        </Row>
      )}
      {tiposPersonalizacao.length > 0 && renderPersonalizacoesDoItem(itemAtual, aplicacoes, setAplicacoes, quantidadeSelecionada).map((componente, idx) => (
        <div key={tiposPersonalizacao[idx]} style={{ marginBottom: 18, marginTop: 16, fontWeight: 600, color: '#15616f', fontSize: 17, borderBottom: '1px solid #e0e0e0', paddingBottom: 8 }}>
          Tipo de Personalização: <span style={{ color: '#22a2a2', fontWeight: 800 }}>{tiposPersonalizacao[idx]}</span>
          {componente}
        </div>
      ))}
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
