import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import StepCliente from '../wizardSteps/StepCliente';
import StepCostura from '../wizardSteps/StepCostura';
import StepPersonalizacao from '../wizardSteps/StepPersonalizacao';
import StepPagamento from '../wizardSteps/StepPagamento';
import StepConfirmacao from '../wizardSteps/StepConfirmacao';
import { saveOrder } from '../services/api';

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
          name: userData.name || 'Nome não encontrado', 
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

  const handleConfirm = async () => {
    setIsSaving(true);
    try {
      const itens = orderData.itens || [];
      const aplicacoesPorItem = orderData.aplicacoesPorItem || {};
      
      let subtotalCostura = 0;
      let subtotalPersonalizacao = 0;
      let subtotalAcrescimos = 0;

      itens.forEach(item => {
        const valorUnitCostura = (item.valorBase || 0) + (item.valorGola || 0) + (item.valorDetalhe || 0);
        subtotalCostura += valorUnitCostura * (item.quantidade || 0);

        if (item.acrescimos) {
            const valorTotalAcrescimosItem = Object.entries(item.acrescimos).reduce((total, [tam, acrescUnitario]) => {
                const qtdTamanho = Number(item.tamanhos[tam.toLowerCase()]) || 0;
                return total + (acrescUnitario * qtdTamanho);
            }, 0);
            subtotalAcrescimos += valorTotalAcrescimosItem;
        }
      });

      if (aplicacoesPorItem) {
         subtotalPersonalizacao = Object.entries(aplicacoesPorItem).reduce((sum, [itemId, aplicacoes]) => {
            const item = itens.find(i => String(i.id) === String(itemId));
            const qtd = item?.quantidade || 1;
            return sum + aplicacoes.reduce((s, aplic) => s + (aplic.valor || 0) * qtd, 0);
        }, 0);
      }

      const valorTotalCalculado = subtotalCostura + subtotalPersonalizacao + subtotalAcrescimos;

      const { capaPedidoFile, ...otherOrderData } = orderData;
      
      const finalOrderData = {
        ...otherOrderData,
        valorTotal: valorTotalCalculado
      };

      const formData = new FormData();

      if (capaPedidoFile instanceof File) {
        formData.append('capaPedido', capaPedidoFile);
      }

      // Adiciona o arquivo de layout ao FormData se existir
      if (layoutFile instanceof File) {
        formData.append('capaPedido', layoutFile); // Corrigir: deve ser 'capaPedido'!
      }

      console.log("Dados finais do pedido a serem enviados (sem vendedor explícito):", JSON.stringify(finalOrderData, null, 2));

      formData.append('pedidoData', JSON.stringify(finalOrderData));

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
    <Layout>
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
                            layoutFile={layoutFile} // Passa o estado
                            setLayoutFile={setLayoutFile} // Passa o setter
                          />}
      </Wrapper>
    </Layout>
  );
}
