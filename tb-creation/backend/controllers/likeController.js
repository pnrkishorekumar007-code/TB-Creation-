const Like = require('../models/Like');

const toggleLike = async (req, res) => {
  try {
    const { comicId, scriptId } = req.body;
    if (!comicId && !scriptId) {
      return res.status(400).json({ message: 'comicId or scriptId is required' });
    }
    const query = { user: req.user._id, ...(comicId ? { comic: comicId } : { script: scriptId }) };

    const existing = await Like.findOne(query);
    if (existing) {
      await existing.deleteOne();
    } else {
      await Like.create(query);
    }

    const countFilter = comicId ? { comic: comicId } : { script: scriptId };
    const count = await Like.countDocuments(countFilter);
    res.json({ liked: !existing, count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getLikeStatus = async (req, res) => {
  try {
    const { comicId, scriptId } = req.query;
    const countFilter = comicId ? { comic: comicId } : { script: scriptId };
    const count = await Like.countDocuments(countFilter);

    let liked = false;
    if (req.user) {
      const mine = await Like.findOne({ user: req.user._id, ...countFilter });
      liked = !!mine;
    }
    res.json({ liked, count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { toggleLike, getLikeStatus };
