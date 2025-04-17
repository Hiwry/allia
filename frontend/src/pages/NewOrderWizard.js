import React, { useState } from 'react';
import styled from 'styled-components';
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

// Função para salvar pedido no localStorage e gerar link para cliente
function saveOrderAndGetLink(order) {
  const saved = localStorage.getItem('orders');
  let arr = saved ? JSON.parse(saved) : [];
  const id = Date.now();
  const orderObj = { ...order, id, status: 'pendente' };
  arr.push(orderObj);
  localStorage.setItem('orders', JSON.stringify(arr));
  return `${window.location.origin}/pedido/${id}`;
}

export default function NewOrderWizard() {
  const [current, setCurrent] = useState(0);
  const [orderData, setOrderData] = useState({});

  const goNext = (data) => {
    setOrderData({ ...orderData, ...data });
    setCurrent((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const goBack = () => setCurrent((prev) => Math.max(prev - 1, 0));

  const handleConfirm = async () => {
    // Salva no banco de dados
    const savedOrder = await saveOrder(orderData);
    // Redireciona para o dashboard
    window.location.href = '/dashboard';
    // O link pode ser exibido lá, não mais em prompt aqui
    return `${window.location.origin}/pedido/${savedOrder._id}`;
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
      {current === 4 && <StepConfirmacao onBack={goBack} data={orderData} onConfirm={handleConfirm} />}
    </Wrapper>
  );
}
