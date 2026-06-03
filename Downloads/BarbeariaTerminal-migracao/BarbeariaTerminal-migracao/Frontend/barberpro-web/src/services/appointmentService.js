import api from './api.js';

export async function listAppointments(tipo = 'ativos') {
  const { data } = await api.get('/appointments', { params: { tipo } });
  return data;
}

export async function createAppointment(payload) {
  const { data } = await api.post('/appointments', payload);
  return data;
}

export async function updateAppointmentStatus(id, status) {
  const { data } = await api.patch(`/appointments/${id}/status`, { status });
  return data;
}

export async function cancelAppointment(id) {
  const { data } = await api.delete(`/appointments/${id}`);
  return data;
}
