import api from './api.js';

export async function loginRequest({ email, senha }) {
  const { data } = await api.post('/auth/login', { email, senha });
  return data;
}

export async function registerRequest({ nome, email, senha }) {
  const { data } = await api.post('/auth/register', { nome, email, senha });
  return data;
}

export async function meRequest() {
  const { data } = await api.get('/auth/me');
  return data;
}
