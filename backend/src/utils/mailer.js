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

async function sendMail({ to, subject, text, html, replyTo }) {
  if (process.env.EMAIL_DEV_LOG === 'true' || process.env.EMAIL_DEV_LOG === '1') {
    console.log('[EMAIL_DEV_LOG]', { to, subject, text, replyTo });
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
    'gindeberetconstruction278@gmail.com';

  const transport = createTransport();
  await transport.sendMail({
    from,
    to,
    subject,
    text,
    html,
    replyTo: replyTo || undefined,
  });

  return { queued: true, mode: 'smtp' };
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

  return sendMail({ to: toEmail, subject, text, html });
}

/**
 * Forward public contact-form submissions to the company inbox.
 */
async function sendContactFormEmail(payload) {
  const to =
    process.env.CONTACT_TO_EMAIL ||
    'gindeberetconstruction278@gmail.com';

  const {
    firstName,
    lastName,
    email,
    projectType,
    message,
  } = payload;

  const subject = `Website contact: ${firstName} ${lastName}${projectType ? ` (${projectType})` : ''}`;
  const text = [
    'New message from gindeberetconstruction.com contact form',
    '',
    `Name: ${firstName} ${lastName}`,
    `Email: ${email}`,
    `Project type: ${projectType || '—'}`,
    '',
    'Message:',
    message,
  ].join('\n');

  const html = `
    <h2>New website contact message</h2>
    <p><strong>Name:</strong> ${escapeHtml(firstName)} ${escapeHtml(lastName)}</p>
    <p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
    <p><strong>Project type:</strong> ${escapeHtml(projectType || '—')}</p>
    <p><strong>Message:</strong></p>
    <pre style="white-space:pre-wrap;font-family:inherit;">${escapeHtml(message)}</pre>
  `;

  return sendMail({
    to,
    subject,
    text,
    html,
    replyTo: email,
  });
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = {
  sendPasswordResetOtp,
  sendContactFormEmail,
  smtpConfigured,
  sendMail,
};
