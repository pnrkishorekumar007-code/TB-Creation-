const Comic = require('../models/Comic');
const Chapter = require('../models/Chapter');
const Follow = require('../models/Follow');
const Notification = require('../models/Notification');
const File = require('../models/File');

const createComic = async (req, res) => {
  try {
    const { title, description, genre, tags, status, publish } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });

    const coverUrl = req.file ? `/uploads/covers/${await File.saveUpload(req.file, 'covers')}` : '';

    const comic = await Comic.create({
      title,
      description,
      genre,
      tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      status,
      coverUrl,
      author: req.user._id,
      approvalStatus: publish === 'true' ? 'pending' : 'draft',
    });

    res.status(201).json(comic);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const submitComicForReview = async (req, res) => {
  try {
    const comic = await Comic.findById(req.params.id);
    if (!comic) return res.status(404).json({ message: 'Comic not found' });
    if (String(comic.author) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not your comic' });
    }
    if (comic.approvalStatus !== 'draft' && comic.approvalStatus !== 'rejected') {
      return res.status(400).json({ message: 'Only drafts or rejected comics can be resubmitted' });
    }
    comic.approvalStatus = 'pending';
    await comic.save();
    res.json(comic);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getComics = async (req, res) => {
  try {
    const { genre, status, search, sort, page = 1, limit = 20 } = req.query;
    const filter = { approvalStatus: 'approved' };
    if (genre) filter.genre = genre;
    if (status) filter.status = status;
    if (search) filter.$text = { $search: search };

    let sortOption = { createdAt: -1 };
    if (sort === 'popular') sortOption = { views: -1 };

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.min(parseInt(limit) || 20, 50);

    const [comics, total] = await Promise.all([
      Comic.find(filter)
        .sort(sortOption)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .populate('author', 'name'),
      Comic.countDocuments(filter),
    ]);

    res.json({ comics, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getComicById = async (req, res) => {
  try {
    const comic = await Comic.findById(req.params.id).populate('author', 'name bio avatarUrl');
    if (!comic) return res.status(404).json({ message: 'Comic not found' });

    // Unpublished drafts/pending/rejected comics are only visible to their
    // author or an admin — don't leak them via direct IDs.
    const authorId = comic.author?._id || comic.author;
    const isOwnerOrAdmin =
      req.user && (String(authorId) === String(req.user._id) || req.user.role === 'admin');
    if (comic.approvalStatus !== 'approved' && !isOwnerOrAdmin) {
      return res.status(404).json({ message: 'Comic not found' });
    }

    await Comic.updateOne({ _id: comic._id }, { $inc: { views: 1 } });

    const chapters = await Chapter.find({ comic: comic._id, publishAt: { $lte: new Date() } }).sort({ order: 1 });

    // First chapter is a free preview for everyone. Reading further requires an account.
    const chaptersWithAccess = chapters.map((ch, idx) => {
      const chObj = ch.toObject();
      if (idx > 0 && !req.user) {
        return { ...chObj, pageImages: [], locked: true };
      }
      return { ...chObj, locked: false };
    });

    res.json({ comic, chapters: chaptersWithAccess });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMyComics = async (req, res) => {
  try {
    const comics = await Comic.find({ author: req.user._id }).sort({ createdAt: -1 });
    res.json(comics);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addChapter = async (req, res) => {
  try {
    const comic = await Comic.findById(req.params.id);
    if (!comic) return res.status(404).json({ message: 'Comic not found' });
    if (String(comic.author) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not your comic' });
    }

    const { title, order, publishAt } = req.body;
    if (!title) return res.status(400).json({ message: 'Chapter title is required' });

    const publishDate = publishAt ? new Date(publishAt) : new Date();
    if (Number.isNaN(publishDate.getTime())) {
      return res.status(400).json({ message: 'publishAt must be a valid date' });
    }

    // Persist files only after all validation passes, so bad requests
    // don't leave orphaned uploads in the database.
    const pageFilenames = [];
    for (const f of req.files || []) {
      pageFilenames.push(await File.saveUpload(f, 'pages'));
    }
    const pageImages = pageFilenames.map((name) => `/uploads/pages/${name}`);
    if (pageImages.length === 0) {
      return res.status(400).json({ message: 'At least one page image is required' });
    }

    const chapter = await Chapter.create({
      comic: comic._id,
      title,
      order: Number(order) || 1,
      pageImages,
      publishAt: publishDate,
    });

    // Notify followers only if the chapter is publishing immediately
    if (!publishAt || publishDate <= new Date()) {
      const followers = await Follow.find({ author: comic.author });
      if (followers.length > 0) {
        await Notification.insertMany(
          followers.map((f) => ({
            user: f.follower,
            message: `${req.user.name} published a new chapter of "${comic.title}"`,
            link: `/comics/${comic._id}/read/${chapter._id}`,
          }))
        );
      }
    }

    res.status(201).json(chapter);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createComic, submitComicForReview, getComics, getComicById, getMyComics, addChapter };
