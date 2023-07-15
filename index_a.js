const app = require("./models/server.js")
const mongodb = require("mongodb")
// const BooksDAO = require("./dao/booksDAO.js")
const BooksDAO = require("./models/dao/booksDAO.js")
const dotenv = require("dotenv")
dotenv.config()
const MongoClient = mongodb.MongoClient

// mongo_username="Aafil"
// mongo_password="Aafil321"
// uri=`mongodb+srv://${mongo_username}:${mongo_password}@cluster0.g7tgxqn.mongodb.net/`

const port = 3000     

MongoClient.connect(
  process.env.uri,
  {
    maxPoolSize: 50,
    wtimeoutMS: 2500,
    useNewUrlParser: true
  })
  .catch(err => {
    console.error(err.stack)
    process.exit(1)
  })
  .then(async client => {
    await BooksDAO.injectDB(client)
    app.listen(port, () => {
      console.log(`listening on port ${port}`)
    })
  })
