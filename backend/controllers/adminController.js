const { serverError } = require('../utils/httpError');
const Comic = require('../models/Comic');
const Script = require('../models/Script');
const User = require('../models/User');
const { publishFiles } = require('../utils/mediaAccess');
const { signPayloadMedia } = require('../utils/signMedia');

const REVIEW_STATUSES = ['approved', 'rejected'];
const USER_ROLES = ['reader', 'author', 'admin'];

const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('name email role isBanned createdAt')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    serverError(res, err);
  }
};

const updateUser = async (req, res) => {
  try {
    const { role, isBanned } = req.body;
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // An admin must not lock themselves out of the panel.
    if (String(user._id) === String(req.user._id)) {
      if (role !== undefined && role !== 'admin') {
        return res.status(400).json({ message: 'You cannot remove your own admin role' });
      }
      if (isBanned === true) {
        return res.status(400).json({ message: 'You cannot ban yourself' });
      }
    }

    if (role !== undefined) {
      if (!USER_ROLES.includes(role)) return res.status(400).json({ message: 'Invalid role' });
      user.role = role;
    }
    if (isBanned !== undefined) {
      if (typeof isBanned !== 'boolean') return res.status(400).json({ message: 'isBanned must be a boolean' });
      user.isBanned = isBanned;
    }

    await user.save();
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isBanned: user.isBanned,
    });
  } catch (err) {
    serverError(res, err);
  }
};

const getPendingComics = async (req, res) => {
  try {
    const comics = await Comic.find({ approvalStatus: 'pending' }).populate('author', 'name email');
    res.json(await signPayloadMedia(comics.map((c) => c.toObject())));
  } catch (err) {
    serverError(res, err);
  }
};

const reviewComic = async (req, res) => {
  try {
    const { status } = req.body;
    if (!REVIEW_STATUSES.includes(status)) {
      return res.status(400).json({ message: "status must be 'approved' or 'rejected'" });
    }
    const comic = await Comic.findByIdAndUpdate(req.params.id, { approvalStatus: status }, { new: true });
    if (!comic) return res.status(404).json({ message: 'Comic not found' });
    if (status === 'approved') {
      // Approval is publication: the cover becomes world-readable.
      await publishFiles([comic.coverUrl]);
    }
    res.json(await signPayloadMedia(comic.toObject()));
  } catch (err) {
    serverError(res, err);
  }
};

const getPendingScripts = async (req, res) => {
  try {
    const scripts = await Script.find({ approvalStatus: 'pending' }).populate('author', 'name email');
    res.json(await signPayloadMedia(scripts.map((s) => s.toObject())));
  } catch (err) {
    serverError(res, err);
  }
};

const reviewScript = async (req, res) => {
  try {
    const { status } = req.body;
    if (!REVIEW_STATUSES.includes(status)) {
      return res.status(400).json({ message: "status must be 'approved' or 'rejected'" });
    }
    const script = await Script.findByIdAndUpdate(req.params.id, { approvalStatus: status }, { new: true });
    if (!script) return res.status(404).json({ message: 'Script not found' });
    if (status === 'approved') {
      // Approval is publication: the script file becomes world-readable.
      await publishFiles([script.fileUrl]);
    }
    res.json(await signPayloadMedia(script.toObject()));
  } catch (err) {
    serverError(res, err);
  }
};

module.exports = { getPendingComics, reviewComic, getPendingScripts, reviewScript, getUsers, updateUser };