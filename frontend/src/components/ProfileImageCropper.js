import React, { useState, useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const CropperContainer = styled.div`
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
`;

const ControlsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  background-color: ${props => props.secondary ? '#6c757d' : '#1a3c40'};
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${props => props.secondary ? '#5a6268' : '#15616f'};
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

// Função para centralizar o recorte inicial
function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

const ImageCropper = ({ src, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = useRef(null);

  // Configurar o recorte quando a imagem for carregada
  const onImageLoad = useCallback((e) => {
    const { width, height } = e.currentTarget;
    
    // Fazer um recorte circular com proporção 1:1
    const crop = centerAspectCrop(width, height, 1);
    setCrop(crop);
    
    return false;
  }, []);

  // Quando o recorte for completo
  const handleCropComplete = (crop, pixelCrop) => {
    setCompletedCrop(pixelCrop);
  };

  // Aplicar o recorte
  const handleApplyCrop = useCallback(() => {
    if (!imgRef.current || !completedCrop) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.error('No 2d context');
      return;
    }

    // Configurar o canvas para o tamanho do recorte
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;

    // Desenhar a imagem recortada no canvas
    ctx.drawImage(
      imgRef.current,
      completedCrop.x,
      completedCrop.y,
      completedCrop.width,
      completedCrop.height,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    // Converter o canvas para um blob e depois para um File
    canvas.toBlob(blob => {
      if (blob) {
        const croppedFile = new File([blob], 'cropped-profile.png', { type: 'image/png' });
        onCropComplete(croppedFile, URL.createObjectURL(blob));
      }
    }, 'image/png');
  }, [completedCrop, onCropComplete]);

  return (
    <CropperContainer>
      {src && (
        <>
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(_, pixelCrop) => handleCropComplete(_, pixelCrop)}
            aspect={1}
            circularCrop
          >
            <img 
              ref={imgRef} 
              src={src} 
              alt="Imagem para recorte" 
              onLoad={onImageLoad}
              style={{ maxWidth: '100%' }}
            />
          </ReactCrop>
          
          <ControlsContainer>
            <Button 
              secondary 
              onClick={onCancel}>
              Cancelar
            </Button>
            <Button 
              onClick={handleApplyCrop} 
              disabled={!completedCrop?.width}>
              Aplicar Recorte
            </Button>
          </ControlsContainer>
        </>
      )}
    </CropperContainer>
  );
};

export default ImageCropper; 