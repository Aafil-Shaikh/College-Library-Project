const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
require("dotenv").config();
const path = require("path");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const PORT = process.env.PORT || 3000;

const Student = require("./models/student");
const Book = require("./models/book");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: true,
    resave: true,
  })
);
app.use(flash());

mongoose.connect(process.env.MONGO_URL);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "database connection error!"));
db.once("open", () => {
  console.log("database connected");
});

app.get("/", async (req, res) => {
  const books = await Book.find({});
  res.render("index", { books });
});

app.get("/students", async (req, res) => {
  const students = await Student.find({});
  res.render("students_show", { students });
});

app.get("/students/:id", async (req, res) => {
  const { id } = req.params;
  const student = await Student.findById(id).populate("booksBorrowed");
  // res.send(student);
  res.render("student", { student, messages: req.flash("success") });
});

app.get("/students/:id/books", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate(
      "booksBorrowed"
    );

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    const availableBooks = await Book.find({ borrowedBy: null });

    res.render("borrow", { student, books: availableBooks });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/students/:studentId/books/:bookId/borrow", async (req, res) => {
  try {
    const { studentId, bookId } = req.params;
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    if (book.borrowedBy) {
      return res.status(400).json({ error: "Book is already borrowed" });
    }

    student.booksBorrowed.push(book);
    book.borrowedBy = student;

    await student.save();
    await book.save();

    // res.status(200).json({ message: "Book borrowed successfully" });

    req.flash("success", "Book borrowed successfully!");
    res.redirect(`/students/${studentId}`);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/students/:studentId/books/:bookId/return", async (req, res) => {
  try {
    const { studentId, bookId } = req.params;
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    if (
      !book.borrowedBy ||
      book.borrowedBy.toString() !== student._id.toString()
    ) {
      return res
        .status(400)
        .json({ error: "Book is not borrowed by the student" });
    }

    student.booksBorrowed = student.booksBorrowed.filter(
      (b) => b.toString() !== book._id.toString()
    );
    book.borrowedBy = null;

    await student.save();
    await book.save();

    // res.status(200).json({ message: "Book returned successfully" });
    req.flash("success", "Book returned successfully!");
    res.redirect(`/students/${studentId}`);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/books", async (req, res) => {
  const books = await Book.find({});
  res.render("books_show", { books });
});

app.get("/books/:id", async (req, res) => {
  const { id } = req.params;
  const book = await Book.findById(id).populate("borrowedBy");
  res.render("book", { book });
});

app.listen(PORT, console.log(`server live on port ${PORT}`));
