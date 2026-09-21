const { serverError } = require('../utils/httpError');
const Comic = require('../models/Comic');
const Chapter = require('../models/Chapter');
const Comment = require('../models/Comment');
const Like = require('../models/Like');
const Bookmark = require('../models/Bookmark');
const Rating = require('../models/Rating');
const ReadingHistory = require('../models/ReadingHistory');
const Report = require('../models/Report');
const Follow = require('../models/Follow');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');
const { decorateComics } = require('../utils/decorateComics');
const { registerMedia, publishFiles, deleteMedia } = require('../utils/mediaAccess');
const { signPayloadMedia } = require('../utils/signMedia');
const { asString, asPage } = require('../utils/queryParams');

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const createComic = async (req, res) => {
  try {
    const { title, description, genre, tags, status, publish } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });

    const coverUrl = req.file ? `/uploads/covers/${req.file.filename}` : '';

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

    // Covers start private: visible only to the owner/admin (via signed URLs)
    // until an admin approves the comic.
    if (comic.coverUrl) {
      await registerMedia({
        file: comic.coverUrl,
        owner: req.user._id,
        kind: 'cover',
        ref: String(comic._id),
        public: false,
      });
    }

    res.status(201).json(await signPayloadMedia(comic.toObject()));
  } catch (err) {
    serverError(res, err);
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
    res.json(await signPayloadMedia(comic.toObject()));
  } catch (err) {
    serverError(res, err);
  }
};

const updateComic = async (req, res) => {
  try {
    const comic = await Comic.findById(req.params.id);
    if (!comic) return res.status(404).json({ message: 'Comic not found' });
    if (String(comic.author) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not your comic' });
    }

    const { title, description, genre, tags, status } = req.body;
    if (title !== undefined) comic.title = title.toString().trim() || comic.title;
    if (description !== undefined) comic.description = description.toString();
    if (genre !== undefined) comic.genre = genre.toString();
    if (tags !== undefined) {
      comic.tags = tags.toString().split(',').map((t) => t.trim()).filter(Boolean);
    }
    if (status !== undefined) comic.status = status;

    if (req.file) {
      const oldCover = comic.coverUrl;
      const newCover = `/uploads/covers/${req.file.filename}`;
      comic.coverUrl = newCover;
      await registerMedia({
        file: newCover,
        owner: req.user._id,
        kind: 'cover',
        ref: String(comic._id),
        public: false,
      });
      if (oldCover) await deleteMedia([oldCover]);
    }

    // Any edit of approved/pending content resets it to a draft that an admin
    // must re-review, so the public listing can never silently change.
    if (comic.approvalStatus === 'approved' || comic.approvalStatus === 'pending') {
      comic.approvalStatus = 'draft';
    }

    await comic.save();
    res.json(await signPayloadMedia(comic.toObject()));
  } catch (err) {
    serverError(res, err);
  }
};

const deleteComic = async (req, res) => {
  try {
    const comic = await Comic.findById(req.params.id);
    if (!comic) return res.status(404).json({ message: 'Comic not found' });
    if (String(comic.author) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not your comic' });
    }

    const chapters = await Chapter.find({ comic: comic._id });
    const chapterIds = chapters.map((c) => c._id);
    const pageFiles = chapters.flatMap((c) => c.pageImages || []);
    const coverFiles = comic.coverUrl ? [comic.coverUrl] : [];

    // Cascade: remove everything that references this comic or its chapters.
    await Comment.deleteMany({
      $or: [{ comic: comic._id }, { chapter: { $in: chapterIds } }],
    });
    await Like.deleteMany({ comic: comic._id });
    await Bookmark.deleteMany({ comic: comic._id });
    await Rating.deleteMany({ comic: comic._id });
    await ReadingHistory.deleteMany({ comic: comic._id });
    await Report.deleteMany({ targetType: 'comic', targetId: comic._id });
    await Chapter.deleteMany({ comic: comic._id });

    await deleteMedia([...coverFiles, ...pageFiles]);
    await Comic.deleteOne({ _id: comic._id });

    res.json({ message: 'Comic deleted' });
  } catch (err) {
    serverError(res, err);
  }
};

