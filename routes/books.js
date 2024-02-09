import fs from "fs";
import path from "path";
import multer from "multer";
import express, { query } from "express";
import Book from "../models/book.js";
import Author from "../models/author.js";
import { coverImageBasePath } from "../models/book.js";

const router = express.Router();
const uploadPath = path.join("public", coverImageBasePath);
const imageMimeTypes = ["image/jpeg", "image/png", "image/gif"];
const upload = multer({
  // where upload will be
  dest: uploadPath,
  fileFilter: (req, file, callback) => {
    callback(null, imageMimeTypes.includes(file.mimetype));
  },
});

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

// Create new book - upload single file named cover
router.post("/", upload.single("cover"), async (req, res) => {
  const fileName = req.file != null ? req.file.filename : null;
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    coverImageName: fileName,
    description: req.body.description,
  });

  try {
    const newBook = await book.save();
    res.redirect("books");
  } catch (error) {
    // Don't save book cover if error
    if (book.coverImageName != null) {
      removeBookCover(book.coverImageName);
    }
    renderNewPage(res, book, true);
  }
});

// Remove book cover when error
function removeBookCover(filename) {
  fs.unlink(path.join(uploadPath, filename), (err) => {
    if (err) console.error(err);
  });
}

async function renderNewPage(res, book, hasError = false) {
  try {
    const authors = await Author.find({});
    const params = {
      authors: authors,
      book: book,
    };
    if (hasError) params.errorMessage = "Error Creating Book";
    res.render("books/newBook", params);
  } catch (error) {
    res.redirect("/books");
  }
}

export default router;
