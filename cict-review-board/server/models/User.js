const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    program: { type: String, enum: ['BSCS', 'BSIS'], required: true },
    yearLevel: { type: Number, min: 1, max: 4, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
