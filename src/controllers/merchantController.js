const db = require('../database');
const QRCode = require('qrcode');

// POST /api/merchant/register
exports.registerMerchant = (req, res) => {
    const userId = req.user.id;
    const { businessName, panNumber, bankAccountId } = req.body;

    if (!businessName || !panNumber || !bankAccountId) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    db.run(
        'INSERT INTO merchants (user_id, business_name, pan_number, bank_account_id) VALUES (?, ?, ?, ?)',
        [userId, businessName, panNumber, bankAccountId],
        function (err) {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true, message: 'Merchant registered', merchantId: this.lastID });
        }
    );
};

// POST /api/merchant/generate-qr
exports.generateQR = async (req, res) => {
    const userId = req.user.id;
    const { amount, description } = req.body;

    if (!amount || amount <= 0) return res.status(400).json({ success: false, message: 'Invalid amount' });

    // Generate UPI QR data (mock)
    const qrData = `upi://pay?pa=merchant${userId}@platform&pn=Merchant&am=${amount}&tn=${description}`;

    try {
        const qrCodeImage = await QRCode.toDataURL(qrData);
        res.json({ success: true, qrCode: qrCodeImage, qrData });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/merchant/settlements
exports.getSettlements = (req, res) => {
    const userId = req.user.id;

    db.all(
        'SELECT * FROM merchant_settlements WHERE merchant_id = (SELECT id FROM merchants WHERE user_id = ?)',
        [userId],
        (err, rows) => {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true, settlements: rows });
        }
    );
};
