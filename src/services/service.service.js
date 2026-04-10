const serviceRepository = require('../repositories/service.repository');

function validarDadosServico(data) {
  const nome = data.nome?.trim();
  const preco = Number(data.preco);
  const duracao = Number(data.duracao_min);

  if (!nome) {
    const error = new Error('Nome é obrigatório.');
    error.statusCode = 400;
    throw error;
  }

  if (nome.length < 3) {
    const error = new Error('O nome do serviço deve ter pelo menos 3 caracteres.');
    error.statusCode = 400;
    throw error;
  }

  if (Number.isNaN(preco) || preco <= 0) {
    const error = new Error('Preço inválido.');
    error.statusCode = 400;
    throw error;
  }

  if (!Number.isInteger(duracao) || duracao <= 0) {
    const error = new Error('Duração inválida.');
    error.statusCode = 400;
    throw error;
  }
}

async function listAll() {
  return serviceRepository.findAll();
}

async function create(data) {
  validarDadosServico(data);

  return serviceRepository.create({
    nome: data.nome.trim(),
    descricao: data.descricao?.trim() || null,
    preco: Number(data.preco),
    duracao_min: Number(data.duracao_min)
  });
}

async function update(id, data) {
  const existing = await serviceRepository.findById(id);

  if (!existing) {
    const error = new Error('Serviço não encontrado.');
    error.statusCode = 404;
    throw error;
  }

  validarDadosServico(data);

  return serviceRepository.update(id, {
    nome: data.nome.trim(),
    descricao: data.descricao?.trim() || null,
    preco: Number(data.preco),
    duracao_min: Number(data.duracao_min),
    ativo: data.ativo ?? true
  });
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