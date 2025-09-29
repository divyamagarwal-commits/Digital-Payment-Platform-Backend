const express = require('express');
const router = express.Router();
const upiController = require('../controllers/upiController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/create-id', authenticateToken, upiController.createUpiId);
router.post('/send', authenticateToken, upiController.sendMoney);
router.post('/request', authenticateToken, upiController.requestMoney);
router.post('/scan-pay', authenticateToken, upiController.scanPay);

module.exports = router;
