function errorMiddleware(error, req, res, next) {
  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    message: error.message || 'Erro interno do servidor.'
  });
}

module.exports = errorMiddleware;