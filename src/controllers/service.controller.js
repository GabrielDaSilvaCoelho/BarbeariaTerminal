const serviceService = require('../services/service.service');

async function list(req, res, next) {
  try {
    const services = await serviceService.listAll();
    res.json(services);
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const service = await serviceService.create(req.body);
    res.status(201).json(service);
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const service = await serviceService.update(req.params.id, req.body);
    res.json(service);
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    const deleted = await serviceService.remove(req.params.id);
    res.json(deleted);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  list,
  create,
  update,
  remove
};