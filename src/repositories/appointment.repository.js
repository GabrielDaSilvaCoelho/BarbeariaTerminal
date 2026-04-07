const db = require('../config/db');

async function create({ cliente_id, barbeiro_id, service_id, data_hora, observacoes }) {
  const result = await db.query(
    `INSERT INTO appointments (cliente_id, barbeiro_id, service_id, data_hora, observacoes)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [cliente_id, barbeiro_id || null, service_id, data_hora, observacoes || null]
  );
  return result.rows[0];
}

async function findActive() {
  const result = await db.query(
    `SELECT 
        a.id,
        a.data_hora,
        a.status,
        a.observacoes,
        a.created_at,
        c.nome AS cliente_nome,
        b.nome AS barbeiro_nome,
        s.nome AS servico_nome,
        s.preco,
        s.duracao_min
     FROM appointments a
     JOIN users c ON c.id = a.cliente_id
     LEFT JOIN users b ON b.id = a.barbeiro_id
     JOIN services s ON s.id = a.service_id
     WHERE a.status IN ('pendente', 'confirmado')
     ORDER BY a.data_hora DESC`
  );
  return result.rows;
}

async function findHistory() {
  const result = await db.query(
    `SELECT 
        a.id,
        a.data_hora,
        a.status,
        a.observacoes,
        a.created_at,
        c.nome AS cliente_nome,
        b.nome AS barbeiro_nome,
        s.nome AS servico_nome,
        s.preco,
        s.duracao_min
     FROM appointments a
     JOIN users c ON c.id = a.cliente_id
     LEFT JOIN users b ON b.id = a.barbeiro_id
     JOIN services s ON s.id = a.service_id
     WHERE a.status IN ('concluido', 'cancelado')
     ORDER BY a.data_hora DESC`
  );
  return result.rows;
}

async function findActiveByClienteId(clienteId) {
  const result = await db.query(
    `SELECT 
        a.id,
        a.data_hora,
        a.status,
        a.observacoes,
        a.created_at,
        b.nome AS barbeiro_nome,
        s.nome AS servico_nome,
        s.preco,
        s.duracao_min
     FROM appointments a
     LEFT JOIN users b ON b.id = a.barbeiro_id
     JOIN services s ON s.id = a.service_id
     WHERE a.cliente_id = $1
       AND a.status IN ('pendente', 'confirmado')
     ORDER BY a.data_hora DESC`,
    [clienteId]
  );
  return result.rows;
}

async function findHistoryByClienteId(clienteId) {
  const result = await db.query(
    `SELECT 
        a.id,
        a.data_hora,
        a.status,
        a.observacoes,
        a.created_at,
        b.nome AS barbeiro_nome,
        s.nome AS servico_nome,
        s.preco,
        s.duracao_min
     FROM appointments a
     LEFT JOIN users b ON b.id = a.barbeiro_id
     JOIN services s ON s.id = a.service_id
     WHERE a.cliente_id = $1
       AND a.status IN ('concluido', 'cancelado')
     ORDER BY a.data_hora DESC`,
    [clienteId]
  );
  return result.rows;
}

async function findById(id) {
  const result = await db.query(
    'SELECT * FROM appointments WHERE id = $1',
    [id]
  );
  return result.rows[0];
}

async function findConflictByRange({ barbeiro_id, start_at, end_at }) {
  const result = await db.query(
    `
    SELECT
      a.id,
      a.data_hora,
      a.status,
      s.duracao_min,
      a.data_hora + (s.duracao_min * INTERVAL '1 minute') AS fim_agendamento
    FROM appointments a
    JOIN services s ON s.id = a.service_id
    WHERE a.barbeiro_id = $1
      AND a.status IN ('pendente', 'confirmado')
      AND a.data_hora < $3
      AND (a.data_hora + (s.duracao_min * INTERVAL '1 minute')) > $2
    LIMIT 1
    `,
    [barbeiro_id, start_at, end_at]
  );

  return result.rows[0];
}

async function updateStatus(id, status) {
  const result = await db.query(
    `UPDATE appointments
     SET status = $1
     WHERE id = $2
     RETURNING *`,
    [status, id]
  );
  return result.rows[0];
}

async function remove(id) {
  const result = await db.query(
    'DELETE FROM appointments WHERE id = $1 RETURNING *',
    [id]
  );
  return result.rows[0];
}

module.exports = {
  create,
  findActive,
  findHistory,
  findActiveByClienteId,
  findHistoryByClienteId,
  findById,
  findConflictByRange,
  updateStatus,
  remove
};