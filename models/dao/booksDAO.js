const mongodb = require("mongodb")
const ObjectId = mongodb.ObjectId

let books

class BooksDAO {
  static async injectDB(conn) {
    if (books) {
      return
    }
    try {
      books = await conn.db("students").collection("books")
      // console.log("Database is connected")
    } catch (e) {
      console.error(`Unable to establish collection handles in userDAO: ${e}`)
    }
  }

  static async addBook(title, author, desc) {
    try {
      const bookDoc = {
        title: title,
        author: author,
        desc: desc,
      }
      // console.log("adding")
      return await books.insertOne(bookDoc)
    } catch (e) {
      console.error(`Unable to add book: ${e}`)
      return { error: e }
    }
  }

  static async updateBook(bookId, title, author, desc) {
    try {
      const updateResponse = await books.updateOne(
        { _id: new ObjectId(bookId) },          //added new keyword
        { $set: { title: title, author: author, desc: desc } }
      )
      // console.log("updating")
      return updateResponse
    } catch (e) {
      console.error(`Unable to update book: ${e}`)
      return { error: e }
    }
  }

  static async deleteBook(bookId) {

    try {
      const deleteResponse = await books.deleteOne({
        _id: new ObjectId(bookId),          //added new keyword
      })
      // console.log("deleting")
      return deleteResponse
    } catch (e) {
      console.error(`Unable to delete book: ${e}`)
      return { error: e }
    }
  }

  static async getBooksByTitle(title) {
    try {
      if(title === null || title == ""){
        // console.log("From DAO: Title:" + title)
        const cursor = await books.find()
        // console.log("getting all books")
        return cursor.toArray()
      }
      else{
        // console.log("2. From DAO: Title:" + title)
        const cursor = await books.find(
          {$or: [
              { title: { $regex: new RegExp(title, "i") } },
              { author: { $regex: new RegExp(title, "i") } }
            ]
          }
        )
        // console.log("getting books")
        const results = await cursor.toArray()

        results.sort((a, b) => {
          const titleA = a.title.length;
          const titleB = b.title.length;
          const authorA = a.author.length;
          const authorB = b.author.length;
        
          if (titleA !== titleB) {
            return titleA - titleB; // Sort by title length in ascending order
          } else {
            return authorA - authorB; // Sort by author length in ascending order if title length is the same
          }
        });
        return results
      }
    } catch (e) {
      console.error(`Unable to get books: ${e}`)
      return { error: e }
    }
  }

}
module.exports = BooksDAO;