const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export async function login(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return res.json();
}

export async function register(name, email, password) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  return res.json();
}

export async function saveOrder(order) {
  const res = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  });
  return res.json();
}

export async function getOrder(id) {
  const res = await fetch(`${API_URL}/orders/${id}`);
  return res.json();
}

export async function getOrders() {
  const res = await fetch(`${API_URL}/orders`);
  return res.json();
}

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file);
  const res = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    body: formData,
  });
  return res.json();
}

// Additional API functions for missing imports
export async function getOrderForConfirmation(id) {
  const res = await fetch(`${API_URL}/orders/confirmation/${id}`);
  return res.json();
}

export async function confirmOrder(id, data) {
  const res = await fetch(`${API_URL}/orders/confirm/${id}` , {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getAllPedidos() {
  const res = await fetch(`${API_URL}/pedidos`);
  return res.json();
}

export async function getPedidosProducao() {
  const res = await fetch(`${API_URL}/pedidos/producao`);
  return res.json();
}

export async function searchClientes(query) {
  const res = await fetch(`${API_URL}/clientes?search=${encodeURIComponent(query)}`);
  return res.json();
}

export async function createCliente(cliente) {
  const res = await fetch(`${API_URL}/clientes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cliente),
  });
  return res.json();
}

// Deletar pedido por ID
export async function deletePedido(id) {
  const res = await fetch(`${API_URL}/pedidos/${id}`, { method: 'DELETE' });
  return res.json();
}
