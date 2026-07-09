const API_URL = import.meta.env.VITE_API_URL;
let tokenAutenticacao = localStorage.getItem('finansync_token') || '';

export function setAuthToken(token) {
  tokenAutenticacao = token || '';
}

export function clearAuthToken() {
  tokenAutenticacao = '';
}

async function requisicao(path, options = {}) {
  if (!API_URL) {
    throw new Error('VITE_API_URL deve ser definido no arquivo .env para usar a API.');
  }

  const resposta = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(tokenAutenticacao ? { Authorization: `Bearer ${tokenAutenticacao}` } : {}),
      ...(options.headers || {})
    },
    ...options
  });

  if (!resposta.ok) {
    const corpo = await resposta.json().catch(() => ({}));
    throw new Error(corpo?.error?.message || 'Falha na comunicação com a API.');
  }

  if (resposta.status === 204) {
    return null;
  }

  return resposta.json();
}

export async function getDashboard() {
  return requisicao('/dashboard');
}

export async function getAccounts() {
  return requisicao('/accounts');
}

export async function getCategories() {
  return requisicao('/categories');
}

export async function getTransactions(params = '') {
  const query = params ? `?${params}` : '';
  return requisicao(`/transactions${query}`);
}

export async function createAccount(payload) {
  return requisicao('/accounts', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function deleteAccount(id) {
  return requisicao(`/accounts/${id}`, {
    method: 'DELETE'
  });
}

export async function createCategory(payload) {
  return requisicao('/categories', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function updateCategory(id, payload) {
  return requisicao(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export async function deleteCategory(id) {
  return requisicao(`/categories/${id}`, {
    method: 'DELETE'
  });
}

export async function createTransaction(payload) {
  return requisicao('/transactions', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function register(payload) {
  return requisicao('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function login(payload) {
  return requisicao('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function updateMe(payload) {
  return requisicao('/auth/me', {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export async function getMe() {
  return requisicao('/auth/me');
}

