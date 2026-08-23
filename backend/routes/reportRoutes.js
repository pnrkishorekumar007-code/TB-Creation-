const express = require('express');
const { createReport, getOpenReports, resolveReport } = require('../controllers/reportController');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, createReport);
router.get('/open', protect, requireRole('admin'), getOpenReports);
router.put('/:id/resolve', protect, requireRole('admin'), resolveReport);

module.exports = router;
