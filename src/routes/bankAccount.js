const express = require('express');
const router = express.Router();
const bankAccountController = require('../controllers/bankAccountController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/link', authenticateToken, bankAccountController.linkBankAccount);
router.get('/', authenticateToken, bankAccountController.getBankAccounts);
router.put('/:id/set-primary', authenticateToken, bankAccountController.setPrimaryAccount);
router.delete('/:id', authenticateToken, bankAccountController.deleteBankAccount);

module.exports = router;
