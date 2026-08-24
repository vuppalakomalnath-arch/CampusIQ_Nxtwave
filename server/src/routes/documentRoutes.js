const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const env = require('../config/env');

// Ensure upload directory exists
const uploadDir = env.STORAGE_LOCAL_PATH;
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExts = ['.pdf', '.docx', '.txt', '.md'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only .pdf, .docx, .txt, and .md files are supported'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.MAX_UPLOAD_SIZE_MB * 1024 * 1024,
  },
});

// Admin-only document routes
router.use(protect, authorize('admin', 'faculty'));

router.get('/', documentController.listDocuments);
router.post('/upload', upload.single('file'), documentController.uploadDocument);
router.get('/:id', documentController.getDocument);
router.put('/:id', documentController.updateDocument);
router.delete('/:id', documentController.deleteDocument);
router.post('/:id/reprocess', documentController.reprocessDocument);
router.get('/:id/versions', documentController.getVersions);
router.post('/:id/versions', upload.single('file'), documentController.uploadNewVersion);
router.post('/:id/restore/:versionId', documentController.restoreVersion);

module.exports = router;
