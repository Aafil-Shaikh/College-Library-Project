const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express(); 

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
const { Schema } = mongoose;

//Cloud connection
mongoose.connect(process.env.MONGO_URL);


const studentsSchema = new mongoose.Schema({
    Student_Id:{
      type:Number,
      required:true,
    },
    Student_Name:{
        type:String,
        required:true,
      },
    Student_Email:{
        type: String,
        required: true,
        unique: true,
      },
    Student_Phone_number: {
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

const Student = mongoose.model("Student",studentsSchema);

app.get("/",function(req,res){

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
    const siD = req.body.sid;
    const sname = req.body.sname;
    const semail = req.body.semail;
    const sphone = req.body.sphone;
    async function check() 
    {
        const found= await Student.findOne({Student_Id:siD});
         if(!found){
            //Creates new student
            const s = new Student({
                Student_Id:siD,
                Student_Name:sname,
                Student_Email:semail,
                Student_Phone_number:sphone
            });
            s.save();
            messages="New Student with ID:"+siD+" was added to the DataBase!";
            res.render('Add',{message:messages});
         }
         else
        {
           var messages= "Student with ID:"+siD+" is already present.Please check the details entered.";
           res.render('Add',{message:messages});
        }
    }
    check();
});

app.post("/studentUpdate",function(req,res){
    const siD = req.body.sid;
    const sname = req.body.sname;
    const semail = req.body.semail;
    const sphone = req.body.sphone;
    async function check() 
    {
        const found= await Student.findOne({Student_Id:siD});
         if(found){
        //Updates the student details
            if((semail=="" || sphone=="") || (semail=="" && sphone=="")){
              let findEmail= found.Student_Email; 
              let findPhone= found.Student_Phone_number; 
              await Student.updateOne({Student_Id:siD},{$set:{Student_Name:sname,Student_Email:findEmail,Student_Phone_number:findPhone}});
              messages="Student with ID:"+siD+" was Updated successfully!";
              res.render('Update',{message:messages});
           }else{
              await Student.updateOne({Student_Id:siD},{$set:{Student_Name:sname,Student_Email:semail,Student_Phone_number:sphone}});
              messages="Student with ID:"+siD+" was Updated successfully!";
              res.render('Update',{message:messages});
           }
        }
         else
        {
           var messages= "Student with ID:"+siD+" is not present in the database.Please check the details entered.";
           res.render('Update',{message:messages});        
        }
    }
    check();
});

app.post("/studentDelete",function(req,res){
    const siD = req.body.sid;
    async function deleete(){
        const found= await Student.findOne({Student_Id:siD});
        if(found){
            await Student.deleteOne({Student_Id:siD});
            messages="Student with ID:"+siD+" was Deleted!";
            res.render('Deleete',{message:messages});

        }
        else{
            var messages= "Student with ID:"+siD+" is not present in the database.Please check the details entered.";
           res.render('Deleete',{message:messages});
        }
    }
    deleete();
})



app.listen(3000, function() {
    console.log("Server started on port 3000");
  });