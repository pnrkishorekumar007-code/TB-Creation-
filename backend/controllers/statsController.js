const { serverError } = require('../utils/httpError');
const Comic = require('../models/Comic');
const Script = require('../models/Script');
const Chapter = require('../models/Chapter');
const User = require('../models/User');

const getStats = async (req, res) => {
  try {
    const [series, approvedComicIds, creatorIds, readerIds] = await Promise.all([
      Comic.countDocuments({ approvalStatus: 'approved' }),
      Comic.distinct('_id', { approvalStatus: 'approved' }),
      Comic.distinct('author', { approvalStatus: 'approved' }),
      User.countDocuments({ role: 'reader' }),
    ]);

    const [scriptCreatorIds] = await Promise.all([
      Script.distinct('author', { approvalStatus: 'approved' }),
    ]);

    const creators = new Set([...creatorIds.map(String), ...scriptCreatorIds.map(String)]).size;

    const chapters = await Chapter.countDocuments({
      comic: { $in: approvedComicIds },
      publishAt: { $lte: new Date() },
    });

    res.json({ series, creators, chapters, readers: readerIds });
  } catch (err) {
    serverError(res, err);
  }
};

module.exports = { getStats };