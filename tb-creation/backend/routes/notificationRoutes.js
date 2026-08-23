const express = require('express');
const { getMyNotifications, markAllRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);
router.get('/', getMyNotifications);
router.put('/mark-read', markAllRead);

module.exports = router;
