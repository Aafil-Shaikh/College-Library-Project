const BooksDAO = require("../dao/booksDAO.js")

class BooksController {
  static async apiPostBook(req, res, next) {
    try {
      const title = req.body.title
      const author = req.body.author
      const desc = req.body.desc
      // console.log('title:', title)
      const bookResponse = await BooksDAO.addBook(
        title,
        author,
        desc
      )
      res.json({ status: "success" })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  }
  //Editing a book
  static async apiUpdateBook(req, res, next) {
    try {
      const bookId = req.params.id
      const title = req.body.title
      const author = req.body.author
      const desc = req.body.desc
      // console.log("id is: "+bookId)
      const bookResponse = await BooksDAO.updateBook(
        bookId,
        title,
        author,
        desc
      )

      var { error } = bookResponse
      if (error) {
        res.status(400).json({ error })
      }

      if (bookResponse.modifiedCount === 0) {
        throw new Error(
          "unable to update book",
        )
      }

      res.json({ status: "success" })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  }
  //deleting a book
  static async apiDeleteBook(req, res, next) {
    try {
      const bookId = req.params.id
      // console.log("id is: "+bookId)
      const bookResponse = await BooksDAO.deleteBook(bookId)
      res.json({ status: "success" })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  }
  //display books after searching
  static async apiGetBooks(req, res, next) {
    try {
      let title = req.params.title || null
      // console.log(typeof title);
      // console.log("Book title is: "+ title)
      let books = await BooksDAO.getBooksByTitle(title)
      if (!books) {
        res.status(404).json({ error: "Not found" })
        return
      }
      res.json(books)
    } catch (e) {
      console.log(`api, ${e}`)
      res.status(500).json({ error: e })
    }
  }
}
module.exports = BooksController;