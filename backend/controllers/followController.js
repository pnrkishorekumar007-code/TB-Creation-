const { serverError } = require('../utils/httpError');
const mongoose = require('mongoose');
const Follow = require('../models/Follow');
const User = require('../models/User');

const toggleFollow = async (req, res) => {
  try {
    const { authorId } = req.body;
    if (!authorId) return res.status(400).json({ message: 'authorId is required' });
    if (!mongoose.isValidObjectId(authorId)) return res.status(400).json({ message: 'Invalid author id' });
    if (authorId === String(req.user._id)) {
      return res.status(400).json({ message: "You can't follow yourself" });
    }
    if (!(await User.findById(authorId))) {
      return res.status(404).json({ message: 'Author not found' });
    }

    const existing = await Follow.findOne({ follower: req.user._id, author: authorId });
    if (existing) {
      await existing.deleteOne();
      return res.json({ following: false });
    }

    await Follow.create({ follower: req.user._id, author: authorId });
    res.json({ following: true });
  } catch (err) {
    serverError(res, err);
  }
};

const getFollowStatus = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.authorId)) {
      return res.status(400).json({ message: 'Invalid author id' });
    }
    const existing = await Follow.findOne({ follower: req.user._id, author: req.params.authorId });
    res.json({ following: !!existing });
  } catch (err) {
    serverError(res, err);
  }
};

const getFollowCounts = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.authorId)) {
      return res.status(400).json({ message: 'Invalid author id' });
    }
    const [followers, following] = await Promise.all([
      Follow.countDocuments({ author: req.params.authorId }),
      Follow.countDocuments({ follower: req.params.authorId }),
    ]);
    res.json({ followers, following });
  } catch (err) {
    serverError(res, err);
  }
};

module.exports = { toggleFollow, getFollowStatus, getFollowCounts };