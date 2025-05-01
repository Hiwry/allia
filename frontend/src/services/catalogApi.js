import axios from 'axios';

// Adiciona o token JWT em todas as requisições
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

const API_URL = 'https://allia.onrender.com/api/catalog';

export async function getCatalog(group) {
  const { data } = await axios.get(`${API_URL}/${group}`);
  return data;
}

export async function addCatalogItem(group, item) {
  const { data } = await axios.post(`${API_URL}/${group}`, item);
  return data;
}

export async function updateCatalogItem(id, item) {
  const { data } = await axios.put(`${API_URL}/${id}`, item);
  return data;
}

export async function deleteCatalogItem(id) {
  await axios.delete(`${API_URL}/${id}`);
}

export async function reorderCatalogItems(group, ordem) {
  await axios.post(`${API_URL}/${group}/reorder`, { ordem });
}

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file);
  const { data } = await axios.post('https://allia.onrender.com/api/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data.url || data.path;
}
