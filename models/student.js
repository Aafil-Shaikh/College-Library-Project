const mongoose = require("mongoose");
const { Schema } = mongoose;

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  id:{
    type:Number,
    required:true,
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

// studentSchema.pre('save', async function (next) {
//   try {
//     if (!this.id) {
//       // Generate a new id if it's not already assigned
//       const highestid = await this.constructor.findOne({}, 'id').sort('-id').exec();
//       this.id = highestid ? highestid.id + 1 : 1;
//     }
//     next();
//   } catch (err) {
//     next(err);
//   }
// });

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
