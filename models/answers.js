let mongoose = require("mongoose");

let answerSchema = mongoose.Schema({
  body: {
    type: String,
    required: true
  },
  articleId: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  posted_at: {
    type: String,
    default: new Date().toDateString()
  },
  likes_count: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model("answers", answerSchema);
