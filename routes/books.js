import express from "express";
import Book from "../models/book.js";
import Author from "../models/author.js";

const router = express.Router();

// Get all books - /books
router.get("/", async (req, res) => {
  res.send("All books");
});

// New book - /books/new
router.get("/new", async (req, res) => {
  try {
    const authors = await Author.find({});
    const book = new Book();
    res.render("books/newBook", { authors: authors, book: book });
  } catch (error) {
    res.redirect("/books");
  }
});

// Create new book
router.post("/", async (req, res) => {
  res.send("Create book");
});

export default router;
