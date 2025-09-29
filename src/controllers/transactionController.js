const db = require('../database');

// GET /api/transactions
exports.getTransactions = (req, res) => {
    const userId = req.user.id;
    const { type = 'all', from, to, limit = 50 } = req.query;

    let query = 'SELECT * FROM transactions WHERE user_id = ?';
    const params = [userId];

    if (type !== 'all') {
        query += ' AND transaction_type = ?';
        params.push(type);
    }

    if (from) {
        query += ' AND created_at >= ?';
        params.push(from);
    }
    if (to) {
        query += ' AND created_at <= ?';
        params.push(to);
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(parseInt(limit));

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: err.message });

        const transactions = rows.map(txn => ({
            id: txn.reference_number,
            type: txn.transaction_type,
            amount: txn.amount,
            status: txn.status,
            description: txn.description || '',
            timestamp: txn.created_at,
            closingBalance: txn.closing_balance || null
        }));

        res.json({ success: true, transactions });
    });
};

// GET /api/transactions/:id
exports.getTransactionById = (req, res) => {
    const userId = req.user.id;
    const txnId = req.params.id;

    db.get('SELECT * FROM transactions WHERE reference_number = ? AND user_id = ?', [txnId, userId], (err, txn) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        if (!txn) return res.status(404).json({ success: false, message: 'Transaction not found' });

        res.json({
            success: true,
            transaction: {
                id: txn.reference_number,
                type: txn.transaction_type,
                amount: txn.amount,
                status: txn.status,
                description: txn.description || '',
                timestamp: txn.created_at,
                closingBalance: txn.closing_balance || null
            }
        });
    });
};

// POST /api/transactions/:id/raise-dispute
exports.raiseDispute = (req, res) => {
    const userId = req.user.id;
    const txnId = req.params.id;
    const { reason } = req.body;

    if (!reason) return res.status(400).json({ success: false, message: 'Dispute reason required' });

    // Check transaction exists
    db.get('SELECT * FROM transactions WHERE reference_number = ? AND user_id = ?', [txnId, userId], (err, txn) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        if (!txn) return res.status(404).json({ success: false, message: 'Transaction not found' });

        // Insert dispute
        db.run(
            'INSERT INTO transaction_disputes (transaction_id, user_id, reason, status) VALUES (?, ?, ?, ?)',
            [txnId, userId, reason, 'pending'],
            function (err2) {
                if (err2) return res.status(500).json({ success: false, message: err2.message });
                res.json({ success: true, message: 'Dispute raised successfully', disputeId: this.lastID });
            }
        );
    });
};
