const db = require('../database');
const bcrypt = require('bcrypt');

// GET /api/wallet/balance
exports.getBalance = (req, res) => {
    const userId = req.user.id;

    db.get('SELECT balance FROM wallet WHERE user_id = ?', [userId], (err, wallet) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        if (!wallet) return res.status(404).json({ success: false, message: 'Wallet not found' });

        res.json({ success: true, balance: wallet.balance });
    });
};

// POST /api/wallet/add-money
exports.addMoney = (req, res) => {
    const { amount, sourceAccountId, pin } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) return res.status(400).json({ success: false, message: 'Invalid amount' });

    // Verify PIN
    db.get('SELECT pin FROM users WHERE id = ?', [userId], (err, user) => {
        if (err || !user) return res.status(400).json({ success: false, message: 'User not found' });
        if (!bcrypt.compareSync(pin, user.pin)) return res.status(400).json({ success: false, message: 'Invalid PIN' });

        // Check source bank account
        db.get('SELECT * FROM bank_accounts WHERE id = ? AND user_id = ? AND verified = 1', [sourceAccountId, userId], (err2, account) => {
            if (err2 || !account) return res.status(400).json({ success: false, message: 'Bank account not found or not verified' });

            // Update wallet balance
            db.get('SELECT * FROM wallet WHERE user_id = ?', [userId], (err3, wallet) => {
                if (err3) return res.status(500).json({ success: false, message: err3.message });
                let newBalance = amount;
                if (wallet) {
                    newBalance += wallet.balance;
                    db.run('UPDATE wallet SET balance = ? WHERE user_id = ?', [newBalance, userId]);
                } else {
                    db.run('INSERT INTO wallet (user_id, balance) VALUES (?, ?)', [userId, amount]);
                }

                // Save wallet transaction
                db.run(
                    'INSERT INTO wallet_transactions (wallet_id, type, amount) VALUES ((SELECT id FROM wallet WHERE user_id = ?), ?, ?)',
                    [userId, 'add_money', amount]
                );

                res.json({ success: true, balance: newBalance, message: 'Money added successfully' });
            });
        });
    });
};

// GET /api/wallet/transactions
exports.getTransactions = (req, res) => {
    const userId = req.user.id;

    db.get('SELECT id FROM wallet WHERE user_id = ?', [userId], (err, wallet) => {
        if (err || !wallet) return res.status(404).json({ success: false, message: 'Wallet not found' });

        db.all('SELECT * FROM wallet_transactions WHERE wallet_id = ? ORDER BY created_at DESC', [wallet.id], (err2, rows) => {
            if (err2) return res.status(500).json({ success: false, message: err2.message });
            res.json({ success: true, transactions: rows });
        });
    });
};
