import api from './api.js';

export async function listBarbeiros() {
  const { data } = await api.get('/barbeiros');
  return data;
}
