const Comic = require('../models/Comic');
const Script = require('../models/Script');

const REVIEW_STATUSES = ['approved', 'rejected'];

const getPendingComics = async (req, res) => {
  try {
    const comics = await Comic.find({ approvalStatus: 'pending' }).populate('author', 'name email');
    res.json(comics);
  } catch (err) {
    res.status(500).json({ message: err.message });
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
    res.json(comic);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getPendingScripts = async (req, res) => {
  try {
    const scripts = await Script.find({ approvalStatus: 'pending' }).populate('author', 'name email');
    res.json(scripts);
  } catch (err) {
    res.status(500).json({ message: err.message });
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
    res.json(script);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getPendingComics, reviewComic, getPendingScripts, reviewScript };