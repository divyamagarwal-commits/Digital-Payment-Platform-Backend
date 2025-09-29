const express = require('express');
const router = express.Router();
const rechargeController = require('../controllers/rechargeController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/operators', rechargeController.getOperators);
router.get('/plans', rechargeController.getPlans);
router.post('/mobile', authenticateToken, rechargeController.rechargeMobile);

module.exports = router;
