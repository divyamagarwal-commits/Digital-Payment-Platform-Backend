const express = require('express');
const router = express.Router();
const merchantController = require('../controllers/merchantController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/register', authenticateToken, merchantController.registerMerchant);
router.post('/generate-qr', authenticateToken, merchantController.generateQR);
router.get('/settlements', authenticateToken, merchantController.getSettlements);

module.exports = router;
