const Script = require('../models/Script');
const File = require('../models/File');

const createScript = async (req, res) => {
  try {
    const { title, synopsis, genre, publish } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });
    if (!req.file) return res.status(400).json({ message: 'Script file is required' });

    const filename = await File.saveUpload(req.file, 'scripts');
    const script = await Script.create({
      title,
      synopsis,
      genre,
      fileUrl: `/uploads/scripts/${filename}`,
      author: req.user._id,
      approvalStatus: publish === 'true' ? 'pending' : 'draft',
    });

    res.status(201).json(script);
  } catch (err) {
    res.status(500).json({ message: err.message });
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
    res.json(script);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getScripts = async (req, res) => {
  try {
    const { genre, search, page = 1, limit = 20 } = req.query;
    const filter = { approvalStatus: 'approved' };
    if (genre) filter.genre = genre;
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
    res.status(500).json({ message: err.message });
  }
};

const getScriptById = async (req, res) => {
  try {
    const script = await Script.findById(req.params.id).populate('author', 'name bio avatarUrl');
    if (!script) return res.status(404).json({ message: 'Script not found' });

    // Unpublished drafts/pending/rejected scripts are only visible to their
    // author or an admin — don't leak them via direct IDs.
    const authorId = script.author?._id || script.author;
    const isOwnerOrAdmin =
      req.user && (String(authorId) === String(req.user._id) || req.user.role === 'admin');
    if (script.approvalStatus !== 'approved' && !isOwnerOrAdmin) {
      return res.status(404).json({ message: 'Script not found' });
    }

    await Script.updateOne({ _id: script._id }, { $inc: { views: 1 } });

    res.json(script);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMyScripts = async (req, res) => {
  try {
    const scripts = await Script.find({ author: req.user._id }).sort({ createdAt: -1 });
    res.json(scripts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createScript, submitScriptForReview, getScripts, getScriptById, getMyScripts };
