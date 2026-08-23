const express = require('express');
const { recordProgress, getContinueReading } = require('../controllers/readingHistoryController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);
router.post('/', recordProgress);
router.get('/continue', getContinueReading);

module.exports = router;
