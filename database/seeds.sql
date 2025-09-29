-- Users
INSERT INTO users (name, mobile_number, email, kyc_verified, pin) VALUES
('Alice', '9999000001', 'alice@example.com', TRUE, '1234'),
('Bob', '9999000002', 'bob@example.com', FALSE, '5678');

-- Bank Accounts
INSERT INTO bank_accounts (user_id, account_number, ifsc_code, bank_name, is_primary, verified) VALUES
(1, '1234567890', 'SBIN0001111', 'SBI', TRUE, TRUE),
(1, '0987654321', 'HDFC0002222', 'HDFC', FALSE, FALSE),
(2, '1122334455', 'ICIC0003333', 'ICICI', TRUE, TRUE);

-- UPI IDs
INSERT INTO upi_ids (user_id, bank_account_id, upi_id, status) VALUES
(1, 1, 'alice@upi', 'active'),
(1, 2, 'alice.work@upi', 'inactive'),
(2, 3, 'bob@upi', 'active');

-- Contacts
INSERT INTO contacts (user_id, name, mobile_number, verified) VALUES
(1, 'Bob', '9999000002', TRUE),
(2, 'Alice', '9999000001', TRUE);

-- Wallets
INSERT INTO wallet (user_id, balance) VALUES
(1, 5000),
(2, 2000);

-- Transaction Limits
INSERT INTO transaction_limits (user_id, daily_limit, monthly_limit, per_transaction_limit) VALUES
(1, 10000, 50000, 5000),
(2, 5000, 20000, 3000);

-- Billers
INSERT INTO billers (name, category, biller_code, parameters) VALUES
('Electricity Board', 'electricity', 'ELEC123', '{"consumer_number":"string"}'),
('Water Supply', 'water', 'WATR456', '{"consumer_number":"string"}');

-- Merchants
INSERT INTO merchants (name, qr_code) VALUES
('Shop A', 'QR123ABC'),
('Cafe B', 'QR456DEF');
