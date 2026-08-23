const express = require('express');
const { rateComic, getComicRatings } = require('../controllers/ratingController');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();
router.post('/', protect, rateComic);
router.get('/comic/:comicId', optionalAuth, getComicRatings);

module.exports = router;
