const express = require("express");
const bodyParser = require("body-parser");
const mongodb = require("mongodb");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const path = require("path");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");

const Student = require("./models/student");
const Book = require("./models/book");

const BooksDAO = require("./models/dao/booksDAO.js")
const BooksCtrl = require("./models/api/books.controller")

// const booksRoute = require('./models/api/books.route.js');

const app = express();
const port = process.env.PORT || 3000;
const MongoClient = mongodb.MongoClient;

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

// app.use('/books', booksRoute);

// MongoClient.connect(process.env.uri, {
//   maxPoolSize: 50,
//   wtimeoutMS: 2500,
//   useNewUrlParser: true
// })
//   .catch(err => {
//     console.error(err.stack);
//     process.exit(1);
//   })
//   .then(async client => {
//     // await BooksDAO.injectDB(client);

//     app.get("/", (req, res) => {
//       res.send("hello");
//     });

//     //add route here

//     app.listen(port, () => {
//       console.log(`Server listening on port ${port}`);
//     });
//   });

mongoose.connect(process.env.MONGO_URL);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "database connection error!"));
db.once("open", () => {
  console.log("database connected");
});

app.get("/", (req, res) => {
  res.render("home");
});

// Book routes
// const booksRouter = require("./models/api/books.route");
// app.use("/books", booksRouter);

// // Get all books
app.get("/books", async (req, res) => {
  try {
    const books = await Book.find({});
    // console.log(books)
    res.render("manage_books", { books });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/v1/books', async (req, res) => {

  try {
    const bookData = req.body;
    const newBook = new Book(bookData);
    await newBook.save()
    res.json({ message: 'Book stored successfully' });
    // res.redirect('/books')
    
  } catch (error) {
    res.status(500).json({ message: 'Error storing book in the database' });
  }
});

app.delete('/api/v1/books/:id', async (req, res) => {

  try {
    // console.log(req.params.id)
    await Book.findByIdAndDelete(req.params.id)
    res.json({ message: 'Book deleted successfully' });
    
  } catch (err) {
    console.error(err);
      res.status(500).json({ message: 'Error deleting book from the database' });
  }
})

// Get a single book by ID
// app.get("/:id", async (req, res) => {
//   try {
//     const book = await Book.findById(req.params.id);
//     if (!book) {
//       res.status(404).json({ error: "Book not found" });
//       return;
//     }
//     res.json(book);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Create a new book
// app.post("/", async (req, res) => {
//   try {
//     const { title, author, desc } = req.body;
//     const book = new Book({ title, author, desc });
//     const savedBook = await book.save();
//     res.json(savedBook);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Update a book
// app.put("/:id", async (req, res) => {
//   try {
//     const { title, author, desc } = req.body;
//     const book = await Book.findByIdAndUpdate(
//       req.params.id,
//       { title, author, desc },
//       { new: true }
//     );
//     if (!book) {
//       res.status(404).json({ error: "Book not found" });
//       return;
//     }
//     res.json(book);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// Delete a book
// app.delete("/books/:id", async (req, res) => {
//   try {
//     const book = await Book.findByIdAndDelete(req.params.id);
//     if (!book) {
//       res.status(404).json({ error: "Book not found" });
//       return;
//     }
//     res.json({ message: "Book deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

app.get("/borrow", async (req, res) => {
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

app.get("/students",function(req,res){

  async function list(){
      const students =await Student.find();
      res.render('StudentList',{studentList:students});  
  }
  list();
});

app.get("/StudentList.ejs",function(req,res){
  async function list(){
      const students =await Student.find();
      res.render('StudentList',{studentList:students});  
  }
  list(); 
})

app.get("/Add.ejs",function(reque,respo){
  respo.render('Add',{message:""});
});

app.get("/Update.ejs",function(reque,respo){
  respo.render('Update',{message:""});
});

app.get("/Deleete.ejs",function(reque,respo){
  respo.render('Deleete',{message:""});
});

app.post("/studentAdd",function(req,res){
  const sid = req.body.sid;
  const sname = req.body.sname;
  const semail = req.body.semail;
  const sphone = req.body.sphone;
  async function check() 
  {
      const found= await Student.findOne({id:sid});
       if(!found){
          //Creates new student
          const s = new Student({
              id:sid,
              name:sname,
              email:semail,
              phone:sphone
          });
          s.save();
          messages="New Student with ID:"+sid+" was added to the DataBase!";
          res.render('Add',{message:messages});
       }
       else
      {
         var messages= "Student with ID:"+sid+" is already present.Please check the details entered.";
         res.render('Add',{message:messages});
      }
  }
  check();
});

app.post("/studentUpdate",function(req,res){

  const sid = req.body.sid;
  const sname = req.body.sname;
  const semail = req.body.semail;
  const sphone = req.body.sphone;
  async function check() 
  {
    const found= await Student.findOne({id:sid});
      if(found){
    //Updates the student details
        if((semail=="" || sphone=="") || (semail=="" && sphone=="")){
          let findEmail= found.email; 
          let findPhone= found.phone; 
          await Student.updateOne({id:sid},{$set:{name:sname,email:findEmail,phone:findPhone}});
          messages="Student with ID:"+sid+" was Updated successfully!";
          res.render('Update',{message:messages});
        }else{
          await Student.updateOne({id:sid},{$set:{name:sname,email:semail,phone:sphone}});
          messages="Student with ID:"+sid+" was Updated successfully!";
          res.render('Update',{message:messages});
        }
    }
      else
    {
        var messages= "Student with ID:"+sid+" is not present in the database.Please check the details entered.";
        res.render('Update',{message:messages});        
    }
  }
  check();
});

app.post("/studentDelete",function(req,res){
  const sid = req.body.sid;
  async function deleete(){
      const found= await Student.findOne({id:sid});
      if(found){
          await Student.deleteOne({id:sid});
          messages="Student with ID:"+sid+" was Deleted!";
          res.render('Deleete',{message:messages});

      }
      else{
          var messages= "Student with ID:"+sid+" is not present in the database.Please check the details entered.";
         res.render('Deleete',{message:messages});
      }
  }
  deleete();
})

app.listen(port, console.log(`server live on port ${port}`));