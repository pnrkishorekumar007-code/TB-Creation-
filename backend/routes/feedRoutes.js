const express = require('express');
const { getMyFeed } = require('../controllers/feedController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.get('/', protect, getMyFeed);

module.exports = router;
