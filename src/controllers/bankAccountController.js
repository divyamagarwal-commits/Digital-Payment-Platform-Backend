const db = require('../database');

// POST /api/bank-accounts/link
exports.linkBankAccount = (req, res) => {
    const { accountNumber, ifscCode, accountHolderName } = req.body;
    const userId = req.user.id;
    const verificationId = `VER${Date.now()}`;

    db.run(
        'INSERT INTO bank_accounts (user_id, account_number, ifsc_code, bank_name, is_primary, verified) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, accountNumber, ifscCode, accountHolderName, false, false],
        function (err) {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.json({
                success: true,
                message: 'Account verification in progress',
                accountId: this.lastID,
                verificationId
            });
        }
    );
};

// GET /api/bank-accounts
exports.getBankAccounts = (req, res) => {
    const userId = req.user.id;
    db.all('SELECT id, account_number, ifsc_code, bank_name, is_primary, verified FROM bank_accounts WHERE user_id = ?', [userId], (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, bankAccounts: rows });
    });
};

// PUT /api/bank-accounts/:id/set-primary
exports.setPrimaryAccount = (req, res) => {
    const userId = req.user.id;
    const accountId = req.params.id;

    // Reset other accounts
    db.run('UPDATE bank_accounts SET is_primary = 0 WHERE user_id = ?', [userId], function (err) {
        if (err) return res.status(500).json({ success: false, message: err.message });

        // Set selected account as primary
        db.run('UPDATE bank_accounts SET is_primary = 1 WHERE id = ? AND user_id = ?', [accountId, userId], function (err2) {
            if (err2) return res.status(500).json({ success: false, message: err2.message });
            res.json({ success: true, message: 'Primary account updated' });
        });
    });
};

// DELETE /api/bank-accounts/:id
exports.deleteBankAccount = (req, res) => {
    const userId = req.user.id;
    const accountId = req.params.id;

    db.run('DELETE FROM bank_accounts WHERE id = ? AND user_id = ?', [accountId, userId], function (err) {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, message: 'Bank account removed' });
    });
};
