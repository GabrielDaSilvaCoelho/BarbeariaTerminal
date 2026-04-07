CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'cliente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  descricao TEXT,
  preco NUMERIC(10,2) NOT NULL,
  duracao_min INT NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

INSERT INTO users (nome, email, senha_hash, role)
VALUES (
  'Administrador',
  'admin@barberpro.com',
  '$2b$10$1LhY0s9N3JH8H9N7G6QwLe2QWb8h0xG2r0k0Vq2bJr7G3g2pN6qQK',
  'admin'
)
ON CONFLICT (email) DO NOTHING;