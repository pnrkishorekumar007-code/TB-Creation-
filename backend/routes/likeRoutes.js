const express = require('express');
const { toggleLike, getLikeStatus } = require('../controllers/likeController');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();
router.post('/toggle', protect, toggleLike);
router.get('/status', optionalAuth, getLikeStatus);

module.exports = router;
