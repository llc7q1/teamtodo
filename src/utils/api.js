// src/utils/api.js
import { getToken, removeToken } from './storage';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://teamtodo-api-production.up.railway.app/api';

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    const error = await response.json().catch(() => ({}));
    // Only auto-logout for authenticated requests, not login/register
    if (path !== '/login' && path !== '/register') {
      removeToken();
      window.location.reload();
      return;
    }
    throw new Error(error.detail || '认证失败');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `请求失败 (${response.status})`);
  }

  return response.json();
}

export const api = {
  get: (path) => request(path),
  post: (path, data) => request(path, { method: 'POST', body: JSON.stringify(data) }),
  put: (path, data) => request(path, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (path) => request(path, { method: 'DELETE' }),
};
