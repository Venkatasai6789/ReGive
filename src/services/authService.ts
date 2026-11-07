import { User, LoginCredentials } from '../types/auth';

const API_BASE = 'http://127.0.0.1:8000/api/auth';

export const loginApi = async (credentials: LoginCredentials): Promise<User> => {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(credentials)
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || 'Authentication failed. Please check your credentials.');
  }

  return await res.json();
};

export const logoutApi = async (): Promise<void> => {
  try {
    await fetch(`${API_BASE}/logout`, {
      method: 'POST',
      credentials: 'include'
    });
  } catch (err) {
    console.error('Logout error:', err);
  }
};

export const getMeApi = async (): Promise<User | null> => {
  try {
    const res = await fetch(`${API_BASE}/me`, {
      method: 'GET',
      credentials: 'include'
    });

    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
};

export const getAuthStatusApi = async (): Promise<{ authenticated: boolean; user: User | null }> => {
  try {
    const res = await fetch(`${API_BASE}/status`, {
      method: 'GET',
      credentials: 'include'
    });

    if (!res.ok) return { authenticated: false, user: null };
    return await res.json();
  } catch (err) {
    return { authenticated: false, user: null };
  }
};
