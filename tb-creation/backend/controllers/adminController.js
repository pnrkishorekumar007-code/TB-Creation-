const Comic = require('../models/Comic');
const Script = require('../models/Script');

const getPendingComics = async (req, res) => {
  const comics = await Comic.find({ approvalStatus: 'pending' }).populate('author', 'name email');
  res.json(comics);
};

const reviewComic = async (req, res) => {
  const { status } = req.body; // 'approved' | 'rejected'
  const comic = await Comic.findByIdAndUpdate(req.params.id, { approvalStatus: status }, { new: true });
  if (!comic) return res.status(404).json({ message: 'Comic not found' });
  res.json(comic);
};

const getPendingScripts = async (req, res) => {
  const scripts = await Script.find({ approvalStatus: 'pending' }).populate('author', 'name email');
  res.json(scripts);
};

const reviewScript = async (req, res) => {
  const { status } = req.body;
  const script = await Script.findByIdAndUpdate(req.params.id, { approvalStatus: status }, { new: true });
  if (!script) return res.status(404).json({ message: 'Script not found' });
  res.json(script);
};

module.exports = { getPendingComics, reviewComic, getPendingScripts, reviewScript };
