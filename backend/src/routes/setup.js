const express = require('express');
const { fixPublicContent } = require('../services/fixPublicContent');

const router = express.Router();

function readSetupSecret(req) {
  const header = req.get('x-setup-secret') || '';
  const auth = req.get('authorization') || '';
  if (header) return header.trim();
  if (auth.toLowerCase().startsWith('bearer ')) {
    return auth.slice(7).trim();
  }
  return '';
}

/**
 * POST /api/setup/fix-content
 * Header: x-setup-secret: <SETUP_SECRET>
 * Called by GitHub Actions after deploy (same Prisma process as /health).
 */
router.post('/fix-content', async (req, res) => {
  const expected = (process.env.SETUP_SECRET || '').trim();
  if (!expected) {
    return res.status(503).json({
      success: false,
      message: 'SETUP_SECRET is not configured on the server',
    });
  }

  const provided = readSetupSecret(req);
  if (!provided || provided !== expected) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const result = await fixPublicContent();
    return res.json({
      success: true,
      message: 'Awards and projects updated',
      data: result,
    });
  } catch (err) {
    console.error('fix-content failed:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'fix-content failed',
    });
  }
});

module.exports = router;
