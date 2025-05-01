import React, { useEffect, useState } from 'react';
import { getPedidosProducao, updatePedidoEtapa } from '../services/api';
import { useNavigate } from 'react-router-dom';
import KanbanCard from '../components/KanbanCard';
import KanbanColumn from '../components/KanbanColumn';
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
  // Prioriza setorAtualProducao, senão faz fallback pelo status
  if (pedido.setorAtualProducao && ETAPAS.some(e => e.key === pedido.setorAtualProducao)) {
    return pedido.setorAtualProducao;
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
  const [atualizando, setAtualizando] = useState(false);
  const navigate = useNavigate();
  const [draggedPedidoId, setDraggedPedidoId] = useState(null);
  const [modalPedidoId, setModalPedidoId] = useState(null);

  // Função para buscar os pedidos
  const fetchPedidos = async () => {
    try {
      setAtualizando(true);
      const data = await getPedidosProducao();
      setPedidos(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      setError(err.message || 'Erro ao buscar pedidos de produção.');
      console.error('Erro ao buscar pedidos de produção:', err);
    } finally {
      setLoading(false);
      setAtualizando(false);
    }
  };

  useEffect(() => {
    async function carregarPedidos() {
      setLoading(true);
      await fetchPedidos();
    }
    carregarPedidos();
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

  async function handleDrop(e, etapaKey) {
    e.preventDefault();
    if (!draggedPedidoId) return;

    const pedidoOriginal = pedidos.find(p => p._id === draggedPedidoId);
    const etapaOriginal = getEtapaPedido(pedidoOriginal);

    // 1. Atualiza o estado local imediatamente para feedback visual
    setPedidos(prev => prev.map(p =>
      p._id === draggedPedidoId
        ? { ...p, setorAtualProducao: etapaKey } // Atualiza a etapa no objeto
        : p
    ));

    // Guarda o ID para limpar depois
    const pedidoIdParaAtualizar = draggedPedidoId;
    setDraggedPedidoId(null); // Limpa o estado de arrasto

    // 2. Chama a API para persistir a mudança
    try {
      await updatePedidoEtapa(pedidoIdParaAtualizar, etapaKey);
      // Sucesso - a mudança já está refletida no estado local
      console.log(`Pedido ${pedidoIdParaAtualizar} movido para ${etapaKey} com sucesso no backend.`);
    } catch (apiError) {
      console.error("Erro ao atualizar etapa no backend:", apiError);
      alert(`Falha ao salvar a nova etapa para o pedido ${pedidoIdParaAtualizar}. Por favor, tente novamente.`);
      // 3. Reverte a mudança no estado local em caso de erro
      setPedidos(prev => prev.map(p =>
        p._id === pedidoIdParaAtualizar
          ? { ...p, setorAtualProducao: etapaOriginal } // Volta para a etapa original
          : p
      ));
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  // Callback quando um pedido é atualizado no modal
  const handlePedidoAtualizado = (pedidoId) => {
    console.log(`Pedido ${pedidoId} foi atualizado, recarregando dados...`);
    fetchPedidos();
  };

  return (
    <div style={{ padding: 24, minHeight: '90vh', background: '#f6fafd' }}>
      <h1 style={{ color: '#15616f', fontSize: 32, marginBottom: 28 }}>Produção - Kanban</h1>
      
      {/* Botão de atualizar */}
      <div style={{ marginBottom: 20 }}>
        <button 
          onClick={fetchPedidos} 
          disabled={atualizando}
          style={{
            background: '#15616f',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            padding: '8px 16px',
            fontWeight: 600,
            cursor: atualizando ? 'not-allowed' : 'pointer',
            opacity: atualizando ? 0.7 : 1
          }}
        >
          {atualizando ? 'Atualizando...' : 'Atualizar Pedidos'}
        </button>
      </div>
      
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
      {modalPedidoId && (
        <PedidoModal 
          pedidoId={modalPedidoId} 
          onClose={() => setModalPedidoId(null)} 
          onUpdate={handlePedidoAtualizado} // Novo callback
        />
      )}
    </div>
  );
}
