import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { getOrderForConfirmation, getOrder } from '../services/api';
<<<<<<< HEAD
=======
import OrderConfirmationClient from '../pages/OrderConfirmationClient';
>>>>>>> 4b938adcf806d3d2cd967dfc8bb80932662d410a

const Overlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.65);
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const ModalBox = styled.div`
  background: #fff;
  border-radius: 18px;
  max-width: 900px;
  width: 98vw;
  max-height: 93vh;
  overflow-y: auto;
  box-shadow: 0 12px 48px #0007;
  padding: 32px 36px 26px 36px;
  position: relative;
`;
const CloseBtn = styled.button`
  position: absolute;
  top: 18px;
  right: 22px;
  background: none;
  border: none;
  font-size: 2rem;
  color: #888;
  cursor: pointer;
  z-index: 2;
`;

export default function PedidoModal({ pedidoId, onClose }) {
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchPedido() {
      setLoading(true);
      setError('');
      try {
        let data = null;
        // Tenta buscar por token (rota de confirmação) primeiro
        try {
          data = await getOrderForConfirmation(pedidoId);
        } catch (e) {
          // Se falhar, tenta buscar pelo ID
          data = await getOrder(pedidoId);
        }
        setPedido(data);
      } catch (err) {
        setError('Erro ao buscar detalhes do pedido.');
      } finally {
        setLoading(false);
      }
    }
    if (pedidoId) fetchPedido();
  }, [pedidoId]);

  if (!pedidoId) return null;
<<<<<<< HEAD
  return (
    <Overlay onClick={onClose}>
      <ModalBox onClick={e => e.stopPropagation()}>
        <CloseBtn onClick={onClose} title="Fechar">×</CloseBtn>
        {loading ? (
          <div style={{ color: '#22a2a2', fontWeight: 700, fontSize: 22, textAlign: 'center' }}>Carregando pedido...</div>
        ) : error ? (
          <div style={{ color: 'red', fontWeight: 600, fontSize: 18 }}>{error}</div>
        ) : pedido ? (
          <div>
            <h2 style={{ color: '#15616f', fontWeight: 800, fontSize: 30, marginBottom: 20 }}>Pedido #{pedido.numeroPedido || pedido._id?.slice(-5)}</h2>
            <div style={{ display: 'flex', gap: 30, flexWrap: 'wrap', marginBottom: 18 }}>
              <div style={{ minWidth: 260 }}>
                <div style={{ fontWeight: 700, color: '#22344a', fontSize: 18 }}>{pedido.cliente?.nome || '-'}</div>
                <div style={{ color: '#888', fontSize: 15 }}>Vendedor: {pedido.vendedor?.nome || pedido.vendedor || '-'}</div>
                <div style={{ color: '#888', fontSize: 15 }}>Entrega: {pedido.dataEntrega ? new Date(pedido.dataEntrega).toLocaleDateString('pt-BR') : '-'}</div>
                <div style={{ color: '#888', fontSize: 15 }}>Status: {pedido.status}</div>
                <div style={{ color: '#888', fontSize: 15 }}>Total: <b>R$ {pedido.valorTotal?.toFixed(2) || '-'}</b></div>
              </div>
              {pedido.urlLayoutFinal && (
                <img src={pedido.urlLayoutFinal} alt="Layout Final" style={{ maxHeight: 180, maxWidth: 260, borderRadius: 12, border: '2px solid #c2e3e3', background: '#fafdff' }} />
              )}
            </div>
            <div style={{ marginBottom: 18 }}>
              <h3 style={{ color: '#22a2a2', fontWeight: 700, fontSize: 22, marginBottom: 10 }}>Itens do Pedido</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
                <thead>
                  <tr style={{ background: '#e9f6f6' }}>
                    <th style={{ padding: 6, borderRadius: 6 }}>Produto</th>
                    <th style={{ padding: 6 }}>Tecido</th>
                    <th style={{ padding: 6 }}>Cor</th>
                    <th style={{ padding: 6 }}>Personalização</th>
                    <th style={{ padding: 6 }}>Qtd</th>
                  </tr>
                </thead>
                <tbody>
                  {pedido.itens?.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e4e9ef' }}>
                      <td style={{ padding: 6 }}>{item.nome || '-'}</td>
                      <td style={{ padding: 6 }}>{item.tipoMalha || '-'}</td>
                      <td style={{ padding: 6 }}>{item.cor || '-'}</td>
                      <td style={{ padding: 6 }}>{item.personalizacao || '-'}</td>
                      <td style={{ padding: 6 }}>{item.quantidade || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pedido.observacoes && (
              <div style={{ background: '#fafdff', border: '1.5px solid #b6e3e3', borderRadius: 9, padding: 10, marginBottom: 14, color: '#15616f' }}>
                <b>Observações:</b> {pedido.observacoes}
              </div>
            )}
            {pedido.urlLayoutFinal && (
              <div style={{ textAlign: 'center', marginTop: 18 }}>
                <img src={pedido.urlLayoutFinal} alt="Layout Final" style={{ maxHeight: 260, maxWidth: '100%', borderRadius: 10, border: '2px solid #c2e3e3' }} />
              </div>
            )}
          </div>
        ) : null}
      </ModalBox>
    </Overlay>
=======
  // Em vez de mostrar o modal customizado, renderize a tela de confirmação de pedido
  return (
    <div style={{ zIndex: 1500, position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 18, maxWidth: 900, width: '98vw', maxHeight: '93vh', overflowY: 'auto', boxShadow: '0 12px 48px #0007', padding: 0, position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 18, right: 22, background: 'none', border: 'none', fontSize: '2rem', color: '#888', cursor: 'pointer', zIndex: 2 }}>&times;</button>
        {/* Renderiza a tela de confirmação, passando o pedidoId como token */}
        <OrderConfirmationClient tokenFromKanban={pedidoId} />
      </div>
    </div>
>>>>>>> 4b938adcf806d3d2cd967dfc8bb80932662d410a
  );
}
