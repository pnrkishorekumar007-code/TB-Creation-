const { serverError } = require('../utils/httpError');
const Script = require('../models/Script');
const Like = require('../models/Like');
const Bookmark = require('../models/Bookmark');
const Report = require('../models/Report');
const mongoose = require('mongoose');
const { registerMedia, deleteMedia } = require('../utils/mediaAccess');
const { signPayloadMedia } = require('../utils/signMedia');

const createScript = async (req, res) => {
  try {
    const { title, synopsis, genre, publish } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });
    if (!req.file) return res.status(400).json({ message: 'Script file is required' });

    const script = await Script.create({
      title,
      synopsis,
      genre,
      fileUrl: `/uploads/scripts/${req.file.filename}`,
      author: req.user._id,
      approvalStatus: publish === 'true' ? 'pending' : 'draft',
    });

    // Script files start private until the script is approved.
    await registerMedia({
      file: script.fileUrl,
      owner: req.user._id,
      kind: 'script',
      ref: String(script._id),
      public: false,
    });

    res.status(201).json(await signPayloadMedia(script.toObject()));
  } catch (err) {
    serverError(res, err);
  }
};

const submitScriptForReview = async (req, res) => {
  try {
    const script = await Script.findById(req.params.id);
    if (!script) return res.status(404).json({ message: 'Script not found' });
    if (String(script.author) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not your script' });
    }
    if (script.approvalStatus !== 'draft' && script.approvalStatus !== 'rejected') {
      return res.status(400).json({ message: 'Only drafts or rejected scripts can be resubmitted' });
    }
    script.approvalStatus = 'pending';
    await script.save();
    res.json(await signPayloadMedia(script.toObject()));
  } catch (err) {
    serverError(res, err);
  }
};

const updateScript = async (req, res) => {
  try {
    const script = await Script.findById(req.params.id);
    if (!script) return res.status(404).json({ message: 'Script not found' });
    if (String(script.author) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not your script' });
    }

    const { title, synopsis, genre } = req.body;
    if (title !== undefined) script.title = title.toString().trim() || script.title;
    if (synopsis !== undefined) script.synopsis = synopsis.toString();
    if (genre !== undefined) script.genre = genre.toString();

    if (req.file) {
      const oldFile = script.fileUrl;
      const newFile = `/uploads/scripts/${req.file.filename}`;
      script.fileUrl = newFile;
      await registerMedia({
        file: newFile,
        owner: req.user._id,
        kind: 'script',
        ref: String(script._id),
        public: false,
      });
      if (oldFile) await deleteMedia([oldFile]);
    }

    // Same re-review rule as comics: any edit of approved/pending content
    // resets to a draft so an admin must approve the new version.
    if (script.approvalStatus === 'approved' || script.approvalStatus === 'pending') {
      script.approvalStatus = 'draft';
    }

    await script.save();
    res.json(await signPayloadMedia(script.toObject()));
  } catch (err) {
    serverError(res, err);
  }
};

const deleteScript = async (req, res) => {
  try {
    const script = await Script.findById(req.params.id);
    if (!script) return res.status(404).json({ message: 'Script not found' });
    if (String(script.author) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not your script' });
    }

    // Cascade: remove social rows and reports referencing this script.
    await Like.deleteMany({ script: script._id });
    await Bookmark.deleteMany({ script: script._id });
    await Report.deleteMany({ targetType: 'script', targetId: script._id });
    await deleteMedia([script.fileUrl]);
    await Script.deleteOne({ _id: script._id });

    res.json({ message: 'Script deleted' });
  } catch (err) {
    serverError(res, err);
  }
};

const getScripts = async (req, res) => {
  try {
    const { genre, search, page = 1, limit = 20 } = req.query;
    const filter = { approvalStatus: 'approved' };
    if (genre) filter.genre = String(genre);
    if (search) filter.$text = { $search: search };

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.min(parseInt(limit) || 20, 50);

    const [scripts, total] = await Promise.all([
      Script.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .populate('author', 'name'),
      Script.countDocuments(filter),
    ]);

    res.json({ scripts, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (err) {
    serverError(res, err);
  }
};

const getScriptById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid script id' });
    }
    const script = await Script.findById(req.params.id).populate('author', 'name bio avatarUrl');
    if (!script) return res.status(404).json({ message: 'Script not found' });

    const authorId = script.author && (script.author._id || script.author);
    const isOwner = req.user && String(authorId) === String(req.user._id);
    const isAdmin = req.user && req.user.role === 'admin';
    if (script.approvalStatus !== 'approved' && !isOwner && !isAdmin) {
      return res.status(404).json({ message: 'Script not found' });
    }

    if (req.query.increment !== 'false') {
      script.views += 1;
      await script.save();
    }

    res.json(await signPayloadMedia(script.toObject()));
  } catch (err) {
    serverError(res, err);
  }
};

const getMyScripts = async (req, res) => {
  try {
    const scripts = await Script.find({ author: req.user._id }).sort({ createdAt: -1 });
    res.json(await signPayloadMedia(scripts.map((s) => s.toObject())));
  } catch (err) {
    serverError(res, err);
  }
};

module.exports = { createScript, submitScriptForReview, updateScript, deleteScript, getScripts, getScriptById, getMyScripts };
