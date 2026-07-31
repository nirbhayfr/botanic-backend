import express from "express";

import {
	createPostCategory,
	getPostCategories,
	getSinglePostCategory,
	updatePostCategory,
	deletePostCategory,
} from "../controllers/PostCategory.js";
import { authMiddleware, adminMiddleware } from "../middlewares/authController.js";

const router = express.Router();

router.post("/", authMiddleware, adminMiddleware, createPostCategory);
router.get("/", getPostCategories);
router.get("/:id", getSinglePostCategory);
router.put("/:id", authMiddleware, adminMiddleware, updatePostCategory);
router.delete("/:id", authMiddleware, adminMiddleware, deletePostCategory);

export default router;
