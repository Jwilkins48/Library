import Book from "./book.js";
import mongoose from "mongoose";

const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

// Runs function before deleting author
authorSchema.pre("deleteOne", async function (next) {
  try {
    const query = this.getFilter();
    const hasBook = await Book.exists({ author: query._id });

    if (hasBook) {
      next(new Error("This author still has books."));
    } else {
      next();
    }
  } catch (err) {
    next(err);
  }
});

export default mongoose.model("Author", authorSchema);
