const express = require('express');
const { addComment, getComments, deleteComment } = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.get('/comic/:comicId', getComments);
router.post('/', protect, addComment);
router.delete('/:id', protect, deleteComment);

module.exports = router;
