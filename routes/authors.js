import express from "express";
import Author from "../models/author.js";

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

// Create new author
router.post("/", async (req, res) => {
  const author = new Author({
    name: req.body.name,
  });

  try {
    const newAuthor = await author.save();
    // res.redirect(`authors/${newAuthor.id}`)
    res.redirect("authors");
  } catch (error) {
    res.render("authors/newAuthor", {
      author: author,
      errorMessage: "Error Creating Author...",
    });
  }
});

// Show author
router.get("/:id", (req, res) => {
  res.send("Show author " + req.params.id);
});

// Edit author
router.get("/:id/edit", async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    res.render("authors/editAuthor", { author: author });
  } catch (error) {}
});

// Update author
router.put("/:id", (req, res) => {
  res.send("Update author " + req.params.id);
});

// Delete author
router.delete("/:id", (req, res) => {
  res.send("Delete author " + req.params.id);
});

export default router;
