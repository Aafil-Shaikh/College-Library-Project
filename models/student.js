const mongoose = require("mongoose");
const { Schema } = mongoose;

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  booksBorrowed: [
    {
      type: Schema.Types.ObjectId,
      ref: "Book",
    },
  ],
});

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;

// const studentSchema = new Schema({
//   id: Number,
//   name: String,
//   phone: Number,
//   email: String,
//   booksBorrowed: {
//     type: [
//       {
//         type: Number,
//         unique: true,
//       },
//     ],
//   },
// });
