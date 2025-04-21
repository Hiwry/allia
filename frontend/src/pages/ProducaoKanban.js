import React, { useEffect, useState } from 'react';
import { getPedidosProducao } from '../services/api';
import { useNavigate } from 'react-router-dom';
import KanbanCard from '../components/KanbanCard';
import KanbanColumn from '../components/KanbanColumn';
import Layout from '../components/Layout';
import PedidoModal from '../components/PedidoModal';

const ETAPAS = [
  { key: 'conferencia', label: 'Conferência' },
  { key: 'corte', label: 'Corte' },
  { key: 'costura', label: 'Costura' },
  { key: 'personalizacao', label: 'Personalização' },
  { key: 'limpeza', label: 'Limpeza' },
  { key: 'concluido', label: 'Concluído' },
  { key: 'entrega', label: 'Entrega' },
];

// Mapeamento de status para etapa Kanban
const STATUS_TO_ETAPA = {
  'conferido': 'conferencia',
  'producao': 'corte',
  'costura': 'costura',
  'personalizacao': 'personalizacao',
  'limpeza': 'limpeza',
  'concluido': 'concluido',
  'entregue': 'entrega',
  'entrega': 'entrega',
  // Adicione outros status do backend conforme necessário
};

function getEtapaPedido(pedido) {
  // Prioriza etapaProducao, senão faz fallback pelo status
  if (pedido.etapaProducao && ETAPAS.some(e => e.key === pedido.etapaProducao)) {
    return pedido.etapaProducao;
  }
  if (pedido.status && STATUS_TO_ETAPA[pedido.status]) {
    return STATUS_TO_ETAPA[pedido.status];
  }
  // Default: primeira etapa
  return ETAPAS[0].key;
}

export default function ProducaoKanban() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [draggedPedidoId, setDraggedPedidoId] = useState(null);
  const [modalPedidoId, setModalPedidoId] = useState(null);

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

  // Agrupa pedidos por etapa
  const pedidosPorEtapa = ETAPAS.reduce((acc, etapa) => {
    acc[etapa.key] = pedidos.filter(p => getEtapaPedido(p) === etapa.key);
    return acc;
  }, {});

  // Drag & Drop handlers
  function handleDragStart(e, pedidoId) {
    setDraggedPedidoId(pedidoId);
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDrop(e, etapaKey) {
    e.preventDefault();
    if (!draggedPedidoId) return;
    setPedidos(prev => prev.map(p =>
      p._id === draggedPedidoId
        ? { ...p, etapaProducao: etapaKey }
        : p
    ));
    setDraggedPedidoId(null);
    // TODO: Chamar API para atualizar etapaProducao no backend
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  return (
    <Layout>
      <div style={{ padding: 24, minHeight: '90vh', background: '#f6fafd' }}>
        <h1 style={{ color: '#15616f', fontSize: 32, marginBottom: 28 }}>Produção - Kanban</h1>
        {loading && <div>Carregando...</div>}
        {error && <div style={{ color: 'red', fontWeight: 600 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start', overflowX: 'auto' }}>
          {ETAPAS.map(etapa => (
            <KanbanColumn
              key={etapa.key}
              etapa={etapa}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {pedidosPorEtapa[etapa.key] && pedidosPorEtapa[etapa.key].length > 0 ? (
                pedidosPorEtapa[etapa.key].map(pedido => (
                  <div
                    key={pedido._id}
                    draggable
                    onDragStart={e => handleDragStart(e, pedido._id)}
                    style={{ marginBottom: 6 }}
                  >
                    <KanbanCard pedido={pedido} onClick={() => setModalPedidoId(pedido._id)} />
                  </div>
                ))
              ) : (
                <div style={{ color: '#bbb', fontSize: 15, textAlign: 'center', marginTop: 18 }}>Nenhum pedido</div>
              )}
            </KanbanColumn>
          ))}
        </div>
        {modalPedidoId && <PedidoModal pedidoId={modalPedidoId} onClose={() => setModalPedidoId(null)} />}
      </div>
    </Layout>
  );
}
