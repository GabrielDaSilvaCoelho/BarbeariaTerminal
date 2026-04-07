const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const servicesRoutes = require('./routes/services.routes');
const appointmentsRoutes = require('./routes/appointments.routes');
const errorMiddleware = require('./middlewares/error.middleware');
const userRepository = require('./repositories/user.repository');

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.get('/api/barbeiros', async (req, res, next) => {
  try {
    const barbeiros = await userRepository.findBarbeirosEAdmins();
    res.json(barbeiros);
  } catch (error) {
    next(error);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/appointments', appointmentsRoutes);

app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});