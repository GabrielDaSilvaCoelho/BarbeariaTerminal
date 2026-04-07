const serviceRepository = require('../repositories/service.repository');

async function listAll() {
  return serviceRepository.findAll();
}

async function create(data) {
  if (!data.nome || !data.preco || !data.duracao_min) {
    const error = new Error('Nome, preço e duração são obrigatórios.');
    error.statusCode = 400;
    throw error;
  }

  return serviceRepository.create(data);
}

async function update(id, data) {
  const existing = await serviceRepository.findById(id);

  if (!existing) {
    const error = new Error('Serviço não encontrado.');
    error.statusCode = 404;
    throw error;
  }

  return serviceRepository.update(id, data);
}

async function remove(id) {
  const existing = await serviceRepository.findById(id);

  if (!existing) {
    const error = new Error('Serviço não encontrado.');
    error.statusCode = 404;
    throw error;
  }

  return serviceRepository.remove(id);
}

module.exports = {
  listAll,
  create,
  update,
  remove
};