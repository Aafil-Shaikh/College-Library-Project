const mongoose = require("mongoose");
const { Schema } = mongoose;

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  desc: {
    type: String,
    required: true,
  },
  borrowedBy: {
    type: Schema.Types.ObjectId,
    ref: "Student",
    default: null,
  },
});

const Book = mongoose.model("Book", bookSchema);

module.exports = Book;
