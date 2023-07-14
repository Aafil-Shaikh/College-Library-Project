const express = require("express")
const cors = require("cors")
const books = require("./api/books.route.js")


const app = express()
app.use(cors())

app.use(express.json())

app.use("/api/v1/books", books)
app.use("*", (req, res) => 
res.status(404).json({error: "not found"}))

module.exports = app;
