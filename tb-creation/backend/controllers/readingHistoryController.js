const ReadingHistory = require('../models/ReadingHistory');

const recordProgress = async (req, res) => {
  try {
    const { comicId, chapterId } = req.body;
    if (!comicId || !chapterId) {
      return res.status(400).json({ message: 'comicId and chapterId are required' });
    }
    const entry = await ReadingHistory.findOneAndUpdate(
      { user: req.user._id, comic: comicId },
      { lastChapter: chapterId },
      { upsert: true, new: true }
    );
    res.json(entry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getContinueReading = async (req, res) => {
  try {
    const history = await ReadingHistory.find({ user: req.user._id })
      .sort({ updatedAt: -1 })
      .limit(12)
      .populate('comic')
      .populate('lastChapter', 'title order');
    res.json(history.filter((h) => h.comic));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { recordProgress, getContinueReading };
