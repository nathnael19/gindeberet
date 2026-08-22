/** Shown on the public website (contact page, footer, home). */
const PUBLIC_CONTACT_EMAIL = 'gindeberetconstruction278@gmail.com';

/** Gmail account used to send mail + receive contact form & admin OTP. */
const MAIL_INBOX_EMAIL = (
  process.env.CONTACT_TO_EMAIL ||
  process.env.SMTP_USER ||
  'gindeberetconstructionplc@gmail.com'
).toLowerCase();

/** Default admin login (forgot-password OTP goes here). Override with ADMIN_EMAIL on server. */
const DEFAULT_ADMIN_EMAIL = (
  process.env.ADMIN_EMAIL || 'gindeberetconstructionplc@gmail.com'
).toLowerCase();

/** Map public contact email → admin inbox for login / OTP. */
function resolveAdminEmail(input) {
  const email = String(input || '')
    .trim()
    .toLowerCase();
  if (email === PUBLIC_CONTACT_EMAIL.toLowerCase()) {
    return MAIL_INBOX_EMAIL;
  }
  return email;
}

module.exports = {
  PUBLIC_CONTACT_EMAIL,
  MAIL_INBOX_EMAIL,
  DEFAULT_ADMIN_EMAIL,
  resolveAdminEmail,
};
