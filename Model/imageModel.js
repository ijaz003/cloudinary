const mongoose = require('mongoose');

const imageSchema = mongoose.Schema({
  imageUrls: [String]
});

module.exports = mongoose.model("Images", imageSchema);
