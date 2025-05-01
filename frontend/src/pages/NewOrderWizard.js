import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import StepCliente from '../wizardSteps/StepCliente';
import StepCostura from '../wizardSteps/StepCostura';
import StepPersonalizacao from '../wizardSteps/StepPersonalizacao';
import StepPagamento from '../wizardSteps/StepPagamento';
import StepConfirmacao from '../wizardSteps/StepConfirmacao';
import { saveOrder } from '../services/api';
import { uploadImage as apiUploadImage } from '../services/catalogApi';

const Wrapper = styled.div`
  max-width: 680px;
  margin: 2rem auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(21, 97, 111, 0.09);
  padding: 2.5rem 2rem;
  display: flex;
  flex-direction: column;
`;

const StepsBar = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  gap: 0.5rem;
`;

const Step = styled.div`
  flex: 1;
  text-align: center;
  font-weight: 600;
  color: ${({ active, theme }) => (active ? theme.colors.primary : '#aaa')};
  border-bottom: 3px solid ${({ active, theme }) => (active ? theme.colors.primary : '#eee')};
  padding-bottom: 0.5rem;
  transition: all 0.2s;
`;

const steps = [
  'Cliente',
  'Costura',
  'Personalização',
  'Pagamento',
  'Confirmação',
];

export default function NewOrderWizard() {
  const [current, setCurrent] = useState(0);
  const [orderData, setOrderData] = useState({});
  const [layoutFile, setLayoutFile] = useState(null); // Novo estado para o arquivo de layout
  const [isSaving, setIsSaving] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState({ name: '', loja: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const userDataString = localStorage.getItem('user');
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        setLoggedInUser({ 
          name: userData.name || userData.nome || 'Nome não encontrado', 
          loja: userData.loja || 'Loja não definida' 
        });
        console.log("Dados do usuário logado carregados:", userData);
      } catch (error) {
        console.error("Erro ao parsear dados do usuário do localStorage:", error);
        setLoggedInUser({ name: 'Erro ao carregar', loja: 'Erro' });
      }
    } else {
        console.warn("Dados do usuário não encontrados no localStorage.");
        setLoggedInUser({ name: 'Usuário não logado', loja: 'N/A' });
    }
  }, []);

  const goNext = (data) => {
    const { capaPedido, ...rest } = data;
    const newData = {
      ...orderData,
      ...(rest.cliente && { cliente: { ...(orderData.cliente || {}), ...rest.cliente } }),
      ...(rest.itens && { itens: rest.itens }),
      ...(rest.pagamentos && { pagamentos: rest.pagamentos }),
      ...(rest.aplicacoesPorItem && { aplicacoesPorItem: rest.aplicacoesPorItem }),
    };

    if (capaPedido) {
      newData.capaPedidoFile = capaPedido;
    }
    // Não precisamos lidar com layoutFile aqui, pois ele é adicionado na última etapa
    setOrderData(newData);
    setCurrent((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const goBack = () => setCurrent((prev) => Math.max(prev - 1, 0));

  // Função para fazer upload das imagens das aplicações e atualizar as URLs
  const uploadAllApplicationImages = async (orderDataObj) => {
    const { aplicacoesPorItem } = orderDataObj;
    if (!aplicacoesPorItem) return orderDataObj;

    const updatedAplicacoesPorItem = { ...aplicacoesPorItem };
    
    // Para cada item no pedido
    for (const itemId in updatedAplicacoesPorItem) {
      const aplicacoes = updatedAplicacoesPorItem[itemId];
      
      // Para cada aplicação no item
      for (let i = 0; i < aplicacoes.length; i++) {
        const aplic = aplicacoes[i];
        
        // Se a aplicação tem uma imagem (arquivo) e uma URL temporária (blob)
        if (aplic.imagem && aplic.imagemUrl && aplic.imagemUrl.startsWith('blob:')) {
          try {
            const formData = new FormData();
            formData.append('image', aplic.imagem);
            
            // Fazer upload e obter a URL permanente
            const imageUrl = await apiUploadImage(aplic.imagem);
            
            // Atualizar a aplicação com a nova URL permanente
            aplicacoes[i] = {
              ...aplic,
              imagemUrl: imageUrl // URL permanente do servidor
            };
            console.log(`Upload concluído: ${imageUrl}`);
          } catch (error) {
            console.error('Erro ao fazer upload da imagem de aplicação:', error);
            // Manter a URL original em caso de erro
          }
        }
      }
      
      updatedAplicacoesPorItem[itemId] = aplicacoes;
    }
    
    return {
      ...orderDataObj,
      aplicacoesPorItem: updatedAplicacoesPorItem
    };
  };

  const handleConfirm = async (finalData) => {
    setIsSaving(true);
    try {
      const { 
        capaPedido,
        valorTotalConfirmado,
        ...pedidoFields
      } = finalData;

      // Fazer upload das imagens das aplicações antes de enviar
      const dataComImagensProcessadas = await uploadAllApplicationImages(pedidoFields);

      const pedidoDataJSON = {
        ...dataComImagensProcessadas,
        valorTotal: valorTotalConfirmado,
        vendedorNome: loggedInUser.name,
        vendedorLoja: loggedInUser.loja
      };

      const formData = new FormData();

      if (capaPedido instanceof File) {
        formData.append('capaPedido', capaPedido);
        console.log("Arquivo capaPedido adicionado ao FormData");
      } else {
        console.log("Nenhum arquivo capaPedido válido para adicionar ao FormData");
      }

      console.log("Dados JSON a serem enviados:", JSON.stringify(pedidoDataJSON, null, 2));

      formData.append('pedidoData', JSON.stringify(pedidoDataJSON));

      const response = await saveOrder(formData);

      if (response && response.pedido && response.pedido._id) {
        alert('Pedido salvo com sucesso!');
        setOrderData({});
        setCurrent(0);
        navigate('/pedidos');
      } else {
        console.error('Erro: Resposta inesperada da API ao salvar pedido:', response);
        alert('Erro ao salvar o pedido. Resposta inesperada da API.');
      }

    } catch (error) {
      console.error('Erro ao salvar o pedido:', error);
      const validationErrors = error.response?.data?.errors;
      let errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido.';
      if (validationErrors) {
        const fields = Object.keys(validationErrors).join(', ');
        errorMessage = `Erro de validação nos campos: ${fields}. Verifique o console do backend para detalhes.`;
      }
      alert(`Erro ao salvar pedido: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Wrapper>
      <StepsBar>
        {steps.map((label, idx) => (
          <Step key={label} active={idx === current}>{label}</Step>
        ))}
      </StepsBar>
      {current === 0 && <StepCliente onNext={goNext} data={orderData} />}
      {current === 1 && <StepCostura onNext={goNext} onBack={goBack} data={orderData} />}
      {current === 2 && <StepPersonalizacao onNext={goNext} onBack={goBack} data={orderData} />}
      {current === 3 && <StepPagamento onNext={goNext} onBack={goBack} data={orderData} />}
      {current === 4 && <StepConfirmacao 
                          onBack={goBack} 
                          data={orderData} 
                          loggedInUser={loggedInUser} 
                          onConfirm={handleConfirm} 
                          isSaving={isSaving} 
                          layoutFile={layoutFile} 
                          setLayoutFile={setLayoutFile} 
                        />}
    </Wrapper>
  );
}
