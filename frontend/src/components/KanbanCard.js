import React from 'react';
import styled from 'styled-components';
import StatusTag from './StatusTag';

const Card = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(23,42,58,0.10);
  padding: 1.2rem 1rem 1rem 1rem;
  margin-bottom: 18px;
  min-width: 250px;
  max-width: 320px;
  cursor: grab;
  border: 2px solid #e4e9ef;
  transition: box-shadow 0.15s, border 0.15s;
  &:hover {
    box-shadow: 0 4px 24px rgba(34,162,162,0.12);
    border: 2px solid #22a2a2;
  }
`;

const LayoutImg = styled.img`
  width: 100%;
  height: 110px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 10px;
  border: 1.5px solid #c2e3e3;
`;

const Title = styled.div`
  font-size: 1.07rem;
  font-weight: 700;
  color: #22344a;
  margin-bottom: 4px;
`;

const Info = styled.div`
  font-size: 0.99rem;
  color: #15616f;
  margin-bottom: 3px;
`;

const Small = styled.div`
  font-size: 0.93rem;
  color: #7b8fa3;
  margin-bottom: 2px;
`;

const ProducaoImagens = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
  margin-bottom: 8px;
  overflow-x: auto;
  padding-bottom: 6px;
`;

const ImagemEtapa = styled.img`
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 5px;
  border: 1.5px solid #c2e3e3;
`;

export default function KanbanCard({ pedido, onClick }) {
  // Pega o primeiro item como resumo (se houver)
  const item = pedido.itens && pedido.itens.length > 0 ? pedido.itens[0] : {};
  // Quantidade total
  const quantidade = pedido.itens ? pedido.itens.reduce((acc, i) => acc + (i.quantidade || 0), 0) : 0;
  
  // Determina qual imagem mostrar com base na etapa atual
  const getEtapaAtualImagem = () => {
    // Etapas de produção em ordem
    const etapas = ['corte', 'costura', 'personalizacao', 'limpeza', 'concluido'];
    
    // Obtém a etapa atual do pedido
    const etapaAtual = pedido.setorAtualProducao?.toLowerCase();
    if (!etapaAtual) return null;
    
    // Primeiro tenta obter pelo objeto imagensProducao
    if (pedido.imagensProducao && pedido.imagensProducao[etapaAtual]) {
      return pedido.imagensProducao[etapaAtual];
    }
    
    // Depois tenta obter pelo campo específico (compatibilidade)
    const campoEtapa = `imagemEtapa${etapaAtual.charAt(0).toUpperCase() + etapaAtual.slice(1)}`;
    return pedido[campoEtapa];
  };
  
  // Obtém todas as imagens de produção disponíveis
  const getImagensProducao = () => {
    const imagens = [];
    
    // Tenta obter imagens do objeto imagensProducao
    if (pedido.imagensProducao) {
      Object.entries(pedido.imagensProducao).forEach(([etapa, url]) => {
        if (url) imagens.push({ etapa, url });
      });
    }
    
    // Verifica campos específicos para compatibilidade
    const etapas = ['corte', 'costura', 'personalizacao', 'limpeza', 'concluido'];
    etapas.forEach(etapa => {
      const campoEtapa = `imagemEtapa${etapa.charAt(0).toUpperCase() + etapa.slice(1)}`;
      if (pedido[campoEtapa] && !imagens.some(img => img.url === pedido[campoEtapa])) {
        imagens.push({ etapa, url: pedido[campoEtapa] });
      }
    });
    
    return imagens;
  };
  
  const imagemPrincipal = pedido.urlLayoutFinal || getEtapaAtualImagem();
  const imagensProducao = getImagensProducao();
  
  return (
    <Card onClick={onClick} draggable>
      {imagemPrincipal && (
        <LayoutImg src={imagemPrincipal} alt="Imagem do Pedido" />
      )}
      <Title>#{pedido.numeroPedido || pedido._id?.slice(-5)} - {pedido.cliente?.nome || 'Cliente'}</Title>
      <Info>
        <b>Tecido:</b> {item.tipoMalha || '-'}<br />
        <b>Cor:</b> {item.cor || '-'}<br />
        <b>Personalização:</b> {item.personalizacao || pedido.personalizacao || '-'}
      </Info>
      <div style={{ marginTop: '8px', marginBottom: '8px' }}>
        <StatusTag status={pedido.status} />
      </div>
      
      {imagensProducao.length > 0 && (
        <ProducaoImagens>
          {imagensProducao.map((img, idx) => (
            <ImagemEtapa 
              key={idx} 
              src={img.url} 
              alt={`Etapa ${img.etapa}`} 
              title={`Imagem: ${img.etapa}`}
            />
          ))}
        </ProducaoImagens>
      )}
      
      <Small><b>Entrega:</b> {pedido.dataEntrega ? new Date(pedido.dataEntrega).toLocaleDateString('pt-BR') : '---'}</Small>
      <Small><b>Vendedor:</b> {pedido.nomeVendedor || pedido.vendedorNome || (pedido.vendedor && typeof pedido.vendedor === 'object' ? (pedido.vendedor.nome || pedido.vendedor.name || pedido.vendedor.fullName || '-') : (pedido.vendedor || '-'))}</Small>
      <Small><b>Qtd:</b> {quantidade}</Small>
      {pedido.valorTotal && <Small><b>R$ {pedido.valorTotal.toFixed(2)}</b></Small>}
    </Card>
  );
}
