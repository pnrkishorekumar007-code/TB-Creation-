const express = require('express');
const { toggleFollow, getFollowStatus, getFollowCounts } = require('../controllers/followController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/count/:authorId', getFollowCounts);
router.post('/toggle', protect, toggleFollow);
router.get('/status/:authorId', protect, getFollowStatus);

module.exports = router;