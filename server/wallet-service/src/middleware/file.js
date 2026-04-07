-- Create user_wallets table
CREATE TABLE IF NOT EXISTS user_wallets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(50) NOT NULL UNIQUE,
  balance DECIMAL(10,2) DEFAULT 0,
  total_deposited DECIMAL(10,2) DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  total_bonus DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id)
);

-- Create wallet_transactions table
CREATE TABLE IF NOT EXISTS wallet_transactions (
  transaction_id VARCHAR(100) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  type ENUM('deposit', 'endorsement', 'bonus', 'refund') NOT NULL,
  reference_id VARCHAR(100),
  description TEXT,
  status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
  mpesa_receipt VARCHAR(50),
  mpesa_phone VARCHAR(15),
  checkout_request_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_type (type),
  INDEX idx_status (status)
);

-- Add dummy points to your user
INSERT INTO user_wallets (user_id, balance, total_deposited)
VALUES ('USR-80c0410e-6ee2', 1000, 1000)
ON DUPLICATE KEY UPDATE 
    balance = balance + 1000,
    total_deposited = total_deposited + 1000;

-- Add transaction record
INSERT INTO wallet_transactions 
(transaction_id, user_id, amount, type, description, status, completed_at)
VALUES (
    CONCAT('ADMIN-', UNIX_TIMESTAMP()),
    'USR-80c0410e-6ee2',
    1000,
    'deposit',
    'Welcome bonus: 1000 points',
    'completed',
    NOW()
);

-- Verify
SELECT * FROM user_wallets WHERE user_id = 'USR-80c0410e-6ee2';
SELECT * FROM wallet_transactions WHERE user_id = 'USR-80c0410e-6ee2';