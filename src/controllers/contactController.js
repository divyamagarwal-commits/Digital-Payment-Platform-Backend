const db = require('../database');

// POST /api/contacts/add
exports.addContact = (req, res) => {
    const userId = req.user.id;
    const { name, upiId, mobile } = req.body;

    if (!name || !upiId || !mobile) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Insert contact
    db.run(
        'INSERT INTO contacts (user_id, name, upi_id, mobile_number) VALUES (?, ?, ?, ?)',
        [userId, name, upiId, mobile],
        function (err) {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true, message: 'Contact added successfully', contactId: this.lastID });
        }
    );
};

// GET /api/contacts
exports.getContacts = (req, res) => {
    const userId = req.user.id;

    db.all('SELECT id, name, upi_id, mobile_number FROM contacts WHERE user_id = ?', [userId], (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, contacts: rows });
    });
};
