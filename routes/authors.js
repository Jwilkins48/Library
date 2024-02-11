import express from "express";
import Author from "../models/author.js";
import Book from "../models/book.js";

const router = express.Router();

// Get all authors - /authors
router.get("/", async (req, res) => {
  let searchOptions = {};
  // Search only if name is not empty or null
  if (req.query.name != null && req.query.name !== "") {
    // Not case sensitive - checks for any letter in query
    searchOptions.name = new RegExp(req.query.name, "i");
  }

  try {
    const authors = await Author.find(searchOptions);
    res.render("authors/authorIndex", {
      authors: authors,
      searchOptions: req.query,
    });
  } catch (error) {
    res.redirect("/");
  }
});

// New author - /authors/new
router.get("/new", (req, res) => {
  res.render("authors/newAuthor", { author: new Author() });
});

// Create new author - POST
router.post("/", async (req, res) => {
  const author = new Author({
    name: req.body.name,
  });

  try {
    const newAuthor = await author.save();
    // Redirect to authors page
    res.redirect(`authors/${newAuthor.id}`);
  } catch (error) {
    res.render("authors/newAuthor", {
      author: author,
      errorMessage: "Error Creating Author...",
    });
  }
});

// Show author - /authors/:id
router.get("/:id", async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    const books = await Book.find({ author: author.id }).limit(6).exec();

    res.render("authors/showAuthor", { author: author, booksByAuthor: books });
  } catch {
    res.redirect("/");
  }
});

// Edit author - /authors/:id/edit
router.get("/:id/edit", async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    res.render("authors/editAuthor", { author: author });
  } catch (error) {
    res.redirect("/authors");
  }
});

// Update author - PUT
router.put("/:id", async (req, res) => {
  let author;
  try {
    author = await Author.findById(req.params.id);
    author.name = req.body.name;
    await author.save();
    res.redirect(`/authors/${author.id}`);
  } catch (error) {
    if (author == null) {
      res.redirect("/");
    } else {
      res.render("authors/editAuthor", {
        author: author,
        errorMessage: "Error Updating Author...",
      });
    }
  }
});

// Delete author - DELETE
router.delete("/:id", async (req, res) => {
  let author;
  try {
    author = await Author.findById(req.params.id);
    await Author.deleteOne({ _id: req.params.id });
    res.redirect("/authors");
  } catch {
    if (author == null) {
      res.redirect("/");
    } else {
      res.redirect(`/authors/${author.id}`);
    }
  }
});

export default router;
