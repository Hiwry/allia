import React, { useState, useRef } from 'react';
import { uploadImagemProducao } from '../services/api';
import styled from 'styled-components';

const UploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 10px 0;
`;

const UploadArea = styled.div`
  border: 2px dashed #15616f;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  width: 100%;
  margin-bottom: 10px;
  cursor: pointer;
  background: ${props => props.isDragging ? '#e7f7f7' : '#f9feff'};
  transition: all 0.3s ease;
  &:hover {
    background: #e7f7f7;
  }
`;

const ImagePreview = styled.div`
  width: 100%;
  text-align: center;
  img {
    max-width: 100%;
    max-height: 200px;
    border-radius: 8px;
    margin-top: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const UploadButton = styled.button`
  background: #15616f;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 10px;
  &:hover {
    background: #0f4b55;
  }
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const StatusMessage = styled.div`
  margin-top: 10px;
  color: ${props => props.isError ? '#d32f2f' : '#22a2a2'};
  font-weight: ${props => props.isError ? '600' : '500'};
`;

const ProducaoImageUpload = ({ pedidoId, etapa, onUploadSuccess, currentImageUrl }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl || null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        setError('Imagem muito grande. Tamanho máximo: 5MB');
        return;
      }
      
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setMessage('');
      setError('');
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        setError('Imagem muito grande. Tamanho máximo: 5MB');
        return;
      }
      
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setMessage('');
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setUploading(true);
    setMessage('');
    setError('');
    
    try {
      const response = await uploadImagemProducao(pedidoId, etapa, selectedFile);
      setMessage('Imagem enviada com sucesso!');
      
      // Atualizar URL da imagem com a retornada pelo servidor
      if (response.imagem) {
        setPreviewUrl(response.imagem);
      }
      
      // Callback para o componente pai
      if (onUploadSuccess) {
        onUploadSuccess(response);
      }
    } catch (err) {
      console.error('Erro ao enviar imagem:', err);
      setError(err.message || 'Erro ao enviar a imagem. Tente novamente.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <UploadContainer>
      <UploadArea 
        isDragging={isDragging}
        onClick={() => fileInputRef.current.click()}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileSelect} 
          style={{ display: 'none' }}
          accept="image/*"
        />
        {previewUrl ? (
          <ImagePreview>
            <img src={previewUrl} alt="Preview da imagem" />
          </ImagePreview>
        ) : (
          <div>
            <p>Clique ou arraste uma imagem aqui</p>
            <p style={{ fontSize: '0.8em', color: '#666' }}>
              Foto da etapa: <strong>{etapa}</strong>
            </p>
          </div>
        )}
      </UploadArea>
      
      {selectedFile && (
        <UploadButton onClick={handleUpload} disabled={uploading}>
          {uploading ? 'Enviando...' : 'Enviar Imagem'}
        </UploadButton>
      )}
      
      {message && <StatusMessage>{message}</StatusMessage>}
      {error && <StatusMessage isError>{error}</StatusMessage>}
    </UploadContainer>
  );
};

export default ProducaoImageUpload; 