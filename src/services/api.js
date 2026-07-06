const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api/v1';

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
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
