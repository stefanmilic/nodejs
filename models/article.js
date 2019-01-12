let mongoose = require("mongoose");

// Article Schema
let articleSchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  author_id: {
    type: String,
    required: true
  },
  author_name: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  }
});
module.exports = mongoose.model("Article", articleSchema);