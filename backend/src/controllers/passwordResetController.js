const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const prisma = require('../config/database');
const { sendPasswordResetOtp } = require('../utils/mailer');
const { resolveAdminEmail, MAIL_INBOX_EMAIL } = require('../config/emails');

const OTP_TTL_MS = 15 * 60 * 1000;

function generateOtp() {
  return String(crypto.randomInt(100000, 999999));
}

async function ensureResetTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id INT NOT NULL AUTO_INCREMENT,
      email VARCHAR(191) NOT NULL,
      otpHash VARCHAR(191) NOT NULL,
      expiresAt DATETIME(3) NOT NULL,
      usedAt DATETIME(3) NULL,
      createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      PRIMARY KEY (id),
      INDEX password_reset_tokens_email_idx (email)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);
}

const forgotPassword = async (req, res) => {
  try {
    const email = String(req.body.email || '')
      .trim()
      .toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const adminEmail = resolveAdminEmail(email);

    const generic = {
      success: true,
      message: 'If that email is registered, a reset code has been sent.',
    };

    const user = await prisma.adminUser.findUnique({ where: { email: adminEmail } });
    if (!user || !user.isActive) {
      return res.json(generic);
    }

    await ensureResetTable();

    const recentCount = await prisma.passwordResetToken.count({
      where: {
        email: adminEmail,
        createdAt: { gt: new Date(Date.now() - OTP_TTL_MS) },
      },
    });
    if (recentCount >= 5) {
      return res.status(429).json({
        success: false,
        message: 'Too many reset attempts. Please wait 15 minutes and try again.',
      });
    }

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    await prisma.passwordResetToken.updateMany({
      where: { email: adminEmail, usedAt: null },
      data: { usedAt: new Date() },
    });

    await prisma.passwordResetToken.create({
      data: { email: adminEmail, otpHash, expiresAt },
    });

    try {
      await sendPasswordResetOtp(MAIL_INBOX_EMAIL, otp);
    } catch (mailErr) {
      console.error('Forgot password mail error:', mailErr.message);
      if (mailErr.code === 'SMTP_NOT_CONFIGURED') {
        return res.status(503).json({
          success: false,
          message:
            'Password reset email is not configured on the server yet. Contact the site owner.',
        });
      }
      return res.status(502).json({
        success: false,
        message: 'Could not send reset email. Try again later.',
      });
    }

    return res.json(generic);
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const email = String(req.body.email || '')
      .trim()
      .toLowerCase();
    const adminEmail = resolveAdminEmail(email);
    const otp = String(req.body.otp || '').trim();
    const newPassword = String(req.body.newPassword || req.body.password || '');

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP, and new password are required',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters',
      });
    }

    await ensureResetTable();

    const token = await prisma.passwordResetToken.findFirst({
      where: {
        email: adminEmail,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset code',
      });
    }

    const ok = await bcrypt.compare(otp, token.otpHash);
    if (!ok) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset code',
      });
    }

    const user = await prisma.adminUser.findUnique({ where: { email: adminEmail } });
    if (!user || !user.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset code',
      });
    }

    const password = await bcrypt.hash(newPassword, 10);
    await prisma.adminUser.update({
      where: { id: user.id },
      data: { password },
    });

    await prisma.passwordResetToken.update({
      where: { id: token.id },
      data: { usedAt: new Date() },
    });

    await prisma.passwordResetToken.updateMany({
      where: { email: adminEmail, usedAt: null },
      data: { usedAt: new Date() },
    });

    return res.json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

module.exports = { forgotPassword, resetPassword, ensureResetTable };
