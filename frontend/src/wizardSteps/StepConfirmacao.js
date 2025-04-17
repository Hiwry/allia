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

export default function StepConfirmacao({ onBack, data, onConfirm }) {
  // Resumo detalhado
  const itens = data.itens || [];
  const aplicacoesPorItem = data.aplicacoesPorItem || {};
  const pagamentos = data.pagamentos || [];

  // Subtotais
  const subtotalCostura = itens.reduce((sum, item) => sum + (item.valorTotal || 0), 0);
  // Personalização: soma todas aplicações de todos os itens multiplicando pelo respectivo item.quantidade
  let subtotalPersonalizacao = 0;
  if (aplicacoesPorItem) {
    subtotalPersonalizacao = Object.entries(aplicacoesPorItem).reduce((sum, [itemId, aplicacoes]) => {
      const item = itens.find(i => String(i.id) === String(itemId));
      const qtd = item && item.quantidade ? item.quantidade : 1;
      return sum + aplicacoes.reduce((s, aplic) => s + (aplic.valor || 0) * qtd, 0);
    }, 0);
  }
  // Resumo de valores unitários por item
  const resumoUnitario = itens.map(item => {
    const valorUnitCostura = calcularValorUnitarioCostura(item);
    let valorUnitPersonalizacao = 0;
    // Agora: soma o valor de cada aplicação (por peça, sem dividir)
    if (aplicacoesPorItem[item.id] && aplicacoesPorItem[item.id].length) {
      valorUnitPersonalizacao = aplicacoesPorItem[item.id]
        .map(aplic => Number(aplic.valor) || 0)
        .reduce((s, v) => s + v, 0);
    }
    // Acrescimos: usa os acrescimos salvos no item (GG, EXG, G1, G2, G3)
    const acrescimos = item.acrescimos || {};
    const totalAcrescimo = Object.entries(acrescimos).reduce((a, [tam, val]) => a + (Number(val) || 0) * (item.tamanhos && item.tamanhos[tam.toLowerCase()] ? item.tamanhos[tam.toLowerCase()] : 0), 0);
    const valorUnitAcrescimo = item.quantidade > 0 ? totalAcrescimo / item.quantidade : 0;
    const valorUnitTotal = valorUnitCostura + valorUnitPersonalizacao;
    return {
      descricao: item.descricao,
      valorUnitCostura,
      valorUnitPersonalizacao,
      valorUnitAcrescimo,
      valorUnitTotal,
      acrescimos,
      totalAcrescimo,
      quantidade: item.quantidade
    };
  });
  const totalAcrescimos = resumoUnitario.reduce((sum, r) => sum + (r.totalAcrescimo || 0), 0);
  const subtotalGeral = subtotalCostura + subtotalPersonalizacao + totalAcrescimos;

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

  // Função para renderizar cores
  const renderCores = cores => (
    <span>{cores && cores.map((c, i) => (
      <span key={i} style={{ background: c, display: 'inline-block', width: 18, height: 18, borderRadius: 4, marginRight: 3, border: '1px solid #ccc' }} title={c} />
    ))}</span>
  );

  // Função para renderizar tamanhos
  const renderTamanhos = tamanhos => (
    <span>{Object.entries(tamanhos || {}).filter(([_, qtd]) => qtd > 0).map(([tam, qtd]) => (
      <span key={tam} style={{ marginRight: 8 }}>{tam.toUpperCase()}: {qtd}</span>
    ))}</span>
  );

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

  // Dropzone para colar ou arrastar imagem
  const onDrop = React.useCallback(acceptedFiles => {
    if (acceptedFiles && acceptedFiles[0]) {
      const file = acceptedFiles[0];
      setCapaPedido(URL.createObjectURL(file));
      setCapaError('');
    }
  }, []);
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
            e.preventDefault();
            return;
          }
        }
      }
    }
    window.addEventListener('paste', handlePasteGlobal);
    return () => window.removeEventListener('paste', handlePasteGlobal);
  }, []);

  return (
    <Wrapper>
      <h3>Confirmação do Pedido</h3>
      <Summary>
        <div style={{ marginBottom: 18, borderBottom: '1px solid #e0e0e0', paddingBottom: 8 }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>
            <span style={{ color: '#15616f' }}>Data do Pedido:</span> {dataPedido}
          </div>
          <div style={{ fontWeight: 700, fontSize: 16, marginTop: 2 }}>
            <span style={{ color: '#15616f' }}>Data Prevista de Entrega:</span> {dataEntregaStr}
            {entregaAntesPrazo && (
              <span style={{ color: '#d32f2f', marginLeft: 8, fontWeight: 700, fontSize: 15 }}>
                (Solicitar aprovação da produção/supervisor)
              </span>
            )}
          </div>
        </div>
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontWeight: 700, color: '#15616f', fontSize: 17, marginBottom: 4 }}>Resumo da Costura</div>
          {itens.map((item, idx) => (
            <div key={idx} style={{ marginBottom: 14, padding: 10, borderRadius: 8, background: '#f7fafb', border: '1px solid #e0e0e0' }}>
              <div style={{ fontWeight: 600, marginBottom: 3 }}>{item.personalizacao} - {item.malha} - {item.tipoMalha} - {item.cor} - {item.corte} <span style={{ color: '#888', fontWeight: 400 }}>(Qtd: {item.quantidade})</span></div>
              <div style={{ color: '#22a2a2', fontWeight: 700, fontSize: 15 }}>Valor: R$ {item.valorTotal?.toFixed(2) || '0,00'}</div>
              <div style={{ marginTop: 2 }}><b>Cores:</b> {renderCores(item.cores ? item.cores : [item.cor])}</div>
              <div><b>Tamanhos:</b> {renderTamanhos(item.tamanhos)}</div>
              {item.gola && item.tipoGola && (
                <div style={{ marginTop: 2 }}><b>Gola:</b> {item.tipoGola} {IMAGENS_GOLA[item.tipoGola] && <img src={IMAGENS_GOLA[item.tipoGola]} alt={item.tipoGola} style={{ width: 32, verticalAlign: 'middle', marginLeft: 6, borderRadius: 4, border: '1px solid #ddd' }} />}</div>
              )}
            </div>
          ))}
        </div>
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontWeight: 700, color: '#15616f', fontSize: 17, marginBottom: 4 }}>Resumo da Personalização</div>
          {aplicacoesPorItem && Object.values(aplicacoesPorItem).length > 0 ? (
            Object.values(aplicacoesPorItem).map((aplicacoes, idx) => (
              <div key={idx} style={{ padding: 10, borderRadius: 8, background: '#f7fafb', border: '1px solid #e0e0e0' }}>
                <div style={{ fontWeight: 600, marginBottom: 3 }}>
                  Para: {itens[idx].personalizacao} - {itens[idx].malha} - {itens[idx].tipoMalha} - {itens[idx].cor} - {itens[idx].corte} <span style={{ color: '#888', fontWeight: 400 }}>(Qtd: {itens[idx].quantidade})</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {aplicacoes.map((aplic, idx) => (
                    <li key={idx} style={{ marginBottom: 10, listStyle: 'disc inside', fontSize: 15 }}>
                      {aplic.tamanho && <span><b>Tamanho:</b> {aplic.tamanho} </span>}
                      {aplic.efeito && <span><b>Efeito:</b> {aplic.efeito} </span>}
                      {aplic.local && <span><b>Local:</b> {aplic.local} </span>}
                      {aplic.cores && aplic.cores.length > 0 && <span><b>Cores:</b> {renderCores(aplic.cores)}</span>}
                      {aplic.nomesCores && aplic.nomesCores.length > 0 && (
                        <span> ({aplic.nomesCores.filter(Boolean).join(', ')})</span>
                      )}
                      {aplic.nomeCor && <span> ({aplic.nomeCor})</span>}
                      {aplic.imagemUrl && (
                        <span> <img src={aplic.imagemUrl} alt="Aplicação" style={{ width: 38, borderRadius: 6, marginLeft: 4, verticalAlign: 'middle', border: '1px solid #ddd' }} /></span>
                      )}
                      {aplic.valor ? <span style={{ fontWeight: 600, color: '#15616f' }}> - R$ {aplic.valor.toFixed(2)}</span> : ''}
                      {aplic.valor && itens[idx] && itens[idx].quantidade ? <span style={{ color: '#888', fontWeight: 400 }}> x {itens[idx] && itens[idx].quantidade ? itens[idx].quantidade : 1} = R$ {(aplic.valor * (itens[idx] && itens[idx].quantidade ? itens[idx].quantidade : 1)).toFixed(2)}</span> : ''}
                      {aplic.nomeArte && (
                        <div><b>Nome da Arte:</b> <span style={{ color: '#15616f' }}>{aplic.nomeArte}</span></div>
                      )}
                      {aplic.obs && (
                        <div><b>Obs:</b> <span style={{ color: '#444' }}>{aplic.obs}</span></div>
                      )}
                      <div>
                        <b>Tamanho Padrão?</b> <span style={{ color: aplic.tamanhoPadrao ? '#22a2a2' : '#d32f2f', fontWeight: 700 }}>{aplic.tamanhoPadrao ? 'Sim (proporcional)' : 'Não'}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : <span style={{ color: '#888' }}>Nenhuma aplicação adicionada.</span>}
        </div>
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontWeight: 700, color: '#15616f', fontSize: 17, marginBottom: 4 }}>Pagamentos</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {pagamentos.map((pag, idx) => (
              <li key={idx} style={{ marginBottom: 5, fontSize: 15 }}>
                {pag.metodo && pag.valor ? <span><b>{pag.metodo.toUpperCase()}:</b> R$ {Number(pag.valor).toFixed(2)}</span> : ''}
              </li>
            ))}
          </ul>
          {/* NOVO: Resumo de pagamento/falta/troco */}
          {(() => {
            const totalPago = pagamentos.reduce((sum, pag) => sum + (Number(pag.valor) || 0), 0);
            const faltaPagar = typeof data.faltaPagar === 'number' ? data.faltaPagar : (subtotalGeral - totalPago);
            if (faltaPagar > 0) {
              return <div style={{ color: '#d32f2f', fontWeight: 700, marginTop: 8 }}>Falta pagar: R$ {faltaPagar.toFixed(2)}</div>;
            } else if (totalPago > subtotalGeral) {
              return <div style={{ color: '#22a2a2', fontWeight: 700, marginTop: 8 }}>Troco: R$ {(totalPago - subtotalGeral).toFixed(2)}</div>;
            } else if (totalPago === subtotalGeral && subtotalGeral > 0) {
              return <div style={{ color: '#22a2a2', fontWeight: 700, marginTop: 8 }}>Pagamento completo</div>;
            }
            return null;
          })()}
        </div>
        {/* CAPA DO PEDIDO - Layout final */}
        <div style={{ marginBottom: 24, padding: 12, border: '2px dashed #22a2a2', borderRadius: 8, background: '#f9fdfc' }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#15616f', marginBottom: 6 }}>Layout Final da Camisa (Capa do Pedido)</div>
          <div style={{ marginBottom: 8 }}>
            <button type="button" onClick={() => document.getElementById('capaPedidoInput').click()} style={{ marginRight: 12, padding: '7px 18px', borderRadius: 6, background: '#22a2a2', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Enviar Imagem</button>
            <input id="capaPedidoInput" type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
              const file = e.target.files[0];
              setCapaPedido(URL.createObjectURL(file));
              setCapaError('');
            }} />
            <span style={{ color: '#888', marginRight: 12 }}>ou</span>
            <span style={{ color: '#15616f', fontWeight: 500 }}>Arraste, cole (Ctrl+V) ou clique abaixo:</span>
          </div>
          <div
            {...getRootProps()}
            style={{ border: '1.5px dashed #b5e6e6', borderRadius: 6, minHeight: 120, background: isDragActive ? '#e0f7fa' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: 8, outline: 'none', position: 'relative' }}
          >
            <input {...getInputProps()} />
            <div style={{ zIndex: 1, width: '100%', textAlign: 'center' }}>
              {capaPedido ? (
                <img src={capaPedido} alt="Capa do Pedido" style={{ maxHeight: 200, maxWidth: '100%', borderRadius: 6 }} />
              ) : (
                <span style={{ color: '#bbb' }}>Arraste, cole (Ctrl+V) ou clique aqui para enviar uma imagem.</span>
              )}
            </div>
          </div>
          {capaError && <div style={{ color: '#d32f2f', fontWeight: 600 }}>{capaError}</div>}
        </div>
        {/* RESUMO UNITÁRIO */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontWeight: 700, color: '#15616f', fontSize: 17, marginBottom: 4 }}>Valores Unitários</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8 }}>
            <thead>
              <tr style={{ background: '#f0f4f8', fontWeight: 600 }}>
                <td style={{ padding: 6, border: '1px solid #e0e0e0' }}>Item</td>
                <td style={{ padding: 6, border: '1px solid #e0e0e0' }}>Costura</td>
                <td style={{ padding: 6, border: '1px solid #e0e0e0' }}>Personalização</td>
                <td style={{ padding: 6, border: '1px solid #e0e0e0' }}>Total</td>
                <td style={{ padding: 6, border: '1px solid #e0e0e0' }}>Acres. GG/EXG</td>
                <td style={{ padding: 6, border: '1px solid #e0e0e0' }}>Total Acréscimo</td>
                <td style={{ padding: 6, border: '1px solid #e0e0e0' }}>Unit. Acréscimo</td>
              </tr>
            </thead>
            <tbody>
              {resumoUnitario.map((r, idx) => (
                <tr key={idx}>
                  <td style={{ padding: 6, border: '1px solid #e0e0e0' }}>{r.descricao}</td>
                  <td style={{ padding: 6, border: '1px solid #e0e0e0' }}>R$ {r.valorUnitCostura.toFixed(2)}</td>
                  <td style={{ padding: 6, border: '1px solid #e0e0e0' }}>R$ {r.valorUnitPersonalizacao.toFixed(2)}</td>
                  <td style={{ padding: 6, border: '1px solid #e0e0e0', fontWeight: 700 }}>R$ {r.valorUnitTotal.toFixed(2)}</td>
                  <td style={{ padding: 6, border: '1px solid #e0e0e0' }}>
                    {Object.entries(r.acrescimos).length > 0 && Object.entries(r.acrescimos).some(([tam, val]) => Number(val) > 0)
                      ? Object.entries(r.acrescimos)
                          .filter(([tam, val]) => Number(val) > 0)
                          .map(([tam, val]) => `${tam}: +R$${Number(val).toFixed(2)}`)
                          .join(' | ')
                      : '-'}
                  </td>
                  <td style={{ padding: 6, border: '1px solid #e0e0e0', color: r.totalAcrescimo > 0 ? '#d32f2f' : '#15616f', fontWeight: 700 }}>
                    {r.totalAcrescimo > 0 ? `R$ ${r.totalAcrescimo.toFixed(2)}` : '-'}
                  </td>
                  <td style={{ padding: 6, border: '1px solid #e0e0e0', color: '#15616f' }}>
                    {r.valorUnitAcrescimo > 0 ? `R$ ${r.valorUnitAcrescimo.toFixed(2)}` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* SUBTOTAIS COM ACRESCIMOS UNITÁRIOS */}
        <div style={{ fontWeight: 700, fontSize: 17, marginTop: 10, background: '#f8f9fa', borderRadius: 8, padding: 10, border: '1px solid #e0e0e0' }}>
          <div style={{ color: '#22a2a2' }}>Subtotal Costura: <b>R$ {subtotalCostura.toFixed(2)}</b></div>
          <div style={{ color: '#22a2a2' }}>Subtotal Personalização: <b>R$ {subtotalPersonalizacao.toFixed(2)}</b></div>
          <div style={{ color: '#15616f', fontWeight: 900, fontSize: 22, marginTop: 4 }}>Total: R$ {subtotalGeral.toFixed(2)}</div>
          {/* NOVO: valor unitário total + acrescimos */}
          <div style={{ color: '#15616f', fontWeight: 700, fontSize: 16, marginTop: 10 }}>
            Valor Unitário Total (Costura + Personalização): <b>R$ {resumoUnitario.length > 0 ? resumoUnitario[0].valorUnitTotal.toFixed(2) : '0,00'}</b>
          </div>
        </div>
      </Summary>
      <ButtonRow>
        <Button type="button" onClick={onBack} style={{ background: '#eee', color: '#15616f' }}>Voltar</Button>
        <Button type="button" onClick={async () => {
          if (onConfirm) {
            const link = await onConfirm();
            window.prompt('Envie este link ao cliente para confirmação:', link);
          }
        }}>Confirmar Pedido</Button>
      </ButtonRow>
    </Wrapper>
  );
}
