import React from 'react';
import styled from 'styled-components';
import { useDropzone } from 'react-dropzone';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  align-items: center;
`;

const Summary = styled.div`
  width: 100%;
  background: #f8f8f8;
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: center;
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

// Estilo para as miniaturas no resumo
const SummaryImage = styled.img`
  width: 32px;
  height: 32px;
  object-fit: contain; // Usar contain para ver a imagem inteira
  vertical-align: middle;
  margin-left: 8px;
  margin-right: 4px;
  border-radius: 4px;
  border: 1px solid #ddd;
  background-color: #fff; // Fundo branco caso a imagem seja transparente
`;

const SectionTitle = styled.h4`
  margin-top: 1.5rem;
  margin-bottom: 0.8rem;
  color: ${({ theme }) => theme.colors.primary || '#15616f'};
  border-bottom: 2px solid ${({ theme }) => theme.colors.border || '#c2e3e3'};
  padding-bottom: 0.3rem;
`;

const InfoItem = styled.div`
  margin-bottom: 0.5rem;
  line-height: 1.5;
`;

// Função auxiliar para formatar o endereço
const formatarEndereco = (endereco) => {
  if (!endereco) return 'N/A';
  const parts = [
    endereco.rua,
    endereco.numero,
    endereco.complemento,
    endereco.bairro,
    endereco.cidade,
    endereco.estado,
    endereco.cep
  ];
  return parts.filter(Boolean).join(', '); // Junta as partes não vazias com vírgula
};

// Novo componente Dropzone estilizado
const StyledDropzone = styled.div`
  border: 2px dashed ${({ theme }) => theme.colors.border || '#c2e3e3'};
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  background-color: #fdfdfd;
  color: #666;
  margin-top: 1rem;
  transition: border-color 0.2s, background-color 0.2s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary || '#15616f'};
    background-color: #f9f9f9;
  }
`;

const PreviewImage = styled.img`
  max-width: 100px;
  max-height: 100px;
  margin-top: 10px;
  border-radius: 4px;
  border: 1px solid #ddd;
`;

