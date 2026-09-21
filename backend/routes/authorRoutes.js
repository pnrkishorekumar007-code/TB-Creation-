const express = require('express');
const { getAuthorProfile, getAuthors, updateMyProfile, upgradeToAuthor } = require('../controllers/authorController');
const { protect } = require('../middleware/auth');
const { uploadAvatar, validateImages } = require('../middleware/upload');

const router = express.Router();

router.get('/', getAuthors);
router.get('/:id', getAuthorProfile);
router.put('/me', protect, uploadAvatar.single('avatar'), validateImages, updateMyProfile);
router.put('/me/upgrade', protect, upgradeToAuthor);

module.exports = router;