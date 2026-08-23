const Bookmark = require('../models/Bookmark');

const toggleBookmark = async (req, res) => {
  try {
    const { comicId, scriptId } = req.body;
    if (!comicId && !scriptId) {
      return res.status(400).json({ message: 'comicId or scriptId is required' });
    }
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
