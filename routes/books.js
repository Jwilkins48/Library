import express from "express";
import Book from "../models/book.js";
import Author from "../models/author.js";

const router = express.Router();
const imageMimeTypes = ["image/jpeg", "image/png", "image/gif"];

// Get all books - /books
router.get("/", async (req, res) => {
  let query = Book.find();
  if (req.query.title != null && req.query.title != "") {
    query = query.regex("title", new RegExp(req.query.title, "i"));
  }

  // Place in order
  if (req.query.publishedBefore != null && req.query.publishedBefore != "") {
    query = query.lte("publishDate", req.query.publishedBefore);
  }
  if (req.query.publishedAfter != null && req.query.publishedAfter != "") {
    query = query.gte("publishDate", req.query.publishedAfter);
  }

  try {
    const books = await query.exec();
    res.render("books/bookIndex", {
      books: books,
      searchOptions: req.query,
    });
  } catch (error) {}
});

// New book - /books/new
router.get("/new", async (req, res) => {
  renderNewPage(res, new Book());
});

// Create new book - POST
router.post("/", async (req, res) => {
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    description: req.body.description,
  });
  saveCover(book, req.body.cover);

  try {
    const newBook = await book.save();
    res.redirect(`books/${newBook.id}`);
  } catch (error) {
    renderNewPage(res, book, true);
  }
});

// See book - /books/:id
router.get("/:id", async (req, res) => {
  try {
    // author is set to ID in book schema - populate adds info from author Schema
    const book = await Book.findById(req.params.id).populate("author").exec();
    res.render("books/showBook", { book: book });
  } catch {
    res.redirect("/");
  }
});

// Edit book - /books/:id/edit
router.get("/:id/edit", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    renderEditPage(res, book);
  } catch {
    res.redirect("/");
  }
});

// Update new book - PUT
router.put("/:id", async (req, res) => {
  let book;

  try {
    book = await Book.findById(req.params.id);
    book.title = req.body.title;
    book.author = req.body.author;
    book.publishDate = new Date(req.body.publishDate);
    book.pageCount = req.body.pageCount;
    book.description = req.body.description;
    if (req.body.cover != null && req.body.cover !== "") {
      saveCover(book, req.body.cover);
    }

    await book.save();
    res.redirect(`/books/${book.id}`);
  } catch {
    if (book != null) {
      renderEditPage(res, book, true);
    } else {
      redirect("/");
    }
  }
});

// Delete book - DELETE
router.delete("/:id", async (req, res) => {
  let book;
  try {
    book = await Book.findById(req.params.id);
    await Book.deleteOne({ _id: req.params.id });
    res.redirect("/books");
  } catch {
    if (book != null) {
      res.render("books/showBook", {
        book: book,
        errorMessage: "Could not remove book",
      });
    } else {
      res.redirect("/");
    }
  }
});

function saveCover(book, coveEncoded) {
  if (coveEncoded == null) return;
  const cover = JSON.parse(coveEncoded);
  if (cover != null && imageMimeTypes.includes(cover.type)) {
    book.coverImage = new Buffer.from(cover.data, "base64");
    book.coverImageType = cover.type;
  }
}

async function renderNewPage(res, book, hasError = false) {
  renderFormPage(res, book, "newBook", hasError);
}

async function renderEditPage(res, book, hasError = false) {
  renderFormPage(res, book, "editBook", hasError);
}

async function renderFormPage(res, book, form, hasError = false) {
  try {
    const authors = await Author.find({});
    const params = {
      authors: authors,
      book: book,
    };
    if (hasError) {
      if (form === "editBook") {
        params.errorMessage = "Error Updating Book";
      } else {
        params.errorMessage = "Error Creating Book";
      }
    }
    res.render(`books/${form}`, params);
  } catch {
    res.redirect("/books");
  }
}

export default router;