export default function StepConfirmacao({ onBack, data, loggedInUser, onConfirm, isSaving, layoutFile, setLayoutFile }) {
  // Resumo detalhado
  const itens = data.itens || [];
  const aplicacoesPorItem = data.aplicacoesPorItem || {};
  const pagamentos = data.pagamentos || [];

  // **REVISADO**: Cálculo dos valores e totais
  const resumoUnitario = itens.map(item => {
    const valorUnitCostura = 
        (item.valorBase || 0) + 
        (item.valorCorte || 0) +
        (item.valorGola || 0) + 
        (item.valorDetalhe || 0);

    let valorUnitPersonalizacao = 0;
    if (aplicacoesPorItem[item.id] && aplicacoesPorItem[item.id].length) {
      valorUnitPersonalizacao = aplicacoesPorItem[item.id]
        .map(aplic => Number(aplic.valor) || 0)
        .reduce((s, v) => s + v, 0);
    }

    const valorUnitarioBase = valorUnitCostura + valorUnitPersonalizacao;

    const acrescimosUnitarios = {};
    let valorTotalAcrescimosItem = 0;
    Object.entries(item.tamanhos || {}).forEach(([tam, qtdTamanho]) => {
      if (Number(qtdTamanho) > 0) {
        let acrescUnitario = 0;
        const tamUpper = tam.toUpperCase();

        if (valorUnitarioBase < 20) {
          if (tamUpper === 'GG') acrescUnitario = 1;
          if (tamUpper === 'EXG') acrescUnitario = 2;
          if (tamUpper === 'G1') acrescUnitario = 10;
          if (tamUpper === 'G2') acrescUnitario = 20;
          if (tamUpper === 'G3') acrescUnitario = 30;
        } else if (valorUnitarioBase >= 20 && valorUnitarioBase < 50) {
          if (tamUpper === 'GG') acrescUnitario = 2;
          if (tamUpper === 'EXG') acrescUnitario = 4;
          if (tamUpper === 'G1') acrescUnitario = 10;
          if (tamUpper === 'G2') acrescUnitario = 20;
          if (tamUpper === 'G3') acrescUnitario = 30;
        } else { // valorUnitarioBase >= 50
          if (tamUpper === 'GG') acrescUnitario = 5;
          if (tamUpper === 'EXG') acrescUnitario = 10;
          if (tamUpper === 'G1') acrescUnitario = 15;
          if (tamUpper === 'G2') acrescUnitario = 25;
          if (tamUpper === 'G3') acrescUnitario = 35;
        }

        if (acrescUnitario > 0) {
          acrescimosUnitarios[tamUpper] = acrescUnitario;
          valorTotalAcrescimosItem += acrescUnitario * Number(qtdTamanho);
        }
      }
    });

    const valorUnitarioFinal = valorUnitarioBase + (item.quantidade > 0 ? valorTotalAcrescimosItem / item.quantidade : 0);
    const valorTotalFinalItem = valorUnitarioBase * item.quantidade + valorTotalAcrescimosItem;

    return {
      descricao: item.descricao,
      valorUnitCostura,
      valorUnitPersonalizacao,
      acrescimosUnitarios,
      valorUnitarioFinal,
      valorTotalFinalItem,
      quantidade: item.quantidade
    };
  });

  const calculatedSubtotalCostura = resumoUnitario.reduce((sum, r) => sum + r.valorUnitCostura * r.quantidade, 0);
  const calculatedSubtotalPersonalizacao = resumoUnitario.reduce((sum, r) => sum + r.valorUnitPersonalizacao * r.quantidade, 0);
  const calculatedSubtotalAcrescimos = resumoUnitario.reduce((sum, r) => {
    const itemOriginal = itens.find(i => i.descricao === r.descricao);
    const tamanhosQtd = itemOriginal?.tamanhos || {};
    return sum + Object.entries(r.acrescimosUnitarios).reduce((itemSum, [tam, acrescUnit]) => {
        const qtdTamanho = tamanhosQtd[tam.toLowerCase()] || 0;
        return itemSum + (acrescUnit * qtdTamanho);
    }, 0);
  }, 0);
  const calculatedSubtotalGeral = calculatedSubtotalCostura + calculatedSubtotalPersonalizacao + calculatedSubtotalAcrescimos;

  // Função para formatar valores monetários
  const formatCurrency = (value) => {
    return `R$ ${(value || 0).toFixed(2)}`.replace('.', ',');
  };

  // Preparar detalhes de personalização para exibição
  const getAplicacoesDetalhes = () => {
    if (!aplicacoesPorItem || Object.keys(aplicacoesPorItem).length === 0) {
      return null;
    }

    return Object.entries(aplicacoesPorItem).map(([itemId, aplicacoes]) => {
      const item = itens.find(i => String(i.id) === String(itemId));
      if (!item || !aplicacoes || aplicacoes.length === 0) return null;

      const qtdItem = item.quantidade || 1;
      
      return (
        <div key={itemId} style={{ 
          marginBottom: '0.75rem', 
          backgroundColor: '#f8f9fa', 
          padding: '0.75rem',
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#15616f' }}>
            {item.descricao} (Qtd: {qtdItem})
          </div>
          <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #dee2e6' }}>
                <th style={{ padding: '0.25rem', textAlign: 'left' }}>Aplicação</th>
                <th style={{ padding: '0.25rem', textAlign: 'left' }}>Tamanho</th>
                <th style={{ padding: '0.25rem', textAlign: 'left' }}>Local</th>
                <th style={{ padding: '0.25rem', textAlign: 'left' }}>Valores</th>
              </tr>
            </thead>
            <tbody>
              {aplicacoes.map((aplic, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f3f5' }}>
                  <td style={{ padding: '0.25rem', verticalAlign: 'top' }}>
                    {aplic.nomeArte || `Aplicação ${idx + 1}`}
                    {aplic.efeito && <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>Efeito: {aplic.efeito}</div>}
                    {aplic.cores && aplic.cores.length > 0 && (
                      <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                        Cores: {aplic.cores.length}
                        <div style={{ display: 'flex', gap: '3px', marginTop: '3px' }}>
                          {aplic.cores.map((cor, i) => (
                            <div key={i} style={{ 
                              width: '12px', 
                              height: '12px', 
                              backgroundColor: cor,
                              border: '1px solid #dee2e6',
                              borderRadius: '2px'
                            }} title={aplic.nomesCores?.[i] || cor} />
                          ))}
                        </div>
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '0.25rem', verticalAlign: 'top' }}>{aplic.tamanho || '-'}</td>
                  <td style={{ padding: '0.25rem', verticalAlign: 'top' }}>{aplic.local || '-'}</td>
                  <td style={{ padding: '0.25rem', verticalAlign: 'top' }}>
                    <div>
                      Unit.: {formatCurrency(aplic.valor || 0)}
                    </div>
                    <div>
                      Total: {formatCurrency((aplic.valor || 0) * qtdItem)}
                    </div>
                  </td>
                </tr>
              ))}
              <tr style={{ backgroundColor: '#e7f7f7' }}>
                <td colSpan="3" style={{ padding: '0.25rem', fontWeight: 600, textAlign: 'right' }}>
                  Subtotal personalização:
                </td>
                <td style={{ padding: '0.25rem', fontWeight: 600, color: '#15616f' }}>
                  {formatCurrency(aplicacoes.reduce((sum, a) => sum + (a.valor || 0) * qtdItem, 0))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    }).filter(Boolean);
  };

  // Datas
  const now = new Date();
  const dataPedido = now.toLocaleDateString('pt-BR');
  function adicionarDiasUteis(data, dias) {
    let resultado = new Date(data);
    let adicionados = 0;
    while (adicionados < dias) {
      resultado.setDate(resultado.getDate() + 1);
      if (resultado.getDay() !== 0 && resultado.getDay() !== 6) {
        adicionados++;
      }
    }
    return resultado;
  }
  const dataEntrega = adicionarDiasUteis(now, 15);
  const dataEntregaStr = dataEntrega.toLocaleDateString('pt-BR');
  const entregaAntesPrazo = data.entregaDesejada && new Date(data.entregaDesejada) < dataEntrega;

  // Função para renderizar tamanhos
  const renderTamanhos = tamanhos => (
    <span>{Object.entries(tamanhos || {}).filter(([_, qtd]) => qtd > 0).map(([tam, qtd]) => (
      <span key={tam} style={{ marginRight: 8 }}>{tam.toUpperCase()}: {qtd}</span>
    ))}</span>
  );

  // Função para renderizar todas as cores das aplicações do item
  const renderTodasCoresDoItem = itemId => {
    const aplics = aplicacoesPorItem[itemId] || [];
    // Garante alinhamento dos nomes com as cores
    const coresNomes = aplics.flatMap(a => {
      const cores = a.cores || [];
      const nomes = a.nomesCores || [];
      return cores.map((cor, idx) => ({
        cor,
        nome: nomes[idx] || ''
      }));
    });
    return (
      <span>
        {coresNomes.map((cn, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', marginRight: 7 }}>
            <span style={{
              background: cn.cor,
              display: 'inline-block',
              width: 18,
              height: 18,
              borderRadius: 4,
              border: '1px solid #888',
              marginRight: 2
            }} />
            <span style={{ fontSize: 13, color: '#222', marginRight: 3 }}>
              {cn.nome ? cn.nome : null}
            </span>
          </span>
        ))}
      </span>
    );
  };

  // Função para renderizar imagem gola
  const IMAGENS_GOLA = {
    'Gola Careca': '/assets/golas/gola-careca.png',
    'Gola Polo': '/assets/golas/gola-polo.png',
    'Gola V': '/assets/golas/gola-v.png',
  };

  // Cálculo de valores unitários
  function calcularValorUnitarioCostura(item) {
    return item.valorTotal && item.quantidade ? item.valorTotal / item.quantidade : 0;
  }
  function calcularValorUnitarioPersonalizacao(aplic, qtd) {
    return aplic.valor || 0;
  }
  // Função para acréscimos GG/EXG/G1+/G2+/G3+ (case-insensitive)
  function acrescimoGGEXG(valorUnitario, tamanho) {
    const t = tamanho.toUpperCase();
    let acrescimo = 0;
    if (["GG", "EXG", "G1", "G2", "G3"].includes(t)) {
      if (valorUnitario < 20) {
        if (t === "GG") acrescimo = 1;
        if (t === "EXG") acrescimo = 2;
      } else if (valorUnitario < 50) {
        if (t === "GG") acrescimo = 2;
        if (t === "EXG") acrescimo = 4;
      } else {
        if (t === "GG") acrescimo = 5;
        if (t === "EXG") acrescimo = 10;
      }
      if (t === "G1") acrescimo = 10;
      if (t === "G2") acrescimo = 20;
      if (t === "G3") acrescimo = 30;
    }
    return acrescimo;
  }

  // Imagem da capa do pedido (layout final)
  const [capaPedido, setCapaPedido] = React.useState(data.capaPedido || null);
  const [capaError, setCapaError] = React.useState('');

  // Novo: manter referência ao arquivo real para o parent
  React.useEffect(() => {
    if (layoutFile && capaPedido === null) {
      // Se já existe um arquivo vindo do parent, exibe o preview
      setCapaPedido(URL.createObjectURL(layoutFile));
    }
    // eslint-disable-next-line
  }, []);

  // Dropzone para colar ou arrastar imagem
  const onDrop = React.useCallback(acceptedFiles => {
    if (acceptedFiles && acceptedFiles[0]) {
      const file = acceptedFiles[0];
      setCapaPedido(URL.createObjectURL(file));
      setCapaError('');
      setLayoutFile(file); // <- Passa o File real para o parent
    }
  }, [setLayoutFile]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {'image/*': []},
    multiple: false,
    onDrop
  });

  // Novo: suporte a colar imagem via evento global (clipboardData)
  React.useEffect(() => {
    function handlePasteGlobal(e) {
      if (e.clipboardData && e.clipboardData.items) {
        for (let i = 0; i < e.clipboardData.items.length; i++) {
          const item = e.clipboardData.items[i];
          if (item.type.indexOf('image') !== -1) {
            const file = item.getAsFile();
            const url = URL.createObjectURL(file);
            setCapaPedido(url);
            setCapaError('');
            setLayoutFile(file); // <- Passa o File real para o parent
            e.preventDefault();
            return;
          }
        }
      }
    }
    window.addEventListener('paste', handlePasteGlobal);
    return () => window.removeEventListener('paste', handlePasteGlobal);
  }, [setLayoutFile]);

  // **MODIFICADO**: Acessar diretamente data.cliente, pois sempre será passado o objeto
  const cliente = data.cliente || {}; // Objeto vazio como fallback

  // Função auxiliar para renderizar valor se existir
  const renderOptionalValue = (label, value) => {
    if (typeof value === 'number' && value > 0) {
      return <div>{label}: R$ {value.toFixed(2)}</div>;
    }
    return null;
  };

  // Função para identificar descontos por aplicação
  function getDescontosAplicacoes(aplics) {
    // Retorna array de booleans, true se deve aplicar desconto de 50% na aplicação
    if (!Array.isArray(aplics) || aplics.length < 3) return aplics.map(() => false);
    // A partir da terceira aplicação, desconto de 50% para TODAS de menor valor
    const aplicsParaDesconto = aplics.slice(2);
    const menorValor = Math.min(...aplicsParaDesconto.map(a => a.valor));
    return aplics.map((a, idx) => idx >= 2 && a.valor === menorValor);
  }

  return (
    <Wrapper>
      <h3 style={{marginBottom: 8}}>Confirmação do Pedido</h3>
      <Summary>
        <SectionTitle>Dados do Cliente</SectionTitle>
        <InfoItem><strong>Nome:</strong> {cliente.nome || 'N/A'}</InfoItem>
        <InfoItem><strong>CPF/CNPJ:</strong> {cliente.cpfCnpj || 'N/A'}</InfoItem>
        <InfoItem><strong>Telefone:</strong> {cliente.telefone || 'N/A'}</InfoItem>
        <InfoItem><strong>Email:</strong> {cliente.email || 'N/A'}</InfoItem>
        <InfoItem><strong>Endereço:</strong> {formatarEndereco(cliente.endereco)}</InfoItem>
        <InfoItem><strong>Categoria:</strong> {cliente.categoria || 'N/A'}</InfoItem>
        <InfoItem><strong>Obs:</strong> {cliente.obs || 'Nenhuma'}</InfoItem>

        {/* **NOVO**: Seção Vendedor */} 
        {loggedInUser && (loggedInUser.name !== 'Usuário não logado') && (
            <>
                <SectionTitle>Dados do Vendedor</SectionTitle>
                <InfoItem><strong>Nome:</strong> {loggedInUser.name || 'N/A'}</InfoItem>
                <InfoItem><strong>Loja:</strong> {loggedInUser.loja || 'N/A'}</InfoItem>
            </>
        )}

        <SectionTitle>Resumo dos Itens</SectionTitle>
        {itens.map((item, index) => {
          // Encontrar o resumo correspondente para este item
          const itemResumo = resumoUnitario[index] || {}; 
          const acrescimosDoItem = itemResumo.acrescimosUnitarios || {};
          const temAcrescimos = Object.keys(acrescimosDoItem).length > 0;
          
          return (
            <div key={index} style={{ marginBottom: 12, paddingBottom: 10, borderBottom: '1px dashed #eee' }}>
              <strong>Item {index + 1}: {item.descricao || 'Personalizado'}</strong><br />
              
              {/* **MODIFICADO**: Adicionar swatch de cor do tecido */}
              Cor: {item.cor || 'N/A'} 
              {item.corRgb && 
                <span style={{ 
                  display: 'inline-block', 
                  width: 14, height: 14, 
                  background: item.corRgb, 
                  border: '1px solid #ccc', 
                  marginLeft: 4, 
                  verticalAlign: 'middle' 
                }}></span>}
              <br />
              
              Malha: {item.tipoMalha || 'N/A'}, Corte: {item.corte || 'N/A'}<br />

              {/* **NOVO**: Detalhamento Custo Costura */}
              <div style={{ fontSize: '0.9em', marginLeft: 10, color: '#555' }}>
                {renderOptionalValue('Valor Base', item.valorBase)}
                {renderOptionalValue('Valor Gola', item.valorGola)}
                {renderOptionalValue('Valor Detalhe', item.valorDetalhe)}
              </div>
              
              {/* Exibição Gola/Detalhe com imagens */}
              Gola: {item.gola ? `Sim (${item.tipoGola || 'Tipo N/A'})` : 'Não'}
              {item.imagemGolaUrl && <SummaryImage src={item.imagemGolaUrl} alt="Gola" />}
              <br />
              Detalhe: {item.detalhe ? `Sim (${item.tipoDetalhe || 'Tipo N/A'})` : 'Não'}
              {item.imagemDetalheUrl && <SummaryImage src={item.imagemDetalheUrl} alt="Detalhe" />}
              <br />
              
              Tamanhos: {renderTamanhos(item.tamanhos)}
              <br />
              
              Aplicações: {aplicacoesPorItem[item.id] && aplicacoesPorItem[item.id].length > 0 ? 'Sim' : (
                 <span style={{color:'#d32f2f', fontWeight:600}}>Nenhuma aplicação encontrada!</span>
               )}
              {/* PERSONALIZAÇÃO AGRUPADA POR LOCAL/PARTE */}
              {aplicacoesPorItem[item.id]?.length > 0 && (
                <div style={{ margin: '8px 0 8px 10px' }}>
                  {Object.entries(
                    aplicacoesPorItem[item.id].reduce((acc, aplic) => {
                      const parte = aplic.local || 'Outra Parte';
                      if (!acc[parte]) acc[parte] = [];
                      acc[parte].push(aplic);
                      return acc;
                    }, {})
                  ).map(([parte, aplics]) => {
                    // Calcular descontos para as aplicações deste item
                    const descontosFlags = getDescontosAplicacoes(aplics);
                    return (
                      <div key={parte} style={{ marginBottom: 16 }}>
                        <div style={{ fontWeight: 600, color: '#15616f', marginBottom: 4, fontSize: '1.05em' }}>{parte}</div>
                        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.95em', marginBottom: 4 }}>
                          <thead>
                            <tr style={{ background: '#f2f2f2' }}>
                              <th style={{ border: '1px solid #e0e0e0', padding: '4px 8px' }}>Tipo</th>
                              <th style={{ border: '1px solid #e0e0e0', padding: '4px 8px' }}>Arte</th>
                              <th style={{ border: '1px solid #e0e0e0', padding: '4px 8px' }}>Tamanho</th>
                              <th style={{ border: '1px solid #e0e0e0', padding: '4px 8px', textAlign: 'center' }}>Qtd</th>
                              <th style={{ border: '1px solid #e0e0e0', padding: '4px 8px' }}>
                                Cores
                              </th>
                              <th style={{ border: '1px solid #e0e0e0', padding: '4px 8px' }}>Valor Unit.</th>
                              <th style={{ border: '1px solid #e0e0e0', padding: '4px 8px' }}>Imagem</th>
                            </tr>
                          </thead>
                          <tbody>
                            {aplics.map((aplic, idx) => (
                              <tr key={idx}>
                                <td style={{ border: '1px solid #e0e0e0', padding: '4px 8px' }}>
                                  {
                                    aplic.tipoPersonalizacao
                                      || aplic.tipo
                                      || (item.personalizacao && (Array.isArray(item.personalizacao) ? item.personalizacao.join(', ') : item.personalizacao))
                                      || '-'
                                  }
                                </td>
                                <td style={{ border: '1px solid #e0e0e0', padding: '4px 8px' }}>{aplic.nomeArte || aplic.arte || 'N/A'}</td>
                                <td style={{ border: '1px solid #e0e0e0', padding: '4px 8px' }}>{aplic.tamanho || 'N/A'}</td>
                                <td style={{ border: '1px solid #e0e0e0', padding: '4px 8px', textAlign: 'center' }}>{aplic.qtd || 1}</td>
                                <td style={{ border: '1px solid #e0e0e0', padding: '4px 8px' }}>
                                  {renderTodasCoresDoItem(item.id)}
                                </td>
                                <td style={{ border: '1px solid #e0e0e0', padding: '4px 8px', textAlign: 'right' }}>
                                  R$ {descontosFlags[idx] ? ((aplic.valor || 0) * 0.5).toFixed(2) : (aplic.valor || 0).toFixed(2)}
                                  {descontosFlags[idx] && <span style={{ color: '#178b8b', fontWeight: 600, marginLeft: 4 }}>(50% desc.)</span>}
                                </td>
                                <td style={{ border: '1px solid #e0e0e0', padding: '4px 8px', textAlign: 'center' }}>
                                  {aplic.imagemUrl && <img src={aplic.imagemUrl} alt="Arte" style={{ width: 36, borderRadius: 4 }} />}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })}
                </div>
              )}
              {/* FIM PERSONALIZAÇÃO AGRUPADA */}
              <br />
            </div>
          );
        })}

        {/* **NOVO**: Seção Resumo de Valores Unitários */}
        <SectionTitle>Resumo de Valores Unitários</SectionTitle>
        <div style={{ background: '#f9fbfc', borderRadius: 12, boxShadow: '0 2px 8px #e0f2f1', padding: '1.2rem 1.5rem', marginBottom: 24, maxWidth: 540, marginLeft: 'auto', marginRight: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 16 }}>
            <thead>
              <tr style={{ background: '#e7f4f6', color: '#15616f', borderRadius: 8 }}>
                <th style={{ padding: '0.7rem 0.5rem', textAlign: 'left', borderTopLeftRadius: 8, minWidth: 180 }}>Item</th>
                <th style={{ padding: '0.7rem 0.5rem', textAlign: 'right' }}>Costura<br/>(Unit)</th>
                <th style={{ padding: '0.7rem 0.5rem', textAlign: 'right' }}>Personalização<br/>(Unit)</th>
                <th style={{ padding: '0.7rem 0.5rem', textAlign: 'right', borderTopRightRadius: 8 }}>Total<br/>Unitário</th>
              </tr>
            </thead>
            <tbody>
              {resumoUnitario.map((resumo, idx) => (
                <tr key={idx} style={{ borderBottom: idx === resumoUnitario.length-1 ? 'none' : '1px solid #e0e0e0', background: idx%2===0 ? '#fff' : '#f3fafa' }}>
                  <td style={{ padding: '0.7rem 0.5rem', color: '#15616f', fontWeight: 500, verticalAlign: 'top', lineHeight: 1.3 }}>{resumo.descricao}</td>
                  <td style={{ textAlign: 'right', padding: '0.7rem 0.5rem', color: '#15616f', fontWeight: 600 }}>{Number(resumo.valorUnitCostura).toFixed(2)}</td>
                  <td style={{ textAlign: 'right', padding: '0.7rem 0.5rem', color: '#15616f', fontWeight: 600 }}>{Number(resumo.valorUnitPersonalizacao).toFixed(2)}</td>
                  <td style={{ textAlign: 'right', padding: '0.7rem 0.5rem', fontWeight: 700, color: '#1b8b8b', fontSize: 18 }}>R$ {(Number(resumo.valorUnitCostura) + Number(resumo.valorUnitPersonalizacao)).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <SectionTitle>Resumo Financeiro</SectionTitle>
        <InfoItem>Subtotal Costura: R$ {calculatedSubtotalCostura.toFixed(2)}</InfoItem>
        <InfoItem>Subtotal Personalização: R$ {calculatedSubtotalPersonalizacao.toFixed(2)}</InfoItem>
        <InfoItem>Subtotal Acréscimos (Tamanhos Especiais): R$ {calculatedSubtotalAcrescimos.toFixed(2)}</InfoItem>
        <InfoItem><strong>Valor Total do Pedido: R$ {calculatedSubtotalGeral.toFixed(2)}</strong></InfoItem>

        <SectionTitle>Pagamentos</SectionTitle>
        {pagamentos.length > 0 ? pagamentos.map((pag, index) => (
          <InfoItem key={index}>
            {index + 1}: {pag.forma}
            {pag.metodo && ` (${pag.metodo})`}
            {' - '}R$ {pag.valor ? pag.valor.toFixed(2) : '0.00'}
            {' '}(Status: {pag.status || 'pendente'})
            {pag.dataPagamento && ` - Data: ${new Date(pag.dataPagamento).toLocaleDateString('pt-BR')}`}
          </InfoItem>
        )) : <InfoItem>Nenhum pagamento registrado.</InfoItem>}
        <InfoItem><strong>Total Pago: R$ {pagamentos.reduce((sum, p) => sum + (p.valor || 0), 0).toFixed(2)}</strong></InfoItem>

        <SectionTitle>Dados e Prazos</SectionTitle>
        <InfoItem>Data do Pedido: {dataPedido}</InfoItem>
        <InfoItem>Previsão de Entrega: {dataEntregaStr}</InfoItem>
        <InfoItem><b>Vendedor:</b> {loggedInUser?.name || data?.vendedorNome || data?.nomeVendedor || '-'}</InfoItem>
        <SectionTitle>Layout do Pedido</SectionTitle>
        <div style={{ marginBottom: 16 }}>
          <StyledDropzone {...getRootProps()}>
            <input {...getInputProps()} />
            {isDragActive ? (
              <span>Arraste a imagem aqui...</span>
            ) : capaPedido ? (
              <PreviewImage src={capaPedido} alt="Capa do Pedido" />
            ) : (
              <span>Clique ou arraste para inserir a imagem do layout do pedido</span>
            )}
          </StyledDropzone>
          {capaError && <div style={{ color: 'red', marginTop: 6 }}>{capaError}</div>}
        </div>

        <InfoItem><b>Total Geral Calculado:</b> R$ {calculatedSubtotalGeral.toFixed(2)}</InfoItem>

      </Summary>

      <ButtonRow>
        <Button onClick={onBack} disabled={isSaving} style={{ background: '#6c757d' }}>Voltar</Button>
        <Button onClick={() => {
          // **NOVO**: Atualiza os itens com os acréscimos calculados antes de confirmar
          const itensAtualizados = itens.map((item, index) => {
            const resumoItem = resumoUnitario[index] || {};
            return {
              ...item,
              acrescimos: resumoItem.acrescimosUnitarios || {},
            };
          });
          // Passa os itens atualizados e o total geral calculado para a função onConfirm
          const dataParaSalvar = { 
            ...data, 
            itens: itensAtualizados, 
            capaPedido: layoutFile,
            valorTotalConfirmado: calculatedSubtotalGeral // Adiciona o total calculado
          };
          console.log("Resumo Unitário Calculado:", resumoUnitario);
          console.log("Dados enviados para onConfirm (objeto):", dataParaSalvar); 
          onConfirm(dataParaSalvar);
        }} disabled={isSaving}>
          {isSaving ? 'Salvando...' : 'Confirmar e Salvar Pedido'}
        </Button>
      </ButtonRow>
    </Wrapper>
  );
}
