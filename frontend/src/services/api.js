import axios from 'axios';

// Configuração base da API
const API_URL = 'https://allia.onrender.com/api';

// Interceptor para adicionar token JWT se existir
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Funções existentes (login, register, getOrders, getOrder, saveOrder)
export async function login(email, password) {
  console.log('[DEBUG] Attempting login for:', email); // Log antes da chamada
  try {
    const res = await fetch(`${API_URL}/auth/login`, { // Assumindo endpoint /auth/login
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    console.log('[DEBUG] Login API raw response status:', res.status);
    const responseText = await res.text(); // Ler como texto primeiro para depuração
    console.log('[DEBUG] Login API raw response text:', responseText);
    
    if (!res.ok) {
      // Tenta parsear como JSON mesmo em erro para pegar a mensagem
      try {
        const errorData = JSON.parse(responseText);
        console.error('[DEBUG] Login API error response JSON:', errorData);
        throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
      } catch (parseError) {
        // Se não for JSON, lança erro com o status
        console.error('[DEBUG] Login API error response is not JSON.');
        throw new Error(`HTTP error! status: ${res.status}`);
      }
    }
    
    // Tenta parsear como JSON se a resposta foi OK
    try {
      const data = JSON.parse(responseText);
      console.log('[DEBUG] Login API success response JSON:', data);
      return data; // Retorna os dados parseados
    } catch (parseError) {
      console.error('[DEBUG] Login API success response could not be parsed as JSON:', parseError);
      throw new Error('Resposta inválida recebida do servidor após login.');
    }
    
  } catch (error) {
    console.error('[DEBUG] Error in login function (api.js):', error);
    // Re-lança o erro para ser pego pelo AuthContext
    throw error; 
  }
}

export const register = async (userData) => {
  console.log('[DEBUG] Attempting registration for:', userData.email); 
  try {
    const res = await axios.post(`${API_URL}/auth/register`, userData);
    console.log('[DEBUG] Register API success response status:', res.status);
    console.log('[DEBUG] Register API success response data:', res.data);
    return res.data; // Retorna em caso de sucesso
  } catch (error) {
    console.error('[DEBUG] Error in register function (api.js):', error);
    if (error.response) {
      // O servidor respondeu com um status de erro (4xx, 5xx)
      console.error('[DEBUG] Register API error response status:', error.response.status);
      console.error('[DEBUG] Register API error response data:', error.response.data);
    } else if (error.request) {
      // A requisição foi feita mas não houve resposta
      console.error('[DEBUG] Register API no response received:', error.request);
    } else {
      // Erro ao configurar a requisição
      console.error('[DEBUG] Register API request setup error:', error.message);
    }
    // Re-lança o erro para ser pego pelo LoginPage
    throw error; 
  }
};

export const getOrders = async () => {
  try {
    // Usando o mesmo endpoint que getAllPedidos para garantir consistência
    const res = await axios.get(`${API_URL}/pedidos`);
    console.log('[DEBUG] Pedidos obtidos via getOrders:', res.data);
    return res.data;
  } catch (error) {
    console.error('[DEBUG] Erro ao obter pedidos via getOrders:', error.response?.data || error.message);
    // Retorna um array vazio em caso de erro para evitar quebras na UI
    return [];
  }
};

export const getOrder = async (id) => {
  const res = await axios.get(`${API_URL}/pedidos/${id}`);
  return res.data;
};

export const saveOrder = async (formData) => {
  const res = await axios.post(`${API_URL}/pedidos`, formData, {
    headers: {
    }
  });
  return res.data;
};

export const uploadImage = async (formData) => {
    const res = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return res.data;
};

export const getOrderForConfirmation = async (token) => {
  if (!token) throw new Error('Token inválido');
  try {
    const res = await axios.get(`${API_URL}/pedidos/confirmacao/${token}`);
    return res.data;
  } catch (error) {
    console.error('API Error getOrderForConfirmation:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Erro ao buscar pedido para confirmação.');
  }
};

export const confirmOrder = async (token) => {
  if (!token) throw new Error('Token inválido');
  try {
    const res = await axios.put(`${API_URL}/pedidos/confirmacao/${token}`);
    return res.data;
  } catch (error) {
    console.error('API Error confirmOrder:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Erro ao confirmar pedido.');
  }
};

export const getAllPedidos = async () => {
  try {
    const res = await axios.get(`${API_URL}/pedidos`);
    return res.data;
  } catch (error) {
    console.error('API Error getAllPedidos:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Erro ao buscar a lista de pedidos.');
  }
};

export const searchClientes = async (query) => {
  if (!query || query.length < 3) {
    return [];
  }
  try {
    const res = await axios.get(`${API_URL}/clientes/search`, { params: { q: query } });
    return res.data;
  } catch (error) {
    console.error('API Error searchClientes:', error.response?.data || error.message);
    return []; 
  }
};

export const createCliente = async (clienteData) => {
  try {
    const res = await axios.post(`${API_URL}/clientes`, clienteData);
    return res;
  } catch (error) {
    console.error('API Error createCliente:', error.response?.data || error.message);
    throw error; 
  }
};

export const getPedidosProducao = async () => {
  try {
    const res = await axios.get(`${API_URL}/pedidos`, { params: { status: 'producao' } });
    return res.data;
  } catch (error) {
    console.error('API Error getPedidosProducao:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Erro ao buscar pedidos de produção.');
  }
};

export const deletePedido = async (id) => {
  try {
    const res = await axios.delete(`${API_URL}/pedidos/${id}`);
    return res.data;
  } catch (error) {
    console.error('API Error deletePedido:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Erro ao excluir pedido.');
  }
};

// ADICIONADO: Função para atualizar a etapa de produção de um pedido
export const updatePedidoEtapa = async (pedidoId, novaEtapa) => {
  try {
    // Assumindo endpoint PATCH /pedidos/:id para atualizações parciais
    const res = await axios.patch(`${API_URL}/pedidos/${pedidoId}`, { setorAtualProducao: novaEtapa });
    console.log(`[DEBUG] Etapa do pedido ${pedidoId} atualizada para ${novaEtapa}. Resposta:`, res.data);
    return res.data; 
  } catch (error) {
    console.error(`[DEBUG] Erro ao atualizar etapa do pedido ${pedidoId} para ${novaEtapa}:`, error.response?.data || error.message);
    // Lança o erro para que o componente possa tratá-lo (ex: mostrar alerta)
    throw new Error(error.response?.data?.message || 'Erro ao atualizar etapa do pedido.');
  }
};

// Nova função para upload de imagens de uma etapa de produção
export const uploadImagemProducao = async (pedidoId, etapa, imagem) => {
  try {
    console.log(`[DEBUG] Iniciando upload de imagem para pedido ${pedidoId}, etapa: ${etapa}`);
    
    // Criar FormData com a imagem e etapa
    const formData = new FormData();
    formData.append('imagemProducao', imagem); 
    formData.append('etapa', etapa);
    
    const res = await axios.patch(
      `${API_URL}/pedidos/${pedidoId}/upload-producao`, 
      formData, 
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    console.log(`[DEBUG] Imagem de ${etapa} enviada com sucesso:`, res.data);
    return res.data;
  } catch (error) {
    console.error(`[DEBUG] Erro ao enviar imagem de ${etapa}:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || `Erro ao enviar imagem de ${etapa}.`);
  }
};

export const updateUserProfile = async (formData) => {
  try {
    console.log('[DEBUG] Iniciando atualização de perfil do usuário');
    
    // Verificar conteúdo do FormData (apenas para debug)
    for (let [key, value] of formData.entries()) {
      console.log(`[DEBUG] FormData Key: ${key}`);
      // Não logar valores de senha por segurança, apenas confirmar presença
      if (key.includes('Password')) {
        console.log(`[DEBUG] FormData Value: [REDACTED]`);
      } else if (key === 'profileImage') {
        console.log(`[DEBUG] FormData Value: [IMAGEM] ${value.name}, Tamanho: ${value.size}B, Tipo: ${value.type}`);
      } else {
        console.log(`[DEBUG] FormData Value: ${value}`);
      }
    }
    
    const res = await axios.put(`${API_URL}/users/profile`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log('[DEBUG] Perfil atualizado com sucesso:', res.data);
    return res.data;
  } catch (error) {
    console.error('[DEBUG] Erro detalhado ao atualizar perfil:', error);
    
    // Log de erro mais detalhado
    if (error.response) {
      // O servidor respondeu com um status de erro
      console.error('[DEBUG] Resposta de erro do servidor:', {
        status: error.response.status,
        data: error.response.data
      });
      throw new Error(error.response.data.message || 'Erro ao atualizar perfil. Resposta inválida do servidor.');
    } else if (error.request) {
      // A requisição foi feita mas não houve resposta
      console.error('[DEBUG] Sem resposta do servidor:', error.request);
      throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão.');
    } else {
      // Erro ao configurar a requisição
      console.error('[DEBUG] Erro ao configurar a requisição:', error.message);
      throw new Error('Erro ao preparar a requisição: ' + error.message);
    }
  }
};

// --- PERSONALIZAÇÕES (Valores de Personalização) ---

// Buscar valores atuais de personalização
export const getPersonalizacoes = async () => {
  try {
    console.log('Enviando requisição para API de personalizações...');
    const res = await axios.get(`${API_URL}/personalizacoes`);
    console.log('Resposta da API de personalizações:', res.data);
    return res.data;
  } catch (error) {
    console.error('API Error getPersonalizacoes:', error.response?.data || error.message);
    console.error('Detalhes do erro:', {
      url: `${API_URL}/personalizacoes`,
      status: error.response?.status,
      data: error.response?.data
    });
    throw new Error(error.response?.data?.error || 'Erro ao buscar valores de personalização.');
  }
};

// Salvar valores atualizados de personalização
export const savePersonalizacoes = async (personalizacoes) => {
  try {
    const res = await axios.post(`${API_URL}/personalizacoes`, personalizacoes);
    return res.data;
  } catch (error) {
    console.error('API Error savePersonalizacoes:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Erro ao salvar valores de personalização.');
  }
};
