import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import publicationReviewRoutes from "./routes/publicationReviews.js";
import userRoutes from "./routes/users.js";
import userBookRoutes from "./routes/userBooks.js";
import userStatRoutes from "./routes/userStats.js";

const app = express();

// middleware
app.use(cors());
app.use(express.json({ limit: "64mb", extended: true })); // read json in the body of a request
app.use(express.urlencoded({ extended: true })); // extended: true to use qs library

// specify port
const PORT = process.env.PORT || 5000;
// connect to mongoDB ://username:password
const CONNECTION_URL = process.env.CONNECTION_URL;
mongoose
  .connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  // start server on PORT
  .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
  .catch((error) => console.log(error.message));

// routes
app.get("/", (req, res) => {
  res.send("Qualia library API");
});
app.use("/publicationReviews", publicationReviewRoutes);
app.use("/users", userRoutes);
app.use("/userBooks", userBookRoutes);
app.use("/userStats", userStatRoutes);
