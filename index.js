const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const bankAccountRoutes = require('./routes/bankAccounts');
const upiRoutes = require('./routes/upi');
const billRoutes = require('./routes/bills');
const rechargeRoutes = require('./routes/recharge');
const walletRoutes = require('./routes/wallet');
const transactionRoutes = require('./routes/transactions');
const contactRoutes = require('./routes/contacts');
const merchantRoutes = require('./routes/merchant');
const securityRoutes = require('./routes/security');

const app = express();
app.use(bodyParser.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bank-accounts', bankAccountRoutes);
app.use('/api/upi', upiRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/recharge', rechargeRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/merchant', merchantRoutes);
app.use('/api/security', securityRoutes);

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
