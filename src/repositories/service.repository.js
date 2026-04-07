const db = require('../config/db');

async function findAll() {
  const result = await db.query(
    'SELECT * FROM services WHERE ativo = TRUE ORDER BY id DESC'
  );
  return result.rows;
}

async function findById(id) {
  const result = await db.query(
    'SELECT * FROM services WHERE id = $1',
    [id]
  );
  return result.rows[0];
}

async function create({ nome, descricao, preco, duracao_min }) {
  const result = await db.query(
    `INSERT INTO services (nome, descricao, preco, duracao_min)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [nome, descricao, preco, duracao_min]
  );
  return result.rows[0];
}

async function update(id, { nome, descricao, preco, duracao_min, ativo }) {
  const result = await db.query(
    `UPDATE services
     SET nome = $1,
         descricao = $2,
         preco = $3,
         duracao_min = $4,
         ativo = $5
     WHERE id = $6
     RETURNING *`,
    [nome, descricao, preco, duracao_min, ativo, id]
  );
  return result.rows[0];
}

async function remove(id) {
  const result = await db.query(
    'DELETE FROM services WHERE id = $1 RETURNING *',
    [id]
  );
  return result.rows[0];
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove
};