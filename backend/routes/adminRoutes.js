const express = require('express');
const { getPendingComics, reviewComic, getPendingScripts, reviewScript, getUsers, updateUser } = require('../controllers/adminController');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(protect, requireRole('admin'));
router.get('/comics/pending', getPendingComics);
router.put('/comics/:id/review', reviewComic);
router.get('/scripts/pending', getPendingScripts);
router.put('/scripts/:id/review', reviewScript);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);

module.exports = router;
