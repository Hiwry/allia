import React from 'react';

export default function OrderList({ orders = [], onSelect }) {
  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ color: '#15616f', marginBottom: 18 }}>Pedidos Realizados</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 18 }}>
        <thead>
          <tr style={{ background: '#f0f4f8', fontWeight: 600 }}>
            <td style={{ padding: 8, border: '1px solid #e0e0e0' }}>Cliente</td>
            <td style={{ padding: 8, border: '1px solid #e0e0e0' }}>Total</td>
            <td style={{ padding: 8, border: '1px solid #e0e0e0' }}>Status</td>
            <td style={{ padding: 8, border: '1px solid #e0e0e0' }}>Ações</td>
            <td style={{ padding: 8, border: '1px solid #e0e0e0' }}>Link</td>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 && (
            <tr><td colSpan={5} style={{ textAlign: 'center', color: '#888', padding: 18 }}>Nenhum pedido cadastrado.</td></tr>
          )}
          {orders.map((order, idx) => (
            <tr key={order.id || idx}>
              <td style={{ padding: 8, border: '1px solid #e0e0e0' }}>{order.cliente || '-'}</td>
              <td style={{ padding: 8, border: '1px solid #e0e0e0' }}>R$ {order.total?.toFixed(2) || '-'}</td>
              <td style={{ padding: 8, border: '1px solid #e0e0e0', color: order.status === 'pendente' ? '#d32f2f' : '#22a2a2', fontWeight: 600 }}>{order.status === 'pendente' ? 'Aguardando Confirmação' : 'Confirmado'}</td>
              <td style={{ padding: 8, border: '1px solid #e0e0e0' }}>
                <button style={{ background: '#22a2a2', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 12px', cursor: 'pointer' }} onClick={() => onSelect(order)}>Ver Detalhes</button>
              </td>
              <td style={{ padding: 8, border: '1px solid #e0e0e0' }}>
                {order.status === 'pendente' && (
                  <button style={{ background: '#eee', color: '#15616f', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 13 }} onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/pedido/${order.id}`);
                    alert('Link copiado! Envie ao cliente para confirmação.');
                  }}>Copiar Link</button>
                )}
                {order.status === 'confirmado' && (
                  <span style={{ color: '#22a2a2', fontWeight: 600 }}>Confirmado</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
