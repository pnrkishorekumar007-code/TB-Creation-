const mongoose = require('mongoose');
const Report = require('../models/Report');
const Comic = require('../models/Comic');
const Script = require('../models/Script');
const Comment = require('../models/Comment');

const createReport = async (req, res) => {
  try {
    const { targetType, targetId, reason } = req.body;
    if (!['comic', 'script', 'comment'].includes(targetType)) {
      return res.status(400).json({ message: 'targetType must be comic, script, or comment' });
    }
    if (!targetId || !reason || !reason.trim()) {
      return res.status(400).json({ message: 'targetType, targetId, and a reason are required' });
    }
    if (!mongoose.isValidObjectId(targetId)) {
      return res.status(400).json({ message: 'Invalid targetId' });
    }
    if (reason.trim().length > 500) {
      return res.status(400).json({ message: 'Reason must be 500 characters or fewer' });
    }

    const models = { comic: Comic, script: Script, comment: Comment };
    if (!(await models[targetType].findById(targetId))) {
      return res.status(404).json({ message: 'Target not found' });
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
    const report = await Report.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createReport, getOpenReports, resolveReport };
