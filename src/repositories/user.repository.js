const db = require('../config/db');

async function findByEmail(email) {
  const result = await db.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0];
}

async function findById(id) {
  const result = await db.query(
    'SELECT id, nome, email, role, created_at FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0];
}

async function create({ nome, email, senhaHash, role }) {
  const result = await db.query(
    `INSERT INTO users (nome, email, senha_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, nome, email, role, created_at`,
    [nome, email, senhaHash, role]
  );

  return result.rows[0];
}

async function findBarbeirosEAdmins() {
  const result = await db.query(
    `SELECT id, nome, email, role
     FROM users
     WHERE role IN ('admin', 'barbeiro')
     ORDER BY nome ASC`
  );

  return result.rows;
}

module.exports = {
  findByEmail,
  findById,
  create,
  findBarbeirosEAdmins
};