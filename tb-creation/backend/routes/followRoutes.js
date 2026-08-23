const express = require('express');
const { toggleFollow, getFollowStatus } = require('../controllers/followController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);
router.post('/toggle', toggleFollow);
router.get('/status/:authorId', getFollowStatus);

module.exports = router;
