const db = require('../database');
const bcrypt = require('bcrypt');

// GET /api/billers
exports.getBillers = (req, res) => {
    const { category, state } = req.query;
    let query = 'SELECT * FROM billers WHERE 1=1';
    const params = [];

    if (category) {
        query += ' AND category = ?';
        params.push(category);
    }
    if (state) {
        query += ' AND state = ?';
        params.push(state);
    }

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, billers: rows });
    });
};

// POST /api/bills/fetch
exports.fetchBill = (req, res) => {
    const { billerId, parameters } = req.body;

    db.get('SELECT * FROM billers WHERE id = ?', [billerId], (err, biller) => {
        if (err || !biller) return res.status(400).json({ success: false, message: 'Biller not found' });

        // Mock bill details (in real system, call API of biller)
        const bill = {
            amount: Math.floor(Math.random() * 2000) + 500, // random amount
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            billDate: new Date().toISOString().split('T')[0],
            consumerName: 'John Doe',
            billNumber: `BILL${Date.now()}`
        };

        res.json({ success: true, bill });
    });
};

// POST /api/bills/pay
exports.payBill = (req, res) => {
    const { billerId, amount, parameters, pin } = req.body;
    const userId = req.user.id;

    // Verify PIN
    db.get('SELECT pin FROM users WHERE id = ?', [userId], (err, user) => {
        if (err || !user) return res.status(400).json({ success: false, message: 'User not found' });
        if (!bcrypt.compareSync(pin, user.pin)) return res.status(400).json({ success: false, message: 'Invalid PIN' });

        // Check wallet balance
        db.get('SELECT * FROM wallet WHERE user_id = ?', [userId], (err2, wallet) => {
            if (err2 || !wallet) return res.status(400).json({ success: false, message: 'Wallet not found' });
            if (wallet.balance < amount) return res.status(400).json({ success: false, message: 'Insufficient balance' });

            const newBalance = wallet.balance - amount;
            db.run('UPDATE wallet SET balance = ? WHERE user_id = ?', [newBalance, userId]);

            // Create transaction
            const txnRef = `TXN${Date.now()}`;
            db.run(
                'INSERT INTO transactions (user_id, transaction_type, amount, status, reference_number) VALUES (?, ?, ?, ?, ?)',
                [userId, 'bill_payment', amount, 'success', txnRef],
                function (err3) {
                    if (err3) return res.status(500).json({ success: false, message: err3.message });

                    // Save bill payment history
                    db.run(
                        'INSERT INTO bill_payments (user_id, biller_id, amount, status, transaction_id) VALUES (?, ?, ?, ?, ?)',
                        [userId, billerId, amount, 'success', this.lastID]
                    );

                    res.json({
                        success: true,
                        transactionId: txnRef,
                        status: 'success',
                        amount,
                        timestamp: new Date().toISOString(),
                        note: 'Bill payment'
                    });
                }
            );
        });
    });
};
