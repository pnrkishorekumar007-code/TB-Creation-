const express = require('express');
const { createComic, submitComicForReview, updateComic, deleteComic, getComics, getComicById, getMyComics, addChapter } = require('../controllers/comicController');
const { protect, requireRole, optionalAuth } = require('../middleware/auth');
const { uploadCover, uploadPages, validateImages } = require('../middleware/upload');

const router = express.Router();

router.get('/', getComics);
router.get('/mine', protect, requireRole('author', 'admin'), getMyComics);
router.get('/:id', optionalAuth, getComicById);
router.post('/', protect, requireRole('author', 'admin'), uploadCover.single('cover'), validateImages, createComic);
router.put('/:id', protect, requireRole('author', 'admin'), uploadCover.single('cover'), validateImages, updateComic);
router.put('/:id/submit', protect, requireRole('author', 'admin'), submitComicForReview);
router.delete('/:id', protect, requireRole('author', 'admin'), deleteComic);
router.post('/:id/chapters', protect, requireRole('author', 'admin'), uploadPages.array('pages', 50), validateImages, addChapter);

module.exports = router;
