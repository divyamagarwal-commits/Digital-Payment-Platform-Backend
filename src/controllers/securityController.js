const db = require('../database');
const bcrypt = require('bcrypt');

// POST /api/security/verify-pin
exports.verifyPin = (req, res) => {
    const userId = req.user.id;
    const { pin } = req.body;

    if (!pin) return res.status(400).json({ success: false, message: 'PIN is required' });

    db.get('SELECT pin FROM users WHERE id = ?', [userId], (err, user) => {
        if (err || !user) return res.status(404).json({ success: false, message: 'User not found' });

        if (bcrypt.compareSync(pin, user.pin)) {
            res.json({ success: true, message: 'PIN verified' });
        } else {
            res.status(400).json({ success: false, message: 'Invalid PIN' });
        }
    });
};

// PUT /api/security/change-pin
exports.changePin = (req, res) => {
    const userId = req.user.id;
    const { oldPin, newPin } = req.body;

    if (!oldPin || !newPin) return res.status(400).json({ success: false, message: 'Old and new PIN required' });

    db.get('SELECT pin FROM users WHERE id = ?', [userId], (err, user) => {
        if (err || !user) return res.status(404).json({ success: false, message: 'User not found' });

        if (!bcrypt.compareSync(oldPin, user.pin)) {
            return res.status(400).json({ success: false, message: 'Old PIN incorrect' });
        }

        const hashedPin = bcrypt.hashSync(newPin, 10);
        db.run('UPDATE users SET pin = ? WHERE id = ?', [hashedPin, userId], (err2) => {
            if (err2) return res.status(500).json({ success: false, message: err2.message });
            res.json({ success: true, message: 'PIN changed successfully' });
        });
    });
};

// POST /api/security/block-account
exports.blockAccount = (req, res) => {
    const userId = req.user.id;

    db.run('UPDATE users SET is_blocked = 1 WHERE id = ?', [userId], (err) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, message: 'Account blocked successfully' });
    });
};
