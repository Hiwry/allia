import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { getOrderForConfirmation, getOrder, updatePedidoEtapa } from '../services/api';
import StatusTag from './StatusTag';
import ProducaoImageUpload from './ProducaoImageUpload';

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

const TabButton = styled.button`
  background: ${props => props.active ? '#15616f' : '#f2f5f7'};
  color: ${props => props.active ? 'white' : '#555'};
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  margin-right: 10px;
  cursor: pointer;
  font-weight: 600;
  
  &:hover {
    background: ${props => props.active ? '#0f4b55' : '#e9f0f2'};
  }
`;

const ProducaoSection = styled.div`
  margin-top: 24px;
  padding: 15px;
  background: #f9feff;
  border-radius: 10px;
  border: 1px solid #e0f0f0;
`;

const ProducaoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 15px;
`;

const EtapaCard = styled.div`
  border: 1px solid #d5e6e6;
  border-radius: 8px;
  padding: 12px;
  background: white;
`;

const EtapaTitle = styled.div`
  font-weight: 700;
  color: #15616f;
  font-size: 16px;
  margin-bottom: 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid #e0f0f0;
`;

export default function PedidoModal({ pedidoId, onClose, onUpdate }) {
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('detalhes');
  const [atualizandoEtapa, setAtualizandoEtapa] = useState(false);

  // Mapeamento de etapa para rótulo
  const etapasProducao = {
    corte: 'Corte',
    costura: 'Costura',
    personalizacao: 'Personalização',
    limpeza: 'Limpeza',
    concluido: 'Concluído'
  };

  useEffect(() => {
    async function fetchPedido() {
      setLoading(true);
      setError('');
      try {
        let data = null;
        // Tenta buscar pelo ID primeiro (mais comum)
        try {
          data = await getOrder(pedidoId);
        } catch (e) {
          // Se falhar, tenta buscar por token
          data = await getOrderForConfirmation(pedidoId);
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

  const handleImageUploadSuccess = (response, etapa) => {
    console.log(`Imagem para ${etapa} salva com sucesso:`, response);
    
    // Atualiza o objeto pedido local com a nova imagem
    setPedido(prevPedido => {
      // Clone do pedido atual
      const updatedPedido = { ...prevPedido };
      
      // Atualiza o objeto imagensProducao se existir, ou cria um novo
      updatedPedido.imagensProducao = { 
        ...(updatedPedido.imagensProducao || {}),
        [etapa]: response.imagem
      };
      
      // Atualiza também o campo individual compatível
      updatedPedido[`imagemEtapa${etapa.charAt(0).toUpperCase() + etapa.slice(1)}`] = response.imagem;
      
      return updatedPedido;
    });
    
    // Callback opcional para o componente pai
    if (onUpdate) {
      onUpdate(pedidoId);
    }
  };

  if (!pedidoId) return null;

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
            
            <div style={{ marginBottom: 20 }}>
              <TabButton 
                active={activeTab === 'detalhes'} 
                onClick={() => setActiveTab('detalhes')}
              >
                Detalhes do Pedido
              </TabButton>
              <TabButton 
                active={activeTab === 'producao'} 
                onClick={() => setActiveTab('producao')}
              >
                Produção
              </TabButton>
            </div>
            
            {activeTab === 'detalhes' && (
              <>
                <div style={{ display: 'flex', gap: 30, flexWrap: 'wrap', marginBottom: 18 }}>
                  <div style={{ minWidth: 260 }}>
                    <div style={{ fontWeight: 700, color: '#22344a', fontSize: 18 }}>{pedido.cliente?.nome || '-'}</div>
                    <div style={{ color: '#888', fontSize: 15 }}>Vendedor: {pedido.nomeVendedor || pedido.vendedor?.nome || pedido.vendedor || '-'}</div>
                    <div style={{ color: '#888', fontSize: 15 }}>Entrega: {pedido.dataEntrega ? new Date(pedido.dataEntrega).toLocaleDateString('pt-BR') : '-'}</div>
                    <div style={{ color: '#888', fontSize: 15 }}>
                      Status: <StatusTag status={pedido.status} />
                    </div>
                    <div style={{ color: '#888', fontSize: 15 }}>
                      Setor atual: <strong>{pedido.setorAtualProducao || 'Não definido'}</strong>
                    </div>
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
              </>
            )}
            
            {activeTab === 'producao' && (
              <ProducaoSection>
                <h3 style={{ color: '#22a2a2', fontWeight: 700, fontSize: 22, marginBottom: 15 }}>Imagens de Produção</h3>
                <p style={{ color: '#555', marginBottom: 15 }}>Upload e visualização de imagens para cada etapa do processo de produção.</p>
                
                <ProducaoGrid>
                  {Object.entries(etapasProducao).map(([etapa, titulo]) => {
                    // Recupera a URL da imagem da etapa específica
                    const imagemUrl = 
                      (pedido.imagensProducao && pedido.imagensProducao[etapa]) || 
                      pedido[`imagemEtapa${etapa.charAt(0).toUpperCase() + etapa.slice(1)}`];
                      
                    return (
                      <EtapaCard key={etapa}>
                        <EtapaTitle>{titulo}</EtapaTitle>
                        <ProducaoImageUpload 
                          pedidoId={pedido._id}
                          etapa={etapa}
                          currentImageUrl={imagemUrl}
                          onUploadSuccess={(response) => handleImageUploadSuccess(response, etapa)}
                        />
                      </EtapaCard>
                    );
                  })}
                </ProducaoGrid>
              </ProducaoSection>
            )}
          </div>
        ) : null}
      </ModalBox>
    </Overlay>
  );
}
