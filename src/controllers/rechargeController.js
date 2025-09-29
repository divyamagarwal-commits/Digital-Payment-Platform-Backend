const db = require('../database');
const bcrypt = require('bcrypt');

// GET /api/recharge/operators
exports.getOperators = (req, res) => {
    db.all('SELECT DISTINCT operator FROM mobile_recharge_plans', [], (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        const operators = rows.map(r => r.operator);
        res.json({ success: true, operators });
    });
};

// GET /api/recharge/plans
exports.getPlans = (req, res) => {
    const { operator, circle, type } = req.query;
    let query = 'SELECT * FROM mobile_recharge_plans WHERE 1=1';
    const params = [];

    if (operator) {
        query += ' AND operator = ?';
        params.push(operator);
    }
    if (circle) {
        query += ' AND circle = ?';
        params.push(circle);
    }
    if (type) {
        query += ' AND type = ?';
        params.push(type);
    }

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, plans: rows });
    });
};

// POST /api/recharge/mobile
exports.rechargeMobile = (req, res) => {
    const { mobile, operator, circle, planId, amount, pin } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) return res.status(400).json({ success: false, message: 'Invalid amount' });

    // Verify PIN
    db.get('SELECT pin FROM users WHERE id = ?', [userId], (err, user) => {
        if (err || !user) return res.status(400).jso
