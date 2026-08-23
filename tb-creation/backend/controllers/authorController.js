const User = require('../models/User');
const Comic = require('../models/Comic');
const Script = require('../models/Script');

const getAuthorProfile = async (req, res) => {
  try {
    const author = await User.findById(req.params.id).select('-password');
    if (!author) return res.status(404).json({ message: 'Author not found' });

    const comics = await Comic.find({ author: author._id, approvalStatus: 'approved' });
    const scripts = await Script.find({ author: author._id, approvalStatus: 'approved' });

    res.json({ author, comics, scripts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateMyProfile = async (req, res) => {
  try {
    const { name, bio } = req.body;
    const update = {};
    if (name) update.name = name;
    if (bio !== undefined) update.bio = bio;
    if (req.file) update.avatarUrl = `/uploads/avatars/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAuthorProfile, updateMyProfile };
