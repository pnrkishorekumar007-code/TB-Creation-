const Report = require('../models/Report');

const createReport = async (req, res) => {
  try {
    const { targetType, targetId, reason } = req.body;
    if (!targetType || !targetId || !reason || !reason.trim()) {
      return res.status(400).json({ message: 'targetType, targetId, and a reason are required' });
    }
    const report = await Report.create({
      reporter: req.user._id,
      targetType,
      targetId,
      reason: reason.trim(),
    });
    res.status(201).json({ message: 'Report submitted. Our team will review it.', reportId: report._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getOpenReports = async (req, res) => {
  try {
    const reports = await Report.find({ status: 'open' })
      .sort({ createdAt: -1 })
      .populate('reporter', 'name email');
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const resolveReport = async (req, res) => {
  try {
    const { status } = req.body; // 'reviewed' | 'dismissed'
    if (!['reviewed', 'dismissed'].includes(status)) {
      return res.status(400).json({ message: "status must be 'reviewed' or 'dismissed'" });
    }
    const report = await Report.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createReport, getOpenReports, resolveReport };
