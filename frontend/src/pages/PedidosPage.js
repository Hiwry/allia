import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
<<<<<<< HEAD
import { getAllPedidos, deletePedido } from '../services/api'; // Importa a nova função da API
=======
import { getAllPedidos } from '../services/api'; // Importa a nova função da API
>>>>>>> 4b938adcf806d3d2cd967dfc8bb80932662d410a

const Wrapper = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(21, 97, 111, 0.09);
  padding: 2rem;
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  margin: 0;
`;

const LoadingText = styled.p`
  text-align: center;
  padding: 2rem;
  color: #888;
`;

const ErrorText = styled.p`
  text-align: center;
  padding: 2rem;
  color: red;
  font-weight: bold;
`;

const OrderTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;

  th, td {
    border: 1px solid #ddd;
    padding: 0.8rem;
    text-align: left;
    font-size: 0.9rem;
    vertical-align: middle; /* Alinha conteúdo verticalmente */
  }

  th {
    background-color: #f2f2f2;
    font-weight: 600;
    color: #333;
  }

  tr:nth-child(even) { background-color: #f9f9f9; }

  tr:hover { background-color: #f1f1f1; }

  /* Estilo para o botão WhatsApp */
  button {
    background-color: #25D366; /* Cor do WhatsApp */
    color: white;
    border: none;
    padding: 0.5rem 0.8rem;
    border-radius: 5px;
    cursor: pointer;
    font-weight: 500;
    font-size: 0.85rem;
    transition: background-color 0.2s;

    &:hover {
      background-color: #1DAA50;
    }
  }
`;

// Botão estilizado para adicionar novo pedido
const AddButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: background-color 0.2s, transform 0.1s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryDark};
    transform: translateY(-2px);
  }
`;

// Badge para status
const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.3em 0.8em;
  border-radius: 12px;
  font-size: 0.85em;
  font-weight: bold;
  color: #fff;
  background: ${({ status }) => {
    switch (status) {
      case 'pendente_confirmacao_cliente': return '#f4b400'; // amarelo
      case 'confirmado': return '#34a853'; // verde
      case 'cancelado': return '#ea4335'; // vermelho
      default: return '#888'; // cinza
    }
  }};
`;

// Toast para feedback visual
const Toast = styled.div`
  position: fixed;
  top: 2rem;
  right: 2rem;
  background: #15616f;
  color: #fff;
  padding: 1rem 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(21,97,111,0.15);
  z-index: 9999;
  font-size: 1rem;
  opacity: ${({ show }) => (show ? 1 : 0)};
  pointer-events: none;
  transition: opacity 0.3s;
`;

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getAllPedidos();
        setPedidos(data);
      } catch (err) {
        setError(err.message || 'Erro ao buscar pedidos.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPedidos();
  }, []); // Roda apenas uma vez ao montar o componente

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    // Adiciona T00:00:00 para evitar problemas de fuso horário na formatação
    const date = new Date(dateString.split('T')[0] + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
  };

  // Função para gerar link WhatsApp
  const handleWhatsAppClick = (pedido) => {
    const phone = pedido.cliente?.telefone;
    const token = pedido.confirmacaoClienteToken;

    if (!phone) {
      alert('Número de telefone do cliente não encontrado para este pedido.');
      return;
    }
    if (!token) {
      alert('Token de confirmação não encontrado para este pedido. Não é possível gerar o link.');
      return;
    }

    // 1. Formata número de telefone (remove não dígitos, adiciona 55)
    let formattedPhoneNumber = phone.replace(/\D/g, '');
    // Remove possível zero à esquerda após limpar
    if (formattedPhoneNumber.length > 11 && formattedPhoneNumber.startsWith('0')) {
        formattedPhoneNumber = formattedPhoneNumber.substring(1);
    }
    // Adiciona 55 se for número brasileiro válido (10 ou 11 dígitos)
    if (formattedPhoneNumber.length === 10 || formattedPhoneNumber.length === 11) {
      formattedPhoneNumber = '55' + formattedPhoneNumber;
    } else if (formattedPhoneNumber.startsWith('55') && (formattedPhoneNumber.length === 12 || formattedPhoneNumber.length === 13)){
      // Já tem 55 e tamanho esperado, ok.
    } else {
      alert(`Número de telefone (${phone}) parece inválido após formatação. Verifique o cadastro.`);
      return; // Impede de continuar se o formato for inesperado
    }

    // 2. Constrói o link de confirmação
    const confirmationLink = `${window.location.origin}/confirmacao/${token}`;

    // 3. Constrói a mensagem
    const message = `Olá! Seu pedido Allia está pronto para confirmação. Acesse o link: ${confirmationLink}`;

    // 4. Codifica a mensagem para URL
    const encodedMessage = encodeURIComponent(message);

    // 5. Constrói a URL final do WhatsApp
    const whatsappUrl = `https://wa.me/${formattedPhoneNumber}?text=${encodedMessage}`;

    // 6. Abre o link em nova aba
    window.open(whatsappUrl, '_blank');
  };

  // Função para copiar link de confirmação
  const handleCopyLink = (pedido) => {
    const token = pedido.confirmacaoClienteToken;
    if (!token) {
      setToast({ show: true, message: 'Token de confirmação não encontrado para este pedido.' });
      return;
    }
    const confirmationLink = `${window.location.origin}/confirmacao/${token}`;
    navigator.clipboard.writeText(confirmationLink)
      .then(() => setToast({ show: true, message: 'Link copiado para a área de transferência!' }))
      .catch(() => setToast({ show: true, message: 'Erro ao copiar o link.' }));
  };

  // Toast handler
  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 2500);
  };

