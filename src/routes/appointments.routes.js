const express = require('express');
const appointmentController = require('../controllers/appointment.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

const router = express.Router();

router.get('/', authMiddleware, appointmentController.list);
router.post('/', authMiddleware, roleMiddleware('cliente'), appointmentController.create);
router.patch('/:id/status', authMiddleware, roleMiddleware('admin', 'barbeiro'), appointmentController.updateStatus);
router.delete('/:id', authMiddleware, appointmentController.remove);

module.exports = router;