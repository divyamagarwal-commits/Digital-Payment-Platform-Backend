const db = require('../database');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

// POST /api/upi/create-id
exports.createUpiId = (req, res) => {
    const { upiId, bankAccountId } = req.body;
    const userId = req.user.id;

    // Check if bank account belongs to user
    db.get('SELECT * FROM bank_accounts WHERE id = ? AND user_id = ?', [bankAccountId, userId], (err, account) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        if (!account) return res.status(400).json({ success: false, message: 'Bank account not found' });

        // Create UPI ID
        db.run(
            'INSERT INTO upi_ids (user_id, bank_account_id, upi_id, status) VALUES (?, ?, ?, ?)',
            [userId, bankAccountId, upiId, 'active'],
            function (err2) {
                if (err2) return res.status(500).json({ success: false, message: err2.message });
                res.json({ success: true, upiId, message: 'UPI ID created successfully' });
            }
        );
    });
};

// POST /api/upi/send
exports.sendMoney = (req, res) => {
    const { recipientUpiId, amount, pin, note } = req.body;
    const senderId = req.user.id;

    if (!amount || amount <= 0) return res.status(400).json({ success: false, message: 'Invalid amount' });

    // Verify PIN
    db.get('SELECT pin FROM users WHERE id = ?', [senderId], (err, user) => {
        if (err || !user) return res.status(400).json({ success: false, message: 'User not found' });
        if (!bcrypt.compareSync(pin, user.pin)) return res.status(400).json({ success: false, message: 'Invalid PIN' });

        // Check recipient exists
        db.get('SELECT * FROM upi_ids WHERE upi_id = ? AND status = ?', [recipientUpiId, 'active'], (err2, recipient) => {
            if (err2 || !recipient) return res.status(400).json({ success: false, message: 'Recipient not found' });

            // Deduct amount from sender wallet
            db.get('SELECT * FROM wallet WHERE user_id = ?', [senderId], (err3, wallet) => {
                if (err3 || !wallet) return res.status(400).json({ success: false, message: 'Wallet not found' });
                if (wallet.balance < amount) return res.status(400).json({ success: false, message: 'Insufficient balance' });

                const newBalance = wallet.balance - amount;
                db.run('UPDATE wallet SET balance = ? WHERE user_id = ?', [newBalance, senderId]);

                // Add amount to recipient wallet
                db.get('SELECT * FROM wallet WHERE user_id = ?', [recipient.user_id], (err4, recipientWallet) => {
                    if (!recipientWallet) {
                        db.run('INSERT INTO wallet (user_id, balance) VALUES (?, ?)', [recipient.user_id, amount]);
                    } else {
                        db.run('UPDATE wallet SET balance = ? WHERE user_id = ?', [recipientWallet.balance + amount, recipient.user_id]);
                    }

                    // Create transaction record
                    const transactionId = `TXN${Date.now()}`;
                    db.run(
                        'INSERT INTO transactions (user_id, transaction_type, amount, status, reference_number) VALUES (?, ?, ?, ?, ?)',
                        [senderId, 'upi', amount, 'success', transactionId],
                        () => {
                            res.json({
                                success: true,
                                transactionId,
                                status: 'success',
                                amount,
                                timestamp: new Date().toISOString(),
                                note
                            });
                        }
                    );
                });
            });
        });
    });
};

// POST /api/upi/request
exports.requestMoney = (req, res) => {
    const { payerUpiId, amount, note, expiryMinutes } = req.body;
    const requesterId = req.user.id;

    if (!amount || amount <= 0) return res.status(400
