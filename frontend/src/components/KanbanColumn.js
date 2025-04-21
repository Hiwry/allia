import React from 'react';
import styled from 'styled-components';

const ColumnWrapper = styled.div`
  min-width: 270px;
  flex: 1;
  background: #fff;
  border-radius: 13px;
  box-shadow: 0 2px 12px #0001;
  padding: 15px 7px 15px 10px;
  border: 2px solid #e4e9ef;
  display: flex;
  flex-direction: column;
  max-height: 75vh;
  overflow-y: auto;
`;

const Title = styled.div`
  font-weight: 700;
  font-size: 20px;
  color: #15616f;
  margin-bottom: 14px;
  text-align: center;
`;

const DropZone = styled.div`
  flex: 1;
  min-height: 60px;
`;

export default function KanbanColumn({ etapa, children, onDrop, onDragOver }) {
  return (
    <ColumnWrapper
      onDrop={e => onDrop && onDrop(e, etapa.key)}
      onDragOver={e => { e.preventDefault(); onDragOver && onDragOver(e, etapa.key); }}
    >
      <Title>{etapa.label}</Title>
      <DropZone>
        {children}
      </DropZone>
    </ColumnWrapper>
  );
}
