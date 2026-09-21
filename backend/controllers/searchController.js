const { serverError } = require('../utils/httpError');
const { asString } = require('../utils/queryParams');
const Comic = require('../models/Comic');
const Script = require('../models/Script');
const User = require('../models/User');

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const searchAll = async (req, res) => {
  try {
    const raw = (asString(req.query.q, 'q') || '').trim();
    if (!raw) return res.json({ comics: [], scripts: [], creators: [] });

    const regex = new RegExp(escapeRegex(raw), 'i');

    const [comics, scripts, users] = await Promise.all([
      Comic.find({
        approvalStatus: 'approved',
        $or: [{ title: regex }, { genre: regex }],
      })
        .limit(5)
        .select('title genre coverUrl author')
        .populate('author', 'name'),
      Script.find({
        approvalStatus: 'approved',
        $or: [{ title: regex }, { genre: regex }],
      })
        .limit(5)
        .select('title genre author')
        .populate('author', 'name'),
      User.find({ role: { $in: ['author', 'admin'] }, name: regex })
        .limit(5)
        .select('name bio avatarUrl'),
    ]);

    const ids = users.map((u) => u._id);
    const [comicAuthors, scriptAuthors] = await Promise.all([
      Comic.distinct('author', { approvalStatus: 'approved', author: { $in: ids } }),
      Script.distinct('author', { approvalStatus: 'approved', author: { $in: ids } }),
    ]);

    const activeIds = new Set([...comicAuthors, ...scriptAuthors].map(String));

    const creators = users
      .filter((u) => activeIds.has(String(u._id)))
      .map((u) => ({
        _id: u._id,
        name: u.name,
        bio: u.bio,
        avatarUrl: u.avatarUrl,
        seriesCount: 0,
      }));

    res.json({ comics, scripts, creators });
  } catch (err) {
    serverError(res, err);
  }
};

module.exports = { searchAll };