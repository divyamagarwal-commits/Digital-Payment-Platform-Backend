const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/add', authenticateToken, contactController.addContact);
router.get('/', authenticateToken, contactController.getContacts);

module.exports = router;
