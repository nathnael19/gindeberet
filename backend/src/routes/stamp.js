const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const stampController = require('../controllers/stampController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { ensureUploadDir } = require('../config/uploads');

const uploadDir = ensureUploadDir();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '-');
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  },
});

const stampFileFilter = (_req, file, cb) => {
  const field = file.fieldname;
  const ext = path.extname(file.originalname || '').toLowerCase();
  if (field === 'document') {
    if (ext === '.pdf' || file.mimetype === 'application/pdf') return cb(null, true);
    return cb(new Error('Document must be a PDF'));
  }
  if (field === 'stamp' || field === 'signature') {
    if (/\.(png|jpe?g|webp)$/i.test(ext) || /^image\/(png|jpeg|webp)$/i.test(file.mimetype)) {
      return cb(null, true);
    }
    return cb(new Error(`${field} must be an image (PNG/JPG/WEBP)`));
  }
  return cb(new Error('Unexpected upload field'));
};

const stampUpload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: stampFileFilter,
});

router.post(
  '/apply',
  authenticate,
  requireAdmin,
  (req, res, next) => {
    stampUpload.fields([
      { name: 'document', maxCount: 1 },
      { name: 'stamp', maxCount: 1 },
      { name: 'signature', maxCount: 1 },
    ])(req, res, (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
      next();
    });
  },
  stampController.applyStamp
);

router.get('/signatures', authenticate, requireAdmin, stampController.listSignatures);

router.post(
  '/signatures',
  authenticate,
  requireAdmin,
  (req, res, next) => {
    stampUpload.single('signature')(req, res, (err) => {
      if (err) return res.status(400).json({ success: false, message: err.message });
      if (req.file && !/\.(png|jpe?g|webp)$/i.test(req.file.originalname)) {
        return res.status(400).json({ success: false, message: 'Signature must be an image (PNG/JPG)' });
      }
      next();
    });
  },
  stampController.saveSignature
);

router.delete('/signatures/:id', authenticate, requireAdmin, stampController.deleteSignature);

router.get('/download/:id', authenticate, requireAdmin, stampController.downloadStamped);

module.exports = router;
