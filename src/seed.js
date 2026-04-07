require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('./config/db');

async function seed() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(120) NOT NULL,
        email VARCHAR(120) UNIQUE NOT NULL,
        senha_hash TEXT NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'cliente',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(120) NOT NULL,
        descricao TEXT,
        preco NUMERIC(10,2) NOT NULL,
        duracao_min INT NOT NULL,
        ativo BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        cliente_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        barbeiro_id INT REFERENCES users(id) ON DELETE SET NULL,
        service_id INT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
        data_hora TIMESTAMP NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pendente',
        observacoes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const senhaPadrao = '123456';
    const senhaHash = await bcrypt.hash(senhaPadrao, 10);

    const users = [
      { nome: 'Administrador', email: 'admin@barberpro.com', role: 'admin' },
      { nome: 'Carlos Barber', email: 'carlos@barberpro.com', role: 'barbeiro' },
      { nome: 'João Cliente', email: 'joao@barberpro.com', role: 'cliente' }
    ];

    const userIds = {};

    for (const user of users) {
      const result = await client.query(
        `INSERT INTO users (nome, email, senha_hash, role)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (email)
         DO UPDATE SET nome = EXCLUDED.nome, role = EXCLUDED.role
         RETURNING id, email`,
        [user.nome, user.email, senhaHash, user.role]
      );

      userIds[result.rows[0].email] = result.rows[0].id;
    }

    const services = [
      {
        nome: 'Corte Tradicional',
        descricao: 'Corte masculino tradicional na tesoura e máquina.',
        preco: 35.0,
        duracao_min: 40
      },
      {
        nome: 'Barba',
        descricao: 'Modelagem e acabamento completo da barba.',
        preco: 25.0,
        duracao_min: 30
      },
      {
        nome: 'Corte + Barba',
        descricao: 'Pacote completo com corte e barba.',
        preco: 55.0,
        duracao_min: 70
      }
    ];

    const serviceIds = {};

    for (const service of services) {
      const result = await client.query(
        `INSERT INTO services (nome, descricao, preco, duracao_min, ativo)
         VALUES ($1, $2, $3, $4, TRUE)
         ON CONFLICT DO NOTHING
         RETURNING id, nome`,
        [service.nome, service.descricao, service.preco, service.duracao_min]
      );

      if (result.rows[0]) {
        serviceIds[result.rows[0].nome] = result.rows[0].id;
      } else {
        const existing = await client.query(
          'SELECT id, nome FROM services WHERE nome = $1 LIMIT 1',
          [service.nome]
        );
        if (existing.rows[0]) {
          serviceIds[existing.rows[0].nome] = existing.rows[0].id;
        }
      }
    }

    const clienteId = userIds['joao@barberpro.com'];
    const barbeiroId = userIds['carlos@barberpro.com'];
    const corteId = serviceIds['Corte Tradicional'];
    const comboId = serviceIds['Corte + Barba'];

    if (clienteId && barbeiroId && corteId && comboId) {
      const now = new Date();
      const futuro1 = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      futuro1.setHours(10, 0, 0, 0);
      const futuro2 = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
      futuro2.setHours(14, 30, 0, 0);
      const passado = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
      passado.setHours(9, 0, 0, 0);

      const appointments = [
        {
          cliente_id: clienteId,
          barbeiro_id: barbeiroId,
          service_id: corteId,
          data_hora: futuro1,
          status: 'pendente',
          observacoes: 'Cliente prefere corte baixo nas laterais.'
        },
        {
          cliente_id: clienteId,
          barbeiro_id: barbeiroId,
          service_id: comboId,
          data_hora: futuro2,
          status: 'confirmado',
          observacoes: 'Agendamento de demonstração para a apresentação.'
        },
        {
          cliente_id: clienteId,
          barbeiro_id: barbeiroId,
          service_id: corteId,
          data_hora: passado,
          status: 'concluido',
          observacoes: 'Atendimento finalizado com sucesso.'
        }
      ];

      for (const item of appointments) {
        const exists = await client.query(
          `SELECT id FROM appointments
           WHERE cliente_id = $1 AND barbeiro_id = $2 AND service_id = $3 AND data_hora = $4
           LIMIT 1`,
          [item.cliente_id, item.barbeiro_id, item.service_id, item.data_hora]
        );

        if (!exists.rows.length) {
          await client.query(
            `INSERT INTO appointments (cliente_id, barbeiro_id, service_id, data_hora, status, observacoes)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              item.cliente_id,
              item.barbeiro_id,
              item.service_id,
              item.data_hora,
              item.status,
              item.observacoes
            ]
          );
        }
      }
    }

    await client.query('COMMIT');

    console.log('Seed executada com sucesso.');
    console.log('Usuários de teste:');
    console.log(' - admin@barberpro.com | senha: 123456 | role: admin');
    console.log(' - carlos@barberpro.com | senha: 123456 | role: barbeiro');
    console.log(' - joao@barberpro.com | senha: 123456 | role: cliente');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao executar seed:', error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
