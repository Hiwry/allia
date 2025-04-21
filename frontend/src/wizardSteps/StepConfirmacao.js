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
    const valorUnitCostura = calcularValorUnitarioCostura(item);
    let valorUnitPersonalizacao = 0;
    if (aplicacoesPorItem[item.id] && aplicacoesPorItem[item.id].length) {
      valorUnitPersonalizacao = aplicacoesPorItem[item.id]
        .map(aplic => Number(aplic.valor) || 0)
        .reduce((s, v) => s + v, 0);
    }

    // Valor unitário base = costura + personalização
    const valorUnitarioBase = valorUnitCostura + valorUnitPersonalizacao;

    // Calcula o acréscimo unitário para cada tamanho aplicável
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
          acrescimosUnitarios[tamUpper] = acrescUnitario; // Guarda acréscimo unitário
          valorTotalAcrescimosItem += acrescUnitario * Number(qtdTamanho); // Soma ao total de acréscimos do item
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

  // **REVISADO**: Cálculos dos subtotais gerais
  const calculatedSubtotalCostura = resumoUnitario.reduce((sum, r) => sum + r.valorUnitCostura * r.quantidade, 0);
  const calculatedSubtotalPersonalizacao = resumoUnitario.reduce((sum, r) => sum + r.valorUnitPersonalizacao * r.quantidade, 0);
  const calculatedSubtotalAcrescimos = resumoUnitario.reduce((sum, r) => {
    // Encontra o item original correspondente para pegar as quantidades por tamanho
    const itemOriginal = itens.find(i => i.descricao === r.descricao); // Assume que descricao é único por item
    const tamanhosQtd = itemOriginal?.tamanhos || {};

    // Soma os acréscimos unitários multiplicados pela quantidade de cada tamanho
    return sum + Object.entries(r.acrescimosUnitarios).reduce((itemSum, [tam, acrescUnit]) => {
        const qtdTamanho = tamanhosQtd[tam.toLowerCase()] || 0;
        return itemSum + (acrescUnit * qtdTamanho);
    }, 0);
  }, 0);

  const calculatedSubtotalGeral = calculatedSubtotalCostura + calculatedSubtotalPersonalizacao + calculatedSubtotalAcrescimos;

  // Datas
  const now = new Date();
  const dataPedido = now.toLocaleDateString('pt-BR');
  // Função para calcular data de entrega (15 dias úteis)
  function adicionarDiasUteis(data, dias) {
    let resultado = new Date(data);
    let adicionados = 0;
    while (adicionados < dias) {
      resultado.setDate(resultado.getDate() + 1);
      // 0 = domingo, 6 = sábado
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

  return (
    <Wrapper>
      <h3>Confirmação do Pedido</h3>
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
              
              Aplicações: {aplicacoesPorItem[item.id] && aplicacoesPorItem[item.id].length > 0 ? 'Sim' : 'Não'}
              {aplicacoesPorItem[item.id]?.map((aplic, idx) => (
                <div key={idx} style={{ fontSize: '0.9em', marginLeft: 10, color: '#555' }}>
                  - {aplic.nomeArte || 'Arte N/A'} ({aplic.local}, {aplic.tamanho}) Valor Unit: R$ {(aplic.valor || 0).toFixed(2)}
                  {/* **NOVO**: Detalhamento Cores da Aplicação */}
                  {aplic.cores && aplic.cores.length > 0 && (
                    <div style={{ marginLeft: 15, marginTop: 2 }}>
                      Cores: {aplic.cores.map((c, i) => (
                        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', marginRight: '8px', marginBottom: '4px' }}>
                          <span 
                            style={{ 
                              background: c, 
                              display: 'inline-block', 
                              width: 14, height: 14, 
                              borderRadius: 3, 
                              marginRight: '4px', 
                              border: '1px solid #ccc' 
                            }} 
                            title={aplic.nomesCores?.[i] || c} 
                          />
                          {aplic.nomesCores?.[i] && <span style={{ fontSize: '0.95em' }}>{aplic.nomesCores[i]}</span>}
                        </span>
                      ))}
                    </div>
                  )}
                  {/* Imagem da Aplicação */}
                  {aplic.imagemUrl && <SummaryImage src={aplic.imagemUrl} alt="Aplicação" style={{ marginLeft: 15, marginTop: 4 }}/>}
                </div>
              ))}
               <br />
               
              Quantidade Total: {item.quantidade || 0}
               <br />
              
              {/* Detalhamento dos Acréscimos (já existente) */}
              {temAcrescimos && (
                <div style={{ fontSize: '0.9em', marginLeft: 10, marginTop: 5, color: '#555' }}>
                  <strong>Acréscimos por Tamanho:</strong>
                  {Object.entries(acrescimosDoItem).map(([tam, acrescUnit]) => {
                    const qtdTamanho = item.tamanhos?.[tam.toLowerCase()] || 0;
                    // Só mostra se a quantidade for maior que zero
                    if (qtdTamanho > 0) {
                      return (
                        <div key={tam} style={{ marginLeft: 10 }}>
                          - {tam}: R$ {acrescUnit.toFixed(2)} x {qtdTamanho} = R$ {(acrescUnit * qtdTamanho).toFixed(2)}
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* **NOVO**: Seção Resumo de Valores Unitários */}
        <SectionTitle>Resumo de Valores Unitários</SectionTitle>
        <div style={{ overflowX: 'auto', marginBottom: '1rem' }}> {/* Adiciona scroll horizontal se necessário */}
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
            <thead>
              <tr style={{ background: '#e9ecef', borderBottom: '2px solid #dee2e6' }}>
                <th style={{ padding: '0.6rem', textAlign: 'left', borderRight: '1px solid #dee2e6' }}>Item</th>
                <th style={{ padding: '0.6rem', textAlign: 'right', borderRight: '1px solid #dee2e6' }}>Costura (Unit)</th>
                <th style={{ padding: '0.6rem', textAlign: 'right', borderRight: '1px solid #dee2e6' }}>Personalização (Unit)</th>
                <th style={{ padding: '0.6rem', textAlign: 'right' }}>Total Unitário</th>
              </tr>
            </thead>
            <tbody>
              {resumoUnitario.map((itemResumo, index) => {
                const totalUnitario = itemResumo.valorUnitCostura + itemResumo.valorUnitPersonalizacao;
                // Busca a descrição original do item (pode melhorar se tiver ID único)
                const itemOriginal = itens.find((_, i) => i === index); 
                const descricaoItem = itemOriginal?.descricao || `Item ${index + 1}`;
                return (
                  <tr key={index} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '0.6rem', borderRight: '1px solid #dee2e6' }}>{descricaoItem}</td>
                    <td style={{ padding: '0.6rem', textAlign: 'right', borderRight: '1px solid #dee2e6' }}>R$ {itemResumo.valorUnitCostura.toFixed(2)}</td>
                    <td style={{ padding: '0.6rem', textAlign: 'right', borderRight: '1px solid #dee2e6' }}>R$ {itemResumo.valorUnitPersonalizacao.toFixed(2)}</td>
                    <td style={{ padding: '0.6rem', textAlign: 'right', fontWeight: 'bold' }}>R$ {totalUnitario.toFixed(2)}</td>
                  </tr>
                );
              })}
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

        <SectionTitle>Datas e Prazos</SectionTitle>
        <InfoItem>Data do Pedido: {dataPedido}</InfoItem>
        <InfoItem>Previsão de Entrega: {dataEntregaStr}</InfoItem>
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
              // Opcional: Atualizar valorTotalFinalItem se necessário (já parece calculado em resumoUnitario)
              // valorTotal: resumoItem.valorTotalFinalItem
            };
          });
          // Passa os itens atualizados para a função onConfirm
          onConfirm({ ...data, itens: itensAtualizados, capaPedido: layoutFile });
        }} disabled={isSaving}>
          {isSaving ? 'Salvando...' : 'Confirmar e Salvar Pedido'}
        </Button>
      </ButtonRow>
    </Wrapper>
  );
}
