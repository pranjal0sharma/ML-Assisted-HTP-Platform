const mongoose = require('mongoose');

const DrawingSchema = new mongoose.Schema({
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  childId: { type: String, required: true },
  childAge: { type: Number, required: true },
  childName: {
    type: String,
    required: [true, 'Child name is required'], // Make it required for new uploads
    trim: true
  },
  childClass: {
    type: String,
    required: [true, 'Child class is required'], // Make it required for new uploads
    trim: true
  },
  imageURL: { type: String, required: true },
  teacherNotes: { type: String },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Drawing', DrawingSchema);