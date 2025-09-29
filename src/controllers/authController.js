const db = require('../database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { SECRET } = require('../middleware/authMiddleware');

const OTP_STORE = {}; // For demo purposes

// Step 1: Register (send OTP)
exports.register = (req, res) => {
    const { name, mobile, email } = req.body;
    const sessionId = `session_${Date.now()}`;
    OTP_STORE[sessionId] = { name, mobile, email, otp: '123456' }; // Fixed OTP for demo
    res.json({ success: true, message: 'OTP sent to mobile', sessionId });
};

// Step 2: Verify OTP
exports.verifyOtp = (req, res) => {
    const { sessionId, otp } = req.body;
    const session = OTP_STORE[sessionId];
    if (!session) return res.status(400).json({ success: false, message: 'Invalid session' });
    if (session.otp !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP' });

    // Save user in DB
    db.run(
        'INSERT INTO users (name, mobile_number, email) VALUES (?, ?, ?)',
        [session.name, session.mobile, session.email],
        function (err) {
            if (err) return res.status(500).json({ success: false, message: err.message });
            const user = { id: this.lastID, name: session.name, mobile: session.mobile, kycStatus: 'pending' };
            const token = jwt.sign(user, SECRET, { expiresIn: '1h' });
            delete OTP_STORE[sessionId];
            res.json({ success: true, token, user });
        }
    );
};

// Step 3: Set PIN
exports.setPin = (req, res) => {
    const { pin } = req.body;
    const hashedPin = bcrypt.hashSync(pin, 10);
    db.run('UPDATE users SET pin = ? WHERE id = ?', [hashedPin, req.user.id], function (err) {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, message: 'PIN set successfully' });
    });
};

// Step 4: Login
exports.login = (req, res) => {
    const { mobile, pin } = req.body;
    db.get('SELECT * FROM users WHERE mobile_number = ?', [mobile], (err, user) => {
        if (err || !user) return res.status(400).json({ success: false, message: 'User not found' });
        if (!bcrypt.compareSync(pin, user.pin)) return res.status(400).json({ success: false, message: 'Invalid PIN' });
        const token = jwt.sign({ id: user.id, name: user.name, mobile: user.mobile_number }, SECRET, { expiresIn: '1h' });
        res.json({ success: true, token, user: { id: user.id, name: user.name, mobile: user.mobile_number, kycStatus: user.kyc_verified ? 'verified' : 'pending' } });
    });
};
