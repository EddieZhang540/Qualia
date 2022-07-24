import express from "express";
import { getUserBook, searchUserBooks, putUserBook, deleteUserBook } from "../controllers/userBooks.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/:user_id/books/:OL_key", getUserBook);
router.get("/:user_id/search", searchUserBooks);
router.put("/:user_id/books/:OL_key", auth, putUserBook);
router.delete("/:user_id/books/:OL_key", auth, deleteUserBook);

export default router;
