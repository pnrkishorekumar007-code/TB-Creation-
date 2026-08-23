const express = require('express');
const { createScript, submitScriptForReview, getScripts, getScriptById, getMyScripts } = require('../controllers/scriptController');
const { protect, requireRole, optionalAuth } = require('../middleware/auth');
const { uploadScript } = require('../middleware/upload');

const router = express.Router();

router.get('/', getScripts);
router.get('/mine', protect, requireRole('author', 'admin'), getMyScripts);
router.get('/:id', optionalAuth, getScriptById);
router.post('/', protect, requireRole('author', 'admin'), uploadScript.single('file'), createScript);
router.put('/:id/submit', protect, requireRole('author', 'admin'), submitScriptForReview);

module.exports = router;
