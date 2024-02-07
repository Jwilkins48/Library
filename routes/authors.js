import express from "express";
import Author from "../models/author.js";

const router = express.Router();

// Get all authors - /authors
router.get("/", (req, res) => {
  res.render("authors/authorIndex");
});

// New author - /authors/new
router.get("/new", (req, res) => {
  res.render("authors/newAuthor", { author: new Author() });
});

// Create new author
router.post("/", (req, res) => {
  const author = new Author({
    name: req.body.name,
  });

  author
    .save()
    .then((newAuthor) => {
      res.redirect("authors");
    })
    .catch((err) => {
      res.render("authors/newAuthor", {
        author: author,
        errMessage: "Error Creating Author...",
      });
    });
});

export default router;