const getComics = async (req, res) => {
  try {
    const genre = asString(req.query.genre, 'genre');
    const status = asString(req.query.status, 'status');
    const search = asString(req.query.search, 'search');
    const sort = asString(req.query.sort, 'sort');
    const filter = { approvalStatus: 'approved' };
    // Coerce to plain strings so Mongo never interprets an attacker-supplied
    // object (e.g. {$ne: null}) as a query operator.
    if (genre && genre !== 'All') filter.genre = genre;
    if (status && status !== 'All') filter.status = status;
    if (search) {
      const safe = escapeRegex(search);
      filter.$or = [
        { title: { $regex: safe, $options: 'i' } },
        { genre: { $regex: safe, $options: 'i' } },
        { tags: { $in: [new RegExp(safe, 'i')] } },
      ];
    }

    const pageNum = asPage(req.query.page, 1);
    const limitNum = asPage(req.query.limit, 20, 50);

    let sortOption = { createdAt: -1 };
    if (sort === 'popular' || sort === 'views') sortOption = { views: -1 };

    const cursor = Comic.find(filter).populate('author', 'name');

    // "Recently updated" needs chapter data, so decorate first, then sort + slice.
    if (sort === 'updated') {
      const all = await cursor.sort({ createdAt: -1 });
      const decorated = await decorateComics(all);
      decorated.sort((a, b) => {
        const at = a.lastChapterAt ? new Date(a.lastChapterAt).getTime() : -Infinity;
        const bt = b.lastChapterAt ? new Date(b.lastChapterAt).getTime() : -Infinity;
        return bt - at;
      });
      const total = decorated.length;
      const comics = decorated.slice((pageNum - 1) * limitNum, pageNum * limitNum);
      return res.json({ comics, total, page: pageNum, pages: Math.ceil(total / limitNum) });
    }

    const [rawComics, total] = await Promise.all([
      cursor.sort(sortOption).skip((pageNum - 1) * limitNum).limit(limitNum),
      Comic.countDocuments(filter),
    ]);

    const comics = await decorateComics(rawComics);

    res.json({ comics, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (err) {
    serverError(res, err);
  }
};

const getComicById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid comic id' });
    }
    const comic = await Comic.findById(req.params.id).populate('author', 'name bio avatarUrl');
    if (!comic) return res.status(404).json({ message: 'Comic not found' });

    const authorId = comic.author && (comic.author._id || comic.author);
    const isOwner = req.user && String(authorId) === String(req.user._id);
    const isAdmin = req.user && req.user.role === 'admin';
    if (comic.approvalStatus !== 'approved' && !isOwner && !isAdmin) {
      return res.status(404).json({ message: 'Comic not found' });
    }

    if (req.query.increment !== 'false') {
      comic.views += 1;
      await comic.save();
    }

    const chapters = await Chapter.find({ comic: comic._id, publishAt: { $lte: new Date() } }).sort({ order: 1 });

    // A scheduled chapter's pages stay private until its publish time arrives.
    // There is no background job, so promote lazily the moment its chapters are
    // actually served to readers.
    await publishFiles(chapters.flatMap((ch) => ch.pageImages || []));

    // First chapter is a free preview for everyone. Reading further requires an account.
    const chaptersWithAccess = chapters.map((ch, idx) => {
      const chObj = ch.toObject();
      if (idx > 0 && !req.user) {
        return { ...chObj, pageImages: [], locked: true };
      }
      return { ...chObj, locked: false };
    });

    res.json(await signPayloadMedia({ comic: comic.toObject(), chapters: chaptersWithAccess }));
  } catch (err) {
    serverError(res, err);
  }
};

const getMyComics = async (req, res) => {
  try {
    const comics = await Comic.find({ author: req.user._id })
      .sort({ createdAt: -1 })
      .populate('author', 'name');
    const decorated = await decorateComics(comics);
    res.json(await signPayloadMedia(decorated));
  } catch (err) {
    serverError(res, err);
  }
};

const addChapter = async (req, res) => {
  try {
    const comic = await Comic.findById(req.params.id);
    if (!comic) return res.status(404).json({ message: 'Comic not found' });
    if (String(comic.author) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not your comic' });
    }

    const pageImages = (req.files || []).map((f) => `/uploads/pages/${f.filename}`);
    if (pageImages.length === 0) {
      return res.status(400).json({ message: 'At least one page image is required' });
    }

    const { title, order, publishAt } = req.body;
    if (!title) return res.status(400).json({ message: 'Chapter title is required' });

    const chapter = await Chapter.create({
      comic: comic._id,
      title,
      order: Number(order) || 1,
      pageImages,
      publishAt: publishAt ? new Date(publishAt) : new Date(),
    });

    // Page images follow the chapter's visibility: published chapters' pages
    // are public, scheduled/draft chapters' pages stay private until read.
    const publishesNow = !publishAt || new Date(publishAt) <= new Date();
    await Promise.all(
      pageImages.map((file) =>
        registerMedia({
          file,
          owner: req.user._id,
          kind: 'page',
          ref: String(chapter._id),
          public: publishesNow,
        })
      )
    );

    // Notify followers only if the chapter is publishing immediately
    if (publishesNow) {
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
    serverError(res, err);
  }
};

module.exports = {
  createComic,
  submitComicForReview,
  updateComic,
  deleteComic,
  getComics,
  getComicById,
  getMyComics,
  addChapter,
};
