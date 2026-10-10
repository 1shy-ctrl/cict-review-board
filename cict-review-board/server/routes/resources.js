const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const cloudinary = require('../config/cloudinary');
const Resource = require('../models/Resource');
const auth = require('../middleware/auth');

router.use(auth);

const ALLOWED = ['.pdf', '.md', '.txt', '.js', '.py', '.java', '.c', '.cpp', '.html', '.css', '.sql'];
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) =>
    ALLOWED.includes(path.extname(file.originalname).toLowerCase())
      ? cb(null, true)
      : cb(new Error('Unsupported file type')),
});

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Hide the votes array; expose only this user's vote
const shape = (doc, userId) => {
  const o = doc.toObject();
  const mine = o.votes.find((v) => String(v.user) === String(userId));
  o.myVote = mine ? mine.value : 0;
  delete o.votes;
  return o;
};

const uploadToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'cict-review-board', resource_type: 'auto' },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });

// GET /api/resources?program=BSCS&yearLevel=2&courseCode=CS101&q=arrays&sort=top|new
router.get('/', async (req, res, next) => {
  try {
    const { program, yearLevel, courseCode, q, sort } = req.query;
    const filter = {};
    if (program && program !== 'ALL') filter.program = { $in: [program, 'BOTH'] };
    if (yearLevel && yearLevel !== 'ALL') filter.yearLevel = Number(yearLevel);
    if (courseCode) filter.courseCode = new RegExp(escapeRegex(courseCode.trim()), 'i');
    if (q) filter.title = new RegExp(escapeRegex(q.trim()), 'i');

    const order = sort === 'new' ? { createdAt: -1 } : { score: -1, createdAt: -1 };
    const items = await Resource.find(filter).sort(order).limit(100).populate('uploader', 'name program');
    res.json(items.map((r) => shape(r, req.user.id)));
  } catch (err) {
    next(err);
  }
});

// POST /api/resources  (multipart/form-data, field "file")
router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    const { title, description, courseCode, program, yearLevel } = req.body;
    if (!req.file) return res.status(400).json({ message: 'Please attach a file' });
    if (!title || !courseCode || !program || !yearLevel)
      return res.status(400).json({ message: 'Title, course code, program and year level are required' });
    if (!['BSCS', 'BSIS', 'BOTH'].includes(program))
      return res.status(400).json({ message: 'Invalid program' });

    const result = await uploadToCloudinary(req.file.buffer);
    const resource = await Resource.create({
      title,
      description,
      courseCode,
      program,
      yearLevel: Number(yearLevel),
      fileUrl: result.secure_url,
      fileName: req.file.originalname,
      fileType: path.extname(req.file.originalname).toLowerCase(),
      uploader: req.user.id,
    });
    await resource.populate('uploader', 'name program');
    res.status(201).json(shape(resource, req.user.id));
  } catch (err) {
    next(err);
  }
});

// POST /api/resources/:id/vote   body: { value: 1 | -1 }  (sending the same value again removes the vote)
router.post('/:id/vote', async (req, res, next) => {
  try {
    const value = Number(req.body.value);
    if (![1, -1].includes(value)) return res.status(400).json({ message: 'value must be 1 or -1' });

    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });

    const i = resource.votes.findIndex((v) => String(v.user) === req.user.id);
    if (i === -1) resource.votes.push({ user: req.user.id, value });
    else if (resource.votes[i].value === value) resource.votes.splice(i, 1);
    else resource.votes[i].value = value;

    resource.score = resource.votes.reduce((sum, v) => sum + v.value, 0);
    await resource.save();
    await resource.populate('uploader', 'name program');
    res.json(shape(resource, req.user.id));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
