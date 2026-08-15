-- Admin account (no Prisma / no cPanel Run JS)
-- phpMyAdmin → gindebsx_gindeberet_db → Import / SQL

-- Deactivate legacy admin
UPDATE admin_users
SET isActive = 0, updatedAt = NOW(3)
WHERE email = 'admin@gindeberet.com';

-- Upsert production admin
INSERT INTO admin_users (email, password, firstName, lastName, role, isActive, createdAt, updatedAt)
VALUES (
  'gindeberetconstruction278@gmail.com',
  '$2a$10$fKZ9yI/gYqWgU8gTuNY3z.1Fj.UmmB3iK8do/38tyE93wQJau4ZmG',
  'Admin',
  'Gindeberet',
  'SUPER_ADMIN',
  1,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  password = VALUES(password),
  firstName = VALUES(firstName),
  lastName = VALUES(lastName),
  role = 'SUPER_ADMIN',
  isActive = 1,
  updatedAt = NOW(3);

-- OTP table (forgot password)
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INT NOT NULL AUTO_INCREMENT,
  email VARCHAR(191) NOT NULL,
  otpHash VARCHAR(191) NOT NULL,
  expiresAt DATETIME(3) NOT NULL,
  usedAt DATETIME(3) NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  INDEX password_reset_tokens_email_idx (email)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
