const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// TODO: adjust to your school's real Student ID format (example: 2023-01234)
const STUDENT_ID_REGEX = /^\d{4}-\d{4,6}$/;

const sign = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const publicUser = (u) => ({
  id: u._id,
  studentId: u.studentId,
  name: u.name,
  program: u.program,
  yearLevel: u.yearLevel,
});

router.post('/register', async (req, res, next) => {
  try {
    const { studentId, name, password, program, yearLevel } = req.body;

    if (!studentId || !name || !password || !program || !yearLevel)
      return res.status(400).json({ message: 'All fields are required' });
    if (!STUDENT_ID_REGEX.test(studentId))
      return res.status(400).json({ message: 'Invalid Student ID format (e.g. 2023-01234)' });
    if (password.length < 8)
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    if (!['BSCS', 'BSIS'].includes(program))
      return res.status(400).json({ message: 'Program must be BSCS or BSIS' });

    if (await User.findOne({ studentId }))
      return res.status(409).json({ message: 'Student ID is already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ studentId, name, passwordHash, program, yearLevel: Number(yearLevel) });
    res.status(201).json({ token: sign(user), user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { studentId, password } = req.body;
    const user = await User.findOne({ studentId });
    if (!user || !(await bcrypt.compare(password || '', user.passwordHash)))
      return res.status(401).json({ message: 'Incorrect Student ID or password' });

    res.json({ token: sign(user), user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

router.get('/me', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
