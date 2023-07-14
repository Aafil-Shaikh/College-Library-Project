const express = require("express")
const BooksCtrl = require("./books.controller.js")

const router = express.Router()


router.route("/").get(BooksCtrl.apiGetBooks)
router.route("/:title").get(BooksCtrl.apiGetBooks)
router.route("/new").post(BooksCtrl.apiPostBook)
router.route("/:id")
    .put(BooksCtrl.apiUpdateBook)
    .delete(BooksCtrl.apiDeleteBook)

module.exports = router;