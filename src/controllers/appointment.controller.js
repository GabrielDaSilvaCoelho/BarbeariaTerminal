const appointmentService = require('../services/appointment.service');

async function create(req, res, next) {
  try {
    const appointment = await appointmentService.create({
      ...req.body,
      cliente_id: req.user.id
    });

    res.status(201).json(appointment);
  } catch (error) {
    next(error);
  }
}

async function list(req, res, next) {
  try {
    const tipo = req.query.tipo || 'ativos';
    const appointments = await appointmentService.listAll(req.user, tipo);
    res.json(appointments);
  } catch (error) {
    next(error);
  }
}

async function updateStatus(req, res, next) {
  try {
    const updated = await appointmentService.updateStatus(
      req.params.id,
      req.body.status
    );

    res.json(updated);
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    const deleted = await appointmentService.remove(req.params.id);
    res.json(deleted);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  create,
  list,
  updateStatus,
  remove
};