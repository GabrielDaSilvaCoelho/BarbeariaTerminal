import api from './api.js';

export async function listServices() {
  const { data } = await api.get('/services');
  return data;
}

export async function createService(payload) {
  const { data } = await api.post('/services', payload);
  return data;
}

export async function updateService(id, payload) {
  const { data } = await api.put(`/services/${id}`, payload);
  return data;
}

export async function deleteService(id) {
  const { data } = await api.delete(`/services/${id}`);
  return data;
}
