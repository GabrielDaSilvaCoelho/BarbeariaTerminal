const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/user.repository');

async function register({ nome, email, senha, role = 'cliente' }) {
  const existingUser = await userRepository.findByEmail(email);

  if (existingUser) {
    const error = new Error('E-mail já cadastrado.');
    error.statusCode = 409;
    throw error;
  }

  const senhaHash = await bcrypt.hash(senha, 10);

  const user = await userRepository.create({
    nome,
    email,
    senhaHash,
    role
  });

  return user;
}

async function login({ email, senha }) {
  const user = await userRepository.findByEmail(email);

  if (!user) {
    const error = new Error('Credenciais inválidas.');
    error.statusCode = 401;
    throw error;
  }

  const senhaValida = await bcrypt.compare(senha, user.senha_hash);

  if (!senhaValida) {
    const error = new Error('Credenciais inválidas.');
    error.statusCode = 401;
    throw error;
  }

  const token = jwt.sign(
    {
      id: user.id,
      nome: user.nome,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  return {
    token,
    user: {
      id: user.id,
      nome: user.nome,
      email: user.email,
      role: user.role
    }
  };
}

module.exports = {
  register,
  login
};