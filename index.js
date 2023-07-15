const express = require("express");
const bodyParser = require("body-parser");
const mongodb = require("mongodb");
// const BooksDAO = require("./models/dao/booksDAO.js");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const path = require("path");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");

const Student = require("./models/student");
const Book = require("./models/book");

const app = express();
const port = process.env.PORT || 3000;
const MongoClient = mongodb.MongoClient;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

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

app.get('/managebooks', (req, res) => {
  res.render('manage_books')
})

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