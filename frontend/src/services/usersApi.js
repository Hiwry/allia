const API_URL = 'https://allia.onrender.com/api';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token
    ? { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    : { 'Content-Type': 'application/json' };
}

export async function getAllUsers() {
  const res = await fetch(`${API_URL}/users`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function createUser(user) {
  const res = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(user),
  });
  return res.json();
}

export async function updateUser(id, user) {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(user),
  });
  return res.json();
}

export async function deleteUser(id) {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return res.json();
}
