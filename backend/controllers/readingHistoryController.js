const { serverError } = require('../utils/httpError');
const ReadingHistory = require('../models/ReadingHistory');
const Chapter = require('../models/Chapter');

const recordProgress = async (req, res) => {
  try {
    const { comicId, chapterId } = req.body;
    if (!comicId || !chapterId) {
      return res.status(400).json({ message: 'comicId and chapterId are required' });
    }
    const chapter = await Chapter.findOne({ _id: chapterId, comic: comicId });
    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }
    const entry = await ReadingHistory.findOneAndUpdate(
      { user: req.user._id, comic: comicId },
      { lastChapter: chapterId },
      { upsert: true, new: true }
    );
    res.json(entry);
  } catch (err) {
    serverError(res, err);
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
    serverError(res, err);
  }
};

module.exports = { recordProgress, getContinueReading };
