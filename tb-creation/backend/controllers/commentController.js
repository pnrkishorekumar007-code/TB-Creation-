const Comment = require('../models/Comment');

const addComment = async (req, res) => {
  try {
    const { comicId, chapterId, text } = req.body;
    if (!comicId || !text || !text.trim()) {
      return res.status(400).json({ message: 'comicId and non-empty text are required' });
    }
    const comment = await Comment.create({
      user: req.user._id,
      comic: comicId,
      chapter: chapterId || undefined,
      text: text.trim(),
    });
    const populated = await comment.populate('user', 'name avatarUrl');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getComments = async (req, res) => {
  try {
    const { comicId } = req.params;
    const comments = await Comment.find({ comic: comicId })
      .populate('user', 'name avatarUrl')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (String(comment.user) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not your comment' });
    }
    await comment.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { addComment, getComments, deleteComment };
