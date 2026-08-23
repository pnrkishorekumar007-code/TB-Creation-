const express = require('express');
const { getAuthorProfile, updateMyProfile } = require('../controllers/authorController');
const { protect } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');

const router = express.Router();

router.get('/:id', getAuthorProfile);
router.put('/me', protect, uploadAvatar.single('avatar'), updateMyProfile);

module.exports = router;
