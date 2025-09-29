const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/billers', billController.getBillers);
router.post('/fetch', authenticateToken, billController.fetchBill);
router.post('/pay', authenticateToken, billController.payBill);

module.exports = router;
