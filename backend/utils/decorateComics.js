const Chapter = require('../models/Chapter');
const Rating = require('../models/Rating');

/** Attach chapterCount, lastChapterAt and rating summary to comic documents. */
async function decorateComics(comics) {
  if (!comics || comics.length === 0) return [];

  const ids = comics.map((c) => c._id);

  const [chapterGroups, ratingGroups] = await Promise.all([
    Chapter.aggregate([
      { $match: { comic: { $in: ids }, publishAt: { $lte: new Date() } } },
      {
        $group: {
          _id: '$comic',
          count: { $sum: 1 },
          lastChapterAt: { $max: '$publishAt' },
        },
      },
    ]),
    Rating.aggregate([
      { $match: { comic: { $in: ids } } },
      {
        $group: {
          _id: '$comic',
          average: { $avg: '$value' },
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const chapterMap = new Map(chapterGroups.map((g) => [String(g._id), g]));
  const ratingMap = new Map(ratingGroups.map((g) => [String(g._id), g]));

  return comics.map((c) => {
    const ch = chapterMap.get(String(c._id));
    const rt = ratingMap.get(String(c._id));
    const doc = c.toObject ? c.toObject() : c;
    return {
      ...doc,
      chapterCount: ch ? ch.count : 0,
      lastChapterAt: ch && ch.lastChapterAt ? ch.lastChapterAt : null,
      rating: rt
        ? { average: Math.round(rt.average * 10) / 10, count: rt.count }
        : null,
    };
  });
}

module.exports = { decorateComics };