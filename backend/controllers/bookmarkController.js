const mongoose = require('mongoose');
const Bookmark = require('../models/Bookmark');
const Comic = require('../models/Comic');
const Script = require('../models/Script');

const validateTarget = async (comicId, scriptId) => {
  if (comicId && scriptId) return 'Provide either comicId or scriptId, not both';
  if (comicId) {
    if (!mongoose.isValidObjectId(comicId)) return 'Invalid comic id';
    if (!(await Comic.findById(comicId))) return 'Comic not found';
    return null;
  }
  if (scriptId) {
    if (!mongoose.isValidObjectId(scriptId)) return 'Invalid script id';
    if (!(await Script.findById(scriptId))) return 'Script not found';
    return null;
  }
  return 'comicId or scriptId is required';
};

const toggleBookmark = async (req, res) => {
  try {
    const { comicId, scriptId } = req.body;
    const invalid = await validateTarget(comicId, scriptId);
    if (invalid) return res.status(400).json({ message: invalid });

    const query = { user: req.user._id, ...(comicId ? { comic: comicId } : { script: scriptId }) };

    const existing = await Bookmark.findOne(query);
    if (existing) {
      await existing.deleteOne();
      return res.json({ bookmarked: false });
    }

    await Bookmark.create(query);
    res.json({ bookmarked: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMyBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user._id })
      .populate('comic')
      .populate('script')
      .sort({ createdAt: -1 });
    res.json(bookmarks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { toggleBookmark, getMyBookmarks };