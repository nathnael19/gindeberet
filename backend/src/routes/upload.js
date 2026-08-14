const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '-');
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

// Upload single image (admin only)
router.post('/image', authenticate, requireAdmin, (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      // Handle multer errors
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File size exceeds 10MB limit'
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      // Handle other errors
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Return the URL to access the uploaded file
    const fileUrl = `/uploads/${req.file.filename}`;
    
    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      }
    });
  });
});

// Upload multiple images (admin only)
router.post('/images', authenticate, requireAdmin, (req, res) => {
  upload.array('images', 10)(req, res, (err) => {
    if (err) {
      // Handle multer errors
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File size exceeds 10MB limit'
          });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            message: 'Maximum 10 files allowed'
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      // Handle other errors
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const files = req.files.map(file => ({
      url: `/uploads/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size
    }));

    res.json({
      success: true,
      message: 'Files uploaded successfully',
      data: files
    });
  });
});

// Document upload (CV / PDF / DOC)
const documentFilter = (req, file, cb) => {
  const allowedExt = /pdf|doc|docx|jpeg|jpg|png/;
  const allowedMime = /pdf|msword|officedocument|jpeg|jpg|png/;
  const extname = allowedExt.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedMime.test(file.mimetype);
  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error('Only PDF, DOC, DOCX, or image files are allowed for documents'));
};

const uploadDocument = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: documentFilter,
});

router.post('/document', (req, res) => {
  uploadDocument.single('document')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File size exceeds 8MB limit',
          });
        }
        return res.status(400).json({ success: false, message: err.message });
      }
      return res.status(400).json({ success: false, message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    res.json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        url: `/uploads/${req.file.filename}`,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
      },
    });
  });
});

// Delete image (admin only)
router.delete('/image/:filename', authenticate, requireAdmin, (req, res) => {
  try {
    const filename = path.basename(req.params.filename || '');
    if (!filename || filename === '.' || filename === '..') {
      return res.status(400).json({ success: false, message: 'Invalid filename' });
    }

    const filePath = path.resolve(uploadDir, filename);
    if (!filePath.startsWith(path.resolve(uploadDir) + path.sep)) {
      return res.status(400).json({ success: false, message: 'Invalid filename' });
    }

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return res.json({
        success: true,
        message: 'File deleted successfully',
      });
    }

    return res.status(404).json({
      success: false,
      message: 'File not found',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error deleting file',
      error: error.message,
    });
  }
});

module.exports = router;