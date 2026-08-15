const express = require('express');
const { sendContactFormEmail } = require('../utils/mailer');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const firstName = String(req.body.firstName || '').trim();
    const lastName = String(req.body.lastName || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const projectType = String(req.body.projectType || '').trim();
    const message = String(req.body.message || '').trim();

    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, email, and message are required',
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Enter a valid email address',
      });
    }

    if (message.length > 5000) {
      return res.status(400).json({
        success: false,
        message: 'Message is too long',
      });
    }

    await sendContactFormEmail({
      firstName,
      lastName,
      email,
      projectType,
      message,
    });

    return res.json({
      success: true,
      message: 'Message sent successfully',
    });
  } catch (err) {
    console.error('Contact form error:', err.message);
    if (err.code === 'SMTP_NOT_CONFIGURED') {
      return res.status(503).json({
        success: false,
        message:
          'Contact email is not configured on the server yet. Please call or email us directly.',
      });
    }
    return res.status(502).json({
      success: false,
      message: 'Could not send your message. Please try again later.',
    });
  }
});

module.exports = router;
