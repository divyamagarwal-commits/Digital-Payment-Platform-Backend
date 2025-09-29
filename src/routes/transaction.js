const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, transactionController.getTransactions);
router.get('/:id', authenticateToken, transactionController.getTransactionById);
router.post('/:id/raise-dispute', authenticateToken, transactionController.raiseDispute);

module.exports = router;
