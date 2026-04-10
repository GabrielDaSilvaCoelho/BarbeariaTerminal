const appointmentRepository = require('../repositories/appointment.repository');
const serviceRepository = require('../repositories/service.repository');

async function create(data) {
  if (!data.cliente_id || !data.service_id || !data.data_hora) {
    const error = new Error('Cliente, serviço e data/hora são obrigatórios.');
    error.statusCode = 400;
    throw error;
  }

  if (!data.barbeiro_id) {
    const error = new Error('Selecione um barbeiro para o agendamento.');
    error.statusCode = 400;
    throw error;
  }

  const service = await serviceRepository.findById(Number(data.service_id));

  if (!service) {
    const error = new Error('Serviço não encontrado.');
    error.statusCode = 404;
    throw error;
  }

  const startAt = new Date(data.data_hora);

  if (isNaN(startAt.getTime())) {
    const error = new Error('Data/hora inválida.');
    error.statusCode = 400;
    throw error;
  }

  if (startAt < new Date()) {
    const error = new Error('Não é permitido agendar para uma data/hora no passado.');
    error.statusCode = 400;
    throw error;
  }

  const durationMs = Number(service.duracao_min) * 60 * 1000;
  const endAt = new Date(startAt.getTime() + durationMs);

  const conflict = await appointmentRepository.findConflictByRange({
    barbeiro_id: Number(data.barbeiro_id),
    start_at: startAt,
    end_at: endAt
  });

  if (conflict) {
    const error = new Error(
      'Esse horário conflita com outro agendamento já existente para o barbeiro selecionado.'
    );
    error.statusCode = 409;
    throw error;
  }

  return appointmentRepository.create({
    ...data,
    service_id: Number(data.service_id),
    barbeiro_id: Number(data.barbeiro_id)
  });
}

async function listAll(user, tipo = 'ativos') {
  if (user.role === 'cliente') {
    if (tipo === 'historico') {
      return appointmentRepository.findHistoryByClienteId(user.id);
    }
    return appointmentRepository.findActiveByClienteId(user.id);
  }

  if (tipo === 'historico') {
    return appointmentRepository.findHistory();
  }

  return appointmentRepository.findActive();
}

async function updateStatus(id, status) {
  const validStatus = ['pendente', 'confirmado', 'concluido', 'cancelado'];

  if (!validStatus.includes(status)) {
    const error = new Error('Status inválido.');
    error.statusCode = 400;
    throw error;
  }

  const existing = await appointmentRepository.findById(id);

  if (!existing) {
    const error = new Error('Agendamento não encontrado.');
    error.statusCode = 404;
    throw error;
  }

  return appointmentRepository.updateStatus(id, status);
}

async function remove(id, user) {
  const existing = await appointmentRepository.findById(id);

  if (!existing) {
    const error = new Error('Agendamento não encontrado.');
    error.statusCode = 404;
    throw error;
  }

  const isClienteDono = user.role === 'cliente' && Number(existing.cliente_id) === Number(user.id);
  const isAdminOuBarbeiro = ['admin', 'barbeiro'].includes(user.role);

  if (!isClienteDono && !isAdminOuBarbeiro) {
    const error = new Error('Você não tem permissão para remover este agendamento.');
    error.statusCode = 403;
    throw error;
  }

  return appointmentRepository.remove(id);
}

module.exports = {
  create,
  listAll,
  updateStatus,
  remove
};