const nodemailer = require('nodemailer');

function smtpConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
  );
}

function createTransport() {
  const port = Number(process.env.SMTP_PORT || 465);
  const secure =
    process.env.SMTP_SECURE === 'true' ||
    process.env.SMTP_SECURE === '1' ||
    port === 465;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/**
 * Send password-reset OTP email.
 * Requires SMTP_* env on cPanel (or EMAIL_DEV_LOG=true to print OTP in logs only).
 */
async function sendPasswordResetOtp(toEmail, otp) {
  const subject = 'Gindeberet Admin — password reset code';
  const text = `Your password reset code is: ${otp}\n\nThis code expires in 15 minutes.\nIf you did not request this, ignore this email.`;
  const html = `
    <p>Your password reset code is:</p>
    <p style="font-size:28px;font-weight:700;letter-spacing:4px;">${otp}</p>
    <p>This code expires in <strong>15 minutes</strong>.</p>
    <p>If you did not request this, you can ignore this email.</p>
  `;

  if (process.env.EMAIL_DEV_LOG === 'true' || process.env.EMAIL_DEV_LOG === '1') {
    console.log(`[EMAIL_DEV_LOG] OTP for ${toEmail}: ${otp}`);
  }

  if (!smtpConfigured()) {
    if (process.env.EMAIL_DEV_LOG === 'true' || process.env.EMAIL_DEV_LOG === '1') {
      return { queued: true, mode: 'dev-log' };
    }
    const err = new Error(
      'Email is not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS on the server.'
    );
    err.code = 'SMTP_NOT_CONFIGURED';
    throw err;
  }

  const from =
    process.env.SMTP_FROM ||
    process.env.SMTP_USER ||
    'noreply@gindeberetconstruction.com';

  const transport = createTransport();
  await transport.sendMail({
    from,
    to: toEmail,
    subject,
    text,
    html,
  });

  return { queued: true, mode: 'smtp' };
}

module.exports = {
  sendPasswordResetOtp,
  smtpConfigured,
};
