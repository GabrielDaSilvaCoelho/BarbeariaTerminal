import api from './api.js';

export async function sendHelloMessage(message) {
  const { data } = await api.post('/hello', { message });
  return data;
}
