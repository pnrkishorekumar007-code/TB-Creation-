const { serverError } = require('../utils/httpError');
const mongoose = require('mongoose');
const User = require('../models/User');
const Comic = require('../models/Comic');
const Script = require('../models/Script');
const Chapter = require('../models/Chapter');
const Follow = require('../models/Follow');
const { serializeUser } = require('./authController');
const { registerMedia } = require('../utils/mediaAccess');

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Safe public shape for an author profile/listing (never leak email/tokens). */
const sanitizeAuthor = (user) => ({
  _id: user._id,
  name: user.name,
  bio: user.bio,
  avatarUrl: user.avatarUrl,
  role: user.role,
  createdAt: user.createdAt,
});

const getAuthorProfile = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid author id' });
    }
    const author = await User.findById(req.params.id).select('-password');
    if (!author) return res.status(404).json({ message: 'Author not found' });

    const [comics, scripts, followers] = await Promise.all([
      Comic.find({ author: author._id, approvalStatus: 'approved' }),
      Script.find({ author: author._id, approvalStatus: 'approved' }),
      Follow.countDocuments({ author: author._id }),
    ]);

    const chapterCount = await Chapter.countDocuments({
      comic: { $in: comics.map((c) => c._id) },
      publishAt: { $lte: new Date() },
    });

    const totalViews = comics.reduce((sum, c) => sum + (c.views || 0), 0) +
      scripts.reduce((sum, s) => sum + (s.views || 0), 0);

    res.json({
      author: {
        ...sanitizeAuthor(author),
        followers,
        following: await Follow.countDocuments({ follower: author._id }),
        seriesCount: comics.length + scripts.length,
        chapterCount,
        totalViews,
      },
      comics,
      scripts,
    });
  } catch (err) {
    serverError(res, err);
  }
};

const getAuthors = async (req, res) => {
  try {
    const { search } = req.query;

    const [comicAuthors, scriptAuthors] = await Promise.all([
      Comic.distinct('author', { approvalStatus: 'approved' }),
      Script.distinct('author', { approvalStatus: 'approved' }),
    ]);
    const ids = [...new Set([...comicAuthors, ...scriptAuthors])];

    const nameFilter = search
      ? { $regex: escapeRegex(search), $options: 'i' }
      : { $exists: true };
    const users = await User.find({
      _id: { $in: ids },
      name: nameFilter,
    }).select('name bio avatarUrl role');

    const [comicCounts, scriptCounts, followerCounts] = await Promise.all([
      Comic.aggregate([
        { $match: { approvalStatus: 'approved', author: { $in: users.map((u) => u._id) } } },
        { $group: { _id: '$author', count: { $sum: 1 } } },
      ]),
      Script.aggregate([
        { $match: { approvalStatus: 'approved', author: { $in: users.map((u) => u._id) } } },
        { $group: { _id: '$author', count: { $sum: 1 } } },
      ]),
      Follow.aggregate([
        { $match: { author: { $in: users.map((u) => u._id) } } },
        { $group: { _id: '$author', count: { $sum: 1 } } },
      ]),
    ]);

    const seriesMap = new Map();
    [...comicCounts, ...scriptCounts].forEach((g) => {
      seriesMap.set(String(g._id), (seriesMap.get(String(g._id)) || 0) + g.count);
    });
    const followerMap = new Map(followerCounts.map((g) => [String(g._id), g.count]));

    const creators = users
      .map((u) => ({
        ...sanitizeAuthor(u),
        seriesCount: seriesMap.get(String(u._id)) || 0,
        followers: followerMap.get(String(u._id)) || 0,
      }))
      .filter((c) => c.seriesCount > 0)
      .sort((a, b) => b.followers - a.followers);

    res.json({ authors: creators });
  } catch (err) {
    serverError(res, err);
  }
};

const updateMyProfile = async (req, res) => {
  try {
    const { name, bio } = req.body;
    const update = {};
    if (name) update.name = name;
    if (bio !== undefined) update.bio = bio;
    if (req.file) {
      update.avatarUrl = `/uploads/avatars/${req.file.filename}`;
      // Avatars are shown next to public comments/profiles, so they are public.
      await registerMedia({
        file: update.avatarUrl,
        owner: req.user._id,
        kind: 'avatar',
        ref: String(req.user._id),
        public: true,
      });
    }

    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true }).select('-password');
    res.json(serializeUser(user));
  } catch (err) {
    serverError(res, err);
  }
};

/** Let a reader's account become a creator account in one step. */
const upgradeToAuthor = async (req, res) => {
  try {
    if (req.user.role === 'reader') {
      await User.findByIdAndUpdate(req.user._id, { role: 'author' });
    }
    const user = await User.findById(req.user._id).select('-password');
    res.json(serializeUser(user));
  } catch (err) {
    serverError(res, err);
  }
};

module.exports = { getAuthorProfile, getAuthors, updateMyProfile, upgradeToAuthor };