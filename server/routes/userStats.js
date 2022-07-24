import express from "express";
import { getUserStats } from "../controllers/userStats.js";

const router = express.Router();

router.get("/:user_id", getUserStats);

export default router;
