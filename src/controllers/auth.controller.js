const authService = require('../services/auth.service');
const userRepository = require('../repositories/user.repository');

async function register(req, res, next) {
  try {
    const { nome, email, senha } = req.body;

    const user = await authService.register({
      nome,
      email,
      senha,
      role: 'cliente'
    });

    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, senha } = req.body;
    const result = await authService.login({ email, senha });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function me(req, res, next) {
  try {
    const user = await userRepository.findById(req.user.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  me
};