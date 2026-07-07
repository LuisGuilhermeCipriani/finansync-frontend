const API_URL = import.meta.env.VITE_API_URL;
let authToken = localStorage.getItem('finansync_token') || '';

export function setAuthToken(token) {
  authToken = token || '';
}

export function clearAuthToken() {
  authToken = '';
}

async function request(path, options = {}) {
  if (!API_URL) {
    throw new Error('VITE_API_URL deve ser definido no arquivo .env para usar a API');
  }

  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.error?.message || 'Falha na comunicacao com a API');
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function getDashboard() {
  return request('/dashboard');
}

export async function getAccounts() {
  return request('/accounts');
}

export async function getCategories() {
  return request('/categories');
}

export async function getTransactions(params = '') {
  const query = params ? `?${params}` : '';
  return request(`/transactions${query}`);
}

export async function createAccount(payload) {
  return request('/accounts', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function createCategory(payload) {
  return request('/categories', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function createTransaction(payload) {
  return request('/transactions', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function register(payload) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function login(payload) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function getMe() {
  return request('/auth/me');
}
