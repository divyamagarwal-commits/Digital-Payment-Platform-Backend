const express = require('express');
const router = express.Router();
const securityController = require('../controllers/securityController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/verify-pin', authenticateToken, securityController.verifyPin);
router.put('/change-pin', authenticateToken, securityController.changePin);
router.post('/block-account', authenticateToken, securityController.blockAccount);

module.exports = router;
