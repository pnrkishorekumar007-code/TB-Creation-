const mongoose = require('mongoose');
const path = require('path');

const fileSchema = new mongoose.Schema(
  {
    path: { type: String, required: true, unique: true },
    contentType: { type: String, required: true },
    data: { type: Buffer, required: true },
  },
  { timestamps: true }
);

fileSchema.statics.saveUpload = async function (file, subfolder) {
  const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
  await this.create({
    path: `${subfolder}/${unique}`,
    contentType: file.mimetype,
    data: file.buffer,
  });
  return unique;
};

module.exports = mongoose.model('File', fileSchema);
