const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/balance', authenticateToken, walletController.getBalance);
router.post('/add-money', authenticateToken, walletController.addMoney);
router.get('/transactions', authenticateToken, walletController.getTransactions);

module.exports = router;
