const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/user.repository');

function isEmailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function register({ nome, email, senha, role = 'cliente' }) {
  if (!nome || !nome.trim()) {
    const error = new Error('Nome é obrigatório.');
    error.statusCode = 400;
    throw error;
  }

  if (!email || !email.trim()) {
    const error = new Error('E-mail é obrigatório.');
    error.statusCode = 400;
    throw error;
  }

  if (!isEmailValido(email)) {
    const error = new Error('E-mail inválido.');
    error.statusCode = 400;
    throw error;
  }

  if (!senha || senha.length < 6) {
    const error = new Error('A senha deve ter pelo menos 6 caracteres.');
    error.statusCode = 400;
    throw error;
  }

  const existingUser = await userRepository.findByEmail(email.trim().toLowerCase());

  if (existingUser) {
    const error = new Error('E-mail já cadastrado.');
    error.statusCode = 409;
    throw error;
  }

  const senhaHash = await bcrypt.hash(senha, 10);

  const user = await userRepository.create({
    nome: nome.trim(),
    email: email.trim().toLowerCase(),
    senhaHash,
    role
  });

  return user;
}

async function login({ email, senha }) {
  if (!email || !senha) {
    const error = new Error('E-mail e senha são obrigatórios.');
    error.statusCode = 400;
    throw error;
  }

  const user = await userRepository.findByEmail(email.trim().toLowerCase());

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
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
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