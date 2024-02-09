import expressEjsLayouts from "express-ejs-layouts";
import authorRouter from "./routes/authors.js";
import methodOverride from "method-override";
import indexRouter from "./routes/index.js";
import bookRouter from "./routes/books.js";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";
import path from "path";

dotenv.config();
mongoose.connect(process.env.DATABASE_URL);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const db = mongoose.connection;
const app = express();

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("layout", "layouts/layout");

app.use(expressEjsLayouts);
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(express.urlencoded({ limit: "10mb", extended: false }));

// Routes
app.use("/", indexRouter);
app.use("/authors", authorRouter);
app.use("/books", bookRouter);

db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to mongoose"));

app.listen(process.env.PORT || 3000, () =>
  console.log(`Started on port ${process.env.PORT}`)
);