<<<<<<< HEAD
  // Adiciona handler de exclusão
  const handleDeletePedido = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este pedido? Esta ação não pode ser desfeita.')) {
      try {
        await deletePedido(id);
        setPedidos((prev) => prev.filter((p) => p._id !== id));
        showToast('Pedido excluído com sucesso.');
      } catch (err) {
        showToast('Erro ao excluir pedido.');
      }
    }
  };

=======
>>>>>>> 4b938adcf806d3d2cd967dfc8bb80932662d410a
  const handleNewOrderClick = () => {
    navigate('/pedido');
  };

  return (
    <Layout>
      <Wrapper>
        <HeaderContainer>
          <Title>Meus Pedidos</Title>
          <AddButton onClick={handleNewOrderClick}>+ Novo Pedido</AddButton>
        </HeaderContainer>

        {loading && <LoadingText>Carregando pedidos...</LoadingText>}
        {error && <ErrorText>{error}</ErrorText>}

        {!loading && !error && (
          <>
            <OrderTable>
              <thead>
                <tr>
                  <th>ID Pedido</th>
                  <th>Cliente</th>
                  <th>Status</th>
                  <th>Setor Produção</th>
                  <th>Data Criação</th>
                  <th>Prazo Confirmação</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.length > 0 ? (
                  pedidos.map((pedido) => (
                    <tr key={pedido._id}>
                      {/* Torna o número do pedido clicável, levando para a página de confirmação */}
                      <td>
                        <span
                          style={{ color: '#15616f', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}
                          title="Ver página de confirmação do pedido"
                          onClick={() => {
                            if (pedido.confirmacaoClienteToken) {
                              window.open(`/confirmacao/${pedido.confirmacaoClienteToken}`, '_blank');
                            } else {
                              alert('Token de confirmação não encontrado para este pedido.');
                            }
                          }}
                        >
                          {pedido._id.slice(-6)}
                        </span>
                      </td>
                      <td>{pedido.cliente?.nome ? pedido.cliente.nome : <span title="Cliente não informado" style={{color:'#ea4335',fontWeight:'bold'}}>&#9888; Não informado</span>}</td>
                      <td><StatusBadge status={pedido.status}>{pedido.status === 'pendente_confirmacao_cliente' ? 'Pendente Confirmação' : pedido.status || 'N/I'}</StatusBadge></td>
                      <td>{pedido.setorAtualProducao || 'N/A'}</td>
                      <td>{formatDate(pedido.createdAt)}</td>
                      <td>{formatDate(pedido.dataLimiteConfirmacao)}</td>
                      <td>
<<<<<<< HEAD
                        <div style={{ display: 'flex', gap: 6 }}>
                          {pedido.status === 'pendente_confirmacao_cliente' && (
                            <>
                              <button title="Enviar WhatsApp" onClick={() => handleWhatsAppClick(pedido)} style={{display:'flex',alignItems:'center',gap:4}}>
                                <span role="img" aria-label="WhatsApp">📱</span>
                              </button>
                              <button title="Copiar Link" style={{ background: '#15616f', display:'flex',alignItems:'center',gap:4 }} onClick={() => handleCopyLink(pedido)}>
                                <span role="img" aria-label="Copiar">🔗</span>
                              </button>
                              <button title="Excluir Pedido" style={{ background: '#ea4335', display:'flex',alignItems:'center',gap:4 }} onClick={() => handleDeletePedido(pedido._id)}>
                                <span role="img" aria-label="Excluir">🗑️</span>
                              </button>
                            </>
                          )}
                        </div>
=======
                        {pedido.status === 'pendente_confirmacao_cliente' && (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button title="Enviar WhatsApp" onClick={() => handleWhatsAppClick(pedido)} style={{display:'flex',alignItems:'center',gap:4}}>
                              <span role="img" aria-label="WhatsApp">📱</span>
                            </button>
                            <button title="Copiar Link" style={{ background: '#15616f', display:'flex',alignItems:'center',gap:4 }} onClick={() => handleCopyLink(pedido)}>
                              <span role="img" aria-label="Copiar">🔗</span>
                            </button>
                          </div>
                        )}
>>>>>>> 4b938adcf806d3d2cd967dfc8bb80932662d410a
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center' }}>Nenhum pedido encontrado.</td>
                  </tr>
                )}
              </tbody>
            </OrderTable>
            <Toast show={toast.show}>{toast.message}</Toast>
          </>
        )}
      </Wrapper>
    </Layout>
  );
} 