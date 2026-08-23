const express = require('express');
const { createComic, submitComicForReview, getComics, getComicById, getMyComics, addChapter } = require('../controllers/comicController');
const { protect, requireRole, optionalAuth } = require('../middleware/auth');
const { uploadCover, uploadPages } = require('../middleware/upload');

const router = express.Router();

router.get('/', getComics);
router.get('/mine', protect, requireRole('author', 'admin'), getMyComics);
router.get('/:id', optionalAuth, getComicById);
router.post('/', protect, requireRole('author', 'admin'), uploadCover.single('cover'), createComic);
router.post('/:id/chapters', protect, requireRole('author', 'admin'), uploadPages.array('pages', 50), addChapter);
router.put('/:id/submit', protect, requireRole('author', 'admin'), submitComicForReview);

module.exports = router;
