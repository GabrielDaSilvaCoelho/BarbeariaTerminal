const express = require('express');
const serviceController = require('../controllers/service.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

const router = express.Router();

router.get('/', authMiddleware, serviceController.list);
router.post('/', authMiddleware, roleMiddleware('admin', 'barbeiro'), serviceController.create);
router.put('/:id', authMiddleware, roleMiddleware('admin', 'barbeiro'), serviceController.update);
router.delete('/:id', authMiddleware, roleMiddleware('admin', 'barbeiro'), serviceController.remove);

module.exports = router;