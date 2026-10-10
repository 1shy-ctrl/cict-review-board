const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    courseCode: { type: String, required: true, uppercase: true, trim: true },
    program: { type: String, enum: ['BSCS', 'BSIS', 'BOTH'], required: true },
    yearLevel: { type: Number, min: 1, max: 4, required: true },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    fileType: { type: String, required: true }, // e.g. ".pdf"
    uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    votes: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        value: { type: Number, enum: [1, -1] },
        _id: false,
      },
    ],
    score: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resource', resourceSchema);
