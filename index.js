const express = require("express");
const bodyParser = require("body-parser");
const mongodb = require("mongodb");
// const BooksDAO = require("./dao/booksDAO.js");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const MongoClient = mongodb.MongoClient;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

MongoClient.connect(process.env.uri, {
  maxPoolSize: 50,
  wtimeoutMS: 2500,
  useNewUrlParser: true
})
  .catch(err => {
    console.error(err.stack);
    process.exit(1);
  })
  .then(async client => {
    // await BooksDAO.injectDB(client);

    app.get("/", (req, res) => {
      res.send("hello");
    });

    //add route here

    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  });
