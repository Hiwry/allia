import axios from 'axios';

// Configuração base da API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Interceptor para adicionar token JWT se existir
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Funções existentes (login, register, getOrders, getOrder, saveOrder)
export const login = async (credentials) => {
  const res = await axios.post(`${API_URL}/auth/login`, credentials);
  return res.data;
};

export const register = async (userData) => {
  const res = await axios.post(`${API_URL}/auth/register`, userData);
  return res.data;
};

export const getOrders = async () => {
  const res = await axios.get(`${API_URL}/orders`); // Ajustado para /orders?
  return res.data;
};

export const getOrder = async (id) => {
  const res = await axios.get(`${API_URL}/pedidos/${id}`); // Corrigido para /pedidos/:id
  return res.data;
};

// ATUALIZAR: saveOrder para lidar com FormData
export const saveOrder = async (formData) => {
  // Nota: Axios define Content-Type automaticamente para FormData
  const res = await axios.post(`${API_URL}/pedidos`, formData, {
    headers: {
      // Não defina Content-Type aqui, deixe o Axios fazer
    }
  });
  return res.data; // Espera { pedido, token }
};

export const uploadImage = async (formData) => {
    const res = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return res.data; // espera { imageUrl: '...' }
};

// **NOVO**: Buscar pedido por token para confirmação do cliente
export const getOrderForConfirmation = async (token) => {
  if (!token) throw new Error('Token inválido');
  try {
    const res = await axios.get(`${API_URL}/pedidos/confirmacao/${token}`);
    return res.data; // Retorna os dados do pedido
  } catch (error) {
    console.error('API Error getOrderForConfirmation:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Erro ao buscar pedido para confirmação.');
  }
};

// **NOVO**: Cliente confirma o pedido
export const confirmOrder = async (token) => {
  if (!token) throw new Error('Token inválido');
  try {
    // O corpo da requisição PUT pode ser vazio ou conter dados adicionais se necessário
    const res = await axios.put(`${API_URL}/pedidos/confirmacao/${token}`);
    return res.data; // Espera { message: '...', pedido: ... }
  } catch (error) {
    console.error('API Error confirmOrder:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Erro ao confirmar pedido.');
  }
};

// **NOVO**: Buscar todos os pedidos para a listagem
export const getAllPedidos = async () => {
  try {
    const res = await axios.get(`${API_URL}/pedidos`); // Rota GET /
    return res.data; // Retorna o array de pedidos
  } catch (error) {
    console.error('API Error getAllPedidos:', error.response?.data || error.message);
    // Adapte a mensagem de erro conforme necessário
    throw new Error(error.response?.data?.message || 'Erro ao buscar a lista de pedidos.');
  }
};

// **NOVO**: Buscar clientes por nome ou CPF/CNPJ
export const searchClientes = async (query) => {
  if (!query || query.length < 3) { // Evitar buscas muito curtas
    return []; // Retorna vazio se a query for muito curta
  }
  try {
    const res = await axios.get(`${API_URL}/clientes/search`, { params: { q: query } });
    return res.data; // Retorna o array de clientes encontrados
  } catch (error) {
    console.error('API Error searchClientes:', error.response?.data || error.message);
    // Não lançar erro aqui, apenas retornar vazio em caso de falha
    return []; 
  }
};

// **NOVO**: Criar um novo cliente
export const createCliente = async (clienteData) => {
  try {
    const res = await axios.post(`${API_URL}/clientes`, clienteData);
    return res; // Retorna a resposta completa (inclui status e dados)
  } catch (error) {
    console.error('API Error createCliente:', error.response?.data || error.message);
    // Re-lançar o erro para que o componente possa tratá-lo (especialmente o 409)
    throw error; 
  }
};

// Buscar pedidos em produção
export const getPedidosProducao = async () => {
  try {
    // Filtra apenas pedidos com status 'producao' (ou ajuste para o status correto do seu backend)
    const res = await axios.get(`${API_URL}/pedidos`, { params: { status: 'producao' } });
    return res.data;
  } catch (error) {
    console.error('API Error getPedidosProducao:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Erro ao buscar pedidos de produção.');
  }
};

// Outras funções da API podem existir aqui...
