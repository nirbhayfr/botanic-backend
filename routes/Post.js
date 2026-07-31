import express from "express";

import {
	createPost,
	getPosts,
	getSinglePost,
	getPostBySlug,
	updatePost,
	deletePost,
} from "../controllers/Post.js";
import { authMiddleware, adminMiddleware } from "../middlewares/authController.js";

const router = express.Router();

router.post("/", authMiddleware, adminMiddleware, createPost);

router.get("/", getPosts);

router.get("/slug/:slug", getPostBySlug);

router.get("/:id", getSinglePost);

router.put("/:id", authMiddleware, adminMiddleware, updatePost);

router.delete("/:id", authMiddleware, adminMiddleware, deletePost);

export default router;
