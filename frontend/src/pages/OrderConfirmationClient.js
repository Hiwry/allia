import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function OrderConfirmationClient() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = React.useState(null);
  const [acceptedTerms, setAcceptedTerms] = React.useState(false);
  const [zoomImg, setZoomImg] = React.useState(null);

  React.useEffect(() => {
    // Busca do backend pelo id usando a função getOrder do service
    async function fetchOrder() {
      try {
        const res = await import('../services/api');
        const data = await res.getOrder(id);
        if (data && (data._id || data.id)) {
          setOrder(data);
        } else {
          setOrder(null);
        }
      } catch {
        setOrder(null);
      }
    }
    fetchOrder();
  }, [id]);

  if (!order) return <div style={{ padding: 24 }}>Pedido não encontrado.</div>;

  // Dados principais
  const itens = order.itens || [];
  const pagamentos = order.pagamentos || [];
  const aplicacoesPorItem = order.aplicacoesPorItem || {};
  const capaPedido = order.capaPedido;

  // Subtotais
  const subtotalCostura = itens.reduce((sum, item) => sum + (item.valorTotal || 0), 0);
  let subtotalPersonalizacao = 0;
  if (aplicacoesPorItem) {
    subtotalPersonalizacao = Object.entries(aplicacoesPorItem).reduce((sum, [itemId, aplicacoes]) => {
      // Pega o item correto para dividir pelo total
      const item = itens.find(i => String(i.id) === String(itemId));
      if (!item || !item.quantidade) return sum;
      // Soma o valor total de todas aplicações deste item
      return sum + aplicacoes.map(a => Number(a.valor) || 0).reduce((s, v) => s + v, 0);
    }, 0);
  }
  const subtotalGeral = subtotalCostura + subtotalPersonalizacao;

  // Total de pagamentos
  const totalPagamentos = pagamentos.reduce((sum, pag) => sum + (Number(pag.valor) || 0), 0);

  // Troco ou falta pagar
  let troco = 0;
  let faltaPagar = 0;
  if (totalPagamentos > subtotalGeral) {
    troco = totalPagamentos - subtotalGeral;
  } else if (totalPagamentos < subtotalGeral) {
    faltaPagar = subtotalGeral - totalPagamentos;
  }

  // Função para exibir cor com nome
  const renderCor = (cor, nome) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', marginRight: 8 }}>
      <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 4, background: cor, border: '1px solid #bbb', marginRight: 4 }}></span>
      <span style={{ fontSize: 13 }}>{nome || cor}</span>
    </span>
  );

  // Resumo unitário
  const resumoUnitario = itens.map(item => {
    const valorUnitCostura = item.valorTotal && item.quantidade ? item.valorTotal / item.quantidade : 0;
    let valorUnitPersonalizacao = 0;
    if (aplicacoesPorItem[item.id] && aplicacoesPorItem[item.id].length && item.quantidade > 0) {
      valorUnitPersonalizacao = aplicacoesPorItem[item.id]
        .map(aplic => Number(aplic.valor) || 0)
        .reduce((sum, v) => sum + v, 0) / item.quantidade;
    }
    const acrescimos = item.acrescimos || {};
    const totalAcrescimo = Object.values(acrescimos).reduce((a, b) => a + Number(b), 0);
    const valorUnitTotal = valorUnitCostura + valorUnitPersonalizacao + (totalAcrescimo / (item.quantidade || 1));
    return {
      descricao: item.descricao,
      valorUnitCostura,
      valorUnitPersonalizacao,
      valorUnitTotal,
      acrescimos,
      totalAcrescimo,
      quantidade: item.quantidade
    };
  });

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', background: '#fff', borderRadius: 16, boxShadow: '0 2px 24px #0002', padding: 36 }}>
      <h2 style={{ color: '#15616f', marginBottom: 18, fontSize: 28, fontWeight: 900, letterSpacing: 0.5 }}>Confirmação do Pedido</h2>
      <div style={{ color: '#468', marginBottom: 10, fontSize: 16, fontWeight: 500 }}>
        <b>Data do Pedido:</b> {order.dataPedido || '-'} &nbsp;|&nbsp;
        <b>Data Prevista de Entrega:</b> {order.dataEntrega || '-'}
      </div>
      {/* Bloco Resumo Costura */}
      <div style={{ border: '1.5px solid #c2e3e3', borderRadius: 12, background: '#f8f8f8', padding: 18, marginBottom: 18 }}>
        <div style={{ fontWeight: 700, color: '#15616f', fontSize: 19, marginBottom: 7 }}>Resumo da Costura</div>
        {itens.map((item, idx) => (
          <div key={idx} style={{ marginBottom: 10, fontSize: 15 }}>
            <b>{item.descricao}</b> (Qtd: {item.quantidade})<br />
            <span style={{ color: '#15616f' }}>Valor:</span> <b>R$ {item.valorTotal?.toFixed(2)}</b><br />
            <span style={{ color: '#15616f' }}>Cores:</span> {item.cores?.map((cor, i) => renderCor(cor, item.nomesCores && item.nomesCores[i]))}<br />
            <span style={{ color: '#15616f' }}>Tamanhos:</span> {item.tamanhos && Object.entries(item.tamanhos).filter(([_, qtd]) => qtd > 0).map(([tam, qtd]) => `${tam}: ${qtd}`).join(', ')}<br />
            <span style={{ color: '#15616f' }}>Gola:</span> {item.gola || '-'}
          </div>
        ))}
      </div>
      {/* Bloco Resumo Personalização */}
      <div style={{ border: '1.5px solid #c2e3e3', borderRadius: 12, background: '#f8f8f8', padding: 18, marginBottom: 18 }}>
        <div style={{ fontWeight: 700, color: '#15616f', fontSize: 19, marginBottom: 7 }}>Resumo da Personalização</div>
        {Object.entries(aplicacoesPorItem).map(([itemId, aplics], idx) => (
          <div key={idx} style={{ marginBottom: 10, fontSize: 15 }}>
            <b>Para:</b> {itens.find(i => String(i.id) === String(itemId))?.descricao}
            {aplics.map((aplic, aidx) => (
              <div key={aidx} style={{ marginLeft: 14, marginTop: 4, marginBottom: 8, borderLeft: '3px solid #22a2a2', paddingLeft: 10, background: '#fafdff', borderRadius: 8 }}>
                <span style={{ color: '#15616f' }}>Tamanho:</span> {aplic.tamanho} &nbsp;|&nbsp; <span style={{ color: '#15616f' }}>Local:</span> {aplic.local} &nbsp;|&nbsp; <span style={{ color: '#15616f' }}>Cor(es):</span> {aplic.cores?.map((cor, i) => renderCor(cor, aplic.nomesCores && aplic.nomesCores[i]))} &nbsp;|&nbsp; <span style={{ color: '#15616f' }}>Valor:</span> R$ {aplic.valor?.toFixed(2)}<br />
                {aplic.nomeArte && <span><span style={{ color: '#15616f' }}>Nome da Arte:</span> {aplic.nomeArte} <br /></span>}
                {aplic.tamanhoPadrao && <span><span style={{ color: '#15616f' }}>Tamanho Padrão?</span> Sim <br /></span>}
                {aplic.imagemUrl && (
                  <img
                    src={aplic.imagemUrl}
                    alt="Aplicação"
                    style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '1.5px solid #e0e0e0', marginTop: 6, marginBottom: 4, cursor: 'zoom-in', boxShadow: '0 1px 8px #0001' }}
                    onClick={() => setZoomImg(aplic.imagemUrl)}
                  />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      {/* Bloco Pagamentos */}
      <div style={{ border: '1.5px solid #c2e3e3', borderRadius: 12, background: '#f8f8f8', padding: 18, marginBottom: 18 }}>
        <div style={{ fontWeight: 700, color: '#15616f', fontSize: 19, marginBottom: 7 }}>Pagamentos</div>
        <ul style={{ marginBottom: 0, fontSize: 15 }}>
          {pagamentos.map((pag, idx) => (
            <li key={idx}>{pag.metodo?.toUpperCase()} - <b>R$ {Number(pag.valor).toFixed(2)}</b></li>
          ))}
        </ul>
        {faltaPagar > 0 && (
          <div style={{ color: '#d32f2f', fontWeight: 700, fontSize: 16, marginTop: 6 }}>Falta pagar: R$ {faltaPagar.toFixed(2)}</div>
        )}
        {troco > 0 && (
          <div style={{ color: '#22a2a2', fontWeight: 700, fontSize: 16, marginTop: 6 }}>Troco: R$ {troco.toFixed(2)}</div>
        )}
      </div>
      {/* Bloco Layout Final */}
      <div style={{ border: '2px dashed #22a2a2', borderRadius: 14, background: '#fafdff', padding: 18, marginBottom: 18, textAlign: 'center' }}>
        <div style={{ fontWeight: 700, color: '#15616f', fontSize: 19, marginBottom: 7 }}>Layout Final da Camiseta (Capa do Pedido)</div>
        {capaPedido ? (
          <img
            src={capaPedido}
            alt="Capa do Pedido"
            style={{ maxHeight: 200, maxWidth: '100%', borderRadius: 10, cursor: 'zoom-in', boxShadow: '0 4px 24px #0002', marginTop: 10, marginBottom: 6, border: '2px solid #c2e3e3' }}
            onClick={() => setZoomImg(capaPedido)}
          />
        ) : (
          <span style={{ color: '#bbb', fontSize: 15 }}>Nenhuma imagem enviada.</span>
        )}
      </div>
      {/* Bloco Valores Unitários */}
      <div style={{ background: '#f8f8f8', borderRadius: 12, padding: 18, marginBottom: 22, border: '1.5px solid #c2e3e3' }}>
        <div style={{ fontWeight: 700, color: '#15616f', fontSize: 19, marginBottom: 7 }}>Valores Unitários</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 10 }}>
          <thead>
            <tr style={{ background: '#f0f4f8', fontWeight: 700, fontSize: 15 }}>
              <td style={{ padding: 8, border: '1px solid #e0e0e0' }}>Item</td>
              <td style={{ padding: 8, border: '1px solid #e0e0e0' }}>Qtd</td>
              <td style={{ padding: 8, border: '1px solid #e0e0e0' }}>Costura</td>
              <td style={{ padding: 8, border: '1px solid #e0e0e0' }}>Personalização</td>
              <td style={{ padding: 8, border: '1px solid #e0e0e0' }}>Acréscimo</td>
              <td style={{ padding: 8, border: '1px solid #e0e0e0' }}>Total Unitário</td>
              <td style={{ padding: 8, border: '1px solid #e0e0e0' }}>Total</td>
              <td style={{ padding: 8, border: '1px solid #e0e0e0' }}>Imagens</td>
            </tr>
          </thead>
          <tbody>
            {resumoUnitario.map((r, idx) => (
              <tr key={idx} style={{ fontWeight: 600, fontSize: 15 }}>
                <td style={{ padding: 8, border: '1px solid #e0e0e0' }}>{r.descricao}</td>
                <td style={{ padding: 8, border: '1px solid #e0e0e0', textAlign: 'center' }}>{r.quantidade}</td>
                <td style={{ padding: 8, border: '1px solid #e0e0e0' }}>R$ {r.valorUnitCostura.toFixed(2)}</td>
                <td style={{ padding: 8, border: '1px solid #e0e0e0' }}>R$ {r.valorUnitPersonalizacao.toFixed(2)}</td>
                <td style={{ padding: 8, border: '1px solid #e0e0e0', color: r.totalAcrescimo > 0 ? '#d32f2f' : '#15616f', fontWeight: 600 }}>
                  {Object.entries(r.acrescimos).length > 0
                    ? Object.entries(r.acrescimos).map(([tam, val]) => `${tam}: +R$${val}`).join(' | ')
                    : '-'}
                </td>
                <td style={{ padding: 8, border: '1px solid #e0e0e0', fontWeight: 700 }}>R$ {r.valorUnitTotal.toFixed(2)}</td>
                <td style={{ padding: 8, border: '1px solid #e0e0e0', fontWeight: 700, color: '#15616f' }}>R$ {(r.valorUnitTotal * r.quantidade).toFixed(2)}</td>
                <td style={{ padding: 8, border: '1px solid #e0e0e0' }}>
                  {/* Imagens das aplicações por item */}
                  {aplicacoesPorItem[r.descricao?.id || r.descricao]?.map((aplic, aidx) => (
                    aplic.imagemUrl ? (
                      <img
                        key={aidx}
                        src={aplic.imagemUrl}
                        alt="Aplicação"
                        style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6, border: '1px solid #e0e0e0', marginRight: 4, cursor: 'zoom-in', boxShadow: '0 1px 6px #0001' }}
                        onClick={() => setZoomImg(aplic.imagemUrl)}
                      />
                    ) : null
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ color: '#22a2a2', fontWeight: 700, fontSize: 16, marginTop: 4 }}>Subtotal Costura: <b>R$ {subtotalCostura.toFixed(2)}</b></div>
        <div style={{ color: '#22a2a2', fontWeight: 700, fontSize: 16, marginTop: 2 }}>Subtotal Personalização: <b>R$ {subtotalPersonalizacao.toFixed(2)}</b></div>
        <div style={{ color: '#15616f', fontWeight: 900, fontSize: 22, marginTop: 4 }}>Total: R$ {subtotalGeral.toFixed(2)}</div>
      </div>
      {/* Checkbox termos */}
      <div style={{ marginBottom: 26, display: 'flex', alignItems: 'center', gap: 12 }}>
        <input
          type="checkbox"
          id="termos"
          checked={acceptedTerms}
          onChange={e => setAcceptedTerms(e.target.checked)}
          disabled={order.status === 'confirmado'}
        />
        <label htmlFor="termos" style={{ fontSize: 16, color: '#15616f', cursor: order.status === 'confirmado' ? 'default' : 'pointer', fontWeight: 500 }}>
          Li e aceito os <a href="#" style={{ color: '#15616f', textDecoration: 'underline' }}>Termos e Condições</a>
        </label>
      </div>
      {/* Botão de confirmação */}
      <div style={{ margin: '24px 0', textAlign: 'center' }}>
        {order.status !== 'confirmado' && (
          <button
            style={{ background: acceptedTerms ? '#22a2a2' : '#ccc', color: '#fff', border: 'none', borderRadius: 10, padding: '13px 38px', fontWeight: 800, fontSize: 20, cursor: acceptedTerms ? 'pointer' : 'not-allowed', boxShadow: acceptedTerms ? '0 2px 18px #22a2a233' : 'none', letterSpacing: 0.2 }}
            onClick={() => {
              // Atualiza status para confirmado no localStorage
              const saved = localStorage.getItem('orders');
              if (saved) {
                const arr = JSON.parse(saved).map(o => String(o.id) === String(id) ? { ...o, status: 'confirmado' } : o);
                localStorage.setItem('orders', JSON.stringify(arr));
                setOrder({ ...order, status: 'confirmado' });
                alert('Pedido confirmado com sucesso!');
                navigate('/dashboard');
              }
            }}
            disabled={!acceptedTerms}
          >
            Confirmar Pedido
          </button>
        )}
        {order.status === 'confirmado' && (
          <div style={{ color: '#22a2a2', fontWeight: 700, fontSize: 20 }}>Pedido já confirmado!</div>
        )}
      </div>
      <div style={{ color: '#888', fontSize: 15, marginTop: 10 }}>Ao confirmar, seu pedido será processado e você receberá atualizações por e-mail/WhatsApp.</div>
      {/* Modal de Zoom */}
      {zoomImg && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setZoomImg(null)}>
          <img src={zoomImg} alt="Zoom" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 18, boxShadow: '0 8px 40px #0008' }} />
        </div>
      )}
    </div>
  );
}
