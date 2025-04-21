import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { getOrderForConfirmation, getOrder } from '../services/api';
import OrderConfirmationClient from '../pages/OrderConfirmationClient';

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
  // Em vez de mostrar o modal customizado, renderize a tela de confirmação de pedido
  return (
    <div style={{ zIndex: 1500, position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 18, maxWidth: 900, width: '98vw', maxHeight: '93vh', overflowY: 'auto', boxShadow: '0 12px 48px #0007', padding: 0, position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 18, right: 22, background: 'none', border: 'none', fontSize: '2rem', color: '#888', cursor: 'pointer', zIndex: 2 }}>&times;</button>
        {/* Renderiza a tela de confirmação, passando o pedidoId como token */}
        <OrderConfirmationClient tokenFromKanban={pedidoId} />
      </div>
    </div>
  );
}
