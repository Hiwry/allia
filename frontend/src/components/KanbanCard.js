import React from 'react';
import styled from 'styled-components';

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

export default function KanbanCard({ pedido, onClick }) {
  // Pega o primeiro item como resumo (se houver)
  const item = pedido.itens && pedido.itens.length > 0 ? pedido.itens[0] : {};
  // Quantidade total
  const quantidade = pedido.itens ? pedido.itens.reduce((acc, i) => acc + (i.quantidade || 0), 0) : 0;
  return (
    <Card onClick={onClick} draggable>
      {pedido.urlLayoutFinal && (
        <LayoutImg src={pedido.urlLayoutFinal} alt="Capa do Pedido" />
      )}
      <Title>#{pedido.numeroPedido || pedido._id?.slice(-5)} - {pedido.cliente?.nome || 'Cliente'}</Title>
      <Info>
        <b>Tecido:</b> {item.tipoMalha || '-'}<br />
        <b>Cor:</b> {item.cor || '-'}<br />
        <b>Personalização:</b> {item.personalizacao || pedido.personalizacao || '-'}
      </Info>
      <Small><b>Entrega:</b> {pedido.dataEntrega ? new Date(pedido.dataEntrega).toLocaleDateString('pt-BR') : '---'}</Small>
      <Small><b>Vendedor:</b> {pedido.vendedor?.nome || pedido.vendedor || '-'}</Small>
      <Small><b>Qtd:</b> {quantidade}</Small>
      {pedido.valorTotal && <Small><b>R$ {pedido.valorTotal.toFixed(2)}</b></Small>}
    </Card>
  );
}
