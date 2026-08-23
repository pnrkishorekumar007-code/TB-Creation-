const express = require('express');
const { toggleBookmark, getMyBookmarks } = require('../controllers/bookmarkController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);
router.post('/toggle', toggleBookmark);
router.get('/mine', getMyBookmarks);

module.exports = router;
