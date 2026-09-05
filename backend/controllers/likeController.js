const mongoose = require('mongoose');
const Like = require('../models/Like');
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

const toggleLike = async (req, res) => {
  try {
    const { comicId, scriptId } = req.body;
    const invalid = await validateTarget(comicId, scriptId);
    if (invalid) return res.status(400).json({ message: invalid });

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
    const invalid = await validateTarget(comicId, scriptId);
    if (invalid) return res.status(400).json({ message: invalid });

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