const Follow = require('../models/Follow');
const Chapter = require('../models/Chapter');
const Comic = require('../models/Comic');

const getMyFeed = async (req, res) => {
  try {
    const follows = await Follow.find({ follower: req.user._id });
    const authorIds = follows.map((f) => f.author);

    if (authorIds.length === 0) {
      return res.json([]);
    }

    const comics = await Comic.find({ author: { $in: authorIds }, approvalStatus: 'approved' }).select('_id');
    const comicIds = comics.map((c) => c._id);

    const chapters = await Chapter.find({ comic: { $in: comicIds }, publishAt: { $lte: new Date() } })
      .sort({ publishAt: -1 })
      .limit(20)
      .populate({ path: 'comic', populate: { path: 'author', select: 'name' } });

    res.json(chapters);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getMyFeed };
