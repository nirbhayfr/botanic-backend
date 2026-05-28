import express from "express";

import {
	createCategory,
	getCategories,
	getSingleCategory,
	updateCategory,
	deleteCategory,
} from "../controllers/Category.js";
import { authMiddleware, adminMiddleware } from "../middlewares/authController.js";

const router = express.Router();

router.post("/", authMiddleware, adminMiddleware, createCategory);
router.get("/", getCategories);
router.get("/:id", getSingleCategory);
router.put("/:id", authMiddleware, adminMiddleware, updateCategory);
router.delete("/:id", authMiddleware, adminMiddleware, deleteCategory);

export default router;
