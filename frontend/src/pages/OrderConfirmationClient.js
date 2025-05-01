import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// Importar funções da API
import { getOrderForConfirmation, confirmOrder } from '../services/api';

// Função auxiliar para formatar data (pode mover para utils)
const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    // Tenta criar data diretamente, tratamento de timezone pode ser necessário
    return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' }); // Adiciona UTC para consistência
  } catch (e) {
    console.error("Erro ao formatar data:", dateString, e);
    return '-';
  }
};

export default function OrderConfirmationClient() {
  const { token } = useParams(); // **MUDADO**: Pega token em vez de id
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [zoomImg, setZoomImg] = useState(null);

  // Utilitário para garantir URL absoluta da imagem
  const getImagemUrl = (imagem) => {
    if (!imagem) return '';
    if (imagem.startsWith('http')) return imagem;
    if (imagem.startsWith('/uploads/')) return `https://allia.onrender.com${imagem}`;
    return `https://allia.onrender.com/uploads/${imagem}`;
  };

  useEffect(() => {
    async function fetchOrder() {
      if (!token) {
        setError('Token de confirmação inválido.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError('');
        // **MUDADO**: Usa nova função da API
        const data = await getOrderForConfirmation(token);
        console.log("Dados do Pedido Recebidos (Objeto Completo):", data); 

        // LOGS DETALHADOS ADICIONADOS:
        if (data && data.itens && data.itens[0]) {
          const item = data.itens[0];
          console.log("[LOG] Data Prevista Entrega:", data.dataEntrega);
          console.log("[LOG] URL Layout Final:", data.urlLayoutFinal);
          console.log("[LOG] Item[0] Detalhe:", item.detalhe);
          console.log("[LOG] Item[0] Tipo Detalhe:", item.tipoDetalhe);
          console.log("[LOG] Item[0] Valor Detalhe:", item.valorDetalhe);
          console.log("[LOG] Item[0] Imagem Detalhe URL:", item.imagemDetalheUrl);
          console.log("[LOG] Item[0] Valor Gola:", item.valorGola);
        } else {
            console.log("[LOG] Dados básicos do pedido ou itens não encontrados no objeto recebido.");
        }
        if (data && data.aplicacoesPorItem) {
           // Acessar aplicações (precisa do ID do item, assumindo que é o mesmo do itens[0] se existir)
           const itemId = data.itens?.[0]?._id || Object.keys(data.aplicacoesPorItem)[0]; 
           const aplicacoes = data.aplicacoesPorItem[itemId];
           if (aplicacoes && aplicacoes[0]) {
               console.log("[LOG] Aplicação[0] Nomes Cores:", aplicacoes[0].nomesCores);
           } else {
               console.log("[LOG] Aplicações ou nomes de cores não encontrados para o item:", itemId);
           }
        } else {
            console.log("[LOG] aplicacoesPorItem não encontrado no objeto recebido.");
        }
        // FIM DOS LOGS DETALHADOS

        if (data && data._id) {
          setOrder(data); // Sempre seta o pedido, independente do status
        } else {
          setError('Pedido não encontrado ou token inválido.');
          setOrder(null);
        }
      } catch (err) {
        setError(err.message || 'Erro ao buscar dados do pedido.');
        setOrder(null);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [token]);

  // **NOVO**: Função para lidar com a confirmação
  const handleConfirmClick = async () => {
    if (!acceptedTerms || !token || isConfirming) {
        return;
    }
    setIsConfirming(true);
    setError('');
    try {
      const result = await confirmOrder(token); // Chama a API PUT
      alert(result.message || 'Pedido confirmado com sucesso!');
      // Exibe o pedido atualizado (status 'conferido') ou redireciona
      setOrder(prev => ({ ...prev, status: 'conferido' }));
      // ou navigate('/confirmacao-sucesso');
    } catch (err) {
        setError(err.message || 'Erro ao confirmar o pedido.');
        alert(`Erro ao confirmar: ${err.message || 'Tente novamente.'}`);
    } finally {
        setIsConfirming(false);
    }
  };

  if (loading) return <div style={{ padding: 24 }}>Carregando dados do pedido...</div>;
  if (error) return <div style={{ padding: 24, color: 'red' }}>Erro: {error}</div>;

  // **REVISAR/AJUSTAR**: Cálculos para exibição (mantendo a estrutura por enquanto)
  const itens = order?.itens || [];
  const pagamentos = order?.pagamentos || [];
  const aplicacoesPorItem = order?.aplicacoesPorItem || {};
  const urlLayoutFinal = order?.urlLayoutFinal;
  // TODO: Alinhar estes cálculos com os de StepConfirmacao se houver discrepância
  const subtotalGeral = order?.valorTotal || 0; // Usa o valor total salvo no pedido
  const totalPagamentos = pagamentos.reduce((sum, pag) => sum + (Number(pag.valor) || 0), 0);
  const faltaPagar = subtotalGeral - totalPagamentos;

  // Função renderCor (simplificada, sem nome por enquanto)
  const renderCor = (cor, nome) => (
    <span title={nome || cor} style={{ display: 'inline-flex', alignItems: 'center', marginRight: 4 }}>
      <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 4, background: cor, border: '1px solid #bbb', marginRight: nome ? 2 : 0, verticalAlign: 'middle' }} />
      {nome && <span style={{fontSize: '0.9em', color: '#555'}}>{nome}</span>}
    </span>
  );

  return (
    <div>
      {error && <div style={{ color: 'red', textAlign: 'center', margin: '30px 0', fontWeight: 700, fontSize: 20 }}>{error}</div>}
      {order && (
        <div style={{ maxWidth: 800, margin: '0 auto', background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px #15616f22', padding: 32, marginBottom: 40 }}>
          <h2 style={{ color: '#15616f', marginBottom: 18, fontSize: 28, fontWeight: 900, letterSpacing: 0.5 }}>Confirmação do Pedido</h2>
          <div style={{ color: '#468', marginBottom: 10, fontSize: 16, fontWeight: 500 }}>
            <b>Data do Pedido:</b> {formatDate(order.createdAt)}
          </div>
          <div style={{ color: '#468', marginBottom: 10, fontSize: 16, fontWeight: 500 }}>
            <b>Data Prevista de Entrega:</b> {formatDate(order.dataEntrega)}
          </div>
          {/* SELLER INFO BLOCK - ALWAYS SHOW */}
          <div style={{ background: '#f0f7fa', borderRadius: 8, padding: 14, marginBottom: 20, border: '1px solid #c2e3e3' }}>
            <div style={{ color: '#15616f', marginBottom: 4, fontSize: 16, fontWeight: 600 }}>
              <b>Vendedor:</b>{' '}
              {order.nomeVendedor
                || order.vendedor?.name
                || 'Não informado'}
            </div>
            {(order.nomeLoja || order.vendedor?.loja) && (
              <div style={{ color: '#15616f', fontSize: 16, fontWeight: 500 }}>
                <b>Loja:</b> {order.nomeLoja || order.vendedor?.loja}
              </div>
            )}
          </div>
          <div style={{ border: '1.5px solid #c2e3e3', borderRadius: 12, background: '#f8f8f8', padding: 18, marginBottom: 18 }}>
            <div style={{ fontWeight: 700, color: '#15616f', fontSize: 19, marginBottom: 7 }}>Resumo da Costura</div>
            {itens.map((item, idx) => (
              <div key={idx} style={{ marginBottom: 10, fontSize: 15 }}>
                <b>{item.personalizacao} - {item.malha} - {item.tipoMalha} - {item.cor} - {item.corte}</b> (Qtd: {item.quantidade})<br />
                <span style={{ color: '#15616f' }}>Valor (Item):</span> <b>R$ {(item.valorTotal || 0).toFixed(2)}</b><br />
                <span style={{ color: '#15616f' }}>Cor:</span> {item.cor} {item.corRgb && renderCor(item.corRgb, item.cor)}<br />
                <span style={{ color: '#15616f' }}>Tamanhos:</span> {item.tamanhos && Object.entries(item.tamanhos).filter(([_, qtd]) => qtd > 0).map(([tam, qtd]) => `${tam.toUpperCase()}: ${qtd}`).join(', ')}<br />
                {item.gola && item.tipoGola && (
                  <span style={{ display: 'block', marginTop: 2 }}>
                    <span style={{ color: '#15616f' }}>Gola:</span> {item.tipoGola}
                    {item.imagemGolaUrl && <img src={item.imagemGolaUrl} alt={item.tipoGola} style={{ width: 28, height: 28, objectFit: 'contain', verticalAlign: 'middle', marginLeft: 6, borderRadius: 4, border: '1px solid #ddd' }} onError={(e) => { e.target.style.display='none'; }}/>}
                    {(typeof item.valorGola === 'number') && <span style={{color: '#3bb6b6'}}> R$ {item.valorGola.toFixed(2)}</span>}
                  </span>
                )}
                {item.detalhe && item.tipoDetalhe && (
                  <span style={{ display: 'block', marginTop: 2 }}>
                    <span style={{ color: '#15616f' }}>Detalhe:</span> {item.tipoDetalhe}
                    {item.imagemDetalheUrl && <img src={item.imagemDetalheUrl} alt={item.tipoDetalhe} style={{ width: 28, height: 28, objectFit: 'contain', verticalAlign: 'middle', marginLeft: 6, borderRadius: 4, border: '1px solid #ddd' }} onError={(e) => { e.target.style.display='none'; }}/>}
                    {(typeof item.valorDetalhe === 'number') && <span style={{color: '#3bb6b6'}}> R$ {item.valorDetalhe.toFixed(2)}</span>}
                  </span>
                )}
              </div>
            ))}
          </div>
          <div style={{ border: '1.5px solid #c2e3e3', borderRadius: 12, background: '#f8f8f8', padding: 18, marginBottom: 18 }}>
            <div style={{ fontWeight: 700, color: '#15616f', fontSize: 19, marginBottom: 7 }}>Resumo da Personalização</div>
            {Object.entries(aplicacoesPorItem).map(([itemId, aplics], idx) => {
                const itemDesc = itens.find(i => String(i.id || i._id || itemId) === String(itemId))?.descricao || `Item ${idx + 1}`;
                return (
                    <div key={itemId} style={{ marginBottom: 10, fontSize: 15 }}>
                        <b>Para:</b> {itemDesc}
                        {aplics.map((aplic, aidx) => (
                        <div key={aidx} style={{ marginLeft: 14, marginTop: 4, marginBottom: 8, borderLeft: '3px solid #22a2a2', paddingLeft: 10, background: '#fafdff', borderRadius: 8 }}>
                            <span style={{ color: '#15616f' }}>Tamanho:</span> {aplic.tamanho} | <span style={{ color: '#15616f' }}>Local:</span> {aplic.local} | <span style={{ color: '#15616f' }}>Valor (Unit):</span> R$ {(aplic.valor || 0).toFixed(2)}<br />
                            {(aplic.cores && aplic.cores.length > 0) || (aplic.nomesCores && aplic.nomesCores.length > 0) ? (
                              <span>
                                <span style={{ color: '#15616f' }}>Cor(es):</span> 
                                {aplic.cores ? 
                                  aplic.cores.map((cor, i) => renderCor(cor, aplic.nomesCores?.[i])) 
                                  : aplic.nomesCores?.map(nome => renderCor(null, nome))
                                }
                                <br />
                              </span>
                            ) : null}
                            {aplic.nomeArte && <span><span style={{ color: '#15616f' }}>Nome da Arte:</span> {aplic.nomeArte} <br /></span>}
                            {aplic.tamanhoPadrao && <span><span style={{ color: '#15616f' }}>Tamanho Padrão?</span> Sim <br /></span>}
                            {aplic.imagemUrl && (
                                <img
                                    src={getImagemUrl(aplic.imagemUrl)}
                                    alt="Aplicação"
                                    style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '1.5px solid #e0e0e0', marginTop: 6, marginBottom: 4, cursor: 'zoom-in', boxShadow: '0 1px 8px #0001' }}
                                    onClick={() => setZoomImg(getImagemUrl(aplic.imagemUrl))}
                                />
                            )}
                        </div>
                        ))}
                    </div>
                );
            })}
          </div>
          <div style={{ border: '1.5px solid #c2e3e3', borderRadius: 12, background: '#f8f8f8', padding: 18, marginBottom: 18 }}>
            <div style={{ fontWeight: 700, color: '#15616f', fontSize: 19, marginBottom: 7 }}>Pagamentos</div>
            <ul style={{ marginBottom: 0, fontSize: 15, paddingLeft: 20 }}>
              {pagamentos.map((pag, idx) => (
                <li key={idx}>{pag.forma?.toUpperCase()} - <b>R$ {(Number(pag.valor) || 0).toFixed(2)}</b> {pag.dataPagamento && `(Pago em: ${formatDate(pag.dataPagamento)})`}</li>
              ))}
            </ul>
            {faltaPagar > 0.005 && (
              <div style={{ color: '#d32f2f', fontWeight: 700, fontSize: 16, marginTop: 6 }}>Falta pagar: R$ {faltaPagar.toFixed(2)}</div>
            )}
          </div>
          <div style={{ border: '2px dashed #22a2a2', borderRadius: 14, background: '#fafdff', padding: 18, marginBottom: 18, textAlign: 'center' }}>
            <div style={{ fontWeight: 700, color: '#15616f', fontSize: 19, marginBottom: 7 }}>Layout Final da Camiseta</div>
            {urlLayoutFinal ? (
              <img
                src={getImagemUrl(urlLayoutFinal)}
                alt="Layout Final"
                style={{ maxHeight: 200, maxWidth: '100%', borderRadius: 10, cursor: 'zoom-in', boxShadow: '0 4px 24px #0008', marginTop: 10, marginBottom: 6, border: '2px solid #c2e3e3' }}
                onClick={() => setZoomImg(getImagemUrl(urlLayoutFinal))}
              />
            ) : (
              <span style={{ color: '#bbb', fontSize: 15 }}>Nenhuma imagem de layout enviada.</span>
            )}
          </div>
          <div style={{ marginBottom: 26, display: 'flex', alignItems: 'center', gap: 12 }}>
            <input
              type="checkbox"
              id="termos"
              checked={acceptedTerms}
              onChange={e => setAcceptedTerms(e.target.checked)}
              disabled={order.status !== 'pendente_confirmacao_cliente' || isConfirming}
            />
            <label htmlFor="termos" style={{ fontSize: 16, color: '#15616f', cursor: order.status !== 'pendente_confirmacao_cliente' || isConfirming ? 'default' : 'pointer', fontWeight: 500 }}>
              Li e aceito os <a href="#" target="_blank" rel="noopener noreferrer">Termos e Condições</a>
            </label>
          </div>
          <div style={{ margin: '24px 0', textAlign: 'center' }}>
            {order.status === 'pendente_confirmacao_cliente' && (
              <button
                style={{ background: acceptedTerms && !isConfirming ? '#22a2a2' : '#ccc', color: '#fff', border: 'none', borderRadius: 10, padding: '13px 38px', fontWeight: 800, fontSize: 20, cursor: acceptedTerms && !isConfirming ? 'pointer' : 'not-allowed', boxShadow: acceptedTerms && !isConfirming ? '0 2px 18px #22a2a233' : 'none', letterSpacing: 0.2 }}
                onClick={handleConfirmClick}
                disabled={!acceptedTerms || isConfirming}
              >
                {isConfirming ? 'Confirmando...' : 'Confirmar Pedido'}
              </button>
            )}
            {order.status !== 'pendente_confirmacao_cliente' && (
              <div style={{ color: '#22a2a2', fontWeight: 700, fontSize: 20 }}>Pedido já confirmado ou em processamento!</div>
            )}
          </div>
          <div style={{ color: '#888', fontSize: 15, marginTop: 10 }}>Ao confirmar, seu pedido será processado e você receberá atualizações por e-mail/WhatsApp.</div>
          {zoomImg && (
            <div className="zoom-modal" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'zoom-out' }}
              onClick={() => setZoomImg(null)}
            >
              <img src={getImagemUrl(zoomImg)} alt="Zoom" style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', borderRadius: 8 }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
