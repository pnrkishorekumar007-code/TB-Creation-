const Rating = require('../models/Rating');

const rateComic = async (req, res) => {
  try {
    const { comicId, value } = req.body;
    const numValue = Number(value);
    if (!comicId || !numValue || numValue < 1 || numValue > 5) {
      return res.status(400).json({ message: 'comicId and a value from 1-5 are required' });
    }
    const rating = await Rating.findOneAndUpdate(
      { user: req.user._id, comic: comicId },
      { value: numValue },
      { upsert: true, new: true }
    );
    res.json(rating);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getComicRatings = async (req, res) => {
  try {
    const { comicId } = req.params;
    const stats = await Rating.aggregate([
      { $match: { comic: new (require('mongoose').Types.ObjectId)(comicId) } },
      { $group: { _id: '$comic', average: { $avg: '$value' }, count: { $sum: 1 } } },
    ]);
    const result = stats[0] || { average: 0, count: 0 };

    let myRating = null;
    if (req.user) {
      const mine = await Rating.findOne({ user: req.user._id, comic: comicId });
      myRating = mine ? mine.value : null;
    }

    res.json({ average: result.average || 0, count: result.count || 0, myRating });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { rateComic, getComicRatings };
