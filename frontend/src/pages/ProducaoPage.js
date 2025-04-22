import React, { useEffect, useState } from 'react';
import { getPedidosProducao } from '../services/api';
import { useNavigate } from 'react-router-dom';

// Tela de Produção: lista todos os pedidos em produção, com detalhes essenciais
export default function ProducaoPage() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchPedidos() {
      try {
        setLoading(true);
        setError('');
        const data = await getPedidosProducao();
        setPedidos(data);
      } catch (err) {
        setError(err.message || 'Erro ao buscar pedidos de produção.');
        setPedidos([]);
      } finally {
        setLoading(false);
      }
    }
    fetchPedidos();
  }, []);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 30 }}>
      <h1 style={{ color: '#15616f', fontSize: 32, marginBottom: 28 }}>Pedidos em Produção</h1>
      {loading && <div>Carregando...</div>}
      {error && <div style={{ color: 'red', fontWeight: 600 }}>{error}</div>}
      {!loading && pedidos.length === 0 && <div style={{ color: '#888' }}>Nenhum pedido em produção encontrado.</div>}
      {!loading && pedidos.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 18, background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #0001' }}>
          <thead>
            <tr style={{ background: '#e7f7f7' }}>
              <th style={{ padding: 10 }}>Nº Pedido</th>
              <th>Cliente</th>
              <th>Data Entrega</th>
              <th>Status</th>
              <th>Layout</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((pedido) => (
              <tr key={pedido._id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ fontWeight: 700, color: '#15616f', cursor: 'pointer', textDecoration: 'underline' }}
                    title="Ver detalhes"
                    onClick={() => navigate(`/pedido/${pedido._id}`)}>
                  {pedido._id.slice(-6)}
                </td>
                <td>{pedido.clienteNome || pedido.cliente?.nome || '-'}</td>
                <td>{pedido.dataEntrega ? new Date(pedido.dataEntrega).toLocaleDateString('pt-BR') : '-'}</td>
                <td style={{ color: pedido.status === 'producao' ? '#22a2a2' : '#888', fontWeight: 600 }}>{pedido.status}</td>
                <td>
                  {pedido.urlLayoutFinal ? (
                    <img src={pedido.urlLayoutFinal} alt="Layout" style={{ height: 48, borderRadius: 7, border: '1px solid #c2e3e3' }} />
                  ) : (
                    <span style={{ color: '#bbb' }}>-</span>
                  )}
                </td>
                <td>
                  <button onClick={() => navigate(`/pedido/${pedido._id}`)} style={{ background: '#15616f', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 18px', fontWeight: 600, cursor: 'pointer' }}>Detalhes</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
